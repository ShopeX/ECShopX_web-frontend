export default {
  "sections": {
    "carousel-xxxx1": {
      "type": "carousel",
      "title": "轮播图",
      "settings": {
        "layout": "vertical"
      },
      "blocks": {
        "image-xxxx1": {
          "type": "image",
          "settings": {
            "layout": "vertical"
          }
        },
        "image-xxxx2": {
          "type": "image",
          "settings": {
            "layout": "vertical"
          }
        }
      },
      "block_order": ["image-xxxx1", "image-xxxx2"]
    },
    "featured-product": {
      "type": "featured-product",
      "title": "推荐商品",
      "description": "推荐商品",
      "items": [
        {
          "id": 1,
          "name": "商品1",
          "price": 100,
          "quantity": 1
        }
      ]
    }
  },
  "order": ["featured-product", "carousel-xxxx1"]
}