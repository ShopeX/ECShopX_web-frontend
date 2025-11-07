# useHttp.ts vs plugins/http.ts 功能对比分析

## 概述

本文档分析 `composables/useHttp.ts` 和 `plugins/http.ts` 的功能差异，评估是否可以安全移除 `useHttp`。

## 功能对比表

| 功能分类 | useHttp.ts | plugins/http.ts | 缺失? |
|---------|-----------|----------------|-------|
| **基础功能** | | | |
| 请求拦截器 | ✅ | ✅ | ❌ |
| 响应拦截器 | ✅ | ✅ | ❌ |
| 错误拦截器 | ✅ | ✅ | ❌ |
| 添加 Auth Token | ✅ | ✅ | ❌ |
| 添加 Company ID | ✅ | ✅ | ❌ |
| **高级功能** | | | |
| 自动重试机制 | ✅ 指数退避 | ❌ | ✅ **缺失** |
| 业务状态码检查 | ✅ code === 0 | ❌ | ✅ **缺失** |
| 统一错误类型 | ✅ ErrorType枚举 | ⚠️ 部分 | ⚠️ **不完整** |
| 响应式状态管理 | ✅ data/error/pending | ❌ | ✅ **缺失** |
| Transform 数据转换 | ✅ | ❌ | ✅ **缺失** |
| 消息提示集成 | ✅ | ⚠️ TODO注释 | ⚠️ **未实现** |
| **错误处理** | | | |
| HTTP 错误分类 | ✅ 详细分类 | ✅ 基本分类 | ❌ |
| 业务错误处理 | ✅ | ❌ | ✅ **缺失** |
| 可重试错误判断 | ✅ | ❌ | ✅ **缺失** |
| 自定义错误消息 | ✅ | ❌ | ✅ **缺失** |
| **日志记录** | | | |
| 请求日志 | ✅ | ✅ | ❌ |
| 响应日志 | ✅ | ✅ | ❌ |
| 错误日志 | ✅ | ✅ | ❌ |
| 重试日志 | ✅ | ❌ | ✅ **缺失** |

## 详细功能分析

### 1. 🔴 **自动重试机制**（关键缺失）

**useHttp.ts 提供：**
```typescript
// 重试配置
interface RetryConfig {
  maxRetries?: number          // 最大重试次数，默认3
  baseDelay?: number          // 基础延迟时间(ms)，默认1000
  maxDelay?: number           // 最大延迟时间(ms)，默认5000
  backoffFactor?: number      // 退避因子，默认2
  retryCondition?: (error: any) => boolean
}

// 指数退避算法 + 随机抖动
const calculateRetryDelay = (attempt: number, config: RetryConfig): number => {
  const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt - 1)
  const jitteredDelay = exponentialDelay + Math.random() * 1000
  return Math.min(jitteredDelay, maxDelay)
}

// 自动重试逻辑
for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
  try {
    const response = await $api(url, options)
    return response
  } catch (err) {
    if (isLastAttempt || !shouldRetry) break
    await delay(retryDelay)
  }
}
```

**plugins/http.ts：** ❌ **完全没有重试功能**

**影响：** 网络不稳定时，请求可能直接失败，没有自动恢复能力。

---

### 2. 🔴 **业务状态码检查**（关键缺失）

**useHttp.ts 提供：**
```typescript
// 标准 API 响应格式
interface ApiResponse<T> {
  code: number | string    // 业务状态码
  message: string          // 响应消息
  data: T                  // 响应数据
}

// 自动检查业务状态码
if (response.code === 0 || response.code === '0') {
  // 业务成功，返回 data
  return response.data
} else {
  // 业务失败，抛出错误
  throw new BusinessError(response.message, response.code)
}
```

**plugins/http.ts：** ❌ **没有业务状态码检查**
- 只检查 HTTP 状态码（200, 401, 500 等）
- 不检查业务状态码（code: 0 表示成功，code: -1 表示失败等）

**影响：** 需要在每个 API 调用后手动检查 `response.code`，代码重复。

---

### 3. 🟡 **错误类型分类**（部分缺失）

**useHttp.ts 提供：**
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

**plugins/http.ts：**
```typescript
// 只有简单的状态码判断
if (response?.status === 401) { /* 未授权 */ }
else if (response?.status === 403) { /* 权限错误 */ }
else if (response?.status === 404) { /* 资源不存在 */ }
else if (response?.status >= 500) { /* 服务器错误 */ }
```

**影响：** 错误处理不够精细，难以针对不同错误类型做差异化处理。

---

### 4. 🟡 **消息提示集成**（未实现）

