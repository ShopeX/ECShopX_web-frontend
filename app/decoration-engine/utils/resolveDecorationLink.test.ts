import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createDecorationLinkResolver,
  normalizeDecorationLink,
} from './resolveDecorationLink.ts'

const localePath = (path: string) => `/zh-CN${path}`
const resolver = createDecorationLinkResolver(localePath)

test('normalizeDecorationLink keeps object links', () => {
  const link = {
    linkType: 0,
    linkPage: 'product',
    id: '1001',
  }
  assert.deepEqual(normalizeDecorationLink(link), link)
})

test('normalizeDecorationLink maps legacy external string links', () => {
  assert.deepEqual(normalizeDecorationLink('https://example.com'), {
    linkType: 1,
    linkUrl: 'https://example.com',
    linkPage: '',
    id: '',
    title: '',
  })
})

test('resolveHref supports admin CompPickerLink internal pages', () => {
  const href = resolver.resolveHref({
    linkType: 0,
    linkPage: 'product',
    id: '1001',
  })

  assert.equal(href, '/zh-CN/products/1001')
})

test('resolveHref supports external links', () => {
  const href = resolver.resolveHref({
    linkType: 1,
    linkUrl: 'https://example.com/page',
  })

  assert.equal(href, 'https://example.com/page')
})

test('resolveHref is disabled in preview mode', () => {
  const href = resolver.resolveHref(
    {
      linkType: 1,
      linkUrl: 'https://example.com/page',
    },
    { preview: true }
  )

  assert.equal(href, undefined)
})
