---
name: Figma to Code
description: Figma 设计稿转代码的标准流程。包含设计分析、样式提取、组件拆分、页面组装、响应式适配。当涉及 Figma、设计稿、UI 转码、组件生成、样式提取时触发。
---

# 10-figma-to-code: Figma 设计转码

本技能包定义了如何通过 Figma MCP 将设计稿标准化、高质量地转化为前端代码的流程。

## 1. 准备阶段 (Analysis)

1. **获取链接**: 接收用户提供的 Figma 文件及节点 ID。
2. **环境检查**: 确保 Figma MCP 已配置。
3. **视觉分析**: 识别页面的组件层次（原子组件 vs 业务组件）。

## 2. 提取阶段 (Extraction)

1. **获取 Tokens**: 调用 `get_nodes` 获取背景色、边距、阴影、圆角等具体数值。
2. **样式映射**: 将数值映射到 Tailwind 4 变量或项目定义的 Design Tokens 中。
3. **资源导出**: 如有图标或背景图，使用 `get_file` 获取资源并引导用户保存至 `app/assets/images/`。

## 3. 实现阶段 (Implementation)

### 组件分类规则

| 前缀 | 类型     | 目录              | 示例                          |
| ---- | -------- | ----------------- | ----------------------------- |
| `EC` | 原子组件 | `app/components/` | `ECButton`, `ECInput`         |
| `BC` | 业务组件 | `app/components/` | `BCProductCard`, `BCCartItem` |
| `WC` | CMS/挂件 | `app/components/` | `WCHeroBanner`, `WCPromotion` |

### 实现顺序

1. **原子先行**: 如果页面引用了新的基础组件，先实现它（使用 `EC` 前缀）。
2. **业务组合**: 将包含业务逻辑的复合组件实现（使用 `BC` 前缀）。
3. **CMS/楼层**: 如果是可配置楼层，实现为挂件（使用 `WC` 前缀）。
4. **组装页面**: 在 `app/pages/` 下创建页面，使用语义化标签搭建结构。
5. **响应式适配**: 依次在 `sm`, `md`, `lg`, `xl` 断点下微调样式。

## 4. 产出清单

```markdown
## 页面骨架

- Header
- Main Content
  - Section A
  - Section B
- Footer

## 组件拆分

| 组件名        | 类型     | 复用/新建 | 说明     |
| ------------- | -------- | --------- | -------- |
| BCProductCard | 业务组件 | 复用      | 商品卡片 |
| ECButton      | 基础组件 | 复用      | 按钮     |

## 状态枚举

- loading: 加载中骨架屏
- empty: 空状态占位
- error: 错误提示
- success: 正常展示

## 响应式断点

- sm (640px): [适配说明]
- md (768px): [适配说明]
- lg (1024px): [适配说明]

## RTL 注意点

- [需要镜像的元素]
- [方向性图标处理]
```

## 5. 评审阶段 (Review & Polish)

- **像素还原度**: 配合浏览器截图工具与 Figma 原型进行比对。
- **动效补全**: 增加 Hover 状态、加载骨架屏等微交互。
- **状态覆盖**: 确保 loading/empty/error/disabled 状态都有处理。
