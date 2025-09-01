import { Field, AutoMap } from './decorators'
import type { IItem } from '~/types/api/item'

@AutoMap
export class Product implements IItem {
  @Field('id', (value) => String(value))
  id!: string | number

  @Field('title')
  title!: string

  @Field('sub_title', (value) => value || '')
  sub_title?: string

  @Field('price', (value) => value)
  price!: number

  @Field('market_price', (value) => value)
  market_price!: number

  @Field('member_price', (value) => value)
  member_price?: number

  @Field('pics', (value) => value || [])
  pics!: string[]

  @Field('stock', (value) => value)
  stock!: number

  @Field('sales', (value) => value)
  sales!: number

  @Field('is_new', (value) => value)
  is_new?: boolean

  @Field('category_id', (value) => value)
  category_id?: string | number

  @Field('brand_id', (value) => value)
  brand_id?: string | number

  @Field('status', (value) => value)
  status!: number

  @Field('created_at', (value) => value)
  created_at!: string

  @Field('updated_at', (value) => value)
  updated_at!: string

  /**
   * 从后端数据创建商品实例
   */
  static fromItem(item: IItem): IItem {
    const product = new Product()
    return {
      id: item.id,
      title: item.title,
      sub_title: item.sub_title,
      price: item.price,
      market_price: item.market_price,
      member_price: item.member_price,
      pics: item.pics,
      stock: item.stock,
      sales: item.sales,
      is_new: item.is_new,
      category_id: item.category_id,
      brand_id: item.brand_id,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at
    }
  }

  /**
   * 批量转换商品数据
   */
  static fromItems(items: IItem[]): IItem[] {
    return items.map(item => Product.fromItem(item))
  }
}

// 导出转换器实例
export const productTransformer = {
  transform: Product.fromItem
} 