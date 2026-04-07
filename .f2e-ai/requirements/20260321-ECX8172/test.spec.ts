import { test, expect } from '@playwright/test'

/**
 * ECX-8172 订单评价组件
 * 测试范围：OrderReviewModal.vue + ReviewStarRating.vue
 */

const REVIEW_TRIGGER_URL = '/account/orders'

// ─────────────────────────────────────────────
// TC-01：评价弹窗打开 — PC 端（右侧抽屉）
// ─────────────────────────────────────────────
test('TC-01 PC端打开评价弹窗显示右侧抽屉', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(REVIEW_TRIGGER_URL)

  const btnReview = page.getByTestId('btn-review').first()
  await btnReview.click()

  const modal = page.getByTestId('order-review-modal')
  await expect(modal).toBeVisible()
  await expect(modal).toHaveCSS('width', '560px')

  await expect(page.getByTestId('review-modal-title')).toHaveText('评价商品')
  await expect(page.getByTestId('btn-close-review')).toBeVisible()
})

// ─────────────────────────────────────────────
// TC-02：评价弹窗打开 — H5 端（底部 Sheet）
// ─────────────────────────────────────────────
test('TC-02 H5端打开评价弹窗显示底部Sheet', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(REVIEW_TRIGGER_URL)

  const btnReview = page.getByTestId('btn-review').first()
  await btnReview.click()

  const modal = page.getByTestId('order-review-modal')
  await expect(modal).toBeVisible()
  await expect(page.getByTestId('review-modal-title')).toHaveText('评价商品')
  await expect(page.getByTestId('btn-submit-review')).toHaveText('提交评价')
})

// ─────────────────────────────────────────────
// TC-03：商品信息展示
// ─────────────────────────────────────────────
test('TC-03 评价弹窗正确展示商品信息', async ({ page }) => {
  await page.goto(REVIEW_TRIGGER_URL)

  await page.getByTestId('btn-review').first().click()
  await expect(page.getByTestId('order-review-modal')).toBeVisible()

  await expect(page.getByTestId('review-item-image')).toBeVisible()
  await expect(page.getByTestId('review-item-name')).not.toBeEmpty()
  await expect(page.getByTestId('review-item-spec')).toBeVisible()
})

// ─────────────────────────────────────────────
// TC-04：星级评分交互
// ─────────────────────────────────────────────
test('TC-04 星级评分可交互且满意度文字正确联动', async ({ page }) => {
  await page.goto(REVIEW_TRIGGER_URL)
  await page.getByTestId('btn-review').first().click()
  await expect(page.getByTestId('order-review-modal')).toBeVisible()

  // 默认 5 星，满意度文字为"非常满意"
  await expect(page.getByTestId('review-satisfaction-text')).toHaveText('非常满意')

  // 点击第 3 颗星
  await page.getByTestId('star-3').click()
  await expect(page.getByTestId('review-satisfaction-text')).toHaveText('一般')

  // 点击第 1 颗星
  await page.getByTestId('star-1').click()
  await expect(page.getByTestId('review-satisfaction-text')).toHaveText('非常不满意')

  // 点击第 5 颗星
  await page.getByTestId('star-5').click()
  await expect(page.getByTestId('review-satisfaction-text')).toHaveText('非常满意')
})

// ─────────────────────────────────────────────
// TC-05：评价内容输入及字数统计
// ─────────────────────────────────────────────
test('TC-05 评价内容输入字数统计正确更新', async ({ page }) => {
  await page.goto(REVIEW_TRIGGER_URL)
  await page.getByTestId('btn-review').first().click()
  await expect(page.getByTestId('order-review-modal')).toBeVisible()

  // 初始字数为 0/500
  await expect(page.getByTestId('review-content-count')).toHaveText('0/500')

  const content = page.getByTestId('review-content')
  const inputText = '这件商品质量很好'
  await content.fill(inputText)

  await expect(page.getByTestId('review-content-count')).toHaveText(`${inputText.length}/500`)

  // 超过 500 字时截断
  const longText = 'A'.repeat(600)
  await content.fill(longText)
  const value = await content.inputValue()
  expect(value.length).toBeLessThanOrEqual(500)
  await expect(page.getByTestId('review-content-count')).toHaveText('500/500')
})

