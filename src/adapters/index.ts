import type {
  Constructor,
} from 'type-fest'
import type { Adapter } from './adapter'
import { Youdao } from './youdao'

export * from './adapter'

export enum AdapterPlatform {
  Youdao = 'Youdao',
}

export type Adapters = Record<AdapterPlatform, Constructor<Adapter>>

export const adapters: Adapters = {
  Youdao,
}
