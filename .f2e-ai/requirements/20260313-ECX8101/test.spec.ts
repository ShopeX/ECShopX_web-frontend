import { test, expect } from '@playwright/test';

/**
 * ECX-8101 我的订单页面 E2E 测试
 */
test.describe('ECX-8101 我的订单页面', () => {

  test.beforeEach(async ({ page }) => {
    // 假设已登录
    await page.goto('/account/orders');
  });

  test('页面基础渲染 (PC)', async ({ page }) => {
    // 验证标题和 Tab 存在
    await expect(page.locator('text=全部订单')).toBeVisible();
    await expect(page.locator('text=待支付')).toBeVisible();
    await expect(page.locator('text=待收货')).toBeVisible();

    // 验证侧边栏菜单激活状态 (PC 特有)
    if (await page.viewportSize()?.width! > 1024) {
      const activeMenu = page.locator('[data-testid="account-menu-item-orders"]');
      await expect(activeMenu).toHaveClass(/active/);
    }
  });

  test('订单状态切换筛选', async ({ page }) => {
    // 点击“待支付” Tab
    await page.click('text=待支付');
    
    // 验证 URL 参数或加载态 (根据实现)
    // await expect(page).toHaveURL(/status=pending_payment/);
    
    // 验证列表内容 (Mock 数据应显示待支付订单)
    await expect(page.locator('text=店铺名称')).toBeVisible();
  });

  test('待支付订单操作 - 取消订单', async ({ page }) => {
    await page.click('text=待支付');
    const cancelBtn = page.locator('button:has-text("取消订单")').first();
    
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      // 验证弹窗确认 (如果有)
      // await page.click('text=确定');
      
      // 验证取消成功提示或状态变更
      await expect(page.locator('text=订单已取消')).toBeVisible();
    }
  });

  test('响应式适配 - 移动端菜单', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/account/orders');

    // 验证 H5 头部下拉菜单触发器
    const mobileHeader = page.locator('text=我的订单');
    await expect(mobileHeader).toBeVisible();
    
    // 验证 Tab 横滑区域
    const tabsContainer = page.locator('.flex.overflow-x-auto');
    await expect(tabsContainer).toBeVisible();
  });
});
