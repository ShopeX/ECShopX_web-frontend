import type { IItemListParams, IItemListResponse, IItemDetailParams, IItemDetailResponse } from '~/types/api/item'
import type { IProduct } from '~/types/product'
import { http } from '~/utils/http'
import { productTransformer, transformPagination } from '~/transformers'

export function useItemApi() {
  return {
    // 获取商品列表
    getList(params: IItemListParams) {
      return http.get<IItemListResponse>('/goods/items', {
        params,
        // SSR 配置
        server: true,
        // 缓存配置
        cache: 'no-cache',
        // 转换响应数据
        transform: (response: IItemListResponse) => {
          // 使用转换器处理数据
          const { list, total } = transformPagination({
            list: response.list,
            total_count: response.total_count
          }, productTransformer)

          return {
            list,
            total_count: total,
            brand_list: response.brand_list
          }
        }
      })
    },

    // 获取商品详情
    getDetail(params: IItemDetailParams) {
      return http.get<IItemDetailResponse>(`/goods/items/${params.id}`, {
        // SSR 配置
        server: true,
        // 缓存配置
        cache: 'no-cache',
        // 转换响应数据
        transform: (response: IItemDetailResponse) => {
          return {
            item: productTransformer.transform(response.item)
          }
        }
      })
    }
  }
} 