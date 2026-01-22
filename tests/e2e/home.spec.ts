import { test, expect } from '@playwright/test';

test.describe('首页 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到首页
    await page.goto('/');
    // 等待初始加载完成
    const loading = page.getByTestId('home-loading');
    if (await loading.isVisible()) {
      await expect(loading).toBeHidden({ timeout: 10000 });
    }
  });

  test('应该显示英雄横幅及标题和发现按钮', async ({ page }) => {
    const heroSection = page.getByTestId('home-hero-section');
    await expect(heroSection).toBeVisible();

    const heroTitle = page.getByTestId('home-hero-title');
    await expect(heroTitle).not.toBeEmpty();

    const discoverBtn = page.getByTestId('home-hero-discover-btn');
    await expect(discoverBtn).toBeVisible();
    await expect(discoverBtn).toContainText(/发现更多|发现/);
  });

  test('应该显示热门商品区域', async ({ page }) => {
    const popularSection = page.getByTestId('home-popular-section');
    await expect(popularSection).toBeVisible();

    // 等待至少一个商品卡片可见
    const firstProduct = popularSection.getByTestId('home-product-card').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });

    await expect(firstProduct.getByTestId('home-product-title')).toBeVisible();
    await expect(firstProduct.getByTestId('home-product-subtitle')).toBeVisible();
  });

  test('应该显示新品推荐区域及价格', async ({ page }) => {
    const newArrivalSection = page.getByTestId('home-new-arrival-section');
    await expect(newArrivalSection).toBeVisible();

    // 等待至少一个商品卡片可见
    const firstProduct = newArrivalSection.getByTestId('home-product-card').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });

    await expect(firstProduct.getByTestId('home-product-title')).toBeVisible();
    await expect(firstProduct.getByTestId('home-product-price')).toBeVisible();
  });

  test('应该显示品牌资讯区域', async ({ page }) => {
    const newsSection = page.getByTestId('home-brand-news-section');
    await expect(newsSection).toBeVisible();

    const newsCards = newsSection.getByTestId('news-card');
    await expect(newsCards).toHaveCount(4);

    const firstNews = newsCards.first();
    await expect(firstNews.getByTestId('news-card-title')).toBeVisible();
    await expect(firstNews.getByTestId('news-card-summary')).toBeVisible();

    await expect(page.getByTestId('home-brand-news-quote')).toBeVisible();
    await expect(page.getByTestId('home-brand-news-btn')).toBeVisible();
  });

  test('应该处理新品区域的加入购物车交互', async ({ page }) => {
    const newArrivalSection = page.getByTestId('home-new-arrival-section');
    const firstProduct = newArrivalSection.getByTestId('home-product-card').first();

    // 悬停显示加入购物车按钮
    await firstProduct.hover();

    const addToCartBtn = firstProduct.getByTestId('home-product-add-to-cart-btn');
    await expect(addToCartBtn).toBeVisible();

    // 点击应该触发 console.log（当前实现）
    // 在真实测试中，我们会检查 toast 或购物车更新
    await addToCartBtn.click();
  });
});
