import { nanoid } from '../utils'
import type { Result } from './adapter'

export const youdaoErrMessages: Record<string, string> = {
  101: '缺少必填的参数',
  102: '不支持的语言类型',
  103: '翻译文本过长',
  108: '应用ID无效',
  110: '无相关服务的有效实例',
  111: '开发者账号无效',
  112: '请求服务无效',
  113: '查询为空',
  202: '签名检验失败,检查 KEY 和 SECRET',
  401: '账户已经欠费',
  411: '访问频率受限',
}

export interface YoudaoAPIData {
  errorCode: '0' | keyof typeof youdaoErrMessages
  translation: string[]
  basic: {
    phonetic: string
    'us-phonetic': string
    'uk-phonetic': string
    explains: string[]
  }
  /** some examples in web */
  web: Array<{
    key: string
    value: string[]
  }>
}

/** Per-query context shared by the pure parsers (replaces the former instance state). */
export interface ParseContext {
  word: string
  isChinese: boolean
}

export function makeResult(
  ctx: ParseContext,
  {
    title,
    subtitle,
    clipboard = '',
    pronounce = '',
    isPhonetic = false,
    isError = false,
  }: {
    title: string
    subtitle: string
    clipboard?: string
    pronounce?: string
    isPhonetic?: boolean
    isError?: boolean
  },
): Result {
  return {
    id: nanoid(),
    title,
    subtitle,
    clipboard,
    pronounce,
    quicklookUrl: `https://www.youdao.com/w/${ctx.word}`,
    isPhonetic,
    // only attach the flag when set, so normal results stay shape-identical
    ...(isError ? { isError: true } : {}),
  }
}

export function parseTranslation(translation: string[], ctx: ParseContext): Result[] {
  const headline = translation?.[0]
  if (!headline) return []

  const pronounce = ctx.isChinese ? headline : ctx.word
  return [
    makeResult(ctx, {
      title: headline,
      subtitle: ctx.word,
      clipboard: headline,
      pronounce,
    }),
  ]
}

export function parseBasic(basic: YoudaoAPIData['basic'], ctx: ParseContext): Result[] {
  if (!basic) return []

  const results: Result[] = []
  basic.explains.forEach((explain) => {
    const pronounce = ctx.isChinese ? explain : ctx.word
    results.push(
      makeResult(ctx, {
        title: explain,
        subtitle: ctx.word,
        clipboard: explain,
        pronounce,
      }),
    )
  })

  if (basic.phonetic) {
    const phonetic: string = parsePhonetic(basic, ctx)
    // pronounce the head word: the English result for zh->en, otherwise the queried word.
    // (must not reuse a per-explain pronounce, which would leak the last/empty value)
    const headWord = ctx.isChinese ? basic.explains[0] ?? ctx.word : ctx.word
    results.push(
      makeResult(ctx, {
        title: phonetic,
        subtitle: '回车可听发音',
        clipboard: headWord,
        pronounce: headWord,
        isPhonetic: true,
      }),
    )
  }

  return results
}

export function parseWeb(web: YoudaoAPIData['web'], ctx: ParseContext): Result[] {
  if (!web) return []

  return web
    .filter((item) => item.value?.length)
    .map((item) => {
      const pronounce = ctx.isChinese ? item.value[0] : item.key
      return makeResult(ctx, {
        title: item.value.join(', '),
        subtitle: item.key,
        clipboard: item.value[0],
        pronounce,
      })
    })
}

export function parsePhonetic(basic: YoudaoAPIData['basic'], ctx: ParseContext): string {
  let phonetic: string = ''

  if (ctx.isChinese && basic.phonetic) {
    phonetic = `[${basic.phonetic}] `
  }

  if (basic['us-phonetic']) {
    phonetic += ` [美: ${basic['us-phonetic']}] `
  }

  if (basic['uk-phonetic']) {
    phonetic += ` [英: ${basic['uk-phonetic']}]`
  }

  return phonetic
}

export function parseError(code: string, ctx: ParseContext): Result[] {
  const message = youdaoErrMessages[code] ?? `请参考错误码: ${code}`

  return [
    makeResult(ctx, {
      title: '👻 翻译出错啦',
      subtitle: message,
      clipboard: 'Ooops...',
      isError: true,
    }),
  ]
}
