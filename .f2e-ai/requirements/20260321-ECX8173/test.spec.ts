import { test, expect, devices } from '@playwright/test'

const CHECKOUT_URL = '/checkout'
const ORDER_LIST_URL = '/account/orders'
const ORDER_DETAIL_URL_PATTERN = /\/account\/orders\/\w+/

// ─── TC-01 ────────────────────────────────────────────────────────────────────
test('TC-01: 结算页可打开并提交个人发票', async ({ page }) => {
  // 前置：测试账号已登录，购物车中存在可结算商品，发票接口可正常返回成功
  await page.goto(CHECKOUT_URL)

  await page.locator('[data-testid="checkout-open-invoice"]').click()

  const invoiceDialog = page.locator('[data-testid="invoice-dialog"]')
  await expect(invoiceDialog).toBeVisible()

  await page.locator('[data-testid="invoice-type-personal"]').click()
  await page.locator('[data-testid="invoice-title-input"]').fill('张三')
  await page.locator('[data-testid="invoice-submit"]').click()

  await expect(page.locator('[data-testid="checkout-invoice-summary"]')).toContainText('张三')
})

// ─── TC-02 ────────────────────────────────────────────────────────────────────
test('TC-02: 结算页可切换并提交企业发票', async ({ page }) => {
  // 前置：测试账号已登录，购物车中存在可结算商品，发票接口可正常返回成功
  await page.goto(CHECKOUT_URL)

  await page.locator('[data-testid="checkout-open-invoice"]').click()
  await page.locator('[data-testid="invoice-type-company"]').click()

  await page.locator('[data-testid="invoice-company-name-input"]').fill('上海示例科技有限公司')
  await page.locator('[data-testid="invoice-tax-number-input"]').fill('91310000MA1K123456')
  await page.locator('[data-testid="invoice-company-address-input"]').fill('上海市浦东新区测试路 88 号')
  await page.locator('[data-testid="invoice-bank-input"]').fill('中国银行上海分行')
  await page.locator('[data-testid="invoice-bank-account-input"]').fill('6217000000000000000')
  await page.locator('[data-testid="invoice-submit"]').click()

  await expect(page.locator('[data-testid="checkout-invoice-summary"]')).toContainText(
    '上海示例科技有限公司'
  )
})

// ─── TC-03 ────────────────────────────────────────────────────────────────────
test('TC-03: 发票类型切换时字段与校验同步切换', async ({ page }) => {
  // 前置：测试账号已登录，可进入结算页
  await page.goto(CHECKOUT_URL)
  await page.locator('[data-testid="checkout-open-invoice"]').click()

  await page.locator('[data-testid="invoice-type-personal"]').click()
  await page.locator('[data-testid="invoice-submit"]').click()
  await expect(page.locator('[data-testid="invoice-title-error"]')).toBeVisible()
  await expect(page.locator('[data-testid="invoice-tax-number-input"]')).toHaveCount(0)

  await page.locator('[data-testid="invoice-type-company"]').click()
  await page.locator('[data-testid="invoice-submit"]').click()
  await expect(page.locator('[data-testid="invoice-company-name-error"]')).toBeVisible()
  await expect(page.locator('[data-testid="invoice-tax-number-error"]')).toBeVisible()
})

// ─── TC-04 ────────────────────────────────────────────────────────────────────
test('TC-04: 订单详情页可复用同一套发票组件提交流程', async ({ page }) => {
  // 前置：测试账号已登录，存在一笔可开票订单
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="order-item"]').first().click()
  await page.waitForURL(ORDER_DETAIL_URL_PATTERN)

  await page.locator('[data-testid="btn-apply-invoice"]').click()

  const invoiceDialog = page.locator('[data-testid="invoice-dialog"]')
  await expect(invoiceDialog).toBeVisible()

  await page.locator('[data-testid="invoice-type-personal"]').click()
  await page.locator('[data-testid="invoice-title-input"]').fill('李四')
  await page.locator('[data-testid="invoice-submit"]').click()

  await expect(page.locator('[data-testid="order-detail-invoice-summary"]')).toContainText('李四')
})

// ─── TC-05 ────────────────────────────────────────────────────────────────────
test('TC-05: PC 与 H5 双端样式符合设计稿形态', async ({ browser, page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(CHECKOUT_URL)
  await page.locator('[data-testid="checkout-open-invoice"]').click()

  await expect(page.locator('[data-testid="invoice-dialog"]')).toBeVisible()
  await expect(page.locator('[data-testid="invoice-desktop-modal"]')).toBeVisible()

  const mobileContext = await browser.newContext({ ...devices['iPhone 12'] })
  const mobilePage = await mobileContext.newPage()

  await mobilePage.goto(CHECKOUT_URL)
  await mobilePage.locator('[data-testid="checkout-open-invoice"]').click()

  await expect(mobilePage.locator('[data-testid="invoice-dialog"]')).toBeVisible()
  await expect(mobilePage.locator('[data-testid="invoice-mobile-sheet"]')).toBeVisible()

  await mobileContext.close()
})

// ─── TC-06 ────────────────────────────────────────────────────────────────────
test('TC-06: 取消与关闭不会污染页面中的发票结果', async ({ page }) => {
  // 前置：测试账号已登录，可进入结算页
  await page.goto(CHECKOUT_URL)
  await page.locator('[data-testid="checkout-open-invoice"]').click()

  await page.locator('[data-testid="invoice-title-input"]').fill('临时抬头')
  await page.locator('[data-testid="invoice-cancel"]').click()

  await expect(page.locator('[data-testid="invoice-dialog"]')).toHaveCount(0)
  await expect(page.locator('[data-testid="checkout-invoice-summary"]')).toHaveCount(0)
})

// ─── TC-07 ────────────────────────────────────────────────────────────────────
test('TC-07: 接口失败时保留弹层并展示错误反馈', async ({ page }) => {
  // 前置：通过 mock 或测试环境让 POST /wxapp/member/invoice 返回失败
  await page.goto(CHECKOUT_URL)
  await page.locator('[data-testid="checkout-open-invoice"]').click()

  await page.locator('[data-testid="invoice-type-personal"]').click()
  await page.locator('[data-testid="invoice-title-input"]').fill('失败用例抬头')
  await page.locator('[data-testid="invoice-submit"]').click()

  await expect(page.locator('[data-testid="invoice-dialog"]')).toBeVisible()
  await expect(page.locator('[data-testid="invoice-submit-error"]')).toBeVisible()
})
