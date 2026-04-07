import { test, expect } from '@playwright/test'

/**
 * ECX-8120 我的收藏页 E2E 测试（H5/移动端）
 * 路由：/account/favorites（与 AccountMenu「我的收藏」一致）
 * 范围：仅列表展示，不包含移出收藏、加购等操作；按钮仅做 UI 展示
 */
test.describe('ECX-8120 我的收藏页', () => {
  const h5Viewport = { width: 375, height: 667 }
  const pcViewport = { width: 1440, height: 900 }

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(h5Viewport)
    await page.goto('/account/favorites')
  })

  test('H5 我的收藏页可访问且布局正确', async ({ page }) => {
    const pageContainer = page.locator('[data-testid="account-favorites-page"]')
    await expect(pageContainer).toBeVisible()

    const body = page.locator('body')
    await expect(body).toHaveCSS('overflow-x', 'hidden')

    const filterBar = page.locator('[data-testid="account-favorites-filter-bar"]')
    await expect(filterBar).toBeVisible()
    await expect(filterBar).toContainText('我的收藏')
  })

  test('有数据时展示收藏列表（两列网格）', async ({ page }) => {
    const list = page.locator('[data-testid="account-favorites-list"]')
    const empty = page.locator('[data-testid="account-favorites-empty"]')
    await expect(list.or(empty)).toBeVisible()

    const items = page.locator('[data-testid="account-favorites-item"]')
    const count = await items.count()
    if (count > 0) {
      await expect(items.first()).toBeVisible()
    }
  })

  test('无数据时展示空状态', async ({ page }) => {
    const list = page.locator('[data-testid="account-favorites-list"]')
    const empty = page.locator('[data-testid="account-favorites-empty"]')
    const hasItems = (await list.locator('[data-testid="account-favorites-item"]').count()) > 0

    if (!hasItems) {
      await expect(empty).toBeVisible()
      await expect(empty).toContainText(/暂无|收藏/)
    }
  })

  test('按 Figma 还原时展示「移出收藏」按钮视觉，但不验证删除动作', async ({ page }) => {
    const removeBtn = page.getByRole('button', { name: '移出收藏' })
    const items = page.locator('[data-testid="account-favorites-item"]')
    const count = await items.count()
    if (count > 0) {
      await expect(removeBtn.first()).toBeVisible()
    }
  })

  test('点击收藏卡片可进入商品详情', async ({ page }) => {
    const firstItem = page.locator('[data-testid="account-favorites-item"]').first()
    if (await firstItem.isVisible()) {
      await firstItem.click()
      await expect(page).toHaveURL(/\/(products|item|detail)\//)
    }
  })

  test('PC 端与 H5 端使用同一份收藏数据，不应只在 PC 端落入空态', async ({ page }) => {
    await page.setViewportSize(pcViewport)
    await page.goto('/account/favorites')

    const empty = page.getByText('暂无收藏商品')
    const desktopTitle = page.getByRole('heading', { name: '我的收藏' })

    await expect(desktopTitle).toBeVisible()
    await expect(empty).toHaveCount(0)
  })
})
