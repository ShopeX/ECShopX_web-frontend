# 认证 API 对接总结

## 概述

本文档总结了基于 APIfox 文档对接登录、验证码等认证相关 API 的所有更改。

## 已对接的 API

### 1. 账号密码登录

**APIfox 接口地址**: `POST /api/h5app/wxapp/login`  
**代码中使用路径**: `POST /login`

**请求参数**:
```typescript
{
  username: string    // 用户名/手机号
  password: string    // 密码
  company_id: string  // 公司ID
}
```

**响应格式**:
```typescript
{
  data: {
    token: string  // JWT Token
  }
}
```

### 2. 获取图形验证码

**APIfox 接口地址**: `GET /api/h5app/wxapp/member/image/code`  
**代码中使用路径**: `GET /member/image/code`

**请求参数**:
```typescript
{
  type: string        // 类型，如 'login'
  company_id: string  // 公司ID
}
```

**响应格式**:
```typescript
{
  data: {
    imageData: string   // base64 格式的图片数据
    imageToken: string  // 验证码 token
  }
}
```

### 3. 发送短信验证码

**APIfox 接口地址**: `GET /api/h5app/wxapp/member/sms/code`  
**代码中使用路径**: `GET /member/sms/code`

**请求参数**:
```typescript
{
  type: string        // 类型，如 'login'
  mobile: string      // 手机号
  yzm: string         // 图形验证码值
  token: string       // 图形验证码 token
  company_id: string  // 公司ID
}
```

**响应格式**:
```typescript
{
  data: {
    message: string      // 提示信息
    status_code: number  // 状态码，200 表示成功
  }
}
```

### 4. 获取用户信息

**APIfox 接口地址**: `GET /api/h5app/wxapp/member`  
**代码中使用路径**: `GET /member`

**响应格式**:
```typescript
{
  data: {
    memberInfo: {
      user_id: string | number
      username?: string
      mobile: string
      avatar?: string
    }
  }
}
```

## 主要修改的文件

### 1. 类型定义 (`app/types/api/auth.ts`)

- ✅ 更新 `ILoginRequest` 添加 `company_id` 字段
- ✅ 更新 `ISmsCodeRequest` 使用实际 API 参数格式（`type`, `mobile`, `yzm`, `token`, `company_id`）
- ✅ 添加 `ICaptchaRequest` 接口
- ✅ 更新 `ICaptchaResponse` 使用 `imageData` 和 `imageToken`
- ✅ 更新 `ILoginResponse` 添加嵌套的 `data` 结构
- ✅ 添加 `ISmsCodeResponseData` 接口

### 2. API 客户端 (`app/infrastructure/http/clients/authApiClient.ts`)

- ✅ 更新 `login()` 方法使用端点 `/login`
- ✅ 使用 `formUrlEncoded: true` 选项处理 form-urlencoded 格式（由 HTTP 插件统一处理）
- ✅ 更新 `getCaptcha()` 方法，添加参数并使用端点 `/member/image/code`
- ✅ 更新 `sendSmsCode()` 方法使用 GET 请求和查询参数，端点 `/member/sms/code`
- ✅ 更新 `getUserInfo()` 方法使用端点 `/member`
- ✅ 所有方法返回类型都包含 `{ data: T }` 结构
- ✅ 遵循路径规范：去掉 APIfox 文档中的 `/api/h5app/wxapp` 前缀

### 3. 数据转换器 (`app/infrastructure/transformers/AuthTransformer.ts`)

- ✅ 更新 `toLoginModel()` 处理嵌套的 `data.token` 结构
- ✅ 更新 `toUserInfoModel()` 处理嵌套的 `data.memberInfo` 结构
- ✅ 更新 `toSmsCodeModel()` 根据 `status_code` 判断成功状态
- ✅ 更新 `toCaptchaModel()` 处理 `imageData` 和 `imageToken`
- ✅ 添加 `ILoginModel` 导出类型

### 4. Composables

#### `useAuth.ts`
- ✅ 更新 `getCaptcha()` 方法传递 `type` 和 `company_id` 参数
- ✅ 使用应用配置获取 `company_id`

#### `useSmsCode.ts`
- ✅ 重构 `sendCode()` 方法参数为 `(phone, captcha, captchaToken)`
- ✅ 使用新的 API 参数格式（`type`, `mobile`, `yzm`, `token`, `company_id`）
- ✅ 使用应用配置获取 `company_id`

### 5. 登录页面 (`app/pages/account/login.vue`)

