/**
 * 认证相关 API 类型定义
 * 基于 RESTful API 规范和常见认证模式
 */

/**
 * 账号密码登录请求
 */
export interface ILoginRequest {
  /** 用户名/账号 */
  username: string
  /** 密码 */
  password: string
  /** 图形验证码 */
  captcha?: string
  /** 图形验证码 key */
  captchaKey?: string
}

/**
 * 手机验证码登录请求
 */
export interface IPhoneLoginRequest {
  /** 手机号 */
  phone: string
  /** 短信验证码 */
  smsCode: string
}

/**
 * 短信验证码发送请求
 */
export interface ISmsCodeRequest {
  /** 手机号 */
  phone: string
  /** 图形验证码 */
  captcha: string
  /** 图形验证码 key */
  captchaKey: string
}

/**
 * 短信验证码发送响应
 */
export interface ISmsCodeResponse {
  /** 是否成功 */
  success: boolean
  /** 提示信息 */
  message: string
  /** 验证码有效期（秒） */
  expiresIn?: number
}

/**
 * 图形验证码响应
 */
export interface ICaptchaResponse {
  /** 验证码图片（base64 或 URL） */
  image: string
  /** 验证码 key（用于验证时提交） */
  key: string
  /** 验证码有效期（秒） */
  expiresIn?: number
}

/**
 * 用户信息
 */
export interface IUserInfo {
  /** 用户 ID */
  user_id: string | number
  /** 用户名 */
  username?: string
  /** 手机号 */
  mobile: string
  /** 头像 */
  avatar?: string
}

/**
 * 登录响应
 */
export interface ILoginResponse {
  /** JWT Token */
  token: string
  /** Token 过期时间（秒） */
  expiresIn?: number
  /** Refresh Token（可选） */
  refreshToken?: string
}

/**
 * 登出请求
 */
export interface ILogoutRequest {
  /** Token（可选，可从header获取） */
  token?: string
}

/**
 * 登出响应
 */
export interface ILogoutResponse {
  /** 是否成功 */
  success: boolean
  /** 提示信息 */
  message?: string
}


/**
 * 获取用户信息响应
 */
export interface IGetUserInfoResponse {
  /** 用户信息 */
  memberInfo: IUserInfo
}


