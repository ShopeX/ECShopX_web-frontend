import { test, expect } from '@playwright/test'

/**
 * ECX-8102 优惠券列表页面 E2E 测试（H5）
 * 需求：仅 H5/移动端，可用+不可用 Tab，列表来自 GET /wxapp/user/getUserCardList
 */
const H5_VIEWPORT = { width: 375, height: 667 }

test.describe('ECX-8102 优惠券列表页 H5', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(H5_VIEWPORT)
    await page.goto('/account/coupons')
    await page.waitForTimeout(1000)
  })

  test('优惠券列表页 H5 可访问与基础渲染', async ({ page }) => {
    await expect(page.locator('[data-testid="coupons-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="coupons-page"]').getByText('优惠券').first()).toBeVisible()
    await expect(page.locator('[data-testid="coupons-tab-available"]')).toBeVisible()
    await expect(page.locator('[data-testid="coupons-tab-unavailable"]')).toBeVisible()
    const listOrEmpty = page.locator('[data-testid="coupons-list"], [data-testid="coupons-empty"]')
    await expect(listOrEmpty.first()).toBeVisible()
  })

  test('可用/不可用 Tab 切换', async ({ page }) => {
    const tabAvailable = page.locator('[data-testid="coupons-tab-available"]')
    const tabUnavailable = page.locator('[data-testid="coupons-tab-unavailable"]')

    await tabUnavailable.click()
    await expect(tabUnavailable).toHaveAttribute('aria-selected', 'true')
    await expect(tabAvailable).toHaveAttribute('aria-selected', 'false')

    await tabAvailable.click()
    await expect(tabAvailable).toHaveAttribute('aria-selected', 'true')
    await expect(tabUnavailable).toHaveAttribute('aria-selected', 'false')
  })

  test('列表数据展示 - 卡片信息完整', async ({ page }) => {
    const cards = page.locator('[data-testid="coupon-card"]')
    const count = await cards.count()
    if (count > 0) {
      const first = cards.first()
      await expect(first.getByText(/¥|满.*减|满.*可用|有效期/)).toBeVisible()
    }
  })

  test('空状态展示', async ({ page }) => {
    await page.locator('[data-testid="coupons-list"], [data-testid="coupons-empty"]').first().waitFor()
    const list = page.locator('[data-testid="coupons-list"]')
    const empty = page.locator('[data-testid="coupons-empty"]')
    const hasList = (await list.count()) > 0 && (await list.locator('[data-testid="coupon-card"]').count()) > 0
    const hasEmpty = (await empty.count()) > 0
    expect(hasList || hasEmpty).toBe(true)
    if (hasEmpty) {
      await expect(empty).toContainText(/暂无|没有|无优惠券/i)
    }
  })

  test('H5 布局 - Tab 选中态与卡片左右结构', async ({ page }) => {
    const tabActive = page.locator('[data-testid="coupons-tab-available"]')
    await expect(tabActive).toBeVisible()
    const card = page.locator('[data-testid="coupon-card"]').first()
    if (await card.isVisible()) {
      await expect(card.locator('text=/¥|满.*可用/')).toBeVisible()
      await expect(card.locator('text=/满.*减|全场|有效期/')).toBeVisible()
    }
  })
})
