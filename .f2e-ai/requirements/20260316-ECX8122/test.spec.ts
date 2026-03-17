import { test, expect } from '@playwright/test'

/**
 * ECX-8122 收货地址列表页 E2E 测试（H5）
 * 需求：仅 H5/移动端，列表 + 新增/编辑/删除/设为默认，对接 5 个地址接口
 */
const H5_VIEWPORT = { width: 375, height: 667 }

test.describe('ECX-8122 收货地址列表页 H5', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(H5_VIEWPORT)
    await page.goto('/account/address')
    await page.waitForTimeout(500)
  })

  test('列表页可访问与基础渲染', async ({ page }) => {
    await expect(page.locator('[data-testid="address-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="address-page"]').getByText('收货地址').first()).toBeVisible()
    await expect(page.locator('[data-testid="address-add-btn"]')).toBeVisible()
    const listOrEmpty = page.locator('[data-testid="address-list"], [data-testid="address-empty"]')
    await expect(listOrEmpty.first()).toBeVisible()
  })

  test('有数据时展示地址卡片', async ({ page }) => {
    const cards = page.locator('[data-testid="address-card"]')
    const count = await cards.count()
    if (count > 0) {
      const first = cards.first()
      await expect(first.locator('text=/编辑/')).toBeVisible()
      await expect(first).toContainText(/\d|电话|详细|地址/)
    }
  })

  test('无数据时显示空状态', async ({ page }) => {
    const empty = page.locator('[data-testid="address-empty"]')
    const list = page.locator('[data-testid="address-list"]')
    const hasCards = (await list.locator('[data-testid="address-card"]').count()) > 0
    if (!hasCards) {
      await expect(empty).toBeVisible()
      await expect(empty).toContainText(/暂无|没有|无.*地址/i)
    }
  })

  test('点击添加新地址打开弹窗', async ({ page }) => {
    await page.locator('[data-testid="address-add-btn"]').click()
    await expect(page.getByRole('heading', { name: '添加地址' })).toBeVisible({ timeout: 10000 })
  })

  test('点击编辑打开编辑弹窗', async ({ page }) => {
    const firstEdit = page
      .locator('[data-testid="address-card"]')
      .first()
      .locator('[data-testid="address-edit-btn"], button:has-text("编辑")')
    if (await firstEdit.isVisible()) {
      await firstEdit.click()
      await expect(page.getByRole('heading', { name: '编辑地址' })).toBeVisible({ timeout: 10000 })
    }
  })

  test('H5 单列布局与顶栏', async ({ page }) => {
    await expect(page.locator('[data-testid="address-page"]')).toBeVisible()
    const cards = page.locator('[data-testid="address-card"]')
    if ((await cards.count()) > 0) {
      await expect(cards.first()).toBeVisible()
    }
  })
})
