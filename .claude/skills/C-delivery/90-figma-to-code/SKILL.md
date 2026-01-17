# 90-figma-to-code: Figma 交付 SOP

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

1. **原子先行**: 如果页面引用了新的基础组件，先在 `app/components/ui/` 实现它（使用 `EC` 前缀，如 `ECButton`）。
2. **业务逻辑**: 将包含业务逻辑的复合组件放在 `app/components/business/`。
3. **CMS/楼层**: 如果是可配置楼层，放置在 `app/components/widgets/`。
4. **组装页面**: 在 `app/pages/` 下创建页面，使用语义化标签搭建结构。
3. **响应式适配**: 依次在 `md`, `lg` 等断点下微调样式。

## 4. 评审阶段 (Review & Polish)

- **像素还原度**: 配合浏览器截图工具与 Figma 原型进行比对。
- **动效补全**: 增加 Hover 状态、加载骨架屏等微交互。
