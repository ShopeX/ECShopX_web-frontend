// 通用响应类型
export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 分页参数
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// 分页响应
export interface PaginationResponse<T> {
  total: number
  items: T[]
  page: number
  pageSize: number
}

// 环境配置
export interface RuntimeConfig {
  apiBase: string
  apiTimeout: number
  env: 'development' | 'production' | 'test'
}

// 用户信息
export interface User {
  id: string
  username: string
  avatar?: string
  roles: string[]
}
