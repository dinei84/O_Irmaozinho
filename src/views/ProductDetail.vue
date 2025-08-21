<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <!-- Product Not Found -->
    <div v-else-if="!product" class="text-center py-12">
      <h1 class="text-2xl font-bold mb-4">Produto não encontrado</h1>
      <router-link to="/loja" class="text-primary hover:underline">Voltar para a loja</router-link>
    </div>
    
    <!-- Product Content -->
    <div v-else>
      <!-- Breadcrumb -->
      <nav class="flex mb-6 text-sm text-gray-500">
        <router-link to="/" class="hover:text-primary">Início</router-link>
        <span class="mx-2">/</span>
        <router-link to="/loja" class="hover:text-primary">Loja</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900">{{ product.name }}</span>
      </nav>
      
      <div class="lg:grid lg:grid-cols-2 lg:gap-8">
        <!-- Product Image -->
        <div class="mb-8">
          <img 
            :src="product.image" 
            :alt="product.name" 
            class="w-full h-auto max-h-96 object-contain"
          >
        </div>
        
        <!-- Product Info -->
        <div>
          <h1 class="text-2xl font-bold mb-2">{{ product.name }}</h1>
          
          <!-- Price -->
          <div class="mb-4">
            <span class="text-2xl font-bold text-primary">
              {{ formatCurrency(product.price) }}
            </span>
            <span v-if="product.discount" class="ml-2 text-gray-500 line-through">
              {{ formatCurrency(product.originalPrice) }}
            </span>
          </div>
          
          <!-- Availability -->
          <div class="mb-6">
            <span v-if="product.stock > 0" class="text-green-600 font-medium">
              Em estoque ({{ product.stock }} unidades)
            </span>
            <span v-else class="text-red-600 font-medium">
              Esgotado
            </span>
          </div>
          
          <!-- Add to Cart -->
          <div class="flex items-center space-x-4 mb-6">
            <div class="flex items-center border rounded-md">
              <button 
                @click="quantity > 1 ? quantity-- : null"
                class="px-3 py-1 text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <input 
                type="number" 
                v-model.number="quantity"
                min="1" 
                :max="product.stock"
                class="w-12 text-center border-x border-gray-300 focus:outline-none"
              >
              <button 
                @click="quantity < product.stock ? quantity++ : null"
                class="px-3 py-1 text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            
            <button
              @click="addToCart"
              :disabled="product.stock === 0"
              class="flex-1 bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              Adicionar ao Carrinho
            </button>
          </div>
          
          <!-- Description -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="font-medium mb-2">Descrição</h3>
            <p class="text-gray-700">{{ product.description }}</p>
          </div>
        </div>
      </div>
      
      <!-- Related Products -->
      <div class="mt-16">
        <h2 class="text-xl font-bold mb-6">Produtos Relacionados</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="item in relatedProducts" :key="item.id" class="bg-white rounded-lg shadow overflow-hidden">
            <router-link :to="`/produto/${item.id}`">
              <img :src="item.image" :alt="item.name" class="w-full h-32 object-cover">
              <div class="p-3">
                <h3 class="font-medium text-sm">{{ item.name }}</h3>
                <p class="text-primary font-bold text-sm">{{ formatCurrency(item.price) }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'ProductDetail',
  
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    
    const loading = ref(true);
    const product = ref(null);
    const relatedProducts = ref([]);
    const quantity = ref(1);
    
    // Fetch product details
    const fetchProduct = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock product data - in a real app, this would come from an API
        const products = [
          {
            id: 1,
            name: 'Bíblia de Estudo',
            description: 'Bíblia de estudo com notas explicativas e referências cruzadas para melhor compreensão dos textos sagrados.',
            price: 149.90,
            originalPrice: 199.90,
            discount: 25,
            image: '/images/products/bible.jpg',
            stock: 10,
            category: 'biblia'
          },
          // Add more mock products as needed
        ];
        
        const foundProduct = products.find(p => p.id === parseInt(route.params.id));
        if (foundProduct) {
          product.value = foundProduct;
          // Mock related products
          relatedProducts.value = products.filter(p => p.id !== foundProduct.id).slice(0, 4);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // Add to cart
    const addToCart = () => {
      if (!product.value || product.value.stock === 0) return;
      
      store.dispatch('cart/addToCart', {
        product: product.value,
        quantity: quantity.value
      });
      
      store.dispatch('notifications/addNotification', {
        type: 'success',
        message: 'Produto adicionado ao carrinho!',
        timeout: 3000
      });
    };
    
    // Format currency
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };
    
    // Lifecycle hooks
    onMounted(() => {
      fetchProduct();
    });
    
    return {
      loading,
      product,
      relatedProducts,
      quantity,
      addToCart,
      formatCurrency
    };
  }
};
</script>
