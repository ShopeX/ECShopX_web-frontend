import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const filePath = path.resolve(process.cwd(), 'app/decoration-engine/components/sections/ImageHotspot.vue')
const source = fs.readFileSync(filePath, 'utf8')

describe('ImageHotspot', () => {
  it('uses pc/mobile image aliases and legacy fallback', () => {
    expect(source).toContain("pc_image")
    expect(source).toContain("mobile_image")
    expect(source).toContain("legacyImage")
    expect(source).toContain("imageUrl: pcImage || legacyImage")
  })
})
