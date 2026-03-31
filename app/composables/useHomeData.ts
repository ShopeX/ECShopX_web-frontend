import { templateApiClient } from '~/infrastructure/http/clients/TemplateApiClient'
import { useProduct } from './useProduct'

export function useHomeData(distributorId?: string) {
  const { loadProducts, products, listLoading: productsLoading } = useProduct()

  const pageConfig = ref<any>(null)
  const pending = ref(false)
  const error = ref<any>(null)

  async function fetchHomeData() {
    pending.value = true
    error.value = null

    try {
      const [configRes] = await Promise.all([
        templateApiClient.getTemplateConfig('index'),
        loadProducts({
          page: '1',
          pageSize: '20',
          item_type: 'normal',
          main_category: '0',
          is_tdk: '0',
          type: 'all',
          ...(distributorId && { distributor_id: distributorId }),
        }),
      ])

      if (configRes) {
        pageConfig.value = configRes
      }
    } catch (e: any) {
      error.value = e
      console.error('[useHomeData] Fetch error:', e)
    } finally {
      pending.value = false
    }
  }

  const fetchWithSSR = () => {
    return useAsyncData('home-data', async () => {
      await fetchHomeData()
      return {
        pageConfig: pageConfig.value,
        products: products.value,
      }
    })
  }

  return {
    pageConfig,
    products,
    pending: computed(() => pending.value || productsLoading.value),
    error,
    fetchHomeData,
    fetchWithSSR,
  }
}
