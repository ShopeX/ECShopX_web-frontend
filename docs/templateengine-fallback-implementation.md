# TemplateEngine 默认模板回退机制实现

## 实现日期
2025-12-15

## 需求背景

在使用 TemplateEngine 组件时，如果 API 请求失败，页面会显示错误信息或空白，影响用户体验。需要实现一个回退机制：

- **API 成功**: 使用服务端返回的模板配置（支持 CMS 装修）
- **API 失败**: 自动使用本地默认模板配置，确保页面基础功能可用
- **业务模式**: 支持 B2B 和 B2C 两种业务模式，使用不同的默认模板

## 实现方案

### 1. 核心架构

```
API 请求
  ↓
成功? → 是 → 使用 API 配置
  ↓
  否
  ↓
加载默认模板 (根据业务模式 b2b/b2c)
  ↓
templates/{mode}/{name}.ts
```

### 2. 文件结构

```
app/
├── templateEngines/
│   ├── TemplateEngine.vue          # 主组件（已修改）
│   ├── README.md                   # 使用文档（新增）
│   ├── utils/
│   │   └── loadDefaultTemplate.ts  # 默认模板加载工具（新增）
│   ├── templates/                  # 默认模板目录
│   │   ├── b2c/                   # B2C 模式默认模板
│   │   │   ├── header.ts          # 头部模板（新增）
│   │   │   ├── cart.ts            # 购物车模板（新增）
│   │   │   └── index.ts           # 首页模板（已存在）
│   │   └── b2b/                   # B2B 模式默认模板（预留）
│   └── sections/                  # 动态组件
│       ├── carousel.vue
│       └── featured-product.vue
├── layouts/
│   └── default.vue                 # 默认布局（已优化）
└── composables/
    └── useTemplate.ts              # 模板加载 Composable（已存在）
```

### 3. 实现细节

#### 3.1 环境变量配置

在 `nuxt.config.ts` 中添加业务模式配置：

```typescript
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    companyId: process.env.NUXT_PUBLIC_COMPANY_ID,
    businessMode: process.env.NUXT_PUBLIC_BUSINESS_MODE || 'b2c' // 新增
  }
}
```

在 `.env` 文件中配置：

```bash
NUXT_PUBLIC_BUSINESS_MODE=b2c
```

#### 3.2 默认模板加载工具

创建 `app/templateEngines/utils/loadDefaultTemplate.ts`：

```typescript
/**
 * 加载默认模板配置
 * 当 API 请求失败时，使用本地默认模板作为后备方案
 */

import type { ITemplateConfig } from '~/types/api/template'

/**
 * 获取业务模式（b2b 或 b2c）
 */
export function getBusinessMode(): 'b2b' | 'b2c' {
  const runtimeConfig = useRuntimeConfig()
  const mode = runtimeConfig.public.businessMode || 'b2c'
  return mode as 'b2b' | 'b2c'
}

/**
 * 加载默认模板配置
 * @param templateName - 模板名称（如 'header', 'footer', 'index' 等）
 * @returns 模板配置对象
 */
export async function loadDefaultTemplate(templateName: string): Promise<ITemplateConfig | null> {
  try {
    const businessMode = getBusinessMode()
    
    // 动态导入对应的模板配置
    const templates = import.meta.glob('../templates/*/*.ts', { eager: false })
    const templatePath = `../templates/${businessMode}/${templateName}.ts`
    
    const matchedPath = Object.keys(templates).find((path) => path === templatePath)
    
    if (!matchedPath) {
      console.warn(`[TemplateEngine] Default template not found: ${templatePath}`)
      return null
    }

    // 加载模板
    const module = await templates[matchedPath]()
    const templateConfig = (module as any).default

    console.info(`[TemplateEngine] Loaded default template: ${templatePath}`)
    return templateConfig
  } catch (error) {
    console.error(`[TemplateEngine] Failed to load default template for "${templateName}":`, error)
    return null
  }
}
```

**核心特性：**

1. **动态路径**: 根据业务模式和模板名称动态构建路径
2. **import.meta.glob**: 使用 Vite 的 glob 导入功能，支持 SSR
3. **错误处理**: 完整的错误处理和日志输出
4. **类型安全**: 返回类型为 `ITemplateConfig | null`

#### 3.3 修改 TemplateEngine 组件

在 `app/templateEngines/TemplateEngine.vue` 中添加回退逻辑：

