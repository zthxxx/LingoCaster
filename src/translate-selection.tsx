import { memo, useEffect, useMemo, useState } from 'react'
import { getSelectedText, Clipboard, getPreferenceValues } from '@raycast/api'
import { type AdapterPlatform } from './adapters'
import { Translator, createHistoryManager } from './workflow'
import { TranslateView } from './components'

interface Preferences {
  APP_KEY: string
  APP_SECRET: string
  APP_PLATFORM: AdapterPlatform
}

/**
 * capture at module load — the command entry evaluates right at launch,
 * before first render, while the frontmost app's selection is still intact;
 * getSelectedText may resolve '' (not reject) when nothing is selected
 */
const selectionAtLaunch: Promise<string> = getSelectedText()
  .then((text) => text.trim())
  .catch(() => '')

/**
 * initial text priority: selection > clipboard > empty
 */
const readInitialText = async (): Promise<string> => {
  const selected = await selectionAtLaunch
  if (selected) return selected

  return await Clipboard.readText()
    .then((text) => text?.trim() ?? '')
    .catch(() => '')
}

export const ViewWithSection = memo(() => {
  const [selected, setSelected] = useState<string | undefined>(undefined)

  const { APP_KEY, APP_SECRET, APP_PLATFORM } = useMemo(() => getPreferenceValues<Preferences>(), [])

  const translator = useMemo(
    () =>
      new Translator({
        key: APP_KEY,
        secret: APP_SECRET,
        platform: APP_PLATFORM,
        historyManager: createHistoryManager(),
      }),
    [],
  )

  useEffect(() => {
    readInitialText().then(setSelected)
  }, [])

  return <TranslateView selected={selected} translator={translator} />
})

export default ViewWithSection
