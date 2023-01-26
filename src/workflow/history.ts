import { Cache } from '@raycast/api'
import {
  type Result,
} from '../adapters'
import {
  LRUCache,
} from '../utils'

const cacheItemsNamespace = 'query-history-items'
const cacheMetadataNamespace = 'items-metadata'

export interface QueryItem {
  query: string;
  result: Result;
  updateTime: string;
}

const historyCache = new Cache({
  namespace: cacheItemsNamespace,
})

const metadataCache = new Cache({
  namespace: cacheMetadataNamespace,
})

export interface MetadataCacheStorage {
  metadata: HistoryMetadata;
}

interface HistoryMetadata {
  list: Array<QueryItem['query']>;
}

export class HistoryManager {
  private maxSize: number
  public cache!: LRUCache

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize
    this.init()
  }

  init() {
    const data = metadataCache.get('metadata')
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
        const itemData = historyCache.get(query)
        return itemData
          ? JSON.parse(itemData) as QueryItem
          : null
      })
      .filter(item => item) as QueryItem[]
  }

  upsert(queryItem: QueryItem) {
    const deleted = this.cache.put(queryItem.query)
    if (deleted) {
      historyCache.remove(deleted)
    }
    historyCache.set(queryItem.query, JSON.stringify(queryItem))
    metadataCache.set('metadata', JSON.stringify({
      list: this.cache.getList(),
    }))
  }
}

