# E2E 测试结果（20260309-ECX-8078）

## 执行时间

- **执行时间**：2026-03-05
- **总耗时**：30.4s
- **状态**：已执行，1 通过 / 19 失败

## 总览

| 项目     | 数值                                                        |
| -------- | ----------------------------------------------------------- |
| 总用例数 | 10（不重复）× 2 项目（chromium + Mobile Chrome）= 20 次运行 |
| 通过数   | 1                                                           |
| 失败数   | 19                                                          |
| 跳过数   | 0                                                           |

## 用例明细

| #   | 用例名称                                            | chromium | Mobile Chrome |
| --- | --------------------------------------------------- | -------- | ------------- |
| 1   | 从结算页提交订单成功后应跳转至支付页且 URL 带订单号 | 失败     | 失败          |
| 2   | 支付页应展示页面容器与订单/支付相关信息区域         | 失败     | 失败          |
| 3   | 从订单列表「去支付」应跳转至支付页并带订单号        | 失败     | 失败          |
| 4   | 从订单详情「去支付」应跳转至支付页并带订单号        | 失败     | 失败          |
| 5   | 支付页应展示支付方式列表且用户可选择                | 失败     | 失败          |
| 6   | 选择支付方式并点击「去支付」后应展示支付码区域      | 失败     | 失败          |
| 7   | 支付成功后应展示成功态或发生跳转                    | 失败     | 失败          |
| 8   | 支付超时或失败时应展示提示且支持重试或返回          | 失败     | 失败          |
| 9   | PC 视口下支付页正常展示且关键区域可见               | 失败     | **通过**      |
| 10  | 移动端 H5 视口下支付页正常展示且可操作              | 失败     | 失败          |

## 失败原因摘要

1. **chromium 项目（10 条均失败）**
   - **原因**：缺少 Chromium Headless Shell。报错：`Executable doesn't exist at .../chromium_headless_shell-1200/.../chrome-headless-shell`
   - **说明**：当前仅安装了 Chromium 完整版，未安装 `chromium_headless_shell`。chromium 项目默认使用 headless shell，需再次执行 `pnpm exec playwright install` 确保完整安装（或使用 `playwright install chromium` 安装包含 headless shell 的 Chromium）。

2. **Mobile Chrome 项目（9 条失败）**
   - 前 8 条：同样因上述浏览器/headless shell 未就绪导致无法启动或中途失败。
   - 第 10 条「移动端 H5 视口下支付页正常展示且可操作」：**strict mode violation**。
     - 选择器 `getByTestId('payment-pay-now').or(getByRole('button', { name: /去支付/ }))` 匹配到 **2 个元素**（PC 栏与 H5 吸底栏各一个「去支付」按钮），Playwright 要求单元素时失败。
     - **建议**：用例中对该 locator 加 `.first()`，或改为仅匹配当前视口下可见的一个（例如 H5 下用 `page.getByTestId('payment-pay-now').locator('..').filter({ has: page.locator('.lg\\:hidden') }).first()` 或仅用 `getByRole('button', { name: '去支付' }).first()`）。

## 建议

1. **环境**：在项目根目录执行 `pnpm exec playwright install`（或 `pnpm exec playwright install chromium`），确保 Chromium 与 Chromium Headless Shell 均安装完成后再重跑。
2. **用例**：修改 `.f2e-ai/requirements/20260309-ECX-8078/test.spec.ts` 中「移动端 H5 视口下支付页正常展示且可操作」对「去支付」按钮的断言，使用 `.first()` 或更精确的 locator，避免匹配到两个按钮。

## 重跑命令

```bash
pnpm exec playwright test .f2e-ai/requirements/20260309-ECX-8078/test.spec.ts
```

## 截图或报告路径

- 失败用例的 trace：`test-results/` 下对应子目录（如 `.f2e-ai-requirements-20260-*-trace.zip`）。
- 查看 trace：`pnpm exec playwright show-trace <path-to-trace.zip>`
- HTML 报告：`pnpm exec playwright show-report`
