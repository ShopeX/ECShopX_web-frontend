# 数据流向快速参考

## 核心架构（一图看懂）

```
┌───────────────────────────────────────────────────────────┐
│                     表现层 (UI)                            │
│  Pages + Components + Layouts                             │
│  ─────────────────────────────────────────────────────   │
│  职责：用户交互、数据展示                                  │
│  示例：login.vue, Header.vue                              │
└────────────────────┬──────────────────────────────────────┘
                     │
                     │ 调用
                     ↓
┌───────────────────────────────────────────────────────────┐
│                  业务层 (Business)                         │
│  Composables + Pinia Stores                               │
│  ─────────────────────────────────────────────────────   │
│  职责：业务逻辑、状态管理                                  │
│  示例：useAuth(), useUserStore()                          │
└────────────────────┬──────────────────────────────────────┘
                     │
                     │ 调用
                     ↓
┌───────────────────────────────────────────────────────────┐
│                基础设施层 (Infrastructure)                 │
│  API Clients + Transformers + HTTP Plugin                 │
│  ─────────────────────────────────────────────────────   │
│  职责：HTTP 通信、数据转换、全局拦截                       │
│  示例：authApiClient, AuthTransformer                     │
└────────────────────┬──────────────────────────────────────┘
                     │
                     │ HTTP
                     ↓
                  Backend API
```

## 典型请求流程（以登录为例）

### 1️⃣ 请求发起

```typescript
// 步骤 1: 用户点击登录按钮
// 📁 app/pages/account/login.vue
async function handleLogin() {
  const { login } = useAuth()
  const success = await login(accountForm)
  if (success) router.push('/')
}

// 步骤 2: Composable 封装业务逻辑
// 📁 app/composables/useAuth.ts
async function login(params: ILoginRequest) {
  isLoading.value = true
  const result = await userStore.login(params)  // 调用 Store
  isLoading.value = false
  return result.success
}

// 步骤 3: Store 调用 API
// 📁 app/stores/user.ts
async login(params: ILoginRequest) {
  const response = await authApiClient.login(params)  // 调用 API Client
  const loginData = AuthTransformer.toLoginModel(response)  // 数据转换
  this.token = loginData.token  // 更新状态
  return { success: true, data: loginData }
}

// 步骤 4: API Client 发起 HTTP 请求
// 📁 app/infrastructure/http/clients/authApiClient.ts
async login(params: ILoginRequest): Promise<ILoginResponse> {
  return this.http('/login', {
    method: 'POST',
    body: params
    // company_id 和 Content-Type 由 HTTP Plugin 自动处理
  })
}

// 步骤 5: HTTP Plugin 拦截处理
// 📁 app/plugins/http.ts
onRequest({ options }) {
  // ✅ 自动添加 Authorization header
  options.headers.Authorization = `Bearer ${token}`
  
  // ✅ 自动添加 company_id
  options.body.company_id = config.public.companyId
  
  // ✅ 自动转换为 URLSearchParams (form-urlencoded)
  options.body = new URLSearchParams(options.body)
}
```

### 2️⃣ 响应处理

```typescript
// 步骤 6: HTTP Plugin 响应拦截
// 📁 app/plugins/http.ts
onResponse({ response }) {
  // ✅ 检查业务状态码
  if (response._data.code !== 0) {
    throw new Error(response._data.msg)
  }
  // ✅ 返回原始响应
  return response._data
}

// 步骤 7: Transformer 转换数据
// 📁 app/infrastructure/transformers/authTransformer.ts
static toLoginModel(apiResponse: ILoginResponse): ILoginModel {
  if (!apiResponse?.data?.token) {
    throw new Error('Invalid login response')
  }
  
  return {
    token: apiResponse.data.token,
    expiresIn: 7200,  // 添加默认值
    refreshToken: '',  // 添加默认值
  }
}

// 步骤 8: Store 更新状态
// 📁 app/stores/user.ts
this.isLoggedIn = true
this.token = loginData.token
localStorage.setItem('token', token)  // 持久化

// 步骤 9: Composable 返回结果
// 📁 app/composables/useAuth.ts
return result.success  // true/false

// 步骤 10: UI 更新
// 📁 app/pages/account/login.vue
if (success) {
  showMessage('登录成功')
  router.push('/')
}
```

## 关键概念对比

### Composables vs Stores

