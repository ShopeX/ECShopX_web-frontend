import { templateApiClient } from '~/infrastructure/http/clients/TemplateApiClient'
import { useProduct } from './useProduct'

export function useHomeData() {
  const { loadProducts, products, listLoading: productsLoading } = useProduct()

  const pageConfig = ref<any>(null)
  const pending = ref(false)
  const error = ref<any>(null)

  async function fetchHomeData() {
    pending.value = true
    error.value = null

    try {
      // Parallel fetch for better performance
      const [configRes] = await Promise.all([
        templateApiClient.getTemplateConfig('index'),
        loadProducts({
          page: '1',
          pageSize: '20',
          item_type: 'normal',
          main_category: '0',
          is_tdk: '0',
          type: 'all'
        })
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

  // SSR Support
  const fetchWithSSR = () => {
    return useAsyncData('home-data', async () => {
      await fetchHomeData()
      return {
        pageConfig: pageConfig.value,
        products: products.value
      }
    })
  }

  return {
    pageConfig,
    products,
    pending: computed(() => pending.value || productsLoading.value),
    error,
    fetchHomeData,
    fetchWithSSR
  }
}
