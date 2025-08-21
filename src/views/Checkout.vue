<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-8">Finalizar Compra</h1>
    
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
      <!-- Checkout Form -->
      <div class="lg:w-2/3">
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <h2 class="text-lg font-medium mb-4">Informações de Contato</h2>
          <form @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input 
                  type="text" 
                  id="firstName" 
                  v-model="form.firstName"
                  required
                  class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                <input 
                  type="text" 
                  id="lastName" 
                  v-model="form.lastName"
                  required
                  class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>
            </div>
            
            <div class="mb-4">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input 
                type="email" 
                id="email" 
                v-model="form.email"
                required
                class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
            </div>
            
            <div class="mb-4">
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="form.phone"
                required
                class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                v-mask="'(##) #####-####'"
              >
            </div>
            
            <div class="border-t border-gray-200 my-6"></div>
            
            <h2 class="text-lg font-medium mb-4">Endereço de Entrega</h2>
            
            <div class="mb-4">
              <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input 
                type="text" 
                id="address" 
                v-model="form.address"
                required
                class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label for="number" class="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input 
                  type="text" 
                  id="number" 
                  v-model="form.number"
                  required
                  class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>
              <div>
                <label for="complement" class="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                <input 
                  type="text" 
                  id="complement" 
                  v-model="form.complement"
                  class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>
              <div>
                <label for="neighborhood" class="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <input 
                  type="text" 
                  id="neighborhood" 
                  v-model="form.neighborhood"
                  required
                  class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input 
                  type="text" 
                  id="city" 
                  v-model="form.city"
                  required
                  class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>
              <div>
                <label for="state" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                  id="state" 
                  v-model="form.state"
                  required
                  class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione</option>
                  <option v-for="state in states" :key="state" :value="state">{{ state }}</option>
                </select>
              </div>
              <div>
                <label for="zipCode" class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <input 
                  type="text" 
                  id="zipCode" 
                  v-model="form.zipCode"
                  v-mask="'#####-###'"
                  required
                  class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>
            </div>
            
            <div class="border-t border-gray-200 my-6"></div>
            
            <h2 class="text-lg font-medium mb-4">Método de Pagamento</h2>
            
            <div class="space-y-4 mb-6">
              <div 
                v-for="method in paymentMethods" 
                :key="method.id"
                class="flex items-center p-4 border rounded-md cursor-pointer"
                :class="{ 'border-primary bg-blue-50': selectedPayment === method.id }"
                @click="selectedPayment = method.id"
              >
                <input 
                  type="radio" 
                  :id="'payment' + method.id" 
                  :value="method.id"
                  v-model="selectedPayment"
                  class="h-4 w-4 text-primary focus:ring-primary"
                >
                <label :for="'payment' + method.id" class="ml-3 block text-sm font-medium text-gray-700">
                  {{ method.name }}
                </label>
                <img :src="method.icon" :alt="method.name" class="ml-auto h-6">
              </div>
            </div>
            
            <div v-if="selectedPayment === 'pix'" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p class="text-sm text-yellow-700">Após confirmar o pedido, você receberá o QR Code para pagamento via PIX.</p>
            </div>
            
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="terms" 
                v-model="form.terms"
                required
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              >
              <label for="terms" class="ml-2 block text-sm text-gray-700">
                Eu li e concordo com os <a href="/termos" class="text-primary hover:underline">Termos de Serviço</a> e <a href="/privacidade" class="text-primary hover:underline">Política de Privacidade</a>.
              </label>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Order Summary -->
      <div class="lg:w-1/3">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium mb-4">Resumo do Pedido</h2>
          
          <div class="space-y-4 mb-6">
            <div v-for="item in items" :key="item.id" class="flex">
              <img :src="item.image" :alt="item.name" class="w-16 h-16 object-cover rounded">
              <div class="ml-4 flex-1">
                <h3 class="font-medium">{{ item.name }}</h3>
                <p class="text-sm text-gray-500">Quantidade: {{ item.quantity }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium">{{ formatCurrency(item.price * item.quantity) }}</p>
              </div>
            </div>
          </div>
          
          <div class="border-t border-gray-200 pt-4">
            <div class="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span>Frete</span>
              <span>{{ formatCurrency(shipping) }}</span>
            </div>
            <div v-if="discount > 0" class="flex justify-between mb-2">
              <span>Desconto</span>
              <span class="text-green-600">-{{ formatCurrency(discount) }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>{{ formatCurrency(total) }}</span>
            </div>
          </div>
          
          <button
            @click="handleSubmit"
            :disabled="processing"
            class="w-full mt-6 bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-wait"
          >
            <span v-if="processing">Processando...</span>
            <span v-else>Confirmar Pedido</span>
          </button>
        </div>
        
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium mb-2">Política de Devolução</h3>
          <p class="text-sm text-gray-600">Você tem 7 dias a partir do recebimento para solicitar troca ou devolução.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'Checkout',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    const processing = ref(false);
    const selectedPayment = ref('credit_card');
    
    // Form data
    const form = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      terms: false
    });
    
    // Payment methods
    const paymentMethods = [
      { id: 'credit_card', name: 'Cartão de Crédito', icon: '/images/payment/credit-card.png' },
      { id: 'pix', name: 'PIX', icon: '/images/payment/pix.png' },
      { id: 'boleto', name: 'Boleto Bancário', icon: '/images/payment/boleto.png' }
    ];
    
    // Brazilian states
    const states = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];
    
    // Cart data
    const items = computed(() => store.getters['cart/items']);
    const subtotal = computed(() => store.getters['cart/subtotal']);
    const shipping = ref(15.90); // Fixed shipping for simplicity
    const discount = ref(0);
    const total = computed(() => subtotal.value + shipping.value - discount.value);
    
    // Handle form submission
    const handleSubmit = async () => {
      if (!form.value.terms) {
        store.dispatch('notifications/addNotification', {
          type: 'error',
          message: 'Você precisa aceitar os termos e condições para continuar',
          timeout: 3000
        });
        return;
      }
      
      processing.value = true;
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Redirect to success page with order ID
        const orderId = 'ORD' + Math.floor(Math.random() * 1000000);
        router.push(`/pedido/${orderId}/sucesso`);
        
        // Clear cart after successful order
        store.dispatch('cart/clearCart');
        
      } catch (error) {
        console.error('Error processing order:', error);
        store.dispatch('notifications/addNotification', {
          type: 'error',
          message: 'Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.',
          timeout: 5000
        });
      } finally {
        processing.value = false;
      }
    };
    
    // Format currency
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };
    
    // Auto-fill user data if available
    onMounted(() => {
      // In a real app, you would fetch user data from Vuex or an API
      const userData = store.state.user?.data;
      if (userData) {
        form.value = {
          ...form.value,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          ...(userData.address || {})
        };
      }
    });
    
    return {
      form,
      items,
      subtotal,
      shipping,
      discount,
      total,
      processing,
      selectedPayment,
      paymentMethods,
      states,
      handleSubmit,
      formatCurrency
    };
  }
};
</script>
