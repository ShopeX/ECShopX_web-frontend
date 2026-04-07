import { test, expect, devices } from '@playwright/test'

const ORDER_LIST_URL = '/account/orders'
const ORDER_DETAIL_URL_PATTERN = /\/account\/orders\/\w+/

// ─── TC-01 ────────────────────────────────────────────────────────────────────
test('TC-01: 订单列表页打开物流详情', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)

  // 前置：测试账号至少有一笔展示“查看物流”的订单
  const logisticsTrigger = page.locator('[data-testid="btn-view-logistics"]').first()
  await logisticsTrigger.click()

  const logisticsPanel = page.locator('[data-testid="order-logistics-panel"]')
  await expect(logisticsPanel).toBeVisible()
  await expect(logisticsPanel.locator('[data-testid="order-logistics-title"]')).toHaveText(
    '物流详情'
  )
})

// ─── TC-02 ────────────────────────────────────────────────────────────────────
test('TC-02: 订单详情页打开物流详情', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="order-item"]').first().click()
  await page.waitForURL(ORDER_DETAIL_URL_PATTERN)

  await page.locator('[data-testid="btn-view-logistics"]').click()

  const logisticsPanel = page.locator('[data-testid="order-logistics-panel"]')
  await expect(logisticsPanel).toBeVisible()
  await expect(logisticsPanel.locator('[data-testid="order-logistics-tracking-no"]')).not.toBeEmpty()
  await expect(logisticsPanel.locator('[data-testid="order-logistics-company"]')).not.toBeEmpty()
})

// ─── TC-03 ────────────────────────────────────────────────────────────────────
test('TC-03: 物流详情展示接口返回的轨迹数据', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="btn-view-logistics"]').first().click()

  const logisticsPanel = page.locator('[data-testid="order-logistics-panel"]')
  await expect(logisticsPanel).toBeVisible()
  await expect(logisticsPanel.locator('[data-testid="order-logistics-trace-item"]').first()).toBeVisible()
  await expect(
    logisticsPanel.locator('[data-testid="order-logistics-trace-time"]').first()
  ).not.toBeEmpty()
  await expect(
    logisticsPanel.locator('[data-testid="order-logistics-trace-content"]').first()
  ).not.toBeEmpty()
})

// ─── TC-04 ────────────────────────────────────────────────────────────────────
test('TC-04: 物流详情关闭交互', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="btn-view-logistics"]').first().click()

  const logisticsPanel = page.locator('[data-testid="order-logistics-panel"]')
  await expect(logisticsPanel).toBeVisible()

  await logisticsPanel.locator('[data-testid="order-logistics-close-icon"]').click()
  await expect(logisticsPanel).toHaveCount(0)

  await page.locator('[data-testid="btn-view-logistics"]').first().click()
  await expect(logisticsPanel).toBeVisible()

  await logisticsPanel.locator('[data-testid="order-logistics-close-button"]').click()
  await expect(logisticsPanel).toHaveCount(0)
})

// ─── TC-05 ────────────────────────────────────────────────────────────────────
test('TC-05: PC 端样式形态正确', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="btn-view-logistics"]').first().click()

  const logisticsPanel = page.locator('[data-testid="order-logistics-panel"]')
  const drawer = page.locator('[data-testid="order-logistics-desktop-drawer"]')
  const overlay = page.locator('[data-testid="order-logistics-overlay"]')
  await expect(logisticsPanel).toBeVisible()
  await expect(drawer).toBeVisible()
  await expect(overlay).toBeVisible()
})

// ─── TC-06 ────────────────────────────────────────────────────────────────────
test('TC-06: H5 端样式形态正确', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 12'] })
  const page = await context.newPage()

  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="btn-view-logistics"]').first().click()

  const logisticsPanel = page.locator('[data-testid="order-logistics-panel"]')
  const sheet = page.locator('[data-testid="order-logistics-mobile-sheet"]')
  await expect(logisticsPanel).toBeVisible()
  await expect(sheet).toBeVisible()
  await expect(sheet.locator('[data-testid="order-logistics-close-button"]')).toBeVisible()

  await context.close()
})

// ─── TC-07 ────────────────────────────────────────────────────────────────────
test('TC-07: 空物流轨迹兜底展示', async ({ page }) => {
  // 前置：准备一笔接口返回空轨迹的订单，或在测试环境中 mock 空 data
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="btn-view-logistics-empty"]').first().click()

  const logisticsPanel = page.locator('[data-testid="order-logistics-panel"]')
  await expect(logisticsPanel).toBeVisible()
  await expect(logisticsPanel.locator('[data-testid="order-logistics-empty"]')).toBeVisible()
})

// ─── TC-08 ────────────────────────────────────────────────────────────────────
test('TC-08: 接口失败兜底展示', async ({ page }) => {
  // 前置：测试环境或 mock 让 trackerpull 返回失败
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="btn-view-logistics-error"]').first().click()

  const logisticsPanel = page.locator('[data-testid="order-logistics-panel"]')
  await expect(logisticsPanel).toBeVisible()
  await expect(logisticsPanel.locator('[data-testid="order-logistics-error"]')).toBeVisible()
  await logisticsPanel.locator('[data-testid="order-logistics-close-button"]').click()
  await expect(logisticsPanel).toHaveCount(0)
})

// ─── TC-09 ────────────────────────────────────────────────────────────────────
test('TC-09: 多入口复用一致性', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="btn-view-logistics"]').first().click()

  const listTrackingNo = await page
    .locator('[data-testid="order-logistics-tracking-no"]')
    .textContent()

  await page.locator('[data-testid="order-logistics-close-button"]').click()

  await page.locator('[data-testid="order-item"]').first().click()
  await page.waitForURL(ORDER_DETAIL_URL_PATTERN)
  await page.locator('[data-testid="btn-view-logistics"]').click()

  const detailTrackingNo = await page
    .locator('[data-testid="order-logistics-tracking-no"]')
    .textContent()

  expect(detailTrackingNo).toBe(listTrackingNo)
})

// ─── TC-10 ────────────────────────────────────────────────────────────────────
test('TC-10: 快递单号复制交互', async ({ page }) => {
  await page.goto(ORDER_LIST_URL)
  await page.locator('[data-testid="btn-view-logistics"]').first().click()

  await page.locator('[data-testid="order-logistics-copy"]').click()

  const clipboardText = await page.evaluate(async () => navigator.clipboard.readText())
  await expect(page.locator('[data-testid="order-logistics-tracking-no"]')).toHaveText(
    clipboardText
  )
})
