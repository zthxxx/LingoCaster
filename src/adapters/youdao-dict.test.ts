import fc from 'fast-check'
import goodFixture from './__fixtures__/youdao-dict.good.json'
import meiFixture from './__fixtures__/youdao-dict.mei.json'
import type { YoudaoWebDictionaryModel } from './youdao-dict-types'
import {
  MAX_WEB_RESULTS,
  YoudaoDict,
  dictLanguageCode,
  mapToBasicWeb,
} from './youdao-dict'

const good = goodFixture as unknown as YoudaoWebDictionaryModel
const mei = meiFixture as unknown as YoudaoWebDictionaryModel

describe('dictLanguageCode', () => {
  test('english / chinese -> en, japanese -> ja', () => {
    expect(dictLanguageCode('good')).toBe('en')
    expect(dictLanguageCode('美')).toBe('en')
    expect(dictLanguageCode('こんにちは')).toBe('ja')
  })

  test('property: always returns en or ja', () => {
    fc.assert(fc.property(fc.string(), (input) => {
      expect(['en', 'ja']).toContain(dictLanguageCode(input))
    }))
  })
})

describe('YoudaoDict.url', () => {
  test('builds unsigned jsonapi url with q/le/dicts, no sign/appKey', () => {
    const url = new YoudaoDict().url('good')
    expect(url.startsWith('https://dict.youdao.com/jsonapi?')).toBe(true)
    const query = new URLSearchParams(url.split('?')[1])
    expect(query.get('q')).toBe('good')
    expect(query.get('le')).toBe('en')
    expect(query.get('dicts')).toBe(JSON.stringify({ count: 99, dicts: [['ec', 'ce', 'web_trans']] }))
    expect(url).not.toContain('sign')
    expect(url).not.toContain('appKey')
  })

  test('property: q round-trips through url encoding', () => {
    fc.assert(fc.property(fc.string({ minLength: 1 }), (input) => {
      const url = new YoudaoDict().url(input)
      const query = new URLSearchParams(url.split('?')[1])
      expect(query.get('q')).toBe(input)
    }))
  })
})

describe('mapToBasicWeb', () => {
  test('english word (good): ec -> chinese POS explains + us/uk phonetics', () => {
    const { basic, web } = mapToBasicWeb(good)
    expect(basic).not.toBeNull()
    expect(basic!.explains).toHaveLength(4)
    expect(basic!.explains[0]).toMatch(/^adj\./)
    expect(basic!['us-phonetic']).toBe('ɡʊd')
    expect(basic!['uk-phonetic']).toBe('ɡʊd')
    // non-empty so the existing phonetic row renders
    expect(basic!.phonetic).toBeTruthy()
    expect(web).toHaveLength(MAX_WEB_RESULTS)
    expect(web[0]).toEqual({ key: 'good', value: ['好的', '善', '良好', '商品'] })
  })

  test('chinese word (mei): ce -> english explains + pinyin phonetic', () => {
    const { basic, web } = mapToBasicWeb(mei)
    expect(basic).not.toBeNull()
    expect(basic!.explains).toEqual(['beauty', 'beautiful', 'good', 'beauteousness', 'prettily'])
    expect(basic!.phonetic).toBe('měi')
    expect(basic!['us-phonetic']).toBe('')
    expect(basic!['uk-phonetic']).toBe('')
    expect(web).toHaveLength(MAX_WEB_RESULTS)
    expect(web[0].key).toBe('美')
  })

  test('caps web entries at MAX_WEB_RESULTS', () => {
    // both fixtures have >MAX_WEB_RESULTS web entries
    expect(mapToBasicWeb(good).web.length).toBe(MAX_WEB_RESULTS)
    expect(mapToBasicWeb(mei).web.length).toBe(MAX_WEB_RESULTS)
  })

  test('non-word model (no ec/ce) -> null basic', () => {
    expect(mapToBasicWeb({ input: 'hello world' }).basic).toBeNull()
  })
})

describe('YoudaoDict.parse', () => {
  test('english word -> explain rows + phonetic row + web rows', () => {
    const adapter = new YoudaoDict()
    adapter.url('good') // sets word / isChinese, mirrors real flow
    const results = adapter.parse(good)
    // 4 explains + 1 phonetic + MAX_WEB_RESULTS web
    expect(results).toHaveLength(4 + 1 + MAX_WEB_RESULTS)
    expect(results.filter(r => r.isPhonetic)).toHaveLength(1)
    // explain rows keep the queried word as subtitle
    expect(results[0].subtitle).toBe('good')
    expect(results.every(r => r.id.length > 0)).toBe(true)
  })

  test('chinese word -> english explains pronounce-able', () => {
    const adapter = new YoudaoDict()
    adapter.url('美')
    const results = adapter.parse(mei)
    // 5 explains + 1 phonetic + MAX_WEB_RESULTS web
    expect(results).toHaveLength(5 + 1 + MAX_WEB_RESULTS)
    // chinese query: explain row pronounces the english result
    expect(results[0].pronounce).toBe('beauty')
  })

  test('sentence-like model (no ec/ce) -> [] even if web_trans present', () => {
    const adapter = new YoudaoDict()
    adapter.url('a long sentence here')
    expect(adapter.parse({ input: 'a long sentence here', web_trans: { 'web-translation': [{ key: 'x', trans: [{ value: 'y' }] }] } })).toEqual([])
  })

  test('property: parse never throws on arbitrary / partial models', () => {
    const adapter = new YoudaoDict()
    adapter.url('x')
    fc.assert(fc.property(fc.anything(), (model) => {
      const results = adapter.parse(model as YoudaoWebDictionaryModel)
      expect(Array.isArray(results)).toBe(true)
    }))
  })
})
