/**
 * 售后 HTTP 客户端
 *
 * 职责：
 * - 封装售后申请相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 */

export interface ICreateAftersalesParams {
  order_id: string
  item_id: string
  reason: string
  detail: string
  aftersales_type: 'ONLY_REFUND' | 'REFUND_GOODS' | 'EXCHANGING_GOODS'
  description: string
}

export class AftersalesApiClient {
  private $api: any

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * 提交售后申请
   * POST /wxapp/aftersales
   */
  async submitAftersales(params: ICreateAftersalesParams): Promise<any> {
    return this.http('/wxapp/aftersales', {
      method: 'POST',
      query: { ...params },
    })
  }
}

export const aftersalesApiClient = new AftersalesApiClient()
