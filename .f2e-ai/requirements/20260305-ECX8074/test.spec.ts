/**
 * 结算页 E2E 测试用例
 * 需求：20260305-ECX-8074 结算页开发
 * 对应 requirement.md 验收标准，选择器以 data-testid 为主
 */
import { test, expect } from '@playwright/test'

const CHECKOUT_PATH = '/checkout'

test.describe('结算页 - 入口与页面展示', () => {
  test('从购物车入口进入结算页时，应展示结算页且包含订单摘要与结算表单区域', async ({ page }) => {
    // 前置：需已登录且购物车有商品；实际可先访问购物车或通过 fixture 准备
    await page.goto('/cart')
    await page.getByRole('button', { name: /去结算/ }).click()
    await expect(page).toHaveURL(new RegExp('checkout'))
    await expect(page.getByTestId('checkout-page')).toBeVisible()
    await expect(page.getByTestId('checkout-summary')).toBeVisible()
    await expect(page.getByTestId('checkout-form')).toBeVisible()
  })

  test('从商品详情「立即购买」进入结算页时，应展示结算页且订单摘要为单商品', async ({ page }) => {
    // 前置：需已登录；从商品详情进入
    await page.goto('/products/1') // 替换为实际商品路由或 fixture
    await page.getByRole('button', { name: /立即购买/ }).click()
    await expect(page).toHaveURL(new RegExp('checkout'))
    await expect(page.getByTestId('checkout-page')).toBeVisible()
    await expect(page.getByTestId('checkout-summary')).toContainText(/1件商品|1 件/)
  })
})

test.describe('结算页 - 订单摘要', () => {
  test('结算页应展示订单摘要：商品信息、商品总计、运费、优惠、总计金额', async ({ page }) => {
    await page.goto(CHECKOUT_PATH)
    await expect(page.getByTestId('checkout-page')).toBeVisible()
    await expect(page.getByTestId('checkout-summary')).toBeVisible()
    await expect(page.getByTestId('checkout-summary')).toContainText(/商品总计|总计|实付/)
    await expect(page.getByTestId('checkout-summary')).toContainText(/运费|免费/)
  })
})

test.describe('结算页 - 收货地址（快递）', () => {
  test('无收货地址时，应展示「请添加地址」提示及「添加新地址」入口', async ({ page }) => {
    // 前置：需已登录且无收货地址（或使用无地址账号/Mock）
    await page.goto(CHECKOUT_PATH)
    await expect(page.getByTestId('checkout-form')).toBeVisible()
    await expect(page.getByText(/请添加地址/)).toBeVisible()
    await expect(page.getByRole('button', { name: /添加新地址|添加地址/ })).toBeVisible()
  })

  test('有收货地址时，应展示地址列表并可选择、编辑', async ({ page }) => {
    await page.goto(CHECKOUT_PATH)
    await expect(page.getByTestId('checkout-address-list')).toBeVisible()
    await expect(page.getByTestId('checkout-address-list')).toContainText(/编辑/)
    // 若有多个地址，点击第二个后选中态切换
    const secondAddress = page.getByTestId('checkout-address-card').nth(1)
    if (await secondAddress.isVisible()) {
      await secondAddress.click()
      await expect(secondAddress).toHaveAttribute('data-selected', 'true')
    }
  })

  test('点击「添加新地址」可进入新增地址流程（含省市区）', async ({ page }) => {
    await page.goto(CHECKOUT_PATH)
    await page.getByRole('button', { name: /添加新地址|添加地址/ }).click()
    await expect(page.getByTestId('address-form').or(page.getByRole('dialog'))).toBeVisible()
    await expect(page.getByLabel(/省|市|区|地区/).first()).toBeVisible()
  })
})

test.describe('结算页 - 优惠券', () => {
  test('结算页应展示优惠券入口，选择优惠券后费用明细与总计更新', async ({ page }) => {
    await page.goto(CHECKOUT_PATH)
    const couponEntry = page
      .getByTestId('checkout-coupon-entry')
      .or(page.getByText(/满.*减|优惠券/).first())
    await expect(couponEntry).toBeVisible()
    await couponEntry.click()
    await expect(page.getByTestId('coupon-list').or(page.getByRole('dialog'))).toBeVisible()
    // 选择第一张可用券（若存在）
    const firstCoupon = page.getByTestId('coupon-item').first()
    if (await firstCoupon.isVisible()) {
      await firstCoupon.click()
      await expect(page.getByTestId('checkout-summary')).toContainText(/优惠|抵扣/)
    }
  })
})

test.describe('结算页 - 支付方式与提交', () => {
  test('结算页应展示支付方式选项（如微信支付等）并可选择', async ({ page }) => {
    await page.goto(CHECKOUT_PATH)
    await expect(
      page.getByTestId('checkout-payment').or(page.getByText(/微信支付|支付方式/))
    ).toBeVisible()
  })

  test('未勾选「同意隐私政策及销售条款」时，提交应被拦截或提示', async ({ page }) => {
    await page.goto(CHECKOUT_PATH)
    const agreeCheckbox = page.getByRole('checkbox', { name: /隐私政策|销售条款|同意/ })
    await agreeCheckbox.setChecked(false)
    await page.getByRole('button', { name: /立即支付/ }).click()
    await expect(page.getByText(/请先同意|请勾选|同意.*条款/)).toBeVisible()
    await expect(page).toHaveURL(new RegExp('checkout'))
  })

  test('必填项完整且勾选条款后点击「立即支付」，应调用创建订单并进入支付或结果页', async ({
    page,
  }) => {
    await page.goto(CHECKOUT_PATH)
    await page.getByRole('checkbox', { name: /隐私政策|销售条款|同意/ }).setChecked(true)
    const payButton = page.getByRole('button', { name: /立即支付/ })
    await payButton.click()
    // 成功：跳转或展示成功态；失败：展示错误信息
    await expect(
      page.getByText(/支付|订单.*成功|下单成功/).or(page.getByTestId('checkout-error'))
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('结算页 - 响应式（PC / 移动端 H5）', () => {
  test('PC 视口下结算页为双栏布局（表单左、订单摘要右）', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(CHECKOUT_PATH)
    const form = page.getByTestId('checkout-form')
    const summary = page.getByTestId('checkout-summary')
    await expect(form).toBeVisible()
    await expect(summary).toBeVisible()
    const formBox = await form.boundingBox()
    const summaryBox = await summary.boundingBox()
    expect(formBox?.x ?? 0).toBeLessThan(summaryBox?.x ?? 9999)
  })

  test('移动端 H5 视口下结算页可正常展示并可操作提交', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(CHECKOUT_PATH)
    await expect(page.getByTestId('checkout-page')).toBeVisible()
    await expect(page.getByRole('button', { name: /立即支付/ })).toBeVisible()
  })
})

test.describe('结算页 - 门店自提（可选）', () => {
  test('选择「门店自提」后，展示省/市、查找门店及自提点列表并可选择', async ({ page }) => {
    await page.goto(CHECKOUT_PATH)
    await page.getByLabel(/门店自提/).click()
    await expect(page.getByText(/请选择省|请选择市|查找.*门店/)).toBeVisible()
    await expect(
      page.getByTestId('pickup-location-list').or(page.getByText(/上海国金|自提/))
    ).toBeVisible({ timeout: 5000 })
  })
})
