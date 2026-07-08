import {
  getPathLocale,
  stripLocalePrefix,
  withLocalePrefix,
} from '~/utils/localeRoute'
import {
  getPreferredLocale,
  setPreferredLocale,
} from '~/utils/localePreference'

export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return

  const currentPathLocale = getPathLocale(to.path)
  const preferredLocale = getPreferredLocale()

  if (!preferredLocale) {
    setPreferredLocale(currentPathLocale)
    return
  }

  if (preferredLocale === currentPathLocale) return

  const targetPath = withLocalePrefix(stripLocalePrefix(to.path), preferredLocale)
  if (targetPath === to.path) return

  return navigateTo(
    {
      path: targetPath,
      query: to.query,
      hash: to.hash,
    },
    { replace: true }
  )
})
