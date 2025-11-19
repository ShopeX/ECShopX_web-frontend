# 图片资源目录规范

## 目录结构

```
ecshopx-web/
├── public/                    # 静态资源（不经过构建处理）
│   ├── favicon.ico           # 网站图标
│   └── images/               # 公共图片目录
│       ├── brand/           # 品牌相关
│       │   ├── logo.png     # 主 Logo
│       │   ├── logo-light.png  # 亮色 Logo
│       │   └── logo-dark.png   # 深色 Logo
│       ├── icons/           # 系统图标
│       │   ├── default-avatar.png  # 默认头像
│       │   ├── empty-cart.svg      # 空购物车图标
│       │   └── no-data.svg         # 无数据占位图
│       └── payment/         # 支付方式图标
│           ├── alipay.png
│           ├── wechat.png
│           └── unionpay.png
│
└── app/
    └── assets/                # 需要构建处理的资源
        ├── css/              # 样式文件
        │   ├── main.css
        │   └── sp-theme.css
        └── images/           # 构建时处理的图片
            ├── banners/      # 横幅图片
            │   ├── home-banner.jpg
            │   └── promotion-banner.jpg
            ├── placeholders/ # 占位图片
            │   ├── product-placeholder.png
            │   └── category-placeholder.png
            └── backgrounds/  # 背景图片
                └── auth-bg.jpg
```

## 使用规范

### 1. public/images/ - 系统图片（推荐）

#### 适用场景
- ✅ Logo、favicon（网站图标）
- ✅ 默认头像、空状态图标
- ✅ 支付方式图标
- ✅ 第三方服务图标
- ✅ 需要固定 URL 的图片

#### 特点
- 直接从 `/` 根路径访问
- URL 固定不变
- 不经过构建工具处理
- 适合 SEO（固定路径）

#### 使用方式

**在组件中**：
```vue
<template>
  <!-- ✅ 直接使用绝对路径 -->
  <img src="/images/brand/logo.png" alt="ECSHOPX Logo">
  <img src="/images/icons/default-avatar.png" alt="默认头像">
  <img src="/images/payment/alipay.png" alt="支付宝">
</template>

<script setup lang="ts">
// 无需导入，直接使用
</script>
```

**在 SEO meta 中**：
```typescript
useSeoMeta({
  ogImage: '/images/brand/logo.png',  // ✅ 固定路径，适合分享
})
```

---

### 2. assets/images/ - 构建优化图片

#### 适用场景
- ✅ 页面横幅、轮播图
- ✅ 背景图片
- ✅ 需要响应式处理的图片
- ✅ 需要构建时优化的图片

#### 特点
- 经过 Vite 构建处理
- 自动优化、压缩
- 文件名添加 hash（缓存优化）
- URL 在构建时生成

#### 使用方式

**在组件中**：
```vue
<template>
  <!-- ❌ Nuxt 4 不推荐使用 require -->
  <!-- <img :src="require('~/assets/images/banners/home-banner.jpg')"> -->
  
  <!-- ✅ 推荐：使用 import -->
  <img :src="homeBanner" alt="首页横幅">
</template>

<script setup lang="ts">
import homeBanner from '~/assets/images/banners/home-banner.jpg'
</script>
```

**在 CSS 中**：
```css
/* assets/css/sp-theme.css */
.sp-auth-bg {
  background-image: url('~/assets/images/backgrounds/auth-bg.jpg');
  background-size: cover;
}
```

---

## 选择建议

### 系统图片 → public/images/

```
✅ Logo                  → public/images/brand/logo.png
✅ favicon              → public/favicon.ico
✅ 默认头像              → public/images/icons/default-avatar.png
✅ 空状态图标            → public/images/icons/empty-cart.svg
✅ 支付方式图标          → public/images/payment/alipay.png
```

**原因**：
1. 固定 URL，便于 SEO
2. 不需要构建优化
3. 加载速度快（直接提供）

### 页面图片 → assets/images/

```
✅ 首页横幅              → assets/images/banners/home-banner.jpg
✅ 背景图片              → assets/images/backgrounds/auth-bg.jpg
✅ 占位图                → assets/images/placeholders/product-placeholder.png
```

**原因**：
1. 需要构建时优化
2. 可能需要响应式处理
3. 文件较大，需要压缩

---

## 图片优化建议

### 1. 格式选择

```
✅ Logo/图标          → SVG（矢量，无损）
✅ 照片/商品图        → JPEG/WebP（有损压缩）
✅ 透明背景图标       → PNG/WebP（支持透明）
✅ 动图               → GIF/WebP（动画）
```

### 2. 尺寸建议

