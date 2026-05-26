import {
  type Result,
} from '../adapters'
import {
  LRUCache,
} from '../utils'

export interface QueryItem {
  query: string;
  result: Result;
  updateTime: string;
}

/**
 * Minimal key-value storage contract (a subset of Raycast `Cache`).
 * Injected into `HistoryManager` so the history layer stays free of `@raycast/api`
 * and is unit-testable. Raycast wiring lives in `./raycast-cache`.
 */
export interface KVStorage {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/** In-memory `KVStorage` — used by tests and as a non-persistent fallback. */
export class MemoryStorage implements KVStorage {
  private store = new Map<string, string>()

  get(key: string): string | undefined {
    return this.store.get(key)
  }

  set(key: string, value: string): void {
    this.store.set(key, value)
  }

  remove(key: string): void {
    this.store.delete(key)
  }
}

interface HistoryMetadata {
  list: Array<QueryItem['query']>;
}

const metadataKey = 'metadata'

export class HistoryManager {
  private maxSize: number
  private itemsStorage: KVStorage
  private metadataStorage: KVStorage
  public cache!: LRUCache

  constructor({ itemsStorage, metadataStorage, maxSize = 50 }: {
    itemsStorage: KVStorage;
    metadataStorage: KVStorage;
    maxSize?: number;
  }) {
    this.itemsStorage = itemsStorage
    this.metadataStorage = metadataStorage
    this.maxSize = maxSize
    this.init()
  }

  init() {
    const data = this.metadataStorage.get(metadataKey)
    const metadata: HistoryMetadata = data
      ? JSON.parse(data) as HistoryMetadata
      : { list: [] }

    this.cache = LRUCache.from({
      list: metadata.list,
      capacity: this.maxSize,
    })
  }

  getList(): QueryItem[] {
    const queryList = this.cache.getList()
    return queryList
      .map(query => {
        const itemData = this.itemsStorage.get(query)
        return itemData
          ? JSON.parse(itemData) as QueryItem
          : null
      })
      .filter(item => item) as QueryItem[]
  }

  upsert(queryItem: QueryItem) {
    const deleted = this.cache.put(queryItem.query)
    if (deleted) {
      this.itemsStorage.remove(deleted)
    }
    this.itemsStorage.set(queryItem.query, JSON.stringify(queryItem))
    this.metadataStorage.set(metadataKey, JSON.stringify({
      list: this.cache.getList(),
    }))
  }
}
