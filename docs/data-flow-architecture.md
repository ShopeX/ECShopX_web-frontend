# 项目数据流向架构分析

## 架构概览

本项目采用**轻量级 DDD（领域驱动设计）+ 分层架构**，数据流清晰且职责分明。

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                        │
│                          (表现层/UI层)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Pages      │  │  Components  │  │   Layouts    │         │
│  │  (页面组件)   │  │  (UI组件)     │  │  (布局)      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Composition Layer                           │
│                       (组合层/业务层)                            │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │     Composables          │  │      Pinia Stores        │   │
│  │  (组合式函数/业务逻辑)     │  │    (全局状态管理)        │   │
│  │  - useAuth               │  │    - useUserStore        │   │
│  │  - useCart               │  │    - useCartStore        │   │
│  │  - useProduct            │  │    - useProductStore     │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│         │                              │                        │
│         └──────────────┬───────────────┘                        │
└────────────────────────┼─────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                          │
│                      (基础设施层/数据层)                         │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │   API Clients            │  │    Transformers          │   │
│  │  (HTTP 客户端)            │  │   (数据转换器)            │   │
│  │  - AuthApiClient         │  │   - AuthTransformer      │   │
│  │  - CartApiClient         │  │   - CartTransformer      │   │
│  │  - ItemApiClient         │  │   - ProductTransformer   │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│         │                                                        │
│         ↓                                                        │
│  ┌──────────────────────────┐                                  │
│  │    HTTP Plugin           │ ← 统一处理：认证、重试、错误     │
│  │  (全局HTTP拦截器)         │   company_id、Content-Type      │
│  └──────────────────────────┘                                  │
└────────────────────────────┼─────────────────────────────────────┘
                             ↓
                    ┌────────────────┐
                    │  Backend API   │
                    │   (后端服务)    │
                    └────────────────┘
```

## 完整数据流（以登录为例）

### 1. 请求流：用户点击登录 → 后端 API

```typescript
用户操作 (login.vue)
    ↓ 调用
useAuth.login()  (composables/useAuth.ts)
    ↓ 委托给
useUserStore.login()  (stores/user.ts)
    ↓ 调用
authApiClient.login()  (infrastructure/http/clients/authApiClient.ts)
    ↓ 发起请求
HTTP Plugin 拦截  (plugins/http.ts)
    ├─ 添加 Authorization header
    ├─ 添加 company_id
    ├─ 转换 body 为 URLSearchParams
    └─ 发送请求
    ↓
Backend API  (后端服务)
```

### 2. 响应流：后端 API → UI 更新

```typescript
Backend API  (返回 JSON 响应)
    ↓ 返回原始数据
HTTP Plugin 处理  (plugins/http.ts)
    ├─ 检查业务状态码
    ├─ 错误处理
    └─ 返回数据
    ↓ 原始 API 响应
authApiClient.login()  (返回原始响应)
    ↓ 数据转换
AuthTransformer.toLoginModel()  (transformers/authTransformer.ts)
    ├─ 验证必需字段
    ├─ 数据格式转换
    ├─ 提供默认值
    └─ 返回统一格式
    ↓ 业务模型
useUserStore.login()  (stores/user.ts)
    ├─ 更新 state.isLoggedIn
    ├─ 保存 token 到 localStorage
    └─ 返回 { success, data }
    ↓ 状态已更新
useAuth.login()  (composables/useAuth.ts)
    ├─ 设置 loading 状态
    ├─ 处理错误
    └─ 返回 boolean
    ↓ 返回结果
login.vue  (页面组件)
    ├─ 更新 UI (loading、错误提示)
    └─ 跳转页面
```

## 各层职责详解

### 1. Presentation Layer（表现层）

**职责**：

- 用户交互
- 数据展示
- 表单验证（UI 层面）
- 页面路由

**文件位置**：

- `app/pages/` - 页面组件
- `app/components/` - 可复用组件
- `app/layouts/` - 布局组件

**示例**：

```vue
<!-- app/pages/account/login.vue -->
<script setup>
import { useAuth } from '~/composables/useAuth'

const { login, isLoading, error } = useAuth()

