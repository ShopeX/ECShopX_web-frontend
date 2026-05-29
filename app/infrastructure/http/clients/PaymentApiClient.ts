/**
 * 支付相关 HTTP 客户端
 *
 * 职责：
 * - 封装支付方式列表、订单信息、订单支付信息等 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 *
 * 接口定义以 .f2e-ai/requirements/20260309-ECX-8078/api-notes.md（MCP 拉取）为准。
 */

/** 支付方式项（与 Apifox/OAS 一致：pay_type_code / pay_type_name） */
export interface IPaymentMethodItem {
  pay_type_code: string
  pay_type_name: string
  [key: string]: any
}

/** 获取支付方式 - 请求 Query（company_id、country_code 由 HTTP 插件全局注入） */
export interface IGetPaymentListParams {
  platform?: string
}

/** 获取支付方式 - 200 响应 */
export interface IGetPaymentListResponse {
  data: IPaymentMethodItem[]
}

/** 查询订单信息 - 请求 Query（company_id、country_code 由 HTTP 插件全局注入） */
export interface IGetOrderInfoParams {
  pay_type?: string
}

/** 查询订单信息 - data 顶层（支付页常用字段） */
export interface IGetOrderInfoResponseData {
  order_id: string
  total_fee: string
  total_amount?: string | number
  payStatus?: string
  orderInfo?: {
    order_status?: string
    total_fee?: string
    total_amount?: string | number
    auto_cancel_time?: string
    auto_cancel_seconds?: number
    [key: string]: any
  }
  [key: string]: any
}

/** 查询订单信息 - 200 响应（HTTP 插件可能已解包 data） */
export type IGetOrderInfoResponse = IGetOrderInfoResponseData & {
  data?: IGetOrderInfoResponseData
}

/** 查询订单支付信息 - Body（company_id、country_code 由 HTTP 插件全局注入） */
export interface IOrderPaymentInfoRequest {
  order_id: string
  pay_type: string
  return_url: string
  pay_channel: string
}

/** 查询订单支付信息 - 200 响应 data */
export interface IOrderPaymentInfoResponseData {
  code_url?: string
  payment?: string
  mweb_url?: string
  h5_url?: string
  redirect_url?: string
  pay_url?: string
  appId?: string
  timeStamp?: string
  nonceStr?: string
  package?: string
  signType?: string
  paySign?: string
  [key: string]: any
}

/** 查询订单支付信息 - 200 响应（HTTP 插件可能已解包 data） */
export type IOrderPaymentInfoResponse = IOrderPaymentInfoResponseData & {
  data?: IOrderPaymentInfoResponseData
}

/** 线下转账收款账户项 */
export interface IOfflineBankAccountItem {
  id?: string | number
  account_id?: string | number
  account_name?: string
  bank_name?: string
  account_number?: string
  [key: string]: any
}

/** 线下转账收款账户响应 */
export type IOfflineBankAccountsResponse =
  | IOfflineBankAccountItem[]
  | {
      data?: IOfflineBankAccountItem[] | IOfflineBankAccountItem | Record<string, any>
      list?: IOfflineBankAccountItem[]
      [key: string]: any
    }

export class PaymentApiClient {
  private $api: any

  constructor() {}

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * 获取支付方式列表
   * GET /trade/payment/list
   * Query: platform, company_id（插件）, country_code
   */
  async getPaymentMethodList(params?: IGetPaymentListParams): Promise<IGetPaymentListResponse> {
    const query: Record<string, string> = {
      platform: params?.platform ?? 'pc',
    }
    return this.http('/wxapp/trade/payment/list', {
      method: 'GET',
      query,
    })
  }

  /**
   * 查询订单信息
   * GET /order_new/{orderId}
   * Query: pay_type, company_id（插件）, country_code
   */
  async getOrderInfo(
    orderId: string,
    params?: IGetOrderInfoParams
  ): Promise<IGetOrderInfoResponse> {
    const query: Record<string, string> = {
      pay_type: params?.pay_type ?? '',
    }
    return this.http(`/wxapp/order_new/${orderId}`, {
      method: 'GET',
      query,
    })
  }

  /**
   * 查询订单支付信息（获取支付码）
   * POST /payment
   * Body: order_id, pay_type, return_url, pay_channel, company_id（插件）, country_code
   */
  async getOrderPaymentInfo(
    body: IOrderPaymentInfoRequest,
    options?: any
  ): Promise<IOrderPaymentInfoResponse> {
    return this.http('/wxapp/payment', {
      method: 'POST',
      body: {
        order_id: body.order_id,
        pay_type: body.pay_type,
        return_url: body.return_url,
        pay_channel: body.pay_channel,
      },
      ...options,
    } as any)
  }

  /**
   * 获取线下转账收款账户
   * GET /order/offline/backaccount
   */
  async getOfflineBankAccounts(options?: any): Promise<IOfflineBankAccountsResponse> {
    return this.http('/wxapp/order/offline/backaccount', {
      method: 'GET',
      ...options,
    } as any)
  }
}

export const paymentApiClient = new PaymentApiClient()
