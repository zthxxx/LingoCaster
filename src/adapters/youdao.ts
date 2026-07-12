import {
  sha256,
  detectLanguage,
  Language,
} from '../utils'
import type { Adapter, Result } from './adapter'
import {
  type YoudaoAPIData,
  parseError,
  parseTranslation,
} from './youdao-parse'

export type { YoudaoAPIData } from './youdao-parse'

export class Youdao implements Adapter {
  key: string

  secret: string

  word: string = ''

  isChinese: boolean = false

  constructor(key: string, secret: string) {
    this.key = key
    this.secret = secret
  }

  url(input: string): string {
    this.word = input
    const from = detectLanguage(input)
    this.isChinese = from === Language.ZH
    const to = this.isChinese ? Language.EN : Language.ZH
    const timestamp = Math.round(new Date().getTime() / 1000).toString()
    const salt = Math.floor(Math.random() * 10000).toString()

    const truncateInput = (text: string): string => {
      const len = text.length
      return len <= 20
        ? text
        : `${text.substring(0, 10)}${len}${text.substring(len - 10, len)}`
    }

    const sign = sha256(`${this.key}${truncateInput(input)}${salt}${timestamp}${this.secret}`)

    // https://ai.youdao.com/DOCSIRMA/html/自然语言翻译/API文档/文本翻译服务/文本翻译服务-API文档.html
    const params = new URLSearchParams({
      q: input,
      from,
      to,
      appKey: this.key,
      salt,
      sign,
      signType: 'v3',
      curtime: timestamp,
    })


    return `https://openapi.youdao.com/api?${params.toString()}`
  }

  parse(data: YoudaoAPIData): Result[] {
    const ctx = { word: this.word, isChinese: this.isChinese }

    if (data.errorCode !== '0') {
      return parseError(data.errorCode, ctx)
    }

    // Only the headline translation comes from the (signed) text API; word-level
    // dict detail (basic/web) is owned by the parallel YoudaoDict adapter, so we
    // intentionally do not parse basic/web here — avoids duplicate rows if the
    // openapi endpoint ever returns them again.
    return parseTranslation(data.translation, ctx)
  }
}