async function handleLogin() {
  const success = await login({
    username: accountForm.username,
    password: accountForm.password,
  })

  if (success) {
    await fetchUserInfo()
    router.push('/')
  }
}
</script>
```

**特点**：

- ✅ 只关心 UI 和用户交互
- ✅ 不直接调用 API
- ✅ 不处理数据转换
- ✅ 通过 Composables 或 Store 获取数据

### 2. Composition Layer（组合层）

这一层分为两部分：

#### 2.1 Composables（组合式函数）

**职责**：

- 封装业务逻辑
- 管理局部状态（loading、error）
- 组合多个 Store 或 API
- 提供给组件的接口

**文件位置**：`app/composables/`

**示例**：

```typescript
// app/composables/useAuth.ts
export function useAuth() {
  const userStore = useUserStore()
  const isLoading = ref(false)
  const error = ref('')

  async function login(params: ILoginRequest) {
    try {
      isLoading.value = true
      error.value = ''

      // 委托给 Store
      const result = await userStore.login(params)

      if (!result.success) {
        error.value = result.error
        return false
      }

      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    login,
  }
}
```

**特点**：

- ✅ 封装业务逻辑，提供高级 API
- ✅ 管理 UI 相关的局部状态
- ✅ 组合多个数据源
- ✅ 提供统一的错误处理

#### 2.2 Pinia Stores（全局状态管理）

**职责**：

- 管理全局状态
- 调用 API 获取/更新数据
- 数据持久化（localStorage）
- 跨组件共享状态

**文件位置**：`app/stores/`

**示例**：

```typescript
// app/stores/user.ts
export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    userInfo: null,
    token: null,
  }),

  actions: {
    async login(params: ILoginRequest) {
      try {
        // 调用 API Client
        const response = await authApiClient.login(params)

        // 使用 Transformer 转换数据
        const loginData = AuthTransformer.toLoginModel(response)

        // 更新状态
        this.isLoggedIn = true
        this.setToken(loginData.token)

        return { success: true, data: loginData }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
  },
})
```

**特点**：

- ✅ 管理应用全局状态
- ✅ 调用 API Client 获取数据
- ✅ 使用 Transformer 转换数据
- ✅ 持久化关键数据

**Composables vs Stores 对比**：

| 特性     | Composables           | Pinia Stores         |
| -------- | --------------------- | -------------------- |
| 状态范围 | 局部（组件级）        | 全局（应用级）       |
| 复用性   | 每次调用创建新实例    | 单例，全局共享       |
| 持久化   | 不支持                | 支持（通过插件）     |
| SSR      | 每个请求独立          | 需要处理状态污染     |
| 使用场景 | UI 状态、局部业务逻辑 | 跨组件共享、全局状态 |

### 3. Infrastructure Layer（基础设施层）

#### 3.1 API Clients（HTTP 客户端）

**职责**：

- 封装 HTTP 请求
- 定义 API 接口
- **只负责通信，不做数据转换**
- 返回原始 API 响应

**文件位置**：`app/infrastructure/http/clients/`

**示例**：

```typescript
// app/infrastructure/http/clients/authApiClient.ts
export class AuthApiClient {
  private get http() {
    const nuxtApp = useNuxtApp()
    return nuxtApp.$api
  }

  async login(params: ILoginRequest): Promise<ILoginResponse> {
    return this.http('/login', {
      method: 'POST',
      body: params,
      // company_id 和 Content-Type 由 HTTP 插件自动处理
    })
  }

  async getUserInfo(): Promise<{ data: IGetUserInfoResponse }> {
    return this.http('/member', {
      method: 'GET',
    })
  }
}

export const authApiClient = new AuthApiClient()
```

**特点**：

- ✅ 纯粹的 HTTP 调用，职责单一
- ✅ 不包含业务逻辑
- ✅ 不做数据转换（由 Transformer 处理）
- ✅ 返回原始 API 响应
- ✅ 延迟初始化（SSR 安全）

#### 3.2 Transformers（数据转换器）

**职责**：

- API 响应 → 应用模型转换
- 数据验证和清洗
- 提供默认值
- **纯函数，无副作用**

**文件位置**：`app/infrastructure/transformers/`

**示例**：

```typescript
// app/infrastructure/transformers/authTransformer.ts
export class AuthTransformer {
  /**
   * 登录响应 → 应用模型
   */
  static toLoginModel(apiResponse: ILoginResponse): ILoginModel {
    // 验证必需字段
    if (!apiResponse?.data?.token) {
      throw new Error('Invalid login response: missing token')
    }

    // 数据转换和默认值处理
    return {
      token: apiResponse.data.token,
      expiresIn: 7200, // 默认 2 小时
      refreshToken: '',
    }
  }

