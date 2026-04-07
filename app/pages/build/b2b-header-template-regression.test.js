import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = process.cwd()
const b2bHeaderTemplatePath = path.resolve(
  repoRoot,
  'app/templateEngines/templates/b2b/header.ts'
)

test('b2b mode ships a local default header template for fallback rendering', () => {
  assert.equal(existsSync(b2bHeaderTemplatePath), true)

  const source = readFileSync(b2bHeaderTemplatePath, 'utf8')

  assert.match(source, /sections:\s*\{/)
  assert.match(source, /header:\s*\{/)
  assert.match(source, /type:\s*'header'/)
  assert.match(source, /order:\s*\[\s*'header'\s*\]/)
})
