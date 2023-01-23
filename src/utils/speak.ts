import { execa } from 'execa'


export const speakSay = (text: string) => {
  return execa(`say -v Samantha "${text}"`, { shell: true })
    .catch(error => {
      console.error(`[speaker error] ${error.message}`)
    })
}