  /**
   * 用户信息响应 → 应用模型
   */
  static toUserInfoModel(apiResponse: { data: IGetUserInfoResponse }): IUserInfo {
    const apiUser = apiResponse.data

    if (!apiUser.memberInfo.user_id) {
      throw new Error('Invalid user info: missing id')
    }

    return {
      user_id: apiUser.memberInfo.user_id,
      username: apiUser.memberInfo.username || '',
      mobile: apiUser.memberInfo.mobile || '',
      avatar: apiUser.memberInfo.avatar || this.getDefaultAvatar(),
    }
  }

  /**
   * 验证手机号格式
   */
  static validatePhone(phone: string): boolean {
    return /^1[3-9]\d{9}$/.test(phone)
  }
}
```

**特点**：

- ✅ 纯函数，可测试性强
- ✅ 只做数据结构转换
- ✅ 验证和默认值处理
- ✅ 不包含业务规则
- ✅ 职责单一

#### 3.3 HTTP Plugin（全局拦截器）

**职责**：

- 请求拦截（添加认证、company_id）
- 响应拦截（错误处理、数据解包）
- 自动重试机制
- Content-Type 自动处理

**文件位置**：`app/plugins/http.ts`

**关键功能**：

```typescript
// app/plugins/http.ts
const $api = $fetch.create({
  baseURL: config.public.apiBase,
  timeout: 10000,
  retry: 3,

  onRequest({ options }) {
    // 1. 添加认证 Token
    if (token) {
      options.headers.Authorization = `Bearer ${token}`
    }

    // 2. 自动添加 company_id
    if (options.body) {
      // POST/PUT: 添加到 body
      const bodyData = { ...options.body }
      bodyData.company_id = config.public.companyId

      // 3. 自动转换为 form-urlencoded
      const params = new URLSearchParams()
      Object.entries(bodyData).forEach(([key, value]) => {
        params.append(key, String(value))
      })
      options.body = params // 自动设置 Content-Type
    } else {
      // GET: 添加到 query
      options.query = {
        ...options.query,
        company_id: config.public.companyId,
      }
    }
  },

  onResponse({ response }) {
    // 业务状态码检查
    // Token 自动更新
    // 数据自动解包
  },

  onResponseError({ response, error }) {
    // 统一错误处理
    // 401 自动跳转登录
    // 错误消息提示
  },
})
```

**特点**：

- ✅ 统一处理所有 HTTP 请求
- ✅ 自动注入 company_id
- ✅ 自动处理 Content-Type
- ✅ 统一错误处理
- ✅ 自动重试机制

## 数据流示意图（详细版）

### 登录流程完整数据流

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. UI Layer (login.vue)                                         │
│    用户输入：{ username: 'admin', password: '123456' }           │
└────────────────────────┬────────────────────────────────────────┘
                         │ handleLogin()
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Composable (useAuth.ts)                                      │
│    管理状态：isLoading = true, error = ''                       │
└────────────────────────┬────────────────────────────────────────┘
                         │ login(params)
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Store (user.ts)                                              │
│    准备调用 API                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │ userStore.login(params)
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. API Client (authApiClient.ts)                                │
│    请求数据：{ username, password }                              │
└────────────────────────┬────────────────────────────────────────┘
                         │ this.http('/login', { method: 'POST', body })
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. HTTP Plugin (http.ts) - onRequest                            │
│    处理：                                                        │
│    ① 添加 Authorization: Bearer token                           │
│    ② body + company_id → URLSearchParams                        │
│    ③ 自动设置 Content-Type: form-urlencoded                     │
│                                                                  │
│    发送数据：username=admin&password=123456&company_id=38       │
└────────────────────────┬────────────────────────────────────────┘
                         │ $fetch → Backend API
                         ↓
                    ┌──────────┐
                    │ Backend  │
                    └────┬─────┘
                         │ 返回 JSON
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. HTTP Plugin (http.ts) - onResponse                           │
│    响应数据：{ data: { token: 'xxx' } }                          │
│    处理：                                                        │
│    ① 检查业务状态码                                              │
│    ② 保存 Token 到 Cookie                                       │
│    ③ 返回原始响应                                                │
└────────────────────────┬────────────────────────────────────────┘
                         │ 返回 response
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. API Client (authApiClient.ts)                                │
│    返回：ILoginResponse { data: { token: 'xxx' } }              │
└────────────────────────┬────────────────────────────────────────┘
                         │ return response
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Transformer (authTransformer.ts)                             │
│    输入：{ data: { token: 'xxx' } }                              │
│    转换：                                                        │
│    ① 验证必需字段                                                │
│    ② 提供默认值                                                  │
│    输出：{ token: 'xxx', expiresIn: 7200, refreshToken: '' }    │
└────────────────────────┬────────────────────────────────────────┘
                         │ return ILoginModel
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. Store (user.ts)                                              │
│    更新状态：                                                    │
│    ① this.isLoggedIn = true                                     │
│    ② this.token = loginData.token                               │
│    ③ localStorage.setItem('token', token)                       │
│    返回：{ success: true, data: loginData }                     │
└────────────────────────┬────────────────────────────────────────┘
                         │ return result
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. Composable (useAuth.ts)                                     │
│     isLoading = false                                            │
│     返回：true (表示登录成功)                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │ return boolean
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 11. UI Layer (login.vue)                                        │
│     if (success) {                                               │
│       await fetchUserInfo()                                      │
│       router.push('/')  // 跳转到首页                           │
│     }                                                            │
└─────────────────────────────────────────────────────────────────┘
```

