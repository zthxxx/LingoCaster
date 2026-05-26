import { parseDotenv } from '../utils'
import {
  type AdapterPlatform,
} from '../adapters'
import goodFixture from '../adapters/__fixtures__/youdao-dict.good.json'
import { Translator, type RequestFn } from './translator'
import { HistoryManager, MemoryStorage } from './history'

parseDotenv()

const dictResponse = goodFixture as unknown

const makeHistory = () => new HistoryManager({
  itemsStorage: new MemoryStorage(),
  metadataStorage: new MemoryStorage(),
})

const makeTranslator = (request: RequestFn) => new Translator({
  key: 'test-key',
  secret: 'test-secret',
  platform: 'Youdao' as AdapterPlatform,
  historyManager: makeHistory(),
  request,
})

const isDictUrl = (url: string) => url.includes('dict.youdao.com/jsonapi')

describe('Translator parallel translate + dict (no network)', () => {
  test('translation headline first, dict detail appended', async () => {
    // degraded openapi: translation only (no basic/web); dict supplies the detail
    const request: RequestFn = async url => (isDictUrl(url) ? dictResponse : { errorCode: '0', translation: ['好的'] })
    const results = await makeTranslator(request).translate('good')

    // 1 translation + (4 explains + 1 phonetic + 4 web) from dict fixture
    expect(results).toHaveLength(1 + 4 + 1 + 4)
    expect(results[0].title).toBe('好的')
    expect(results[0].subtitle).toBe('good')
    expect(results[0].isPhonetic).toBe(false)
    // dict contributed a phonetic row
    expect(results.some(r => r.isPhonetic)).toBe(true)
  })

  test('dict failure degrades gracefully to translation only', async () => {
    const request: RequestFn = async (url) => {
      if (isDictUrl(url)) throw new Error('unofficial dict endpoint down')
      return { errorCode: '0', translation: ['好的'] }
    }
    const results = await makeTranslator(request).translate('good')
    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('好的')
  })

  test('long input (sentence) skips dict lookup entirely', async () => {
    let dictCalled = false
    const request: RequestFn = async (url) => {
      if (isDictUrl(url)) {
        dictCalled = true
        return dictResponse
      }
      return { errorCode: '0', translation: ['这是一个较长句子的翻译结果'] }
    }
    const longInput = 'this is a fairly long sentence that goes well beyond the dict threshold'
    const results = await makeTranslator(request).translate(longInput)
    expect(dictCalled).toBe(false)
    expect(results).toHaveLength(1)
  })

  test('translate error surfaces while dict still appends', async () => {
    const request: RequestFn = async url => (isDictUrl(url) ? dictResponse : { errorCode: '108', translation: [] })
    const results = await makeTranslator(request).translate('good')
    // error row from translate + dict rows
    expect(results[0].title).toBe('👻 翻译出错啦')
    expect(results.length).toBeGreaterThan(1)
  })
})

const {
  APP_KEY,
  APP_SECRET,
  APP_PLATFORM,
} = process.env;

((APP_KEY && APP_SECRET && APP_PLATFORM)
  ? describe
  : describe.skip
)('translator with network', () => {
  test('word: translation headline + appended dict detail', async () => {
    const translator = new Translator({
      key: APP_KEY!,
      secret: APP_SECRET!,
      platform: APP_PLATFORM as AdapterPlatform,
      historyManager: makeHistory(),
    })

    const results = await translator.translate('word')

    // translation headline is first and carries the queried word
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0].subtitle).toBe('word')
    expect(results[0].isPhonetic).toBe(false)
    // dict (jsonapi, no auth) appends word-level rows for a common word
    expect(results.length).toBeGreaterThan(1)
  })
})
