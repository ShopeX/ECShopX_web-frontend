# EcShopX Website 项目上下文文档

## 1. 项目概述

EcShopX Website 是一个基于 Nuxt.js 构建的电商网站前端项目。项目采用现代化的技术栈和最佳实践，提供流畅的用户体验和完整的电商功能。

## 2. 技术栈

- **框架**: Nuxt.js
- **包管理器**: pnpm
- **样式处理**: SCSS
- **类型系统**: TypeScript
- **状态管理**: Pinia (通过 stores 目录实现)

## 3. 项目结构

```
ecshopx-website/
├── app/                 # 应用程序配置和入口
├── assets/             # 静态资源
│   ├── css/           # 全局样式
│   └── variables.scss # SCSS 变量
├── components/        # Vue 组件
│   ├── Banner.vue    # 横幅组件
│   ├── CategoryNav.vue # 分类导航
│   ├── Header.vue    # 头部组件
│   ├── home/         # 首页相关组件
│   ├── layout/       # 布局相关组件
│   ├── ProductCard.vue # 商品卡片
│   ├── ProductSection.vue # 商品区块
│   └── TopBar.vue    # 顶部栏
├── composables/      # 组合式函数
├── layouts/          # 布局模板
├── pages/           # 页面组件
├── plugins/         # Nuxt 插件
├── public/          # 公共资源
│   ├── icons/      # 图标资源
│   └── images/     # 图片资源
├── server/         # 服务端相关
├── stores/         # Pinia 状态管理
└── types/          # TypeScript 类型定义
```

## 4. 核心模块说明

### 4.1 组件系统

项目采用组件化开发方式，主要组件包括：

- `Banner.vue`: 展示广告横幅
- `CategoryNav.vue`: 商品分类导航
- `Header.vue`: 网站头部
- `ProductCard.vue`: 商品卡片展示
- `ProductSection.vue`: 商品区块展示
- `TopBar.vue`: 顶部导航栏

### 4.2 状态管理

使用 Pinia 进行状态管理，主要 store 包括：

- `counter.ts`: 计数器示例 store
- `product.ts`: 商品相关状态管理

### 4.3 路由系统

采用 Nuxt.js 的文件系统路由，主要页面：

- `pages/index.vue`: 首页

### 4.4 静态资源

项目包含丰富的静态资源：

- 图标资源 (`public/icons/`)
- 产品图片 (`public/images/products/`)
- Banner 图片 (`public/images/banners/`)
- Logo (`public/images/logo/`)

## 5. 开发规范

### 5.1 命名规范

- 组件名称：使用 PascalCase
- 文件名称：使用 kebab-case
- 变量命名：使用 camelCase
- 类型定义：使用 PascalCase

### 5.2 样式规范

- 使用 SCSS 预处理器
- 全局样式位于 `assets/css/`
- 组件样式使用 scoped 属性

### 5.3 TypeScript 规范

- 严格类型检查
- 类型定义位于 `types/` 目录
- 接口命名以 `I` 开头
- 类型别名以 `T` 开头

## 6. 构建与部署

### 6.1 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 6.2 生产环境

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 7. 注意事项

1. 确保遵循 TypeScript 类型定义
2. 组件开发遵循单一职责原则
3. 保持状态管理的清晰和可维护性
4. 注意资源文件的优化和加载性能

## 8. 常见问题

1. 开发环境配置问题
2. 类型定义相关问题
3. 状态管理最佳实践
4. 性能优化建议

## 9. 更新日志

记录项目重要更新和变更。

## 10. 贡献指南

1. 代码提交规范
2. 分支管理策略
3. 代码审查流程
4. 测试要求

## 11. 参考文档

- [Nuxt.js 官方文档](https://nuxt.com/)
- [Vue.js 官方文档](https://vuejs.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
