import type {
  Constructor,
} from 'type-fest'
import type { Adapter } from './adapter'
import { Youdao } from './youdao'
import { YoudaoDict } from './youdao-dict'

export * from './adapter'

export enum AdapterPlatform {
  Youdao = 'Youdao',
}

/**
 * A platform may expose a translate adapter (headline translation, good for sentences)
 * and an optional dict adapter (word-level detail), run in parallel by the Translator.
 */
export interface PlatformAdapters {
  translate: Constructor<Adapter>;
  dict?: Constructor<Adapter>;
}

export type Adapters = Record<AdapterPlatform, PlatformAdapters>

export const adapters: Adapters = {
  Youdao: {
    translate: Youdao,
    dict: YoudaoDict,
  },
}
