<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col md:flex-row gap-8">
      <!-- Filters Sidebar -->
      <div class="w-full md:w-64">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="font-bold mb-4">Filtros</h3>
          
          <!-- Categories -->
          <div class="mb-4">
            <h4 class="font-medium mb-2">Categorias</h4>
            <div class="space-y-1">
              <label v-for="cat in categories" :key="cat.id" class="flex items-center">
                <input type="checkbox" :value="cat.id" v-model="filters.categories" class="mr-2">
                <span>{{ cat.name }}</span>
              </label>
            </div>
          </div>
          
          <!-- Price Range -->
          <div class="mb-4">
            <h4 class="font-medium mb-2">Preço</h4>
            <div class="space-y-1">
              <label v-for="range in priceRanges" :key="range.id" class="flex items-center">
                <input type="radio" :value="range.id" v-model="filters.priceRange" class="mr-2">
                <span>{{ range.label }}</span>
              </label>
            </div>
          </div>
          
          <button @click="clearFilters" class="w-full bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm">
            Limpar Filtros
          </button>
        </div>
      </div>
      
      <!-- Products -->
      <div class="flex-1">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Produtos</h1>
          <select v-model="sortBy" class="border rounded p-2">
            <option value="newest">Mais Recentes</option>
            <option value="price_asc">Menor Preço</option>
            <option value="price_desc">Maior Preço</option>
          </select>
        </div>
        
        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
        
        <!-- Products Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="product in filteredProducts" :key="product.id" class="bg-white rounded-lg shadow overflow-hidden">
            <router-link :to="`/produto/${product.id}`">
              <img :src="product.image" :alt="product.name" class="w-full h-48 object-cover">
            </router-link>
            <div class="p-4">
              <h3 class="font-semibold">{{ product.name }}</h3>
              <div class="mt-2 flex justify-between items-center">
                <span class="text-lg font-bold text-primary">{{ formatCurrency(product.price) }}</span>
                <button 
                  @click="addToCart(product)"
                  class="text-primary hover:text-primary-dark"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No Results -->
        <div v-if="!loading && filteredProducts.length === 0" class="text-center py-12">
          <p class="text-gray-500">Nenhum produto encontrado.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'Shop',
  
  setup() {
    const store = useStore();
    const loading = ref(true);
    const products = ref([]);
    
    // Filters
    const filters = ref({
      categories: [],
      priceRange: null
    });
    
    const sortBy = ref('newest');
    
    // Mock data
    const categories = [
      { id: 1, name: 'Bíblias' },
      { id: 2, name: 'Livros' },
      { id: 3, name: 'Presentes' },
      { id: 4, name: 'Decoração' }
    ];
    
    const priceRanges = [
      { id: '0-50', label: 'Até R$ 50', min: 0, max: 50 },
      { id: '50-100', label: 'R$ 50 - R$ 100', min: 50, max: 100 },
      { id: '100-200', label: 'R$ 100 - R$ 200', min: 100, max: 200 },
      { id: '200+', label: 'Acima de R$ 200', min: 200, max: Infinity }
    ];
    
    // Fetch products
    const fetchProducts = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock products data
        products.value = [
          {
            id: 1,
            name: 'Bíblia de Estudo',
            price: 149.90,
            categoryIds: [1],
            image: '/images/products/bible.jpg',
            stock: 10
          },
          {
            id: 2,
            name: 'Livro Devocional',
            price: 39.90,
            categoryIds: [2],
            image: '/images/products/book.jpg',
            stock: 15
          },
          // Add more mock products as needed
        ];
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // Computed
    const filteredProducts = computed(() => {
      let result = [...products.value];
      
      // Filter by category
      if (filters.value.categories.length > 0) {
        result = result.filter(product => 
          product.categoryIds.some(id => filters.value.categories.includes(id))
        );
      }
      
      // Filter by price range
      if (filters.value.priceRange) {
        const range = priceRanges.find(r => r.id === filters.value.priceRange);
        if (range) {
          result = result.filter(product => 
            product.price >= range.min && product.price <= range.max
          );
        }
      }
      
      // Sort
      switch (sortBy.value) {
        case 'price_asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
        default:
          // Assuming newer products have higher IDs
          result.sort((a, b) => b.id - a.id);
      }
      
      return result;
    });
    
    // Methods
    const clearFilters = () => {
      filters.value = {
        categories: [],
        priceRange: null
      };
    };
    
    const addToCart = (product) => {
      store.dispatch('cart/addToCart', { product, quantity: 1 });
      store.dispatch('notifications/addNotification', {
        type: 'success',
        message: 'Produto adicionado ao carrinho!',
        timeout: 3000
      });
    };
    
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };
    
    // Lifecycle
    onMounted(() => {
      fetchProducts();
    });
    
    return {
      loading,
      products,
      categories,
      priceRanges,
      filters,
      sortBy,
      filteredProducts,
      clearFilters,
      addToCart,
      formatCurrency
    };
  }
};
</script>
