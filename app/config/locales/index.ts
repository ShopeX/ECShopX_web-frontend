/**
 * 多语言配置导出
 * 
 * 统一导出所有语言配置
 */

export * from './types'
export { zhCN, zhCNMessages } from './zh-CN'
export { enUS, enUSMessages } from './en-US'
export { arSA, arSAMessages } from './ar-SA'

import { zhCN, zhCNMessages } from './zh-CN'
import { enUS, enUSMessages } from './en-US'
import { arSA, arSAMessages } from './ar-SA'
import type { ILocaleConfig, IMessages } from './types'

/**
 * 所有可用语言配置
 */
export const availableLocales: Record<string, ILocaleConfig> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ar-SA': arSA,
}

/**
 * 所有语言的翻译消息
 */
export const allMessages: Record<string, IMessages> = {
  'zh-CN': zhCNMessages,
  'en-US': enUSMessages,
  'ar-SA': arSAMessages,
}

/**
 * 默认语言
 */
export const defaultLocale = zhCN

/**
 * 获取语言配置
 */
export function getLocale(localeCode: string): ILocaleConfig {
  return availableLocales[localeCode] || defaultLocale
}

/**
 * 获取翻译消息
 */
export function getMessages(localeCode: string): IMessages {
  return allMessages[localeCode] || zhCNMessages
}

