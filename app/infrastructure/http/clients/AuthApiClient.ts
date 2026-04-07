import type {
  ILoginRequest,
  IPhoneLoginRequest,
  ISmsCodeRequest,
  ILogoutRequest,
  ILoginResponse,
  ISmsCodeResponseData,
  ICaptchaRequest,
  ICaptchaResponse,
  ILogoutResponse,
  IGetUserInfoResponse,
} from '~/types/api/auth'

/**
 * 认证 HTTP 客户端
 *
 * 职责：
 * - 封装认证相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 *
 * 设计原则：
 * - 纯粹的 HTTP 调用层
 * - 不包含业务逻辑
 * - 不包含数据转换
 * - 职责单一，易于测试
 *
 * @example
 * ```typescript
 * const client = new AuthApiClient()
 * const response = await client.login({ username: 'admin', password: '123456', captcha: '1234', captchaKey: 'xxx' })
 * // response 是原始 API 响应，需要在 Transformer 层转换
 * ```
 */
export class AuthApiClient {
  private $api: any

  constructor() {
    // 不在构造函数中初始化，延迟到第一次使用时
  }

  /**
   * 获取 HTTP 实例（延迟初始化，SSR 安全）
   */
  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * 账号密码登录
   *
   * @param params - 登录请求参数
   * @returns 登录响应数据（HTTP 插件已自动解包 data 字段）
   *
   * @example
   * ```typescript
   * const response = await client.login({
   *   username: '13917609856',
   *   password: '123456'
   *   // company_id 由 HTTP 插件自动添加
   * })
   * // response = { token: 'xxx' }，已自动解包
   * ```
   */
  async login(params: ILoginRequest): Promise<ILoginResponse> {
    return this.http('/wxapp/login', {
      method: 'POST',
      body: params,
      // ✅ company_id 和 Content-Type 由 HTTP 插件统一处理
    })
  }

  /**
   * 手机验证码登录
   *
   * @param params - 手机登录请求参数
   * @returns 登录响应数据（HTTP 插件已自动解包 data 字段）
   *
   * @example
   * ```typescript
   * const response = await client.loginWithPhone({
   *   phone: '13800138000',
   *   smsCode: '123456'
   * })
   * // response = { token: 'xxx' }，已自动解包
   * ```
   */
  async loginWithPhone(params: IPhoneLoginRequest): Promise<ILoginResponse> {
    return this.http('/wxapp/auth/login/phone', {
      method: 'POST',
      body: params,
    })
  }

  /**
   * 获取图形验证码
   *
   * @param params - 验证码请求参数
   * @returns 验证码图片和 token
   *
   * @example
   * ```typescript
   * const response = await client.getCaptcha({ type: 'login' })
   * // company_id 由 HTTP 插件自动添加
   * const { imageData, imageToken } = response.data
   * ```
   */
  async getCaptcha(_params: ICaptchaRequest): Promise<{ data: ICaptchaResponse }> {
    return this.http('/wxapp/distributor/image/code', {
      method: 'GET',
      cache: 'no-cache', // 验证码不缓存
    })
  }

  /**
   * 发送短信验证码
   *
   * @param params - 发送短信请求参数
   * @returns 发送结果
   *
   * @example
   * ```typescript
   * await client.sendSmsCode({
   *   type: 'login',
   *   mobile: '13917609856',
   *   yzm: 'yGM6',
   *   token: '7c4175f1cde1ac20703421ffd1c7cf6d'
   *   // company_id 由 HTTP 插件自动添加
   * })
   * ```
   */
  async sendSmsCode(params: ISmsCodeRequest): Promise<{ data: ISmsCodeResponseData }> {
    return this.http('/wxapp/member/sms/code', {
      method: 'GET',
      params: params,
    })
  }

  /**
   * 登出
   *
   * @param params - 登出请求参数（可选）
   * @returns 登出结果
   *
   * @example
   * ```typescript
   * await client.logout()
   * ```
   */
  async logout(params?: ILogoutRequest): Promise<ILogoutResponse> {
    return this.http('/wxapp/auth/logout', {
      method: 'POST',
      body: params,
    })
  }

  /**
   * 获取当前用户信息
   *
   * @returns 用户信息
   *
   * @example
   * ```typescript
   * const userInfo = await client.getUserInfo()
   * ```
   */
  async getUserInfo(): Promise<IGetUserInfoResponse> {
    return this.http('/wxapp/member', {
      method: 'GET',
      cache: 'default',
    })
  }

  /**
   * 刷新 Token
   *
   * @param refreshToken - Refresh Token
   * @returns 新的 Token 信息（HTTP 插件已自动解包 data 字段）
   *
   * @example
   * ```typescript
   * const response = await client.refreshToken('refresh-token-xxx')
   * const { token } = response  // 已自动解包
   * ```
   */
  async refreshToken(refreshToken: string): Promise<ILoginResponse> {
    return this.http('/wxapp/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    })
  }
}

// 导出单例实例
export const authApiClient = new AuthApiClient()
