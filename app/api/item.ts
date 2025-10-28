import type { IItemListParams, IItemDetailParams } from '~/types/api/item'
import { useHttpMethods } from '~/composables/useHttp'
import { ProductEntity, productTransformer, type IProductListItem } from '~/entities'
import { validate } from 'class-validator'

/**
 * 使用 class-transformer 的商品 API
 */
class ItemApiWithTransformer {
  private get http() {
    return useHttpMethods()
  }

  /**
   * 获取商品列表（class-transformer版本）
   */
  async getProductList(params: IItemListParams) {
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
      ...(params.keywords && { keywords: params.keywords })
    }

    return this.http.get<{
      list: IProductListItem[]
      total_count: number
      brand_list?: { list: any[] }
      entities?: ProductEntity[]  // 可选：返回完整实体用于调试
    }>('/goods/items', {
      query: apiParams,
      server: true,
      cache: 'default',
      key: `products-class-transformer-${JSON.stringify(apiParams)}`,

      // 🎯 使用 class-transformer 进行转换（同步版本）
      transform: (response: any) => {
        if (response?.data?.list) {
          try {
            // 1. 转换为实体
            const entities = ProductEntity.fromList(response.data.list)

            // 2. 转换为UI数据
            const uiList = entities.map(entity => entity.toUIModel())

            return {
              list: uiList,
              total_count: response.data.total_count,
              brand_list: response.data.brand_list || { list: [] }, // 添加品牌列表支持
              entities: entities  // 调试用
            }
          } catch (error) {
            console.error('Transform error:', error)
            return { list: [], total_count: 0, brand_list: { list: [] } }
          }
        }
        return { list: [], total_count: 0, brand_list: { list: [] } }
      }
    })
  }

  /**
   * 获取单个商品（class-transformer版本）
   */
  async getProduct(params: IItemDetailParams) {
    return this.http.get<{
      product: IProductListItem | null
      entity?: ProductEntity  // 可选：返回完整实体
    }>(`/goods/items/${params.id}`, {
      server: true,
      cache: 'default',
      key: `product-class-transformer-${params.id}`,

      transform: (response: any) => {
        if (response?.data) {
          try {
            // 1. 转换为实体
            const entity = ProductEntity.fromPlain(response.data)

            // 2. 转换为UI数据
            return {
              product: entity.toUIModel(),
              entity  // 调试用
            }
          } catch (error) {
            console.error('Transform error:', error)
            return { product: null }
          }
        }
        return { product: null }
      }
    })
  }

  /**
   * 批量转换商品数据（工具方法）
   */
  transformProducts(rawData: any[]): IProductListItem[] {
    return productTransformer.transformList(rawData)
  }

  /**
   * 验证商品数据（工具方法）
   */
  async validateProduct(productData: any): Promise<{ isValid: boolean; errors: any[] }> {
    try {
      const entity = ProductEntity.fromPlain(productData)
      const errors = await validate(entity)
      return {
        isValid: errors.length === 0,
        errors: errors || []
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [{ error: 'Transform failed', details: error }]
      }
    }
  }

  // 兼容原有的方法名
  getItem = this.getProduct
}

export const itemApiWithTransformer = new ItemApiWithTransformer()
