import type { PaginationParams, PaginationResponse } from './common'

// 请求参数接口
export interface IItemListParams extends PaginationParams {
  item_type?: string
  brand_id?: string | number
  category_id?: string | number
  keywords?: string
  sort?: string
  start_price?: number
  end_price?: number
}

// 商品信息接口
export interface IItem {
  id: number | string
  title: string
  sub_title?: string
  price: number // 单位：分
  market_price: number // 单位：分
  member_price?: number // 单位：分
  pics: string[]
  stock: number
  sales: number
  is_new?: boolean
  category_id?: number | string
  brand_id?: number | string
  status: number
  created_at: string
  updated_at: string
}

// 品牌信息接口
export interface IBrand {
  id: number | string
  name: string
  logo?: string
  desc?: string
}

// 列表响应数据接口
export interface IItemListResponse {
  list: IItem[]
  total_count: number
  brand_list?: {
    list: IBrand[]
  }
}

// 详情请求参数
export interface IItemDetailParams {
  id: string | number
}

// 详情响应数据
export interface IItemDetailResponse {
  item: IItem
}

// 商品评价列表请求参数
export interface ItemEvaluationListParams extends PaginationParams {
  item_id: string
  rate_type?: 'good' | 'neutral' | 'bad'
  has_photo?: boolean
}

// 商品评价列表响应
export interface ItemEvaluationListResponse extends PaginationResponse<{
  rate_id: string
  user_id: string
  user_name: string
  rate_content: string
  rate_photos?: string[]
  rate_type: 'good' | 'neutral' | 'bad'
  created_time: string
}> {}

// 商品推荐请求参数
export interface ItemRecommendParams extends PaginationParams {
  item_id?: string
  category_id?: string
}

// 商品推荐响应
export interface ItemRecommendResponse extends PaginationResponse<IItem> {}

// 商品收藏相关类型
export interface ItemFavParams {
  item_id: string
}

// 获取回复评价列表请求参数
export interface ItemGetReplyRateListParams extends PaginationParams {
  item_id: string
}

// 获取回复评价列表响应
export interface ItemGetReplyRateListResponse extends PaginationResponse<{
  rate_id: string
  reply_content: string
  created_time: string
}> {}

// 附近店铺请求参数
export interface ItemGetNearbyShopParams extends PaginationParams {
  latitude: number
  longitude: number
  radius?: number // 单位：米
}

// 附近店铺响应
export interface ItemGetNearbyShopResponse extends PaginationResponse<{
  shop_id: string
  shop_name: string
  logo?: string
  address: string
  distance: number // 单位：米
  latitude: number
  longitude: number
}> {} 