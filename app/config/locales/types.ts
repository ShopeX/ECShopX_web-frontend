/**
 * 多语言配置类型定义
 * 
 * 支持：
 * - 多语言切换
 * - RTL（从右到左）布局支持
 * - 货币和日期格式化
 */

/**
 * 语言方向
 */
export type TextDirection = 'ltr' | 'rtl'

/**
 * 语言配置接口
 */
export interface ILocaleConfig {
  /** 语言代码（如 'zh-CN', 'en-US', 'ar-SA'） */
  code: string
  /** 语言名称 */
  name: string
  /** 本地化名称（用该语言显示的名称） */
  nativeName: string
  /** 文本方向 */
  direction: TextDirection
  /** 货币符号 */
  currencySymbol: string
  /** 货币代码（ISO 4217） */
  currencyCode: string
  /** 日期格式 */
  dateFormat: string
  /** 时间格式 */
  timeFormat: string
  /** 是否启用 */
  enabled: boolean
}

/**
 * 翻译消息类型
 */
export interface IMessages {
  // 通用
  common: {
    confirm: string
    cancel: string
    submit: string
    delete: string
    edit: string
    save: string
    search: string
    reset: string
    loading: string
    noData: string
    error: string
    success: string
  }

  // 购物车
  cart: {
    title: string
    empty: string
    addToCart: string
    removeFromCart: string
    checkout: string
    total: string
    subtotal: string
    quantity: string
    price: string
    delete: string
    selected: string
    selectAll: string
  }

  // 产品
  product: {
    detail: string
    addToCart: string
    buyNow: string
    stock: string
    outOfStock: string
    price: string
    originalPrice: string
    specifications: string
  }

  // 用户
  user: {
    login: string
    logout: string
    register: string
    profile: string
    orders: string
    favorites: string
    settings: string
  }
}

