import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const typesSource = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCShopHeader/types.ts'),
  'utf8'
)

const vuePath = path.resolve(process.cwd(), 'app/components/BCShopHeader/BCShopHeader.vue')
const vueSource = existsSync(vuePath) ? readFileSync(vuePath, 'utf8') : ''

const homeDataSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useHomeData.ts'),
  'utf8'
)

const shopPagePath = path.resolve(process.cwd(), 'app/pages/shop/[id].vue')
const shopPageSource = existsSync(shopPagePath) ? readFileSync(shopPagePath, 'utf8') : ''

test('BCShopHeaderProps defines required fields', () => {
  assert.match(typesSource, /distributorId:\s*string/)
  assert.match(typesSource, /logo:\s*string/)
  assert.match(typesSource, /name:\s*string/)
  assert.match(typesSource, /tagline:\s*string/)
  assert.match(typesSource, /categories:\s*string\[\]/)
  assert.match(typesSource, /followed\?:\s*boolean/)
})
