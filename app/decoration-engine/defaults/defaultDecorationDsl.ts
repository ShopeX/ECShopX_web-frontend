import type { DecorationBlock, DecorationDSL, DecorationSection } from '~/decoration-engine/types/decoration'

type DefaultBlockInput = {
  type: string
  settings?: Record<string, unknown>
}

function createSection(
  id: string,
  type: string,
  options: {
    title?: string
    settings?: Record<string, unknown>
    blocks?: DefaultBlockInput[]
  } = {}
): DecorationSection {
  const blocks: Record<string, DecorationBlock> = {}
  const block_order: string[] = []

  ;(options.blocks || []).forEach((block, index) => {
    const blockId = `${id}-block-${index + 1}`
    blocks[blockId] = {
      type: block.type,
      disabled: false,
      settings: block.settings || {},
    }
    block_order.push(blockId)
  })

  return {
    type,
    title: options.title || '',
    disabled: false,
    settings: options.settings || {},
    blocks,
    block_order,
  }
}

function createDsl(pageType: DecorationDSL['pageType'], pageId: string, sections: Record<string, DecorationSection>): DecorationDSL {
  return {
    pageType,
    pageId,
    sections,
    order: Object.keys(sections),
  }
}

export function createDefaultHeaderDecorationDsl(): DecorationDSL {
  return createDsl('header', 'header', {
    header: createSection('header', 'header', {
      settings: {
        logo_position: 'center',
        full_width: false,
        enable_language_selector: true,
        padding_top: 'xs',
        padding_bottom: 'xs',
        color_scheme: 'scheme-1',
      },
    }),
  })
}

export function createDefaultFooterDecorationDsl(): DecorationDSL {
  return createDsl('footer', 'footer', {
    footer: createSection('footer', 'footer', {
      settings: {
        full_width: false,
        padding_top: 'm',
        padding_bottom: 'm',
        color_scheme: 'scheme-3',
      },
      blocks: [
        {
          type: 'footer-text',
          settings: {
            title: '品牌介绍',
            content:
              '<p><strong>关于我们的品牌</strong></p><p>我们专注于提供高品质商品与贴心服务，为每一次购物带来更好的体验。</p>',
            column_span: 4,
          },
        },
        {
          type: 'footer-menu',
          settings: {
            title: '购物指南',
            menu: null,
            menu_items: [
              { label: '新品上市', url: '#' },
              { label: '热销商品', url: '#' },
              { label: '产品系列', url: '#' },
              { label: '优惠活动', url: '#' },
            ],
            column_span: 2,
          },
        },
        {
          type: 'footer-menu',
          settings: {
            title: '关于我们',
            menu: null,
            menu_items: [
              { label: '品牌故事', url: '#' },
              { label: '加入我们', url: '#' },
              { label: '新闻资讯', url: '#' },
              { label: '可持续发展', url: '#' },
            ],
            column_span: 2,
          },
        },
        {
          type: 'footer-menu',
          settings: {
            title: '客户服务',
            menu: null,
            menu_items: [
              { label: '联系我们', url: '#' },
              { label: '退换货说明', url: '#' },
              { label: '服务条款', url: '#' },
              { label: '配送政策', url: '#' },
            ],
            column_span: 2,
          },
        },
        {
          type: 'footer-text',
          settings: {
            title: '订阅我们的电子邮件',
            content: '<p>请留下您的邮箱以获取最新资讯。</p>',
            column_span: 4,
          },
        },
        {
          type: 'footer-image',
          settings: {
            image: '',
            link: '',
            alt: '页脚图片',
            column_span: 12,
          },
        },
      ],
    }),
  })
}

export function createDefaultHomeDecorationDsl(options: { pageId?: string; scene?: string } = {}): DecorationDSL {
  return {
    ...createDsl('home', String(options.pageId || 'home'), {
      'main-carousel': createSection('main-carousel', 'main-carousel', {
        title: '默认轮播',
        settings: {
          image_height: 'medium',
          enable_auto_play: true,
          interval: 3000,
          showDots: true,
          enable_arrow: true,
          full_width: true,
          padding_top: 'none',
          padding_bottom: 'none',
          color_scheme: 'scheme-1',
        },
        blocks: [{ type: 'image' }, { type: 'image' }, { type: 'image' }],
      }),
      'image-hotspot': createSection('image-hotspot', 'image-hotspot', {
        title: '默认热区',
        settings: {
          imageWidth: 1200,
          imageHeight: 520,
          full_width: false,
          padding_top: 'm',
          padding_bottom: 'm',
          color_scheme: 'scheme-2',
        },
      }),
      'product-tab-shelf': createSection('product-tab-shelf', 'product-tab-shelf', {
        title: '默认商品分组',
        settings: {
          title: '精选商品',
          intro: '<p>发现更多值得购买的好物</p>',
          columns: 4,
          size: 'medium',
          alignment: 'center',
          spacing: 'medium',
          show_price: true,
          show_add_cart: true,
          padding_top: 'm',
          padding_bottom: 'm',
          color_scheme: 'scheme-1',
        },
        blocks: [
          {
            type: 'product-tab',
            settings: {
              tab_label: '新品推荐',
              product_ids: [],
              limit: 8,
            },
          },
        ],
      }),
    }),
    meta: {
      version: 1,
      scene: options.scene || '1001',
    },
  } as DecorationDSL
}
