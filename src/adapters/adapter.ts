export interface Result {
  id: string
  title: string
  subtitle: string
  /** words for copy */
  clipboard: string
  /** words for pronounce */
  pronounce: string
  /** view for platform website */
  quicklookUrl?: string
  /** mark this item only for pronounce with phonetic */
  isPhonetic: boolean
  /** marks a translate error row so it is not persisted to history */
  isError?: boolean
}

export interface Adapter {
  url: (word: string) => string

  /** declared as a method so each adapter can narrow `response` to its own payload type */
  parse(response: unknown): Result[]
}
