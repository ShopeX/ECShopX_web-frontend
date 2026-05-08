import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()

const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('homepage integrates preview mode, SSR decoration fetch, and renderer fallback', () => {
  const source = read('app/pages/index.vue')
  const renderer = read('app/decoration-engine/components/DecorationRenderer.vue')
  const layout = read('app/layouts/default.vue')

  assert.match(source, /useDecorationRouteContext/)
  assert.match(source, /useDecorationPageDslFetch/)
  assert.match(source, /useDecorationPreview/)
  assert.match(source, /DECORATION_PAGE_TYPE/)
  assert.match(source, /DecorationRenderer/)
  assert.match(source, /DefaultLayout/)
  assert.match(
    source,
    /hasDecorationSections|shouldRenderDecoration|renderDsl/
  )
  assert.match(renderer, /onSectionActivate/)
  assert.match(renderer, /focusSection/)
  assert.match(renderer, /useDecorationRouteContext/)
  assert.match(layout, /v-if="shouldRenderFooterDecoration"/)
  assert.doesNotMatch(layout, /<template v-if="!isDecorationRouteDesignMode">\s*<DecorationRenderer/)
})

test('decoration route + DSL fetch composables exist for multi-page reuse', () => {
  const routeCtx = read('app/decoration-engine/composables/useDecorationRouteContext.ts')
  const dslFetch = read('app/decoration-engine/composables/useDecorationPageDslFetch.ts')

  assert.match(routeCtx, /useDecorationRouteContext/)
  assert.match(routeCtx, /isDecorationPreviewRouteQuery/)
  assert.match(routeCtx, /isDecorationPreviewActiveOnRoute/)
  assert.match(routeCtx, /isEmbeddedDecorPreview/)
  assert.match(dslFetch, /useDecorationPageDslFetch/)
  assert.match(dslFetch, /options\.pageType/)
})

test('nuxt config exposes decoration env and decoration preview route rules', () => {
  const source = read('nuxt.config.ts')

  assert.match(source, /decorationAdminOrigins/)
  assert.doesNotMatch(source, /VITE_DECORATION_ADMIN_ORIGINS/)
  assert.match(source, /routeRules/)
  assert.match(source, /designMode=1/)
})

test('server decoration API routes exist for page and global dsl reads', () => {
  const pageRoutePath = path.resolve(cwd, 'app/server/api/decoration/[pageType].get.ts')
  const globalRoutePath = path.resolve(cwd, 'app/server/api/decoration/global.get.ts')

  assert.ok(existsSync(pageRoutePath), 'app/server/api/decoration/[pageType].get.ts should exist')
  assert.ok(existsSync(globalRoutePath), 'app/server/api/decoration/global.get.ts should exist')

  const pageRouteSource = read('app/server/api/decoration/[pageType].get.ts')
  const globalRouteSource = read('app/server/api/decoration/global.get.ts')

  assert.match(pageRouteSource, /pageType/)
  assert.match(pageRouteSource, /pageId/)
  assert.match(pageRouteSource, /decoration/)
  assert.match(globalRouteSource, /global/)
  assert.match(globalRouteSource, /decoration/)
})
