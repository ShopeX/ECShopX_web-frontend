import { MoneyValueObject, QuantityValueObject } from '~/shared/value-objects'

/**
 * 购物车商品模型（领域模型/轻量级）
 */
export interface ICartItemModel {
  id: string
  productId: string
  productBn?: string
  productName: string
  productImage: string
  specId: string
  specName: string
  /** 销售价（API price） */
  price: MoneyValueObject
  marketPrice: MoneyValueObject
  /** 会员价（API member_price，可能不存在） */
  memberPrice?: MoneyValueObject | null
  /** 活动价（API activity_price） */
  activityPrice?: MoneyValueObject | null
  /** 组合价（API package_price） */
  packagePrice?: MoneyValueObject | null
  /** 按 mobile 规则解析后的展示/计价单价 */
  effectivePrice: MoneyValueObject
  quantity: QuantityValueObject
  stock: number
  selected: boolean
}

/**
 * 购物车模型
 */
export interface ICartModel {
  items: ICartItemModel[]
  itemCount: number
  totalQuantity: number
}
