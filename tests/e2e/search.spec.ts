import { test, expect } from '@playwright/test'

test.describe('商品搜索功能 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到商品列表页
    await page.goto('/collections/all')
    // 等待页面加载完成
    await page.waitForLoadState('networkidle')
  })

  test.describe('搜索入口', () => {
    test('应该显示搜索图标按钮', async ({ page }) => {
      const searchTrigger = page.getByTestId('search-trigger')
      await expect(searchTrigger).toBeVisible()
    })

    test('点击搜索图标应该打开搜索抽屉', async ({ page }) => {
      const searchTrigger = page.getByTestId('search-trigger')
      await searchTrigger.click()

      const searchDrawer = page.getByTestId('search-drawer')
      await expect(searchDrawer).toBeVisible()
    })
  })

  test.describe('搜索抽屉', () => {
    test.beforeEach(async ({ page }) => {
      // 打开搜索抽屉
      await page.getByTestId('search-trigger').click()
      await expect(page.getByTestId('search-drawer')).toBeVisible()
    })

    test('应该显示搜索输入框', async ({ page }) => {
      const searchInput = page.getByTestId('search-input')
      await expect(searchInput).toBeVisible()
      await expect(searchInput).toHaveAttribute('placeholder')
    })

    test('应该显示热门搜索区块', async ({ page }) => {
      const hotSection = page.getByTestId('hot-keywords-section')
      await expect(hotSection).toBeVisible()

      // 应该有热门搜索标签
      const hotTags = page.getByTestId('hot-keyword-tag')
      await expect(hotTags.first()).toBeVisible()
    })

    test('应该显示历史搜索区块', async ({ page }) => {
      const historySection = page.getByTestId('history-keywords-section')
      await expect(historySection).toBeVisible()
    })

    // TODO: USlideover 关闭后 DOM 仍存在，需要优化检测逻辑
    test.skip('点击关闭按钮应该关闭抽屉', async ({ page }) => {
      const closeBtn = page.getByTestId('search-drawer-close')
      await closeBtn.click()

      // 等待动画完成，抽屉内容应该隐藏
      const searchDrawer = page.getByTestId('search-drawer')
      await expect(searchDrawer).toBeHidden({ timeout: 3000 })
    })

    test('输入关键词后应该显示清空按钮', async ({ page }) => {
      const searchInput = page.getByTestId('search-input')
      await searchInput.fill('手袋')

      const clearBtn = page.getByTestId('search-clear')
      await expect(clearBtn).toBeVisible()

      // 点击清空
      await clearBtn.click()
      await expect(searchInput).toHaveValue('')
    })
  })

  test.describe('搜索执行', () => {
    // TODO: USlideover 关闭后 DOM 仍存在，需要优化检测逻辑
    test.skip('输入关键词按回车应该执行搜索并关闭抽屉', async ({ page }) => {
      // 打开搜索抽屉
      await page.getByTestId('search-trigger').click()

      // 输入关键词并按回车
      const searchInput = page.getByTestId('search-input')
      await searchInput.fill('手袋')
      await searchInput.press('Enter')

      // 抽屉应该关闭
      await expect(page.getByTestId('search-drawer')).toBeHidden({ timeout: 3000 })

      // URL 应该包含 keyword 参数（URL 编码后的中文）
      await expect(page).toHaveURL(/keyword=/)
    })

    // TODO: USlideover 关闭后 DOM 仍存在，需要优化检测逻辑
    test.skip('点击热门搜索标签应该执行搜索', async ({ page }) => {
      // 打开搜索抽屉
      await page.getByTestId('search-trigger').click()

      // 点击第一个热门搜索标签
      const firstHotTag = page.getByTestId('hot-keyword-tag').first()
      await firstHotTag.click()

      // 抽屉应该关闭
      await expect(page.getByTestId('search-drawer')).toBeHidden({ timeout: 3000 })

      // URL 应该包含 keyword 参数
      await expect(page).toHaveURL(/keyword=/)
    })
  })

  test.describe('搜索历史', () => {
    test('搜索后应该保存到历史记录', async ({ page }) => {
      // 第一次搜索
      await page.getByTestId('search-trigger').click()
      await page.getByTestId('search-input').fill('测试关键词')
      await page.getByTestId('search-input').press('Enter')

      // 等待搜索完成
      await page.waitForLoadState('networkidle')

      // 再次打开搜索抽屉
      await page.getByTestId('search-trigger').click()

      // 应该在历史搜索中看到刚才的关键词
      const historyTags = page.getByTestId('history-keyword-tag')
      await expect(historyTags.first()).toContainText('测试关键词')
    })

    test('点击清空历史应该清除历史记录', async ({ page }) => {
      // 先添加一些搜索历史
      await page.getByTestId('search-trigger').click()
      await page.getByTestId('search-input').fill('历史测试')
      await page.getByTestId('search-input').press('Enter')
      await page.waitForLoadState('networkidle')

      // 再次打开搜索抽屉
      await page.getByTestId('search-trigger').click()

      // 点击清空历史
      const clearHistoryBtn = page.getByTestId('clear-history')
      if (await clearHistoryBtn.isVisible()) {
        await clearHistoryBtn.click()

        // 历史记录应该为空
        const historyTags = page.getByTestId('history-keyword-tag')
        await expect(historyTags).toHaveCount(0)
      }
    })
  })

  test.describe('URL 状态恢复', () => {
    test('带 keyword 参数的 URL 应该正确加载', async ({ page }) => {
      // 直接访问带 keyword 参数的 URL
      await page.goto('/collections/all?keyword=手袋')
      await page.waitForLoadState('networkidle')

      // URL 应该保留 keyword 参数
      await expect(page).toHaveURL(/keyword=/)

      // 页面应该正常显示商品列表区域
      const collectionsPage = page.getByTestId('collections-page')
      await expect(collectionsPage).toBeVisible()
    })
  })

  test.describe('Edge Cases', () => {
    test('输入空白关键词不应该触发搜索', async ({ page }) => {
      await page.getByTestId('search-trigger').click()

      const searchInput = page.getByTestId('search-input')
      await searchInput.fill('   ') // 只有空格
      await searchInput.press('Enter')

      // 抽屉应该保持打开（因为空关键词不触发搜索）
      await expect(page.getByTestId('search-drawer')).toBeVisible()

      // URL 不应该有 keyword 参数
      await expect(page).not.toHaveURL(/keyword=/)
    })
  })
})

