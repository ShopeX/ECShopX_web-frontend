import { test, expect } from '@playwright/test';

/**
 * ECX-8100 会员中心积分功能验收测试
 * 覆盖：Dashboard 概览、积分明细列表、骨架屏状态、详情页布局、分页逻辑
 */
test.describe('ECX-8100 会员中心积分功能验收', () => {

  test.beforeEach(async ({ page }) => {
    // 假设已登录状态，或者在 CI 环境下注入 Token
    await page.goto('/account');
  });

  test('Dashboard: 积分卡片与加载过渡', async ({ page }) => {
    // 1. 检查可用积分区域
    const pointTotal = page.getByTestId('point-total');
    
    // 加载期间不应显示 "暂无记录" (业务要求)
    const emptyState = page.locator('text=暂无积分记录');
    await expect(emptyState).not.toBeVisible();

    // 2. 检查数值显示 (应为数字)
    await expect(pointTotal).toBeVisible();
    const text = await pointTotal.innerText();
    expect(text).toMatch(/\d+/);

    // 3. 点击“全部积分”确认跳转跳转
    await page.click('text=全部积分');
    await expect(page).toHaveURL(/\/account\/points/);
  });

  test('Dashboard: 积分明细列表渲染', async ({ page }) => {
    // 1. 检查标题
    await expect(page.locator('text=积分明细（近一年内）')).toBeVisible();

    // 2. 检查单条记录结构 (如果存在数据)
    const recordItems = page.locator('.content-stretch > div.flex-col');
    if (await recordItems.count() > 0) {
      const firstItem = recordItems.first();
      // 检查时间格式 (202x-xx-xx)
      await expect(firstItem.locator('text=/\\d{4}-\\d{2}-\\d{2}/')).toBeVisible();
      // 检查符号 (+/-)
      await expect(firstItem.locator('text=/[+-]\\d+/')).toBeVisible();
    }
  });

  test('积分详情页: PC 端侧边栏与布局规格', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/account/points');

    // 1. 验证侧边栏宽度与高亮
    const sidebar = page.locator('aside');
    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox?.width).toBeCloseTo(256, 0);

    const activeMenu = page.getByTestId('account-menu-item-points');
    await expect(activeMenu).toHaveClass(/active/);

    // 2. 验证内容区间距 (64px gap)
    const mainContainer = page.locator('.flex.flex-row.lg\\:gap-16');
    await expect(mainContainer).toHaveClass(/lg:gap-16/); // 16 * 4px = 64px
  });

  test('积分详情页: 分页组件验收', async ({ page }) => {
    await page.goto('/account/points');
    
    // 验证分页组件 (ECPagination) 存在，而不是单一的“加载更多”按钮
    // 注：此项需要在开发计划中完成对齐
    const pagination = page.locator('[data-testid="point-pagination"]');
    await expect(pagination).toBeInViewport();
  });

  test('移动端响应式: H5 标题状态', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/account/points');

    // 侧边栏应隐藏
    await expect(page.locator('aside')).not.toBeVisible();
    // “个人中心”移动端标题栏应显示
    await expect(page.locator('h1:has-text("个人中心")')).toBeVisible();
  });
});
