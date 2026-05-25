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

interface TranslatorType {
  adapter: Adapter;
  translate: (word: string) => Promise<Result[]>;
}

export class Translator implements TranslatorType {
  public adapter: Adapter
  private historyManager: HistoryManager

  constructor({ key, secret, platform, historyManager }: {
    key: string;
    secret: string;
    platform: AdapterPlatform;
    historyManager: HistoryManager;
  }) {
    this.adapter = new adapters[platform](key, secret)
    this.historyManager = historyManager
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
        title: query,
        subtitle: `${result.title} (${result.subtitle})`,
      },
      updateTime: new Date().toISOString(),
    })
  }
}
