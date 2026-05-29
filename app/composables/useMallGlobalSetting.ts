import { templateApiClient } from '~/infrastructure/http/clients'
import type { IMallGlobalSetting } from '~/types/api/template'

const DEFAULT_LOGO_URL = '/images/logo/logo.png'
const DEFAULT_LOGIN_BACKGROUND_URL = '/assets/images/login-bg.png'

export async function useMallGlobalSetting() {
  const setting = useState<IMallGlobalSetting>('mall-global-setting', () => ({}))

  const { data, pending, error, refresh } = await useAsyncData(
    'mall-global-setting',
    async () => {
      return (await templateApiClient.getLoginPageSetting()) || {}
    },
    {
      default: () => setting.value,
    }
  )

  if (data.value) {
    setting.value = data.value
  }

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

