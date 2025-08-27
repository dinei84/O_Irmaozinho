<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-8">Seu Carrinho</h1>
    
    <div v-if="items.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-10 0h10m0 0a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      <h2 class="mt-2 text-lg font-medium">Seu carrinho está vazio</h2>
      <router-link 
        to="/loja" 
        class="mt-4 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
      >
        Continuar Comprando
      </router-link>
    </div>
    
    <div v-else class="lg:flex lg:space-x-8">
      <!-- Cart Items -->
      <div class="lg:w-2/3">
        <div class="bg-white shadow rounded-lg mb-6">
          <ul class="divide-y divide-gray-200">
            <li v-for="item in items" :key="item.id" class="p-4">
              <div class="flex">
                <img :src="item.image" :alt="item.name" class="w-20 h-20 object-cover rounded">
                <div class="ml-4 flex-1">
                  <div class="flex justify-between">
                    <h3 class="font-medium">{{ item.name }}</h3>
                    <p class="font-bold">{{ formatCurrency(item.price * item.quantity) }}</p>
                  </div>
                  <div class="mt-2 flex items-center">
                    <button 
                      @click="updateQuantity(item.id, item.quantity - 1)"
                      class="text-gray-500 hover:text-gray-700"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span class="mx-2">{{ item.quantity }}</span>
                    <button 
                      @click="updateQuantity(item.id, item.quantity + 1)"
                      class="text-gray-500 hover:text-gray-700"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <button 
                    @click="removeItem(item.id)" 
                    class="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
        
        <div class="bg-white shadow rounded-lg p-4">
          <h3 class="font-medium mb-4">Cupom de desconto</h3>
          <div class="flex">
            <input 
              type="text" 
              v-model="couponCode"
              placeholder="Código do cupom"
              class="flex-1 border rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
            <button 
              @click="applyCoupon"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-r-md hover:bg-gray-200"
            >
              Aplicar
            </button>
          </div>
          <p v-if="couponError" class="mt-2 text-sm text-red-600">{{ couponError }}</p>
          <p v-if="couponSuccess" class="mt-2 text-sm text-green-600">{{ couponSuccess }}</p>
        </div>
      </div>
      
      <!-- Order Summary -->
      <div class="lg:w-1/3 mt-6 lg:mt-0">
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium mb-4">Resumo do Pedido</h3>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span>{{ formatCurrency(subtotal) }}</span>
            </div>
            <div v-if="discount > 0" class="flex justify-between">
              <span>Desconto</span>
              <span class="text-green-600">-{{ formatCurrency(discount) }}</span>
            </div>
            <div class="border-t border-gray-200 my-2"></div>
            <div class="flex justify-between font-bold">
              <span>Total</span>
              <span>{{ formatCurrency(total) }}</span>
            </div>
          </div>
          
          <button
            @click="proceedToCheckout"
            class="w-full mt-6 bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark"
          >
            Finalizar Compra
          </button>
          
          <p class="mt-4 text-sm text-gray-500">
            Ao finalizar a compra, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </div>
        
        <div class="mt-6 bg-white shadow rounded-lg p-6">
          <h3 class="font-medium mb-2">Métodos de Pagamento</h3>
          <div class="flex space-x-4">
            <img :src="visaIcon" alt="Visa" class="h-8">
            <img :src="mastercardIcon" alt="Mastercard" class="h-8">
            <img :src="pixIcon" alt="Pix" class="h-8">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import visaIcon from '@/assets/images/payment/visa.svg';
import mastercardIcon from '@/assets/images/payment/mastercard.svg';
import pixIcon from '@/assets/images/payment/pix.svg';

export default {
  name: 'Cart',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    const couponCode = ref('');
    const couponError = ref('');
    const couponSuccess = ref('');
    
    // Cart data
    const items = computed(() => store.getters['cart/items']);
    const subtotal = computed(() => store.getters['cart/subtotal']);
    const discount = ref(0);
    const total = computed(() => subtotal.value - discount.value);
    
    // Cart actions
    const updateQuantity = (productId, quantity) => {
      if (quantity < 1) return;
      store.dispatch('cart/updateQuantity', { productId, quantity });
    };
    
    const removeItem = (productId) => {
      store.dispatch('cart/removeFromCart', productId);
    };
    
    // Coupon logic
    const applyCoupon = () => {
      // Simple coupon validation
      if (!couponCode.value) {
        couponError.value = 'Por favor, insira um código de cupom';
        return;
      }
      
      // Mock API call
      setTimeout(() => {
        if (couponCode.value.toLowerCase() === 'bemvindo10') {
          discount.value = subtotal.value * 0.1; // 10% discount
          couponSuccess.value = 'Cupom aplicado com sucesso!';
          couponError.value = '';
        } else {
          couponError.value = 'Cupom inválido ou expirado';
          couponSuccess.value = '';
        }
      }, 500);
    };
    
    // Checkout
    const proceedToCheckout = () => {
      router.push('/checkout');
    };
    
    // Format currency
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };
    
    return {
      items,
      subtotal,
      discount,
      total,
      couponCode,
      couponError,
      couponSuccess,
      updateQuantity,
      removeItem,
      applyCoupon,
      proceedToCheckout,
      formatCurrency,
      visaIcon,
      mastercardIcon,
      pixIcon
    };
  }
};
</script>
