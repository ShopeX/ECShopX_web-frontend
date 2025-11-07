# plugins/http.ts 增强计划

## 对比分析：useHttp.ts vs plugins/http.ts

### 🔴 **关键缺失功能**

| 功能 | useHttp.ts | plugins/http.ts | 优先级 |
|-----|-----------|----------------|-------|
| **业务状态码检查** | ✅ `code === 0` 自动检查 | ❌ 无 | 🔴 高 |
| **自动数据解包** | ✅ 返回 `response.data` | ❌ 返回整个响应 | 🔴 高 |
| **自动重试机制** | ✅ 指数退避 + 抖动 | ❌ 无 | 🔴 高 |
| **错误类型分类** | ✅ 9种错误类型 | ⚠️ 基本分类 | 🟡 中 |
| **消息提示集成** | ✅ 自动调用 message | ⚠️ TODO 注释 | 🟡 中 |
| **请求日志** | ✅ 详细日志 | ✅ 基本日志 | ✅ 已有 |
| **认证处理** | ✅ Token | ✅ Token | ✅ 已有 |

---

## 详细功能对比

### 1️⃣ **业务状态码检查**（最重要）

#### useHttp.ts 的实现：
```typescript
// 检查是否为业务成功响应
const isBusinessSuccess = (data: any, successCodes: (number | string)[] = [0, '0']): boolean => {
  if (!data || typeof data !== 'object') return false
  return successCodes.includes(data.code)
}

// 处理响应
if (isBusinessSuccess(apiResponse, successCodes)) {
  // 业务成功：返回 data
  return apiResponse.data
} else {
  // 业务失败：抛出错误
  throw new BusinessError(apiResponse.message, apiResponse.code)
}
```

#### plugins/http.ts 当前：
```typescript
// ❌ 没有业务状态码检查，直接返回整个响应
onResponse({ response }) {
  // 只处理 HTTP 头，不检查 response._data.code
  const token = response.headers.get('X-Token')
  if (token) useCookie('token').value = token
}
```

**问题：** API Client 需要手动写这样的代码：
```typescript
async login(params) {
  const response = await this.$api('/auth/login', { method: 'POST', body: params })
  if (response.code !== 0) {
    throw new Error(response.message)
  }
  return response.data  // 手动解包
}
```

---

### 2️⃣ **自动重试机制**

#### useHttp.ts 的实现：
```typescript
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  backoffFactor: 2,
  retryCondition: (error: any) => {
    // 可重试的状态码
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504]
    if (error.status && retryableStatusCodes.includes(error.status)) {
      return true
    }
    // 网络错误、超时也可重试
    return error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT'
  }
}

// 指数退避 + 随机抖动
const calculateRetryDelay = (attempt: number, config: RetryConfig): number => {
  const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt - 1)
  const jitteredDelay = exponentialDelay + Math.random() * 1000
  return Math.min(jitteredDelay, maxDelay)
}

// 重试逻辑
for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
  try {
    return await $api(url, options)
  } catch (err) {
    if (shouldRetry && !isLastAttempt) {
      await delay(calculateRetryDelay(attempt, config))
      continue
    }
    throw err
  }
}
```

#### plugins/http.ts 当前：
```typescript
// ❌ 完全没有重试功能
```

**影响：** 网络不稳定时，请求直接失败，无法自动恢复。

---

### 3️⃣ **错误类型分类**

#### useHttp.ts 的实现：
```typescript
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',       // 网络错误
  HTTP_ERROR = 'HTTP_ERROR',             // HTTP状态码错误  
  BUSINESS_ERROR = 'BUSINESS_ERROR',     // 业务逻辑错误
  VALIDATION_ERROR = 'VALIDATION_ERROR', // 参数验证错误
  AUTH_ERROR = 'AUTH_ERROR',             // 认证错误
  PERMISSION_ERROR = 'PERMISSION_ERROR', // 权限错误
  SERVER_ERROR = 'SERVER_ERROR',         // 服务器错误
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',       // 超时错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'        // 未知错误
}

interface HttpError extends Error {
  type: ErrorType
  code?: number | string
  status?: number
  retry?: boolean
}
```

#### plugins/http.ts 当前：
```typescript
// ⚠️ 简单的状态码判断
if (response?.status === 401) { /* 未授权 */ }
else if (response?.status === 403) { /* 权限错误 */ }
else if (response?.status === 404) { /* 资源不存在 */ }
else if (response?.status >= 500) { /* 服务器错误 */ }
```

---

### 4️⃣ **消息提示集成**

#### useHttp.ts 的实现：
```typescript
// 自动显示错误消息
switch (httpError.type) {
  case ErrorType.AUTH_ERROR:
    message.error('登录已过期，请重新登录')
    break
  case ErrorType.PERMISSION_ERROR:
    message.error('权限不足，无法执行此操作')
    break
  case ErrorType.VALIDATION_ERROR:
    message.error(errorMsg || '请求参数有误')
    break
  case ErrorType.NETWORK_ERROR:
  case ErrorType.TIMEOUT_ERROR:
    message.error(errorMsg)
    break
  case ErrorType.SERVER_ERROR:
    message.error('服务器错误，请稍后重试')
    break
  default:
    message.error(errorMsg || '操作失败')
}
```