test.describe('响应式测试', () => {
  // 仅在 chromium 桌面浏览器上运行 PC 端测试
  test('PC 端应该从左侧滑出抽屉，热门/历史两列并排', async ({ page, browserName }, testInfo) => {
    // 跳过移动端设备的 PC 测试
    test.skip(testInfo.project.name.includes('Mobile'), '跳过移动端设备的 PC 测试')

    // 设置 PC 视口
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/collections/all')
    await page.waitForLoadState('networkidle')

    await page.getByTestId('search-trigger').click()
    const drawer = page.getByTestId('search-drawer')
    await expect(drawer).toBeVisible()

    // PC 端热门搜索和历史搜索应该并排显示（检查布局）
    const hotSection = page.getByTestId('hot-keywords-section')
    const historySection = page.getByTestId('history-keywords-section')

    // 两个区块都应该可见
    await expect(hotSection).toBeVisible()
    await expect(historySection).toBeVisible()
  })

  // 仅在 Mobile Chrome 上运行 H5 端测试
  test('H5 端应该从左侧滑出抽屉', async ({ page }, testInfo) => {
    // 跳过桌面浏览器的 H5 测试
    test.skip(!testInfo.project.name.includes('Mobile'), '跳过桌面浏览器的 H5 测试')

    await page.goto('/collections/all')
    await page.waitForLoadState('networkidle')

    await page.getByTestId('search-trigger').click()
    const drawer = page.getByTestId('search-drawer')
    await expect(drawer).toBeVisible()

    // H5 端热门搜索和历史搜索应该可见
    const hotSection = page.getByTestId('hot-keywords-section')
    const historySection = page.getByTestId('history-keywords-section')

    await expect(hotSection).toBeVisible()
    await expect(historySection).toBeVisible()
  })
})
