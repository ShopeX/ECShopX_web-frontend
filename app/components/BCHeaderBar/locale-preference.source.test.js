import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()
const source = readFileSync(path.resolve(cwd, 'app/components/BCHeaderBar/BCHeaderBar.vue'), 'utf8')

test('default header stores preferred locale and replaces route on language switch', () => {
  assert.match(source, /import \{ setPreferredLocale \} from ['"]~\/utils\/localePreference['"]/)
  assert.match(source, /setPreferredLocale\(localeCode\)/)
  assert.match(source, /navigateTo\(path,\s*\{\s*replace:\s*true\s*\}\)/)
})
