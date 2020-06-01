import {Migrate} from './index'
import {get, has, set} from 'lodash'
import {MaxProjectsToShow, SETTINGS_ROOT} from '../../settings/SettingsReducer'

export const id = '008_UpdateMaxProjectsToShow'

export const migrate: Migrate = (data) => {
  if (has(data, [SETTINGS_ROOT, 'maxProjectsToShow'])) {
    const oldValue = get(data, [SETTINGS_ROOT, 'maxProjectsToShow']) as number
    let newValue
    if (oldValue < 12) {
      newValue = MaxProjectsToShow.focused
    } else if (oldValue === 12) {
      newValue = MaxProjectsToShow.balanced
    } else if (oldValue > 12 && oldValue < Number.MAX_SAFE_INTEGER) {
      newValue = MaxProjectsToShow.intense
    } else {
      newValue = MaxProjectsToShow.everything
    }
    set(data, [SETTINGS_ROOT, 'maxProjectsToShow'], newValue)
  }
}