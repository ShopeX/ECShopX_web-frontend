import type { IItemListParams, IItemListResponse, IItemDetailParams, IItemDetailResponse } from '~/types/api/item'

import { http } from '~/utils/http'
import { itemDetailTransformer, transformPagination } from '~/transformers'

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
        transform: (response: any) => {
          console.log('transform-------response',response)
          // 使用转换器处理数据
          const { list, total } = transformPagination({
            list: response.data.list,
            total_count: response.data.total_count
          }, itemDetailTransformer)
          console.log('transform-------list',list)
          return {
            list,
            total_count: total,
            brand_list: response.data.brand_list
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
            item: itemDetailTransformer.transform(response.item)
          }
        }
      })
    }
  }
} 