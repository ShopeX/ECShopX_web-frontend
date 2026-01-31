---
name: Design & Coding Standards
description: 设计与编码规范。包含 Tailwind 4 UI/UX 标准、TypeScript/Vue 编码规范、安全规范、可访问性（A11y）要求。当涉及样式规范、代码风格、安全要求、可访问性时触发。
---

# 01-spec: 设计与编码标准

本技能包定义了项目在 UI 实现、代码逻辑、安全性以及可访问性方面的核心标准。

## 1. UI/UX 规范 (Tailwind CSS 4)

### Design Tokens

- **颜色**: 使用 CSS 变量映射 Tailwind 主题（如 `--primary`, `--secondary`）。
- **间距**: 遵循 Tailwind 默认阶梯（4, 8, 16, 24, 32...）。
- **排版**: 使用通用字体栈，通过 `text-sm`, `text-lg`, `font-bold` 等类定义优先级。

### 响应式断点标准

- `sm`: 640px (Mobile Narrow)
- `md`: 768px (Tablet)
- `lg`: 1024px (Desktop Small)
- `xl`: 1280px (Desktop Wide)

## 2. 编码标准 (TypeScript & Vue)

- **Script Setup**: 统一使用 `<script setup lang="ts">`。
- **严格类型**: 禁止使用 `any`，必须定义接口或类型（存放于 `shared/types/`）。
- **命名规范**:
  - 组件：PascalCase (如 `CartDrawer.vue`)。
  - 函数/变量：camelCase。
  - 常量：UPPER_SNAKE_CASE。

## 3. 安全规范 (Security)

- **输入审计**: 严禁在模板中直接使用 `v-html` 渲染用户数据，防止 XSS。
- **攻击防护**: 请求层自动带上 CSRF Token。
- **敏感信息 (PII)**: 手机号、邮箱等敏感数据在前端应有掩码处理逻辑，前端存储禁止保留未加密的 Token。

## 4. 可访问性规范 (Accessibility/A11y)

- **WCAG 2.1**: 确保对比度符合标准。
- **ARIA 属性**: 交互组件必须具备补全的 ARIA 标签（如 `aria-label`, `aria-expanded`）。
- **键盘支持**: 交互元素必须支持 `Tab` 键轮询和 `Enter` 键激活。
- **语义化**: 绝对禁止滥用 `div` 代替 `button` 或 `a` 标签。
