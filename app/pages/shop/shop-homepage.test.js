import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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
let shopPageSource = ''
try {
  shopPageSource = readFileSync(
    path.resolve(process.cwd(), 'app/pages/shop/[id].vue'),
    'utf8'
  )
} catch (_) {}

test('IItemListParams has optional distributor_id field', () => {
  assert.match(itemTypesSource, /distributor_id\?:\s*string/)
})
