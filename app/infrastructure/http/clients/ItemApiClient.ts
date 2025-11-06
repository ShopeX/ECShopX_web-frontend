import { useHttpMethods } from '~/composables/useHttp'
import type { IItemListParams, IItemDetailParams } from '~/types/api/item'

/**
 * 商品 HTTP 客户端
 * 
 * 职责：
 * - 封装商品相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 * 
 * 设计原则：
 * - 纯粹的 HTTP 调用层
 * - 不包含业务逻辑
 * - 不包含数据转换
 * - 职责单一，易于测试
 * 
 * @example
 * ```typescript
 * const client = new ItemApiClient()
 * const response = await client.getItemList(params)
 * // response 是原始 API 响应，需要在 Repository 或 API 层转换
 * ```
 */
export class ItemApiClient {
  private get http() {
    return useHttpMethods()
  }

  /**
   * 获取商品列表
   * 
   * @param params - 商品列表查询参数
   * @returns 原始 API 响应
   * 
   * @example
   * ```typescript
   * const response = await client.getItemList({
   *   page: '1',
   *   pageSize: '20',
   *   item_type: 'normal',
   *   main_category: 'electronics'
   * })
   * ```
   */
  async getItemList(params: IItemListParams): Promise<any> {
    const apiParams = {
      page: params.page,
      pageSize: params.pageSize,
      item_type: params.item_type,
      main_category: params.main_category,
      is_tdk: params.is_tdk,
      type: params.type,
      company_id: params.company_id,
      ...(params.brand_id && { brand_id: params.brand_id }),
      ...(params.sort && { sort: params.sort }),
      ...(params.start_price && { start_price: params.start_price }),
      ...(params.end_price && { end_price: params.end_price }),
      ...(params.keywords && { keywords: params.keywords }),
    }

    return this.http.get('/goods/items', {
      query: apiParams,
      server: true,
      cache: 'default',
      key: `items-list-${JSON.stringify(apiParams)}`,
    })
  }

  /**
   * 获取单个商品详情
   * 
   * @param params - 商品详情查询参数
   * @returns 原始 API 响应
   * 
   * @example
   * ```typescript
   * const response = await client.getItemDetail({ id: '123' })
   * ```
   */
  async getItemDetail(params: IItemDetailParams): Promise<any> {
    return this.http.get(`/goods/items/${params.id}`, {
      server: true,
      cache: 'default',
      key: `item-detail-${params.id}`,
    })
  }

  /**
   * 搜索商品
   * 
   * @param keyword - 搜索关键词
   * @param page - 页码
   * @param pageSize - 每页数量
   * @returns 原始 API 响应
   */
  async searchItems(keyword: string, page: string = '1', pageSize: string = '20') {
    return this.http.get('/goods/items/search', {
      query: { keyword, page, pageSize },
      server: true,
      cache: 'default',
      key: `items-search-${keyword}-${page}-${pageSize}`,
    })
  }

  /**
   * 获取商品评价列表
   * 
   * @param itemId - 商品 ID
   * @param page - 页码
   * @param pageSize - 每页数量
   * @returns 原始 API 响应
   */
  async getItemReviews(itemId: string, page: string = '1', pageSize: string = '20') {
    return this.http.get(`/goods/items/${itemId}/reviews`, {
      query: { page, pageSize },
      server: true,
      cache: 'default',
      key: `item-reviews-${itemId}-${page}`,
    })
  }

  /**
   * 获取推荐商品
   * 
   * @param itemId - 基准商品 ID
   * @param limit - 推荐数量
   * @returns 原始 API 响应
   */
  async getRecommendedItems(itemId?: string, limit: number = 10) {
    return this.http.get('/goods/items/recommended', {
      query: { item_id: itemId, limit },
      server: true,
      cache: 'default',
      key: `items-recommended-${itemId}-${limit}`,
    })
  }
}

/**
 * 导出单例实例
 * 在整个应用中共享同一个实例，减少内存开销
 */
export const itemApiClient = new ItemApiClient()

