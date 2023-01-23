import { parseDotenv } from '../utils'
import {
  type AdapterPlatform,
} from '../adapters'
import { Translator } from './translator'

parseDotenv()

const {
  APP_KEY,
  APP_SECRET,
  APP_PLATFORM,
} = process.env;


((APP_KEY && APP_SECRET && APP_PLATFORM)
  ? describe
  : describe.skip
)('simple test translator with network', () => {
  test('simple test translator', async () => {
    const translator = new Translator({
      key: APP_KEY!,
      secret: APP_SECRET!,
      platform: APP_PLATFORM as AdapterPlatform,
    })

    const results = await translator.translate('word')
    results.forEach(item => {
      item.id = ''
    })

    expect(results.length).toBeGreaterThan(5)
    expect(results[0]).toEqual({
      id: '',
      title: '词',
      subtitle: 'word',
      clipboard: '词',
      pronounce: 'word',
      quicklookUrl: 'https://www.youdao.com/w/word',
      isPhonetic: false,
    })
    expect(results[5]).toEqual({
      id: '',
      title: ' [美: wɜːrd]  [英: wɜːd]',
      subtitle: '回车可听发音',
      clipboard: 'word',
      pronounce: 'word',
      quicklookUrl: 'https://www.youdao.com/w/word',
      isPhonetic: true,
    })
  })
})

