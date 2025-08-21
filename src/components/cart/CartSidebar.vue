<template>
  <div 
    class="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50"
    :class="{ 'translate-x-0': isOpen, 'translate-x-full': !isOpen }"
  >
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b flex items-center justify-between">
        <h3 class="text-lg font-medium">Seu Carrinho</h3>
        <button @click="closeCart" class="text-gray-500 hover:text-gray-700">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="items.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-10 0h10m0 0a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <h4 class="mt-2 text-lg font-medium text-gray-900">Seu carrinho está vazio</h4>
          <p class="mt-1 text-gray-500">Comece adicionando alguns itens incríveis!</p>
        </div>

        <ul v-else class="divide-y divide-gray-200">
          <li v-for="item in items" :key="item.id" class="py-4 flex">
            <div class="flex-shrink-0 w-20 h-20 border border-gray-200 rounded-md overflow-hidden">
              <img :src="item.image" :alt="item.name" class="w-full h-full object-cover">
            </div>
            <div class="ml-4 flex-1">
              <div class="flex justify-between">
                <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
                <p class="ml-4 font-medium">{{ formatCurrency(item.price * item.quantity) }}</p>
              </div>
              <div class="mt-2 flex items-center justify-between">
                <div class="flex items-center">
                  <button @click="updateQuantity(item.id, item.quantity - 1)" 
                    class="text-gray-500 hover:text-gray-700"
                    :disabled="item.quantity <= 1">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span class="mx-2">{{ item.quantity }}</span>
                  <button @click="updateQuantity(item.id, item.quantity + 1)" 
                    class="text-gray-500 hover:text-gray-700">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <button @click="removeItem(item.id)" class="text-red-600 hover:text-red-800 text-sm">
                  Remover
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Footer -->
      <div v-if="items.length > 0" class="border-t border-gray-200 p-6">
        <div class="flex justify-between text-base font-medium text-gray-900 mb-4">
          <p>Subtotal</p>
          <p>{{ formatCurrency(subtotal) }}</p>
        </div>
        <button
          @click="checkout"
          class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
        >
          Finalizar Compra
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'CartSidebar',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const isOpen = computed(() => store.state.cart.isOpen);
    const items = computed(() => store.getters['cart/items']);
    const subtotal = computed(() => store.getters['cart/subtotal']);
    
    const closeCart = () => {
      store.dispatch('cart/toggleCart');
    };
    
    const removeItem = (productId) => {
      store.dispatch('cart/removeFromCart', productId);
    };
    
    const updateQuantity = (productId, quantity) => {
      if (quantity < 1) return;
      store.dispatch('cart/updateQuantity', { productId, quantity });
    };
    
    const checkout = () => {
      closeCart();
      router.push('/checkout');
    };
    
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    };
    
    return {
      isOpen,
      items,
      subtotal,
      closeCart,
      removeItem,
      updateQuantity,
      checkout,
      formatCurrency,
    };
  },
};
</script>