#### plugins/http.ts 当前：
```typescript
// ⚠️ 只有 TODO 注释
const message = response.headers.get('X-Message')
if (message) {
  // TODO: 集成消息提示系统
  console.info('[API Message]', message)
}
```

---

## 增强方案

### ✅ **方案：增强 plugins/http.ts**

将 useHttp.ts 的关键功能迁移到 plugins/http.ts，让所有 API 调用自动获得增强。

---

## 实施步骤

### Step 1: 创建类型定义文件

```typescript
// types/http.ts
export interface ApiResponse<T = any> {
  code: number | string
  message: string
  data: T
  timestamp?: number
  traceId?: string
}

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  HTTP_ERROR = 'HTTP_ERROR',
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface HttpError extends Error {
  type: ErrorType
  code?: number | string
  status?: number
  statusText?: string
  retry?: boolean
  details?: any
}
```

### Step 2: 增强 plugins/http.ts

```typescript
// plugins/http.ts (增强版)
import { defineNuxtPlugin, useRuntimeConfig, navigateTo, useCookie } from 'nuxt/app'
import type { ApiResponse, HttpError } from '~/types/http'
import { ErrorType } from '~/types/http'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // ============ 辅助函数 ============

  // 判断是否为业务成功响应
  const isBusinessSuccess = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false
    return data.code === 0 || data.code === '0'
  }

  // 创建业务错误
  const createBusinessError = (response: any): HttpError => {
    const error = new Error(response.message || '业务处理失败') as HttpError
    error.type = ErrorType.BUSINESS_ERROR
    error.code = response.code
    error.details = response
    error.retry = false
    return error
  }

  // 创建 HTTP 错误
  const createHttpError = (
    message: string,
    type: ErrorType,
    status?: number,
    details?: any
  ): HttpError => {
    const error = new Error(message) as HttpError
    error.type = type
    error.status = status
    error.details = details
    error.retry = [408, 429, 500, 502, 503, 504].includes(status || 0)
    return error
  }

  // 获取错误类型
  const getErrorType = (status: number): ErrorType => {
    if (status === 401) return ErrorType.AUTH_ERROR
    if (status === 403) return ErrorType.PERMISSION_ERROR
    if (status === 422) return ErrorType.VALIDATION_ERROR
    if (status >= 500) return ErrorType.SERVER_ERROR
    return ErrorType.HTTP_ERROR
  }

  // 显示错误消息（如果需要）
  const showErrorMessage = async (error: HttpError) => {
    // 只在客户端显示消息
    if (import.meta.server) return

    try {
      const { useMessage } = await import('~/composables/useMessage')
      const message = useMessage()

      switch (error.type) {
        case ErrorType.AUTH_ERROR:
          message.error('登录已过期，请重新登录')
          break
        case ErrorType.PERMISSION_ERROR:
          message.error('权限不足，无法执行此操作')
          break
        case ErrorType.VALIDATION_ERROR:
          message.error('请求参数有误')
          break
        case ErrorType.NETWORK_ERROR:
        case ErrorType.TIMEOUT_ERROR:
          message.error('网络连接失败，请检查网络设置')
          break
        case ErrorType.SERVER_ERROR:
          message.error('服务器错误，请稍后重试')
          break
        case ErrorType.BUSINESS_ERROR:
          message.error(error.message || '操作失败')
          break
        default:
          message.error(error.message || '请求失败')
      }
    } catch (err) {
      console.error('Failed to show error message:', err)
    }
  }

  // ============ 创建 $fetch 实例 ============

  const $api = $fetch.create({
    baseURL: config.public.apiBase || '/api',
    timeout: (config.public.apiTimeout as number) || 10000,

    // 默认重试配置
    retry: 3,
    retryDelay: 1000,
    retryStatusCodes: [408, 429, 500, 502, 503, 504],

    onRequest({ options }) {
      // 添加认证头
      if (!(options as any).skipAuth) {
        const token = useCookie('token').value
        if (token) {
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
          } as any
        }
      }

      // 添加公司ID
      if (!(options as any).skipCompanyId && config.public.companyId) {
        options.query = {
          ...options.query,
          company_id: config.public.companyId,
        }
      }

      // 请求日志
      console.log(`[API Request] ${options.method || 'GET'} ${options.baseURL}${(options as any).url || ''}`)
    },

    async onResponse({ response }) {
      // 响应日志
      console.log(`[API Response] ${response.status} ${response.url}`)

      // 处理响应头
      const token = response.headers.get('X-Token')
      if (token) useCookie('token').value = token

      const refreshToken = response.headers.get('X-Refresh-Token')
      if (refreshToken) useCookie('refresh-token').value = refreshToken

      // ✅ 业务状态码检查
      const data = response._data
      if (data && typeof data === 'object' && 'code' in data) {
        if (!isBusinessSuccess(data)) {
          // 业务失败：抛出错误
          const error = createBusinessError(data)
          await showErrorMessage(error)
          throw error
        }

        // ✅ 业务成功：自动解包 data
        // 直接修改 response._data，返回 data 字段
        response._data = data.data
      }
    },

    async onResponseError({ response, error }) {
      // 错误日志
      console.error(`[API Error] ${response?.status || 'Network'} ${response?.url || ''}`)

      // 创建标准错误对象
      let httpError: HttpError

      if (response) {
        const errorType = getErrorType(response.status)
        const message = response._data?.message || response.statusText || '请求失败'
        
        httpError = createHttpError(message, errorType, response.status, response._data)

        // 特殊处理：401 跳转登录
        if (response.status === 401 && import.meta.client) {
          navigateTo('/login')
        }
      } else if (error.message?.includes('timeout')) {
        httpError = createHttpError(
          '请求超时，请检查网络连接',
          ErrorType.TIMEOUT_ERROR
        )
      } else if (error.message?.includes('Network')) {
        httpError = createHttpError(
          '网络连接失败，请检查网络设置',
          ErrorType.NETWORK_ERROR
        )
      } else {
        httpError = createHttpError(
          error.message || '未知错误',
          ErrorType.UNKNOWN_ERROR
        )
      }

      // 显示错误消息
      await showErrorMessage(httpError)

      // 重新抛出错误
      throw httpError
    },
  })

  return {
    provide: {
      api: $api,
    },
  }
})
```

