import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/login.vue'),
  'utf8'
)

test('sms login renders image captcha row and refresh affordance', () => {
  assert.match(pageSource, /phoneForm = reactive\(\{[\s\S]*captchaCode:\s*''/)
  assert.match(pageSource, /图片验证码/)
  assert.match(pageSource, /captcha\?\.imageData/)
  assert.doesNotMatch(pageSource, /captcha\.value\?\.imageData/)
  assert.match(pageSource, /refreshCaptcha/)
})

test('login page still keeps dual login modes', () => {
  assert.match(pageSource, /loginMode = ref<'phone' \| 'account'>\('phone'\)/)
  assert.match(pageSource, /switchToAccountLogin/)
  assert.match(pageSource, /switchToPhoneLogin/)
})
