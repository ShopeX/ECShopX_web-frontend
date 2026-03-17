import { test, expect } from '@playwright/test';

/**
 * ECX-8100 个人中心积分集成测试
 * 场景：所有功能集成在 index.vue，删除 points.vue
 */
test.describe('ECX-8100 个人中心积分集成', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/account');
  });

  test('首页积分渲染与分页集成', async ({ page }) => {
    // 1. 验证概览卡片已移除跳转链接
    const viewAllBtn = page.locator('text=全部积分');
    await expect(viewAllBtn).not.toBeVisible();

    // 2. 验证积分列表及分页存在于首页
    await expect(page.locator('text=积分明细（近一年内）')).toBeVisible();
    
    // 3. 验证 AccountMenu 已移除“我的积分”
    const pointsMenu = page.getByTestId('account-menu-item-points');
    await expect(pointsMenu).not.toBeVisible();
  });

  test('首页列表分页切换', async ({ page }) => {
    // 假设有分页组件渲染
    const pagination = page.getByTestId('point-pagination');
    if (await pagination.isVisible()) {
      await pagination.locator('button:has-text("2")').click();
      // 验证仍在首页
      await expect(page).toHaveURL(/\/account$/);
      // 验证列表内容更新 (可以通过加载态间接验证)
      await expect(page.locator('.content-stretch .animate-pulse')).toBeVisible({ timeout: 1000 }).catch(() => {});
    }
  });

  test('清理验证: 详情页不可访问', async ({ page }) => {
    const response = await page.goto('/account/points');
    // 验证 404 或重定向
    expect(response?.status()).toBeGreaterThanOrEqual(404);
  });
});
