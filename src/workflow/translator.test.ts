import { parseDotenv } from '../utils'
import {
  type AdapterPlatform,
} from '../adapters'
import { Translator } from './translator'
import type { HistoryManager } from './history'

parseDotenv()

const {
  APP_KEY,
  APP_SECRET,
  APP_PLATFORM,
} = process.env;

const mockHistoryManager: HistoryManager = {} as HistoryManager

((APP_KEY && APP_SECRET && APP_PLATFORM)
  ? describe
  : describe.skip
)('simple test translator with network', () => {
  test('simple test translator', async () => {
    const translator = new Translator({
      key: APP_KEY!,
      secret: APP_SECRET!,
      platform: APP_PLATFORM as AdapterPlatform,
      historyManager: mockHistoryManager,
    })

    const results = await translator.translate('word')
    results.forEach(item => {
      item.id = ''
    })

    // translate api 仅返回 翻译 而非 词典，因此只有一条
    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
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

