# Login Captcha Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a visible image captcha step to SMS-code login, switch captcha fetching to `/wxapp/distributor/image/code`, and align the login page with the provided PC/H5 Figma designs without changing account-password login flow.

**Architecture:** Keep the existing `useAuth` and `useSmsCode` split, but fix the captcha endpoint and make the login page explicitly own the captcha input/rendering for the SMS login mode. Reuse the current login view structure rather than introducing a new shared captcha component, because the existing `BCCaptchaInput` styling does not match the login Figma.

**Tech Stack:** Nuxt 3, Vue 3 `<script setup>`, TypeScript, existing auth composables and HTTP clients, node:test structure tests, existing i18n locale JSON files.

---

### Task 1: Add failing tests for captcha endpoint and login page structure

**Files:**
- Create: `app/pages/account/login-captcha-api.test.js`
- Create: `app/pages/account/login-captcha-structure.test.js`
- Create: `app/pages/account/login-captcha-behavior.test.js`

**Step 1: Write the failing API test**

Assert `app/infrastructure/http/clients/AuthApiClient.ts` contains:

- `getCaptcha`
- `'/wxapp/distributor/image/code'`

**Step 2: Run test to verify it fails**

Run: `node --test app/pages/account/login-captcha-api.test.js`

Expected: FAIL because the file still points at `/wxapp/member/image/code`.

**Step 3: Write the failing structure test**

Assert `app/pages/account/login.vue` contains:

- `phoneForm.captchaCode`
- `图片验证码`
- captcha image rendering
- `refreshCaptcha`

**Step 4: Run test to verify it fails**

Run: `node --test app/pages/account/login-captcha-structure.test.js`

Expected: FAIL because the page does not render the captcha row yet.

**Step 5: Write the failing behavior test**

Assert `app/pages/account/login.vue`:

- validates `phoneForm.captchaCode`
- passes `phoneForm.captchaCode` to `sendSmsCode`
- passes `captcha.value?.imageToken`
- clears `phoneForm.captchaCode` when captcha refresh is triggered

**Step 6: Run test to verify it fails**

Run: `node --test app/pages/account/login-captcha-behavior.test.js`

Expected: FAIL because the page currently sends an empty captcha string.

### Task 2: Fix the captcha API endpoint

**Files:**
- Modify: `app/infrastructure/http/clients/AuthApiClient.ts`
- Test: `app/pages/account/login-captcha-api.test.js`

**Step 1: Update the captcha endpoint**

Change `getCaptcha()` to request:

```ts
'/wxapp/distributor/image/code'
```

Keep the method as `GET` and preserve no-cache behavior.

**Step 2: Run API test**

Run: `node --test app/pages/account/login-captcha-api.test.js`

Expected: PASS

**Step 3: Commit**

```bash
git add app/infrastructure/http/clients/AuthApiClient.ts app/pages/account/login-captcha-api.test.js
git commit -m "fix: use distributor captcha endpoint for login"
```

### Task 3: Add captcha state and validation to the login page

**Files:**
- Modify: `app/pages/account/login.vue`
- Test: `app/pages/account/login-captcha-behavior.test.js`

**Step 1: Add captcha form state**

Extend the SMS login form with:

```ts
captchaCode: ''
```

**Step 2: Update send-code validation**

Before sending SMS code, validate:

- phone exists
- phone format is valid
- `phoneForm.captchaCode` exists
- `captcha.value?.imageToken` exists

**Step 3: Pass real captcha values**

Update the send call to:

```ts
await sendSmsCode(phoneForm.phone, phoneForm.captchaCode, captcha.value?.imageToken || '')
```

**Step 4: Refresh behavior**

When captcha is refreshed, clear `phoneForm.captchaCode`.

**Step 5: Run behavior test**

Run: `node --test app/pages/account/login-captcha-behavior.test.js`

Expected: PASS

**Step 6: Commit**

```bash
git add app/pages/account/login.vue app/pages/account/login-captcha-behavior.test.js
git commit -m "feat: validate login sms flow with image captcha"
```

### Task 4: Render the captcha row in the SMS login UI

**Files:**
- Modify: `app/pages/account/login.vue`
- Test: `app/pages/account/login-captcha-structure.test.js`

**Step 1: Add the captcha row to phone-login mode**

Insert a row between phone input and SMS-code row:

- left: text input bound to `phoneForm.captchaCode`
- right: captcha image
- click image to refresh

**Step 2: Align with Figma**

PC:

- follow the existing bottom-border input rhythm
- keep image area near `101x40`

H5:

- preserve the same row structure inside the current single-column layout

**Step 3: Avoid touching account-login mode**

Do not add captcha UI to the username/password flow.

**Step 4: Run structure test**

Run: `node --test app/pages/account/login-captcha-structure.test.js`

Expected: PASS

**Step 5: Commit**

```bash
git add app/pages/account/login.vue app/pages/account/login-captcha-structure.test.js
git commit -m "feat: render image captcha in sms login form"
```

### Task 5: Improve mode switching and initial captcha fetch

**Files:**
- Modify: `app/pages/account/login.vue`
- Test: `app/pages/account/login-captcha-behavior.test.js`

**Step 1: Fetch captcha when entering SMS login mode**

When switching to `phone` mode, request captcha if missing.

**Step 2: Reset state when switching**

Clear login errors and keep the SMS login captcha input consistent with the current token.

**Step 3: Refresh on explicit image click**

Ensure clicking the captcha image triggers `refreshCaptcha()` and clears the local input.

**Step 4: Run behavior test again**

Run: `node --test app/pages/account/login-captcha-behavior.test.js`

Expected: PASS and still green.

**Step 5: Commit**

```bash
git add app/pages/account/login.vue app/pages/account/login-captcha-behavior.test.js
git commit -m "feat: refresh login captcha on phone mode entry"
```

### Task 6: Add any required i18n strings and verify regressions

**Files:**
- Modify: `app/locales/zh-CN.json`
- Modify: `app/locales/en-US.json`
- Modify: `app/locales/ar.json`
- Test: `app/pages/account/login-captcha-api.test.js`
- Test: `app/pages/account/login-captcha-structure.test.js`
- Test: `app/pages/account/login-captcha-behavior.test.js`

**Step 1: Add precise captcha validation text if needed**

If no suitable existing key exists for “请输入图片验证码”, add one locale key in all three locale files.

**Step 2: Replace hardcoded strings if introduced**

Keep the login page on i18n text where reasonable.

**Step 3: Run focused tests**

Run:

```bash
node --test app/pages/account/login-captcha-api.test.js app/pages/account/login-captcha-structure.test.js app/pages/account/login-captcha-behavior.test.js
```

Expected: all PASS

**Step 4: Run nearby regression checks**

Run:

```bash
node --test app/pages/account/follow-stores/follow-stores-menu-gating.test.js app/pages/account/aftersales/aftersales-page-structure.test.js
```

Expected: PASS and no unrelated account-page regressions.

**Step 5: Commit**

```bash
git add app/pages/account/login.vue app/infrastructure/http/clients/AuthApiClient.ts app/locales/zh-CN.json app/locales/en-US.json app/locales/ar.json app/pages/account/login-captcha-api.test.js app/pages/account/login-captcha-structure.test.js app/pages/account/login-captcha-behavior.test.js
git commit -m "feat: add image captcha to sms login"
```
