/**
 * 收藏商品列表 API 响应 -> 前端卡片模型
 * 接口 GET /wxapp/member/collect/item 响应体以 Apifox 为准，以下字段名为常见约定，实际对接时按后端字段调整。
 */
export interface IFavoriteProduct {
  id: string | number
  name: string
  price: number
  image: string
}

export class CollectItemTransformer {
  /**
   * 将接口列表转为 FavoriteProductCard 所需格式
   */
  static toFavoriteList(response: any): IFavoriteProduct[] {
    const list = response?.data?.list ?? response?.list ?? response?.data ?? response
    const arr = Array.isArray(list) ? list : []
    return arr.map((item: any) => {
      // 兼容常见字段命名：id/item_id/goods_id；name/title/goods_name；price/retail_price；image/pic/cover
      const id = item.id ?? item.item_id ?? item.goods_id ?? item.collect_id ?? ''
      const name = item.name ?? item.title ?? item.goods_name ?? ''
      const price = Number(item.price ?? item.retail_price ?? item.sale_price ?? 0)
      const image = item.image ?? item.pic ?? item.cover ?? item.goods_image ?? item.img ?? ''
      return {
        id: String(id),
        name: String(name),
        price,
        image: String(image),
      }
    })
  }
}
