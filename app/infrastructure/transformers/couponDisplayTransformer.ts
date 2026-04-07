import { DiscountValueObject } from '~/shared/value-objects'

export type CouponCardType = 'discount' | 'cash' | 'gift'

export interface ICouponModel {
  id: string
  couponCode: string
  code: string
  cardType: CouponCardType
  typeLabel: string
  title: string
  displayValue: string
  displayPrefix?: string
  displaySuffix?: string
  amount: number
  minFee: number
  usageTimeText: string
  ruleText: string
  usable: boolean
}

const USE_BOUND_TEXT_MAP: Record<string, string> = {
  '0': '全部商品使用',
  '1': '指定商品可用',
  '2': '指定分类可用',
  '3': '指定商品标签可用',
  '4': '指定商品品牌可用',
}

function parseMoneyFromCent(value: unknown): number {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? amount / 100 : 0
}

function normalizeDate(value: unknown): string {
  if (!value) return ''
  return String(value).split(' ')[0] || ''
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return value
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1')
}

function isSerializedBackendText(value: string): boolean {
  const text = value.trim()
  if (!text) return false

  return /^(?:a|s|i|b|d|O|C):\d+:/i.test(text)
}

function normalizeScopeCopy(value: string, minFee: number): string {
  const text = value.trim()
  if (!text) return ''

  if (isSerializedBackendText(text)) {
    return ''
  }

  if (text.includes('无门槛')) {
    return '全场无门槛使用'
  }

  if (minFee <= 0 && (text === '全场可用' || text === '全部商品使用' || text === '全部商品可用')) {
    return '全场无门槛使用'
  }

  if (text === '全场可用' || text === '全部商品可用') {
    return '全部商品使用'
  }

  return text
}

function normalizeCardType(value: unknown): CouponCardType {
  const cardType = String(value || '').toLowerCase()

  if (cardType === 'discount') return 'discount'
  if (cardType === 'gift' || cardType === 'new_gift') return 'gift'
  return 'cash'
}

function resolveUsageTimeText(item: any): string {
  const beginDate = normalizeDate(item.begin_date || item.start_time || item.begin_time)
  const endDate = normalizeDate(item.end_date || item.expire_time || item.end_time)

  if (beginDate && endDate) {
    return `${beginDate} - ${endDate}`
  }

  if (endDate) {
    return `至 ${endDate}`
  }

  if (beginDate) {
    return `${beginDate} 起`
  }

  return '长期有效'
}

function resolveRuleText(item: any, minFee: number, cardType: CouponCardType): string {
  const applyScope = normalizeScopeCopy(String(item.apply_scope ?? '').trim(), minFee)
  if (applyScope) return applyScope

  const useCondition = normalizeScopeCopy(String(item.use_condition ?? '').trim(), minFee)
  if (useCondition) return useCondition

  const description = normalizeScopeCopy(String(item.description ?? item.desc ?? '').trim(), minFee)
  if (description) return description

  const useBound = String(item.use_bound ?? '').trim()
  if (USE_BOUND_TEXT_MAP[useBound]) {
    return minFee <= 0
      ? normalizeScopeCopy(USE_BOUND_TEXT_MAP[useBound], minFee)
      : USE_BOUND_TEXT_MAP[useBound]
  }

  if (cardType === 'gift' && minFee > 0) {
    return `满${formatNumber(minFee)}可兑换`
  }

  if (minFee > 0) {
    return `满${formatNumber(minFee)}可用`
  }

  return '全场无门槛使用'
}

function resolveTitle(item: any, cardType: CouponCardType, amount: number, minFee: number): string {
  const title = String(item.title || item.name || '').trim()
  if (title) return title

  if (cardType === 'discount') {
    return `${resolveDiscountDisplayValue(item)}折优惠券`
  }

  if (cardType === 'gift') {
    return '兑换券'
  }

  if (minFee > 0) {
    return `满${formatNumber(minFee)}减${formatNumber(amount)}`
  }

  return `减${formatNumber(amount)}`
}

function resolveDiscountDisplayValue(item: any): string {
  const rawDiscount = Number(item.discount ?? item.coupon?.discount ?? 0)
  if (!Number.isFinite(rawDiscount) || rawDiscount <= 0) {
    return '0'
  }

  const discountValue =
    rawDiscount <= 1
      ? DiscountValueObject.fromDecimal(rawDiscount)
      : DiscountValueObject.of(rawDiscount)

  return formatNumber(Number(discountValue.displayChinese.replace(/折$/, '')))
}

function resolveDisplay(cardType: CouponCardType, item: any, amount: number) {
  if (cardType === 'discount') {
    return {
      displayValue: resolveDiscountDisplayValue(item),
      displayPrefix: '',
      displaySuffix: '折',
      typeLabel: '折扣券',
    }
  }

  if (cardType === 'gift') {
    return {
      displayValue: '兑换券',
      displayPrefix: '',
      displaySuffix: '',
      typeLabel: '兑换券',
    }
  }

  return {
    displayValue: formatNumber(amount),
    displayPrefix: '¥',
    displaySuffix: '',
    typeLabel: '满减券',
  }
}

function resolveUsable(item: any): boolean {
  if (item.status !== undefined && item.status !== null && String(item.status) !== '') {
    return String(item.status) === '1'
  }

  if (item.valid !== undefined && item.valid !== null && String(item.valid) !== '') {
    return String(item.valid) === 'true' || item.valid === true
  }

  return true
}

export class CouponDisplayTransformer {
  static toCouponModel(item: any): ICouponModel {
    const cardType = normalizeCardType(item.card_type || item.coupon?.card_type)
    const amount = parseMoneyFromCent(
      item.reduce_cost ?? item.discount ?? item.amount ?? item.deduct_money ?? item.price
    )
    const minFee = parseMoneyFromCent(item.least_cost ?? item.min_fee ?? item.min_charge)
    const usageTimeText = resolveUsageTimeText(item)
    const ruleText = resolveRuleText(item, minFee, cardType)
    const title = resolveTitle(item, cardType, amount, minFee)
    const display = resolveDisplay(cardType, item, amount)

    return {
      id: String(item.id || item.card_id || ''),
      couponCode: String(item.coupon_code || item.code || item.card_code || ''),
      code: String(item.code || item.coupon_code || item.card_code || ''),
      cardType,
      typeLabel: display.typeLabel,
      title,
      displayValue: display.displayValue,
      displayPrefix: display.displayPrefix,
      displaySuffix: display.displaySuffix,
      amount,
      minFee,
      usageTimeText,
      ruleText,
      usable: resolveUsable(item),
    }
  }
}
