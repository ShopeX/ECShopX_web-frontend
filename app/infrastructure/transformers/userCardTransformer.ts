export interface IUserCardModel {
  id: string
  code: string
  title: string
  description: string
  amount: number
  thresholdText: string
  expireText: string
  usable: boolean
}

export class UserCardTransformer {
  /**
   * 优惠券列表响应 -> 用户优惠券模型列表
   */
  static toUserCardList(response: any): IUserCardModel[] {
    const list = response?.list || response || []
    return (Array.isArray(list) ? list : []).map((item: any) => {
      // 分转元（兼容多种常见字段命名）
      const amount =
        Number(item.discount || item.amount || item.deduct_money || Math.max(0, item.price || 0)) /
        100
      const minFee = Number(item.min_fee || Math.max(0, item.min_charge || 0)) / 100

      const thresholdText = minFee > 0 ? `满${minFee}可用` : ''
      const title =
        item.title || item.name || (minFee > 0 ? `满${minFee}减${amount}` : `减${amount}优惠券`)
      const description =
        item.description || item.desc || (minFee > 0 ? '指定商品可用' : '全场无门槛使用')
      const expireTime = item.expire_time || item.end_time || ''
      const expireText = expireTime ? `有效期至 ${expireTime.split(' ')[0]}` : ''

      const status = String(item.status || '1')
      const usable = status === '1' // 1: 未使用

      return {
        id: String(item.id || item.card_id || ''),
        code: item.coupon_code || item.card_code || '',
        title,
        description,
        amount,
        thresholdText,
        expireText,
        usable,
      }
    })
  }
}
