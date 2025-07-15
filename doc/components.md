# 组件文档

## 布局组件

### TopBar

- **路径**: `components/layout/TopBar.vue`
- **描述**: 顶部导航栏组件，显示登录状态和快捷链接
- **功能**:
  - 用户登录状态显示
  - 快捷导航链接
  - 响应式设计

### Header

- **路径**: `components/layout/Header.vue`
- **描述**: 主导航栏组件，包含logo、搜索框和购物车
- **功能**:
  - 品牌logo展示
  - 搜索功能
  - 购物车快捷入口
  - 响应式设计

## 首页组件

### Banner

- **路径**: `components/home/Banner.vue`
- **描述**: 首页轮播图组件
- **功能**:
  - 图片轮播
  - 自动播放
  - 手动切换
  - 响应式设计

### CategoryNav

- **路径**: `components/home/CategoryNav.vue`
- **描述**: 商品分类导航组件
- **功能**:
  - 分类列表展示
  - 悬停展开子分类
  - 响应式设计

### ProductSection

- **路径**: `components/home/ProductSection.vue`
- **描述**: 商品展示区域组件
- **属性**:
  - `title`: string - 区域标题
  - `products`: Product[] - 商品列表
  - `moreLink`: string - "更多"链接地址
- **功能**:
  - 商品网格展示
  - 图片预加载
  - 响应式布局

### ProductCard

- **路径**: `components/home/ProductCard.vue`
- **描述**: 商品卡片组件
- **属性**:
  - `product`: Product - 商品信息
- **功能**:
  - 商品信息展示
  - 图片懒加载
  - 加载状态处理
  - 错误状态处理
  - 价格格式化
  - 动画效果

## 类型定义

### Product 接口

```typescript
interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  tags?: string[]
}
```

## 组件通信

组件之间主要通过以下方式进行通信：

1. Props 向下传递数据
2. Events 向上传递事件
3. Pinia store 进行全局状态管理

## 样式指南

组件样式遵循以下原则：

1. 使用 Tailwind CSS 实现响应式设计
2. 关键动画使用 CSS transitions
3. 使用 SCSS 编写自定义样式
4. 遵循 BEM 命名规范
