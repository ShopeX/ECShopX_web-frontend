# UI 组件库 - 组件库模式

## 📁 新目录结构

```
app/components/ui/
├── form/                    ✅ 已重构
│   ├── Form.vue
│   ├── FormItem.vue
│   ├── FormInput.vue
│   ├── FormSelect.vue
│   ├── FormRadioGroup.vue
│   ├── FormCheckboxGroup.vue
│   ├── composables/
│   │   ├── useFormValidation.ts
│   │   └── useFormItem.ts
│   ├── types.ts
│   └── index.ts
│
├── theme/                   ✅ 已重构
│   ├── colors.ts
│   ├── sizes.ts
│   ├── variants.ts
│   └── index.ts
│
├── button/                  ✅ 已重构
│   ├── Button.vue
│   ├── types.ts
│   └── index.ts
│
├── input/                   ✅ 已重构
│   ├── Input.vue
│   ├── types.ts
│   └── index.ts
│
├── select/                  ⏳ 待创建
│   ├── Select.vue
│   ├── SelectOption.vue
│   ├── types.ts
│   └── index.ts
│
├── radio/                   ⏳ 待创建
│   ├── Radio.vue
│   ├── RadioGroup.vue
│   ├── types.ts
│   └── index.ts
│
├── checkbox/                ⏳ 待创建
│   ├── Checkbox.vue
│   ├── CheckboxGroup.vue
│   ├── types.ts
│   └── index.ts
│
├── toast/                   ⏳ 待创建
│   ├── Toast.vue
│   ├── ToastContainer.vue
│   ├── useToast.ts
│   ├── types.ts
│   └── index.ts
│
└── quantity-input/          ⏳ 待创建
    ├── QuantityInput.vue
    ├── types.ts
    └── index.ts
```

## 🔄 使用方式更新

### 旧方式（单文件组件）
```vue
<script setup>
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import FormItem from '~/components/ui/FormItem.vue'
import { buttonVariants } from '~/components/ui/theme'
</script>
```

### 新方式（Nuxt 自动导入 + 类型导入）
```vue
<script setup lang="ts">
// ✅ 组件由 Nuxt 自动导入，无需手动 import
// ✅ 类型从 types.ts 导入
import type { IFormSchema } from '~/components/ui/form/types'

// ✅ Composables 从具体路径导入
import { useFormValidation } from '~/components/ui/form/composables/useFormValidation'

// ✅ 主题变量从 theme 导入
import { buttonVariants } from '~/components/ui/theme'

const schema: IFormSchema[] = [...]
const formData = ref({})
</script>

<template>
  <!-- ✅ 组件自动导入，直接使用 -->
  <UiFormForm :schema="schema" v-model="formData" />
  
  <UiButtonButton variant="solid" size="md">提交</UiButtonButton>
  <UiInputInput v-model="username" placeholder="用户名" />
</template>
```

## ✅ 已完成的模块

1. **form/** - 表单系统（最复杂）
   - 428行的 FormItem.vue 拆分为 5 个子组件
   - 提取 composables（useFormValidation, useFormItem）
   - 完整的类型定义和导出

2. **theme/** - 主题系统
   - colors.ts - 颜色定义
   - sizes.ts - 尺寸定义
   - variants.ts - 变体定义

3. **button/** - 按钮组件
   - 增强功能（loading 状态）
   - 完整类型定义

4. **input/** - 输入框组件
   - 增强功能（clearable, password toggle）
   - 完整类型定义

## ⏳ 待完成的模块

5. **select/** - 下拉选择组件
6. **radio/** - 单选框组件
7. **checkbox/** - 复选框组件
8. **toast/** - 提示组件
9. **quantity-input/** - 数量输入器

## 🗑️ 需要清理的旧文件

- `/Button.vue` → 已迁移到 `/button/Button.vue`
- `/Input.vue` → 已迁移到 `/input/Input.vue`
- `/Form.vue` → 已迁移到 `/form/Form.vue`
- `/FormItem.vue` → 已迁移到 `/form/FormItem.vue`
- `/theme.ts` → 已迁移到 `/theme/`

## 📝 下一步行动

1. **立即**：更新所有引用路径（登录页面、业务组件等）
2. **高优先级**：创建剩余的独立组件模块（select, radio, checkbox）
3. **中优先级**：重构 toast 和 quantity-input
4. **低优先级**：清理旧文件

## 💡 优势

✅ **更好的组织** - 每个组件有独立目录  
✅ **更易维护** - 代码职责清晰  
✅ **更可测试** - 独立组件易于测试  
✅ **更可复用** - 组件可独立使用  
✅ **更灵活** - 支持 Schema 驱动和独立使用两种方式  

