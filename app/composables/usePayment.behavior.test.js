import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const paymentComposableSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/usePayment.ts'),
  'utf8'
)
const paymentPageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/payment/index.vue'),
  'utf8'
)
const paymentClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/PaymentApiClient.ts'),
  'utf8'
)

test('payment page keeps bank transfer form visible for bank transfer method selection', () => {
  assert.match(paymentPageSource, /const BANK_TRANSFER_METHOD_KEYWORDS = \[/)
  assert.match(
    paymentPageSource,
    /function isBankTransferMethod\(method: \{ code\?: string; id\?: string; name\?: string \}\)/
  )
  assert.match(paymentPageSource, /const isBankTransferSelected = computed\(\(\) => \{/)
  assert.match(paymentPageSource, /return !!method && isBankTransferMethod\(method\)/)
  assert.match(
    paymentPageSource,
    /<section class="flex flex-col gap-6" data-testid="payment-transfer-form">/
  )
  assert.match(paymentPageSource, /data-testid="payment-voucher-upload"/)
  assert.match(paymentPageSource, /if \(isBankTransferSelected\.value\) \{/)
})

test('payment composable does not reload order info when switching payment methods and polls for 60 seconds every 5 seconds', () => {
  assert.match(paymentComposableSource, /const POLL_INTERVAL_MS = 5000/)
  assert.match(paymentComposableSource, /const POLL_TIMEOUT_MS = 60 \* 1000/)
  assert.match(paymentComposableSource, /const COUNTDOWN_DEFAULT_MS = POLL_TIMEOUT_MS/)

  assert.match(
    paymentPageSource,
    /function selectPaymentMethod\(method: \{ code\?: string; id\?: string \}\) \{/
  )
  assert.match(
    paymentPageSource,
    /function selectPaymentMethod\(method: \{ code\?: string; id\?: string \}\) \{[\s\S]*if \(!nextPayType \|\| selectedPayType\.value === nextPayType\) return[\s\S]*selectedPayType\.value = nextPayType[\s\S]*\}/
  )
  assert.match(
    paymentPageSource,
    /watch\(paymentMethods,\s*\(methods\)\s*=>\s*\{[\s\S]*const nextPayType = methods\[0\]\?\.code \?\? methods\[0\]\?\.id[\s\S]*if \(nextPayType\) \{\s*selectedPayType\.value = nextPayType\s*\}[\s\S]*preferredMethodInitialized\.value = true[\s\S]*\}\)/
  )

  assert.match(paymentComposableSource, /function isPaymentSuccessStatus\(status: string\)/)
  assert.match(paymentComposableSource, /if \(isPaymentSuccessStatus\(status\)\) \{/)
  assert.doesNotMatch(paymentComposableSource, /if \(isPaymentFailureStatus\(status\)\) \{/)
  assert.match(
    paymentComposableSource,
    /if \(Date\.now\(\) - startedAt > POLL_TIMEOUT_MS\) \{[\s\S]*const hasPaid = await checkPaymentResult\(\)[\s\S]*if \(!hasPaid\) \{[\s\S]*payResult\.value = 'fail'/
  )
  assert.doesNotMatch(paymentComposableSource, /payResult\.value = 'timeout'/)
  assert.doesNotMatch(paymentComposableSource, /retry\(\) \{[\s\S]*payNow\(\)/)
  assert.doesNotMatch(
    paymentComposableSource,
    /if \(status && status !== 'pending_payment'\) \{[\s\S]*payResult\.value = 'success'/
  )
})

test('payment composable routes payment execution by platform and browser environment', () => {
  assert.match(paymentComposableSource, /export function resolvePaymentClientRuntime\(/)
  assert.match(paymentComposableSource, /platform:\s*width < 1024 \? 'h5' : 'pc'/)
  assert.match(paymentComposableSource, /isWechatBrowser:\s*\/micromessenger\/i\.test\(userAgent\)/)
  assert.match(paymentComposableSource, /isAlipayBrowser:\s*\/alipayclient\/i\.test\(userAgent\)/)
  assert.match(paymentComposableSource, /export function resolvePaymentExecutionType\(/)
  assert.match(
    paymentComposableSource,
    /if \(runtime\.platform === 'pc'\) \{\s*return 'qrcode'\s*\}/
  )
  assert.match(
    paymentComposableSource,
    /if \(runtime\.isWechatBrowser\) \{\s*return 'wechat_jsapi'\s*\}\s*return 'wechat_h5'/
  )
  assert.match(
    paymentComposableSource,
    /if \(runtime\.platform === 'pc'\) \{\s*return 'alipay_form'\s*\}\s*return 'alipay_wap'/
  )
  assert.match(
    paymentComposableSource,
    /const paymentForm = res\?\.payment \?\? res\?\.data\?\.payment \?\? ''/
  )
  assert.match(
    paymentComposableSource,
    /const executionType = resolvePaymentExecutionType\(\{[\s\S]*selectedPayType:\s*selectedPayType\.value[\s\S]*\}\)/
  )
  assert.match(paymentComposableSource, /case 'alipay_form':[\s\S]*submitPaymentForm\(/)
  assert.match(paymentComposableSource, /case 'wechat_jsapi':[\s\S]*invokeWeChatJsapiPay\(/)
  assert.match(paymentComposableSource, /case 'wechat_h5':[\s\S]*openPaymentUrl\(/)
  assert.match(paymentComposableSource, /case 'alipay_wap':[\s\S]*submitPaymentForm\(/)
})

test('payment page renders failure with result layout instead of modal', () => {
  assert.match(paymentPageSource, /v-if="payResult === 'fail'"/)
  assert.match(paymentPageSource, /data-testid="payment-fail"/)
  assert.match(paymentPageSource, /\{\{ \$t\('eab46cc2\.4548cc'\) \}\}/)
  assert.match(paymentPageSource, /@click="retry"/)
  assert.doesNotMatch(paymentPageSource, /<ECModal/)
})

test('payment page disables keepalive so stale pay state is not restored on re-entry', () => {
  assert.match(paymentPageSource, /definePageMeta\(\{[\s\S]*keepalive:\s*false,[\s\S]*\}\)/)
})

test('payment page loads offline bank accounts when offline pay method exists', () => {
  assert.match(paymentClientSource, /async getOfflineBankAccounts\(/)
  assert.match(paymentClientSource, /this\.http\('\/wxapp\/order\/offline\/backaccount'/)

  assert.match(
    paymentPageSource,
    /import \{ paymentApiClient \} from '~\/infrastructure\/http\/clients'/
  )
  assert.match(paymentPageSource, /const bankAccounts = ref<BankAccountOption\[]>\(\[\]\)/)
  assert.match(paymentPageSource, /async function loadOfflineBankAccounts\(\)/)
  assert.match(paymentPageSource, /await paymentApiClient\.getOfflineBankAccounts\(\)/)
  assert.match(
    paymentPageSource,
    /function mapOfflineBankAccounts\(response: any\): BankAccountOption\[]/
  )
  assert.match(paymentPageSource, /response\?\.data\?\.backaccount/)
  assert.match(paymentPageSource, /response\?\.data\?\.account_info/)
  assert.match(paymentPageSource, /item\?\.bank_account_name/)
  assert.match(paymentPageSource, /item\?\.bank_name/)
  assert.match(paymentPageSource, /item\?\.bank_account_no/)
  assert.match(
    paymentPageSource,
    /if \(methods\.some\(\(method\) => isBankTransferMethod\(method\)\)\) \{/
  )
  assert.match(paymentPageSource, /await loadOfflineBankAccounts\(\)/)
  assert.doesNotMatch(paymentPageSource, /const bankAccounts: BankAccountOption\[] = \[/)
})
