/**
 * 阿拉伯语（沙特阿拉伯）语言配置
 * 
 * 特点：
 * - RTL（从右到左）布局
 * - 阿拉伯数字
 * - 伊斯兰历法支持
 */

import type { ILocaleConfig, IMessages } from './types'

export const arSA: ILocaleConfig = {
  code: 'ar-SA',
  name: 'Arabic (Saudi Arabia)',
  nativeName: 'العربية (السعودية)',
  direction: 'rtl', // 从右到左
  currencySymbol: 'ر.س',
  currencyCode: 'SAR',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm:ss',
  enabled: true,
}

export const arSAMessages: IMessages = {
  common: {
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    submit: 'إرسال',
    delete: 'حذف',
    edit: 'تعديل',
    save: 'حفظ',
    search: 'بحث',
    reset: 'إعادة تعيين',
    loading: 'جاري التحميل...',
    noData: 'لا توجد بيانات',
    error: 'خطأ',
    success: 'نجح',
  },

  cart: {
    title: 'عربة التسوق',
    empty: 'عربة التسوق فارغة',
    addToCart: 'أضف إلى السلة',
    removeFromCart: 'إزالة من السلة',
    checkout: 'الدفع',
    total: 'المجموع',
    subtotal: 'المجموع الفرعي',
    quantity: 'الكمية',
    price: 'السعر',
    delete: 'حذف',
    selected: 'المحدد',
    selectAll: 'تحديد الكل',
  },

  product: {
    detail: 'تفاصيل المنتج',
    addToCart: 'أضف إلى السلة',
    buyNow: 'اشتر الآن',
    stock: 'المخزون',
    outOfStock: 'نفذت الكمية',
    price: 'السعر',
    originalPrice: 'السعر الأصلي',
    specifications: 'المواصفات',
  },

  user: {
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    register: 'تسجيل',
    profile: 'الملف الشخصي',
    orders: 'طلباتي',
    favorites: 'المفضلة',
    settings: 'الإعدادات',
  },
}

