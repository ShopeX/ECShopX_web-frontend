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

test('preview selection overlay is fixed and converts document rects to viewport rects', () => {
  assert.match(source, /fixed inset-0/)
  assert.match(source, /const overlayScrollX = ref\(0\)/)
  assert.match(source, /const overlayScrollY = ref\(0\)/)
  assert.match(source, /function toViewportRect/)
  assert.match(source, /rect\.top - overlayScrollY\.value/)
  assert.match(source, /rect\.left - overlayScrollX\.value/)
  assert.match(source, /window\.addEventListener\('scroll', updateOverlayMetrics/)
  assert.match(source, /window\.removeEventListener\('scroll', updateOverlayMetrics\)/)
})

test('preview selection overlay renders selected block action toolbar', () => {
  assert.match(source, /selectedChrome\.kind === 'block'/)
  assert.match(source, /selectedBlockActionsClass/)
  assert.match(source, /selectedBlockActionState/)
  assert.match(source, /handleSelectedBlockAction/)
  assert.match(source, /requestMoveBlock/)
  assert.match(source, /requestDuplicateBlock/)
  assert.match(source, /requestRemoveBlock/)
  assert.match(source, /selectedBlockActionState\.canMoveUp/)
  assert.match(source, /selectedBlockActionState\.canMoveDown/)
  assert.match(source, /selectedBlockActionState\.canRemove/)
})

test('preview selection overlay constrains section actions within each area', () => {
  assert.match(source, /selectedSectionActionState/)
  assert.match(source, /getSectionAreaOrder/)
  assert.match(source, /selectedSectionActionState\.canMoveUp/)
  assert.match(source, /selectedSectionActionState\.canMoveDown/)
  assert.match(source, /selectedSectionActionState\.canRemove/)
  assert.match(source, /resolveDecorationArea\(chrome\.sectionId\)/)
})

test('preview selection overlay hides duplicate for header and footer sections', () => {
  assert.match(source, /selectedSectionActionState\.canDuplicate/)
  assert.match(source, /v-if="selectedSectionActionState\.canDuplicate"/)
  assert.match(source, /area === 'template'/)
})
