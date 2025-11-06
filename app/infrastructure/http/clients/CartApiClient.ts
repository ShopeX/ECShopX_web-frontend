import { useHttpMethods } from '~/composables/useHttp'
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
  private get http() {
    return useHttpMethods()
  }

  /**
   * 获取购物车列表
   * 
   * @returns 原始 API 响应
   */
  async getCartList(): Promise<any> {
    return this.http.get('/cart/list', {
      server: false,  // 购物车数据通常是客户端渲染
      cache: 'default',
      key: 'cart-list',
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
  async addToCart(params: IAddCartRequest) {
    return this.http.post<{
      id: string
      cart_count: number
    }>('/cart', {
      body: params,
      server: false,
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
  async updateCartItem(itemId: string, params: IUpdateCartRequest) {
    return this.http.put<void>(`/api/cart/items/${itemId}`, {
      body: params,
      server: false,
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
  async removeCartItem(itemId: string) {
    return this.http.delete<void>(`/api/cart/items/${itemId}`, {
      server: false,
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
  async batchRemoveItems(params: IBatchRemoveCartRequest) {
    return this.http.post<void>('/api/cart/batch-remove', {
      body: params,
      server: false,
    })
  }

  /**
   * 删除选中的商品
   * 
   * @returns 删除结果
   */
  async removeSelectedItems() {
    return this.http.delete<void>('/api/cart/selected', {
      server: false,
    })
  }

  /**
   * 切换商品选中状态
   * 
   * @param itemId - 购物车项 ID
   * @returns 更新结果
   */
  async toggleItemSelection(itemId: string) {
    return this.http.put<void>(`/api/cart/items/${itemId}/toggle`, {
      server: false,
    })
  }

  /**
   * 全选/取消全选
   * 
   * @param selected - 是否全选
   * @returns 更新结果
   */
  async toggleAllSelection(selected: boolean) {
    return this.http.put<void>('/api/cart/toggle-all', {
      body: { selected },
      server: false,
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
  async clearCart() {
    return this.http.delete<void>('/api/cart/clear', {
      server: false,
    })
  }

  /**
   * 验证购物车结算
   * 
   * @returns 验证结果
   */
  async validateCheckout() {
    return this.http.post<{
      valid: boolean
      errors: string[]
    }>('/api/cart/validate', {
      server: false,
    })
  }
}

/**
 * 导出单例实例
 * 在整个应用中共享同一个实例，减少内存开销
 */
export const cartApiClient = new CartApiClient()

