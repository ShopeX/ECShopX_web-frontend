# 📚 ECSHOPX Web 项目文档中心

> 欢迎来到 ECSHOPX Web 项目文档中心！这里包含项目的所有技术文档和开发指南。

---

## 🎯 快速开始

**新加入项目？** 按顺序阅读以下文档：

1. 📖 [项目概述](../README.md) - 了解项目基本信息
2. 🚀 [快速参考](./DDD-QUICK-REFERENCE.md) - 快速上手开发
3. 📋 [完整开发规范](./DDD-DEVELOPMENT-GUIDE.md) - 详细的开发规范

---

## 📖 核心文档

### 开发规范

| 文档                                                     | 说明                                                         | 适用场景              |
| -------------------------------------------------------- | ------------------------------------------------------------ | --------------------- |
| [**DDD 开发规范（完整版）**](./DDD-DEVELOPMENT-GUIDE.md) | 17,000+ 字的完整开发规范，包含架构原则、代码示例、最佳实践等 | 📚 深入学习、制定标准 |
| [**DDD 快速参考**](./DDD-QUICK-REFERENCE.md)             | 5,000 字的精简版，包含速查表和代码模板                       | ⚡ 日常开发、快速查阅 |

### 架构设计

| 文档                                                            | 说明                                |
| --------------------------------------------------------------- | ----------------------------------- |
| [**DDD 架构提案**](./architecture/ddd-architecture-proposal.md) | DDD 架构的详细设计方案              |
| [**实体层方案对比**](./architecture/实体层方案对比.md)          | class-transformer vs 自实现方案对比 |

### 功能实现

| 文档                                                            | 说明                     |
| --------------------------------------------------------------- | ------------------------ |
| [**购物车实现总结**](./shopping-cart-implementation-summary.md) | 购物车功能的完整实现记录 |
| [**购物车提案总结**](./shopping-cart-proposal-summary.md)       | 购物车功能的设计提案     |
| [**统一头部实现**](./add-unified-header-implementation.md)      | 统一头部组件的实现说明   |

### 技术指南

| 文档                                                      | 说明                     |
| --------------------------------------------------------- | ------------------------ |
| [**数据获取最佳实践**](./数据获取最佳实践指南.md)         | Nuxt 数据获取的最佳实践  |
| [**HTTP 重试功能使用指南**](./useHttp重试功能使用指南.md) | HTTP 请求重试功能说明    |
| [**HTTP 重试功能重构总结**](./HTTP重试功能重构总结.md)    | 重构过程记录             |
| [**解决重复请求问题**](./解决重复请求问题指南.md)         | 防止重复请求的方案       |
| [**修复 Pinia SSR 问题**](./fix-pinia-ssr-issue.md)       | Pinia SSR 问题的解决方案 |

### 项目结构

| 文档                                       | 说明                  |
| ------------------------------------------ | --------------------- |
| [**项目结构说明**](./project-structure.md) | 项目目录结构详细说明  |
| [**Nuxt 入口文件**](./nuxt-entry-files.md) | Nuxt 各入口文件的作用 |

---

## 🗂️ 文档分类

### 按角色分类

#### 👨‍💻 开发人员

- [快速参考](./DDD-QUICK-REFERENCE.md) - 日常开发必备
- [开发规范](./DDD-DEVELOPMENT-GUIDE.md) - 代码规范标准
- [数据获取最佳实践](./数据获取最佳实践指南.md)
- [组件开发](./components/)

#### 🏗️ 架构师

- [DDD 架构提案](./architecture/ddd-architecture-proposal.md)
- [实体层方案对比](./architecture/实体层方案对比.md)
- [数据获取架构重构建议](./数据获取架构重构建议.md)

#### 🎨 UI 开发

