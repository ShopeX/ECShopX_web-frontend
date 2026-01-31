---
name: Delivery - Maintenance SOP
description: Guidelines for long-term project maintenance, dependency updates, and safe code refactoring.
---

# 93-maintenance: 维护与重构 SOP

本技能包定义了项目长期演进过程中的日常维护、依赖升级及代码重构的标准化流程。

## 1. 依赖演进 (Dependency Upgrade)

1. **安全审计**: 定期运行 `pnpm audit`，识别具有高危漏洞的依赖。
2. **受控升级**: 
   - 核心框架（Nuxt, Tailwind）升级前需查阅官方 Migration Guide。
   - 升级后运行全量自动化验证脚本，确保无破坏性变更。

## 2. 接口同步 (API Syncing)

1. **变更检测**: 使用 ApiFox MCP 定期巡检已接入的接口定义。
2. **类型更新**: 接口字段变更时，第一时间更新 `shared/types/` 中的定义并修复编译错误。

## 3. 代码重构 (Refactoring)

1. **识别坏味道**: 识别重复代码、过长的 Composable 或组件逻辑。
2. **安全重构**: 
   - 确保重构前已有完善的单元测试覆盖。
   - 采用“小步快跑”策略，每步重构后运行验证。

## 4. 性能巡检

- **定期审计**: 每月进行一次 Lighthouse 全站审计。
- **优化决策**: 根据审计结果调整 `infra/performance` 中的优化策略。
