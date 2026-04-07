import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const apiClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/AuthApiClient.ts'),
  'utf8'
)

test('login captcha api uses distributor image code endpoint', () => {
  assert.match(apiClientSource, /getCaptcha/)
  assert.match(apiClientSource, /\/wxapp\/distributor\/image\/code/)
})
