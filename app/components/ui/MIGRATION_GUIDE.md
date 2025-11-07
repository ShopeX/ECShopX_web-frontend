# UI 组件库重构 - 迁移指南

## 🎯 重构进度

### ✅ 已完成（核心模块）

1. **form/** - 表单系统完全重构
2. **theme/** - 主题系统模块化
3. **button/** - 按钮组件迁移
4. **input/** - 输入框组件迁移

### ⏳ 待完成（扩展模块）

5. **select/** - 下拉选择组件
6. **radio/** - 单选框组件
7. **checkbox/** - 复选框组件
8. **toast/** - 提示组件
9. **quantity-input/** - 数量输入器

---

## 📦 Nuxt 自动导入规则

**好消息！** 由于使用 Nuxt 4 的自动导入功能，大部分组件**无需手动更新引用**！

### 自动导入的组件

Nuxt 会自动从 `components/ui/` 目录导入以下组件：

```vue
<template>
  <!-- ✅ 自动导入 - 无需 import -->
  <Form :schema="schema" v-model="formData" />
  <FormItem type="input" name="username" />
  <FormInput v-model="username" />
  <Button variant="solid">提交</Button>
  <Input v-model="email" placeholder="Email" />
</template>

<script setup>
// ✅ 无需手动 import，Nuxt 自动处理
</script>
```

### 需要手动导入的

只有以下情况需要手动导入：

#### 1. Composables

```typescript
// ❌ 旧的路径（不存在）
import { useFormValidation } from '~/components/ui/composables'

// ✅ 新的路径（从具体文件导入）
import { useFormValidation } from '~/components/ui/form/composables/useFormValidation'
import { useFormItem } from '~/components/ui/form/composables/useFormItem'
```

#### 2. 类型定义

```typescript
// ❌ 旧的路径
import type { IFormSchema } from '~/types/form'

// ✅ 新的路径（从 types.ts 导入）
import type { IFormSchema } from '~/components/ui/form/types'
import type { IButtonProps } from '~/components/ui/button/types'
import type { IInputProps } from '~/components/ui/input/types'
```

#### 3. 主题变量

```typescript
// ❌ 旧的路径
import { buttonVariants } from '~/components/ui/theme'

// ✅ 新的路径
import { buttonVariants } from '~/components/ui/theme'
// 或者更细粒度的导入
import { buttonVariants } from '~/components/ui/theme/variants'
```

---

## 🔄 需要更新的文件清单

### 1. 登录页面 `pages/login/index.vue`

**状态**: ✅ 无需更新（使用自动导入）

登录页面使用的 `Form`, `FormItem` 等组件会被 Nuxt 自动导入。

### 2. 业务组件

检查以下文件是否有手动导入：

```bash
# 搜索旧的导入路径
grep -r "from '~/components/ui/FormItem" app/components/business/
grep -r "from '~/components/ui/Form'" app/components/business/
grep -r "from '~/components/ui/Button'" app/
grep -r "from '~/components/ui/Input'" app/
```

---

## 🗑️ 旧文件处理

### 可以删除的旧文件

以下旧文件已被新模块替代，**在确认所有引用更新后**可以删除：

```bash
# 旧的单文件组件（已有新模块替代）
app/components/ui/Form.vue          → form/Form.vue
app/components/ui/FormItem.vue      → form/FormItem.vue
app/components/ui/Button.vue        → button/Button.vue
app/components/ui/Input.vue         → input/Input.vue
app/components/ui/theme.ts          → theme/index.ts
```

### 删除命令（谨慎执行）

```bash
# ⚠️ 确认所有引用更新后再执行
cd /Users/lukaijie/workspace/work/shopex/smallP/ecshopx-platform/ecshopx-web

# 删除旧文件
rm app/components/ui/Form.vue
rm app/components/ui/FormItem.vue
rm app/components/ui/Button.vue
rm app/components/ui/Input.vue
rm app/components/ui/theme.ts
```

### 保留的旧文件（暂时）

以下文件还未迁移，**暂时保留**：

```bash
app/components/ui/Toast.vue         # 待迁移到 toast/
app/components/ui/QuantityInput.vue  # 待迁移到 quantity-input/
```

---

## ✅ 验证步骤

### 1. 运行 Lint 检查

```bash
pnpm lint
```

### 2. 运行开发服务器

```bash
pnpm dev
```

### 3. 测试关键页面

- [ ] 登录页面（`/login`）
- [ ] 购物车页面（`/cart`）
- [ ] 商品列表页面

### 4. 检查控制台

确保没有组件导入错误

---

## 🚀 后续计划

### Phase 1: 核心重构 ✅ 完成

- ✅ Form 模块（最复杂）
- ✅ Theme 模块
- ✅ Button 模块
- ✅ Input 模块

### Phase 2: 扩展组件 ⏳ 进行中

- ⏳ Select 模块
- ⏳ Radio 模块
- ⏳ Checkbox 模块

### Phase 3: 辅助组件 📅 待开始

- 📅 Toast 模块
- 📅 QuantityInput 模块

### Phase 4: 清理和优化 📅 待开始

- 📅 删除旧文件
- 📅 更新文档
- 📅 性能优化

---

## 💡 最佳实践

### 1. 使用 Nuxt 自动导入（推荐）

```vue
<template>
  <!-- ✅ 推荐：直接使用，Nuxt 自动导入 -->
  <UiButtonButton>提交</UiButtonButton>
  <UiFormForm :schema="schema" v-model="formData" />
</template>
```

### 2. 从具体路径导入 Composables

```typescript
// ✅ 推荐：从具体文件路径导入
import { useFormValidation } from '~/components/ui/form/composables/useFormValidation'
```

### 3. 从 types.ts 导入类型定义

```typescript
// ✅ 推荐：从 types.ts 导入类型定义
import type { IFormSchema } from '~/components/ui/form/types'
import type { IButtonProps } from '~/components/ui/button/types'
```

---

## 🆘 常见问题

### Q1: 为什么 Form 组件找不到？

**A**: 确保已经创建了 `form/Form.vue`，Nuxt 会自动导入。

### Q2: useFormValidation 导入失败？

**A**: Composables 需要从具体文件路径导入：

```typescript
import { useFormValidation } from '~/components/ui/form/composables/useFormValidation'
```

### Q3: 旧文件什么时候删除？

**A**: 在完成所有测试并确认新模块正常工作后删除。

---

**重构负责人**: AI Assistant  
**重构日期**: 2025-11-06  
**文档版本**: 1.0
