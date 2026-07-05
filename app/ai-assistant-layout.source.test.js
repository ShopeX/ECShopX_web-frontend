import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from 'vitest'

const source = readFileSync(path.resolve(process.cwd(), 'app/layouts/default.vue'), 'utf8')

test('default layout mounts AI assistant FAB only for normal storefront browsing', () => {
  expect(source).toMatch(/<BCAiAssistantFab v-if="shouldRenderAiAssistantFab"/)
  expect(source).toMatch(/shouldRenderAiAssistantFab/)
  expect(source).toMatch(/!isDecorationPreview\.value/)
  expect(source).toMatch(/!isDecorationRouteDesignMode\.value/)
  expect(source).toMatch(/route\.query\.designMode/)
  expect(source).toMatch(/includes\('\/ai-assistant'\)/)
})
