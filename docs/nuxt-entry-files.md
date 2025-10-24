# Nuxt 入口文件指南

## 🎯 入口文件类型对比

| 文件类型         | 位置               | 何时执行   | 用途               | 自动加载 |
| ---------------- | ------------------ | ---------- | ------------------ | -------- |
| **Plugins**      | `app/plugins/`     | 应用启动时 | 初始化、全局配置   | ✅ 是    |
| **Composables**  | `app/composables/` | 按需调用   | 状态管理、工具函数 | ✅ 是    |
| **Middleware**   | `app/middleware/`  | 路由导航时 | 路由守卫、权限检查 | ✅ 是    |
| **app/index.ts** | `app/index.ts`     | 按需导入   | 配置、常量、类型   | ❌ 否    |

## 🔧 1. Plugins（插件）

### 文件命名规则：

- `*.ts` - 通用插件（客户端 + 服务端）
- `*.client.ts` - 只在客户端执行
- `*.server.ts` - 只在服务端执行

### 执行顺序：

1. 字母顺序执行
2. 可通过文件名前缀控制：`01.first.ts`, `02.second.ts`

### 示例：

```typescript
// app/plugins/bootstrap.ts
export default defineNuxtPlugin(async (nuxtApp) => {
  // 应用启动逻辑
  console.log('应用启动')
})
```

## 🎪 2. Composables（组合式函数）

### 特点：

- 自动导入，无需手动 import
- 文件名必须以 `use` 开头或导出以 `use` 开头的函数
- 响应式状态管理

### 示例：

```typescript
// app/composables/useApp.ts
export const useApp = () => {
  const state = ref('initial')
  return { state }
}

// 在组件中直接使用，无需导入
// const { state } = useApp()
```

## 🛡️ 3. Middleware（中间件）

### 文件命名规则：

- `*.global.ts` - 全局中间件，每个路由都执行
- `*.ts` - 命名中间件，需要在页面中指定使用

### 示例：

```typescript
// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  console.log('全局路由检查')
})

// 在页面中使用命名中间件
// definePageMeta({ middleware: 'auth' })
```

## 📁 4. app/index.ts（主入口）

### 特点：

- 需要手动导入使用
- 适合存放应用配置、常量、类型定义
- 不会自动执行

### 示例：

```typescript
// app/index.ts
export const APP_CONFIG = {
  name: 'ECSHOPX',
  version: '1.0.0',
}

// 在其他文件中使用
// import { APP_CONFIG } from '~/index'
```

## 🚀 最佳实践

### 1. 应用启动流程：

```
1. Plugins 执行（应用初始化）
2. Global Middleware 执行（路由守卫）
3. Composables 按需调用（状态管理）
4. app/index.ts 按需导入（配置获取）
```

### 2. 使用建议：

#### ✅ 推荐：

- **Plugins** - 第三方库初始化、全局配置
- **Composables** - 业务逻辑、状态管理
- **Global Middleware** - 认证检查、权限控制
- **app/index.ts** - 应用常量、类型定义

#### ❌ 避免：

- 在 plugins 中执行耗时操作
- 在 middleware 中执行业务逻辑
- 过度使用全局状态

### 3. 项目结构示例：

```
app/
├── index.ts                 # 应用配置和常量
├── plugins/
│   ├── bootstrap.ts         # 应用启动
│   ├── auth.client.ts       # 客户端认证
│   └── api.server.ts        # 服务端 API
├── composables/
│   ├── useApp.ts           # 应用状态
│   ├── useAuth.ts          # 认证状态
│   └── useGlobal.ts        # 全局工具
└── middleware/
    ├── auth.global.ts      # 全局认证检查
    └── admin.ts            # 管理员权限检查
```

## 🎛️ 执行时机

| 阶段         | Server          | Client          | 说明         |
| ------------ | --------------- | --------------- | ------------ |
| **应用创建** | ✅ Plugins      | ✅ Plugins      | 应用初始化   |
| **路由导航** | ✅ Middleware   | ✅ Middleware   | 每次路由切换 |
| **组件渲染** | ✅ Composables  | ✅ Composables  | 按需调用     |
| **手动导入** | ✅ app/index.ts | ✅ app/index.ts | 显式使用     |

## 🔍 调试技巧

### 1. 查看插件执行顺序：

```typescript
// app/plugins/debug.ts
export default defineNuxtPlugin((nuxtApp) => {
  console.log('插件执行:', import.meta.url)
})
```

### 2. 监听应用生命周期：

```typescript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', () => console.log('应用创建'))
  nuxtApp.hook('app:mounted', () => console.log('应用挂载'))
})
```

### 3. 检查执行环境：

```typescript
export default defineNuxtPlugin(() => {
  console.log({
    server: process.server,
    client: process.client,
    dev: process.dev,
  })
})
```