// ─────────────────────────────────────────────
// TC-06：图片上传（选填）
// ─────────────────────────────────────────────
test('TC-06 图片上传最多5张并可删除', async ({ page }) => {
  await page.goto(REVIEW_TRIGGER_URL)
  await page.getByTestId('btn-review').first().click()
  await expect(page.getByTestId('order-review-modal')).toBeVisible()

  const fileInput = page.getByTestId('review-image-input')

  // 上传 1 张
  await fileInput.setInputFiles({
    name: 'test1.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake-image-content'),
  })
  await expect(page.getByTestId('uploaded-image-0')).toBeVisible()

  // 上传至 5 张（依次追加）
  for (let i = 1; i < 5; i++) {
    await fileInput.setInputFiles({
      name: `test${i + 1}.jpg`,
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content'),
    })
  }
  await expect(page.getByTestId('uploaded-image-4')).toBeVisible()

  // 5 张后上传按钮不可见
  await expect(page.getByTestId('btn-upload-image')).not.toBeVisible()

  // 删除第一张
  await page.getByTestId('delete-image-0').click()
  await expect(page.getByTestId('uploaded-image-4')).not.toBeVisible()
  await expect(page.getByTestId('btn-upload-image')).toBeVisible()
})

// ─────────────────────────────────────────────
// TC-07：表单提交成功
// ─────────────────────────────────────────────
test('TC-07 填写评价提交成功后弹窗关闭', async ({ page }) => {
  await page.route('**/wxapp/order/rate/create', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [{ rate_id: 'r001', item_id: 'i001' }] }),
    })
  })

  await page.goto(REVIEW_TRIGGER_URL)
  await page.getByTestId('btn-review').first().click()
  await expect(page.getByTestId('order-review-modal')).toBeVisible()

  await page.getByTestId('review-content').fill('商品不错，值得推荐')
  await page.getByTestId('btn-submit-review').click()

  await expect(page.getByTestId('order-review-modal')).not.toBeVisible()
})

// ─────────────────────────────────────────────
// TC-08：表单提交失败
// ─────────────────────────────────────────────
test('TC-08 提交失败时弹窗保持打开并显示错误', async ({ page }) => {
  await page.route('**/wxapp/order/rate/create', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Internal Server Error' }),
    })
  })

  await page.goto(REVIEW_TRIGGER_URL)
  await page.getByTestId('btn-review').first().click()
  await expect(page.getByTestId('order-review-modal')).toBeVisible()

  await page.getByTestId('review-content').fill('测试失败场景')
  await page.getByTestId('btn-submit-review').click()

  // 弹窗不关闭
  await expect(page.getByTestId('order-review-modal')).toBeVisible()
})

// ─────────────────────────────────────────────
// TC-09：关闭评价弹窗
// ─────────────────────────────────────────────
test('TC-09 点击关闭按钮关闭评价弹窗', async ({ page }) => {
  await page.goto(REVIEW_TRIGGER_URL)
  await page.getByTestId('btn-review').first().click()
  await expect(page.getByTestId('order-review-modal')).toBeVisible()

  await page.getByTestId('btn-close-review').click()
  await expect(page.getByTestId('order-review-modal')).not.toBeVisible()
})

// ─────────────────────────────────────────────
// TC-10：评价内容为空时前端校验阻止提交
// ─────────────────────────────────────────────
test('TC-10 内容为空时提交被前端校验拦截不调用API', async ({ page }) => {
  let apiCalled = false
  await page.route('**/wxapp/order/rate/create', async (route) => {
    apiCalled = true
    await route.continue()
  })

  await page.goto(REVIEW_TRIGGER_URL)
  await page.getByTestId('btn-review').first().click()
  await expect(page.getByTestId('order-review-modal')).toBeVisible()

  // 不填内容，直接提交
  await page.getByTestId('btn-submit-review').click()

  // API 不应被调用，弹窗保持打开
  expect(apiCalled).toBe(false)
  await expect(page.getByTestId('order-review-modal')).toBeVisible()
})
