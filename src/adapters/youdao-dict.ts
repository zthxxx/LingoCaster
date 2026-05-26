import {
  detectLanguage,
  Language,
} from '../utils'
import type { Adapter, Result } from './adapter'
import {
  type ParseContext,
  type YoudaoAPIData,
  parseBasic,
  parseWeb,
} from './youdao-parse'
import type {
  DictTextLink,
  DictTr,
  WebTranslation,
  YoudaoWebDictionaryModel,
} from './youdao-dict-types'

/** Keep the result list concise (LingoCaster favors speed over exhaustiveness). */
export const MAX_WEB_RESULTS = 4

/** Youdao web dict `dicts` param: request only the sub-dictionaries we render. */
const DICTS_PARAM = JSON.stringify({ count: 99, dicts: [['ec', 'ce', 'web_trans']] })

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? value as T[] : [])

/**
 * Youdao web dictionary `le` (target language) code.
 * jsonapi keys dict by the non-Chinese side; LingoCaster supports zh<->en and ja.
 */
export function dictLanguageCode(input: string): string {
  return detectLanguage(input) === Language.JA ? Language.JA : Language.EN
}

/** Extract the English head word(s) from a `ce` (Chinese->English) translation node. */
function extractEnglish(tr: DictTr): string {
  return asArray<string | DictTextLink>(tr?.tr?.[0]?.l?.i)
    .filter((item): item is DictTextLink => typeof item === 'object' && item !== null)
    .map(item => item['#text'] ?? '')
    .filter(text => text.length > 0)
    .join(' ')
}

/**
 * Map a jsonapi response back onto the legacy `YoudaoAPIData` basic/web shape,
 * so the existing `parseBasic` / `parseWeb` renderers can be reused unchanged.
 *
 * - `ec` (English->Chinese): explains are the Chinese POS strings; us/uk phonetics.
 * - `ce` (Chinese->English): explains are the English head words (speakable/copyable);
 *   pinyin phonetic.
 */
export function mapToBasicWeb(model: YoudaoWebDictionaryModel): {
  basic: YoudaoAPIData['basic'] | null;
  web: YoudaoAPIData['web'];
} {
  const ecWord = model?.ec?.word?.[0]
  const ceWord = model?.ce?.word?.[0]

  let basic: YoudaoAPIData['basic'] | null = null

  if (ecWord) {
    const explains = asArray<DictTr>(ecWord.trs)
      .map(tr => tr?.tr?.[0]?.l?.i?.[0])
      .filter((item): item is string => typeof item === 'string' && item.length > 0)
    const us = ecWord.usphone ?? ''
    const uk = ecWord.ukphone ?? ''
    basic = {
      'phonetic': us || uk, // non-empty enables the phonetic row; display uses us/uk
      'us-phonetic': us,
      'uk-phonetic': uk,
      explains,
    }
  } else if (ceWord) {
    const explains = asArray<DictTr>(ceWord.trs)
      .map(extractEnglish)
      .filter(text => text.length > 0)
    basic = {
      'phonetic': ceWord.phone ?? '',
      'us-phonetic': '',
      'uk-phonetic': '',
      explains,
    }
  }

  const web: YoudaoAPIData['web'] = asArray<WebTranslation>(model?.web_trans?.['web-translation'])
    .slice(0, MAX_WEB_RESULTS)
    .map(entry => ({
      key: entry?.key,
      value: asArray<{ value?: string }>(entry?.trans)
        .map(trans => trans?.value ?? '')
        .filter(value => value.length > 0),
    }))
    .filter(item => item.value.length > 0)

  return { basic, web }
}

/**
 * Youdao web dictionary adapter — unofficial `dict.youdao.com/jsonapi` (no auth).
 * Runs in parallel with the signed translate adapter; contributes word-level
 * detail (phonetics / POS explanations / web phrases). See `__fixtures__/README.md`.
 */
export class YoudaoDict implements Adapter {
  word: string = ''

  isChinese: boolean = false

  url(input: string): string {
    this.word = input
    this.isChinese = detectLanguage(input) === Language.ZH
    const params = new URLSearchParams({
      q: input,
      le: dictLanguageCode(input),
      dicts: DICTS_PARAM,
    })
    return `https://dict.youdao.com/jsonapi?${params.toString()}`
  }

  parse(data: YoudaoWebDictionaryModel): Result[] {
    // only words carry dict entries; sentences (no ec/ce) contribute nothing
    const isWord = Boolean(data?.ec?.word?.[0] || data?.ce?.word?.[0])
    if (!isWord) return []

    const ctx: ParseContext = { word: this.word, isChinese: this.isChinese }
    const { basic, web } = mapToBasicWeb(data)
    return [
      ...(basic ? parseBasic(basic, ctx) : []),
      ...parseWeb(web, ctx),
    ]
  }
}
