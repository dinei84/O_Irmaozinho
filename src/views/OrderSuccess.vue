<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="mt-3 text-3xl font-extrabold text-gray-900">Pedido realizado com sucesso!</h1>
        <p class="mt-2 text-lg text-gray-600">Obrigado por comprar conosco.</p>
        <p class="mt-1 text-gray-500">Seu pedido #{{ orderId }} foi registrado e está sendo processado.</p>
      </div>

      <div class="mt-10 bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Resumo do Pedido</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">Detalhes do seu pedido e informações de entrega.</p>
        </div>
        
        <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl class="sm:divide-y sm:divide-gray-200">
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Número do pedido</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ orderId }}</dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Data do pedido</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ orderDate }}</dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Método de pagamento</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div class="flex items-center">
                  <span>{{ paymentMethod }}</span>
                  <img v-if="paymentIcon" :src="paymentIcon" :alt="paymentMethod" class="h-6 ml-2">
                </div>
                <p v-if="paymentMethod === 'PIX'" class="mt-2 text-sm text-gray-500">
                  O QR Code para pagamento foi enviado para o e-mail: {{ orderEmail }}
                </p>
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Endereço de entrega</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <p>{{ orderAddress.street }}, {{ orderAddress.number }}</p>
                <p v-if="orderAddress.complement">{{ orderAddress.complement }}</p>
                <p>{{ orderAddress.neighborhood }}</p>
                <p>{{ orderAddress.city }} - {{ orderAddress.state }}</p>
                <p>CEP: {{ orderAddress.zipCode }}</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Itens do Pedido</h3>
        </div>
        <div class="px-4 py-5 sm:p-0">
          <ul class="divide-y divide-gray-200">
            <li v-for="item in orderItems" :key="item.id" class="py-4 flex">
              <div class="flex-shrink-0">
                <img :src="item.image" :alt="item.name" class="w-20 h-20 rounded-md object-cover">
              </div>
              <div class="ml-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">{{ item.name }}</h4>
                  <p class="text-sm text-gray-500">Quantidade: {{ item.quantity }}</p>
                </div>
                <p class="text-sm font-medium text-gray-900">{{ formatCurrency(item.price * item.quantity) }}</p>
              </div>
            </li>
          </ul>
          
          <div class="mt-6 border-t border-gray-200 pt-6">
            <div class="flex justify-between text-base font-medium text-gray-900 mb-2">
              <p>Subtotal</p>
              <p>{{ formatCurrency(orderSummary.subtotal) }}</p>
            </div>
            <div class="flex justify-between text-sm text-gray-500 mb-2">
              <p>Frete</p>
              <p>{{ formatCurrency(orderSummary.shipping) }}</p>
            </div>
            <div v-if="orderSummary.discount > 0" class="flex justify-between text-sm text-green-600 mb-2">
              <p>Desconto</p>
              <p>-{{ formatCurrency(orderSummary.discount) }}</p>
            </div>
            <div class="flex justify-between text-lg font-bold text-gray-900 mt-4 pt-4 border-t border-gray-200">
              <p>Total</p>
              <p>{{ formatCurrency(orderSummary.total) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Próximos passos</h3>
          <ul class="space-y-4">
            <li class="flex items-start">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-6 w-6 rounded-full bg-green-100">
                  <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p class="ml-3 text-sm text-gray-700">
                <span class="font-medium">Confirmação de pagamento:</span> 
                {{ paymentMethod === 'PIX' ? 'Você receberá um e-mail com o QR Code para pagamento.' : 'Seu pagamento está sendo processado.' }}
              </p>
            </li>
            <li class="flex items-start">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100">
                  <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p class="ml-3 text-sm text-gray-700">
                <span class="font-medium">Preparação do pedido:</span> 
                Seu pedido será preparado para envio em até 2 dias úteis.
              </p>
            </li>
            <li class="flex items-start">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100">
                  <svg class="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <p class="ml-3 text-sm text-gray-700">
                <span class="font-medium">Envio:</span> 
                O prazo de entrega é de até 10 dias úteis para todo o Brasil.
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <router-link 
          to="/loja" 
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Continuar Comprando
        </router-link>
        <a 
          href="#" 
          class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Acompanhar Pedido
        </a>
      </div>

      <div class="mt-12 text-center">
        <h3 class="text-sm font-medium text-gray-900">Precisa de ajuda?</h3>
        <p class="mt-2 text-sm text-gray-500">
          Entre em contato conosco em 
          <a href="mailto:suporte@oirmaozinho.com.br" class="text-primary hover:text-primary-dark">suporte@oirmaozinho.com.br</a>
          ou pelo WhatsApp (11) 98765-4321
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'OrderSuccess',
  
  setup() {
    const route = useRoute();
    const orderId = ref(route.params.orderId || '123456');
    
    // Mock data - in a real app, this would come from an API or Vuex
    const orderDate = ref(new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    
    const paymentMethod = ref('PIX');
    const paymentIcon = ref('/images/payment/pix.png');
    
    const orderEmail = ref('cliente@exemplo.com');
    
    const orderAddress = ref({
      street: 'Rua Exemplo',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01001-000'
    });
    
    const orderItems = ref([
      {
        id: 1,
        name: 'Bíblia de Estudo',
        price: 149.90,
        quantity: 1,
        image: '/images/products/bible.jpg'
      },
      {
        id: 2,
        name: 'Livro Devocional',
        price: 39.90,
        quantity: 2,
        image: '/images/products/book.jpg'
      }
    ]);
    
    const orderSummary = computed(() => {
      const subtotal = orderItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = 15.90;
      const discount = 20.00; // Example discount
      const total = subtotal + shipping - discount;
      
      return { subtotal, shipping, discount, total };
    });
    
    // Format currency
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };
    
    // In a real app, you would fetch the order details using the orderId
    // For example: fetchOrderDetails(orderId.value);
    
    return {
      orderId,
      orderDate,
      paymentMethod,
      paymentIcon,
      orderEmail,
      orderAddress,
      orderItems,
      orderSummary,
      formatCurrency
    };
  }
};
</script>