```
Logo:
  - 大尺寸（Header）: 200x60px
  - 小尺寸（Footer）: 120x40px
  - favicon:         32x32px, 16x16px

图标:
  - 默认尺寸:        48x48px
  - 2x 高清:         96x96px

商品图:
  - 列表缩略图:       300x300px
  - 详情大图:         800x800px
  - 2x 高清:         1600x1600px
```

### 3. 文件命名

```
✅ 小写字母 + 短横线
   logo.png, default-avatar.png

✅ 描述性命名
   home-banner.jpg, empty-cart.svg

✅ 尺寸标注（可选）
   logo@2x.png, banner-mobile.jpg

❌ 避免
   IMG_001.jpg, 图片1.png, banner1.jpg
```

---

## 实际示例

### 电商系统常见图片分类

#### public/images/ 目录

```typescript
// 在任何组件中直接使用
<template>
  <!-- Logo -->
  <img src="/images/brand/logo.png" alt="ECSHOPX">
  
  <!-- 空状态 -->
  <img src="/images/icons/empty-cart.svg" alt="购物车为空">
  
  <!-- 支付方式 -->
  <img src="/images/payment/alipay.png" alt="支付宝">
  <img src="/images/payment/wechat.png" alt="微信支付">
  
  <!-- 默认图 -->
  <img src="/images/icons/default-avatar.png" alt="默认头像">
</template>
```

#### assets/images/ 目录

```vue
<template>
  <!-- 页面横幅 -->
  <div class="sp-banner">
    <img :src="banner" alt="促销横幅">
  </div>
  
  <!-- 背景图 -->
  <div class="sp-auth-page">
    <!-- 背景在 CSS 中定义 -->
  </div>
</template>

<script setup lang="ts">
// 构建时导入
import banner from '~/assets/images/banners/home-banner.jpg'
</script>

<style>
.sp-auth-page {
  background-image: url('~/assets/images/backgrounds/auth-bg.jpg');
}
</style>
```

---

## 注意事项

### ✅ 推荐做法

1. **系统图标优先使用 `public/`**
   ```
   /images/brand/logo.png
   /images/icons/default-avatar.png
   ```

2. **固定 URL 使用 `public/`**
   ```vue
   <meta property="og:image" content="/images/brand/logo.png">
   ```

3. **大图片优化使用 `assets/`**
   ```
   ~/assets/images/banners/home-banner.jpg
   ```

### ❌ 避免做法

1. ❌ 不要在 `public/` 中放需要优化的大图
   ```
   ❌ public/images/product-detail-large.jpg (5MB)
   ```

2. ❌ 不要在 `assets/` 中放固定 URL 的资源
   ```
   ❌ assets/favicon.ico
   ```

3. ❌ 不要混用两种目录
   ```
   ❌ 同一类型图片分散在 public/ 和 assets/
   ```

---

## 迁移建议

如果项目已有图片，建议按以下步骤迁移：

1. **识别图片类型**
   ```bash
   # 找出所有图片
   find app/assets -name "*.png" -o -name "*.jpg" -o -name "*.svg"
   ```

2. **分类移动**
   ```bash
   # 系统图标 → public/images/
   mv app/assets/logo.png public/images/brand/
   
   # 页面图片 → assets/images/
   mv app/components/Banner.png app/assets/images/banners/
   ```

3. **更新引用**
   ```vue
   <!-- 修改前 -->
   <img src="~/components/logo.png">
   
   <!-- 修改后 -->
   <img src="/images/brand/logo.png">
   ```

---

## 总结

### 快速决策

**问：我的图片应该放哪里？**

| 图片类型 | 目录 | 原因 |
|---------|------|------|
| Logo/favicon | `public/images/brand/` | 固定 URL，SEO 友好 |
| 系统图标 | `public/images/icons/` | 不需要优化，固定路径 |
| 支付图标 | `public/images/payment/` | 第三方资源，固定 URL |
| 默认头像 | `public/images/icons/` | 系统资源，不变更 |
| 页面横幅 | `assets/images/banners/` | 需要优化，可能更新 |
| 背景图片 | `assets/images/backgrounds/` | 需要压缩优化 |
| 占位图片 | `assets/images/placeholders/` | 可能需要响应式处理 |

### 核心原则

1. **✅ 系统图片 → public/**（推荐）
   - 不变更
   - 固定 URL
   - 不需要优化

2. **✅ 页面图片 → assets/**
   - 可能更新
   - 需要优化
   - 构建时处理

---

**更新日期**: 2025-01-09  
**适用版本**: Nuxt 4  
**状态**: ✅ 规范生效



