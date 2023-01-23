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

interface TranslatorType {
  adapter: Adapter;
  translate: (word: string) => Promise<Result[]>;
}

export class Translator implements TranslatorType {
  adapter: Adapter

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
    const responseData = await got.get(url).json()
    // parse
    const result = this.adapter.parse(responseData)
    // compose
    return result
  }
}
