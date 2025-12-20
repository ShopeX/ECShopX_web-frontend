# Content-Type 处理规范

## 概述

本文档说明如何正确处理 API 请求的 Content-Type。

**项目规范**：本项目后端统一使用 `application/x-www-form-urlencoded` 格式，HTTP 插件默认自动处理所有请求。

## 问题背景

在对接登录接口时，APIfox 文档要求使用 `Content-Type: application/x-www-form-urlencoded` 格式。

### ❌ 错误做法（旧方案）

在 API Client 中手动设置 Content-Type：

```typescript
// authApiClient.ts
async login(params: ILoginRequest): Promise<ILoginResponse> {
  return this.http('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // ❌ 不推荐
    },
    body: params,
  })
}
```

### 问题分析

1. **重复代码**：如果多个接口需要相同的 Content-Type，需要在每个方法中重复设置
2. **容易遗漏**：开发者可能忘记设置，导致接口调用失败
3. **职责不清**：Content-Type 的处理应该是 HTTP 传输层的职责，不应该在 API Client 业务层处理
4. **不够优雅**：body 是普通对象，但需要手动设置 form-urlencoded 格式，容易出错

## ✅ 正确方案（推荐）

### 1. HTTP 插件默认处理（最优）

基于项目实际情况，后端统一使用 form-urlencoded 格式，因此 HTTP 插件默认自动转换：

```typescript
// app/plugins/http.ts
onRequest({ options }) {
  // ✅ 统一处理 Content-Type：默认 form-urlencoded，可通过 useJson: true 覆盖
  if (options.body && !(options as any).useJson) {
    // 排除已经是特殊格式的情况
    if (!(options.body instanceof FormData) && 
        !(options.body instanceof URLSearchParams) &&
        !(options.body instanceof Blob)) {
      
      const params = new URLSearchParams()
      Object.entries(options.body as Record<string, any>).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
      options.body = params
      // URLSearchParams 会自动设置正确的 Content-Type
    }
  }
}
```

### 2. API Client 中无需配置（最简单）

```typescript
// authApiClient.ts
async login(params: ILoginRequest): Promise<ILoginResponse> {
  return this.http('/login', {
    method: 'POST',
    body: params, // ✅ 自动转换为 form-urlencoded
  })
}
```

### 3. 特殊情况：使用 JSON 格式

如果某个接口需要 JSON 格式（虽然项目中目前没有）：

```typescript
async specialApi(params: any) {
  return this.http('/api/special', {
    method: 'POST',
    useJson: true, // ✅ 明确指定使用 JSON
    body: params,
  })
}
```

## 方案优势

### 1. 职责分离

```
┌─────────────────────────────────────────┐
│         API Client Layer                │
│  职责：定义业务接口，处理业务逻辑      │
│  不关心：数据如何传输                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         HTTP Plugin Layer               │
│  职责：处理 HTTP 传输细节              │
│  包括：Content-Type、认证、重试等      │
└─────────────────────────────────────────┘
```

### 2. 统一管理

所有 Content-Type 相关的处理都在 HTTP 插件中，方便维护和修改。

### 3. 避免重复

不需要在每个需要 form-urlencoded 的接口中重复写相同的代码。

### 4. 类型安全

通过 TypeScript 类型定义，IDE 可以提供自动补全和类型检查：

```typescript
// types/http.ts
export interface HttpOptions {
  skipAuth?: boolean
  skipCompanyId?: boolean
  formUrlEncoded?: boolean // ✅ 类型定义
  headers?: Record<string, string>
  query?: Record<string, any>
  body?: any
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  timeout?: number
}
```

## 使用示例

### 示例 1：登录接口（默认 form-urlencoded）

```typescript
export class AuthApiClient {
  async login(params: ILoginRequest): Promise<ILoginResponse> {
    return this.http('/login', {
      method: 'POST',
      body: params, // ✅ 默认自动转换为 form-urlencoded
    })
  }
}
```

实际发送的请求：
```
POST /api/h5app/wxapp/login
Content-Type: application/x-www-form-urlencoded

username=13917609856&password=123456&company_id=38
```

### 示例 2：添加购物车（默认 form-urlencoded）

```typescript
export class CartApiClient {
  async addToCart(params: IAddToCartRequest) {
    return this.http('/cart', {
      method: 'POST',
      body: params, // ✅ 自动转换为 form-urlencoded
    })
  }
}
```