## 数据类型转换链

### API 响应 → UI 展示的完整转换

```typescript
// 1. 后端 API 原始响应（JSON）
{
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
              ↓ HTTP Plugin 处理
// 2. API Client 返回（ILoginResponse）
{
  data: {
    token: string
  }
}
              ↓ AuthTransformer.toLoginModel()
// 3. 业务模型（ILoginModel）
{
  token: string
  expiresIn: number      // 添加默认值
  refreshToken: string   // 添加默认值
}
              ↓ Store 处理
// 4. Store State（更新全局状态）
{
  isLoggedIn: true
  token: 'eyJ0eXAiOiJKV1QiLCJhbGc...'
  userInfo: null
}
              ↓ Composable 封装
// 5. UI 可用的响应式数据（Composable 返回）
{
  isLoading: Ref<boolean>
  error: Ref<string>
  isLoggedIn: ComputedRef<boolean>
  userInfo: ComputedRef<UserInfo | null>
}
              ↓ 组件使用
// 6. Vue 组件（模板绑定）
<div v-if="isLoggedIn">
  欢迎，{{ userInfo?.username }}
</div>
```

## 关键设计模式

### 1. 单一职责原则（SRP）

每一层都有明确的单一职责：

| 层           | 职责         | 不负责                 |
| ------------ | ------------ | ---------------------- |
| UI Layer     | 展示、交互   | ❌ API 调用、数据转换  |
| Composables  | 业务逻辑封装 | ❌ 全局状态、HTTP 通信 |
| Stores       | 全局状态管理 | ❌ 数据转换、HTTP 细节 |
| API Clients  | HTTP 通信    | ❌ 数据转换、业务逻辑  |
| Transformers | 数据转换     | ❌ 业务逻辑、HTTP 通信 |
| HTTP Plugin  | 统一拦截处理 | ❌ 业务逻辑            |

### 2. 依赖倒置原则（DIP）

高层模块不依赖低层模块，都依赖抽象：

```
Pages/Components (高层)
    ↓ 依赖接口
Composables/Stores (中层)
    ↓ 依赖接口
API Clients (低层)
```

### 3. 分层隔离

```
UI Layer         ← 只能调用 → Composables/Stores
                 ← 不能直接调用 → API Clients

Composables      ← 可以调用 → Stores, API Clients
Stores           ← 可以调用 → API Clients, Transformers

API Clients      ← 只负责 → HTTP 通信
Transformers     ← 只负责 → 数据转换
```

## 状态管理策略

### 1. 局部状态 vs 全局状态

**局部状态（Composables）**：

```typescript
// UI 相关的临时状态
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
```

