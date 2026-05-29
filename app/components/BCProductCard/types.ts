/**
 * 商品卡片数据接口
 */
export interface IProduct {
  /** 商品 ID */
  itemId: string
  /** 商品名称 */
  itemName: string
  /** 主图片 */
  img: string
  /** 图片列表 */
  imgs: readonly string[]
  /** 原价（分） */
  price: number
  /** 活动价（分） */
  activityPrice: number
  /** 会员价（分） */
  memberPrice: number
  /** 销量 */
  sales: number
  /** 规格 ID（默认规格） */
  specId?: string
  /** 规格名称 */
  specName?: string
  /** 库存 */
  stock?: number
  /** 店铺名称（BBC 模式下展示） */
  storeName?: string
}