实际发送的请求：
```
POST /api/h5app/wxapp/cart
Content-Type: application/x-www-form-urlencoded

item_id=123&quantity=1&distributor_id=456
```

### 示例 3：GET 请求（查询参数）

```typescript
export class AuthApiClient {
  async getCaptcha(params: ICaptchaRequest) {
    return this.http('/member/image/code', {
      method: 'GET',
      params: params, // ✅ GET 请求使用 params
      cache: 'no-cache',
    })
  }
}
```

实际发送的请求：
```
GET /api/h5app/wxapp/member/image/code?type=login&company_id=38
```

## 工作原理

### 1. URLSearchParams 自动设置 Content-Type

当 body 是 `URLSearchParams` 对象时，fetch API 会自动设置正确的 Content-Type：

```typescript
const params = new URLSearchParams()
params.append('username', '13917609856')
params.append('password', '123456')

// fetch 会自动设置：
// Content-Type: application/x-www-form-urlencoded; charset=UTF-8
fetch('/login', {
  method: 'POST',
  body: params, // ✅ 自动处理
})
```

### 2. HTTP 插件的处理流程

```typescript
onRequest({ options }) {
  // 1. 检查是否需要 form-urlencoded 格式
  if (options.formUrlEncoded && options.body) {
    
    // 2. 创建 URLSearchParams 对象
    const params = new URLSearchParams()
    
    // 3. 遍历 body 对象，转换为键值对
    Object.entries(options.body).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    
    // 4. 替换原始 body
    options.body = params
    
    // 5. fetch 会自动设置正确的 Content-Type
  }
}
```

## 最佳实践

### ✅ 推荐做法

1. **在 HTTP 插件中统一处理格式转换**
2. **在 API Client 中使用声明式配置**
3. **通过类型定义提供智能提示**

```typescript
// ✅ 好的做法
async login(params: ILoginRequest) {
  return this.http('/login', {
    method: 'POST',
    formUrlEncoded: true, // 声明式配置
    body: params,
  })
}
```

### ❌ 避免的做法

1. **在 API Client 中手动设置 Content-Type**
2. **在 API Client 中手动转换数据格式**
3. **混用不同的处理方式**

```typescript
// ❌ 不好的做法
async login(params: ILoginRequest) {
  return this.http('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // ❌ 手动设置
    },
    body: new URLSearchParams(params as any), // ❌ 手动转换
  })
}
```

## 其他 Content-Type 支持

### JSON（默认）

```typescript
// 默认就是 JSON，不需要额外配置
async updateCart(params: IUpdateCartRequest) {
  return this.http('/cart/update', {
    method: 'PUT',
    body: params, // 自动序列化为 JSON
  })
}
```

### Multipart Form Data（文件上传）

```typescript
// 使用 FormData 对象
async uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'avatar')
  
  return this.http('/upload', {
    method: 'POST',
    body: formData, // fetch 会自动设置 multipart/form-data
  })
}
```

## 扩展性

如果将来需要支持其他格式，只需在 HTTP 插件中添加相应的处理逻辑：

```typescript
onRequest({ options }) {
  // 处理 form-urlencoded
  if (options.formUrlEncoded && options.body) {
    options.body = new URLSearchParams(options.body)
  }
  
  // 未来可以添加其他格式的处理
  if (options.xml && options.body) {
    options.headers['Content-Type'] = 'application/xml'
    options.body = convertToXml(options.body)
  }
  
  if (options.customFormat && options.body) {
    // 自定义格式处理
  }
}
```

## 总结

| 方面 | 旧方案（API Client 处理） | 新方案（HTTP 插件处理） |
|------|-------------------------|------------------------|
| 职责分离 | ❌ 业务层处理传输细节 | ✅ 传输层统一处理 |
| 代码复用 | ❌ 每个接口重复代码 | ✅ 一处定义，到处使用 |
| 维护性 | ❌ 分散在各个文件 | ✅ 集中在 HTTP 插件 |
| 可读性 | ❌ 代码冗长 | ✅ 简洁明了 |
| 类型安全 | ❌ 手动设置易出错 | ✅ TypeScript 类型检查 |
| 扩展性 | ❌ 难以统一扩展 | ✅ 易于添加新格式 |

## 相关文档

- [API 规范](../.cursor/rules/web-rule.mdc)
- [API 路径规范](./api-path-convention.md)
- [认证 API 对接总结](./auth/api-integration-summary.md)

## 更新日志

- 2025-12-15: 初始版本，说明 Content-Type 处理的最佳实践

