import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()

const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('decoration DSL types define page and message contracts', () => {
  const filePath = path.resolve(cwd, 'app/types/decoration.ts')
  assert.ok(existsSync(filePath), 'app/types/decoration.ts should exist')

  const source = read('app/types/decoration.ts')
  assert.match(source, /export interface DecorationBlock/)
  assert.match(source, /export interface DecorationSection/)
  assert.match(
    source,
    /export type PageType = 'home' \| 'list' \| 'detail' \| 'custom' \| 'global'/
  )
  assert.match(source, /export interface DecorationDSL/)
  assert.match(source, /export type DecorationMessageType =/)
  assert.match(source, /'DECORATION_INIT'/)
  assert.match(source, /'DECORATION_UPDATE'/)
  assert.match(source, /'PREVIEW_READY'/)
  assert.match(source, /'SECTION_FOCUSED'/)
  assert.match(source, /'BLOCK_FOCUSED'/)
  assert.match(source, /'BLOCK_HIGHLIGHT'/)
  assert.match(source, /'BLOCK_RECT'/)
})

test('useDecorationPreview validates origins and handles init update ready focus and block highlight messages', () => {
  const filePath = path.resolve(cwd, 'app/composables/useDecorationPreview.ts')
  assert.ok(existsSync(filePath), 'app/composables/useDecorationPreview.ts should exist')

  const source = read('app/composables/useDecorationPreview.ts')
  assert.match(source, /window\.addEventListener\('message'/)
  assert.match(source, /event\.origin/)
  assert.match(source, /DECORATION_INIT/)
  assert.match(source, /DECORATION_UPDATE/)
  assert.match(source, /PREVIEW_READY/)
  assert.match(source, /SECTION_FOCUSED/)
  assert.match(source, /BLOCK_HIGHLIGHT/)
  assert.match(source, /BLOCK_RECT/)
  assert.match(source, /postMessage/)
})

test('decoration registry provides known section components to Nuxt app', () => {
  const filePath = path.resolve(cwd, 'app/plugins/decoration-registry.ts')
  assert.ok(existsSync(filePath), 'app/plugins/decoration-registry.ts should exist')

  const source = read('app/plugins/decoration-registry.ts')
  assert.match(source, /header/)
  assert.match(source, /footer/)
  assert.match(source, /carousel/)
  assert.match(source, /image-hotspot/)
  assert.match(source, /product-shelf/)
  assert.match(source, /nuxtApp\.provide\('decorationRegistry'/)
})

test('DecorationRenderer iterates ordered sections, skips disabled ones, and resolves via registry', () => {
  const filePath = path.resolve(cwd, 'app/components/decoration/DecorationRenderer.vue')
  assert.ok(existsSync(filePath), 'app/components/decoration/DecorationRenderer.vue should exist')

  const source = read('app/components/decoration/DecorationRenderer.vue')
  assert.match(source, /dsl\.order/)
  assert.match(source, /disabled/)
  assert.match(source, /decorationRegistry|sectionRegistry/)
  assert.match(source, /@click|section-click/)
  assert.match(source, /<component/)
})

for (const sectionName of [
  'Carousel',
  'ImageHotspot',
  'ProductShelf',
  'DecorationHeaderSection',
  'DecorationFooterSection',
]) {
  test(`${sectionName} decoration section component exists`, () => {
    const relativePath = `app/components/decoration/sections/${sectionName}.vue`
    assert.ok(existsSync(path.resolve(cwd, relativePath)), `${relativePath} should exist`)
  })
}
