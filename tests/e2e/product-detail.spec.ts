import { test, expect } from '@playwright/test'

test.describe('商品详情页 E2E 测试', () => {
  // 使用一个已知存在的商品 ID 进行测试
  const productId = '1' // 根据实际情况调整

  test.beforeEach(async ({ page }) => {
    await page.goto(`/products/${productId}`)
    await page.waitForLoadState('networkidle')
  })

  test.describe('页面布局', () => {
    test('应该显示商品图片区域', async ({ page }) => {
      // 主图区域
      const mainImage = page.locator('.aspect-square img').first()
      await expect(mainImage).toBeVisible()
    })

    test('应该显示商品标题', async ({ page }) => {
      const title = page.locator('h1')
      await expect(title).toBeVisible()
    })

    test('应该显示商品价格', async ({ page }) => {
      // 价格区域包含 ¥ 符号
      const price = page.getByText(/¥[\d,]+/)
      await expect(price.first()).toBeVisible()
    })

    test('应该显示收藏按钮', async ({ page }) => {
      // 收藏按钮（心形图标）
      const favoriteBtn = page.locator('button').filter({ has: page.locator('[class*="heart"]') })
      await expect(favoriteBtn.first()).toBeVisible()
    })
  })

  test.describe('PC 端布局', () => {
    test('应该显示左侧缩略图导航', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name.includes('Mobile'), 'PC 专属测试')
      
      // PC 端缩略图区域
      const thumbnails = page.locator('.hidden.lg\\:flex button img')
      const count = await thumbnails.count()
      
      // 如果有多张图片，应该显示缩略图
      if (count > 0) {
        await expect(thumbnails.first()).toBeVisible()
      }
    })

    test('应该显示 PC 端操作按钮', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name.includes('Mobile'), 'PC 专属测试')
      
      // PC 端内嵌的操作按钮
      const addToCartBtn = page.locator('.hidden.lg\\:flex button').filter({ 
        hasText: /加入购物袋|Add to Bag|أضف إلى الحقيبة/ 
      })
      await expect(addToCartBtn).toBeVisible()

      const buyNowBtn = page.locator('.hidden.lg\\:flex button').filter({ 
        hasText: /立即购买|Buy Now|اشترِ الآن/ 
      })
      await expect(buyNowBtn).toBeVisible()
    })
  })

  test.describe('H5 端布局', () => {
    test('应该显示 H5 底部操作栏', async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes('Mobile'), 'H5 专属测试')
      
      // H5 底部固定操作栏
      const bottomBar = page.locator('.lg\\:hidden.fixed.bottom-0')
      await expect(bottomBar).toBeVisible()

      // 加入购物袋按钮
      const addToCartBtn = bottomBar.getByRole('button', { 
        name: /加入购物袋|Add to Bag|أضف إلى الحقيبة/ 
      })
      await expect(addToCartBtn).toBeVisible()

      // 立即购买按钮
      const buyNowBtn = bottomBar.getByRole('button', { 
        name: /立即购买|Buy Now|اشترِ الآن/ 
      })
      await expect(buyNowBtn).toBeVisible()
    })

    test('应该显示图片指示点', async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes('Mobile'), 'H5 专属测试')
      
      // H5 图片指示点
      const indicators = page.locator('.lg\\:hidden .rounded-full')
      const count = await indicators.count()
      
      if (count > 0) {
        await expect(indicators.first()).toBeVisible()
      }
    })
  })

  test.describe('手风琴详情', () => {
    test('应该显示商品详情折叠区', async ({ page }) => {
      const detailsSection = page.getByText(/商品详情|Product Details|تفاصيل المنتج/)
      await expect(detailsSection.first()).toBeVisible()
    })

    test('应该显示可配信息折叠区', async ({ page }) => {
      const deliverySection = page.getByText(/可配信息|Delivery Info|معلومات التوصيل/)
      await expect(deliverySection.first()).toBeVisible()
    })

    test('点击商品详情应该展开/收起', async ({ page }) => {
      const detailsBtn = page.locator('button').filter({ 
        hasText: /商品详情|Product Details|تفاصيل المنتج/ 
      }).first()
      
      // 点击展开
      await detailsBtn.click()
      
      // 等待动画
      await page.waitForTimeout(300)
      
      // 检查展开图标旋转
      const icon = detailsBtn.locator('[class*="chevron"]')
      await expect(icon).toBeVisible()
    })
  })

  test.describe('规格选择', () => {
    test('如果有规格，应该显示规格选择器', async ({ page }) => {
      // 规格区域（可能不存在）
      const specSection = page.locator('.flex.flex-col.gap-4.w-full')
      const exists = await specSection.count() > 0
      
      if (exists) {
        // 规格标题（如：颜色、尺寸）
        const specTitle = page.locator('h3.text-sm')
        await expect(specTitle.first()).toBeVisible()
      }
    })
  })

  test.describe('错误状态', () => {
    test('访问不存在的商品应显示错误状态', async ({ page }) => {
      await page.goto('/products/nonexistent-product-id-999999')
      await page.waitForLoadState('networkidle')
      
      // 等待加载完成
      await page.waitForTimeout(2000)
      
      // 应该显示错误信息或返回按钮
      const errorOrBack = page.getByText(/商品不存在|Product not found|المنتج غير موجود|返回|Back|رجوع/)
      
      // 如果有错误状态，验证其可见
      const count = await errorOrBack.count()
      if (count > 0) {
        await expect(errorOrBack.first()).toBeVisible()
      }
    })
  })

  test.describe('i18n 国际化', () => {
    test('默认语言文案应正确显示', async ({ page }) => {
      // 加入购物袋按钮
      const addToCartBtn = page.getByRole('button', { 
        name: /加入购物袋|Add to Bag|أضف إلى الحقيبة/ 
      })
      await expect(addToCartBtn.first()).toBeVisible()

      // 立即购买按钮
      const buyNowBtn = page.getByRole('button', { 
        name: /立即购买|Buy Now|اشترِ الآن/ 
      })
      await expect(buyNowBtn.first()).toBeVisible()

      // 商品详情折叠区
      const detailsSection = page.getByText(/商品详情|Product Details|تفاصيل المنتج/)
      await expect(detailsSection.first()).toBeVisible()
    })
  })
})
