/**
 * 订单 HTTP 客户端
 * 
 * 职责：
 * - 封装订单相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 */

export interface ICalculateOrderRequest {
  distributor_id: string
  shop_id?: string
  cart_type: 'normal' | 'fastbuy'
  order_type?: string
  receipt_type: 'express' | 'ziti' | 'merchant'
  receiver_state?: string
  receiver_city?: string
  receiver_district?: string
  receiver_address?: string
  pickup_location?: string
  subdistrict_parent_id?: string
  subdistrict_id?: string
  not_use_coupon?: number
  coupon_discount?: string
  point_use?: number
  promotion?: string
  bargain_id?: string
  seckill_id?: string
  ticket?: string
  groups_activity_id?: string
  pay_type?: string
  isNostores?: number
}

export interface ICreateOrderRequest {
  distributor_id: string
  shop_id?: string
  cart_type: 'normal' | 'fastbuy' | 'cxd'
  order_type?: 'normal' | 'bargain' | 'seckill' | 'group' | 'normal_shopguide'
  receipt_type: 'express' | 'ziti' | 'merchant'
  pay_type: 'wxpay' | 'alipay' | 'deposit' | 'point' | 'wxpayjs' | 'alipayjs'
  receiver_name?: string
  receiver_mobile?: string
  receiver_state?: string
  receiver_city?: string
  receiver_district?: string
  receiver_address?: string
  receiver_zip?: string
  pickup_location?: string
  pickup_date?: string
  pickup_time?: string
  self_delivery_time?: string
  subdistrict_parent_id?: string
  subdistrict_id?: string
  building_number?: string
  house_number?: string
  not_use_coupon?: number
  coupon_discount?: string
  point_use?: number
  remark?: string
  invoice_type?: string
  invoice_content?: {
    title?: string
    content?: string
    company_address?: string
    registration_number?: string
    bankname?: string
    bankaccount?: string
    company_phone?: string
  }
  pack?: {
    packName?: string
    packDes?: string
  }
  bargain_id?: string
  seckill_id?: string
  ticket?: string
  groups_activity_id?: string
  salesman_id?: string
  work_userid?: string
  isNostores?: number
  promotion?: string
}

export class OrderApiClient {
  private $api: any

  constructor() {
    // 不在构造函数中初始化，延迟到第一次使用时
  }

  /**
   * 获取 HTTP 实例（延迟初始化，SSR 安全）
   */
  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * 计算订单金额
   * 
   * @param params - 计算订单金额的参数
   * @returns 原始 API 响应
   */
  async calculateOrder(params: ICalculateOrderRequest): Promise<any> {
    return this.http('/getFreightFee', {
      method: 'POST',
      body: params,
    })
  }

  /**
   * 创建订单
   * 
   * @param params - 创建订单的参数
   * @returns 原始 API 响应
   */
  async createOrder(params: ICreateOrderRequest): Promise<any> {
    return this.http('/order_new', {
      method: 'POST',
      body: params,
    })
  }
}

export const orderApiClient = new OrderApiClient()

