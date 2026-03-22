import { test, expect } from '@playwright/test'

/**
 * ECX-8174 申请售后组件 E2E 测试
 * 选择器约定：data-testid（Playwright testIdAttribute: 'data-testid'）
 */

test.describe('AftersalesModal — 售后申请组件', () => {
  // 前置：进入已完成订单详情页（canApplyAftersales: true）
  test.beforeEach(async ({ page }) => {
    await page.goto('/account/orders/test-order-completed')
  })

  // TC01 — 弹窗可正常打开
  test('TC01: 点击申请售后按钮，弹窗正常打开', async ({ page }) => {
    await page.getByTestId('btn-apply-aftersales').click()
    await expect(page.getByTestId('aftersales-modal')).toBeVisible()
    await expect(page.getByTestId('aftersales-modal')).toContainText('申请售后')
  })

  // TC02 — 点击关闭按钮关闭弹窗
  test('TC02: 点击关闭按钮，弹窗关闭', async ({ page }) => {
    await page.getByTestId('btn-apply-aftersales').click()
    await expect(page.getByTestId('aftersales-modal')).toBeVisible()
    await page.getByTestId('btn-close-aftersales').click()
    await expect(page.getByTestId('aftersales-modal')).not.toBeVisible()
  })

  // TC03 — 点击取消按钮关闭弹窗
  test('TC03: 点击取消按钮，弹窗关闭', async ({ page }) => {
    await page.getByTestId('btn-apply-aftersales').click()
    await expect(page.getByTestId('aftersales-modal')).toBeVisible()
    await page.getByTestId('btn-cancel-aftersales').click()
    await expect(page.getByTestId('aftersales-modal')).not.toBeVisible()
  })

  // TC04 — 服务类型下拉可选择
  test('TC04: 服务类型下拉可选择（退货退款）', async ({ page }) => {
    await page.getByTestId('btn-apply-aftersales').click()
    await page.getByTestId('select-aftersales-type').selectOption('REFUND_GOODS')
    await expect(page.getByTestId('select-aftersales-type')).toHaveValue('REFUND_GOODS')
  })

  // TC05 — 退款理由下拉可选择
  test('TC05: 退款理由下拉可选择', async ({ page }) => {
    await page.getByTestId('btn-apply-aftersales').click()
    await page.getByTestId('select-reason').selectOption('质量问题')
    await expect(page.getByTestId('select-reason')).toHaveValue('质量问题')
  })

  // TC06 — 退款说明 textarea 可填写
  test('TC06: 退款说明 textarea 可填写', async ({ page }) => {
    await page.getByTestId('btn-apply-aftersales').click()
    await page.getByTestId('textarea-description').fill('商品有破损')
    await expect(page.getByTestId('textarea-description')).toHaveValue('商品有破损')
  })

  // TC07 — 商品数量 stepper 可增减
  test('TC07: 商品数量 stepper 可增减，且不低于 1', async ({ page }) => {
    await page.getByTestId('btn-apply-aftersales').click()
    await expect(page.getByTestId('quantity-display')).toHaveText('1')

    await page.getByTestId('btn-quantity-plus').click()
    await expect(page.getByTestId('quantity-display')).toHaveText('2')

    await page.getByTestId('btn-quantity-minus').click()
    await expect(page.getByTestId('quantity-display')).toHaveText('1')

    // 数量不能低于 1
    await page.getByTestId('btn-quantity-minus').click()
    await expect(page.getByTestId('quantity-display')).toHaveText('1')
  })

  // TC08 — 未选服务类型时提交显示校验提示
  test('TC08: 未选服务类型，提交时显示校验提示', async ({ page }) => {
    await page.getByTestId('btn-apply-aftersales').click()
    await page.getByTestId('select-reason').selectOption('质量问题')
    // 不选服务类型，直接提交
    await page.getByTestId('btn-submit-aftersales').click()
    // 弹窗仍可见（未提交）
    await expect(page.getByTestId('aftersales-modal')).toBeVisible()
    // 有校验提示文字
    await expect(page.getByTestId('aftersales-modal')).toContainText(/服务类型|必填|请选择/)
  })

  // TC09 — 未选退款理由时提交显示校验提示
  test('TC09: 未选退款理由，提交时显示校验提示', async ({ page }) => {
    await page.getByTestId('btn-apply-aftersales').click()
    await page.getByTestId('select-aftersales-type').selectOption('ONLY_REFUND')
    // 不选退款理由，直接提交
    await page.getByTestId('btn-submit-aftersales').click()
    await expect(page.getByTestId('aftersales-modal')).toBeVisible()
    await expect(page.getByTestId('aftersales-modal')).toContainText(/退款理由|必填|请选择/)
  })

  // TC10 — 完整填写后提交成功
  test('TC10: 完整填写表单，提交成功后弹窗关闭并出现成功提示', async ({ page }) => {
    // Mock POST /wxapp/aftersales 返回成功
    await page.route('**/wxapp/aftersales', (route) =>
      route.fulfill({ status: 200, json: { code: 0, message: 'ok' } })
    )

    await page.getByTestId('btn-apply-aftersales').click()
    await page.getByTestId('select-aftersales-type').selectOption('ONLY_REFUND')
    await page.getByTestId('select-reason').selectOption('质量问题')
    await page.getByTestId('textarea-description').fill('商品破损严重')
    await page.getByTestId('btn-submit-aftersales').click()

    // 弹窗关闭
    await expect(page.getByTestId('aftersales-modal')).not.toBeVisible()
    // 成功 toast
    await expect(page.locator('body')).toContainText(/售后申请|提交成功/)
  })

  // TC11 — 提交失败显示错误反馈
  test('TC11: 接口返回错误，显示错误 toast，弹窗不关闭', async ({ page }) => {
    // Mock POST /wxapp/aftersales 返回失败
    await page.route('**/wxapp/aftersales', (route) =>
      route.fulfill({ status: 400, json: { code: 1, message: '申请失败，请稍后重试' } })
    )

    await page.getByTestId('btn-apply-aftersales').click()
    await page.getByTestId('select-aftersales-type').selectOption('ONLY_REFUND')
    await page.getByTestId('select-reason').selectOption('质量问题')
    await page.getByTestId('btn-submit-aftersales').click()

    // 弹窗仍可见
    await expect(page.getByTestId('aftersales-modal')).toBeVisible()
    // 错误提示
    await expect(page.locator('body')).toContainText(/失败|重试|错误/)
  })
})
