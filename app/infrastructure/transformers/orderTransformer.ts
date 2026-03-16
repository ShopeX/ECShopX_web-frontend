import { MoneyValueObject } from '~/shared/value-objects'

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

export interface ICouponModel {
  id: string
  couponCode: string
  title: string
  discount: number
  minFee: number
  expireTime?: string
}

export class OrderTransformer {
  /**
   * 转换结算商品项
   */
  static toCheckoutItemModel(apiItem: any): ICheckoutItem {
    const price = Number(apiItem.price || 0) / 100 // 分转元
    const quantity = Number(apiItem.quantity || 0)
    const subtotal = price * quantity

    return {
      id: String(apiItem.item_id || ''),
      productId: String(apiItem.item_id || ''),
      productName: apiItem.item_name || apiItem.title || '',
      productImage: apiItem.item_image || apiItem.pic || '',
      specName: apiItem.spec_name || apiItem.spec_info || '',
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
    return list.map((item: any) => ({
      id: String(item.id || ''),
      couponCode: item.coupon_code || '',
      title: item.title || '',
      discount: Number(item.discount || 0) / 100, // 分转元
      minFee: Number(item.min_fee || 0) / 100,
      expireTime: item.expire_time,
    }))
  }

  /**
   * 获取订单状态文本
   */
  static getOrderStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      pending_payment: '待付款',
      pending_shipment: '待发货',
      shipped: '待收货',
      completed: '已完成',
      cancelled: '已取消',
      pending_pickup: '待自提',
      after_sales: '售后中',
      pending_review: '待评价',
    }
    return statusMap[status] || status
  }

  /**
   * 转换订单商品项（含款号/款式/尺寸，用于订单列表与 Figma 对齐）
   */
  static toOrderItemModel(apiItem: any) {
    const price = Number(apiItem.price || 0) / 100 // 分转元
    return {
      itemId: String(apiItem.item_id || ''),
      itemName: apiItem.item_name || apiItem.title || '',
      itemImage: apiItem.item_image || apiItem.item_pic || apiItem.pic || '',
      specName: apiItem.spec_name || apiItem.spec_info || '',
      skuNo: apiItem.sku_no ?? apiItem.item_no ?? '',
      style: apiItem.spec_style ?? apiItem.style ?? '',
      size: apiItem.spec_size ?? apiItem.size ?? '',
      quantity: Number(apiItem.quantity || 0),
      price,
      subtotal: price * Number(apiItem.quantity || 0),
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
    const items = (apiOrder.item_infos || apiOrder.items || []).map(OrderTransformer.toOrderItemModel)

    // 状态映射逻辑
    let status = apiOrder.status || '' // 兼容旧接口
    
    // 如果有组合状态字段，进行逻辑映射
    if (apiOrder.pay_status !== undefined) {
      const payStatus = String(apiOrder.pay_status)
      const deliveryStatus = String(apiOrder.delivery_status || '0')
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

    return {
      orderId,
      orderTime,
      status,
      statusText: OrderTransformer.getOrderStatusText(status),
      items,
      totalAmount,
      shippingAddress: apiOrder.shipping_address,
      // 根据订单状态判断可执行的操作
      canCancel: status === 'pending_payment',
      canPay: status === 'pending_payment',
      canConfirmReceipt: status === 'shipped',
      canDelete: status === 'cancelled',
      canApplyAftersales: ['pending_shipment', 'shipped', 'completed'].includes(status),
    }
  }

  /**
   * 批量转换订单列表
   */
  static toOrderListModel(response: any) {
    const data = response?.data || response
    const orders = data?.list || data?.orders || []
    return {
      orders: orders.map(OrderTransformer.toOrderModel),
      total: Number(data?.total_count || data?.total || 0),
      page: Number(data?.page || 1),
      pageSize: Number(data?.pageSize || data?.page_size || 10),
    }
  }
}
