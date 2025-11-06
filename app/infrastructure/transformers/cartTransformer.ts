import type { ICartItem } from '~/types/api/cart'
import type { ICartItemModel } from '~/composables/useCart'
import { MoneyValueObject, QuantityValueObject, DiscountValueObject } from '~/shared/value-objects'

/**
 * 购物车数据转换器（轻量级 DDD）
 * 
 * 职责：
 * - API 数据 → 应用模型转换
 * - 数据验证和清洗
 * - 提供默认值处理
 * 
 * 不负责：
 * - ❌ 业务规则（由值对象负责）
 * - ❌ 格式化显示（由值对象负责）
 * - ❌ 业务计算（由 Composable 负责）
 * 
 * 特点：
 * - 纯函数，无副作用
 * - 只做数据结构转换
 * - 将原始数据转换为值对象
 * 
 * @example
 * ```typescript
 * // API 数据转换为应用模型
 * const model = CartTransformer.toModel(apiItem)
 * 
 * // 批量转换
 * const models = CartTransformer.toModelList(apiItems)
 * ```
 */
export class CartTransformer {
  /**
   * API 数据 → 应用模型
   * 
   * 核心职责：将原始 API 数据转换为包含值对象的应用模型
   * 
   * @param apiItem - API 返回的购物车商品
   * @returns 应用模型（包含值对象）
   */
  static toModel(apiItem: ICartItem): ICartItemModel {
    // ✅ 转换为值对象（值对象负责验证和业务规则）
    const price = MoneyValueObject.of(apiItem.price)
    const marketPrice = MoneyValueObject.of(apiItem.original_price || apiItem.price)
    const quantity = QuantityValueObject.of(
      apiItem.quantity,
      1,
      apiItem.stock
    )

    return {
      id: apiItem.id,
      productId: apiItem.product_id,
      productName: apiItem.product_name,
      productImage: apiItem.product_image || '',
      specId: apiItem.spec_id || 'default',
      specName: apiItem.spec || '默认规格',
      price,
      marketPrice,
      quantity,
      stock: apiItem.stock,
      selected: apiItem.selected ?? false,
    }
  }

  /**
   * 批量转换：API 数据列表 → 应用模型列表
   * 
   * @param apiItems - API 返回的购物车商品列表
   * @returns 应用模型列表
   */
  static toModelList(apiItems: ICartItem[]): ICartItemModel[] {
    return apiItems.map(item => this.toModel(item))
  }

  /**
   * 验证购物车商品数据完整性
   * 
   * 职责：检查 API 数据是否包含必需字段
   * 
   * @param item - 购物车商品（可能不完整）
   * @returns 是否有效
   */
  static validateCartItem(item: Partial<ICartItem>): item is ICartItem {
    return !!(
      item.id &&
      item.product_id &&
      item.product_name &&
      typeof item.price === 'number' &&
      typeof item.quantity === 'number' &&
      typeof item.stock === 'number'
    )
  }

  /**
   * 清洗购物车商品数据
   * 
   * 职责：
   * - 确保数据格式正确
   * - 为缺失字段提供默认值
   * - 处理数据类型转换
   * 
   * @param item - 购物车商品（可能不完整）
   * @returns 清洗后的完整 API 数据
   */
  static sanitizeCartItem(item: Partial<ICartItem>): ICartItem {
    return {
      id: item.id || '',
      product_id: item.product_id || '',
      product_name: item.product_name || '未知商品',
      product_image: item.product_image || '',
      spec: item.spec || '默认规格',
      spec_id: item.spec_id || 'default',
      price: typeof item.price === 'number' ? item.price : 0,
      original_price: typeof item.original_price === 'number' ? item.original_price : item.price || 0,
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
      stock: typeof item.stock === 'number' ? item.stock : 0,
      available: item.available ?? true,
      selected: item.selected ?? false,
      created_at: item.created_at || '',
      updated_at: item.updated_at || '',
    }
  }

  /**
   * 批量验证
   * 
   * @param items - 购物车商品列表
   * @returns 有效的购物车商品列表
   */
  static validateCartList(items: Partial<ICartItem>[]): ICartItem[] {
    return items.filter(item => this.validateCartItem(item)) as ICartItem[]
  }

  /**
   * 批量清洗
   * 
   * @param items - 购物车商品列表（可能不完整）
   * @returns 清洗后的购物车商品列表
   */
  static sanitizeCartList(items: Partial<ICartItem>[]): ICartItem[] {
    return items.map(item => this.sanitizeCartItem(item))
  }
}

