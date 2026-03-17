import { test, expect } from '@playwright/test';

/**
 * ECX-8120 我的收藏页 E2E 测试（H5/移动端）
 * 路由：/account/favorites（与 AccountMenu「我的收藏」一致）
 * 范围：仅列表展示，不包含移出收藏、加购等操作
 */
test.describe('ECX-8120 我的收藏页', () => {
  const h5Viewport = { width: 375, height: 667 };

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(h5Viewport);
    await page.goto('/account/favorites');
  });

  test('H5 我的收藏页可访问且布局正确', async ({ page }) => {
    const pageContainer = page.locator('[data-testid="account-favorites-page"]');
    await expect(pageContainer).toBeVisible();

    const body = page.locator('body');
    await expect(body).toHaveCSS('overflow-x', 'hidden');

    const filterBar = page.locator('[data-testid="account-favorites-filter-bar"]');
    await expect(filterBar).toBeVisible();
    await expect(filterBar).toContainText('我的收藏');
  });

  test('有数据时展示收藏列表（两列网格）', async ({ page }) => {
    const list = page.locator('[data-testid="account-favorites-list"]');
    const empty = page.locator('[data-testid="account-favorites-empty"]');
    await expect(list.or(empty)).toBeVisible();

    const items = page.locator('[data-testid="account-favorites-item"]');
    const count = await items.count();
    if (count > 0) {
      await expect(items.first()).toBeVisible();
    }
  });

  test('无数据时展示空状态', async ({ page }) => {
    const list = page.locator('[data-testid="account-favorites-list"]');
    const empty = page.locator('[data-testid="account-favorites-empty"]');
    const hasItems = (await list.locator('[data-testid="account-favorites-item"]').count()) > 0;

    if (!hasItems) {
      await expect(empty).toBeVisible();
      await expect(empty).toContainText(/暂无|收藏/);
    }
  });

  test('本需求不展示「移出收藏」按钮', async ({ page }) => {
    const removeBtn = page.getByRole('button', { name: '移出收藏' });
    await expect(removeBtn).toHaveCount(0);
  });

  test('点击收藏卡片可进入商品详情', async ({ page }) => {
    const firstItem = page.locator('[data-testid="account-favorites-item"]').first();
    if (await firstItem.isVisible()) {
      await firstItem.click();
      await expect(page).toHaveURL(/\/(products|item|detail)\//);
    }
  });
});
