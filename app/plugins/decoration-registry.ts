import type { Component } from 'vue'
import Carousel from '~/components/decoration/sections/Carousel.vue'
import AnnouncementBar from '~/components/decoration/sections/AnnouncementBar.vue'
import DecorationFooterSection from '~/components/decoration/sections/DecorationFooterSection.vue'
import DecorationHeaderSection from '~/components/decoration/sections/DecorationHeaderSection.vue'
import ImageHotspot from '~/components/decoration/sections/ImageHotspot.vue'
import ProductShelf from '~/components/decoration/sections/ProductShelf.vue'

export type DecorationRegistry = Record<string, Component>

export const decorationRegistry: DecorationRegistry = {
  'announcement-bar': AnnouncementBar,
  header: DecorationHeaderSection,
  footer: DecorationFooterSection,
  carousel: Carousel,
  'image-hotspot': ImageHotspot,
  'product-shelf': ProductShelf,
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('decorationRegistry', decorationRegistry)
})
