import type { ProductRecommendation } from '~/components/BCProductRecommendations/types'

export class RecommendLikeTransformer {
  private static pickImage(item: Record<string, any>): string {
    const pics = item.pics

    if (Array.isArray(pics) && pics.length > 0) {
      return String(pics[0] ?? '')
    }

    if (typeof pics === 'string' && pics.length > 0) {
      return pics
    }

    return String(item.image ?? item.item_image ?? item.cover ?? '')
  }

  static toRecommendationList(response: any): ProductRecommendation[] {
    const list = response?.data?.list ?? response?.list ?? []
    const items = Array.isArray(list) ? list : []

    return items.map((item: any) => ({
      id: String(item.goods_id ?? item.itemId ?? item.item_id ?? ''),
      name: String(item.item_name ?? item.itemName ?? ''),
      price: Number(item.price ?? 0) / 100,
      image: this.pickImage(item),
    }))
  }
}
