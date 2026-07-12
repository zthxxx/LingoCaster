import { execa } from 'execa'

export const speakSay = (text: string) => {
  // pass text as an argument (no shell) so quotes / backticks / `$()` in the
  // translated text can never be interpreted by a shell
  return execa('say', ['-v', 'Samantha', text]).catch((error) => {
    console.error(`[speaker error] ${error.message}`)
  })
}
