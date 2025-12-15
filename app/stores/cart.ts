import { defineStore } from 'pinia'
import { cartApiClient } from '~/infrastructure/http/clients'
import { CartTransformer } from '~/infrastructure/transformers/cartTransformer'
import type { ICartItemModel } from '~/composables/useCart'
import { useCartUIStore } from './cartUI'

interface CartState {
  items: ICartItemModel[]
  initialized: boolean
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    initialized: false
  }),

  getters: {
    totalItems: (state) => state.items.reduce((total, item) => total + item.quantity.value, 0),

    totalPrice: (state) => {
      return state.items.reduce((total, item) => total + item.price.amount * item.quantity.value, 0)
    },

    estimatedTotal: (state) => {
      return state.items.reduce((total, item) => total + item.price.amount * item.quantity.value, 0)
    }
  },

  actions: {
    async loadCart() {
      const cartUI = useCartUIStore()
      cartUI.setLoading(true)
      try {
        const data = await cartApiClient.getCartList()
        this.items = CartTransformer.toModelList(data.items)
        this.initialized = true
        cartUI.updateLastUpdateTime()
      } catch (error) {
        console.error('Failed to load cart:', error)
      } finally {
        cartUI.setLoading(false)
      }
    },

    async addItem(params: {
      productId: string
      quantity: number
      specId?: string
    }) {
      const cartUI = useCartUIStore()
      cartUI.setLoading(true)
      try {
        await cartApiClient.addToCart({
          product_id: params.productId,
          quantity: params.quantity,
          spec_id: params.specId
        })
        await this.loadCart()
      } catch (error) {
        console.error('Failed to add item:', error)
        throw error
      } finally {
        cartUI.setLoading(false)
      }
    },

    async removeItem(itemId: string) {
      const cartUI = useCartUIStore()
      cartUI.setActionLoading(itemId, true)
      try {
        await cartApiClient.removeCartItem(itemId)
        await this.loadCart()
      } catch (error) {
        console.error('Failed to remove item:', error)
        throw error
      } finally {
        cartUI.setActionLoading(itemId, false)
      }
    },

    async updateQuantity(itemId: string, quantity: number) {
      const cartUI = useCartUIStore()
      cartUI.setActionLoading(itemId, true)
      try {
        await cartApiClient.updateCartItem(itemId, { quantity })
        await this.loadCart()
      } catch (error) {
        console.error('Failed to update quantity:', error)
        throw error
      } finally {
        cartUI.setActionLoading(itemId, false)
      }
    },

    async clearCart() {
      const cartUI = useCartUIStore()
      cartUI.setLoading(true)
      try {
        await cartApiClient.clearCart()
        this.items = []
      } catch (error) {
        console.error('Failed to clear cart:', error)
        throw error
      } finally {
        cartUI.setLoading(false)
      }
    }
  }
})
