/**
 * 购物车 API 类型定义
 * 
 * 基于 Apifox MCP 购物车 API 规范
 */

import type { IApiResponse } from './common'

/**
 * 购物车商品项接口
 */
export interface ICartItem {
  /** 购物车项 ID */
  id: string
  /** 商品 ID */
  product_id: string
  /** 商品名称 */
  product_name: string
  /** 商品图片 URL */
  product_image: string
  /** 商品规格描述 */
  spec?: string
  /** 规格 ID */
  spec_id?: string
  /** 单价(现价) */
  price: number
  /** 原价 */
  original_price?: number
  /** 数量 */
  quantity: number
  /** 库存 */
  stock: number
  /** 是否可购买 */
  available: boolean
  /** 是否选中 */
  selected: boolean
  /** 创建时间 */
  created_at?: string
  /** 更新时间 */
  updated_at?: string
}

/**
 * 购物车列表响应接口
 */
export interface ICartListResponse {
  /** 购物车商品列表 */
  items: ICartItem[]
  /** 商品总数量 */
  total_count: number
  /** 选中商品总价 */
  selected_total: number
  /** 选中商品数量 */
  selected_count: number
}

/**
 * 添加商品到购物车请求接口
 */
export interface IAddCartRequest {
  /** 商品 ID */
  product_id: string
  /** 数量 */
  quantity: number
  /** 规格 ID (可选) */
  spec_id?: string
}

/**
 * 添加商品到购物车响应接口
 */
export interface IAddCartResponse {
  /** 购物车项 ID */
  id: string
  /** 购物车商品总数 */
  cart_count: number
}

/**
 * 更新购物车商品请求接口
 */
export interface IUpdateCartRequest {
  /** 数量 */
  quantity: number
  /** 是否选中 (可选) */
  selected?: boolean
}

/**
 * 批量删除购物车商品请求接口
 */
export interface IBatchRemoveCartRequest {
  /** 购物车项 ID 数组 */
  ids: string[]
}

/**
 * 购物车统计信息接口
 */
export interface ICartStatistics {
  /** 商品总数量 */
  total_count: number
  /** 商品总价 */
  total_price: number
  /** 选中商品数量 */
  selected_count: number
  /** 选中商品总价 */
  selected_total: number
}

/**
 * 购物车 API 响应类型
 */
export type CartListApiResponse = IApiResponse<ICartListResponse>
export type AddCartApiResponse = IApiResponse<IAddCartResponse>
export type UpdateCartApiResponse = IApiResponse<void>
export type RemoveCartApiResponse = IApiResponse<void>
export type ClearCartApiResponse = IApiResponse<void>

