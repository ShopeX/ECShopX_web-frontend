/**
 * 美式英语语言配置
 */

import type { ILocaleConfig, IMessages } from './types'

export const enUS: ILocaleConfig = {
  code: 'en-US',
  name: 'English (United States)',
  nativeName: 'English (US)',
  direction: 'ltr',
  currencySymbol: '$',
  currencyCode: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: 'hh:mm:ss A',
  enabled: true,
}

export const enUSMessages: IMessages = {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    submit: 'Submit',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    search: 'Search',
    reset: 'Reset',
    loading: 'Loading...',
    noData: 'No Data',
    error: 'Error',
    success: 'Success',
  },

  cart: {
    title: 'Shopping Cart',
    empty: 'Cart is empty',
    addToCart: 'Add to Cart',
    removeFromCart: 'Remove from Cart',
    checkout: 'Checkout',
    total: 'Total',
    subtotal: 'Subtotal',
    quantity: 'Quantity',
    price: 'Price',
    delete: 'Delete',
    selected: 'Selected',
    selectAll: 'Select All',
  },

  product: {
    detail: 'Product Detail',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    stock: 'Stock',
    outOfStock: 'Out of Stock',
    price: 'Price',
    originalPrice: 'Original Price',
    specifications: 'Specifications',
  },

  user: {
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    profile: 'Profile',
    orders: 'My Orders',
    favorites: 'Favorites',
    settings: 'Settings',
  },
}

