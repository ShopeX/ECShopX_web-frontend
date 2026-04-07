/**
 * 支付页 Composable
 *
 * 职责：
 * - 加载支付方式列表、订单信息
 * - 去支付：获取支付码并展示
 * - 轮询支付结果，成功/失败态与重试/返回
 *
 * 接口对接以 .f2e-ai/requirements/20260309-ECX-8078/api-notes.md 为准。
 */

import QRCode from 'qrcode'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { paymentApiClient } from '~/infrastructure/http/clients'
import type { IPaymentMethodItem } from '~/infrastructure/http/clients/PaymentApiClient'

/** 支付方式项在页面中的展示形态（code/name 兼容模板） */
export type PaymentMethodView = IPaymentMethodItem & { code: string; name: string }
export type PaymentClientPlatform = 'pc' | 'h5'
export type PaymentExecutionType =
  | 'qrcode'
  | 'alipay_form'
  | 'wechat_jsapi'
  | 'wechat_h5'
  | 'alipay_wap'

export interface PaymentClientRuntime {
  platform: PaymentClientPlatform
  isWechatBrowser: boolean
  isAlipayBrowser: boolean
}

const POLL_INTERVAL_MS = 5000
const POLL_TIMEOUT_MS = 60 * 1000
const COUNTDOWN_DEFAULT_MS = POLL_TIMEOUT_MS

