# TemplateEngine Composable 重构

## 重构日期
2025-12-15

## 重构背景

### 之前的结构
```
app/
├── composables/
│   └── useTemplate.ts                    # 仅包含 API 请求逻辑
└── templateEngines/
    ├── TemplateEngine.vue
    └── utils/
        └── loadDefaultTemplate.ts        # 默认模板加载逻辑（单独文件）
```

### 存在的问题

1. **职责分散**：模板相关逻辑分散在两个位置
2. **不符合 Nuxt 约定**：工具函数应该放在 composables 中
3. **需要显式导入**：`loadDefaultTemplate` 需要手动导入
4. **维护困难**：相关逻辑分散，不易维护

## 重构方案

### 新的结构
```
app/
├── composables/
│   └── useTemplate.ts                    # 包含所有模板相关逻辑 ✅
└── templateEngines/
    └── TemplateEngine.vue                # 使用 composable
```

### 重构内容

#### 1. 合并到 `app/composables/useTemplate.ts`

**新增函数：**

```typescript
// 1. 获取业务模式
export function getBusinessMode(): 'b2b' | 'b2c'

// 2. 加载默认模板（异步）
export async function loadDefaultTemplate(templateName: string): Promise<ITemplateConfig | null>

// 3. 获取默认模板（同步）
export function getDefaultTemplateSync(templateName: string): ITemplateConfig | null

// 4. 使用模板配置（包含 API + 默认模板）
export const useTemplateWithFallback = async (name: string)
```

**原有函数：**

```typescript
// 从 API 获取模板配置
export const useTemplate = (name: string)
```

#### 2. 简化 `TemplateEngine.vue`

**之前：**
```vue
<script setup lang="ts">
import { loadDefaultTemplate } from './utils/loadDefaultTemplate'

const { template: templateConfig, pending, error } = useTemplate(props.template)

const { data: defaultTemplate } = await useAsyncData(
  `default-template-${props.template}`,
  async () => {
    const template = await loadDefaultTemplate(props.template)
    // ... 复杂的逻辑
    return template
  },
  { lazy: false, server: true }
)

const template = computed(() => {
  if (templateConfig.value) return templateConfig.value
  if (defaultTemplate.value) return defaultTemplate.value
  return null
})
</script>
```

**现在：**
```vue
<script setup lang="ts">
// 无需导入，Nuxt 自动导入 composables

// 一行代码搞定所有逻辑
const { template, pending, error, defaultTemplate } = await useTemplateWithFallback(props.template)

// 日志输出
logger.info('defaultTemplate', defaultTemplate.value)
</script>
```

#### 3. 删除冗余文件

- ❌ 删除：`app/templateEngines/utils/loadDefaultTemplate.ts`
- ✅ 保留：所有逻辑已移至 `app/composables/useTemplate.ts`

## 重构优势

### 1. **更符合 Nuxt 约定**

✅ Composables 自动导入
```typescript
// 无需显式导入
const { template } = await useTemplateWithFallback('header')
```

### 2. **职责更清晰**

所有模板相关逻辑集中在一个文件：

```
app/composables/useTemplate.ts
├── getBusinessMode()           - 获取业务模式
├── loadDefaultTemplate()       - 加载默认模板
├── getDefaultTemplateSync()    - 同步获取默认模板
├── useTemplate()               - API 模板请求
└── useTemplateWithFallback()   - 完整的模板逻辑（推荐使用）
```

### 3. **代码更简洁**

**TemplateEngine.vue：**
- 之前：~60 行（包含模板逻辑）
- 现在：~30 行（只关注渲染逻辑）

### 4. **更易维护**

- 相关逻辑集中，修改更方便
- 测试更容易（单一文件）
- 文档更集中

### 5. **更好的复用性**

其他组件也可以轻松使用：

```vue
<!-- 在任何组件中使用 -->
<script setup>
// 方式 1：完整逻辑（推荐）
const { template } = await useTemplateWithFallback('footer')

// 方式 2：只加载默认模板
const defaultTemplate = await loadDefaultTemplate('header')

// 方式 3：只请求 API
const { template } = useTemplate('cart')
</script>
```

## API 参考

### `useTemplateWithFallback(name: string)` 🌟 推荐

**完整的模板加载逻辑，包含 API 和默认模板的回退机制。**

```typescript
const { template, pending, error, defaultTemplate } = await useTemplateWithFallback('header')
```

**返回值：**
- `template` - 最终使用的模板配置（优先 API，回退到默认）
- `pending` - API 请求加载状态
- `error` - API 请求错误信息
- `defaultTemplate` - 默认模板配置

