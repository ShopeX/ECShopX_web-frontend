export interface PaymentMethodIconConfig {
  src: string
  alt: string
  wrapperClass: string
  imageClass: string
}

export const PAYMENT_METHOD_ICON_MAP: Record<string, PaymentMethodIconConfig> = {
  wxpaypc: {
    src: '/images/payment/wechat-pay.svg',
    alt: '微信支付图标',
    wrapperClass: 'size-[24px]',
    imageClass: 'size-full',
  },
  alipay: {
    src: '/images/payment/alipay.svg',
    alt: '支付宝图标',
    wrapperClass: 'size-[24px]',
    imageClass: 'size-full',
  },
  unionpay: {
    src: '/images/payment/bank-transfer.svg',
    alt: '银行转账图标',
    wrapperClass: 'relative size-[24px]',
    imageClass:
      'absolute left-1/2 top-1/2 h-[12px] w-[24px] -translate-x-1/2 -translate-y-1/2',
  },
}

export function resolvePaymentMethodIcon(code?: string | null): PaymentMethodIconConfig | null {
  if (!code) return null
  return PAYMENT_METHOD_ICON_MAP[code] ?? null
}
