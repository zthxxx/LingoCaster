export interface Result {
  id: string;
  title: string;
  subtitle: string;
  /** words for copy */
  clipboard: string;
  /** words for pronounce */
  pronounce: string;
  /** view for platform website */
  quicklookUrl?: string;
  /** mark this item only for pronounce with phonetic */
  isPhonetic: boolean;
}

export interface Adapter {
  key: string;

  secret: string;

  word: string;

  isChinese: boolean;

  url: (word: string) => string;

  parse: (response: any) => Result[];
}
