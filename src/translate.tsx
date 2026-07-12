import {
  memo,
  useMemo,
} from 'react'
import {
  getPreferenceValues,
} from '@raycast/api'
import {
  type AdapterPlatform,
} from './adapters'
import {
  Translator,
  createHistoryManager,
} from './workflow'
import { TranslateView } from './components'

interface Preferences {
  APP_KEY: string;
  APP_SECRET: string;
  APP_PLATFORM: AdapterPlatform;
}

export const View = memo(() => {
  const {
    APP_KEY,
    APP_SECRET,
    APP_PLATFORM,
  } = useMemo(() => getPreferenceValues<Preferences>(), [])

  const translator = useMemo(() => new Translator({
    key: APP_KEY,
    secret: APP_SECRET,
    platform: APP_PLATFORM,
    historyManager: createHistoryManager(),
  }), [])

  return (
    <TranslateView
      translator={translator}
    />
  )
})


export default View
