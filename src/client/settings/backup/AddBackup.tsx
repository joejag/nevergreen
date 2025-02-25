import React, {ReactElement, useState} from 'react'
import cn from 'classnames'
import {DropDown} from '../../common/forms/DropDown'
import {useDispatch} from 'react-redux'
import {isBlank} from '../../common/Utils'
import {DEFAULT_GITHUB_URL, DEFAULT_GITLAB_URL, RemoteLocationOptions} from './RemoteLocationOptions'
import {addBackupCustomServer, addBackupGitHubLab} from './BackupActionCreators'
import {Input} from '../../common/forms/Input'
import {Password} from '../../common/forms/Password'
import {send} from '../../gateways/Gateway'
import {encrypt} from '../../gateways/SecurityGateway'
import styles from './add-backup.scss'
import {isValidHttpUrl} from '../../domain/Url'
import {BackupLogo} from './logo/BackupLogo'
import {firstError, FormErrors} from '../../common/forms/Validation'
import {Form} from '../../common/forms/Form'
import {Title} from '../../common/Title'
import {useHistory} from 'react-router-dom'
import {ROUTE_SETTINGS} from '../../Routes'

type Fields = 'url' | 'accessToken'

export function AddBackup(): ReactElement {
  const history = useHistory()
  const dispatch = useDispatch()

  const [where, setWhere] = useState(RemoteLocationOptions.Custom)
  const [url, setUrl] = useState('')
  const [id, setId] = useState('')
  const [description, setDescription] = useState('Nevergreen configuration backup')
  const [accessToken, setAccessToken] = useState('')

  const onValidate = () => {
    const validationErrors: FormErrors<Fields> = []

    if (isBlank(url)) {
      validationErrors.push({field: 'url', message: 'Please enter the URL'})
    } else if (!isValidHttpUrl(url)) {
      validationErrors.push({field: 'url', message: 'Only http and https URLs are supported'})
    }

    if (where === RemoteLocationOptions.GitLab || where === RemoteLocationOptions.GitHub) {
      if (isBlank(accessToken)) {
        validationErrors.push({field: 'accessToken', message: 'Please enter an access token'})
      }
    }

    return validationErrors
  }

  const onSuccess = async () => {
    if (where === RemoteLocationOptions.GitLab || where === RemoteLocationOptions.GitHub) {
      const encryptedAccessToken = await send(encrypt(accessToken))
      dispatch(addBackupGitHubLab(where, id, url, description, encryptedAccessToken))
    } else {
      dispatch(addBackupCustomServer(url))
      history.push(`${ROUTE_SETTINGS}#backup`)
    }
  }

  const updateWhere = (updatedWhere: RemoteLocationOptions) => {
    if (updatedWhere === RemoteLocationOptions.Custom) {
      setUrl('')
    } else if (updatedWhere === RemoteLocationOptions.GitHub) {
      setUrl(DEFAULT_GITHUB_URL)
    } else if (updatedWhere === RemoteLocationOptions.GitLab) {
      setUrl(DEFAULT_GITLAB_URL)
    }
    setWhere(updatedWhere)
  }

  const isCustomServer = where === RemoteLocationOptions.Custom

  return (
    <div className={styles.page}>
      <Title show>Add backup</Title>

      <Form onValidate={onValidate}
            onSuccess={onSuccess}
            submitButtonText='Add location'>
        {(submitting, validationErrors, clearValidationErrors) => {
          return (
            <>
              <div className={styles.whereContainer}>
                <DropDown className={styles.where}
                          value={where}
                          options={[
                            {value: RemoteLocationOptions.Custom, display: 'Custom server'},
                            {value: RemoteLocationOptions.GitHub, display: 'GitHub gist'},
                            {value: RemoteLocationOptions.GitLab, display: 'GitLab snippet'}
                          ]}
                          onChange={({target}) => {
                            updateWhere(target.value as RemoteLocationOptions)
                            clearValidationErrors()
                          }}
                          disabled={submitting}>
                  <span className={styles.label}>Where</span>
                </DropDown>
                <BackupLogo where={where}/>
              </div>
              <Input value={url}
                     onChange={({target}) => {
                       clearValidationErrors('url')
                       setUrl(target.value)
                     }}
                     autoComplete='url'
                     error={firstError<Fields>('url', validationErrors)}
                     disabled={submitting}>
                <span className={styles.label}>URL</span>
              </Input>
              <Input className={cn(styles.id, {[styles.gitHubLabOnly]: isCustomServer})}
                     value={id}
                     onChange={({target}) => {
                       clearValidationErrors()
                       setId(target.value)
                     }}
                     disabled={submitting || isCustomServer}
                     aria-hidden={isCustomServer}>
                <span className={styles.label}>ID</span>
              </Input>
              <Password className={cn({[styles.gitHubLabOnly]: isCustomServer})}
                        value={accessToken}
                        onChange={({target}) => {
                          clearValidationErrors('accessToken')
                          setAccessToken(target.value)
                        }}
                        error={firstError<Fields>('accessToken', validationErrors)}
                        disabled={submitting || isCustomServer}
                        aria-hidden={isCustomServer}>
                <span className={styles.label}>Access token</span>
              </Password>
              <Input className={cn({[styles.gitHubLabOnly]: isCustomServer})}
                     value={description}
                     onChange={({target}) => {
                       clearValidationErrors()
                       setDescription(target.value)
                     }}
                     maxLength={256}
                     disabled={submitting || isCustomServer}
                     aria-hidden={isCustomServer}>
                <span className={styles.label}>Description</span>
              </Input>
            </>
          )
        }}
      </Form>
    </div>
  )
}
