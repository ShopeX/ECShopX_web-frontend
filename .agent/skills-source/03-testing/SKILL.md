---
name: Testing & Quality Gate
description: 自动化测试基础设施与质量门禁。包含 Playwright E2E、Vitest 单测、选择器规范、POM 模式、测试用例生成、门禁执行与结果分析。当涉及测试、E2E、单测、Playwright、Vitest、质量门禁、回归验证时触发。
---

# 03-testing: 自动化测试与质量门禁

本技能包定义了项目中自动化测试的技术栈、规范、验证流程及质量门禁。

## 1. 测试框架配置

### E2E 测试（Playwright）

- **配置文件**：`playwright.config.ts`
- **用例目录**：`tests/e2e/`
- **报告目录**：`playwright-report/`

### 单元测试（Vitest）

- **用例目录**：`tests/unit/`
- **覆盖对象**：Transformer、Composable 纯逻辑、Utils

### 运行命令

```bash
# E2E 测试
pnpm test:e2e              # 运行所有 E2E
pnpm test:e2e --headed     # 有界面运行
pnpm test:e2e --ui         # UI 模式调试

# 单元测试
pnpm test                  # 运行所有单测
pnpm test:coverage         # 带覆盖率
```

---

## 2. 选择器规范（data-testid）

为保证测试脚本稳定性，**禁止**使用动态 CSS 类或复杂 DOM 结构作为选择器。

### 强制使用

```html
<button data-testid="cart-add-btn">加入购物车</button>
<div data-testid="product-card">...</div>
```

### 命名格式

```
data-testid="<module>-<element>-<action>"
```

### 示例

| data-testid            | 说明             |
| ---------------------- | ---------------- |
| `cart-item-delete-btn` | 购物车项删除按钮 |
| `product-card`         | 商品卡片         |
| `filter-sort-button`   | 筛选排序按钮     |
| `collections-loading`  | 列表加载状态     |
| `checkout-submit-btn`  | 结算提交按钮     |

---

## 3. 测试用例命名规范

### 套件描述（中文）

```typescript
describe('首页 E2E 测试', () => { ... })
describe('商品列表页 E2E 测试', () => { ... })
describe('购物车功能测试', () => { ... })
```

### 用例描述（中文，"应该..."格式）

```typescript
// ✅ 正确
test('应该显示商品网格和商品卡片', async () => { ... })
test('点击商品卡片应该导航到商品详情页', async () => { ... })
test('添加商品后购物车数量应该更新', async () => { ... })

// ❌ 错误
test('should display product grid', async () => { ... })
```

---

## 4. 页面对象模型（POM）

### 封装原则

每个复杂页面对应一个 POM 类，方法名描述业务意图。

### 示例结构

```typescript
// tests/e2e/pages/CheckoutPage.ts
export class CheckoutPage {
  constructor(private page: Page) {}

  async fillAddress(address: AddressData) {
    await this.page.getByTestId('address-name').fill(address.name)
    await this.page.getByTestId('address-phone').fill(address.phone)
    // ...
  }

  async selectPaymentMethod(method: string) {
    await this.page.getByTestId(`payment-${method}`).click()
  }

  async submitOrder() {
    await this.page.getByTestId('checkout-submit-btn').click()
  }

  async expectOrderSuccess() {
    await expect(this.page.getByTestId('order-success')).toBeVisible()
  }
}
```

### 使用方式

```typescript
test('完成订单提交流程', async ({ page }) => {
  const checkout = new CheckoutPage(page)
  await checkout.fillAddress(mockAddress)
  await checkout.selectPaymentMethod('wechat')
  await checkout.submitOrder()
  await checkout.expectOrderSuccess()
})
```

---

## 5. 核心链路测试（必测）

### 链路 A：加购 → 购物车 → 结算

```typescript
test('加购结算完整流程', async ({ page }) => {
  // 1. 访问商品详情
  await page.goto('/item/123')

  // 2. 选择规格并加购
  await page.getByTestId('sku-color-red').click()
  await page.getByTestId('cart-add-btn').click()

  // 3. 进入购物车
  await page.getByTestId('header-cart-icon').click()
  await expect(page.getByTestId('cart-item')).toHaveCount(1)

  // 4. 结算
  await page.getByTestId('cart-checkout-btn').click()
  await expect(page).toHaveURL(/\/checkout/)
})
```

### 链路 B：登录 → 会员中心 → 订单

```typescript
test('登录并查看订单', async ({ page }) => {
  // 1. 登录
  await page.goto('/login')
  await page.getByTestId('login-phone').fill('13800138000')
  await page.getByTestId('login-submit').click()

  // 2. 进入会员中心
  await page.getByTestId('header-user-icon').click()
  await expect(page).toHaveURL(/\/account/)

  // 3. 查看订单
  await page.getByTestId('account-orders-link').click()
  await expect(page.getByTestId('order-item')).toBeVisible()
})
```

---

## 6. 质量门禁（Quality Gate）

### 本地门禁（提交前必跑）

```bash
# 代码质量
pnpm lint
pnpm format --check
vue-tsc --noEmit

# 核心链路 E2E
pnpm test:e2e tests/e2e/cart.spec.ts tests/e2e/auth.spec.ts
```

### CI 门禁（合并前必过）

```yaml
# .gitlab-ci.yml 示例
test:
  script:
    - pnpm lint
    - vue-tsc --noEmit
    - pnpm test:e2e
  artifacts:
    paths:
      - playwright-report/
```

### 通过标准

| 检查项       | 要求         |
| ------------ | ------------ |
| ESLint       | 0 errors     |
| TypeCheck    | 0 errors     |
| E2E 核心链路 | 100% pass    |
| i18n/RTL     | 关键页无崩溃 |

---

## 7. 测试生成流程（从 AC 到用例）

### Step 1: 提取测试点

从 PRD 的验收标准（AC）提取：

- Happy Path：正向核心流程
- Edge Cases：边界/异常场景

### Step 2: 生成测试骨架

```typescript
describe('商品加购功能', () => {
  // Happy Path
  test('应该能成功加入购物车', async () => {
    // TODO: 实现
  })

  // Edge Cases
  test('库存不足时应该禁用加购按钮', async () => {
    // TODO: 实现
  })

  test('未登录时应该跳转到登录页', async () => {
    // TODO: 实现
  })
})
```

### Step 3: 填充实现

按照 POM + data-testid 规范实现具体逻辑。

---

## 8. 结果分析与处理

### 失败分类

| 类型           | 处理方式             |
| -------------- | -------------------- |
| 代码 Bug       | 修复代码后重跑       |
| 测试脚本不稳定 | 检查等待策略、选择器 |
| 环境问题       | 检查 Mock 数据、网络 |

### 截图与录屏

Playwright 自动保存失败截图到 `test-results/`，可用于视觉回归对比。

### 降级处理

如有已知小缺陷但需紧急上线：

1. 在 PR 中明确记录
2. 创建对应的修复 Issue
3. 核心链路测试仍必须通过

---

## 9. 最佳实践

### ✅ 推荐

- 使用 Playwright 的自动等待机制
- 每个测试用例独立运行，不依赖其他测试状态
- 使用 `beforeEach` 确保测试起始状态一致
- 断言清晰，验证预期行为

### ❌ 避免

- 硬编码 `waitForTimeout`
- 使用动态 CSS 类作为选择器
- 测试用例之间有依赖关系
- 在测试中写复杂业务逻辑
