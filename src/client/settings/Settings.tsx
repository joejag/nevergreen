import React, {ReactElement} from 'react'
import {GeneralSettings} from './GeneralSettings'
import {DisplaySettings} from './DisplaySettings'
import {Title} from '../common/Title'
import {NotificationSettings} from './NotificationSettings'

export function Settings(): ReactElement {
  return (
    <>
      <Title>Settings</Title>
      <GeneralSettings/>
      <DisplaySettings/>
      <NotificationSettings/>
    </>
  )
}
