import type { UseFetchOptions } from 'nuxt/app'
import type { Ref } from 'vue'

// 基础 HTTP 选项接口
export interface HttpOptions {
  skipAuth?: boolean
  skipCompanyId?: boolean
  headers?: Record<string, string>
  query?: Record<string, any>
  body?: any
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  timeout?: number
}

// useHttp Composable 选项接口
export interface UseHttpOptions<T = any> extends Omit<UseFetchOptions<T>, '$fetch'> {
  skipAuth?: boolean
  skipCompanyId?: boolean
}

// HTTP 响应状态接口
export interface UseHttpReturn<T> {
  data: Ref<T | null>
  pending: Ref<boolean>
  error: Ref<Error | null>
  refresh: () => Promise<void>
  execute: () => Promise<void>
}

// API 响应基础结构
export interface IApiResponse<T = any> {
  status_code: number
  message: string
  data: T
  timestamp?: string
  request_id?: string
}

// 分页响应结构
export interface IPaginatedResponse<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// API 错误接口
export interface IApiError extends Error {
  status?: number
  statusText?: string
  code?: string
  details?: any
  url?: string
  method?: string
}

// HTTP 状态枚举
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

// 请求方法枚举
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

// 内容类型枚举
export enum ContentType {
  JSON = 'application/json',
  FORM_URLENCODED = 'application/x-www-form-urlencoded',
  MULTIPART_FORM_DATA = 'multipart/form-data',
  TEXT_PLAIN = 'text/plain',
  TEXT_HTML = 'text/html',
  APPLICATION_XML = 'application/xml',
}

// HTTP 客户端配置接口
export interface HttpClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  skipAuth?: boolean
  skipCompanyId?: boolean
  retries?: number
  retryDelay?: number
}

// 请求拦截器类型
export type RequestInterceptor = (options: any) => void | Promise<void>

// 响应拦截器类型
export type ResponseInterceptor = (response: any) => void | Promise<void>

// 错误拦截器类型
export type ErrorInterceptor = (error: any) => void | Promise<void>

// 拦截器管理接口
export interface InterceptorManager {
  request: RequestInterceptor[]
  response: ResponseInterceptor[]
  error: ErrorInterceptor[]
}

// HTTP 方法封装接口
export interface HttpMethods {
  get<T = any>(url: string, options?: UseHttpOptions<T>): UseHttpReturn<T>
  post<T = any>(url: string, body?: any, options?: UseHttpOptions<T>): UseHttpReturn<T>
  put<T = any>(url: string, body?: any, options?: UseHttpOptions<T>): UseHttpReturn<T>
  delete<T = any>(url: string, options?: UseHttpOptions<T>): UseHttpReturn<T>
  patch<T = any>(url: string, body?: any, options?: UseHttpOptions<T>): UseHttpReturn<T>
}

// 条件请求选项
export interface ConditionalHttpOptions<T = any> extends UseHttpOptions<T> {
  condition: Ref<boolean> | ComputedRef<boolean> | (() => boolean)
}

// 批量请求接口
export interface BatchRequestConfig<T = any> {
  url: string
  method?: HttpMethod
  body?: any
  options?: UseHttpOptions<T>
}

// 批量请求结果
export interface BatchRequestResult<T = any> {
  success: boolean
  data?: T
  error?: IApiError
  index: number
}

// 上传文件选项
export interface UploadOptions extends Omit<UseHttpOptions<any>, 'body'> {
  file: File | Blob
  field?: string
  filename?: string
  onProgress?: (progress: number) => void
}

// 下载文件选项
export interface DownloadOptions extends UseHttpOptions<Blob> {
  filename?: string
  onProgress?: (progress: number) => void
}

// 缓存策略枚举
export enum CacheStrategy {
  NO_CACHE = 'no-cache',
  FORCE_CACHE = 'force-cache',
  CACHE_FIRST = 'cache-first',
  NETWORK_FIRST = 'network-first',
  STALE_WHILE_REVALIDATE = 'stale-while-revalidate',
}

// 缓存选项接口
export interface CacheOptions {
  strategy?: CacheStrategy
  ttl?: number // 缓存时间 (秒)
  key?: string // 自定义缓存键
  tags?: string[] // 缓存标签
}

// 扩展的 HTTP 选项 (包含缓存)
export interface ExtendedHttpOptions<T = any> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  query?: Record<string, any>
  headers?: Record<string, string>
  server?: boolean
  key?: string
  skipAuth?: boolean
  skipCompanyId?: boolean
  cache?: CacheOptions
  customRetry?: {
    attempts?: number
    delay?: number
    backoff?: boolean
  }
}
