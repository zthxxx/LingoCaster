import got from 'got'
import {
  type Adapter,
  type AdapterPlatform,
  type Result,
  adapters,
} from '../adapters'
import {
  toSpaceCase,
} from '../utils'
import type {
  HistoryManager,
} from './history'

/** Injectable HTTP getter so the translate/dict pipeline is unit-testable without network. */
export type RequestFn = (url: string) => Promise<unknown>

const defaultRequest: RequestFn = url => got.get(url).json()

/** Inputs longer than this are treated as sentences; dict lookup is skipped. */
const MAX_DICT_INPUT_LENGTH = 45

interface TranslatorType {
  adapter: Adapter;
  translate: (word: string) => Promise<Result[]>;
}

export class Translator implements TranslatorType {
  public adapter: Adapter
  private dictAdapter?: Adapter
  private historyManager: HistoryManager
  private request: RequestFn

  constructor({ key, secret, platform, historyManager, request = defaultRequest }: {
    key: string;
    secret: string;
    platform: AdapterPlatform;
    historyManager: HistoryManager;
    request?: RequestFn;
  }) {
    const platformAdapters = adapters[platform]
    this.adapter = new platformAdapters.translate(key, secret)
    this.dictAdapter = platformAdapters.dict
      ? new platformAdapters.dict(key, secret)
      : undefined
    this.historyManager = historyManager
    this.request = request
  }

  public async translate(query: string): Promise<Result[]> {
    // camel case to space case
    const word = toSpaceCase(query)
    // fetch translate (headline) and dict (word-level detail) in parallel
    const [translateResults, dictResults] = await Promise.all([
      this.runSource(this.adapter, word),
      this.runDict(word, query),
    ])
    // compose: translation first, dict detail appended
    return [...translateResults, ...dictResults]
  }

  private async runSource(adapter: Adapter, word: string): Promise<Result[]> {
    const url = adapter.url(word)
    const responseData: unknown = await this.request(url)
    return adapter.parse(responseData)
  }

  /** dict is best-effort: an unofficial-endpoint failure must not break translation. */
  private async runDict(word: string, query: string): Promise<Result[]> {
    // gate on the RAW query length — toSpaceCase expands camelCase and would
    // otherwise skip dict for a single long identifier the user wants defined
    if (!this.dictAdapter || query.trim().length > MAX_DICT_INPUT_LENGTH) {
      return []
    }
    try {
      return await this.runSource(this.dictAdapter, word)
    } catch {
      return []
    }
  }

  public getHistory(): Result[] {
    const queryItems = this.historyManager.getList()
    return queryItems.map(item => item.result)
  }

  public updateHistoryItem(query: string, result?: Result): void {
    // never persist the translate error row as a history entry
    if (!result || result.isError) return

    this.historyManager.upsert({
      query,
      result: {
        ...result,
        clipboard: query,
        title: query,
        subtitle: `${result.title} (${result.subtitle})`,
      },
      updateTime: new Date().toISOString(),
    })
  }
}
