import { MoneyValueObject } from '~/shared/value-objects'
import type { IApiTrackerPullTrace } from '~/types/api/order'
import { CouponDisplayTransformer, type ICouponModel } from './couponDisplayTransformer'

/**
 * 订单数据转换器
 *
 * 职责：
 * - API 数据 → 应用模型转换
 * - 数据验证和清洗
 * - 提供默认值处理
 */

export interface ICheckoutItem {
  id: string
  productId: string
  productName: string
  productImage: string
  specName: string
  skuNo: string
  style: string
  size: string
  quantity: number
  price: number
  subtotal: number
  subtotalDisplay: string
}

export interface IOrderCalculateModel {
  items: ICheckoutItem[]
  itemFee: number
  itemFeeNew: number
  marketFee: number
  totalItemNum: number
  memberDiscount: number
  couponDiscount: number
  discountFee: number
  promotionDiscount: number
  freightFee: number
  freightType: string
  freightPoint: number
  couponInfo?: {
    id: string
    couponCode: string
    info: string
    discountFee: number
  }
  totalFee: number
  invoiceStatus: number
  point: number
  pointUse: number
  pointFee: number
  userPoint: number
  maxPoint: number
  isOpenDeductPoint: boolean
  deductPointRule: any
  realUsePoint: number
  extraTips?: string
  deliveryTimeList?: string[]
  isRequireSubdistrict: boolean
  isRequireBuilding: boolean
}

export interface IAddressModel {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
  fullAddress: string
}

export class OrderTransformer {
  private static extractSkuFields(apiItem: any) {
    const direct = {
      skuNo: String(apiItem.sku_no ?? apiItem.item_no ?? ''),
      style: String(apiItem.spec_style ?? apiItem.style ?? ''),
      size: String(apiItem.spec_size ?? apiItem.size ?? ''),
    }
    if (direct.skuNo || direct.style || direct.size) return direct

    const raw = apiItem.item_spec_desc ?? apiItem.spec_name ?? apiItem.spec_info ?? ''
    if (!raw) return direct

    let text = ''
    let parsed: any = null

    if (typeof raw === 'string') {
      text = raw
      try {
        parsed = JSON.parse(raw)
      } catch {
        parsed = null
      }
    } else if (typeof raw === 'object') {
      parsed = raw
      text = JSON.stringify(raw)
    }

    const result = { ...direct }

    if (parsed && typeof parsed === 'object') {
      const assignByKey = (key: string, val: unknown) => {
        const value = typeof val === 'string' ? val : ''
        if (!value) return
        if (key.includes('款号') || key.toLowerCase().includes('sku'))
          result.skuNo = result.skuNo || value
        if (key.includes('款式') || key.toLowerCase().includes('style'))
          result.style = result.style || value
        if (key.includes('尺寸') || key.toLowerCase().includes('size'))
          result.size = result.size || value
      }

      Object.entries(parsed).forEach(([k, v]) => {
        if (typeof v === 'string') {
          assignByKey(k, v)
          return
        }
        if (v && typeof v === 'object') {
          const value = (v as any).spec_value ?? (v as any).value ?? (v as any).name ?? ''
          const label = (v as any).spec_name ?? k
          assignByKey(String(label), value)
        }
      })
    }

    const match = (label: '款号' | '款式' | '尺寸') =>
      text.match(new RegExp(`${label}\\s*[:：]\\s*([^,，;；|/]+)`))

    result.skuNo = result.skuNo || match('款号')?.[1]?.trim() || ''
    result.style = result.style || match('款式')?.[1]?.trim() || ''
    result.size = result.size || match('尺寸')?.[1]?.trim() || ''

    return result
  }

  private static resolveItemQuantity(apiItem: any): number {
    const rawQuantity =
      apiItem.quantity ??
      apiItem.num ??
      apiItem.buy_num ??
      apiItem.goods_num ??
      apiItem.item_num ??
      apiItem.product_num ??
      0

    return Number(rawQuantity || 0)
  }

