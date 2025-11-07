# Business 业务组件库

业务组件按功能模块分组管理。

## 📁 目录结构

```
app/components/business/
├── cart/                      ✅ 购物车模块
│   ├── CartList.vue          # 购物车列表
│   ├── CartItem.vue          # 购物车商品项
│   ├── CartFooter.vue        # 购物车底部栏
│   ├── index.ts              # 统一导出
│   └── README.md             # 模块文档
│
├── auth/                      ✅ 认证模块
│   ├── CaptchaInput.vue      # 图形验证码
│   ├── VerificationCodeInput.vue  # 短信验证码
│   └── index.ts              # 统一导出
│
├── product/                   ✅ 商品模块
│   ├── ProductCard/          # 商品卡片（完整版）
│   │   ├── index.vue         # 主组件
│   │   ├── index.ts          # 导出
│   │   └── types.ts          # TypeScript 类型
│   ├── ItemCard.vue          # 商品卡片（简单版，保留用于兼容）
│   ├── ItemFilter/           # 商品筛选（已重构为模块化）
│   │   ├── ItemFilter.vue    # 主容器
│   │   ├── components/       # 子组件目录
│   │   │   ├── FilterSortSection.vue
│   │   │   ├── FilterPriceRange.vue
│   │   │   └── FilterBrandSelect.vue
│   │   └── README.md
│   └── index.ts              # 统一导出
```

## 📦 模块说明

### Cart 模块 - 购物车
**文件**: `cart/`  
**组件数**: 3  
**复杂度**: 🟡 中等

**包含**：
- CartList - 购物车列表容器
- CartItem - 购物车商品项
- CartFooter - 购物车底部操作栏

**使用**：
```vue
<template>
  <!-- ✅ Nuxt 自动导入，直接使用 -->
  <CartList :items="items" />
  <CartItem :item="item" />
  <CartFooter />
</template>
```

---

### Auth 模块 - 认证
**文件**: `auth/`  
**组件数**: 2  
**复杂度**: 🟢 简单

**包含**：
- CaptchaInput - 图形验证码输入
- VerificationCodeInput - 短信验证码输入（带倒计时）

**使用**：
```vue
<template>
  <CaptchaInput v-model="captcha" :image="captchaImage" @refresh="refreshCaptcha" />
  <VerificationCodeInput v-model="code" :countdown="countdown" @send="sendCode" />
</template>
```

---

### Product 模块 - 商品
**文件**: `product/`  
**组件数**: 3  
**复杂度**: 🟡 中等

**包含**：
- ProductCard - 商品卡片（完整版）
- ItemCard - 商品卡片（简单版）
- ItemFilter - 商品筛选组件（模块化）

**使用**：
```vue
<template>
  <ProductCard :product="product" />
  <ItemFilter v-model="filterParams" :brands="brands" @change="handleFilterChange" />
</template>
```

---

### Product 模块 - 商品
**文件**: `product/`  
**组件数**: 3（全部已完成）  
**复杂度**: 🟢 简单到中等

**包含**：
- ProductCard - 商品卡片（完整版，用于列表展示） ✅
- ItemCard - 商品卡片（简单版，保留用于兼容） ✅
- ItemFilter - 商品筛选（已重构为模块化） ✅
  - FilterSortSection - 排序区域
  - FilterPriceRange - 价格区间
  - FilterBrandSelect - 品牌筛选

---

## 🔄 迁移状态

| 旧文件 | 新位置 | 状态 | 说明 |
|--------|--------|------|------|
| CartList.vue | cart/CartList.vue | ✅ 完成 | 已迁移并删除旧文件 |
| CartItem.vue | cart/CartItem.vue | ✅ 完成 | 已迁移并删除旧文件 |
| CartFooter.vue | cart/CartFooter.vue | ✅ 完成 | 已迁移并删除旧文件 |
| CaptchaInput.vue | auth/CaptchaInput.vue | ✅ 完成 | 已迁移并删除旧文件 |
| VerificationCodeInput.vue | auth/VerificationCodeInput.vue | ✅ 完成 | 已迁移并删除旧文件 |
| ItemCard.vue | product/ItemCard.vue | ✅ 完成 | 已迁移并删除旧文件 |
| ItemFilter.vue | product/ItemFilter/ | ✅ 完成 | 已重构为模块化并删除旧文件 |
| SpProductCard/ | product/ProductCard/ | ✅ 完成 | 重命名并移至 product 模块 |

---

## 🎯 后续优化计划

### 短期优化（建议）
1. **完善品牌筛选功能**
   - 集成 UCheckbox 组件
   - 实现品牌搜索
   - 支持品牌拼音快速定位

2. **扩展筛选维度**
   - 添加分类筛选
   - 添加属性筛选（颜色、尺寸等）
   - 支持自定义筛选条件

### 中期优化（可选）
1. **性能优化**
   - 虚拟滚动（大列表场景）
   - 防抖优化（价格输入）
   - 懒加载（图片资源）

2. **用户体验提升**
   - 筛选历史记录
   - 常用筛选快捷保存
   - 筛选条件分享

---

## 💡 设计原则

### 1. 功能模块分组
- 相关组件放在同一目录
- 每个模块有独立的 `index.ts` 导出
- 每个模块有独立的 `README.md` 文档

### 2. 组件大小控制
- 单文件 < 200 行 ✅ 保持单文件
- 单文件 200-300 行 ⚠️ 考虑拆分
- 单文件 > 300 行 ❌ 必须拆分

### 3. 导出方式
```typescript
// 模块统一导出
export { default as ComponentName } from './ComponentName.vue'

// 使用时（Nuxt 自动导入）
<template>
  <ComponentName />
</template>
```

---

## 📝 贡献指南

### 新增业务组件
1. 判断组件属于哪个功能模块
2. 在对应模块目录下创建组件
3. 更新模块的 `index.ts` 导出
4. 更新模块的 `README.md` 文档

### 重构复杂组件
1. 创建子目录（如 `ItemFilter/`）
2. 拆分为主容器 + 子组件
3. 每个子组件 < 150 行
4. 测试通过后删除旧文件

---

**重构日期**: 2025-11-06  
**重构人员**: AI Assistant  
**文档版本**: 1.0