- ✅ 添加图形验证码相关状态和方法
- ✅ 更新 `handleSendCode()` 获取并使用图形验证码
- ✅ 更新 `handleAccountLogin()` 传递 `company_id`
- ✅ 使用应用配置获取 `company_id`

### 6. 应用配置 (`app/config/app.ts`) - 新建

- ✅ 创建应用配置文件
- ✅ 提供 `companyId` 配置（支持从环境变量获取）
- ✅ 提供 `getAppConfig()` 函数

### 7. Store (`app/stores/user.ts`)

- ✅ 导入并使用 `ILoginModel` 类型

### 8. Transformers 导出 (`app/infrastructure/transformers/index.ts`)

- ✅ 导出 `ILoginModel` 类型

## 配置说明

### 公司 ID 配置

**环境变量配置**（推荐）：

创建 `.env` 文件：
```bash
# 公司 ID（必填）
NUXT_PUBLIC_COMPANY_ID=38

# API 基础路径
NUXT_PUBLIC_API_BASE=/api/h5app/wxapp

# 业务模式
NUXT_PUBLIC_BUSINESS_MODE=b2c
```

**Nuxt 配置**：

已在 `nuxt.config.ts` 中配置：
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

**自动注入**：

HTTP 插件会自动为所有请求添加 `company_id`：
- **GET 请求**：添加到 query 参数
- **POST/PUT/PATCH 请求**：添加到 body 中

无需在 API Client 中手动传递 `company_id`。

## 使用示例

### 1. 账号密码登录

```typescript
import { useAuth } from '~/composables/useAuth'

const { login, fetchUserInfo } = useAuth()

// 登录（company_id 由 HTTP 插件自动添加）
const success = await login({
  username: '13917609856',
  password: '123456'
})

if (success) {
  await fetchUserInfo()
  // 跳转到首页
}
```

### 2. 手机验证码登录流程

```typescript
import { useAuth } from '~/composables/useAuth'
import { useSmsCode } from '~/composables/useSmsCode'

const { getCaptcha, captcha } = useAuth()
const { sendCode } = useSmsCode()

// 1. 获取图形验证码
await getCaptcha('login')

// 2. 用户输入图形验证码后，发送短信验证码
const success = await sendCode(
  '13917609856',        // 手机号
  'ABC123',             // 用户输入的图形验证码
  captcha.value.imageToken  // 图形验证码 token
)

// 3. 用户输入短信验证码后登录
// TODO: 需要对接手机验证码登录接口
```

## 待完成事项

- [ ] 对接手机验证码登录接口（目前 API 文档中未找到该接口）
- [ ] 在登录页面添加图形验证码输入框
- [ ] 完善错误处理和用户提示
- [ ] 添加登录成功后的跳转逻辑优化
- [ ] 考虑添加 Token 刷新机制

## 注意事项

1. **API 路径规范**: 
   - APIfox 文档中的路径格式：`/api/h5app/wxapp/xxx`
   - 代码中实际使用路径：去掉 `/api/h5app/wxapp` 前缀，只写 `/xxx`
   - 原因：HTTP 插件会自动添加前缀
2. **Content-Type 处理**: 
   - 登录接口需要 `application/x-www-form-urlencoded` 格式
   - ✅ 使用 `formUrlEncoded: true` 选项，HTTP 插件会自动处理
   - ❌ 不要手动设置 `Content-Type` 头部
   - 详见：[Content-Type 处理规范](../content-type-handling.md)
3. **图形验证码**: 发送短信验证码需要先获取并输入图形验证码
4. **公司 ID 自动注入**: 
   - ✅ HTTP 插件自动为所有请求添加 `company_id`
   - ✅ 从环境变量 `NUXT_PUBLIC_COMPANY_ID` 读取
   - ✅ GET 请求添加到 query，POST/PUT 请求添加到 body
   - ❌ 无需在代码中手动传递
5. **响应格式**: 所有 API 响应都包含 `data` 字段的嵌套结构
6. **状态码**: 短信验证码接口通过 `status_code` 字段判断成功状态（200 表示成功）

## 参考

- API 文档来源: APIfox MCP
- 登录接口: `/login` (APIfox: `/api/h5app/wxapp/login`)
- 图形验证码接口: `/member/image/code` (APIfox: `/api/h5app/wxapp/member/image/code`)
- 短信验证码接口: `/member/sms/code` (APIfox: `/api/h5app/wxapp/member/sms/code`)
- 用户信息接口: `/member` (APIfox: `/api/h5app/wxapp/member`)

