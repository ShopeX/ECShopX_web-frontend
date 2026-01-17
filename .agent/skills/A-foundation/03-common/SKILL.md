---
name: Foundation - Common Systems
description: Reusable component systems, internal i18n tools, and standard troubleshooting SOPs for hydration and debugging.
---

# 03-common: 通用系统

本技能包定义了项目中可复用的组件体系、多语言工具以及常见的排障 SOP。

## 1. 组件体系 (Component System)

- **基础库**: 基于 `@nuxt/ui` 进行样式扩展。
- **原子化组件**: 通用按钮、输入框、模态框应在 `app/components/common/` 中进行二次封装，以确保全局视觉的一致性。
- **图标系统**: 统一使用 Iconify 数据源，通过 `<UIcon>` 进行调用。

## 2. 多语言 (i18n)

- **Key 命名规范**: 使用 `.` 作为层级分隔符（如 `common.buttons.confirm`）。
- **翻译策略**:
  - 核心词汇：存储于全局 JSON。
  - 业务模块：存储于模块命名的 JSON (如 `product.json`)。
- **工具函数**: 强制使用 `useI18n` 获取 T 函数，禁止在 js 逻辑中直接写死中文字符。

## 3. 排障规范 (Troubleshooting SOP)

### Hydration 错误处理
- **现象**: 客户端渲染内容与服务器内容不匹配。
- **排查**: 检查是否在 SSR 阶段使用了 `Window` 或 `Document` 对象。
- **修复**: 使用 `<ClientOnly>` 包裹或在 `onMounted` 钩子中执行相关逻辑。

### 接口调试
- **SOP**: 
  1. 检查浏览器 Network 面板返回码。
  2. 检查 ApiFox 接口定义是否变更。
  3. 比对前端 Payload 与 接口要求的字段。
