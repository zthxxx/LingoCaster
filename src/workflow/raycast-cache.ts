import { Cache } from '@raycast/api'
import { HistoryManager } from './history'

const cacheItemsNamespace = 'query-history-items'
const cacheMetadataNamespace = 'items-metadata'

/**
 * Composition root: a `HistoryManager` backed by Raycast's persistent `Cache`.
 *
 * This is the only module that touches `@raycast/api` in the history chain, so it
 * must NOT be imported by unit tests (which inject `MemoryStorage` instead). Raycast
 * `Cache` structurally satisfies `KVStorage` (get/set/remove).
 */
export function createHistoryManager(maxSize?: number): HistoryManager {
  return new HistoryManager({
    itemsStorage: new Cache({ namespace: cacheItemsNamespace }),
    metadataStorage: new Cache({ namespace: cacheMetadataNamespace }),
    maxSize,
  })
}