---

## 核心改进点

### ✅ **1. 业务状态码自动检查**
```typescript
// 之前：需要手动检查
const response = await this.$api('/auth/login', { ... })
if (response.code !== 0) throw new Error(response.message)
return response.data

// 之后：自动处理
const data = await this.$api('/auth/login', { ... })
// 自动检查 code，自动抛出错误，自动解包 data
return data
```

### ✅ **2. 自动重试**
```typescript
// ofetch 内置重试支持
$fetch.create({
  retry: 3,                           // 最多重试 3 次
  retryDelay: 1000,                   // 延迟 1 秒
  retryStatusCodes: [408, 429, 500, 502, 503, 504]
})
```

### ✅ **3. 统一错误处理**
```typescript
// 自动分类错误类型
// 自动显示错误消息
// 401 自动跳转登录
```

### ✅ **4. 类型安全**
```typescript
// types/http.ts 提供统一的类型定义
export interface ApiResponse<T> { ... }
export enum ErrorType { ... }
export interface HttpError extends Error { ... }
```

---

## 迁移影响

### ✅ **好消息：API Client 代码大幅简化**

#### 之前：
```typescript
async login(params: ILoginRequest): Promise<ILoginResponse> {
  const response = await this.http('/auth/login', {
    method: 'POST',
    body: params,
  })
  
  // 需要手动检查
  if (response.code !== 0) {
    throw new Error(response.message)
  }
  
  // 需要手动解包
  return response.data
}
```

#### 之后：
```typescript
async login(params: ILoginRequest): Promise<ILoginResponse> {
  // 自动检查 code，自动解包 data
  return this.http('/auth/login', {
    method: 'POST',
    body: params,
  })
}
```

**简化了 30-40% 的代码！**

---

## 实施清单

- [ ] Step 1: 更新 `types/http.ts` - 添加类型定义
- [ ] Step 2: 增强 `plugins/http.ts` - 实现核心功能
- [ ] Step 3: 测试 API Client - 验证自动解包
- [ ] Step 4: 测试错误处理 - 验证错误分类和消息
- [ ] Step 5: 测试重试机制 - 模拟网络错误
- [ ] Step 6: 删除 `useHttp.ts` - 清理不再使用的代码
- [ ] Step 7: 更新文档 - 记录新的使用方式

---

## 注意事项

### ⚠️ **ofetch 的重试限制**

ofetch 的内置重试功能相对简单：
- ✅ 支持重试次数
- ✅ 支持重试延迟
- ✅ 支持状态码判断
- ❌ 不支持指数退避
- ❌ 不支持随机抖动

**评估：** 对于大多数场景，简单的重试已经足够。如果未来需要更复杂的重试策略，可以考虑自己实现。

### ⚠️ **自动解包的兼容性**

某些特殊 API 可能不符合标准格式，需要提供选项跳过自动解包：
```typescript
// 特殊 API：不自动解包
const rawResponse = await $api('/special-api', {
  skipAutoUnwrap: true  // 需要实现这个选项
})
```

---

## 总结

**增强后的 plugins/http.ts 将提供：**
1. ✅ 业务状态码自动检查（code === 0）
2. ✅ 自动数据解包（返回 data）
3. ✅ 自动重试机制（网络错误恢复）
4. ✅ 统一错误分类（9种错误类型）
5. ✅ 自动错误消息（集成 message）
6. ✅ 401 自动跳转登录
7. ✅ 完整的日志记录

**API Client 代码将简化 30-40%！**

