/**
 * 订单相关 API 类型定义
 */

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  ALL = 'all', // 全部
  PENDING_PAYMENT = 'pending_payment', // 待付款
  PENDING_SHIPMENT = 'pending_shipment', // 待发货
  SHIPPED = 'shipped', // 待收货
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
  PENDING_PICKUP = 'pending_pickup', // 待自提
  AFTER_SALES = 'after_sales', // 售后
  PENDING_REVIEW = 'pending_review', // 待评价
}

/**
 * 订单商品项(API 响应)
 */
export interface IApiOrderItem {
  item_id: string
  item_name?: string
  title?: string
  item_image?: string
  item_pic?: string
  spec_name?: string
  quantity: number
  price: number // 单位:分
  [key: string]: any
}

/**
 * 订单(API 响应)
 */
export interface IApiOrder {
  order_id: string
  order_time?: string
  create_time?: string | number
  status?: string
  order_status?: string
  delivery_status?: string
  cancel_status?: string
  pay_status?: string
  total_amount?: number // 单位:分
  total_fee?: string | number
  receiver_name?: string
  receiver_mobile?: string
  shipping_address?: string
  items?: IApiOrderItem[]
  item_infos?: IApiOrderItem[]
  [key: string]: any
}

/**
 * 订单列表请求参数
 */
export interface IOrderListRequest {
  status?: string | number
  page?: number
  pageSize?: number
  order_id?: string
  mobile?: string
  time_start_begin?: string
  time_start_end?: string
  is_rate?: string
}

/**
 * 订单列表响应
 */
export interface IOrderListResponse {
  list: IApiOrder[]
  total_count?: number
  page?: number
  pageSize?: number
  [key: string]: any
}
