import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const defaultHeaderSource = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCHeaderBar/BCHeaderBar.vue'),
  'utf8'
)

const simpleHeaderSource = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCHeaderBar/BCHeaderBarSimple.vue'),
  'utf8'
)

test('default header validates token-backed auth state before routing user center', () => {
  assert.match(defaultHeaderSource, /userStore\.token && !userStore\.userInfo/)
  assert.match(defaultHeaderSource, /await userStore\.fetchUserInfo\(\)/)
  assert.match(defaultHeaderSource, /path:\s*localePath\('\/account\/login'\)/)
})

test('simple header also validates token-backed auth state before routing', () => {
  assert.match(simpleHeaderSource, /userStore\.token && !userStore\.userInfo/)
  assert.match(simpleHeaderSource, /await userStore\.fetchUserInfo\(\)/)
  assert.match(simpleHeaderSource, /path:\s*localePath\('\/account\/login'\)/)
})