```typescript
// 使用 API 获取模板配置
const { template: templateConfig, pending, error } = useTemplate(props.template)

// 默认模板配置（后备方案）
const defaultTemplate = ref<ITemplateConfig | null>(null)

// 最终使用的模板配置
const template = computed(() => {
  // 优先使用 API 返回的配置
  if (templateConfig.value) {
    return templateConfig.value
  }
  
  // API 失败时使用默认配置
  if (error.value && defaultTemplate.value) {
    logger.info('[TemplateEngine] Using default template due to API error')
    return defaultTemplate.value
  }
  
  return null
})

// 监听错误，加载默认模板
watch(error, async (newError) => {
  if (newError && !defaultTemplate.value) {
    logger.warn('[TemplateEngine] API request failed, loading default template:', newError)
    try {
      defaultTemplate.value = await loadDefaultTemplate(props.template)
      if (defaultTemplate.value) {
        logger.info('[TemplateEngine] Default template loaded successfully')
      }
    } catch (err) {
      logger.error('[TemplateEngine] Failed to load default template:', err)
    }
  }
}, { immediate: true })
```

**工作流程：**

1. 组件加载时，调用 API 获取模板配置
2. 监听 `error` 状态变化
3. 如果 API 失败，自动加载默认模板
4. `template` computed 属性优先返回 API 配置，失败时返回默认配置

#### 3.4 创建默认模板配置

创建 `app/templateEngines/templates/b2c/header.ts`:

```typescript
export default {
  sections: {
    header: {
      type: 'header',
      title: '购物车页面头部',
      settings: {
        layout: 'default',
      },
    },
  },
  order: ['header'],
}
```

**配置说明：**

- `sections`: 定义模板包含的区块
  - `header`: 区块的唯一标识符（对应插槽名称）
    - `type`: 区块类型（如果不使用插槽，会查找对应的组件）
    - `title`: 区块标题
    - `settings`: 区块配置
- `order`: 区块渲染顺序

#### 3.5 更新 Layout 使用方式

在 `app/layouts/default.vue` 中使用：

```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 头部导航栏 - 支持 CMS 装修，API 失败时自动使用默认模板 -->
    <TemplateEngine template="header">
      <template #header>
        <HeaderBar />
      </template>
    </TemplateEngine>

    <!-- 页面内容区域 -->
    <main class="mx-auto">
      <slot />
    </main>
  </div>
</template>
```

**使用说明：**

1. `template="header"`: 指定模板名称
2. `<template #header>`: 具名插槽，对应 `order` 中的 section key
3. API 成功时，按照 API 配置的 order 渲染
4. API 失败时，按照默认模板的 order 渲染 `#header` 插槽内容

## 技术要点

### 1. import.meta.glob 的使用

```typescript
const templates = import.meta.glob('../templates/*/*.ts', { eager: false })
```

- **glob 模式**: 匹配所有 `templates/{mode}/{name}.ts` 文件
- **eager: false**: 懒加载，只在需要时导入
- **返回值**: 一个对象，key 是文件路径，value 是导入函数
- **SSR 支持**: Vite 会在构建时处理，支持服务端渲染

### 2. 动态路径构建

```typescript
const businessMode = getBusinessMode() // 从环境变量获取
const templatePath = `../templates/${businessMode}/${templateName}.ts`
```

- 根据业务模式和模板名称动态构建路径
- 确保路径格式与 glob 模式匹配

### 3. 优先级策略

```typescript
const template = computed(() => {
  // 1. 优先使用 API 配置（支持 CMS 装修）
  if (templateConfig.value) {
    return templateConfig.value
  }
  
  // 2. API 失败时使用默认配置（保证基础功能）
  if (error.value && defaultTemplate.value) {
    return defaultTemplate.value
  }
  
  // 3. 都没有则返回 null
  return null
})
```

### 4. 响应式监听

```typescript
watch(error, async (newError) => {
  if (newError && !defaultTemplate.value) {
    // 只在 error 出现且默认模板未加载时执行
    defaultTemplate.value = await loadDefaultTemplate(props.template)
  }
}, { immediate: true }) // immediate: true 确保初始状态也会检查
```

## 使用场景

### 场景 1：正常情况（API 成功）

```
用户访问页面
  ↓
TemplateEngine 加载
  ↓
API 请求成功 ✅
  ↓
使用 API 返回的模板配置
  ↓
根据 CMS 配置渲染页面
```

