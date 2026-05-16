import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/decoration-engine/components/DecorationPreviewSelectionOverlay.vue'),
  'utf8'
)

test('preview selection overlay uses block type labels for block labels', () => {
  assert.match(source, /function buildPreviewSelectionLabel/)
  assert.match(source, /function resolvePreviewLabel/)
  assert.match(source, /BLOCK_TRANSLATION_LABEL/)
  assert.match(source, /blocks\.header_product_list\.name/)
  assert.match(source, /BLOCK_TYPE_LABEL\[block\.type\]/)
  assert.match(source, /'footer-menu': '菜单'/)
  assert.match(source, /'footer-image': '图片'/)
  assert.match(source, /'footer-text': '文本'/)
})
