import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const dockerfileSource = readFileSync(path.resolve(process.cwd(), 'Dockerfile'), 'utf8')

const requiredEnvKeys = [
  'NUXT_APP_NAME',
  'NUXT_APP_TITLE',
  'NUXT_APP_DESCRIPTION',
  'NUXT_PUBLIC_BUSINESS_MODE',
  'NUXT_PUBLIC_API_BASE',
  'NUXT_PUBLIC_API_TIMEOUT',
  'NUXT_PUBLIC_SAAS',
  'NUXT_PUBLIC_COMPANY_ID',
  'NUXT_PUBLIC_DEFAULT_COUNTRY_CODE',
  'NUXT_COOKIE_SECRET',
  'NUXT_COOKIE_NAME_TOKEN',
  'NUXT_PUBLIC_UPLOAD_URL',
  'NUXT_PUBLIC_UPLOAD_MAX_SIZE',
  'NUXT_PUBLIC_UPLOAD_ACCEPT',
  'NUXT_PUBLIC_CACHE_TTL',
]

test('dockerfile accepts nuxt env via build args for builder stage', () => {
  for (const key of requiredEnvKeys) {
    assert.match(dockerfileSource, new RegExp(`ARG ${key}`))
    assert.match(dockerfileSource, new RegExp(`ENV ${key}=\\$\\{${key}\\}`))
  }

  assert.match(dockerfileSource, /FROM base AS builder/)
  assert.match(dockerfileSource, /RUN pnpm build/)
})

test('dockerfile preserves host and port defaults for runtime', () => {
  assert.match(dockerfileSource, /ENV NODE_ENV=production/)
  assert.match(dockerfileSource, /ENV HOST=0\.0\.0\.0/)
  assert.match(dockerfileSource, /ENV PORT=3000/)
  assert.match(dockerfileSource, /CMD \["node", "\.output\/server\/index\.mjs"\]/)
})
