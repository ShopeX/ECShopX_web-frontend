import { MoneyValueObject, QuantityValueObject } from '~/shared/value-objects'

/**
 * 购物车商品模型（领域模型/轻量级）
 */
export interface ICartItemModel {
  id: string
  productId: string
  productName: string
  productImage: string
  specId: string
  specName: string
  price: MoneyValueObject
  marketPrice: MoneyValueObject
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