  /**
   * 转换结算商品项
   */
  static toCheckoutItemModel(apiItem: any): ICheckoutItem {
    const price = Number(apiItem.price || 0) / 100 // 分转元
    const quantity = OrderTransformer.resolveItemQuantity(apiItem)
    const subtotal = price * quantity
    const skuFields = OrderTransformer.extractSkuFields(apiItem)

    return {
      id: String(apiItem.item_id || ''),
      productId: String(apiItem.item_id || ''),
      productName: apiItem.item_name || apiItem.title || '',
      productImage: apiItem.item_image || apiItem.pic || '',
      specName: apiItem.spec_name || apiItem.item_spec_desc || apiItem.spec_info || '',
      skuNo: skuFields.skuNo,
      style: skuFields.style,
      size: skuFields.size,
      quantity,
      price,
      subtotal,
      subtotalDisplay: MoneyValueObject.of(subtotal).display,
    }
  }

  /**
   * 计算订单金额响应 → 应用模型
   */
  static toCalculateModel(response: any): IOrderCalculateModel {
    return {
      items: (response.items || []).map(OrderTransformer.toCheckoutItemModel),
      itemFee: Number(response.item_fee || 0) / 100, // 分转元
      itemFeeNew: Number(response.item_fee_new || 0) / 100,
      marketFee: Number(response.market_fee || 0) / 100,
      totalItemNum: Number(response.totalItemNum || 0),
      memberDiscount: Number(response.member_discount || 0) / 100,
      couponDiscount: Number(response.coupon_discount || 0) / 100,
      discountFee: Number(response.discount_fee || 0) / 100,
      promotionDiscount: Number(response.promotion_discount || 0) / 100,
      freightFee: Number(response.freight_fee || 0) / 100,
      freightType: response.freight_type || '',
      freightPoint: Number(response.freight_point || 0),
      couponInfo: response.coupon_info
        ? {
            id: response.coupon_info.id || '',
            couponCode: response.coupon_info.coupon_code || '',
            info: response.coupon_info.info || '',
            discountFee: Number(response.coupon_info.discount_fee || 0) / 100,
          }
        : undefined,
      totalFee: Number(response.total_fee || 0) / 100,
      invoiceStatus: Number(response.invoice_status || 0),
      point: Number(response.point || 0),
      pointUse: Number(response.point_use || 0),
      pointFee: Number(response.point_fee || 0) / 100,
      userPoint: Number(response.user_point || 0),
      maxPoint: Number(response.max_point || 0),
      isOpenDeductPoint: Boolean(response.is_open_deduct_point),
      deductPointRule: response.deduct_point_rule || {},
      realUsePoint: Number(response.real_use_point || 0),
      extraTips: response.extraTips,
      deliveryTimeList: response.deliveryTimeList || [],
      isRequireSubdistrict: Boolean(response.is_require_subdistrict),
      isRequireBuilding: Boolean(response.is_require_building),
    }
  }

  /**
   * 地址列表响应 → 应用模型列表
   */
  static toAddressModelList(response: any): IAddressModel[] {
    const list = response?.list || []
    return list.map((item: any) => {
      const fullAddress = [item.province, item.city, item.county, item.adrdetail]
        .filter(Boolean)
        .join(' ')

      return {
        id: String(item.address_id || ''),
        name: item.username || '',
        phone: item.telephone || '',
        province: item.province || '',
        city: item.city || '',
        district: item.county || '',
        detail: item.adrdetail || '',
        isDefault: Number(item.is_def || 0) === 1,
        fullAddress,
      }
    })
  }

  /**
   * 优惠券列表响应 → 应用模型列表
   */
  static toCouponModelList(response: any): ICouponModel[] {
    const list = response?.list || []
    return list.map((item: any) => CouponDisplayTransformer.toCouponModel(item))
  }

