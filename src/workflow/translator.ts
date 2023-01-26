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
import {
  HistoryManager,
} from './history'

interface TranslatorType {
  adapter: Adapter;
  translate: (word: string) => Promise<Result[]>;
}

export class Translator implements TranslatorType {
  public adapter: Adapter
  private _historyManager: HistoryManager | undefined

  constructor({ key, secret, platform }: {
    key: string;
    secret: string;
    platform: AdapterPlatform;
  }) {
    this.adapter = new adapters[platform](key, secret)
  }

  public async translate(query: string): Promise<Result[]> {
    // camel case to space case
    const word = toSpaceCase(query)
    // url
    const url = this.adapter.url(word)
    // fetch
    const responseData: unknown = await got.get(url).json()
    // parse
    const results = this.adapter.parse(responseData)
    // compose
    return results
  }

  public getHistory(): Result[] {
    const queryItems = this.historyManager.getList()
    return queryItems.map(item => item.result)
  }

  public updateHistoryItem(query: string, result?: Result): void {
    if (!result) return

    this.historyManager.upsert({
      query,
      result: {
        ...result,
        clipboard: query,
      },
      updateTime: new Date().toISOString(),
    })
  }

  public get historyManager(): HistoryManager {
    if (!this._historyManager) {
      this._historyManager = new HistoryManager()
    }
    return this._historyManager
  }
}