**全局状态（Stores）**：

```typescript
// 跨组件共享的业务状态
state: {
  isLoggedIn: boolean
  userInfo: UserInfo | null
  token: string | null
  cart: CartItem[]
}
```

### 2. 状态持久化

```typescript
// stores/user.ts
setToken(token: string | null) {
  this.token = token

  // 持久化到 localStorage
  if (import.meta.client) {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }
}

// 初始化时恢复状态
async initUserState() {
  if (!import.meta.client) return

  const token = localStorage.getItem('token')
  if (token) {
    this.token = token
    await this.fetchUserInfo()
  }
}
```

## 错误处理流程

```
Backend Error (HTTP 401/500)
    ↓
HTTP Plugin - onResponseError
    ├─ 创建标准错误对象
    ├─ 显示错误消息（useMessage）
    ├─ 401 → 跳转登录页
    └─ 抛出错误
    ↓
API Client (捕获并抛出)
    ↓
Store (捕获)
    ├─ 清理状态
    └─ 返回 { success: false, error }
    ↓
Composable (捕获)
    ├─ 设置 error.value
    ├─ 设置 isLoading = false
    └─ 返回 false
    ↓
UI Component
    ├─ 显示错误提示
    └─ 保持在当前页面
```

## SSR 注意事项

### 1. 延迟初始化

```typescript
// API Client 延迟初始化
export class AuthApiClient {
  private $api: any

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api // SSR 时才初始化
    }
    return this.$api
  }
}
```

### 2. 客户端特性检查

```typescript
// Store 中的持久化
if (import.meta.client) {
  localStorage.setItem('token', token)
}

// Middleware 中的检查
if (import.meta.server) return
```

### 3. 状态隔离

```typescript
// 每个请求都有独立的 Store 实例
const pinia = createPinia()
nuxtApp.vueApp.use(pinia)
```

## 性能优化策略

### 1. 请求去重

```typescript
// Composable 中缓存请求
const requestCache = new Map()

async function fetchData(id: string) {
  if (requestCache.has(id)) {
    return requestCache.get(id)
  }

  const promise = apiClient.getData(id)
  requestCache.set(id, promise)

  return promise
}
```

### 2. 自动重试

```typescript
// HTTP Plugin 配置
$fetch.create({
  retry: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
})
```

### 3. 响应式优化

```typescript
// 大对象使用 shallowRef
const largeData = shallowRef<LargeObject>({})

// 只读数据使用 readonly
const config = readonly(appConfig)
```

## 最佳实践总结

### ✅ 推荐做法

1. **分层清晰**：严格遵守分层架构，不跨层调用
2. **职责单一**：每个类/函数只做一件事
3. **依赖注入**：通过参数传递依赖，不使用全局变量
4. **数据转换**：API 响应必须经过 Transformer 转换
5. **错误处理**：统一的错误处理流程
6. **类型安全**：所有接口都有 TypeScript 类型定义

### ❌ 避免做法

1. **不要在组件中直接调用 API Client**
2. **不要在 API Client 中做数据转换**
3. **不要在 Transformer 中包含业务逻辑**
4. **不要在 Store 中直接操作 DOM**
5. **不要在 HTTP Plugin 中处理业务逻辑**
6. **不要跳过 Transformer 直接使用 API 响应**

## 流程图快速参考

### 读取数据流程

```
Component → Composable → Store → API Client → HTTP Plugin → Backend
                  ↑         ↑         ↑
                  └─────────┴─────────┘
                    通过 Transformer 转换
```

### 更新数据流程

```
Component → Composable → Store → API Client → HTTP Plugin → Backend
    ↑                      ↓
    └──── 状态更新 ────────┘
```

### 错误处理流程

```
Backend Error → HTTP Plugin → API Client → Store → Composable → Component
                     ↓            ↓          ↓          ↓           ↓
                   Log        Throw      Catch      Error      Display
```

## 相关文档

- [API 路径规范](./api/api-path-convention.md)
- [Content-Type 处理规范](./api/content-type-handling.md)
- [Company ID 自动注入](./api/company-id-handling.md)
- [DDD 开发指南](./DDD-DEVELOPMENT-GUIDE.md)

## 更新日志

- 2025-12-15: 初始版本，完整分析项目数据流向架构
