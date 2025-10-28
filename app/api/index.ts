/**
 * 统一的 API 导出
 * 
 * 使用方式：
 * import { api } from '~/api'
 * 
 * 
 * // 调用商品详情API
 * const detail = await api.item.getItemDetail({ id: '123' })
 */

import { itemApiWithTransformer as itemApi } from './item'

// 统一的API对象 - 全部使用 class-transformer 架构
export const api = {
  /**
   * 商品相关API (使用 class-transformer 实现)
   * 提供类型安全的实体转换和数据验证
   */
  item: itemApi,

  // 未来可以在这里添加其他模块的API
  // user: userApi,
  // order: orderApi,
  // category: categoryApi,
}

// 默认导出
export default api

// 也可以单独导出各个模块（提供更多使用方式）
export { itemApiWithTransformer as itemApi } from './item'

// 类型导出
export type { IItemListParams, IItemDetailParams } from '~/types/api/item'
