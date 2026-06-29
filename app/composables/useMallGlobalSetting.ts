import { templateApiClient } from '~/infrastructure/http/clients'
import type { IMallGlobalSetting } from '~/types/api/template'

const DEFAULT_LOGO_URL = '/images/logo/logo.png'
const DEFAULT_LOGIN_BACKGROUND_URL = '/assets/images/login-bg.png'

export async function useMallGlobalSetting() {
  const settingCache = useCookie<IMallGlobalSetting>('mall-global-setting-cache', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
  const setting = useState<IMallGlobalSetting>(
    'mall-global-setting',
    () => settingCache.value || {}
  )

  const { data, pending, error, refresh } = await useAsyncData(
    'mall-global-setting',
    async () => {
      return (await templateApiClient.getLoginPageSetting()) || {}
    },
    {
      // Fetch on the client so company_id resolves from window.location.hostname.
      default: () => setting.value,
      server: false,
    }
  )

  watch(
    data,
    (val) => {
      if (val) {
        setting.value = val
        settingCache.value = val
      }
    },
    { immediate: true }
  )

  const mallLogoLightUrl = computed(
    () => setting.value.logo_light || setting.value.logo || DEFAULT_LOGO_URL
  )
  const mallLogoDarkUrl = computed(
    () => setting.value.logo_dark || setting.value.logo || mallLogoLightUrl.value
  )
  const loginBackgroundUrl = computed(
    () => setting.value.background || DEFAULT_LOGIN_BACKGROUND_URL
  )

  return {
    setting,
    mallLogoLightUrl,
    mallLogoDarkUrl,
    loginBackgroundUrl,
    pending,
    error,
    refresh,
  }
}
