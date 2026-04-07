import { computed, ref } from 'vue'
import { aftersalesApiClient } from '~/infrastructure/http/clients/AftersalesApiClient'
import { AftersalesTransformer } from '~/infrastructure/transformers/aftersalesTransformer'

export function useAftersalesDetail() {
  const route = useRoute()
  const toast = useToastMessage()
  const { t } = useI18n()

  const detail = ref<any | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const aftersalesId = computed(() => String(route.params.id || ''))
  const itemId = computed(() => String(route.query.itemId || ''))

  async function fetchAftersalesDetail() {
    if (!aftersalesId.value || !itemId.value) {
      error.value = t('account.aftersalesLoadFailed')
      toast.show(error.value)
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await aftersalesApiClient.getAftersalesDetail({
        aftersales_bn: aftersalesId.value,
        item_id: itemId.value,
      })
      const record = response?.data || response
      detail.value = AftersalesTransformer.toAftersalesDetailModel(record)
    } catch (err: any) {
      error.value = err.message || t('account.aftersalesLoadFailed')
      toast.show(error.value || t('account.aftersalesLoadFailed'))
    } finally {
      loading.value = false
    }
  }

  async function cancelAftersales() {
    if (!aftersalesId.value || !itemId.value) return false

    try {
      await aftersalesApiClient.cancelAftersales(aftersalesId.value, itemId.value)
      toast.show(t('de8076e6.afad1e') || '撤销成功')
      await fetchAftersalesDetail()
      return true
    } catch (err: any) {
      toast.show(err.message || '撤销失败')
      return false
    }
  }

  return {
    detail,
    loading,
    error,
    aftersalesId,
    itemId,
    fetchAftersalesDetail,
    cancelAftersales,
  }
}
