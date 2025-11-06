/**
 * 简体中文语言配置
 */

import type { ILocaleConfig, IMessages } from './types'

export const zhCN: ILocaleConfig = {
  code: 'zh-CN',
  name: 'Chinese (Simplified)',
  nativeName: '简体中文',
  direction: 'ltr',
  currencySymbol: '¥',
  currencyCode: 'CNY',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  enabled: true,
}

export const zhCNMessages: IMessages = {
  common: {
    confirm: '确认',
    cancel: '取消',
    submit: '提交',
    delete: '删除',
    edit: '编辑',
    save: '保存',
    search: '搜索',
    reset: '重置',
    loading: '加载中...',
    noData: '暂无数据',
    error: '错误',
    success: '成功',
  },

  cart: {
    title: '购物车',
    empty: '购物车是空的',
    addToCart: '加入购物车',
    removeFromCart: '从购物车移除',
    checkout: '去结算',
    total: '合计',
    subtotal: '小计',
    quantity: '数量',
    price: '价格',
    delete: '删除',
    selected: '已选',
    selectAll: '全选',
  },

  product: {
    detail: '商品详情',
    addToCart: '加入购物车',
    buyNow: '立即购买',
    stock: '库存',
    outOfStock: '已售罄',
    price: '价格',
    originalPrice: '原价',
    specifications: '规格',
  },

  user: {
    login: '登录',
    logout: '退出',
    register: '注册',
    profile: '个人中心',
    orders: '我的订单',
    favorites: '我的收藏',
    settings: '设置',
  },
}