| 特性 | Composables | Pinia Stores |
|------|------------|--------------|
| **用途** | 局部业务逻辑 | 全局状态管理 |
| **状态范围** | 组件级（每次调用创建新实例） | 应用级（单例） |
| **典型状态** | `isLoading`, `error` | `userInfo`, `cart` |
| **持久化** | ❌ 不支持 | ✅ 支持 |
| **何时使用** | UI 状态、表单处理 | 跨组件共享、登录状态 |

### API Client vs Transformer

| 特性 | API Client | Transformer |
|------|-----------|-------------|
| **职责** | HTTP 通信 | 数据转换 |
| **输入** | 请求参数 | API 原始响应 |
| **输出** | API 原始响应 | 业务模型 |
| **包含逻辑** | ❌ 不包含 | ❌ 不包含（纯函数） |
| **典型代码** | `this.http('/api', { method, body })` | `static toModel(response) { return {...} }` |

## 数据类型转换链

```typescript
// 1️⃣ API 原始响应
{
  "code": 0,
  "msg": "success",
  "data": {
    "token": "eyJ0eXAiOiJKV1Qi...",
    "member_info": {
      "user_id": "123",
      "username": "admin"
    }
  }
}
              ↓ Transformer 转换
// 2️⃣ 业务模型 (ILoginModel)
{
  token: string,
  expiresIn: number,
  refreshToken: string,
  userInfo: {
    user_id: string,
    username: string
  }
}
              ↓ Store 存储
// 3️⃣ 响应式状态 (Reactive State)
{
  isLoggedIn: Ref<boolean>,
  userInfo: Ref<UserInfo>,
  token: Ref<string>
}
              ↓ UI 使用
// 4️⃣ 模板绑定
<div v-if="isLoggedIn">
  欢迎，{{ userInfo.username }}
</div>
```

## 关键规则速记

### ✅ 推荐做法

```typescript
// ✅ 组件调用 Composable
const { login, isLoading } = useAuth()

// ✅ Composable 调用 Store
const userStore = useUserStore()
await userStore.login(params)

// ✅ Store 调用 API Client
const response = await authApiClient.login(params)

// ✅ API 响应必须经过 Transformer
const model = AuthTransformer.toLoginModel(response)

// ✅ 全局配置在 HTTP Plugin 处理
// company_id、Content-Type、认证头等
```

### ❌ 禁止做法

```typescript
// ❌ 组件直接调用 API
// 📁 login.vue
const response = await authApiClient.login(params)  // 错误！

// ❌ API Client 做数据转换
// 📁 authApiClient.ts
async login(params) {
  const response = await this.http('/login', { body: params })
  return { token: response.data.token }  // 错误！应该返回原始响应
}

// ❌ Store 跳过 Transformer
// 📁 user.ts
const response = await authApiClient.login(params)
this.token = response.data.token  // 错误！应该使用 Transformer

// ❌ 手动设置 Content-Type 或 company_id
// 📁 authApiClient.ts
return this.http('/login', {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  // 错误！
  body: { ...params, company_id: 38 }  // 错误！
})
```

## HTTP 插件自动处理内容

### 请求阶段 (onRequest)

```typescript
✅ 自动添加：
├─ Authorization: Bearer token
├─ company_id (GET → query, POST → body)
├─ Content-Type: application/x-www-form-urlencoded
└─ API 路径前缀：/api/h5app/wxapp

💡 你只需要写：
authApiClient.login({ username, password })

🔧 实际发送：
POST /api/h5app/wxapp/login
Content-Type: application/x-www-form-urlencoded
Authorization: Bearer xxx

username=admin&password=123456&company_id=38
```

### 响应阶段 (onResponse)

```typescript
✅ 自动处理：
├─ 业务状态码检查 (code !== 0 抛出错误)
├─ Token 刷新
├─ 错误消息提示
└─ 401 自动跳转登录

❌ 自动重试：
└─ 408, 429, 500, 502, 503, 504 (最多 3 次)
```

## 文件目录速查

```
app/
├── pages/                        # 📄 页面组件
│   └── account/login.vue
├── components/                   # 🧩 UI 组件
│   ├── business/                 # 业务组件
│   └── ui/                       # 通用 UI 组件
├── composables/                  # 🔧 组合式函数（业务逻辑）
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useProduct.ts
├── stores/                       # 🗄️ 全局状态管理
│   ├── user.ts
│   ├── cart.ts
│   └── product.ts
├── infrastructure/               # 🏗️ 基础设施层
│   ├── http/
│   │   └── clients/              # HTTP 客户端
│   │       ├── authApiClient.ts
│   │       ├── cartApiClient.ts
│   │       └── itemApiClient.ts
│   └── transformers/             # 数据转换器
│       ├── authTransformer.ts
│       ├── cartTransformer.ts
│       └── productTransformer.ts
├── plugins/                      # 🔌 插件
│   └── http.ts                   # HTTP 全局拦截器
└── types/                        # 📝 类型定义
    └── api/
        ├── auth.ts
        ├── cart.ts
        └── item.ts
```

