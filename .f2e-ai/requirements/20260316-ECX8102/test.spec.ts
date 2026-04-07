import { test, expect } from '@playwright/test'

/**
 * ECX-8102 优惠券列表页面 E2E 测试（H5）
 * 需求：仅 H5/移动端，可用+不可用 Tab，列表来自 GET /wxapp/user/getUserCardList
 */
const H5_VIEWPORT = { width: 375, height: 667 }
const mockCoupons = [
  {
    id: 101,
    title: '满500减100',
    description: '指定商品可用',
    deduct_money: 10000,
    min_fee: 50000,
    expire_time: '2026-12-31 23:59:59',
    status: '1',
  },
  {
    id: 102,
    title: '满300减50',
    description: '已过期优惠券',
    deduct_money: 5000,
    min_fee: 30000,
    expire_time: '2025-12-31 23:59:59',
    status: '2',
  },
]

const typedCoupons = [
  {
    id: 201,
    code: 'DISCOUNT-201',
    title: '秋季折扣券',
    card_type: 'discount',
    discount: '80',
    begin_date: '2026-03-01',
    end_date: '2026-03-31',
    apply_scope: '全场可用',
    use_condition: '满300元可用',
    status: '1',
  },
  {
    id: 202,
    code: 'CASH-202',
    title: '满500减100',
    card_type: 'cash',
    least_cost: '50000',
    reduce_cost: '10000',
    begin_date: '2026-03-05',
    end_date: '2026-03-31',
    apply_scope: '指定商品可用',
    status: '1',
  },
  {
    id: 203,
    code: 'GIFT-203',
    title: '新品兑换券',
    card_type: 'gift',
    begin_date: '2026-03-10',
    end_date: '2026-03-31',
    apply_scope: '门店自提可用',
    description: '可兑换指定赠品',
    status: '1',
  },
]

async function mockUserCouponList(page: any, list = mockCoupons) {
  await page.route('**/wxapp/user/getUserCardList**', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          list,
        },
      }),
    })
  })
}

test.describe('ECX-8102 优惠券列表页 H5', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(H5_VIEWPORT)
  })

  test('优惠券列表页 H5 可访问与基础渲染', async ({ page }) => {
    await mockUserCouponList(page)
    await page.goto('/account/coupons')
    await expect(page.locator('[data-testid="coupons-page"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="coupons-page"]').getByText('优惠券').first()
    ).toBeVisible()
    await expect(page.locator('[data-testid="coupons-tab-available"]')).toBeVisible()
    await expect(page.locator('[data-testid="coupons-tab-unavailable"]')).toBeVisible()
    await expect(page.locator('[data-testid="coupons-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="coupons-tab-available"]')).toContainText('(1)')
    await expect(page.locator('[data-testid="coupons-tab-unavailable"]')).toContainText('(1)')
  })

  test('可用/不可用 Tab 切换', async ({ page }) => {
    await mockUserCouponList(page)
    await page.goto('/account/coupons')
    const tabAvailable = page.locator('[data-testid="coupons-tab-available"]')
    const tabUnavailable = page.locator('[data-testid="coupons-tab-unavailable"]')

    await tabUnavailable.click()
    await expect(tabUnavailable).toHaveAttribute('aria-selected', 'true')
    await expect(tabAvailable).toHaveAttribute('aria-selected', 'false')
    await expect(page.locator('[data-testid="coupon-card"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="coupon-card"]').first()).toContainText('满300减50')

    await tabAvailable.click()
    await expect(tabAvailable).toHaveAttribute('aria-selected', 'true')
    await expect(tabUnavailable).toHaveAttribute('aria-selected', 'false')
    await expect(page.locator('[data-testid="coupon-card"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="coupon-card"]').first()).toContainText('满500减100')
  })

  test('列表数据展示 - 卡片信息完整', async ({ page }) => {
    await mockUserCouponList(page)
    await page.goto('/account/coupons')
    const cards = page.locator('[data-testid="coupon-card"]')
    await expect(cards).toHaveCount(1)
    const first = cards.first()
    await expect(first).toContainText('¥')
    await expect(first).toContainText('100')
    await expect(first).toContainText('满500减100')
    await expect(first).toContainText('使用时间')
    await expect(first).toContainText('2026-12-31')
    await expect(first).toContainText('指定商品可用')
  })

  test('空状态展示', async ({ page }) => {
    await mockUserCouponList(page, [])
    await page.goto('/account/coupons')
    await expect(page.locator('[data-testid="coupons-empty"]')).toBeVisible()
    await expect(page.locator('[data-testid="coupons-empty"]')).toContainText(/暂无|没有|无优惠券/i)
  })

  test('H5 布局 - Tab 选中态与卡片左右结构', async ({ page }) => {
    await mockUserCouponList(page)
    await page.goto('/account/coupons')
    const tabActive = page.locator('[data-testid="coupons-tab-available"]')
    await expect(tabActive).toBeVisible()
    const card = page.locator('[data-testid="coupon-card"]').first()
    await expect(card).toBeVisible()
    await expect(card.getByText('¥')).toBeVisible()
    await expect(card.getByText(/满.*减/)).toBeVisible()
    await expect(card.getByText(/使用时间/)).toBeVisible()
    await expect(card.getByText('指定商品可用')).toBeVisible()
  })

  test('按 card_type 展示折扣券、满减券、兑换券，并显示使用时间与适用规则', async ({ page }) => {
    await mockUserCouponList(page, typedCoupons)
    await page.goto('/account/coupons')

    const cards = page.locator('[data-testid="coupon-card"]')
    await expect(cards).toHaveCount(3)

    const discountCard = cards.nth(0)
    await expect(discountCard).toContainText('8折')
    await expect(discountCard).toContainText('使用时间')
    await expect(discountCard).toContainText('2026-03-01')
    await expect(discountCard).toContainText('2026-03-31')
    await expect(discountCard).toContainText('适用规则')
    await expect(discountCard).toContainText('全场可用')

    const cashCard = cards.nth(1)
    await expect(cashCard).toContainText('¥')
    await expect(cashCard).toContainText('100')
    await expect(cashCard).toContainText('满500减100')
    await expect(cashCard).toContainText('指定商品可用')

    const giftCard = cards.nth(2)
    await expect(giftCard).toContainText('兑换券')
    await expect(giftCard).toContainText('新品兑换券')
    await expect(giftCard).toContainText('门店自提可用')
  })
})