**useHttp.ts 提供：**
```typescript
// 自动显示成功/错误消息
interface ResponseHandler<T> {
  showSuccessMessage?: boolean
  showErrorMessage?: boolean
  successMessage?: string
  errorMessages?: Record<string | number, string>
}

// 自动调用 message.success() 或 message.error()
if (success && showSuccessMessage) {
  message.success(successMessage)
}
if (error && showErrorMessage) {
  message.error(errorMessages[code] || defaultMessage)
}
```

**plugins/http.ts：**
```typescript
// 只有 TODO 注释，未实际实现
const message = response.headers.get('X-Message')
if (message) {
  // TODO: 集成消息提示系统
  console.info('[API Message]', message)
}
```

**影响：** 需要在每个 Composable 中手动调用 `message.success/error`。

---

### 5. 🔴 **数据转换功能**（缺失）

**useHttp.ts 提供：**
```typescript
interface UseHttpOptions<T> {
  transform?: (input: any) => T  // 自动转换响应数据
}

// 使用示例
const { data } = useHttp('/api/users', {
  transform: (response) => response.data.users.map(toUserModel)
})
```

**plugins/http.ts：** ❌ **没有 transform 功能**

**影响：** 数据转换必须在 API Client 或 Composable 中手动处理。

---

### 6. ⚪ **响应式状态管理**（不重要）

**useHttp.ts 提供：**
```typescript
const { data, error, pending, refresh } = useHttp('/api/users')

watch(data, (newData) => {
  // 自动响应数据变化
})
```

**plugins/http.ts：** ❌ **返回 Promise，无响应式状态**

**影响：** 需要在 Composable 中手动管理 `loading`、`error` 状态。

**评估：** 当前架构已经在 Composable 层管理状态，这个功能不是必需的。

---

## 关键缺失功能汇总

### 🔴 严重缺失（影响稳定性和开发体验）

1. **自动重试机制** - 网络不稳定时缺乏恢复能力
2. **业务状态码检查** - 需要大量重复代码手动检查

### 🟡 中等缺失（影响代码质量）

3. **统一错误类型** - 错误处理不够精细
4. **消息提示集成** - 需要手动调用 message API

### ⚪ 轻微缺失（可接受）

5. **数据转换功能** - Transformer 层已经处理
6. **响应式状态管理** - Composable 层已经处理

---

## 建议方案

### 方案 A：增强 plugins/http.ts（推荐）✅

**在 `plugins/http.ts` 中补充关键功能：**

1. ✅ 添加自动重试机制（指数退避）
2. ✅ 添加业务状态码检查（code === 0）
3. ✅ 完善错误类型分类
4. ✅ 集成消息提示系统

**优点：**
- 保持现有架构，改动最小
- 所有 API 调用自动获得增强功能
- 类型更简单（返回 Promise）

**缺点：**
- 需要修改 plugin 代码
- 增加 plugin 复杂度

---

### 方案 B：保留 useHttp 作为可选工具

**在特殊场景使用 useHttp：**
- 需要响应式状态的简单 API 调用
- 需要自定义重试策略的请求
- 需要复杂响应处理的场景

**优点：**
- 灵活性高，两种方式并存
- 保留已有功能

**缺点：**
- 增加代码复杂度
- 开发者需要选择使用哪个工具
- 维护成本高

---

### 方案 C：完全移除 useHttp（不推荐）❌

**直接移除，不做补充：**

**优点：**
- 代码最简洁

**缺点：**
- 失去重要功能（自动重试、业务状态码检查）
- 需要大量手动代码
- 降低系统稳定性

---

## 最终推荐

**采用方案 A：增强 plugins/http.ts** ✅

### 具体实施步骤：

1. **迁移重试机制** - 从 useHttp 移植到 plugin
2. **添加业务状态码检查** - 自动解包 `response.data`
3. **完善错误处理** - 统一错误类型和消息
4. **集成消息提示** - 实现 TODO 部分
5. **保留类型定义** - 将有用的类型移到 `types/http.ts`
6. **删除 useHttp.ts** - 清理不再使用的代码

### 预期效果：

```typescript
// 之前：需要手动检查
const response = await authApiClient.login(params)
if (response.code !== 0) {
  throw new Error(response.message)
}
return response.data

// 之后：自动处理
const data = await authApiClient.login(params)
// 自动检查 code，自动重试，自动解包 data
return data
```

---

## 总结

**plugins/http.ts 缺失的关键功能：**
1. 🔴 自动重试机制（严重）
2. 🔴 业务状态码检查（严重）
3. 🟡 统一错误类型（中等）
4. 🟡 消息提示集成（中等）

**建议：先增强 plugin，再移除 useHttp。**

