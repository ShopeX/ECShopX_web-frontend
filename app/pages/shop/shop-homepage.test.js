import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const itemTypesSource = readFileSync(
  path.resolve(process.cwd(), 'app/types/api/item.ts'),
  'utf8'
)
const itemClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/ItemApiClient.ts'),
  'utf8'
)
const homeDataSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useHomeData.ts'),
  'utf8'
)
const shopPagePath = path.resolve(process.cwd(), 'app/pages/shop/[id].vue')
const shopPageSource = existsSync(shopPagePath)
  ? readFileSync(shopPagePath, 'utf8')
  : ''

test('IItemListParams has optional distributor_id field', () => {
  assert.match(itemTypesSource, /distributor_id\?:\s*string/)
})

test('ItemApiClient.getItemList passes distributor_id query param when provided', () => {
  assert.match(itemClientSource, /distributor_id.*params\.distributor_id/)
})
