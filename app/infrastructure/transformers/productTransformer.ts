import type { IProductListItem } from '~/types/api/item'
import type { IProduct } from '~/components/BCProductCard/types'
import { MoneyValueObject, DiscountValueObject } from '~/shared/value-objects'

/**
 * 商品数据转换器
 *
 * 职责：
 * - API 响应数据 → UI 数据模型转换
 * - 数据结构映射和默认值处理
 *
 * 不负责：
 * - ❌ 业务规则（由值对象负责）
 * - ❌ 格式化显示（由值对象负责）
 * - ❌ 价格计算逻辑（由值对象负责）
 *
 * 设计原则：
 * - 纯函数，无副作用
 * - 单向数据流（API → Model）
 * - 类型安全
 *
 * @example
 * ```typescript
 * // 转换单个商品
 * const product = ProductTransformer.toModel(apiProduct)
 *
 * // 批量转换
 * const products = ProductTransformer.toModelList(apiProducts)
 * ```
 */
export class ProductTransformer {
  /**
   * API 响应 → UI 数据模型
   *
   * 职责：纯数据结构转换，字段映射和默认值处理
   *
   * @param apiProduct - API 返回的商品数据
   * @returns UI 数据模型
   */
  static toModel(apiProduct: IProductListItem): IProduct {
    return {
      itemId: apiProduct.item_id,
      itemName: apiProduct.itemName,
      img: apiProduct.pics?.[0] || '',
      imgs: apiProduct.pics || [],
      price: apiProduct.price || 0,
      activityPrice: apiProduct.activity_price || 0,
      memberPrice: apiProduct.member_price || 0,
      sales: apiProduct.sales || 0,
      // 注意：API 返回的数据中可能没有规格和库存信息
      // 这些字段在商品详情中才有，列表中为可选
      specId: undefined,
      specName: undefined,
      stock: undefined,
    }
  }

  /**
   * 批量转换：API 响应列表 → UI 数据模型列表
   *
   * @param apiProducts - API 返回的商品列表
   * @returns UI 数据模型列表
   */
  static toModelList(apiProducts: IProductListItem[]): IProduct[] {
    return apiProducts.map((item) => this.toModel(item))
  }

  /**
   * 验证商品数据完整性
   *
   * @param item - 商品数据（可能不完整）
   * @returns 是否有效
   */
  static validateProduct(item: Partial<IProductListItem>): item is IProductListItem {
    return !!(item.item_id && item.itemName && typeof item.price === 'number')
  }

  /**
   * 批量验证
   *
   * @param items - 商品列表
   * @returns 有效的商品列表
   */
  static validateProductList(items: Partial<IProductListItem>[]): IProductListItem[] {
    return items.filter((item) => this.validateProduct(item)) as IProductListItem[]
  }
}
