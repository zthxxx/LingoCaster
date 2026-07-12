/**
 * Youdao web dictionary (jsonapi) response types.
 *
 * Source: unofficial endpoint `GET https://dict.youdao.com/jsonapi` (no auth / no sign).
 * Derived from real fixtures in `./__fixtures__/` and from
 * Raycast-Easydict `src/dictionary/youdao/types.ts`
 * (https://github.com/tisfeng/Raycast-Easydict).
 *
 * Only the fields consumed by `youdao-dict.ts` are modeled; the live response
 * carries many more sub-dictionaries (simple/baike/...) which are intentionally
 * left loosely typed.
 */

/** A single translation explanation node, shared by `ec` and `ce`. */
export interface DictTr {
  tr?: Array<{
    l?: {
      /**
       * Mixed array: empty strings and `{ "#text": "beauty", ... }` link objects.
       * For `ec` (English→Chinese), `i[0]` is the full POS string, e.g. "adj. 优良的…".
       * For `ce` (Chinese→English), the objects hold the English word in `#text`.
       */
      i?: Array<string | DictTextLink>
      /** part of speech, e.g. "n." / "adj." (present in `ce`). */
      pos?: string
      /** Chinese gloss (present in `ce`). */
      '#tran'?: string
    }
  }>
}

export interface DictTextLink {
  '#text'?: string
  '@href'?: string
  '@action'?: string
}

/** word form, e.g. { name: "复数", value: "goods" }. */
export interface WordForm {
  wf?: {
    name?: string
    value?: string
  }
}

/** English → Chinese dictionary. */
export interface Ec {
  exam_type?: string[]
  word?: Array<{
    usphone?: string
    ukphone?: string
    usspeech?: string
    ukspeech?: string
    trs?: DictTr[]
    wfs?: WordForm[]
    'return-phrase'?: unknown
  }>
}

/** Chinese → English dictionary. */
export interface Ce {
  word?: Array<{
    /** pinyin, e.g. "měi". */
    phone?: string
    trs?: DictTr[]
    'return-phrase'?: unknown
  }>
}

export interface WebTranslation {
  /** "true" when this entry's key equals the query word. */
  '@same'?: string
  key: string
  trans?: Array<{
    value?: string
    summary?: { line?: string[] }
    support?: number
  }>
}

export interface WebTrans {
  'web-translation'?: WebTranslation[]
}

export interface Meta {
  input?: string
  /** "eng" / "zh" — youdao's language guess. */
  guessLanguage?: string
  le?: string
  lang?: string
}

export interface YoudaoWebDictionaryModel {
  input?: string
  lang?: string
  le?: string
  meta?: Meta
  ec?: Ec
  ce?: Ce
  web_trans?: WebTrans
}
