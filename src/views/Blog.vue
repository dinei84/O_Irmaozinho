<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
      <p class="text-xl text-gray-600">Artigos e reflexões para sua vida espiritual</p>
    </div>
    
    <!-- Search and Filter -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="relative flex-1 max-w-xl">
          <input
            v-model="searchQuery"
            placeholder="Buscar artigos..."
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <svg class="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <select 
          v-model="selectedCategory"
          class="border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Todas as categorias</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <!-- No Results -->
    <div v-else-if="filteredPosts.length === 0" class="text-center py-12">
      <p class="text-gray-600">Nenhum artigo encontrado</p>
      <button 
        @click="resetFilters"
        class="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
      >
        Limpar filtros
      </button>
    </div>
    
    <!-- Blog Posts Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="post in paginatedPosts" :key="post.id" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <router-link :to="`/blog/${post.slug}`" class="block">
          <img :src="post.image" :alt="post.title" class="w-full h-48 object-cover">
        </router-link>
        <div class="p-6">
          <div class="flex items-center text-sm text-gray-500 mb-2">
            <span>{{ formatDate(post.publishedAt) }}</span>
            <span class="mx-2">•</span>
            <span>{{ post.readingTime }} min de leitura</span>
          </div>
          <Post 
            :title="post.title"
            :content="post.excerpt"
            :date="new Date(post.publishedAt)"
          />
          <div class="flex items-center mt-4">
            <img :src="post.author.avatar" :alt="post.author.name" class="w-10 h-10 rounded-full">
            <div class="ml-3">
              <p class="text-sm font-medium">{{ post.author.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="filteredPosts.length > 0" class="mt-12 flex justify-center">
      <nav class="flex items-center space-x-2">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-md border disabled:opacity-50"
        >
          &laquo;
        </button>
        
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          :class="{'bg-primary text-white': currentPage === page}"
          class="w-10 h-10 rounded-md border"
        >
          {{ page }}
        </button>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage >= totalPages"
          class="px-3 py-1 rounded-md border disabled:opacity-50"
        >
          &raquo;
        </button>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import Post from '../components/Post.vue';

export default {
  name: 'Blog',
  components: { Post },
  
  setup() {
    const loading = ref(true);
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const currentPage = ref(1);
    const postsPerPage = 6;
    
    // Mock data
    const categories = [
      { id: 1, name: 'Devocionais' },
      { id: 2, name: 'Estudos Bíblicos' },
      { id: 3, name: 'Vida Cristã' },
      { id: 4, name: 'Família' },
      { id: 5, name: 'Oração' }
    ];
    
    const posts = ref([
      {
        id: 1,
        title: 'O Poder da Oração Diária',
        excerpt: 'Como desenvolver uma vida de oração consistente e transformadora.',
        slug: 'o-poder-da-oracao-diaria',
        image: '/images/blog/prayer.jpg',
        categoryId: 5,
        publishedAt: '2023-05-15',
        readingTime: 5,
        author: {
          name: 'Pastor João',
          avatar: '/images/authors/pastor-joao.jpg'
        }
      },
      // Add more mock posts as needed
    ]);
    
    // Computed properties
    const filteredPosts = computed(() => {
      return posts.value.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchQuery.value.toLowerCase());
        
        const matchesCategory = !selectedCategory.value || 
                              post.categoryId === parseInt(selectedCategory.value);
        
        return matchesSearch && matchesCategory;
      });
    });
    
    const totalPages = computed(() => {
      return Math.ceil(filteredPosts.value.length / postsPerPage);
    });
    
    const paginatedPosts = computed(() => {
      const start = (currentPage.value - 1) * postsPerPage;
      const end = start + postsPerPage;
      return filteredPosts.value.slice(start, end);
    });
    
    // Methods
    const formatDate = (dateString) => {
      const options = { day: '2-digit', month: 'long', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    };
    
    const getCategoryName = (categoryId) => {
      const category = categories.find(cat => cat.id === categoryId);
      return category ? category.name : '';
    };
    
    const resetFilters = () => {
      searchQuery.value = '';
      selectedCategory.value = '';
      currentPage.value = 1;
    };
    
    // Simulate loading data
    onMounted(() => {
      setTimeout(() => {
        loading.value = false;
      }, 800);
    });
    
    // Watch for page changes
    watch(() => currentPage.value, () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    return {
      loading,
      searchQuery,
      selectedCategory,
      currentPage,
      categories,
      filteredPosts,
      paginatedPosts,
      totalPages,
      formatDate,
      getCategoryName,
      resetFilters
    };
  }
};
</script>
