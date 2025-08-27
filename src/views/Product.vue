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
          <div class="bg-gray-200 rounded-lg p-8 text-center">
            <div class="text-6xl text-gray-400 mb-4">
              <svg class="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <p class="text-gray-600">Imagem do produto será carregada aqui</p>
          </div>
        </div>
        
        <!-- Product Info -->
        <div>
          <h1 class="text-2xl font-bold mb-2">{{ product.name }}</h1>
          
          <!-- Rating -->
          <div class="flex items-center mb-4">
            <div class="flex text-yellow-400">
              <svg v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <span class="ml-2 text-sm text-gray-600">{{ product.rating }} ({{ product.reviews }} avaliações)</span>
          </div>
          
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
          
          <!-- Category -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="font-medium mb-2">Categoria</h3>
            <span class="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {{ product.category }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Related Products -->
      <div class="mt-16">
        <h2 class="text-2xl font-bold mb-8">Produtos Relacionados</h2>
        <div class="grid md:grid-cols-4 gap-6">
          <div v-for="relatedProduct in relatedProducts" :key="relatedProduct.id" class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-gray-200 p-4 text-center">
              <div class="text-4xl text-gray-400 mb-2">
                <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <p class="text-gray-600 text-sm">Imagem do produto</p>
            </div>
            <div class="p-4">
              <h3 class="font-semibold mb-2">{{ relatedProduct.name }}</h3>
              <div class="flex justify-between items-center">
                <span class="text-primary font-bold">{{ formatCurrency(relatedProduct.price) }}</span>
                <button @click="addToCartFromRelated(relatedProduct)" class="text-primary">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </button>
              </div>
            </div>
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
  name: 'Product',
  
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    
    const loading = ref(true);
    const quantity = ref(1);
    
    // Get product from route params
    const product = computed(() => {
      const productId = parseInt(route.params.id);
      return store.getters['products/getProductById'](productId);
    });
    
    // Related products (same category)
    const relatedProducts = computed(() => {
      if (!product.value) return [];
      return store.getters['products/allProducts']
        .filter(p => p.category === product.value.category && p.id !== product.value.id)
        .slice(0, 4);
    });
    
    // Load product data
    const loadProduct = async () => {
      loading.value = true;
      try {
        await store.dispatch('products/fetchProducts');
        loading.value = false;
      } catch (error) {
        console.error('Error loading product:', error);
        loading.value = false;
      }
    };
    
    // Add to cart
    const addToCart = () => {
      if (product.value && quantity.value > 0) {
        store.dispatch('cart/addToCart', {
          id: product.value.id,
          name: product.value.name,
          price: product.value.price,
          image: product.value.image,
          quantity: quantity.value
        });
        
        // Show success notification
        store.dispatch('notifications/addNotification', {
          type: 'success',
          message: `${quantity.value}x ${product.value.name} adicionado ao carrinho!`
        });
        
        quantity.value = 1;
      }
    };
    
    // Add related product to cart
    const addToCartFromRelated = (relatedProduct) => {
      store.dispatch('cart/addToCart', {
        id: relatedProduct.id,
        name: relatedProduct.name,
        price: relatedProduct.price,
        image: relatedProduct.image,
        quantity: 1
      });
      
      store.dispatch('notifications/addNotification', {
        type: 'success',
        message: `${relatedProduct.name} adicionado ao carrinho!`
      });
    };
    
    // Format currency
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };
    
    onMounted(() => {
      loadProduct();
    });
    
    return {
      loading,
      product,
      quantity,
      relatedProducts,
      addToCart,
      addToCartFromRelated,
      formatCurrency
    };
  }
};
</script>

<style scoped>
/* Estilos específicos para a página de produto */
.bg-primary {
  background-color: #1e40af;
}

.bg-primary-dark {
  background-color: #1e3a8a;
}

.text-primary {
  color: #1e40af;
}

.hover\:bg-primary-dark:hover {
  background-color: #1e3a8a;
}

.hover\:text-primary:hover {
  color: #1e40af;
}
</style>
