/**
 * 支付页 E2E 测试用例
 * 需求：20260309-ECX-8078 支付页面开发
 * 对应 requirement.md 验收标准，选择器以 data-testid 为主
 */
import { test, expect } from '@playwright/test'

const PAYMENT_PATH = '/payment'

test.describe('支付页 - 入口与页面展示', () => {
  test('从结算页提交订单成功后应跳转至支付页且 URL 带订单号', async ({ page }) => {
    await page.goto('/cart')
    await page.getByRole('button', { name: /去结算|前往结算/ }).click()
    await expect(page).toHaveURL(new RegExp('checkout'))
    await page.getByTestId('checkout-pay-now').first().click()
    await expect(page).toHaveURL(/\/(payment|pay)/)
    await expect(page).toHaveURL(/orderId|order_id/)
  })

  test('支付页应展示页面容器与订单/支付相关信息区域', async ({ page }) => {
    await page.goto(`${PAYMENT_PATH}?orderId=5181717000120064`)
    await expect(page.getByTestId('payment-page')).toBeVisible()
    await expect(
      page.getByTestId('payment-summary').or(page.getByText(/订单|金额|支付/))
    ).toBeVisible()
  })
})

test.describe('支付页 - 从订单列表/订单详情进入', () => {
  test('从订单列表「去支付」应跳转至支付页并带订单号', async ({ page }) => {
    await page.goto('/order')
    await page
      .getByRole('button', { name: /去支付/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/(payment|pay)/)
    await expect(page).toHaveURL(/orderId|order_id/)
  })

  test('从订单详情「去支付」应跳转至支付页并带订单号', async ({ page }) => {
    await page.goto('/order/5181717000120064')
    await page.getByRole('button', { name: /去支付/ }).click()
    await expect(page).toHaveURL(/\/(payment|pay)/)
    await expect(page).toHaveURL(/orderId|order_id|5181717000120064/)
  })
})

test.describe('支付页 - 支付方式', () => {
  test('支付页应展示支付方式列表且用户可选择', async ({ page }) => {
    await page.goto(`${PAYMENT_PATH}?orderId=5181717000120064`)
    await expect(
      page.getByTestId('payment-method-list').or(page.getByText(/微信支付|支付方式/))
    ).toBeVisible()
    const firstMethod = page.getByTestId('payment-method-item').first()
    if (await firstMethod.isVisible()) {
      await firstMethod.click()
      await expect(firstMethod).toHaveAttribute('data-selected', 'true')
    }
  })
})

test.describe('支付页 - 去支付与支付码', () => {
  test('选择支付方式并点击「去支付」后应展示支付码区域', async ({ page }) => {
    await page.goto(`${PAYMENT_PATH}?orderId=5181717000120064`)
    const payBtn = page
      .getByTestId('payment-pay-now')
      .or(page.getByRole('button', { name: /去支付/ }))
    await payBtn.click()
    await expect(
      page.getByTestId('payment-qrcode').or(page.getByTestId('payment-code'))
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('支付页 - 支付结果', () => {
  test('支付成功后应展示成功态或发生跳转', async ({ page }) => {
    await page.goto(`${PAYMENT_PATH}?orderId=5181717000120064`)
    await expect(page.getByTestId('payment-page')).toBeVisible()
    await expect(page.getByTestId('payment-success').or(page.getByText(/支付成功/))).toBeVisible({
      timeout: 15000,
    })
  })

  test('支付超时或失败时应展示提示且支持重试或返回', async ({ page }) => {
    await page.goto(`${PAYMENT_PATH}?orderId=5181717000120064`)
    await expect(
      page.getByText(/失败|超时|重试|返回/).or(page.getByTestId('payment-error'))
    ).toBeVisible({ timeout: 20000 })
  })
})

test.describe('支付页 - 响应式', () => {
  test('PC 视口下支付页正常展示且关键区域可见', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(`${PAYMENT_PATH}?orderId=5181717000120064`)
    await expect(page.getByTestId('payment-page')).toBeVisible()
    await expect(
      page.getByTestId('payment-method-list').or(page.getByRole('button', { name: /去支付/ }))
    ).toBeVisible()
  })

  test('移动端 H5 视口下支付页正常展示且可操作', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${PAYMENT_PATH}?orderId=5181717000120064`)
    await expect(page.getByTestId('payment-page')).toBeVisible()
    await expect(
      page.getByTestId('payment-pay-now').or(page.getByRole('button', { name: /去支付/ }))
    ).toBeVisible()
  })
})