  /**
   * 获取订单状态文本
   */
  static getOrderStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      pending_payment: '3803dc9a.818d78',
      pending_shipment: '3803dc9a.d8476e',
      shipped: '3803dc9a.4933ca',
      completed: '3803dc9a.fad522',
      cancelled: '3803dc9a.2111cc',
      pending_pickup: '3803dc9a.25d532',
      after_sales: '3803dc9a.a19124',
      pending_review: '3803dc9a.a48b28',
    }
    return statusMap[status] || status
  }

  /**
   * 转换订单商品项（含款号/款式/尺寸，用于订单列表与 Figma 对齐）
   */
  static toOrderItemModel(apiItem: any) {
    const price = Number(apiItem.price || 0) / 100 // 分转元
    const quantity = OrderTransformer.resolveItemQuantity(apiItem)
    const leftAftersalesNum = Number(apiItem.left_aftersales_num ?? quantity)

    return {
      detailId: String(apiItem.id || apiItem.item_id || ''),
      itemId: String(apiItem.item_id || ''),
      itemName: apiItem.item_name || apiItem.title || '',
      itemImage: apiItem.item_image || apiItem.item_pic || apiItem.pic || '',
      specName: apiItem.spec_name || apiItem.item_spec_desc || apiItem.spec_info || '',
      skuNo: apiItem.sku_no ?? apiItem.item_no ?? '',
      style: apiItem.spec_style ?? apiItem.style ?? '',
      size: apiItem.spec_size ?? apiItem.size ?? '',
      quantity,
      leftAftersalesNum,
      price,
      subtotal: price * quantity,
    }
  }

  /**
   * 转换订单
   */
  static toOrderModel(apiOrder: any) {
    // 基础信息转换
    const orderId = String(apiOrder.order_id || '')
    const orderTime = apiOrder.create_time || apiOrder.order_time || ''
    const totalAmount = Number(apiOrder.total_fee || apiOrder.total_amount || 0) / 100 // 分转元
    const items = (apiOrder.item_infos || apiOrder.items || []).map(
      OrderTransformer.toOrderItemModel
    )
    const orderLeftAftersalesNum = Number(apiOrder.left_aftersales_num ?? NaN)

    // 状态映射逻辑
    let status = apiOrder.status || '' // 兼容旧接口
    const deliveryStatus = String(apiOrder.delivery_status || '0')

    if (apiOrder.order_status) {
      // 详情接口：order_status 为大写字符串
      const orderStatusMap: Record<string, string> = {
        DONE: 'completed',
        NOTPAY: 'pending_payment',
        PAYED: 'pending_shipment',
        CANCEL: 'cancelled',
        WAIT_BUYER_CONFIRM: 'shipped',
        WAIT_GROUPS_SUCCESS: 'pending_payment',
        PART_PAYMENT: 'pending_payment',
      }
      status = orderStatusMap[apiOrder.order_status] || status

      if (status === 'pending_shipment') {
        if (['2', 'FINISHED', 'COMPLETED'].includes(deliveryStatus)) {
          status = 'completed'
        } else if (['1', 'DONE'].includes(deliveryStatus)) {
          status = 'shipped'
        }
      }
    } else if (apiOrder.pay_status !== undefined) {
      // 列表接口：组合状态字段（数值）
      const payStatus = String(apiOrder.pay_status)
      const cancelStatus = String(apiOrder.cancel_status || '0')

      if (cancelStatus !== '0') {
        status = 'cancelled'
      } else if (payStatus === '0') {
        status = 'pending_payment'
      } else if (deliveryStatus === '0') {
        status = 'pending_shipment'
      } else if (deliveryStatus === '1') {
        status = 'shipped'
      } else if (deliveryStatus === '2') {
        status = 'completed'
      }
    }

    const canApplyAftersales = Number.isFinite(orderLeftAftersalesNum)
      ? orderLeftAftersalesNum > 0
      : items.some((item: any) => item.leftAftersalesNum > 0)

    return {
      orderId,
      orderTime,
      status,
      statusText: OrderTransformer.getOrderStatusText(status),
      items,
      totalAmount,
      shippingAddress: apiOrder.shipping_address,
      // 根据订单状态判断可执行的操作
      canCancel: ['pending_payment', 'pending_shipment', 'shipped'].includes(status),
      canPay: status === 'pending_payment',
      canConfirmReceipt: status === 'shipped',
      canInvoice: ['pending_shipment', 'shipped'].includes(status),
      canViewLogistics: ['shipped', 'completed'].includes(status),
      canApplyAftersales: ['shipped', 'completed'].includes(status) && canApplyAftersales,
      canReview: status === 'pending_review',
    }
  }

  /**
   * 格式化金额（分 → 元字符串）
   */
  private static formatFen(fen: number): string {
    return (Number(fen || 0) / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  /**
   * 转换物流轨迹
   */
  static toLogisticsTraces(raw: any): Array<{ time: string; content: string }> {
    return (raw.logistics_traces ?? []).map((t: any) => ({
      time: String(t.time || ''),
      content: String(t.content || ''),
    }))
  }

  /**
   * 转换物流查询接口返回的轨迹列表
   */
  static toTrackerPullTraces(raw: any): Array<{ time: string; content: string }> {
    const traces = raw?.data ?? raw ?? []
    return (Array.isArray(traces) ? traces : []).map((trace: IApiTrackerPullTrace) => ({
      time: String(trace?.AcceptTime || ''),
      content: String(trace?.AcceptStation || ''),
    }))
  }

  /**
   * 转换订单详情
   */
  static toOrderDetailModel(raw: any) {
    const base = OrderTransformer.toOrderModel(raw)

    const shippingMethodMap: Record<string, string> = {
      express: '3803dc9a.790974',
      logistics: '3803dc9a.790974',
      ziti: '3803dc9a.7f549e',
      merchant: '3803dc9a.0bb9f8',
    }

    const invoiceTypeMap: Record<string, string> = {
      normal: '3803dc9a.8e839e',
      electronic: '3803dc9a.ac84ee',
      no: '3803dc9a.84754e',
    }

    return {
      ...base,
      receiverName: raw.receiver_name ?? '',
      receiverMobile: raw.receiver_mobile ?? '',
      shippingAddress:
        raw.shipping_address ??
        [raw.receiver_state, raw.receiver_city, raw.receiver_district, raw.receiver_address]
          .filter(Boolean)
          .join(' '),
      itemFee: OrderTransformer.formatFen(raw.item_fee ?? 0),
      freightFee: OrderTransformer.formatFen(raw.freight_fee ?? 0),
      discountFee: OrderTransformer.formatFen(raw.discount_fee ?? 0),
      pointFee: OrderTransformer.formatFen(raw.point_fee ?? 0),
      totalFee: OrderTransformer.formatFen(Number(raw.total_fee || raw.total_amount || 0)),
      logisticsNo: raw.logistics_no ?? raw.delivery_code ?? '',
      logisticsCompany: raw.logistics_company ?? raw.delivery_corp ?? '',
      logisticsTraces: OrderTransformer.toLogisticsTraces(raw),
      payTime: raw.pay_time ? String(raw.pay_time) : '',
      shippingMethod: shippingMethodMap[raw.receipt_type ?? ''] || raw.receipt_type || '',
      invoiceInfo: invoiceTypeMap[raw.invoice_type ?? ''] || raw.invoice_info || '',
      storeName: raw.distributor_name || raw.store_name || raw.shop_name || '',
    }
  }

  /**
   * 批量转换订单列表
   */
  static toOrderListModel(response: any) {
    const data = response?.data || response
    const pager = data?.pager || response?.pager || {}
    const orders = data?.list || data?.orders || []
    return {
      orders: orders.map(OrderTransformer.toOrderModel),
      total: Number((pager?.count ?? data?.total_count ?? data?.total) || 0),
      page: Number((pager?.page_no ?? data?.page ?? data?.current_page) || 1),
      pageSize: Number((pager?.page_size ?? data?.pageSize ?? data?.page_size) || 10),
    }
  }
}
