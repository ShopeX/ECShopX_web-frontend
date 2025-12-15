<template>
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Left Column: Image Gallery -->
      <div class="space-y-4">
        <!-- Main Image -->
        <div class="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100 relative group">
          <img
            :src="selectedImage"
            alt="Product Image"
            class="h-full w-full object-cover object-center"
          />
          <button class="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
            <UIcon name="i-heroicons-heart" class="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <!-- Thumbnails -->
        <div class="grid grid-cols-4 gap-4">
          <button
            v-for="(image, index) in product.images"
            :key="index"
            class="aspect-[3/4] overflow-hidden rounded-md border-2 transition-all"
            :class="selectedImage === image ? 'border-black' : 'border-transparent hover:border-gray-300'"
            @click="selectedImage = image"
          >
            <img :src="image" class="h-full w-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Right Column: Product Details -->
      <div class="flex flex-col space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ product.title }}</h1>
          <p class="mt-2 text-sm text-gray-500">{{ product.subtitle }}</p>
        </div>

        <div class="text-2xl font-semibold text-gray-900">
          ${{ product.price }} {{ product.currency }}
        </div>

        <!-- Color Selector -->
        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-3">Color</h3>
          <div class="flex items-center space-x-3">
            <button
              v-for="color in product.colors"
              :key="color.name"
              class="w-8 h-8 rounded-full border border-gray-200 focus:outline-none ring-2 ring-offset-2 transition-all"
              :class="[
                color.class,
                selectedColor === color.name ? 'ring-black' : 'ring-transparent hover:ring-gray-300'
              ]"
              :aria-label="color.name"
              @click="selectedColor = color.name"
            ></button>
          </div>
        </div>

        <!-- Style Selector -->
        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-3">Style</h3>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="style in product.styles"
              :key="style"
              class="px-4 py-2 text-sm border rounded-md transition-all"
              :class="selectedStyle === style 
                ? 'border-black bg-black text-white' 
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'"
              @click="selectedStyle = style"
            >
              {{ style }}
            </button>
          </div>
        </div>

        <!-- Quantity and Actions -->
        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <div class="w-32">
             <UiQuantityInput v-model="quantity" :min="1" :max="99" />
          </div>
          <div class="flex-1 grid grid-cols-2 gap-4">
            <button 
              class="flex-1 px-6 py-3 text-sm font-medium text-red-500 bg-white border border-red-500 rounded-md hover:bg-red-50 transition-colors"
              @click="addToCart"
            >
              Add to cart
            </button>
            <button 
              class="flex-1 px-6 py-3 text-sm font-medium text-white bg-[#ea580c] rounded-md hover:bg-[#c2410c] transition-colors shadow-sm"
              @click="buyNow"
            >
              Buy now
            </button>
          </div>
        </div>

        <!-- Stock and Share -->
        <div class="flex items-center justify-between text-sm text-gray-600 border-b border-gray-100 pb-6">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
            <span>In stock</span>
          </div>
          <button class="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <UIcon name="i-heroicons-share" class="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>

        <!-- Description -->
        <div class="prose prose-sm text-gray-600">
          <p>{{ product.description }}</p>
        </div>

        <!-- Services -->
        <div class="grid grid-cols-3 gap-4 py-6 border-y border-gray-100">
          <div class="flex flex-col items-center text-center gap-2">
            <UIcon name="i-heroicons-building-storefront" class="w-6 h-6 text-gray-600" />
            <span class="text-xs text-gray-600">Store pickup</span>
          </div>
          <div class="flex flex-col items-center text-center gap-2">
            <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-gray-600" />
            <span class="text-xs text-gray-600">Easy returns</span>
          </div>
          <div class="flex flex-col items-center text-center gap-2">
            <UIcon name="i-heroicons-truck" class="w-6 h-6 text-gray-600" />
            <span class="text-xs text-gray-600">Free shipping</span>
          </div>
        </div>

        <!-- Accordion Sections -->
        <div class="space-y-1">
          <UAccordion :items="accordionItems" color="white" variant="ghost" :ui="{ item: { padding: 'py-4' } }">
            <template #default="{ item, open }">
              <UButton color="gray" variant="ghost" class="w-full flex justify-between items-center py-4 px-0 hover:bg-transparent hover:text-black text-gray-700 font-normal border-b border-gray-100 rounded-none">
                <div class="flex items-center gap-2">
                  <UIcon :name="item.icon" class="w-5 h-5" />
                  <span>{{ item.label }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-down" class="w-5 h-5 transition-transform" :class="[open && 'transform rotate-180']" />
              </UButton>
            </template>
            <template #item="{ item }">
              <div class="text-sm text-gray-500 pb-4 px-1">
                {{ item.content }}
              </div>
            </template>
          </UAccordion>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = route.params.id

// Mock Data
const product = ref({
  title: 'Beige Graphic Crop Tank – "CANDY" Print',
  subtitle: 'Fluffy texture',
  price: 18.99,
  currency: 'USD',
  description: 'Show off your confident vibe with this beige cropped tank featuring a bold "CANDY" graphic print. Designed with a sleeveless cut and snug fit, it\'s perfect for pairing with high-waist jeans, cargo pants, or skirts for a trendy streetwear look.',
  images: [
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529139574466-a302c27e3844?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=600&auto=format&fit=crop'
  ],
  colors: [
    { name: 'Black', class: 'bg-black' },
    { name: 'White', class: 'bg-white' }
  ],
  styles: ['Vintage black', 'Sky blue', 'Flame red', 'Khaki brown']
})

const selectedImage = ref(product.value.images[0])
const selectedColor = ref('Black')
const selectedStyle = ref('Vintage black')
const quantity = ref(1)

const cartStore = useCartStore()
const cartUI = useCartUIStore()
const toast = useToast()

const addToCart = async () => {
  try {
    await cartStore.addItem({
      productId: id as string,
      quantity: quantity.value,
      // specId: 'default' // In a real app, we would map selected options to a specId
    })
    toast.add({ title: 'Added to cart' })
  } catch (error) {
    toast.add({ title: 'Failed to add to cart', color: 'red' })
  }
}

const buyNow = async () => {
  await addToCart()
  cartUI.open()
}

const accordionItems = [
  {
    label: 'Free Shipping Over $100',
    icon: 'i-heroicons-check-badge',
    content: 'Enjoy free standard shipping on all orders over $100. We ship worldwide with reliable carriers.'
  },
  {
    label: 'Delivery in 5-6 Working Days',
    icon: 'i-heroicons-clock',
    content: 'Standard delivery takes 5-6 working days. Express shipping options are available at checkout.'
  },
  {
    label: 'Price Incl. VAT & Excl. Shipping',
    icon: 'i-heroicons-currency-dollar',
    content: 'All prices include VAT where applicable. Shipping costs are calculated at checkout based on your location.'
  }
]
</script>
