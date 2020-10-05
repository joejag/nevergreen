import React from 'react'
import {GeneralSettings} from '../../../src/client/settings/GeneralSettings'
import {render} from '../testHelpers'
import userEvent from '@testing-library/user-event'
import {getClickToShowMenu, getToggleVersionCheck, SETTINGS_ROOT} from '../../../src/client/settings/SettingsReducer'

it('should set the click to show menu setting', () => {
  const state = {
    [SETTINGS_ROOT]: {
      clickToShowMenu: false
    }
  }

  const {store, getByLabelText} = render(<GeneralSettings/>, state)
  userEvent.click(getByLabelText('Click to show menu'))

  expect(getClickToShowMenu(store.getState())).toBeTruthy()
})

it('should set the state to check for new version', () => {
  const state = {
    [SETTINGS_ROOT]: {
      enableNewVersionCheck: false
    }
  }

  const {store, getByLabelText} = render(<GeneralSettings/>, state)
  userEvent.click(getByLabelText('Check for updates'))

  expect(getToggleVersionCheck(store.getState())).toBeTruthy()
})