function getReturnUrl(): string {
  if (import.meta.client && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

function isImageUrl(value: string) {
  return value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00 : 00 : 00'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(' : ')
}

function normalizePaymentStatus(status: unknown): string {
  return String(status ?? '')
    .trim()
    .toLowerCase()
}

function normalizePayType(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
}

function isWechatPayType(value: unknown) {
  const payType = normalizePayType(value)
  return payType.includes('wxpay') || payType.includes('wechat')
}

function isAlipayPayType(value: unknown) {
  const payType = normalizePayType(value)
  return payType.includes('alipay')
}

function isPaymentSuccessStatus(status: string) {
  return [
    '1',
    'paid',
    'payed',
    'payed_success',
    'success',
    'succeeded',
    'pending_shipment',
    'shipped',
    'completed',
    'done',
    'wait_buyer_confirm',
  ].includes(status)
}

export function resolvePaymentClientRuntime(
  userAgent: string,
  width: number
): PaymentClientRuntime {
  return {
    platform: width < 1024 ? 'h5' : 'pc',
    isWechatBrowser: /micromessenger/i.test(userAgent),
    isAlipayBrowser: /alipayclient/i.test(userAgent),
  }
}

export function resolvePaymentExecutionType({
  runtime,
  selectedPayType,
}: {
  runtime: PaymentClientRuntime
  selectedPayType: string
}): PaymentExecutionType {
  if (isWechatPayType(selectedPayType)) {
    if (runtime.platform === 'pc') {
      return 'qrcode'
    }
    if (runtime.isWechatBrowser) {
      return 'wechat_jsapi'
    }
    return 'wechat_h5'
  }

  if (isAlipayPayType(selectedPayType)) {
    if (runtime.platform === 'pc') {
      return 'alipay_form'
    }
    return 'alipay_wap'
  }

  return 'qrcode'
}

function getPaymentClientRuntime(): PaymentClientRuntime {
  if (import.meta.client && typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    return resolvePaymentClientRuntime(navigator.userAgent || '', window.innerWidth || 1024)
  }

  return {
    platform: 'pc',
    isWechatBrowser: false,
    isAlipayBrowser: false,
  }
}

function extractPaymentRedirectUrl(data: Record<string, any>): string {
  const candidates = [
    data?.mweb_url,
    data?.h5_url,
    data?.redirect_url,
    data?.pay_url,
    data?.code_url,
  ]
  return candidates.find((value) => typeof value === 'string' && /^https?:\/\//i.test(value)) || ''
}

function submitPaymentForm(payment: string, target: '_self' | '_blank' = '_self') {
  if (!import.meta.client || typeof document === 'undefined' || !payment) return false

  const container = document.createElement('div')
  container.style.display = 'none'
  container.innerHTML = payment
  const form = container.querySelector('form')

  if (!form) {
    return false
  }

  form.setAttribute('target', target)
  document.body.appendChild(container)
  ;(form as HTMLFormElement).submit()
  window.setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }, 1000)
  return true
}

function openPaymentUrl(url: string) {
  if (!import.meta.client || typeof window === 'undefined' || !url) return false
  window.location.assign(url)
  return true
}

function invokeWeChatJsapiPay(data: Record<string, any>): Promise<void> {
  if (!import.meta.client || typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('WeChat JSAPI is unavailable'))
  }

  return new Promise((resolve, reject) => {
    const invoke = () => {
      const bridge = (window as any).WeixinJSBridge
      if (!bridge?.invoke) {
        reject(new Error('WeChat JSAPI is unavailable'))
        return
      }

      bridge.invoke(
        'getBrandWCPayRequest',
        {
          appId: data?.appId,
          timeStamp: data?.timeStamp,
          nonceStr: data?.nonceStr,
          package: data?.package,
          signType: data?.signType,
          paySign: data?.paySign,
        },
        (result: any) => {
          const errMsg = String(result?.err_msg ?? '').toLowerCase()
          if (errMsg.includes('ok')) {
            resolve()
            return
          }
          reject(new Error(errMsg || 'WeChat JSAPI pay failed'))
        }
      )
    }

    if ((window as any).WeixinJSBridge?.invoke) {
      invoke()
      return
    }

    document.addEventListener('WeixinJSBridgeReady', invoke, { once: true })
  })
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
    total_amount?: string | number
    payStatus?: string
    orderInfo?: {
      total_fee?: string
      total_amount?: string | number
      auto_cancel_time?: string
      auto_cancel_seconds?: number
      [key: string]: any
    }
    [key: string]: any
  } | null>(null)
  const paymentCode = ref<string>('')
  const paymentCodeImage = ref<string>('')
  const loading = ref(false)
  const loadingMethods = ref(false)
  const loadingOrder = ref(false)
  const error = ref<string | null>(null)
  const payResult = ref<'idle' | 'pending' | 'success' | 'fail'>('idle')
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

  /** 订单金额展示（元）；支付接口字段 total_fee 单位固定为分 */
  const orderAmountDisplay = computed(() => {
    const fee =
      orderInfo.value?.total_fee ??
      orderInfo.value?.total_amount ??
      orderInfo.value?.orderInfo?.total_fee ??
      orderInfo.value?.orderInfo?.total_amount
    if (fee == null || fee === '') return ''
    const num = Number(fee)
    return (num / 100).toFixed(2)
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
      const runtime = getPaymentClientRuntime()
      const res = await paymentApiClient.getPaymentMethodList({ platform: runtime.platform })
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
      orderInfo.value = res?.data ?? res ?? null
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
      const data = res?.data ?? res
      const status = normalizePaymentStatus(data?.payStatus ?? data?.orderInfo?.order_status ?? '')
      if (isPaymentSuccessStatus(status)) {
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
        stopPolling()
        const hasPaid = await checkPaymentResult()
        if (!hasPaid) {
          payResult.value = 'fail'
          error.value = t('eab46cc2.201d09')
        }
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
    paymentCodeImage.value = ''
    try {
      const runtime = getPaymentClientRuntime()
      const res = await paymentApiClient.getOrderPaymentInfo({
        order_id: id,
        pay_type: selectedPayType.value,
        return_url: getReturnUrl(),
        pay_channel: selectedPayType.value,
      })
      const data = (res?.data ?? res ?? {}) as Record<string, any>
      const paymentForm = res?.payment ?? res?.data?.payment ?? ''
      const executionType = resolvePaymentExecutionType({
        runtime,
        selectedPayType: selectedPayType.value,
      })
      const code = res?.code_url ?? res?.data?.code_url ?? ''

      switch (executionType) {
        case 'qrcode':
          paymentCode.value = code || ''
          if (!paymentCode.value) {
            payResult.value = 'fail'
            error.value = t('9233eff9.874265')
            return
          }
          paymentCodeImage.value = isImageUrl(code)
            ? code
            : await QRCode.toDataURL(code, { width: 200, margin: 1 })
          countdownEndAt.value = Date.now() + COUNTDOWN_DEFAULT_MS
          startPolling()
          return
        case 'alipay_form':
          if (submitPaymentForm(paymentForm, '_blank')) {
            countdownEndAt.value = Date.now() + COUNTDOWN_DEFAULT_MS
            startPolling()
            return
          }
          break
        case 'wechat_jsapi':
          await invokeWeChatJsapiPay(data)
          countdownEndAt.value = Date.now() + COUNTDOWN_DEFAULT_MS
          startPolling()
          return
        case 'wechat_h5': {
          const paymentUrl = extractPaymentRedirectUrl(data)
          if (openPaymentUrl(paymentUrl)) {
            countdownEndAt.value = Date.now() + COUNTDOWN_DEFAULT_MS
            startPolling()
            return
          }
          break
        }
        case 'alipay_wap': {
          if (submitPaymentForm(paymentForm)) {
            countdownEndAt.value = Date.now() + COUNTDOWN_DEFAULT_MS
            startPolling()
            return
          }
          const paymentUrl = extractPaymentRedirectUrl(data)
          if (openPaymentUrl(paymentUrl)) {
            countdownEndAt.value = Date.now() + COUNTDOWN_DEFAULT_MS
            startPolling()
            return
          }
          break
        }
      }

      payResult.value = 'fail'
      error.value = t('9233eff9.874265')
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
    paymentCodeImage.value = ''
    countdownEndAt.value = 0
    stopPolling()
  }

  onMounted(() => {
    if (import.meta.client && orderIdValue.value) {
      loadPaymentMethods()
      loadOrderInfo()
    }
  })

  watch(orderIdValue, (id) => {
    if (!import.meta.client) return

    if (id) {
      loadPaymentMethods()
      loadOrderInfo()
    } else {
      paymentMethods.value = []
      orderInfo.value = null
      paymentCode.value = ''
      paymentCodeImage.value = ''
      payResult.value = 'idle'
      countdownEndAt.value = 0
      stopPolling()
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
    paymentCodeImage,
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
