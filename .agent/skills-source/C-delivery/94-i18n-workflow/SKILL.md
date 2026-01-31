---
name: Delivery - i18n Workflow SOP
description: End-to-end workflow for delivering multi-language content alongside business features.
---

# 94-i18n-workflow: 多语言流水线 SOP

本技能包定义了新功能开发过程中如何高效、完备地实现多语言同步交付的流程。

## 1. 提取阶段 (Extraction)

1. **静态扫描**: 识别 UI 组件及页面中所有硬编码的内容。
2. **Key 生成**: 根据 `03-common` 的规范生成语义化的多语言 Key。

## 2. 翻译与集成 (Translation)

1. **AI 辅助翻译**: 
   - 提取新 Key 并引导 AI 助手根据上下文提供多语言翻译建议（特别注意 `zh`, `en`, `ar` 的语境）。
   - 阿拉伯语需包含 RTL 适配的特殊术语翻译。
2. **JSON 同步**: 将翻译结果写入对应的 `locales/*.json` 文件。

## 3. 校验阶段 (Validation)

1. **缺失项检查**: 验证是否所有支持的语言均已包含新 Key。
2. **长文本溢出检查**: 在多语言预览模式下，观察 UI 是否因为不同语言的文本长度差异导致布局错位。
3. **RTL 渲染验证**: 重点验证阿拉伯语模式下的组件方向和图标镜像。

## 4. 交付

- 确保多语言交付物与业务代码在同一个 Commit/PR 中提交，实现“功能上齐，语言跟上”。
