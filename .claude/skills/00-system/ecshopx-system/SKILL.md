---
name: ecshopx-system
description: "ECShopX B2C商城系统基础架构规范。适用场景: (1) 创建新功能或页面时需要确定架构方案 (2) 编写代码时遵循的规范和约定 (3) 代码重构或架构调整 (4) 解决架构相关问题 (5) 新成员了解项目架构。包含三种架构方案、项目结构、开发工作流、MCP工具集成、代码规范等完整指南。"
---

# ECShopX 系统基础架构

## 概述

ECShopX 是一个基于 Nuxt 4 的现代化 B2C 电商平台，采用分层架构和 DDD（领域驱动设计）理念，支持多主题切换。

**技术栈**：

- **前端框架**：Nuxt 4 + Vue 3 (Composition API)
- **类型系统**：TypeScript (strict mode)
- **样式方案**：Tailwind CSS + Nuxt UI 3.3
- **状态管理**：Pinia
- **包管理器**：pnpm
- **Node 版本**：^20.19.0

## 核心架构原则

### 根据复杂度选择架构

项目采用**渐进式架构**，根据功能复杂度选择合适的方案：

#### 方案 1：完整架构 - `UI → Composable → Store → API Client → Transformer`

**何时使用**：

- ✅ 需要跨组件共享状态（如：用户信息、购物车）
- ✅ 需要数据持久化（localStorage）
- ✅ 复杂的状态管理（登录、认证）
- ✅ 核心业务逻辑

**适用模块**：用户登录/注册、购物车、订单管理、用户个人信息

#### 方案 2：简化架构 - `UI → Composable → API Client → Transformer`

**何时使用**：

- ✅ 不需要跨组件共享状态
- ✅ 一次性获取数据
- ✅ 简单的列表/详情页
- ✅ 读多写少的场景

**适用模块**：商品列表/详情、文章列表、评论功能、表单提交

#### 方案 3：最简架构 - `UI → 直接处理`

**何时使用**：

- ✅ 一次性的简单请求
- ✅ 不需要状态管理
- ✅ 静态数据获取

**适用模块**：关于我们、服务条款、静态配置获取

### 架构决策流程

```
开始新功能
    ↓
是否需要跨组件共享状态？
    ├─ 是 → 方案 1（完整架构 - 需要 Store）
    │   例：用户信息、购物车、订单
    │
    └─ 否 → 是否有复杂业务逻辑？
        ├─ 是 → 方案 2（简化架构 - 需要 Composable）
        │   例：商品列表、表单验证、分页
        │
        └─ 否 → 方案 3（最简架构 - 直接在组件中处理）
            例：静态页面、简单配置获取
```

## 项目结构

```
app/
├── domain/                 # 领域层（DDD架构）
│   ├── cart/              # 购物车领域
│   ├── product/           # 商品领域
│   ├── order/             # 订单领域
│   └── shared/            # 共享内核（值对象、领域错误等）
│
├── application/           # 应用层
│   ├── cart/             # 购物车应用服务
│   └── dto/              # 数据传输对象
│
├── infrastructure/        # 基础设施层
│   ├── http/
│   │   ├── clients/      # API 客户端
│   │   └── index.ts
│   └── transformers/     # 数据转换器
│
├── pages/                # 页面（Nuxt 约定）
├── components/           # 组件
│   ├── business/        # 业务组件
│   └── ui/              # UI 组件
├── composables/         # 组合式函数（自动导入）
├── stores/              # Pinia Store
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数
├── plugins/             # Nuxt 插件
├── layouts/             # 布局
└── middleware/          # 中间件
```

## 开发工作流

### 创建新功能的步骤

1. **确定架构方案**
  - 参考上述架构决策流程
  - 确定是否需要 Store、Composable
2. **创建类型定义**
  ```typescript
   // app/types/api/product.ts
   export interface IProductListResponse {
     list: IProductDTO[]
     total: number
   }
  ```
3. **创建 API Client**（如需要）
  ```typescript
   // app/infrastructure/http/clients/ProductApiClient.ts
   export class ProductApiClient {
     async getList(params: any) {
       return await this.http('/items', { method: 'GET', params })
     }
   }
  ```
4. **创建 Transformer**（如需要）
  ```typescript
   // app/infrastructure/transformers/productTransformer.ts
   export class ProductTransformer {
     static toModel(dto: IProductDTO): IProduct {
       // DTO → 领域模型转换
     }
   }
  ```
