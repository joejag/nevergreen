import React, {ChangeEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {sortBy} from 'lodash'
import {AvailableProject} from './AvailableProject'
import {Messages, MessagesType} from '../../common/Messages'
import {Input} from '../../common/forms/Input'
import {Shortcut} from '../../common/Shortcut'
import {Refresh} from './Refresh'
import {isBlank, notEmpty} from '../../common/Utils'
import {VisuallyHidden} from '../../common/VisuallyHidden'
import styles from './available-projects.scss'
import {SecondaryButton} from '../../common/forms/Button'
import {iCheckboxChecked, iCheckboxUnchecked} from '../../common/fonts/Icons'
import {Project, wrapProjectErrors, wrapProjects} from '../../domain/Project'
import {getProjectsForTray} from '../ProjectsReducer'
import {getSelectedProjectsForTray} from '../SelectedReducer'
import {useDispatch, useSelector} from 'react-redux'
import {projectSelected, projectsFetched} from '../TrackingActionCreators'
import {fetchAll, ProjectsResponse} from '../../gateways/ProjectsGateway'
import {send} from '../../gateways/Gateway'
import {Loading} from '../../common/Loading'
import {Tray} from '../../domain/Tray'
import {Request} from 'superagent'

interface AvailableProjectsProps {
  readonly tray: Tray;
  readonly index: number;
  readonly requiresRefresh: boolean;
  readonly setRequiresRefresh: (required: boolean) => void;
}

export function AvailableProjects({index, tray, requiresRefresh, setRequiresRefresh}: AvailableProjectsProps) {
  const dispatch = useDispatch()
  const projects = useSelector(getProjectsForTray(tray.trayId))
  const selected = useSelector(getSelectedProjectsForTray(tray.trayId))

  const [filter, setFilter] = useState()
  const [errors, setErrors] = useState<ReadonlyArray<string>>([])
  const [loaded, setLoaded] = useState(true)
  const pendingRequest = useRef<Request>()
  const [filterErrors, setFilterErrors] = useState<ReadonlyArray<string>>([])
  const rootNode = useRef<HTMLDivElement>(null)

  const refreshTray = useCallback(async () => {
    setLoaded(false)
    setErrors([])
    pendingRequest.current = fetchAll([tray], projects)
    try {
      const apiProjects = await send<ProjectsResponse>(pendingRequest.current)
      const fetchedProjects = wrapProjects(apiProjects)
      const projectErrors = wrapProjectErrors(apiProjects)

      if (projectErrors.length === 0) {
        dispatch(projectsFetched(tray.trayId, fetchedProjects, tray.includeNew))
      } else {
        const errorMessages = projectErrors.map((projectError) => projectError.errorMessage)
        setErrors(errorMessages)
      }
    } catch (error) {
      console.log(error)
      setErrors([error.message])
    }
    // eslint-disable-next-line require-atomic-updates
    pendingRequest.current = undefined
    setLoaded(true)
  }, [dispatch, projects, tray])

  useEffect(() => {
    if (requiresRefresh) {
      refreshTray()
      setRequiresRefresh(false)
    }
  }, [requiresRefresh, setRequiresRefresh, refreshTray])

  useEffect(() => {
    return () => {
      if (pendingRequest.current) {
        pendingRequest.current.abort()
      }
    }
  }, [])

  const includeAll = (projects: ReadonlyArray<Project>) => () => {
    projects
      .filter((project) => !project.removed)
      .forEach((project) => dispatch(projectSelected(tray.trayId, project.projectId, true)))
  }

  const excludeAll = (projects: ReadonlyArray<Project>) => () => {
    projects.forEach((project) => dispatch(projectSelected(tray.trayId, project.projectId, false)))
  }

  const updateFilter = (evt: ChangeEvent<HTMLInputElement>) => {
    if (isBlank(evt.target.value)) {
      setFilter(null)
      setFilterErrors([])
    } else {
      try {
        const regEx = new RegExp(evt.target.value)
        setFilter(regEx)
        setFilterErrors([])
      } catch (e) {
        setFilterErrors([`Project filter not applied, ${e.message}`])
      }
    }
  }

  const scrollToTop = () => {
    if (rootNode.current) {
      rootNode.current.scrollIntoView()
    }
  }

  const filteredProjects = useMemo(() => {
    if (filter) {
      return projects.filter((project) => `${project.name} ${project.stage || ''}`.match(filter))
    }
    return projects
  }, [projects, filter])

  const hasProjects = notEmpty(projects)
  const hasProjectsFiltered = notEmpty(filteredProjects)
  const hasErrors = notEmpty(errors)

  const controls = (
    <div className={styles.controls}>
      <fieldset className={styles.toggles}>
        <legend className={styles.legend}>Available projects</legend>
        <SecondaryButton className={styles.includeAll}
                         onClick={includeAll(filteredProjects)}
                         data-locator='include-all'
                         icon={iCheckboxChecked}>
          include all
          <Shortcut hotkeys={[`+ ${index}`, `= ${index}`]}/>
        </SecondaryButton>
        <SecondaryButton className={styles.excludeAll}
                         onClick={excludeAll(filteredProjects)}
                         data-locator='exclude-all'
                         icon={iCheckboxUnchecked}>
          exclude all
          <Shortcut hotkeys={[`- ${index}`]}/>
        </SecondaryButton>
        <div className={styles.projectFilter}>
          <Input className={styles.projectFilterInput}
                 onChange={updateFilter}
                 placeholder='regular expression'>
            filter
          </Input>
        </div>
      </fieldset>
      <Messages type={MessagesType.ERROR}
                messages={filterErrors}/>
    </div>
  )

  const buildItems = (
    <ol className={styles.buildItems}
        aria-live='polite'
        aria-relevant='additions'
        data-locator='available-projects-list'>
      {
        sortBy(filteredProjects, ['name', 'stage']).map((project) => {
          const isSelected = selected.includes(project.projectId)

          return <AvailableProject key={project.projectId}
                                   {...project}
                                   selected={isSelected}
                                   selectProject={(select) => projectSelected(tray.trayId, project.projectId, select)}/>
        })
      }
    </ol>
  )

  const noProjectsWarning = (
    <Messages type={MessagesType.WARNING}
              messages={['No projects fetched, please refresh']}
              data-locator='no-projects-warning'/>
  )

  const noProjectsMatchFilterWarning = (
    <Messages type={MessagesType.WARNING}
              messages={['No matching projects, please update your filter']}
              data-locator='filter-warning'/>
  )

  const backToTop = (
    <SecondaryButton className={styles.backToTop}
                     onClick={scrollToTop}>
      back to top
    </SecondaryButton>
  )

  return (
    <section className={styles.availableProjects}
             data-locator='available-projects'
             ref={rootNode}>
      <VisuallyHidden><h3>Available projects</h3></VisuallyHidden>
      <Loading loaded={loaded}>
        <Refresh index={index}
                 timestamp={tray.timestamp}
                 refreshTray={refreshTray}/>
        <Messages type={MessagesType.ERROR}
                  messages={errors}
                  data-locator='errors'/>

        {!hasErrors && hasProjects && controls}
        {!hasErrors && hasProjectsFiltered && buildItems}
        {!hasErrors && !hasProjects && noProjectsWarning}
        {!hasErrors && hasProjects && !hasProjectsFiltered && noProjectsMatchFilterWarning}
        {!hasErrors && hasProjectsFiltered && backToTop}
      </Loading>
    </section>
  )
}
