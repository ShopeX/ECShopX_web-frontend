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
export interface ApiResponse<T = any> {
  status_code: number
  data: T
  message?: string
} 