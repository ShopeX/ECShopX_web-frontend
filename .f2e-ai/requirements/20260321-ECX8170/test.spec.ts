import { test, expect, devices } from '@playwright/test'

const ORDER_LIST_URL = '/account/orders'

// ─── TC-01 ────────────────────────────────────────────────────────────────────
test('TC-01: 从订单列表进入订单详情页', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)
  // 点击第一笔订单的详情入口
  const firstOrderLink = page.locator('[data-testid="order-item"]').first()
  await firstOrderLink.click()
  // 路由跳转至 /account/orders/[id]
  await expect(page).toHaveURL(/\/account\/orders\/\w+/)
  // 页面正常加载，不卡在 Loading
  await expect(page.locator('[data-testid="order-detail-page"]')).toBeVisible()
})

// ─── TC-02 ────────────────────────────────────────────────────────────────────
test('TC-02: 订单基本信息区块展示', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="order-item"]').first().click()
  await page.waitForURL(/\/account\/orders\/\w+/)

  const infoBlock = page.locator('[data-testid="order-detail-info"]')
  await expect(infoBlock).toBeVisible()
  // 订单号非空
  await expect(infoBlock.locator('[data-testid="order-id"]')).not.toBeEmpty()
  // 下单时间非空
  await expect(infoBlock.locator('[data-testid="order-create-time"]')).not.toBeEmpty()
  // 订单状态文本存在
  await expect(page.locator('[data-testid="order-detail-status"]')).toBeVisible()
})

// ─── TC-03 ────────────────────────────────────────────────────────────────────
test('TC-03: 收货地址区块展示', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="order-item"]').first().click()
  await page.waitForURL(/\/account\/orders\/\w+/)

  const addressBlock = page.locator('[data-testid="order-detail-address"]')
  await expect(addressBlock).toBeVisible()
  // 收货人姓名 + 手机号
  await expect(addressBlock.locator('[data-testid="receiver-name"]')).not.toBeEmpty()
  await expect(addressBlock.locator('[data-testid="receiver-mobile"]')).not.toBeEmpty()
  // 收货地址文本
  await expect(addressBlock.locator('[data-testid="shipping-address"]')).not.toBeEmpty()
})

// ─── TC-04 ────────────────────────────────────────────────────────────────────
test('TC-04: 商品列表区块展示', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="order-item"]').first().click()
  await page.waitForURL(/\/account\/orders\/\w+/)

  const itemsBlock = page.locator('[data-testid="order-detail-items"]')
  await expect(itemsBlock).toBeVisible()

  const firstItem = itemsBlock.locator('[data-testid="order-item-row"]').first()
  await expect(firstItem).toBeVisible()
  // 商品图片
  await expect(firstItem.locator('img')).toBeVisible()
  // 商品名称
  await expect(firstItem.locator('[data-testid="item-name"]')).not.toBeEmpty()
  // 数量
  await expect(firstItem.locator('[data-testid="item-quantity"]')).not.toBeEmpty()
  // 单价
  await expect(firstItem.locator('[data-testid="item-price"]')).not.toBeEmpty()
})

// ─── TC-05 ────────────────────────────────────────────────────────────────────
test('TC-05: 金额明细区块展示', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="order-item"]').first().click()
  await page.waitForURL(/\/account\/orders\/\w+/)

  const amountBlock = page.locator('[data-testid="order-detail-amount"]')
  await expect(amountBlock).toBeVisible()
  // 实付金额
  await expect(amountBlock.locator('[data-testid="total-fee"]')).not.toBeEmpty()
})

// ─── TC-06 ────────────────────────────────────────────────────────────────────
test('TC-06: 待付款订单 — 操作按钮展示', async ({ page }) => {
  // 前置：需通过测试账号确保有 pending_payment 订单
  await page.goto(ORDER_LIST_URL)
  // 进入待付款订单（通过 status filter 或直接进入指定订单 URL）
  await page.locator('[data-testid="order-item"][data-status="pending_payment"]').first().click()
  await page.waitForURL(/\/account\/orders\/\w+/)

  const actions = page.locator('[data-testid="order-detail-actions"]')
  await expect(actions).toBeVisible()
  await expect(actions.locator('[data-testid="btn-cancel-order"]')).toBeVisible()
  await expect(actions.locator('[data-testid="btn-pay-now"]')).toBeVisible()
  // 不出现不应有的按钮
  await expect(actions.locator('[data-testid="btn-confirm-receipt"]')).toHaveCount(0)
  await expect(actions.locator('[data-testid="btn-apply-aftersales"]')).toHaveCount(0)
})

// ─── TC-07 ────────────────────────────────────────────────────────────────────
test('TC-07: 已发货订单 — 操作按钮展示', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="order-item"][data-status="shipped"]').first().click()
  await page.waitForURL(/\/account\/orders\/\w+/)

  const actions = page.locator('[data-testid="order-detail-actions"]')
  await expect(actions).toBeVisible()
  await expect(actions.locator('[data-testid="btn-confirm-receipt"]')).toBeVisible()
  await expect(actions.locator('[data-testid="btn-apply-aftersales"]')).toBeVisible()
  // 不出现不应有的按钮
  await expect(actions.locator('[data-testid="btn-cancel-order"]')).toHaveCount(0)
  await expect(actions.locator('[data-testid="btn-pay-now"]')).toHaveCount(0)
})

// ─── TC-08 ────────────────────────────────────────────────────────────────────
test('TC-08: 物流轨迹区块展示', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="order-item"][data-status="shipped"]').first().click()
  await page.waitForURL(/\/account\/orders\/\w+/)

  const logisticsBlock = page.locator('[data-testid="order-detail-logistics"]')
  await expect(logisticsBlock).toBeVisible()
  // 物流时间线至少一条
  await expect(logisticsBlock.locator('[data-testid="logistics-trace-item"]').first()).toBeVisible()
})

// ─── TC-09 ────────────────────────────────────────────────────────────────────
test('TC-09: H5 端操作按钮栏固定在底部', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 12'] })
  const page = await context.newPage()

  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="order-item"]').first().click()
  await page.waitForURL(/\/account\/orders\/\w+/)

  // 滚动到底部
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

  const actions = page.locator('[data-testid="order-detail-actions"]')
  await expect(actions).toBeVisible()

  const position = await actions.evaluate((el) => getComputedStyle(el).position)
  expect(position).toBe('fixed')

  await context.close()
})

// ─── TC-10 ────────────────────────────────────────────────────────────────────
test('TC-10: PC 端布局结构正确', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="order-item"]').first().click()
  await page.waitForURL(/\/account\/orders\/\w+/)

  // 左侧菜单存在
  await expect(page.locator('[data-testid="account-menu"]')).toBeVisible()
  // 右侧内容区存在
  await expect(page.locator('[data-testid="order-detail-page"]')).toBeVisible()
  // 操作按钮区块存在
  await expect(page.locator('[data-testid="order-detail-actions"]')).toBeVisible()
})