- [SpProductCard 组件](./components/SpProductCard.md)
- [主题系统开发规范](./DDD-DEVELOPMENT-GUIDE.md#7-主题系统开发规范)

#### 📝 产品经理

- [购物车提案](./shopping-cart-proposal-summary.md)
- [功能实现记录](./shopping-cart-implementation-summary.md)

### 按主题分类

#### 🎯 领域驱动设计 (DDD)

- [DDD 开发规范](./DDD-DEVELOPMENT-GUIDE.md)
- [DDD 快速参考](./DDD-QUICK-REFERENCE.md)
- [DDD 架构提案](./architecture/ddd-architecture-proposal.md)

#### 🎨 主题系统

- [主题系统开发规范](./DDD-DEVELOPMENT-GUIDE.md#7-主题系统开发规范)
- [主题组件示例](./DDD-QUICK-REFERENCE.md#10-主题组件模板)

#### 🛒 购物车功能

- [购物车实现总结](./shopping-cart-implementation-summary.md)
- [购物车提案](./shopping-cart-proposal-summary.md)
- [购物车 Spec](../openspec/specs/item-display/spec.md)

#### 🌐 HTTP & API

- [useHttp 使用指南](./useHttp重试功能使用指南.md)
- [HTTP 重试功能重构](./HTTP重试功能重构总结.md)
- [解决重复请求](./解决重复请求问题指南.md)
- [API 使用指南](./api/使用指南.md)

---

## 🔍 快速查找

### 我想要...

| 需求             | 推荐文档                                                        |
| ---------------- | --------------------------------------------------------------- |
| **快速上手开发** | → [快速参考](./DDD-QUICK-REFERENCE.md)                          |
| **查看代码规范** | → [开发规范](./DDD-DEVELOPMENT-GUIDE.md)                        |
| **了解架构设计** | → [DDD 架构提案](./architecture/ddd-architecture-proposal.md)   |
| **查看代码模板** | → [快速参考 - 代码模板](./DDD-QUICK-REFERENCE.md#-常用代码模板) |
| **解决具体问题** | → [FAQ](./DDD-DEVELOPMENT-GUIDE.md#16-常见问题-faq)             |
| **学习最佳实践** | → [最佳实践](./DDD-DEVELOPMENT-GUIDE.md#13-最佳实践)            |
| **了解目录结构** | → [目录结构](./DDD-DEVELOPMENT-GUIDE.md#2-目录结构规范)         |
| **学习命名规范** | → [命名规范](./DDD-DEVELOPMENT-GUIDE.md#10-命名规范)            |

### 我遇到了...

| 问题                 | 推荐文档                                                        |
| -------------------- | --------------------------------------------------------------- |
| **不知道代码放哪里** | → [分层职责](./DDD-QUICK-REFERENCE.md#-分层职责速查)            |
| **不知道怎么命名**   | → [命名速查表](./DDD-QUICK-REFERENCE.md#-命名速查表)            |
| **重复请求问题**     | → [解决重复请求](./解决重复请求问题指南.md)                     |
| **Pinia SSR 问题**   | → [修复 Pinia SSR](./fix-pinia-ssr-issue.md)                    |
| **数据获取问题**     | → [数据获取最佳实践](./数据获取最佳实践指南.md)                 |
| **主题切换问题**     | → [主题系统规范](./DDD-DEVELOPMENT-GUIDE.md#7-主题系统开发规范) |

---

## 📝 文档贡献

### 文档更新规范

1. **更新现有文档**
   - 保持文档结构一致
   - 更新版本号和日期
   - 添加到文档历史

2. **新增文档**
   - 遵循 Markdown 规范
   - 添加到本索引文件
   - 在相关文档中添加链接

3. **文档审查**
   - 技术准确性
   - 代码示例可运行
   - 排版清晰易读

### 文档模板

```markdown
# 文档标题

> 简短描述

## 概述

...

## 详细内容

...

## 示例

...

## 参考资源

...

---

**更新历史**

- v1.0 (2025-01-09): 初始版本
```

---

## 🔗 外部资源

### 技术栈官方文档

- [Nuxt 4 官方文档](https://nuxt.com)
- [Vue 3 官方文档](https://vuejs.org)
- [TypeScript 官方文档](https://www.typescriptlang.org)
- [Tailwind CSS 官方文档](https://tailwindcss.com)
- [Pinia 官方文档](https://pinia.vuejs.org)

### DDD 学习资源

- 《领域驱动设计》- Eric Evans
- 《实现领域驱动设计》- Vaughn Vernon
- [DDD Community](https://github.com/ddd-crew)

---

## 📊 文档统计

| 类型     | 数量 |
| -------- | ---- |
| 核心规范 | 2    |
| 架构设计 | 2    |
| 功能实现 | 3    |
| 技术指南 | 6    |
| 组件文档 | 1    |
| API 文档 | 1    |

**最后更新**: 2025-01-09

---

## 💬 反馈与建议

如果您在使用文档过程中遇到问题或有改进建议：

1. 提交 Issue 到项目仓库
2. 联系技术负责人
3. 在团队会议上讨论

---

**维护者**: ECSHOPX Team  
**联系方式**: [技术团队联系方式]
