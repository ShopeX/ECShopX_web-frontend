---
name: Delivery - Verification SOP
description: Standard operating procedure for automated functional verification and ensuring non-regression of core paths.
---

# 92-verification: 自动化验证 SOP

本技能包定义了如何通过自动化测试确保新增功能交付质量且不破坏存量业务的标准化流程。

## 1. 自动生成阶段 (Generation)

1. **意图解析**: 根据新开发的功能点，识别关键用户路径（Happy Path & Edge Cases）。
2. **脚本生成**: 编写或生成符合 `04-testing` 规范的 Playwright 测试脚本。
3. **数据准备**: 配置测试所需的 Mock 数据或测试账号。

## 2. 执行阶段 (Execution)

1. **本地运行**: 在 Headless 模式下运行 `npx playwright test`。
2. **覆盖面巡检**: 确保 UI 覆盖了多种屏幕尺寸（移动端、PC 端）以及不同的语言环境（RTL 检查）。

## 3. 分析阶段 (Analysis)

1. **结果审计**: 检查测试报告，分析失败原因（代码 Bug vs 测试脚本稳定性问题）。
2. **视觉回归**: 比对截图或录屏，确保样式未发生意外偏移。

## 4. 交付门禁 (Quality Gate)

- **绿灯准则**: 核心路径测试必须 100% 通过。
- **降级处理**: 如有已知的小缺陷但需紧急上线，必须在任务文档中明确记录并创建对应的修复 Issue。
