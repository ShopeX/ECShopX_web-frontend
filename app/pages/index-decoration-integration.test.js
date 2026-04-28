import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()

const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('homepage integrates preview mode, SSR decoration fetch, and renderer fallback', () => {
  const source = read('app/pages/index.vue')

  assert.match(source, /preview === 'true'/)
  assert.match(source, /useDecorationPreview/)
  assert.match(source, /useFetch\(['"]\/api\/decoration\/home['"]/)
  assert.match(source, /DecorationRenderer/)
  assert.match(source, /section-click|focusSection/)
  assert.match(
    source,
    /hasDecorationSections|shouldRenderDecoration|renderDsl/
  )
})

test('nuxt config exposes decoration env and preview route rule', () => {
  const source = read('nuxt.config.ts')

  assert.match(source, /decorationAdminOrigin/)
  assert.match(source, /decorationAdminOrigins/)
  assert.match(source, /routeRules/)
  assert.match(source, /preview/)
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
