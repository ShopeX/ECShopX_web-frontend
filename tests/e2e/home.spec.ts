import { test, expect } from '@playwright/test';

test.describe('Homepage E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    // Wait for initial loading to finish if applicable
    const loading = page.getByTestId('home-loading');
    if (await loading.isVisible()) {
      await expect(loading).toBeHidden({ timeout: 10000 });
    }
  });

  test('should display hero banner with title and discover button', async ({ page }) => {
    const heroSection = page.getByTestId('home-hero-section');
    await expect(heroSection).toBeVisible();

    const heroTitle = page.getByTestId('home-hero-title');
    await expect(heroTitle).not.toBeEmpty();

    const discoverBtn = page.getByTestId('home-hero-discover-btn');
    await expect(discoverBtn).toBeVisible();
    await expect(discoverBtn).toContainText(/发现更多|发现/);
  });

  test('should display popular products section', async ({ page }) => {
    const popularSection = page.getByTestId('home-popular-section');
    await expect(popularSection).toBeVisible();

    // Wait for at least one product card to be visible
    const firstProduct = popularSection.getByTestId('home-product-card').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });

    await expect(firstProduct.getByTestId('home-product-title')).toBeVisible();
    await expect(firstProduct.getByTestId('home-product-subtitle')).toBeVisible();
  });

  test('should display new arrivals section with prices', async ({ page }) => {
    const newArrivalSection = page.getByTestId('home-new-arrival-section');
    await expect(newArrivalSection).toBeVisible();

    // Wait for at least one product card to be visible
    const firstProduct = newArrivalSection.getByTestId('home-product-card').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });

    await expect(firstProduct.getByTestId('home-product-title')).toBeVisible();
    await expect(firstProduct.getByTestId('home-product-price')).toBeVisible();
  });

  test('should display brand news section', async ({ page }) => {
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

  test('should handle add to cart interaction in new arrivals', async ({ page }) => {
    const newArrivalSection = page.getByTestId('home-new-arrival-section');
    const firstProduct = newArrivalSection.getByTestId('home-product-card').first();

    // Hover to reveal add to cart button (as defined in ProductCard.vue)
    await firstProduct.hover();

    const addToCartBtn = firstProduct.getByTestId('home-product-add-to-cart-btn');
    await expect(addToCartBtn).toBeVisible();

    // Clicking should trigger console.log (as currently implemented)
    // In a real test, we would check for a toast or cart update
    await addToCartBtn.click();
  });
});