5. **创建 Store**（方案 1 才需要）
  ```typescript
   // app/stores/cart.ts
   export const useCartStore = defineStore('cart', {
     state: () => ({ items: [] }),
     actions: { addItem() {} }
   })
  ```
6. **创建 Composable**（方案 1、2 需要）
  ```typescript
   // app/composables/useProduct.ts
   export function useProduct() {
     const products = ref([])
     const loading = ref(false)

     async function loadProducts() {
       // 调用 API Client
     }

     return { products, loading, loadProducts }
   }
  ```
7. **创建页面/组件**
  ```vue
   <!-- app/pages/products/index.vue -->
   <script setup>
   const { products, loadProducts } = useProduct()

   onMounted(() => loadProducts())
   </script>
  ```

### 快速参考

**创建商品列表页**（推荐方案 2 - 简化架构）：

1. 类型定义 → API Client → Transformer → Composable → 页面
2. 不需要 Store（不需要跨组件共享）

**创建购物车功能**（推荐方案 1 - 完整架构）：

1. 类型定义 → API Client → Transformer → Store → Composable → 页面
2. 需要 Store（需要跨组件共享、持久化）

**创建关于我们页**（推荐方案 3 - 最简架构）：

1. 直接在页面中使用 `useFetch`
2. 不需要 Store、Composable、API Client

## 开发工具集成（MCP）

项目使用 MCP (Model Context Protocol) 工具链提升开发效率：

### Figma MCP - UI 设计稿获取

**用途**：从 Figma 获取设计稿、组件规格、样式参数

**使用场景**：

- ✅ 开发新页面/组件前获取设计规范
- ✅ 查询组件尺寸、间距、颜色
- ✅ 获取图标、图片资源
- ✅ 确认交互细节

**使用方法**：

1. **获取页面设计稿**
  ```
   使用 Figma MCP 获取"商品列表页"的设计稿
  ```
  - 会返回：布局、组件结构、尺寸规格
  - 你基于设计稿编写 Vue 组件
2. **查询组件规格**
  ```
   使用 Figma MCP 查询"商品卡片"组件的样式参数
  ```
  - 会返回：宽高、内边距、圆角、阴影等
  - 你转换为 Tailwind CSS 类名
3. **获取颜色/字体规范**
  ```
   使用 Figma MCP 获取设计系统中的主色调和字体规范
  ```
  - 会返回：色值、字号、字重
  - 你配置到 Tailwind 配置文件

**开发流程**：

```
设计稿就绪
  ↓
使用 Figma MCP 获取设计规格
  ↓
根据规格创建 Vue 组件
  ↓
使用 Tailwind CSS 实现样式
  ↓
对照设计稿验证还原度
```

### Apifox MCP - API 文档查询

**用途**：查询 API 接口文档、请求/响应格式、字段说明

**使用场景**：

- ✅ 创建 API Client 前查询接口定义
- ✅ 了解请求参数和响应结构
- ✅ 查看字段类型和必填项
- ✅ 获取接口调用示例

**使用方法**：

1. **查询接口文档**
  ```
   使用 Apifox MCP 查询"获取商品列表"接口的文档
  ```
  - 会返回：接口路径、请求方法、参数说明、响应示例
  - 你据此创建类型定义和 API Client
2. **获取请求示例**
  ```
   使用 Apifox MCP 获取"添加到购物车"接口的请求示例
  ```
  - 会返回：完整的请求参数示例
  - 你参考示例编写 API Client 方法
3. **查询字段说明**
  ```
   使用 Apifox MCP 查询订单接口响应中"status"字段的含义
  ```
  - 会返回：字段类型、枚举值、说明
  - 你据此定义 TypeScript 类型

**开发流程**：

```
需要对接 API
  ↓
使用 Apifox MCP 查询接口文档
  ↓
创建 TypeScript 类型定义 (types/api/)
  ↓
创建 API Client (infrastructure/http/clients/)
  ↓
创建 Transformer (infrastructure/transformers/)
  ↓
在 Composable 中调用
```

### 完整开发示例（Figma + Apifox）

**场景**：开发"商品列表页"

**步骤 1：获取设计规格**

```
我：使用 Figma MCP 获取"商品列表页"的设计稿
Claude：[返回设计稿信息]
  - 页面布局：网格 2 列（移动端）/ 4 列（桌面端）
  - 商品卡片：宽度 100%，圆角 8px，阴影 sm
  - 间距：卡片间距 16px，内边距 12px
  - ...
```

**步骤 2：查询 API 文档**

