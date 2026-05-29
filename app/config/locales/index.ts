import type { ILocaleConfig, IMessages } from './types'
import zhCN from '../../locales/zh-CN.json'
import enUS from '../../locales/en-US.json'
import ar from '../../locales/ar.json'

export const availableLocales: ILocaleConfig[] = [
  {
    code: 'zh-CN',
    name: '简体中文',
    direction: 'ltr',
    currencySymbol: '¥',
  },
  {
    code: 'en-US',
    name: 'English',
    direction: 'ltr',
    currencySymbol: '$',
  },
  {
    code: 'ar',
    name: 'العربية',
    direction: 'rtl',
    currencySymbol: '﷼',
  },
]

export const defaultLocale = availableLocales[0]!

const messagesMap: Record<string, IMessages> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  ar: ar,
}

export function getLocale(code: string): ILocaleConfig {
  return availableLocales.find((l) => l.code === code) || defaultLocale
}

export function getMessages(code: string): IMessages {
  return messagesMap[code] || zhCN
}
