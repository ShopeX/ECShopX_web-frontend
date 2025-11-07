# ItemFilter 组件

商品筛选组件，提供排序、价格区间、品牌筛选等功能。

## 📁 目录结构

```
ItemFilter/
├── ItemFilter.vue                 # 主容器组件
├── components/
│   ├── FilterSortSection.vue      # 排序区域
│   ├── FilterPriceRange.vue       # 价格区间筛选
│   └── FilterBrandSelect.vue      # 品牌筛选
└── README.md                      # 组件文档
```

## 🎯 重构说明

**原文件**: `ItemFilter.vue` (443行) ❌  
**重构后**: 4个模块化组件，总计 ~350 行 ✅

### 重构收益
- ✅ **代码可读性提升**: 每个子组件职责单一，易于理解
- ✅ **可维护性增强**: 独立开发和测试各个筛选功能
- ✅ **复用性提高**: 排序、价格、品牌组件可独立复用
- ✅ **协作效率**: 多人可并行开发不同筛选模块

---

## 📦 组件说明

### ItemFilter.vue（主容器）
**行数**: ~130 行  
**职责**: 协调子组件，管理整体筛选状态

**Props**:
```typescript
interface IFilterValue {
  brandId: string | number | (string | number)[]
  sort: string
  startPrice?: number
  endPrice?: number
}

{
  modelValue: IFilterValue
  brands: IBrand[]
}
```

**Events**:
```typescript
{
  'update:modelValue': [value: IFilterValue]
  'change': []
}
```

**使用示例**:
```vue
<template>
  <ItemFilter
    v-model="filterValue"
    :brands="brandList"
    @change="handleFilterChange"
  />
</template>

<script setup>
const filterValue = ref({
  brandId: [],
  sort: 'default',
  startPrice: undefined,
  endPrice: undefined
})
</script>
```

---

### FilterSortSection.vue（排序区域）
**行数**: ~110 行  
**职责**: 提供综合、销量、评论数、价格排序功能

**Props**:
```typescript
{
  currentSort: string
}
```

**Events**:
```typescript
{
  'update:sort': [value: string]
}
```

**支持的排序值**:
- `default` - 综合排序
- `sales_desc` - 销量降序
- `rating_desc` - 评论数降序
- `price_asc` - 价格升序
- `price_desc` - 价格降序

---

### FilterPriceRange.vue（价格区间）
**行数**: ~180 行  
**职责**: 提供自定义价格输入和快捷价格区间选择

**Props**:
```typescript
{
  startPrice?: number
  endPrice?: number
}
```

**Events**:
```typescript
{
  'update:startPrice': [value: number | undefined]
  'update:endPrice': [value: number | undefined]
  'change': []
}
```

**快捷价格区间**:
- 0 - 128 (9%的选择)
- 128 - 258 (32%的选择)
- 258 - 3898 (40%的选择)
- 3898 - 5198 (14%的选择)

---

### FilterBrandSelect.vue（品牌筛选）
**行数**: ~90 行  
**职责**: 提供品牌多选功能

**Props**:
```typescript
{
  brands: IBrand[]
  selectedBrandIds: (string | number)[]
}
```

**Events**:
```typescript
{
  'update:selectedBrandIds': [value: (string | number)[]]
  'change': []
}
```

**注意**: 品牌多选功能需要集成 `UCheckbox` 组件（待完善）

---

## 🔄 数据流

```
用户操作
  ↓
子组件事件（update:xxx）
  ↓
主容器处理（handleXxxUpdate）
  ↓
更新 modelValue
  ↓
触发 change 事件
  ↓
父组件响应（如：重新加载商品列表）
```

---

## 💡 设计原则

### 1. 单一职责
每个子组件只负责一个筛选维度：
- `FilterSortSection` → 排序
- `FilterPriceRange` → 价格
- `FilterBrandSelect` → 品牌

### 2. 双向绑定
使用 `v-model` + 自定义事件实现双向绑定：
```vue
<!-- 主容器 -->
<FilterPriceRange
  :start-price="modelValue.startPrice"
  :end-price="modelValue.endPrice"
  @update:start-price="handleStartPriceUpdate"
  @update:end-price="handleEndPriceUpdate"
/>
```

### 3. 状态提升
筛选状态统一由主容器管理，子组件无状态（或仅有临时状态）

### 4. 事件聚合
子组件只负责更新自己的数据，主容器负责触发 `change` 事件

---

## 🧪 测试建议

### 单元测试
1. 测试每个子组件的独立功能
2. 测试主容器的事件协调逻辑
3. 测试边界情况（空品牌、无效价格等）

### 集成测试
1. 测试多个筛选条件组合
2. 测试快速切换筛选条件
3. 测试重置功能

---

## 📝 待办事项

- [ ] 完善品牌筛选的 Checkbox 集成
- [ ] 添加更多快捷价格区间选项（动态生成）
- [ ] 支持分类筛选
- [ ] 支持属性筛选（如：颜色、尺寸等）
- [ ] 添加筛选条件清除功能
- [ ] 添加筛选历史记录

---

**重构日期**: 2025-11-06  
**重构人员**: AI Assistant  
**原组件行数**: 443 行  
**重构后总行数**: ~350 行（4个文件）  
**文档版本**: 1.0

