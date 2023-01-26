
/**
 * 支持语言
 * https://ai.youdao.com/DOCSIRMA/html/自然语言翻译/API文档/文本翻译服务/文本翻译服务-API文档.html#section-9
 */
export enum Language {
  'ZH' = 'zh-CHS',
  'EN' = 'en',
  'JA' = 'ja',
  'Auto' = 'auto',
}


export const hasChinese = (text: string): boolean => {
  return /^[\u4E00-\u9FA5]+$/.test(text)
}

export const onlyEnglish = (text: string): boolean => {
  return /^[a-zA-Z .?,]+$/.test(text)
}

export const hasJapanese = (text: string): boolean => {
  return /^[\u3040-\u30FF]+$/.test(text)
}

export const detectLanguage = (text: string): Language => {
  const tests: [(text: string) => boolean, Language][] = [
    [onlyEnglish, Language.EN],
    [hasJapanese, Language.JA],
    [hasChinese, Language.ZH],
    [() => true, Language.Auto],
  ]

  const language = tests
    .find(([test]) => test(text))
    ?.[1]
    ?? Language.Auto

  return language
}