```
我：使用 Apifox MCP 查询"获取商品列表"接口
Claude：[返回 API 文档]
  - 路径：GET /items
  - 参数：page, pageSize, categoryId
  - 响应：{ list: [], total: 0 }
  - 字段说明：...
```

**步骤 3：开始开发**

```
我：根据设计稿和 API 文档，帮我开发商品列表页
Claude：好的，我会：
  1. 创建类型定义（根据 Apifox 文档）
  2. 创建 API Client
  3. 创建 Transformer
  4. 创建 Composable
  5. 创建 Vue 页面（根据 Figma 设计）
```

### MCP 工具使用原则

**何时使用**：

- ✅ 开发新功能前，先查询设计稿和 API 文档
- ✅ 不确定接口参数时，查询 Apifox
- ✅ 不确定设计规格时，查询 Figma
- ✅ 遇到字段含义不明确时，查询文档

**注意事项**：

- 📌 Figma 设计稿是 UI 的权威标准，严格遵循
- 📌 Apifox 文档是 API 的权威标准，严格遵循
- 📌 设计稿和文档有冲突时，优先与团队确认
- 📌 MCP 工具返回的信息可能滞后，如有疑问及时沟通

## 代码规范要点

### 命名规范


| 类型          | 规范                  | 示例                      |
| ----------- | ------------------- | ----------------------- |
| 组件文件        | PascalCase          | `ProductCard.vue`       |
| 页面文件        | kebab-case          | `index.vue`, `[id].vue` |
| Composable  | `use{Name}`         | `useProduct.ts`         |
| Store       | kebab-case          | `cart.ts`, `user.ts`    |
| API Client  | `{Name}ApiClient`   | `ItemApiClient.ts`      |
| Transformer | `{name}Transformer` | `productTransformer.ts` |
| 类型接口        | `I{Name}`           | `IProduct`, `IUser`     |


### 样式规范

**禁止**：

- ❌ 使用 `<style>` 标签写自定义 CSS
- ❌ 使用内联样式

**必须**：

- ✅ 使用 Tailwind CSS 类名
- ✅ 自定义组件使用 `sp-` 前缀（如 `sp-btn`, `sp-card`）

### 日志规范

**禁止**：使用 `console.log`、`console.warn`、`console.error`

**必须**：使用封装的 logger

```typescript
import { logger } from '~/utils/log'

logger.info('[模块名] 日志内容')
logger.warn('[模块名] 警告信息')
logger.error('[模块名] 错误信息', error)
```

### API 规范

**路径约定**：

- APIfox 文档路径：`/api/h5app/wxapp/xxx`
- 代码中使用路径：去掉前缀，直接使用 `/xxx`
- 原因：HTTP 插件会自动添加前缀

**Company ID 自动注入**：

- HTTP 插件自动为所有请求添加 `company_id`
- 从环境变量 `NUXT_PUBLIC_COMPANY_ID` 读取
- 禁止手动传递 `company_id` 参数

**Content-Type 处理**：

- 默认使用 `application/x-www-form-urlencoded`
- HTTP 插件自动转换 body 为 URLSearchParams
- 特殊情况使用 `useJson: true` 选项

## 常见模块开发模式

### 商品模块（简化架构示例）

```typescript
// 1. 类型定义
// app/types/api/item.ts
export interface IItemDTO { ... }

// 2. API Client
// app/infrastructure/http/clients/ItemApiClient.ts
export class ItemApiClient {
  async getItemList(params: any) { ... }
}

// 3. Transformer
// app/infrastructure/transformers/productTransformer.ts
export class ProductTransformer {
  static toModel(dto: IItemDTO): IProduct { ... }
}

// 4. Composable
// app/composables/useProduct.ts
export function useProduct() {
  const products = ref([])
  const loading = ref(false)
  
  async function loadProducts(params) {
    loading.value = true
    const response = await itemApiClient.getItemList(params)
    products.value = ProductTransformer.toModelList(response.list)
    loading.value = false
  }
  
  return { products, loading, loadProducts }
}

// 5. 页面
// app/pages/products/index.vue
<script setup>
const { products, loadProducts } = useProduct()
onMounted(() => loadProducts({ page: 1 }))
</script>
```

### 购物车模块（完整架构示例）

