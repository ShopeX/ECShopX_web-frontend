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
      // company_id 由 HTTP 插件自动添加，无需手动传递
      ...(params.brand_id && { brand_id: params.brand_id }),
      ...(params.sort && { sort: params.sort }),
      ...(params.start_price && { start_price: params.start_price }),
      ...(params.end_price && { end_price: params.end_price }),
      ...(params.keywords && { keywords: params.keywords }),
      ...(params.distributor_id && { distributor_id: params.distributor_id }),
    }

    return this.http('/wxapp/goods/items', {
      method: 'GET',
      query: apiParams,
      cache: 'default',
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
    return this.http(`/wxapp/goods/items/${params.id}`, {
      method: 'GET',
      cache: 'default',
    })
  }

  /**
   * 批量获取商品
   *
   * @param itemIds - 商品 ID 列表
   * @returns 原始 API 响应
   */
  async getItemsBatch(itemIds: Array<string | number>): Promise<any[]> {
    const normalizedIds = itemIds.map((id) => String(id)).filter(Boolean)

    if (!normalizedIds.length) {
      return []
    }

    return this.http('/wxapp/goods/items/batch', {
      method: 'GET',
      query: {
        item_ids: normalizedIds.join(','),
      },
      cache: 'default',
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
  async searchItems(keyword: string, page: string = '1', pageSize: string = '20'): Promise<any> {
    return this.http('/wxapp/goods/items/search', {
      method: 'GET',
      query: { keyword, page, pageSize },
      cache: 'default',
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
  async getItemReviews(itemId: string, page: string = '1', pageSize: string = '20'): Promise<any> {
    return this.http(`/wxapp/goods/items/${itemId}/reviews`, {
      method: 'GET',
      query: { page, pageSize },
      cache: 'default',
    })
  }

  /**
   * 获取推荐商品
   *
   * @param itemId - 基准商品 ID
   * @param limit - 推荐数量
   * @returns 原始 API 响应
   */
  async getRecommendedItems(itemId?: string, limit: number = 10): Promise<any> {
    return this.http('/wxapp/goods/items/recommended', {
      method: 'GET',
      query: { item_id: itemId, limit },
      cache: 'default',
    })
  }

  /**
   * 获取猜你喜欢商品列表
   */
  async getRecommendLikeItems(page: string = '1', pageSize: string = '40'): Promise<any> {
    return this.http('/wxapp/promotions/recommendlike', {
      method: 'GET',
      query: { page, pageSize },
      cache: 'default',
    })
  }
}

/**
 * 导出单例实例
 * 在整个应用中共享同一个实例，减少内存开销
 */
export const itemApiClient = new ItemApiClient()
