# Company ID 自动注入机制

## 概述

项目中所有 API 请求都需要携带 `company_id` 参数。为了避免在每个接口中重复传递，HTTP 插件会自动为所有请求注入 `company_id`。

## 配置方式

### 1. 环境变量配置（推荐）

创建 `.env` 文件：

```bash
# 公司 ID（必填）
NUXT_PUBLIC_COMPANY_ID=38

# API 基础路径
NUXT_PUBLIC_API_BASE=/api/h5app/wxapp

# 业务模式
NUXT_PUBLIC_BUSINESS_MODE=b2c
```

### 2. Nuxt 配置

在 `nuxt.config.ts` 中已配置：

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      companyId: process.env.NUXT_PUBLIC_COMPANY_ID,
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      businessMode: process.env.NUXT_PUBLIC_BUSINESS_MODE || 'b2c'
    }
  }
})
```

## 自动注入规则

### GET 请求

`company_id` 自动添加到 **query 参数**：

```typescript
// 你的代码
this.http('/goods/items', {
  method: 'GET',
  query: {
    page: '1',
    pageSize: '20'
  }
})

// 实际发送
GET /api/h5app/wxapp/goods/items?page=1&pageSize=20&company_id=38
```

### POST/PUT/PATCH 请求

`company_id` 自动添加到 **body 中**：

```typescript
// 你的代码
this.http('/login', {
  method: 'POST',
  body: {
    username: 'admin',
    password: '123456'
  }
})

// 实际发送
POST /api/h5app/wxapp/login
Content-Type: application/x-www-form-urlencoded

username=admin&password=123456&company_id=38
```

## 实现原理

### HTTP 插件处理流程

```typescript
// app/plugins/http.ts
onRequest({ options }) {
  // 有 body 的请求（POST/PUT/PATCH）
  if (options.body && !(options as any).useJson) {
    // 将 company_id 添加到 body
    const bodyData = { ...options.body }
    if (config.public.companyId) {
      bodyData.company_id = config.public.companyId
    }
    
    // 转换为 URLSearchParams
    const params = new URLSearchParams()
    Object.entries(bodyData).forEach(([key, value]) => {
      params.append(key, String(value))
    })
    options.body = params
  } 
  // 没有 body 的请求（GET）
  else {
    // 将 company_id 添加到 query
    if (config.public.companyId) {
      options.query = {
        ...options.query,
        company_id: config.public.companyId
      }
    }
  }
}
```

## 使用示例

### ✅ 正确用法（推荐）

**登录接口**：

```typescript
// authApiClient.ts
async login(params: ILoginRequest) {
  return this.http('/login', {
    method: 'POST',
    body: params  // company_id 自动添加，无需手动传递
  })
}

// 调用时
await authApiClient.login({
  username: '13917609856',
  password: '123456'
  // ✅ company_id 由 HTTP 插件自动添加
})
```

**获取商品列表**：

```typescript
// itemApiClient.ts
async getItemList(params: IItemListParams) {
  return this.http('/goods/items', {
    method: 'GET',
    query: {
      page: params.page,
      pageSize: params.pageSize,
      item_type: params.item_type
      // ✅ company_id 由 HTTP 插件自动添加
    }
  })
}
```

### ❌ 错误用法（不推荐）

**手动传递 company_id**：

```typescript
// ❌ 不需要手动传递
await authApiClient.login({
  username: '13917609856',
  password: '123456',
  company_id: '38'  // ❌ 多余，会导致重复
})
```

**在 query 中手动添加**：

```typescript
// ❌ 不需要手动添加
this.http('/goods/items', {
  method: 'GET',
  query: {
    page: '1',
    company_id: '38'  // ❌ 多余，插件会自动添加
  }
})
```

## 类型定义更新

所有请求参数类型中的 `company_id` 都改为**可选**：

```typescript
// types/api/auth.ts
export interface ILoginRequest {
  username: string
  password: string
  company_id?: string  // ✅ 可选，由 HTTP 插件自动添加
}

// types/api/item.ts
export interface IItemListParams {
  page: string
  pageSize: string
  item_type: string
  company_id?: string  // ✅ 可选，由 HTTP 插件自动添加
  // ... 其他参数
}
```

## 特殊情况处理

### 跳过自动注入

如果某个请求不需要 `company_id`（极少情况），可以使用 `skipCompanyId: true`：

```typescript
this.http('/api/public/config', {
  method: 'GET',
  skipCompanyId: true  // 跳过自动注入 company_id
})
```

### 文件上传

FormData 格式的请求会被自动识别，不会转换：

```typescript
const formData = new FormData()
formData.append('file', file)
// FormData 会被特殊处理，不做转换

this.http('/upload', {
  method: 'POST',
  body: formData  // ✅ 自动识别，保持 FormData 格式
})
```

## 优势总结

### 1. 代码简洁

```typescript
// ❌ 旧方式：每个接口都要传递
await login({ username, password, company_id: appConfig.companyId })
await getItems({ page, pageSize, company_id: appConfig.companyId })
await addToCart({ item_id, num, company_id: appConfig.companyId })

// ✅ 新方式：自动注入
await login({ username, password })
await getItems({ page, pageSize })
await addToCart({ item_id, num })
```

### 2. 集中管理

所有 `company_id` 配置集中在：
- `.env` 文件（环境变量）
- `nuxt.config.ts`（运行时配置）
- `http.ts`（HTTP 插件）

### 3. 易于维护

- ✅ 修改 company_id 只需要改环境变量
- ✅ 不需要修改任何业务代码
- ✅ 不会遗漏任何接口

### 4. 类型安全

```typescript
// company_id 是可选参数，TypeScript 不会报错
const params: ILoginRequest = {
  username: 'admin',
  password: '123456'
  // company_id 可选，不传也能通过类型检查
}
```

## 环境配置示例

### 开发环境

```bash
# .env.development
NUXT_PUBLIC_COMPANY_ID=38
NUXT_PUBLIC_API_BASE=/api/h5app/wxapp
NUXT_PUBLIC_BUSINESS_MODE=b2c
```

### 生产环境

```bash
# .env.production
NUXT_PUBLIC_COMPANY_ID=your_production_company_id
NUXT_PUBLIC_API_BASE=/api/h5app/wxapp
NUXT_PUBLIC_BUSINESS_MODE=b2c
```

## 故障排查

### 问题 1：API 返回公司 ID 错误

**原因**：环境变量未设置或设置错误

**解决**：
1. 检查 `.env` 文件中的 `NUXT_PUBLIC_COMPANY_ID`
2. 重启开发服务器（环境变量需要重启才能生效）

### 问题 2：请求中没有 company_id

**原因**：使用了 `skipCompanyId: true`

**解决**：检查 HTTP 请求配置，移除 `skipCompanyId` 选项

### 问题 3：company_id 重复

**原因**：手动传递了 company_id，且 HTTP 插件也自动添加

**解决**：移除手动传递的 `company_id` 参数

## 相关文档

- [API 对接总结](./auth/api-integration-summary.md)
- [API 路径规范](./api-path-convention.md)
- [Content-Type 处理规范](./content-type-handling.md)

## 更新日志

- 2025-12-15: 初始版本，说明 company_id 自动注入机制

