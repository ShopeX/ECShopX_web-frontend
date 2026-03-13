/**
 * 分页请求参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 分页响应数据
 */
export interface PaginationResponse<T> {
  list: T[]
  total_count: number
}

/**
 * API 响应数据
 */
export interface IApiResponse<T = any> {
  status_code: number
  data: T
  message?: string
}

/**
 * API 错误响应
 */
export interface IApiError {
  /** 错误码 */
  code: number
  /** 错误信息 */
  message: string
  /** 详细错误信息（开发环境） */
  details?: any
  /** 错误堆栈（开发环境） */
  stack?: string
}
