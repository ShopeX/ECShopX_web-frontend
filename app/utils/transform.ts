import type { IApiResponse } from './auth'
import type { IProduct } from '~/types/product'
import type { IItem } from '~/types/api/item'

/**
 * 转换器接口
 */
export interface ITransformer<From, To> {
  transform(from: From): To
}

/**
 * 商品数据转换器
 */
export class ProductTransformer implements ITransformer<IItem, IProduct> {
  transform(item: IItem): IProduct {
    return {
      id: String(item.id),
      title: item.title,
      subtitle: item.sub_title || '', // 后端字段可能是 sub_title
      price: item.price / 100, // 假设后端返回的价格是分，需要转换为元
      originalPrice: item.market_price / 100,
      imageUrl: item.pics?.[0] || '',
      memberPrice: item.member_price ? item.member_price / 100 : undefined,
      tags: this.extractTags(item)
    }
  }

  /**
   * 从商品数据中提取标签
   */
  private extractTags(item: IItem): string[] {
    const tags: string[] = []

    // 根据业务规则提取标签
    if (item.is_new) {
      tags.push('新品')
    }
    if (item.stock <= 10) {
      tags.push('库存紧张')
    }
    if (item.sales >= 100) {
      tags.push('热销')
    }

    return tags
  }
}

/**
 * 创建商品转换器实例
 */
export const productTransformer = new ProductTransformer()

/**
 * 批量转换商品数据
 */
export function transformProducts(items: IItem[]): IProduct[] {
  return items.map(item => productTransformer.transform(item))
}

/**
 * 转换分页数据
 */
export function transformPagination<T, R>(
  response: IApiResponse<{ list: T[]; total_count: number }>,
  transformer: ITransformer<T, R>
): { list: R[]; total: number } {
  return {
    list: response.data.list.map(item => transformer.transform(item)),
    total: response.data.total_count
  }
} 