### 场景 2：API 失败

```
用户访问页面
  ↓
TemplateEngine 加载
  ↓
API 请求失败 ❌ (网络错误/服务器错误/配置不存在)
  ↓
触发 error watch
  ↓
加载默认模板 (templates/b2c/header.ts)
  ↓
使用默认配置渲染页面
  ↓
页面正常显示（使用默认布局）
```

### 场景 3：开发环境

```
开发者修改页面
  ↓
API 未配置或不可用
  ↓
自动使用默认模板
  ↓
开发者可以继续开发
  ↓
后续配置 API 后，自动切换到 API 配置
```

## 优势

### 1. **用户体验**
- ✅ API 失败时页面不会空白
- ✅ 基础功能始终可用
- ✅ 无缝降级，用户无感知

### 2. **开发体验**
- ✅ 开发时无需依赖 API
- ✅ 本地调试更方便
- ✅ 默认模板可以作为开发基准

### 3. **业务灵活性**
- ✅ 支持 B2B/B2C 不同业务模式
- ✅ 不同模式使用不同默认模板
- ✅ 通过环境变量轻松切换

### 4. **可维护性**
- ✅ 代码结构清晰
- ✅ 职责分离（API 加载 / 默认加载）
- ✅ 完整的日志输出便于调试

## 测试场景

### 1. API 成功测试
```bash
# 正常启动项目，API 可用
pnpm dev
# 访问页面，应该看到 API 返回的配置
```

### 2. API 失败测试
```bash
# 模拟 API 失败（修改 API 地址或断网）
# 访问页面，应该看到默认模板
# 控制台应该显示：
# [TemplateEngine] API request failed, loading default template
# [TemplateEngine] Loaded default template: ../templates/b2c/header.ts
# [TemplateEngine] Using default template due to API error
```

### 3. 业务模式切换测试
```bash
# 修改 .env 文件
NUXT_PUBLIC_BUSINESS_MODE=b2b

# 重启项目
pnpm dev

# 应该加载 b2b 目录下的默认模板
```

## 扩展计划

### 1. 添加更多默认模板

```
templates/
├── b2c/
│   ├── header.ts      ✅ 已实现
│   ├── footer.ts      📝 待添加
│   ├── index.ts       ✅ 已存在
│   ├── cart.ts        ✅ 已实现
│   ├── product.ts     📝 待添加
│   └── account.ts     📝 待添加
└── b2b/
    ├── header.ts      📝 待添加
    ├── footer.ts      📝 待添加
    └── ...
```

### 2. 缓存优化

考虑添加默认模板的缓存机制：

```typescript
const templateCache = new Map<string, ITemplateConfig>()

export async function loadDefaultTemplate(templateName: string) {
  const cacheKey = `${getBusinessMode()}-${templateName}`
  
  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey)
  }
  
  const template = await loadTemplateFromFile(templateName)
  if (template) {
    templateCache.set(cacheKey, template)
  }
  
  return template
}
```

### 3. 降级策略配置

允许开发者配置降级策略：

```typescript
interface TemplateEngineProps {
  template: string
  fallbackStrategy?: 'default' | 'slot' | 'error'
  // 'default': 使用默认模板
  // 'slot': 使用插槽内容
  // 'error': 显示错误信息
}
```

## 相关文件

- ✅ `app/templateEngines/TemplateEngine.vue` - 主组件
- ✅ `app/templateEngines/utils/loadDefaultTemplate.ts` - 工具函数
- ✅ `app/templateEngines/templates/b2c/header.ts` - 默认头部模板
- ✅ `app/templateEngines/templates/b2c/cart.ts` - 默认购物车模板
- ✅ `app/templateEngines/README.md` - 使用文档
- ✅ `app/layouts/default.vue` - 默认布局
- ✅ `nuxt.config.ts` - 环境变量配置
- ✅ `docs/templateengine-fallback-implementation.md` - 本文档

## 总结

本次实现了一个完整的模板回退机制，确保 TemplateEngine 在 API 失败时能够自动使用本地默认模板，提升了系统的健壮性和用户体验。通过业务模式配置，支持了 B2B 和 B2C 两种不同的业务场景。

**核心价值：**
- 🎯 保证页面基础功能始终可用
- 🎨 支持 CMS 装修的同时提供稳定的后备方案
- 🔧 开发体验更好，无需强依赖 API
- 📊 完整的日志系统便于问题排查

