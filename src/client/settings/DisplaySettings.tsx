import React, {ReactElement} from 'react'
import {Container} from '../common/Container'
import {Checkbox} from '../common/forms/Checkbox'
import {DropDown} from '../common/forms/DropDown'
import styles from './display-settings.scss'
import {DisplayPrognosisSelection} from './DisplayPrognosisSelection'
import {useDispatch, useSelector} from 'react-redux'
import {
  setMaxProjectsToShow,
  setShowBuildLabel,
  setShowBuildTime,
  setShowTrayName,
  setSort,
  VALID_PROJECTS_TO_SHOW
} from './SettingsActionCreators'
import {getMaxProjectsToShow, getShowBuildLabel, getShowBuildTime, getShowTrayName, getSort} from './SettingsReducer'
import {SortBy} from '../gateways/ProjectsGateway'
import {Link} from 'react-router-dom'

export function DisplaySettings(): ReactElement {
  const dispatch = useDispatch()
  const showTrayName = useSelector(getShowTrayName)
  const showBuildTime = useSelector(getShowBuildTime)
  const showBuildLabel = useSelector(getShowBuildLabel)
  const maxProjectsToShow = useSelector(getMaxProjectsToShow)
  const sort = useSelector(getSort)

  const projectsToShowOptions = VALID_PROJECTS_TO_SHOW.map((value) => {
    const display = value === Number.MAX_SAFE_INTEGER
      ? 'all projects (not recommended)'
      : `${value.toString()} projects`
    return {value: value.toString(), display}
  })

  const sortOptions = Object.values(SortBy).map((value) => {
    return {value, display: value}
  })

  return (
    <Container title='Display' className={styles.container}>
      <Checkbox className={styles.showTrayName}
                checked={showTrayName}
                onToggle={(newValue) => dispatch(setShowTrayName(newValue))}
                data-locator='show-tray-names'>
        Show feed identifier
      </Checkbox>
      <Checkbox className={styles.checkbox}
                checked={showBuildTime}
                onToggle={(newValue) => dispatch(setShowBuildTime(newValue))}
                data-locator='show-build-times'>
        Show build time
      </Checkbox>
      <Checkbox className={styles.checkbox}
                checked={showBuildLabel}
                onToggle={(newValue) => dispatch(setShowBuildLabel(newValue))}
                data-locator='show-build-labels'>
        Show build label
      </Checkbox>

      <DisplayPrognosisSelection/>

      <DropDown className={styles.dropDown}
                options={projectsToShowOptions}
                value={maxProjectsToShow}
                onChange={({target}) => dispatch(setMaxProjectsToShow(target.value))}
                data-locator='max-projects-to-show'>
        <span className={styles.dropDownLabel}>Max number of projects to show</span>
      </DropDown>

      <DropDown className={styles.dropDown}
                options={sortOptions}
                value={sort}
                onChange={({target}) => dispatch(setSort(target.value as SortBy))}
                data-locator='sort-projects-by'>
        <span className={styles.dropDownLabel}>Sort projects by</span>
      </DropDown>

      <Link to='/preview'
            className={styles.preview}
            data-locator='display-preview'>
        Preview display
      </Link>
    </Container>
  )
}