## 常见场景代码示例

### 场景 1：展示用户信息

```vue
<!-- 📁 app/components/Header.vue -->
<script setup>
const { isLoggedIn, userInfo } = useAuth()
</script>

<template>
  <div v-if="isLoggedIn">
    <img :src="userInfo?.avatar" />
    <span>{{ userInfo?.username }}</span>
  </div>
</template>
```

### 场景 2：提交表单

```vue
<!-- 📁 app/pages/account/login.vue -->
<script setup>
const { login, isLoading, error } = useAuth()

async function handleSubmit() {
  const success = await login({
    username: form.username,
    password: form.password
  })
  
  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.username" />
    <input v-model="form.password" type="password" />
    <button :disabled="isLoading">
      {{ isLoading ? '登录中...' : '登录' }}
    </button>
    <p v-if="error">{{ error }}</p>
  </form>
</template>
```

### 场景 3：添加新 API

```typescript
// 步骤 1: 定义类型
// 📁 app/types/api/auth.ts
export interface IRegisterRequest {
  username: string
  password: string
  phone: string
  code: string
}

export interface IRegisterResponse {
  data: {
    user_id: string
  }
}

// 步骤 2: 添加 API Client 方法
// 📁 app/infrastructure/http/clients/authApiClient.ts
async register(params: IRegisterRequest): Promise<IRegisterResponse> {
  return this.http('/member/register', {
    method: 'POST',
    body: params
  })
}

// 步骤 3: 添加 Transformer
// 📁 app/infrastructure/transformers/authTransformer.ts
static toRegisterModel(response: IRegisterResponse) {
  return {
    userId: response.data.user_id
  }
}

// 步骤 4: 在 Store 中使用
// 📁 app/stores/user.ts
async register(params: IRegisterRequest) {
  const response = await authApiClient.register(params)
  const data = AuthTransformer.toRegisterModel(response)
  return { success: true, data }
}

// 步骤 5: 在 Composable 中封装
// 📁 app/composables/useAuth.ts
async function register(params: IRegisterRequest) {
  try {
    isLoading.value = true
    const result = await userStore.register(params)
    return result.success
  } catch (err) {
    error.value = err.message
    return false
  } finally {
    isLoading.value = false
  }
}

// 步骤 6: 在组件中使用
// 📁 app/pages/account/register.vue
const { register, isLoading } = useAuth()
await register(registerForm)
```

## 调试技巧

### 1. 查看请求详情

```typescript
// 📁 app/plugins/http.ts
onRequest({ options }) {
  console.log('🚀 请求:', options.method, options.baseURL + options.url)
  console.log('📦 Body:', options.body)
  console.log('🔑 Headers:', options.headers)
}
```

### 2. 查看状态变化

```typescript
// 📁 app/stores/user.ts
actions: {
  async login(params) {
    console.log('📥 登录参数:', params)
    const result = await authApiClient.login(params)
    console.log('📤 登录响应:', result)
    
    this.token = result.data.token
    console.log('💾 状态更新:', this.$state)
  }
}
```

### 3. Vue DevTools

```
1. 打开 Vue DevTools
2. 查看 Pinia → user store
3. 查看 Timeline → 状态变化历史
4. 查看 Network → HTTP 请求
```

## 性能优化清单

- ✅ 使用 `shallowRef` 优化大对象
- ✅ 请求去重（同一时间相同请求只发一次）
- ✅ 自动重试（网络错误自动重试 3 次）
- ✅ Token 自动刷新
- ✅ 响应缓存（适用于静态数据）
- ✅ 按需加载（路由懒加载）

## 相关文档

- 📘 [完整架构分析](./data-flow-architecture.md) - 详细版
- 📗 [API 路径规范](./api/api-path-convention.md)
- 📙 [Content-Type 处理](./api/content-type-handling.md)
- 📕 [DDD 开发指南](./DDD-DEVELOPMENT-GUIDE.md)

