import fc from 'fast-check'
import {
  HistoryManager,
  MemoryStorage,
  type QueryItem,
} from './history'

const itemOf = (query: string): QueryItem => ({
  query,
  result: {
    id: query,
    title: query,
    subtitle: '',
    clipboard: query,
    pronounce: query,
    isPhonetic: false,
  },
  updateTime: new Date().toISOString(),
})

const makeManager = (maxSize?: number) => new HistoryManager({
  itemsStorage: new MemoryStorage(),
  metadataStorage: new MemoryStorage(),
  maxSize,
})

describe('HistoryManager (injected MemoryStorage)', () => {
  test('upsert then getList returns the stored item', () => {
    const hm = makeManager()
    hm.upsert(itemOf('hello'))
    const list = hm.getList()
    expect(list).toHaveLength(1)
    expect(list[0].query).toBe('hello')
    expect(list[0].result.title).toBe('hello')
  })

  test('re-upsert moves to front without growing', () => {
    const hm = makeManager(3)
    ;['a', 'b', 'c'].forEach(q => hm.upsert(itemOf(q)))
    expect(hm.getList().map(i => i.query)).toEqual(['c', 'b', 'a'])
    hm.upsert(itemOf('a'))
    expect(hm.getList().map(i => i.query)).toEqual(['a', 'c', 'b'])
  })

  test('eviction drops the oldest item from storage', () => {
    const itemsStorage = new MemoryStorage()
    const hm = new HistoryManager({ itemsStorage, metadataStorage: new MemoryStorage(), maxSize: 2 })
    ;['a', 'b', 'c'].forEach(q => hm.upsert(itemOf(q)))
    expect(hm.getList().map(i => i.query)).toEqual(['c', 'b'])
    expect(itemsStorage.get('a')).toBeUndefined()
    expect(itemsStorage.get('c')).toBeDefined()
  })

  test('init restores list (most-recent-first) from metadata storage', () => {
    const itemsStorage = new MemoryStorage()
    const metadataStorage = new MemoryStorage()
    const first = new HistoryManager({ itemsStorage, metadataStorage, maxSize: 5 })
    first.upsert(itemOf('a'))
    first.upsert(itemOf('b'))
    // a fresh manager over the same storage rebuilds from persisted metadata
    const restored = new HistoryManager({ itemsStorage, metadataStorage, maxSize: 5 })
    expect(restored.getList().map(i => i.query)).toEqual(['b', 'a'])
  })

  test('property: retained = last `capacity` distinct queries, most-recent-first', () => {
    fc.assert(fc.property(
      fc.uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 30 }),
      fc.integer({ min: 1, max: 20 }),
      (queries, capacity) => {
        const hm = makeManager(capacity)
        queries.forEach(q => hm.upsert(itemOf(q)))
        const expected = queries.slice(-capacity).reverse()
        expect(hm.getList().map(i => i.query)).toEqual(expected)
      },
    ))
  })

  test('property: getList length never exceeds capacity', () => {
    fc.assert(fc.property(
      fc.array(fc.string({ minLength: 1 }), { maxLength: 40 }),
      fc.integer({ min: 1, max: 10 }),
      (queries, capacity) => {
        const hm = makeManager(capacity)
        queries.forEach(q => hm.upsert(itemOf(q)))
        expect(hm.getList().length).toBeLessThanOrEqual(capacity)
      },
    ))
  })
})

describe('HistoryManager corrupt-cache resilience', () => {
  test('init does not throw on corrupt metadata and falls back to empty', () => {
    const metadataStorage = new MemoryStorage()
    metadataStorage.set('metadata', 'not valid json{{{')
    expect(() => new HistoryManager({ itemsStorage: new MemoryStorage(), metadataStorage })).not.toThrow()
    const hm = new HistoryManager({ itemsStorage: new MemoryStorage(), metadataStorage })
    expect(hm.getList()).toEqual([])
  })

  test('getList skips a corrupt item entry without throwing', () => {
    const itemsStorage = new MemoryStorage()
    const metadataStorage = new MemoryStorage()
    metadataStorage.set('metadata', JSON.stringify({ list: ['good', 'bad'] }))
    itemsStorage.set('good', JSON.stringify(itemOf('good')))
    itemsStorage.set('bad', 'corrupt}{')
    const hm = new HistoryManager({ itemsStorage, metadataStorage })
    expect(hm.getList().map(i => i.query)).toEqual(['good'])
  })
})