**使用场景：**
- ✅ 大部分情况下推荐使用
- ✅ 需要 API + 默认模板回退
- ✅ 需要 SSR 支持

### `useTemplate(name: string)`

**仅从 API 获取模板配置。**

```typescript
const { template, pending, error, refresh } = useTemplate('header')
```

**返回值：**
- `template` - API 返回的模板配置
- `pending` - 加载状态
- `error` - 错误信息
- `refresh` - 刷新函数

**使用场景：**
- 只需要 API 数据
- 不需要默认模板回退
- 需要手动控制刷新

### `loadDefaultTemplate(templateName: string)`

**异步加载默认模板配置。**

```typescript
const template = await loadDefaultTemplate('header')
```

**参数：**
- `templateName` - 模板名称（如 'header', 'footer'）

**返回值：**
- `Promise<ITemplateConfig | null>` - 模板配置或 null

**使用场景：**
- 只需要默认模板
- 自定义加载逻辑
- 测试或调试

### `getDefaultTemplateSync(templateName: string)`

**同步获取默认模板配置（必须已预加载）。**

```typescript
const template = getDefaultTemplateSync('header')
```

**返回值：**
- `ITemplateConfig | null` - 模板配置或 null

**使用场景：**
- 模板已通过 eager 模式预加载
- 需要同步获取
- 性能优化场景

### `getBusinessMode()`

**获取当前业务模式。**

```typescript
const mode = getBusinessMode() // 'b2c' 或 'b2b'
```

**返回值：**
- `'b2b' | 'b2c'` - 业务模式

**使用场景：**
- 需要根据业务模式做不同处理
- 调试或日志

## 迁移指南

### 如果你之前使用了 `loadDefaultTemplate`

**之前：**
```typescript
import { loadDefaultTemplate } from '~/templateEngines/utils/loadDefaultTemplate'

const template = await loadDefaultTemplate('header')
```

**现在：**
```typescript
// 无需导入，Nuxt 自动导入
const template = await loadDefaultTemplate('header')
```

### 如果你在 `TemplateEngine.vue` 中使用

**之前：**
```vue
<script setup>
import { loadDefaultTemplate } from './utils/loadDefaultTemplate'

const { template: apiTemplate } = useTemplate(props.template)
const { data: defaultTemplate } = await useAsyncData(...)
const template = computed(() => apiTemplate.value || defaultTemplate.value)
</script>
```

**现在：**
```vue
<script setup>
// 一行搞定
const { template } = await useTemplateWithFallback(props.template)
</script>
```

## 文件变更

### 新增内容
- ✅ `app/composables/useTemplate.ts` 新增 4 个函数

### 删除文件
- ❌ `app/templateEngines/utils/loadDefaultTemplate.ts` 已删除

### 修改文件
- 🔧 `app/templateEngines/TemplateEngine.vue` 简化逻辑

## 测试建议

### 1. 测试 API 成功场景
```bash
# 启动项目，确保 API 可用
pnpm dev
# 访问页面，应该使用 API 配置
```

### 2. 测试 API 失败场景
```bash
# 修改 API 地址或断网
# 访问页面，应该使用默认模板
# 控制台应该看到：
# [useTemplate] Using default template due to API error: header
```

### 3. 测试不同业务模式
```bash
# 修改 .env
NUXT_PUBLIC_BUSINESS_MODE=b2b
# 重启，应该加载 b2b 目录的默认模板
```

### 4. 测试 SSR
```bash
# 查看服务端渲染的 HTML
curl http://localhost:3000 | grep -A 10 "header"
# 应该包含完整的 header 内容
```

## 总结

这次重构：

✅ **符合 Nuxt 约定** - composables 用于可复用逻辑
✅ **代码更简洁** - 减少 ~30 行代码
✅ **更易维护** - 相关逻辑集中
✅ **更好的复用** - 其他组件也可轻松使用
✅ **保持功能** - 所有功能正常，SSR 支持完整

### 推荐使用
```typescript
// 🌟 推荐：在大部分场景下使用
const { template } = await useTemplateWithFallback('header')
```

### 核心优势
- 自动导入，无需手动 import
- 一行代码，完整功能
- SSR 完全支持
- API 失败自动回退

---

**相关文档：**
- [TemplateEngine README](../app/templateEngines/README.md)
- [TemplateEngine 快速开始](../app/templateEngines/QUICK_START.md)
- [TemplateEngine 回退机制实现](./templateengine-fallback-implementation.md)

