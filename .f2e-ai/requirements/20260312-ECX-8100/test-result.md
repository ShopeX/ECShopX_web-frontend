# 20260312-ECX-8100 E2E 测试结果

## 执行时间

- **执行时间**：约 6.7s（含启动与 2 个项目 chromium + Mobile Chrome）
- **执行命令**：`npx playwright test .f2e-ai/requirements/20260312-ECX-8100/test.spec.ts --reporter=list`

## 结果汇总

| 项目 | 数量 |
|------|------|
| 总用例数 | 6 |
| 通过 | 6 |
| 失败 | 0 |
| 跳过 | 0 |

## 用例明细

| 项目 | 用例名称 | 结果 | 耗时 |
|------|----------|------|------|
| chromium | 首页积分渲染与分页集成 | ✓ 通过 | 815ms |
| chromium | 首页列表分页切换 | ✓ 通过 | 1.1s |
| chromium | 清理验证: 详情页不可访问 | ✓ 通过 | 635ms |
| Mobile Chrome | 首页积分渲染与分页集成 | ✓ 通过 | 475ms |
| Mobile Chrome | 首页列表分页切换 | ✓ 通过 | 418ms |
| Mobile Chrome | 清理验证: 详情页不可访问 | ✓ 通过 | 582ms |

## 失败原因摘要

- 无失败用例。

## 报告与重跑

- **HTML 报告**：执行 `npx playwright show-report` 可查看本次或最近一次运行的 HTML 报告（若未指定 `--reporter=list` 会生成报告）。
- **重跑命令**：
  ```bash
  npx playwright test .f2e-ai/requirements/20260312-ECX-8100/test.spec.ts
  ```
