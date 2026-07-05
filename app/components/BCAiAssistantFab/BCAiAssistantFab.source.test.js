import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from 'vitest'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCAiAssistantFab/BCAiAssistantFab.vue'),
  'utf8'
)

test('AI assistant FAB follows enabled, client-only, and split-open contracts', () => {
  expect(source).toMatch(/defineOptions\(\{\s*name:\s*'BCAiAssistantFab'/)
  expect(source).toMatch(/isAiAssistantEnabled/)
  expect(source).toMatch(/resolveAiAssistantBackendUrl/)
  expect(source).toMatch(/resolveCompanyId/)
  expect(source).toMatch(/resolveDistributorIdFromRoute/)
  expect(source).toMatch(/buildAiAssistantOpenUrl/)
  expect(source).toMatch(/data-testid="ai-assistant-fab"/)
  expect(source).toMatch(/<ClientOnly>/)
  expect(source).toMatch(/mounted\.value/)
  expect(source).toMatch(/isMobileWebUserAgent\(window\.navigator\.userAgent\)/)
  expect(source).toMatch(/router\.push\(localePath\('\/ai-assistant'\)\)/)
  expect(source).toMatch(/openAiAssistantInNewWindow/)
  expect(source).toMatch(/window\.location\.href\s*=\s*assistantUrl\.value/)
  expect(source).toMatch(/catch/)
})
