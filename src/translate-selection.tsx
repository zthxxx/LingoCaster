import {
  memo,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  getSelectedText,
  Clipboard,
  getPreferenceValues,
} from '@raycast/api'
import {
  type AdapterPlatform,
} from './adapters'
import {
  Translator,
} from './workflow'
import { TranslateView } from './components'


interface Preferences {
  APP_KEY: string;
  APP_SECRET: string;
  APP_PLATFORM: AdapterPlatform;
}

export const ViewWithSection = memo(() => {
  const [selected, setSelected] = useState<string | undefined>(undefined)

  const {
    APP_KEY,
    APP_SECRET,
    APP_PLATFORM,
  } = useMemo(() => getPreferenceValues<Preferences>(), [])

  const translator = useMemo(() => new Translator({
    key: APP_KEY,
    secret: APP_SECRET,
    platform: APP_PLATFORM,
  }), [])


  useEffect(() => {
    getSelectedText()
      .then(text => setSelected(text.trim()))
      .catch(async () => {
        const text = await Clipboard.readText()
        setSelected(text?.trim() ?? '')
      })
  }, [])

  return (
    <TranslateView
      selected={selected}
      translator={translator}
    />
  )
})

export default ViewWithSection
