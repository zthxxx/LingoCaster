import {
  sha256,
  nanoid,
} from '../utils'
import type { Adapter, Result } from './adapter'

const youdaoErrMessages: Record<string, string> = {
  101: '缺少必填的参数',
  102: '不支持的语言类型',
  103: '翻译文本过长',
  108: '应用ID无效',
  110: '无相关服务的有效实例',
  111: '开发者账号无效',
  112: '请求服务无效',
  113: '查询为空',
  202: '签名检验失败,检查 KEY 和 SECRET',
  401: '账户已经欠费',
  411: '访问频率受限',
}

export interface YoudaoAPIData {
  errorCode: '0' | keyof typeof youdaoErrMessages;
  translation: string[];
  basic: {
    phonetic: string;
    'us-phonetic': string;
    'uk-phonetic': string;
    explains: string[];
  };
  /** some examples in web */
  web: Array<{
    key: string;
    value: string[];
  }>;
}

export class Youdao implements Adapter {
  key: string

  secret: string

  word: string = ''

  isChinese: boolean = false

  results: Result[] = []

  phonetic: string = ''

  constructor(key: string, secret: string) {
    this.key = key
    this.secret = secret
  }

  url(input: string): string {
    this.isChinese = this.detectChinese(input)
    this.word = input
    const from = this.isChinese ? 'zh-CHS' : 'auto'
    const to = this.isChinese ? 'en' : 'zh-CHS'
    const timestamp = Math.round(new Date().getTime() / 1000).toString()
    const salt = Math.floor(Math.random() * 10000).toString()

    const truncateInput = (text: string): string => {
      const len = text.length
      return len <= 20
        ? text
        : `${text.substring(0, 10)}${len}${text.substring(len - 10, len)}`
    }

    const sign = sha256(`${this.key}${truncateInput(input)}${salt}${timestamp}${this.secret}`)

    // https://ai.youdao.com/DOCSIRMA/html/自然语言翻译/API文档/文本翻译服务/文本翻译服务-API文档.html
    const params = new URLSearchParams({
      q: input,
      from,
      to,
      appKey: this.key,
      salt,
      sign,
      signType: 'v3',
      curtime: timestamp,
    })


    return `https://openapi.youdao.com/api?${params.toString()}`
  }

  parse(data: YoudaoAPIData): Result[] {
    if (data.errorCode !== '0')
      return this.parseError(data.errorCode)

    const { translation, basic, web } = data

    this.parseTranslation(translation)
    this.parseBasic(basic)
    this.parseWeb(web)

    const results = this.results
    this.results = []
    return results
  }

  private parseTranslation(translation: string[]) {
    if (translation) {
      const pronounce = this.isChinese ? translation[0] : this.word
      this.addResult({
        title: translation[0],
        subtitle: this.word,
        clipboard: translation[0],
        pronounce,
      })
    }
  }

  private parseBasic(basic: YoudaoAPIData['basic']) {
    if (basic) {
      let pronounce: string = ''
      basic.explains.forEach((explain) => {
        pronounce = this.isChinese ? explain : this.word
        this.addResult({
          title: explain,
          subtitle: this.word,
          clipboard: explain,
          pronounce,
        })
      })

      if (basic.phonetic) {
        // 获取音标，同时确定要发音的单词
        const phonetic: string = this.parsePhonetic(basic)
        this.addResult({
          title: phonetic,
          subtitle: '回车可听发音',
          clipboard: pronounce,
          pronounce,
          isPhonetic: true,
        })
      }
    }
  }

  private parseWeb(web: YoudaoAPIData['web']) {
    if (web) {
      web.forEach((item) => {
        const pronounce = this.isChinese ? item.value[0] : item.key
        this.addResult({
          title: item.value.join(', '),
          subtitle: item.key,
          clipboard: item.value[0],
          pronounce,
        })
      })
    }
  }

  private parsePhonetic(basic: YoudaoAPIData['basic']): string {
    let phonetic: string = ''

    if (this.isChinese && basic.phonetic)
      phonetic = `[${basic.phonetic}] `

    if (basic['us-phonetic'])
      phonetic += ` [美: ${basic['us-phonetic']}] `

    if (basic['uk-phonetic'])
      phonetic += ` [英: ${basic['uk-phonetic']}]`

    return phonetic
  }

  private parseError(code: string): Result[] {
    const message = youdaoErrMessages[code] ?? `请参考错误码: ${code}`

    return this.addResult({
      title: '👻 翻译出错啦',
      subtitle: message,
      clipboard: 'Ooops...',
    })
  }

  private addResult({
    title,
    subtitle,
    clipboard = '',
    pronounce = '',
    isPhonetic = false,
  }: {
    title: string;
    subtitle: string;
    clipboard?: string;
    pronounce?: string;
    isPhonetic?: boolean;
  }): Result[] {
    const quicklookUrl = `https://www.youdao.com/w/${this.word}`

    this.results.push({
      id: nanoid(),
      title,
      subtitle,
      clipboard,
      pronounce,
      quicklookUrl,
      isPhonetic,
    })
    return this.results
  }

  private detectChinese(word: string): boolean {
    return /^[\u4E00-\u9FA5]+$/.test(word)
  }
}
