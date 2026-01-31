---
name: i18n Infrastructure & Workflow
description: 多语言国际化的技术实现与交付流程。包含 Nuxt i18n 配置、RTL 布局适配、翻译管理规范、多语言同步交付流水线。当涉及国际化、多语言、i18n、翻译、RTL、阿拉伯语适配时触发。
---

# 04-i18n: 国际化基础设施与交付流程

本技能包定义了多语言支持的技术实现、RTL 布局适配以及功能交付时的多语言同步流程。

## 1. 技术栈与配置（Nuxt i18n）

### 语言配置

```typescript
// nuxt.config.ts
i18n: {
  lazy: true,
  langDir: '../app/locales',
  locales: [
    { code: 'zh', file: 'zh-CN.json', name: '简体中文' },
    { code: 'en', file: 'en-US.json', name: 'English' },
    { code: 'ar', file: 'ar.json', name: 'العربية' }
  ],
  defaultLocale: 'zh',
  strategy: 'prefix_except_default',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    redirectOn: 'root'
  }
}
```

### 文件结构

```
app/locales/
├── zh-CN.json    # 简体中文（默认）
├── en-US.json    # 英文
└── ar.json       # 阿拉伯语（RTL）
```

---

## 2. Key 命名规范

### 层级结构（使用 `.` 分隔）

```json
{
  "common": {
    "buttons": {
      "confirm": "确认",
      "cancel": "取消",
      "submit": "提交"
    },
    "messages": {
      "success": "操作成功",
      "error": "操作失败"
    }
  },
  "product": {
    "title": "商品详情",
    "addToCart": "加入购物车",
    "outOfStock": "暂时缺货"
  },
  "cart": {
    "title": "购物车",
    "empty": "购物车是空的",
    "checkout": "去结算"
  }
}
```

### 命名原则

| 规则     | ✅ 正确                  | ❌ 错误       |
| -------- | ------------------------ | ------------- |
| 语义化   | `cart.empty`             | `cart.msg1`   |
| 模块前缀 | `product.title`          | `title`       |
| 动作描述 | `common.buttons.confirm` | `common.btn1` |

---

## 3. 使用规范

### 模板中使用

```vue
<template>
  <h1>{{ $t('product.title') }}</h1>
  <button>{{ $t('common.buttons.confirm') }}</button>
</template>
```

### Script 中使用

```typescript
<script setup lang="ts">
const { t } = useI18n()

const message = computed(() => t('common.messages.success'))
</script>
```

### 带参数的翻译

```json
// zh-CN.json
{
  "cart": {
    "itemCount": "共 {count} 件商品",
    "totalPrice": "合计: ¥{price}"
  }
}
```

```vue
<template>
  <span>{{ $t('cart.itemCount', { count: 3 }) }}</span>
  <span>{{ $t('cart.totalPrice', { price: '99.00' }) }}</span>
</template>
```

### ❌ 禁止拼凑式翻译

```typescript
// ❌ 错误：拼凑式翻译
const msg = t('count') + count + t('unit')

// ✅ 正确：使用占位符
const msg = t('items_count', { count })
```

---

## 4. RTL 布局适配（阿拉伯语）

### 方向检测

```css
/* 全局 RTL 样式控制 */
html[dir='rtl'] {
  /* RTL 特定样式 */
}
```

### 逻辑方向类（优先使用）

| LTR 类       | RTL 类（推荐） | 说明          |
| ------------ | -------------- | ------------- |
| `ml-4`       | `ms-4`         | margin-start  |
| `mr-4`       | `me-4`         | margin-end    |
| `pl-4`       | `ps-4`         | padding-start |
| `pr-4`       | `pe-4`         | padding-end   |
| `text-left`  | `text-start`   | 文本对齐      |
| `text-right` | `text-end`     | 文本对齐      |

### 图标镜像

```vue
<!-- 方向性图标需要镜像 -->
<UIcon name="arrow-left" :class="{ 'scale-x-[-1]': $i18n.locale === 'ar' }" />
```

### RTL 检测 Composable

```typescript
// composables/useRtl.ts
export function useRtl() {
  const { locale } = useI18n()
  const isRtl = computed(() => locale.value === 'ar')
  return { isRtl }
}
```

---

## 5. 多语言交付流程（与功能同步）

### Step 1: 提取阶段（Extraction）

1. 识别 UI 组件中所有硬编码文案
2. 生成语义化的 i18n Key
3. 列出新增 Key 清单

**产出模板**：

```markdown
## 新增 i18n Keys

| Key                     | 中文     | 说明       |
| ----------------------- | -------- | ---------- |
| `feature.title`         | 功能标题 | 页面主标题 |
| `feature.description`   | 功能描述 | 副标题     |
| `feature.button.submit` | 提交     | 提交按钮   |
```

### Step 2: 翻译阶段（Translation）

1. 中文（zh-CN.json）：开发时直接填写
2. 英文（en-US.json）：AI 辅助翻译 + 人工校对
3. 阿拉伯语（ar.json）：AI 辅助翻译 + RTL 专项检查

**翻译示例**：

```json
// zh-CN.json
{ "feature.submit": "提交订单" }

// en-US.json
{ "feature.submit": "Submit Order" }

// ar.json
{ "feature.submit": "إرسال الطلب" }
```

### Step 3: 校验阶段（Validation）

**缺失项检查**：

```bash
# 检查是否所有 Key 都已翻译
# 比对 zh-CN.json、en-US.json、ar.json 的 Key 一致性
```

**长文本溢出检查**：

- 德语/阿拉伯语通常比中文长 20-30%
- 在多语言预览模式下检查布局

**RTL 渲染验证**：

- [ ] 文本方向正确（从右到左）
- [ ] 图标镜像正确
- [ ] 布局对称性
- [ ] 滚动条位置

### Step 4: 交付阶段（Delivery）

- **强制要求**：多语言文件与业务代码在**同一个 Commit/PR** 中提交
- **原则**："功能上齐，语言跟上"

---

## 6. 质量门禁

### 必须通过

- [ ] 所有新增文案都有 i18n Key
- [ ] zh-CN/en-US/ar 三个文件 Key 一致
- [ ] 无硬编码中文字符串
- [ ] ar 模式下关键页面无崩溃/错位

### RTL 重点检查页面

- 首页
- 商品列表页
- 商品详情页
- 购物车
- 结算页

---

## 7. 常见问题

### Q: 如何处理动态内容（如商品名）？

A: 动态内容不需要翻译，直接显示后端返回的内容。只翻译 UI 固定文案。

### Q: 如何处理日期/货币格式？

A: 使用 `@nuxtjs/i18n` 的格式化功能：

```typescript
const { d, n } = useI18n()
const date = d(new Date(), 'short') // 日期格式化
const price = n(99.99, 'currency') // 货币格式化
```

### Q: Key 太长怎么办？

A: 保持语义清晰的前提下适当缩写：

```
// ✅ 可接受
product.detail.addToCart

// ❌ 过长
product.detail.page.main.content.buttons.addToCart
```

---

## 8. 类型安全（可选增强）

```typescript
// types/i18n.d.ts
import type zhCN from '~/locales/zh-CN.json'

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends typeof zhCN {}
}
```

这样在使用 `t()` 时可以获得 Key 的自动补全和类型检查。
