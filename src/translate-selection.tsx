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

const attemptSelection = (): Promise<string> => getSelectedText().then((text) => text.trim())

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * first capture at module load — the command entry evaluates right at launch,
 * before first render, while the frontmost app's selection is still intact;
 * getSelectedText may resolve '' (not reject) when nothing is selected
 */
const selectionFirstAttempt: Promise<string> = attemptSelection()

/**
 * keep retrying on rejection: Chromium browsers build their accessibility
 * tree lazily and only on-demand — Raycast's query is what triggers the
 * build, but on heavy pages the build outlasts Raycast's own ~600ms wait,
 * so the first getSelectedText rejects even though text is selected;
 * retries land once the tree is up (measured: attempt 2 at ~900ms on a
 * 20k-node page). External wake-ups don't work on modern Chrome
 * (AXManualAccessibility is Electron-only, AXEnhancedUserInterface is
 * NotImplemented), so retrying the native call is the only reliable path
 */
const selectionRetried: Promise<string> = (async () => {
  const deadline = Date.now() + 5_000
  let attempt = selectionFirstAttempt
  while (true) {
    try {
      return await attempt
    } catch {
      if (Date.now() > deadline) return ''
      await delay(250)
      attempt = attemptSelection()
    }
  }
})()

/**
 * a clipboard holding a file/image yields only a placeholder description
 * as text (e.g. "Image (1207x353)") — not translatable, skip it
 */
const readClipboardText = (): Promise<string> =>
  Clipboard.read()
    .then(({ text, file }) => (file ? '' : text?.trim() ?? ''))
    .catch(() => '')

/**
 * fast initial text, priority: selection (first attempt) > clipboard > empty;
 * don't await the selection retries here — while they run, the input gets the
 * clipboard fallback immediately, and upgrades once a retry lands (see below)
 */
const readInitialText = (): Promise<string> =>
  selectionFirstAttempt.then(
    (selected) => selected || readClipboardText(),
    () => readClipboardText(),
  )

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
    // upgrade to the real selection once a retry lands;
    // TranslateView only applies it while the user hasn't typed
    selectionRetried.then((selected) => {
      if (selected) setSelected(selected)
    })
  }, [])

  return <TranslateView selected={selected} translator={translator} />
})

export default ViewWithSection
