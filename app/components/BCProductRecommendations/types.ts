import type { IMarketingTag } from '~/utils/promotionTags'

export interface ProductRecommendation {
  id: string
  name: string
  price: number
  image: string
  marketingTags?: IMarketingTag[]
}
