import type {
  IAddCartRequest,
  IUpdateCartRequest,
  IBatchRemoveCartRequest,
} from '~/types/api/cart'

/**
 * 购物车 HTTP 客户端
 * 
 * 职责：
 * - 封装购物车相关的 HTTP 请求
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
 * const client = new CartApiClient()
 * const response = await client.getCartList()
 * // response 是原始 API 响应，需要在 Repository 层转换
 * ```
 */
export class CartApiClient {
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
   * 获取购物车列表
   * 
   * @returns 原始 API 响应
   */
  async getCartList(): Promise<any> {
    return this.http('/cart/list', {
      method: 'GET',
      cache: 'default',
    })
  }

  /**
   * 添加商品到购物车
   * 
   * @param params - 添加购物车请求参数
   * @returns 添加结果，包含购物车项 ID 和购物车总数
   * 
   * @example
   * ```typescript
   * await client.addToCart({
   *   product_id: '123',
   *   quantity: 1,
   *   spec_id: 'sku-001'
   * })
   * ```
   */
  async addToCart(params: IAddCartRequest): Promise<{
    id: string
    cart_count: number
  }> {
    return this.http('/cart', {
      method: 'POST',
      body: params,
    })
  }

  /**
   * 更新购物车商品
   * 
   * @param itemId - 购物车项 ID
   * @param params - 更新参数
   * @returns 更新结果
   * 
   * @example
   * ```typescript
   * await client.updateCartItem('cart-item-123', {
   *   quantity: 2,
   *   selected: true
   * })
   * ```
   */
  async updateCartItem(itemId: string, params: IUpdateCartRequest): Promise<void> {
    return this.http(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      body: params,
    })
  }

  /**
   * 删除购物车商品
   * 
   * @param itemId - 购物车项 ID
   * @returns 删除结果
   * 
   * @example
   * ```typescript
   * await client.removeCartItem('cart-item-123')
   * ```
   */
  async removeCartItem(itemId: string): Promise<void> {
    return this.http(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
    })
  }

  /**
   * 批量删除购物车商品
   * 
   * @param params - 批量删除参数
   * @returns 删除结果
   * 
   * @example
   * ```typescript
   * await client.batchRemoveItems({
   *   item_ids: ['item-1', 'item-2']
   * })
   * ```
   */
  async batchRemoveItems(params: IBatchRemoveCartRequest): Promise<void> {
    return this.http('/api/cart/batch-remove', {
      method: 'POST',
      body: params,
    })
  }

  /**
   * 删除选中的商品
   * 
   * @returns 删除结果
   */
  async removeSelectedItems(): Promise<void> {
    return this.http('/api/cart/selected', {
      method: 'DELETE',
    })
  }

  /**
   * 切换商品选中状态
   * 
   * @param itemId - 购物车项 ID
   * @returns 更新结果
   */
  async toggleItemSelection(itemId: string): Promise<void> {
    return this.http(`/api/cart/items/${itemId}/toggle`, {
      method: 'PUT',
    })
  }

  /**
   * 全选/取消全选
   * 
   * @param selected - 是否全选
   * @returns 更新结果
   */
  async toggleAllSelection(selected: boolean): Promise<void> {
    return this.http('/api/cart/toggle-all', {
      method: 'PUT',
      body: { selected },
    })
  }

  /**
   * 清空购物车
   * 
   * @returns 清空结果
   * 
   * @example
   * ```typescript
   * await client.clearCart()
   * ```
   */
  async clearCart(): Promise<void> {
    return this.http('/api/cart/clear', {
      method: 'DELETE',
    })
  }

  /**
   * 验证购物车结算
   * 
   * @returns 验证结果
   */
  async validateCheckout(): Promise<{
    valid: boolean
    errors: string[]
  }> {
    return this.http('/api/cart/validate', {
      method: 'POST',
    })
  }
}

/**
 * 导出单例实例
 * 在整个应用中共享同一个实例，减少内存开销
 */
export const cartApiClient = new CartApiClient()

