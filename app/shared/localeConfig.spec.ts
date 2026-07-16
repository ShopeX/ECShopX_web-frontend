import { describe, expect, it } from 'vitest'
import {
  getApiCountryCodeByLocale,
  NON_DEFAULT_LOCALE_CODES,
  normalizeLocaleCode,
} from './localeConfig'

describe('localeConfig zhtw support', () => {
  it('maps zhtw locale to zh-TW api country code', () => {
    expect(getApiCountryCodeByLocale('zhtw')).toBe('zh-TW')
    expect(getApiCountryCodeByLocale('ZHTW')).toBe('zh-TW')
  })

  it('includes zhtw in non-default locale codes', () => {
    expect(NON_DEFAULT_LOCALE_CODES).toContain('zhtw')
  })

  it('normalizes exact zhtw codes without stripping as a region tag', () => {
    expect(normalizeLocaleCode('zhtw')).toBe('zhtw')
  })

  it('keeps existing locale mappings', () => {
    expect(getApiCountryCodeByLocale('zh')).toBe('zh-CN')
    expect(getApiCountryCodeByLocale('en')).toBe('en-CN')
    expect(getApiCountryCodeByLocale('ar')).toBe('ar-SA')
  })
})
