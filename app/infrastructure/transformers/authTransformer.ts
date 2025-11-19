import type {
  ILoginResponse,
  IUserInfo,
  IGetUserInfoResponse,
  ISmsCodeResponse,
  ICaptchaResponse,
} from '~/types/api/auth'

/**
 * 认证数据转换器（轻量级 DDD）
 * 
 * 职责：
 * - API 数据 → 应用模型转换
 * - 数据验证和清洗
 * - 提供默认值处理
 * 
 * 不负责：
 * - ❌ 业务规则（由 Composable 负责）
 * - ❌ 格式化显示（由 Composable 负责）
 * - ❌ 业务计算（由 Composable 负责）
 * 
 * 特点：
 * - 纯函数，无副作用
 * - 只做数据结构转换
 * - 数据验证和默认值处理
 * 
 * @example
 * ```typescript
 * // API 数据转换为应用模型
 * const loginData = AuthTransformer.toLoginModel(apiResponse)
 * const userInfo = AuthTransformer.toUserInfoModel(apiUser)
 * ```
 */
export class AuthTransformer {
  /**
   * 登录响应数据 → 应用模型
   * 
   * @param apiResponse - API 返回的登录响应
   * @returns 登录数据模型
   */
  static toLoginModel(apiResponse: ILoginResponse): ILoginResponse {
    // 验证必需字段
    if (!apiResponse.token) {
      throw new Error('Invalid login response: missing token')
    }

    console.log('apiResponse',)


    // if (!apiResponse?.userInfo) {
    //   throw new Error('Invalid login response: missing userInfo')
    // }

    return {
      token: apiResponse.token,
      // userInfo: this.toUserInfoModel(apiResponse.userInfo),
      expiresIn: apiResponse.expiresIn || 7200,  // 默认 2 小时
      refreshToken: apiResponse.refreshToken || '',
    }
  }

  /**
   * 用户信息 → 应用模型
   * 
   * @param apiUser - API 返回的用户信息
   * @returns 用户信息模型
   */
  static toUserInfoModel(apiUser: IGetUserInfoResponse): IUserInfo {
    // 验证必需字段
    if (!apiUser.memberInfo.user_id) {
      throw new Error('Invalid user info: missing id')
    }

    return {
      user_id: apiUser.memberInfo.user_id,
      username: apiUser.memberInfo.username || '',
      mobile: apiUser.memberInfo.mobile || '',
      avatar: apiUser.memberInfo.avatar || this.getDefaultAvatar(),
    }
  }

  /**
   * 短信验证码响应 → 应用模型
   * 
   * @param apiResponse - API 返回的短信验证码响应
   * @returns 短信验证码响应模型
   */
  static toSmsCodeModel(apiResponse: ISmsCodeResponse): ISmsCodeResponse {
    return {
      success: apiResponse.success ?? false,
      message: apiResponse.message || '',
      expiresIn: apiResponse.expiresIn || 300,  // 默认 5 分钟
    }
  }

  /**
   * 图形验证码响应 → 应用模型
   * 
   * @param apiResponse - API 返回的图形验证码响应
   * @returns 图形验证码响应模型
   */
  static toCaptchaModel(apiResponse: ICaptchaResponse): ICaptchaResponse {
    // 验证必需字段
    if (!apiResponse.image || !apiResponse.key) {
      throw new Error('Invalid captcha response: missing image or key')
    }

    return {
      image: apiResponse.image,
      key: apiResponse.key,
      expiresIn: apiResponse.expiresIn || 300,  // 默认 5 分钟
    }
  }

  /**
   * 验证登录响应数据完整性
   * 
   * @param data - 登录响应数据
   * @returns 是否有效
   */
  static validateLoginResponse(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }

    // 检查必需字段
    if (!data.token || typeof data.token !== 'string') {
      return false
    }

    if (!data.userInfo || typeof data.userInfo !== 'object') {
      return false
    }

    return true
  }

  /**
   * 验证用户信息数据完整性
   * 
   * @param data - 用户信息数据
   * @returns 是否有效
   */
  static validateUserInfo(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }

    // 检查必需字段
    if (!data.id) {
      return false
    }

    return true
  }

  /**
   * 清理用户信息（移除敏感信息）
   * 
   * @param userInfo - 用户信息
   * @returns 清理后的用户信息
   */
  static sanitizeUserInfo(userInfo: IUserInfo): IUserInfo {
    // 移除可能的敏感信息（如果有）
    const sanitized = { ...userInfo }

    // 这里可以根据实际需求移除敏感字段
    // 例如：delete sanitized.password

    return sanitized
  }

  /**
   * 获取默认头像
   * 
   * @returns 默认头像 URL
   */
  private static getDefaultAvatar(): string {
    // 返回默认头像 URL（可以是占位图或默认图标）
    return '/images/default-avatar.png'
  }

  /**
   * 格式化手机号（脱敏）
   * 
   * @param phone - 手机号
   * @returns 脱敏后的手机号
   * 
   * @example
   * formatPhone('13800138000') // => '138****8000'
   */
  static formatPhone(phone: string): string {
    if (!phone || phone.length < 11) {
      return phone
    }
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }

  /**
   * 验证手机号格式
   * 
   * @param phone - 手机号
   * @returns 是否有效
   */
  static validatePhone(phone: string): boolean {
    const phoneReg = /^1[3-9]\d{9}$/
    return phoneReg.test(phone)
  }

  /**
   * 验证邮箱格式
   * 
   * @param email - 邮箱
   * @returns 是否有效
   */
  static validateEmail(email: string): boolean {
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailReg.test(email)
  }
}

