import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()

const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('Carousel section follows decoration plan contract', () => {
  const source = read('app/decoration-engine/components/sections/Carousel.vue')

  assert.match(source, /block_order/)
  assert.match(source, /interval/)
  assert.match(source, /showDots/)
  assert.match(source, /showArrows/)
  assert.match(source, /data-block-id/)
  assert.match(source, /data-section-id/)
  assert.match(source, /focusBlock/)
  assert.match(source, /DecorationBlockHost/)
  assert.match(source, /8cac7342\.cc2e46/)
})

test('ImageHotspot section follows decoration plan contract', () => {
  const source = read('app/decoration-engine/components/sections/ImageHotspot.vue')

  assert.match(source, /block_order/)
  assert.match(source, /shape/)
  assert.match(source, /circle/)
  assert.match(source, /rect/)
  assert.match(source, /label/)
  assert.match(source, /:block-id=/)
  assert.match(source, /:section-id=/)
  assert.match(source, /focusBlock/)
  assert.match(source, /DecorationBlockHost/)
  assert.match(source, /44646d39\.9bb1a6/)
})

test('ProductShelf section follows decoration plan contract', () => {
  const source = read('app/decoration-engine/components/sections/ProductShelf.vue')

  assert.match(source, /displayMode/)
  assert.match(source, /categoryId/)
  assert.match(source, /itemIds/)
  assert.match(source, /useAsyncData/)
  assert.match(source, /BCProductCard/)
  assert.match(source, /showPrice/)
  assert.match(source, /showAddCart/)
  assert.match(source, /grid-cols-/)
  assert.match(source, /c40a02ee\.c5c5f2|c40a02ee\.8bb820/)
})
