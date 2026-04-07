import { NON_DEFAULT_LOCALE_CODES } from '~/shared/localeConfig'

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const NON_DEFAULT_LOCALE_PREFIX_RE =
  NON_DEFAULT_LOCALE_CODES.length > 0
    ? new RegExp(`^/(${NON_DEFAULT_LOCALE_CODES.map(escapeRegex).join('|')})(?=/|$)`)
    : null

export function stripLocalePrefix(path: string): string {
  if (!path) return path

  const normalizedPath = NON_DEFAULT_LOCALE_PREFIX_RE
    ? path.replace(NON_DEFAULT_LOCALE_PREFIX_RE, '')
    : path
  return normalizedPath || '/'
}
