import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/login.vue'),
  'utf8'
)

test('sms send validates image captcha before requesting code', () => {
  assert.match(pageSource, /if \(!phoneForm\.captchaCode\)/)
  assert.match(pageSource, /captcha\.value\?\.imageToken/)
  assert.match(pageSource, /phoneForm\.captchaCode,\s*captcha\.value\?\.imageToken \|\| ''/)
})

test('captcha refresh clears the local captcha input', () => {
  assert.match(pageSource, /phoneForm\.captchaCode = ''/)
})
