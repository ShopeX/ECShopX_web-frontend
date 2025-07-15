# 样式指南

## 技术栈

项目使用以下技术来管理样式：

- Tailwind CSS：原子化 CSS 框架
- SCSS：CSS 预处理器
- CSS Modules：组件级样式隔离

## Tailwind CSS 配置

项目的 Tailwind CSS 配置位于 `nuxt.config.ts` 中：

```typescript
tailwindcss: {
  cssPath: '~/assets/css/main.css',
  config: {
    content: [
      './components/**/*.{js,vue,ts}',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './plugins/**/*.{js,ts}',
      './app.vue',
    ],
    theme: {
      extend: {
        colors: {
          primary: '#007AFF',
          secondary: '#666666',
          dark: '#333333',
          light: '#f7f7fa',
        },
        fontFamily: {
          sans: ['Noto Sans SC', 'sans-serif'],
        },
      },
    },
  }
}
```

## 全局样式

### 变量定义

```scss
// assets/css/variables.scss
:root {
  // 颜色
  --color-primary: #007aff;
  --color-secondary: #666666;
  --color-dark: #333333;
  --color-light: #f7f7fa;

  // 字体
  --font-family: 'Noto Sans SC', sans-serif;

  // 间距
  --spacing-base: 4px;
  --spacing-small: 8px;
  --spacing-medium: 16px;
  --spacing-large: 24px;

  // 圆角
  --radius-small: 4px;
  --radius-medium: 8px;
  --radius-large: 16px;

  // 阴影
  --shadow-small: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-large: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### 主题样式

```scss
// assets/css/main.css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
@import './variables.scss';

// 全局样式
body {
  @apply font-sans text-dark bg-light;
}

// 通用样式类
.container {
  @apply max-w-7xl mx-auto px-4;
}

// 按钮样式
.btn {
  @apply px-4 py-2 rounded-md transition-colors duration-200;

  &-primary {
    @apply bg-primary text-white hover:bg-primary/90;
  }

  &-secondary {
    @apply bg-secondary text-white hover:bg-secondary/90;
  }
}
```

## 组件样式规范

### 1. 组件样式结构

```vue
<template>
  <div class="product-card">
    <!-- 组件内容 -->
  </div>
</template>

<style scoped lang="scss">
.product-card {
  @apply bg-white rounded-lg shadow-md;

  &__image {
    @apply w-full h-48 object-cover;
  }

  &__title {
    @apply text-lg font-medium;
  }

  &__price {
    @apply text-primary text-xl;
  }
}
</style>
```

### 2. 样式命名规范

- 使用 BEM 命名规范
  - Block：组件的主要容器
  - Element：组件内的元素
  - Modifier：元素的不同状态或变体

```scss
.block {
  // 块样式

  &__element {
    // 元素样式

    &--modifier {
      // 修饰符样式
    }
  }
}
```

### 3. 响应式设计

使用 Tailwind 的响应式前缀：

```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- 响应式内容 -->
</div>
```

常用断点：

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 4. 动画和过渡

```scss
// 过渡效果
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

// 动画效果
@keyframes pulse {
  0%,
  100% {
    @apply opacity-100;
  }
  50% {
    @apply opacity-50;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 最佳实践

1. **样式复用**
   - 使用 Tailwind 的 @apply 指令抽取常用样式
   - 创建可复用的样式类
   - 使用 SCSS 混入（mixins）封装复杂样式

2. **性能优化**
   - 避免深层次选择器
   - 使用 CSS 变量实现主题切换
   - 合理使用 CSS Grid 和 Flexbox

3. **维护性**
   - 保持样式文件结构清晰
   - 注释关键样式代码
   - 遵循命名规范

4. **调试**
   - 使用浏览器开发工具
   - 检查样式冲突
   - 验证响应式设计
