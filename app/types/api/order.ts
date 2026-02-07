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
}

/**
 * 订单商品项(API 响应)
 */
export interface IApiOrderItem {
  item_id: string
  item_name: string
  item_image: string
  spec_name: string
  quantity: number
  price: number // 单位:分
}

/**
 * 订单(API 响应)
 */
export interface IApiOrder {
  order_id: string
  order_time: string
  status: string
  items: IApiOrderItem[]
  total_amount: number // 单位:分
  shipping_address?: string
}

/**
 * 订单列表请求参数
 */
export interface IOrderListRequest {
  status?: OrderStatus
  page?: number
  page_size?: number
}

/**
 * 订单列表响应
 */
export interface IOrderListResponse {
  orders: IApiOrder[]
  total: number
  page: number
  page_size: number
}
