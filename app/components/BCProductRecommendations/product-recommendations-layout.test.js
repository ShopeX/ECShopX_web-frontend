import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCProductRecommendations/BCProductRecommendations.vue'),
  'utf8'
)

test('pc recommendations keep five-column design width instead of flex stretching', () => {
  assert.match(source, /hidden lg:grid/)
  assert.match(source, /lg:grid-cols-5/)
  assert.doesNotMatch(source, /class="flex-1 flex flex-col items-start overflow-hidden"/)
})

test('mobile recommendations remain horizontal scroll cards', () => {
  assert.match(source, /lg:hidden overflow-x-auto scrollbar-hide/)
  assert.match(source, /w-\[165px\]/)
})
