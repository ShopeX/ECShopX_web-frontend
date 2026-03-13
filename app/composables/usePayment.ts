/**
 * 支付页 Composable
 *
 * 职责：
 * - 加载支付方式列表、订单信息
 * - 去支付：获取支付码并展示
 * - 轮询支付结果，成功/失败/超时态与重试/返回
 *
 * 接口对接以 .f2e-ai/requirements/20260309-ECX-8078/api-notes.md 为准。
 */

import { ref, computed, watch, onUnmounted } from 'vue'
import { paymentApiClient } from '~/infrastructure/http/clients'
import type { IPaymentMethodItem } from '~/infrastructure/http/clients/PaymentApiClient'

/** 支付方式项在页面中的展示形态（code/name 兼容模板） */
export type PaymentMethodView = IPaymentMethodItem & { code: string; name: string }

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 5 * 60 * 1000
const COUNTDOWN_DEFAULT_MS = 30 * 60 * 1000

function getReturnUrl(): string {
  if (import.meta.client && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00 : 00 : 00'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(' : ')
}

export function usePayment(orderIdRef: Ref<string | undefined>) {
  const { t } = useI18n()
  const orderIdValue = computed(() => {
    const v = orderIdRef.value
    return Array.isArray(v) ? v[0] : v
  })

  const paymentMethods = ref<PaymentMethodView[]>([])
  const selectedPayType = ref<string>('')
  const orderInfo = ref<{
    total_fee?: string
    payStatus?: string
    orderInfo?: { auto_cancel_time?: string; auto_cancel_seconds?: number; [key: string]: any }
    [key: string]: any
  } | null>(null)
  const paymentCode = ref<string>('')
  const loading = ref(false)
  const loadingMethods = ref(false)
  const loadingOrder = ref(false)
  const error = ref<string | null>(null)
  const payResult = ref<'idle' | 'pending' | 'success' | 'fail' | 'timeout'>('idle')
  const pollTimer = ref<ReturnType<typeof setInterval> | null>(null)
  const countdownEndAt = ref<number>(0)
  const countdownTick = ref(0)

  const hasOrderId = computed(() => !!orderIdValue.value)
  const canPay = computed(
    () => !!selectedPayType.value && payResult.value === 'idle' && !loading.value
  )
  const showQrcode = computed(
    () => !!paymentCode.value && ['pending', 'idle'].includes(payResult.value)
  )

  /** 订单金额展示（元），如 10500.00；接口返回 total_fee 为 string，单位以后端为准 */
  const orderAmountDisplay = computed(() => {
    const fee = orderInfo.value?.total_fee ?? orderInfo.value?.orderInfo?.total_fee
    if (fee == null || fee === '') return ''
    const num = Number(fee)
    return num >= 100 ? (num / 100).toFixed(2) : num.toFixed(2)
  })

  /** 订单金额带千分位与货币符号，如 ¥ 10,500.00 */
  const orderAmountFormatted = computed(() => {
    const raw = orderAmountDisplay.value
    if (!raw) return '¥ 0.00'
    const num = parseFloat(raw)
    return `¥ ${num.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
  })

  /** 剩余支付时间文案，设计稿格式 00 : 28 : 42（依赖 countdownTick 每秒更新） */
  const remainingTimeText = computed(() => {
    void countdownTick.value
    if (countdownEndAt.value <= 0) return '00 : 00 : 00'
    return formatCountdown(Math.max(0, countdownEndAt.value - Date.now()))
  })

  /** 当前选中的支付方式名称（用于支付码区域标题）；API 为 pay_type_name，映射为 name */
  const selectedMethodName = computed(() => {
    const code = selectedPayType.value
    const m = paymentMethods.value.find((x) => (x.code ?? x.pay_type_code) === code)
    return m?.name ?? m?.pay_type_name ?? code ?? ''
  })

  async function loadPaymentMethods() {
    if (!orderIdValue.value) return
    loadingMethods.value = true
    error.value = null
    try {
      const res = await paymentApiClient.getPaymentMethodList({ platform: 'pc' })
      // HTTP 插件在 onResponse 中已解包一层 data，故 res 可能直接为数组；兼容 res.data 为数组的原始结构
      const list = Array.isArray(res) ? res : (res?.data ?? [])
      const items = Array.isArray(list) ? list : []
      paymentMethods.value = items.map((x: IPaymentMethodItem) => ({
        ...x,
        code: x.pay_type_code,
        name: x.pay_type_name,
      }))
      if (paymentMethods.value.length > 0 && !selectedPayType.value) {
        const first = paymentMethods.value[0]
        if (first) selectedPayType.value = first.pay_type_code
      }
    } catch (e: any) {
      error.value = e?.message ?? t('9233eff9.f7af5c')
    } finally {
      loadingMethods.value = false
    }
  }

  async function loadOrderInfo() {
    const id = orderIdValue.value
    if (!id) return
    loadingOrder.value = true
    error.value = null
    const payType = (selectedPayType.value || paymentMethods.value[0]?.pay_type_code) ?? ''
    try {
      const res = await paymentApiClient.getOrderInfo(id, { pay_type: payType })
      orderInfo.value = res?.data ?? null
    } catch (e: any) {
      error.value = e?.message ?? t('9233eff9.6331d2')
    } finally {
      loadingOrder.value = false
    }
  }

  function stopPolling() {
    if (pollTimer.value) {
      clearInterval(pollTimer.value)
      pollTimer.value = null
    }
  }

  async function checkPaymentResult(): Promise<boolean> {
    const id = orderIdValue.value
    if (!id) return false
    const payType = (selectedPayType.value || paymentMethods.value[0]?.pay_type_code) ?? ''
    try {
      const res = await paymentApiClient.getOrderInfo(id, { pay_type: payType })
      const data = res?.data
      const status = data?.payStatus ?? data?.orderInfo?.order_status ?? ''
      if (status && status !== 'pending_payment') {
        payResult.value = 'success'
        stopPolling()
        return true
      }
    } catch {
      // 单次轮询失败不改变状态，继续轮询
    }
    return false
  }

  function startPolling() {
    stopPolling()
    const startedAt = Date.now()
    pollTimer.value = setInterval(async () => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        payResult.value = 'timeout'
        stopPolling()
        return
      }
      await checkPaymentResult()
    }, POLL_INTERVAL_MS)
  }

  async function payNow() {
    const id = orderIdValue.value
    if (!id || !selectedPayType.value) return
    loading.value = true
    error.value = null
    payResult.value = 'pending'
    paymentCode.value = ''
    try {
      const res = await paymentApiClient.getOrderPaymentInfo({
        order_id: id,
        pay_type: selectedPayType.value,
        return_url: getReturnUrl(),
        pay_channel: selectedPayType.value,
      })
      const code = res?.data?.code_url ?? ''
      paymentCode.value = code || ''
      if (paymentCode.value) {
        startPolling()
      } else {
        payResult.value = 'fail'
        error.value = t('9233eff9.874265')
      }
    } catch (e: any) {
      payResult.value = 'fail'
      error.value = e?.message ?? t('9233eff9.bd87f5')
    } finally {
      loading.value = false
    }
  }

  function retry() {
    error.value = null
    payResult.value = 'idle'
    paymentCode.value = ''
    payNow()
  }

  watch(
    orderIdValue,
    (id) => {
      if (id) {
        loadPaymentMethods()
        loadOrderInfo()
      } else {
        paymentMethods.value = []
        orderInfo.value = null
        paymentCode.value = ''
        payResult.value = 'idle'
        countdownEndAt.value = 0
        stopPolling()
      }
    },
    { immediate: true }
  )

  watch(orderInfo, (info) => {
    if (info && payResult.value === 'idle') {
      const orderInfoNested = info.orderInfo
      const seconds = orderInfoNested?.auto_cancel_seconds
      const timeStr = orderInfoNested?.auto_cancel_time ?? info.pay_deadline_time
      if (typeof seconds === 'number' && seconds > 0) {
        countdownEndAt.value = Date.now() + seconds * 1000
      } else if (timeStr) {
        const t = typeof timeStr === 'number' ? timeStr : new Date(timeStr).getTime()
        if (!Number.isNaN(t)) countdownEndAt.value = t
      }
      if (countdownEndAt.value <= 0) {
        countdownEndAt.value = Date.now() + COUNTDOWN_DEFAULT_MS
      }
    }
  })

  const countdownInterval = ref<ReturnType<typeof setInterval> | null>(null)
  watch(countdownEndAt, (end) => {
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value)
      countdownInterval.value = null
    }
    if (end > Date.now()) {
      countdownTick.value = 0
      countdownInterval.value = setInterval(() => {
        countdownTick.value += 1000
        if (Date.now() >= countdownEndAt.value && countdownInterval.value) {
          clearInterval(countdownInterval.value)
          countdownInterval.value = null
        }
      }, 1000)
    }
  })

  onUnmounted(() => {
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value)
    }
  })

  return {
    orderIdValue,
    paymentMethods,
    selectedPayType,
    orderInfo,
    paymentCode,
    loading,
    loadingMethods,
    loadingOrder,
    error,
    payResult,
    hasOrderId,
    canPay,
    showQrcode,
    orderAmountDisplay,
    orderAmountFormatted,
    remainingTimeText,
    selectedMethodName,
    loadPaymentMethods,
    loadOrderInfo,
    payNow,
    retry,
    stopPolling,
  }
}