```typescript
// 1. 类型定义
// app/types/cart.ts
export interface ICartItem { ... }

// 2. API Client
// app/infrastructure/http/clients/CartApiClient.ts
export class CartApiClient {
  async getCart() { ... }
  async addToCart(params) { ... }
}

// 3. Transformer
// app/infrastructure/transformers/cartTransformer.ts
export class CartTransformer {
  static toModel(dto: any): ICart { ... }
}

// 4. Store
// app/stores/cart.ts
export const useCartStore = defineStore('cart', {
  state: () => ({ items: [], loading: false }),
  
  actions: {
    async fetchCart() {
      this.loading = true
      const response = await cartApiClient.getCart()
      this.items = CartTransformer.toModelList(response.items)
      this.loading = false
    },
    
    async addItem(productId: string, quantity: number) {
      await cartApiClient.addToCart({ product_id: productId, quantity })
      await this.fetchCart()
    }
  }
})

// 5. Composable
// app/composables/useCart.ts
export function useCart() {
  const cartStore = useCartStore()
  
  const addToCart = async (productId: string, quantity: number) => {
    try {
      await cartStore.addItem(productId, quantity)
      return true
    } catch (error) {
      logger.error('[useCart] 添加失败:', error)
      return false
    }
  }
  
  return {
    items: computed(() => cartStore.items),
    loading: computed(() => cartStore.loading),
    addToCart
  }
}

// 6. 页面
// app/pages/cart/index.vue
<script setup>
const { items, loading, addToCart } = useCart()

const cartStore = useCartStore()
onMounted(() => cartStore.fetchCart())
</script>
```

## DDD 架构补充说明

当业务复杂度较高时，可以采用 DDD 架构：

### 领域层（Domain Layer）

- **聚合根**：如 `CartAggregate`，管理购物车的业务不变性
- **实体**：如 `CartItemEntity`，有唯一标识的领域对象
- **值对象**：如 `MoneyValueObject`，不可变的业务概念
- **领域服务**：跨实体的业务逻辑
- **仓储接口**：定义数据访问契约

### 应用层（Application Layer）

- **应用服务**：协调领域对象完成用例
- **DTO**：数据传输对象

### 何时使用 DDD

- ✅ 业务规则复杂（如购物车、订单、结算）
- ✅ 需要严格的业务规则验证
- ✅ 多个实体需要协同工作
- ❌ 简单的 CRUD 操作不需要

**详细 DDD 规范**请参考：`references/ddd-guide.md`

## 故障排查

### 常见问题

**Q: 如何确定是否需要 Store？**
A: 检查是否需要跨组件共享状态或持久化。如果只在单个页面使用，用 Composable 即可。

**Q: Composable 和 Store 的区别？**
A: 

- Composable：封装可复用逻辑，可以局部状态，灵活
- Store：全局状态管理，跨组件共享，持久化

**Q: API 路径应该写完整路径还是相对路径？**
A: 写相对路径（去掉 `/api/h5app/wxapp` 前缀），HTTP 插件会自动添加。

**Q: 如何处理错误？**
A: 

- API 错误：在 Composable 中捕获并使用 `logger` 记录
- 业务错误：在领域层抛出 `DomainError`
- UI 错误：在页面层使用 toast/message 提示用户

**Q: 样式应该写在哪里？**
A: 

- 不要写 `<style>` 标签
- 使用 Tailwind CSS 工具类
- 自定义主题配色在 `app.config.ts` 中配置

## 资源索引

### 核心文档

- `references/architecture-rules.md` - 完整架构决策规则
- `references/web-rules.md` - Web 开发规范
- `references/ddd-guide.md` - DDD 开发指南

### 快速参考

- API 路径规范：`references/api-conventions.md`
- 组件开发规范：`app/components/README.md`
- Composable 指南：`app/composables/README.md`

### 示例代码

参考现有模块实现：

- 购物车（完整架构）：`app/stores/cart.ts`, `app/composables/useCart.ts`
- 商品（简化架构）：`app/composables/useProduct.ts`
- 认证（完整架构）：`app/stores/user.ts`, `app/composables/useAuth.ts`

## 开发检查清单

开发新功能前，请确认：

- 已确定使用哪种架构方案（方案 1/2/3）
- 已创建必要的类型定义（`types/`）
- 已创建 API Client（如需要）
- 已创建 Transformer（如需要）
- 已创建 Store（如需要）
- 已创建 Composable（如需要）
- 组件使用 Tailwind CSS，不使用 `<style>` 标签
- 使用 `logger` 而非 `console.log`
- API 路径使用相对路径（不含前缀）
- Props 和 Emits 有完整的类型定义
- 代码通过 TypeScript 类型检查
- 遵循项目命名规范

---

**最后更新**：2025-01-11
**维护者**：ECShopX Team