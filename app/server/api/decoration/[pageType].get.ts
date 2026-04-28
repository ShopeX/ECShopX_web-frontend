import type { DecorationDSL } from '~/types/decoration'
import { normalizeDecorationDSL } from '~/types/decoration'

function resolveApiBase(apiBase: unknown): string | null {
  if (typeof apiBase !== 'string' || !/^https?:\/\//.test(apiBase)) {
    return null
  }

  return apiBase.replace(/\/$/, '')
}

function unwrapApiResponse<T>(value: T | { data?: T }): T | null {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as { data?: T }).data ?? null
  }

  return (value as T) ?? null
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const pageType = event.context.params?.pageType || 'home'
  const query = getQuery(event)
  const apiBase = resolveApiBase(config.public.apiBase)

  if (!apiBase) {
    return null
  }

  const response = await $fetch<DecorationDSL | { data?: DecorationDSL }>(
    `${apiBase}/decoration/${pageType}`,
    {
      method: 'GET',
      query: {
        pageId: query.pageId || pageType,
        company_id: config.public.companyId,
        country_code: config.public.defaultCountryCode,
      },
    }
  ).catch(() => null)

  return normalizeDecorationDSL(unwrapApiResponse(response), null)
})
