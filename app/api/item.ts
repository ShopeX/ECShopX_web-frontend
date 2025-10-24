import type { IItemListParams, IItemListResponse, IItemListApiResponse, IItemDetailParams, IItemDetailResponse } from '~/types/api/item'

import { http } from '~/utils/http'
import { itemDetailTransformer, transformPagination } from '~/transformers'

// API 错误类型定义
interface ApiError extends Error {
  status?: number
  code?: string
  details?: any
}

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 5000,  // 5秒
  backoffFactor: 2
}

// 错误分类：可重试的错误状态码
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504]

// 日志记录函数
const logApiRequest = (method: string, url: string, params?: any) => {
  console.log(`[API] ${method.toUpperCase()} ${url}`, params ? { params } : '')
}

const logApiResponse = (method: string, url: string, duration: number, success: boolean, error?: any) => {
  const status = success ? 'SUCCESS' : 'ERROR'
  console.log(`[API] ${method.toUpperCase()} ${url} - ${status} (${duration}ms)`, error ? { error: error.message } : '')
}

const logApiRetry = (attempt: number, maxRetries: number, delay: number, error: any) => {
  console.warn(`[API] Retry ${attempt}/${maxRetries} after ${delay}ms. Error:`, error.message)
}

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 计算重试延迟（指数退避）
const calculateRetryDelay = (attempt: number): number => {
  const exponentialDelay = RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt - 1)
  const jitteredDelay = exponentialDelay + Math.random() * 1000 // 添加随机延迟避免雪崩
  return Math.min(jitteredDelay, RETRY_CONFIG.maxDelay)
}

// 判断错误是否可重试
const isRetryableError = (error: any): boolean => {
  // 网络错误
  if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
    return true
  }

  // HTTP状态码错误
  if (error.status && RETRYABLE_STATUS_CODES.includes(error.status)) {
    return true
  }

  // 超时错误
  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
    return true
  }

  return false
}

// 增强的API请求函数
const apiRequestWithRetry = async <T>(
  requestFn: () => Promise<T>,
  endpoint: string,
  method: string = 'GET'
): Promise<T> => {
  const startTime = Date.now()
  let lastError: ApiError

  logApiRequest(method, endpoint)

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries + 1; attempt++) {
    try {
      const result = await requestFn()
      const duration = Date.now() - startTime
      logApiResponse(method, endpoint, duration, true)
      return result
    } catch (error: any) {
      lastError = error as ApiError
      const duration = Date.now() - startTime

      // 如果是最后一次尝试，或者错误不可重试，直接抛出
      if (attempt > RETRY_CONFIG.maxRetries || !isRetryableError(error)) {
        logApiResponse(method, endpoint, duration, false, error)
        throw createEnhancedError(error, endpoint, method, attempt - 1)
      }

      // 计算延迟并重试
      const retryDelay = calculateRetryDelay(attempt)
      logApiRetry(attempt, RETRY_CONFIG.maxRetries, retryDelay, error)
      await delay(retryDelay)
    }
  }

  // 理论上不会到达这里，但为了类型安全
  throw createEnhancedError(lastError!, endpoint, method, RETRY_CONFIG.maxRetries)
}

// 创建增强的错误对象
const createEnhancedError = (originalError: any, endpoint: string, method: string, retryCount: number): ApiError => {
  const enhancedError: ApiError = new Error(
    `API ${method.toUpperCase()} ${endpoint} failed after ${retryCount} retries: ${originalError.message}`
  )

  enhancedError.name = 'ApiError'
  enhancedError.status = originalError.status
  enhancedError.code = originalError.code
  enhancedError.details = {
    endpoint,
    method,
    retryCount,
    originalError: {
      message: originalError.message,
      status: originalError.status,
      code: originalError.code
    }
  }

  return enhancedError
}

export function useItemApi() {
  return {
    // 获取商品列表 - 使用实际API路径
    getList(params: IItemListParams) {
      // 构建正确的API参数
      const apiParams = {
        page: params.page,
        pageSize: params.pageSize,
        item_type: params.item_type,
        main_category: params.main_category,
        is_tdk: params.is_tdk,
        type: params.type,
        company_id: params.company_id,
        // 可选参数
        ...(params.brand_id && { brand_id: params.brand_id }),
        ...(params.sort && { sort: params.sort }),
        ...(params.start_price && { start_price: params.start_price }),
        ...(params.end_price && { end_price: params.end_price }),
        ...(params.keywords && { keywords: params.keywords })
      }

      return http.get<IItemListApiResponse>('/goods/items', {
        params: apiParams,
        // SSR 配置
        server: true,
        // 缓存配置
        cache: 'no-cache'
      })
    },

    // 获取商品详情
    getDetail(params: IItemDetailParams) {
      return http.get<IItemDetailResponse>(`/goods/items/${params.id}`, {
        // SSR 配置
        server: true,
        // 缓存配置
        cache: 'no-cache',
        // 转换响应数据
        transform: (response: IItemDetailResponse) => {
          return {
            item: itemDetailTransformer.transform(response.item)
          }
        }
      })
    }
  }
} 