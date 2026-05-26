import fc from 'fast-check'
import {
  type ParseContext,
  type YoudaoAPIData,
  makeResult,
  parseBasic,
  parseError,
  parsePhonetic,
  parseTranslation,
  parseWeb,
  youdaoErrMessages,
} from './youdao-parse'

const ctxArb: fc.Arbitrary<ParseContext> = fc.record({
  word: fc.string(),
  isChinese: fc.boolean(),
})

describe('makeResult', () => {
  test('property: always carries id, quicklookUrl with word, defaults', () => {
    fc.assert(fc.property(ctxArb, fc.string(), fc.string(), (ctx, title, subtitle) => {
      const result = makeResult(ctx, { title, subtitle })
      expect(typeof result.id).toBe('string')
      expect(result.id.length).toBeGreaterThan(0)
      expect(result.title).toBe(title)
      expect(result.subtitle).toBe(subtitle)
      expect(result.quicklookUrl).toBe(`https://www.youdao.com/w/${ctx.word}`)
      expect(result.clipboard).toBe('')
      expect(result.pronounce).toBe('')
      expect(result.isPhonetic).toBe(false)
    }))
  })

  test('property: ids are unique across calls', () => {
    fc.assert(fc.property(ctxArb, (ctx) => {
      const a = makeResult(ctx, { title: 't', subtitle: 's' })
      const b = makeResult(ctx, { title: 't', subtitle: 's' })
      expect(a.id).not.toBe(b.id)
    }))
  })
})

describe('parseTranslation', () => {
  test('property: non-empty translation -> exactly one row, pronounce follows direction', () => {
    fc.assert(fc.property(ctxArb, fc.array(fc.string(), { minLength: 1 }), (ctx, translation) => {
      const results = parseTranslation(translation, ctx)
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe(translation[0])
      expect(results[0].subtitle).toBe(ctx.word)
      expect(results[0].clipboard).toBe(translation[0])
      expect(results[0].pronounce).toBe(ctx.isChinese ? translation[0] : ctx.word)
      expect(results[0].isPhonetic).toBe(false)
    }))
  })

  test('undefined translation -> []', () => {
    expect(parseTranslation(undefined as unknown as string[], { word: 'x', isChinese: false })).toEqual([])
  })

  test('golden: word -> 词 (mirrors existing integration expectation)', () => {
    const [result] = parseTranslation(['词'], { word: 'word', isChinese: false })
    expect({ ...result, id: '' }).toEqual({
      id: '',
      title: '词',
      subtitle: 'word',
      clipboard: '词',
      pronounce: 'word',
      quicklookUrl: 'https://www.youdao.com/w/word',
      isPhonetic: false,
    })
  })
})

describe('parseBasic', () => {
  const basicArb = fc.record({
    'phonetic': fc.string(),
    'us-phonetic': fc.string(),
    'uk-phonetic': fc.string(),
    'explains': fc.array(fc.string({ minLength: 1 })),
  })

  test('property: row count = explains + (phonetic ? 1 : 0)', () => {
    fc.assert(fc.property(ctxArb, basicArb, (ctx, basic) => {
      const results = parseBasic(basic, ctx)
      const expected = basic.explains.length + (basic.phonetic ? 1 : 0)
      expect(results).toHaveLength(expected)
    }))
  })

  test('property: explain rows carry explain as title and word as subtitle', () => {
    fc.assert(fc.property(ctxArb, fc.array(fc.string({ minLength: 1 }), { minLength: 1 }), (ctx, explains) => {
      const basic: YoudaoAPIData['basic'] = { 'phonetic': '', 'us-phonetic': '', 'uk-phonetic': '', explains }
      const results = parseBasic(basic, ctx)
      results.forEach((r, i) => {
        expect(r.title).toBe(explains[i])
        expect(r.subtitle).toBe(ctx.word)
        expect(r.pronounce).toBe(ctx.isChinese ? explains[i] : ctx.word)
      })
    }))
  })

  test('phonetic row is last, isPhonetic, with 回车可听发音 subtitle', () => {
    const basic: YoudaoAPIData['basic'] = { 'phonetic': 'ɡʊd', 'us-phonetic': 'ɡʊd', 'uk-phonetic': 'ɡʊd', 'explains': ['adj. 好的'] }
    const results = parseBasic(basic, { word: 'good', isChinese: false })
    expect(results).toHaveLength(2)
    const last = results[1]
    expect(last.isPhonetic).toBe(true)
    expect(last.subtitle).toBe('回车可听发音')
    expect(last.pronounce).toBe('good')
  })

  test('undefined basic -> []', () => {
    expect(parseBasic(undefined as unknown as YoudaoAPIData['basic'], { word: 'x', isChinese: false })).toEqual([])
  })
})

describe('parsePhonetic', () => {
  test('property: english includes us/uk values when present, no 美/英 when both empty', () => {
    fc.assert(fc.property(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }), (us, uk) => {
      const basic: YoudaoAPIData['basic'] = { 'phonetic': '', 'us-phonetic': us, 'uk-phonetic': uk, 'explains': [] }
      const text = parsePhonetic(basic, { word: 'w', isChinese: false })
      expect(text).toContain(us)
      expect(text).toContain(uk)
      expect(text).toContain('美')
      expect(text).toContain('英')
    }))
  })

  test('empty phonetics -> empty string (english)', () => {
    const basic: YoudaoAPIData['basic'] = { 'phonetic': '', 'us-phonetic': '', 'uk-phonetic': '', 'explains': [] }
    expect(parsePhonetic(basic, { word: 'w', isChinese: false })).toBe('')
  })

  test('chinese prefixes with [phonetic]', () => {
    const basic: YoudaoAPIData['basic'] = { 'phonetic': 'měi', 'us-phonetic': '', 'uk-phonetic': '', 'explains': [] }
    expect(parsePhonetic(basic, { word: '美', isChinese: true })).toBe('[měi] ')
  })
})

describe('parseWeb', () => {
  const webArb = fc.array(fc.record({
    key: fc.string({ minLength: 1 }),
    value: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
  }))

  test('property: one row per web entry, title joins value, subtitle is key', () => {
    fc.assert(fc.property(ctxArb, webArb, (ctx, web) => {
      const results = parseWeb(web, ctx)
      expect(results).toHaveLength(web.length)
      results.forEach((r, i) => {
        expect(r.title).toBe(web[i].value.join(', '))
        expect(r.subtitle).toBe(web[i].key)
        expect(r.clipboard).toBe(web[i].value[0])
        expect(r.pronounce).toBe(ctx.isChinese ? web[i].value[0] : web[i].key)
      })
    }))
  })

  test('undefined web -> []', () => {
    expect(parseWeb(undefined as unknown as YoudaoAPIData['web'], { word: 'x', isChinese: false })).toEqual([])
  })
})

describe('parseError', () => {
  test('property: known codes map to their message, single error row', () => {
    const codes = Object.keys(youdaoErrMessages)
    fc.assert(fc.property(fc.constantFrom(...codes), ctxArb, (code, ctx) => {
      const results = parseError(code, ctx)
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('👻 翻译出错啦')
      expect(results[0].subtitle).toBe(youdaoErrMessages[code])
      expect(results[0].clipboard).toBe('Ooops...')
    }))
  })

  test('unknown code falls back to generic message', () => {
    const [result] = parseError('999', { word: 'x', isChinese: false })
    expect(result.subtitle).toBe('请参考错误码: 999')
  })
})
