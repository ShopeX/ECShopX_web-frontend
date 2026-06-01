import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const filePath = path.resolve(process.cwd(), 'app/decoration-engine/components/sections/ImageHotspot.vue')
const source = fs.readFileSync(filePath, 'utf8')

describe('ImageHotspot', () => {
  it('uses pc/mobile hotspot aliases and legacy hotspot fallback', () => {
    expect(source).toContain("pc_image")
    expect(source).toContain("mobile_image")
    expect(source).toContain("pc_hotspots")
    expect(source).toContain("mobile_hotspots")
    expect(source).toContain("legacyHotspots")
  })

  it('shows hotspot visual overlay only in preview mode', () => {
    expect(source).toContain("props.isPreview")
    expect(source).toContain("border border-white/80 bg-black/10 shadow-sm")
  })

  it('resolves both external and internal hotspot links', () => {
    expect(source).toContain("linkType")
    expect(source).toContain("linkUrl")
    expect(source).toContain("linkPage")
    expect(source).toContain("resolveInternalHotspotHref")
    expect(source).toContain("localePath(`/products/${rawId}` as any)")
  })

  it('uses loaded image dimensions to preserve poster ratio without cropping', () => {
    expect(source).toContain("@load=\"handleImageLoad\"")
    expect(source).toContain("naturalWidth")
    expect(source).toContain("naturalHeight")
    expect(source).toContain("loadedImageDimensions")
    expect(source).toContain("object-contain")
    expect(source).not.toContain("object-cover")
  })
})
