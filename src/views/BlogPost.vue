<template>
  <div v-if="loading" class="text-center py-12">
    <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
  
  <div v-else-if="!post" class="text-center py-12">
    <h1 class="text-2xl font-bold mb-4">Post não encontrado</h1>
    <router-link to="/blog" class="text-primary hover:underline">Voltar para o blog</router-link>
  </div>
  
  <article v-else class="max-w-3xl mx-auto px-4 py-8">
    <!-- Header -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ post.title }}</h1>
      
      <div class="flex items-center text-sm text-gray-500 mb-4">
        <img :src="post.author.avatar" :alt="post.author.name" class="w-10 h-10 rounded-full mr-3">
        <div>
          <p class="font-medium text-gray-900">{{ post.author.name }}</p>
          <div class="flex items-center">
            <time :datetime="post.publishedAt">{{ formatDate(post.publishedAt) }}</time>
            <span class="mx-2">•</span>
            <span>{{ post.readingTime }} min de leitura</span>
          </div>
        </div>
      </div>
      
      <img :src="post.image" :alt="post.title" class="w-full h-64 object-cover rounded-lg mb-4">
    </header>
    
    <!-- Content -->
    <div class="prose max-w-none">
      <Post 
        :title="post.title"
        :content="post.content"
        :date="new Date(post.publishedAt)"
        :renderHTML="true"
      />
    </div>
    
    <!-- Author Bio -->
    <div class="mt-12 pt-8 border-t border-gray-200">
      <div class="flex items-center">
        <img :src="post.author.avatar" :alt="post.author.name" class="w-16 h-16 rounded-full mr-4">
        <div>
          <h3 class="text-lg font-medium">{{ post.author.name }}</h3>
          <p class="text-gray-600">{{ post.author.bio }}</p>
        </div>
      </div>
    </div>
    
    <!-- Related Posts -->
    <div v-if="relatedPosts.length > 0" class="mt-12">
      <h2 class="text-2xl font-bold mb-6">Leia também</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div v-for="related in relatedPosts" :key="related.id" class="border rounded-lg overflow-hidden">
          <router-link :to="`/blog/${related.slug}`" class="block">
            <img :src="related.image" :alt="related.title" class="w-full h-40 object-cover">
          </router-link>
          <div class="p-4">
            <Post 
              :title="related.title"
              :content="related.excerpt"
              :date="new Date(related.publishedAt)"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Back to Blog -->
    <div class="mt-12 text-center">
      <router-link 
        to="/blog" 
        class="inline-flex items-center text-primary hover:text-primary-dark"
      >
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar para o blog
      </router-link>
    </div>
  </article>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Post from '../components/Post.vue';

export default {
  name: 'BlogPost',
  components: { Post },
  
  setup() {
    const route = useRoute();
    const loading = ref(true);
    const post = ref(null);
    const relatedPosts = ref([]);
    
    // Mock data - in a real app, this would come from an API
    const fetchPost = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock post data
        const posts = [
          {
            id: 1,
            slug: 'o-poder-da-oracao',
            title: 'O Poder da Oração Diária',
            excerpt: 'Como desenvolver uma vida de oração consistente e transformadora.',
            content: `
              <p>A oração é uma das práticas mais importantes na vida de um cristão. Através dela, nos conectamos com Deus e fortalecemos nossa fé.</p>
              <h2>Por que orar?</h2>
              <p>A oração não é apenas um dever religioso, mas um privilégio de conversar com o Criador do universo.</p>
              <p>Quando oramos, reconhecemos nossa dependência de Deus e abrimos nosso coração para Sua vontade.</p>
            `,
            image: '/images/blog/prayer.jpg',
            publishedAt: '2023-05-15',
            readingTime: 5,
            author: {
              name: 'Pastor João',
              avatar: '/images/authors/pastor-joao.jpg',
              bio: 'Pastor há 15 anos, apaixonado por ensinar a Palavra de Deus.'
            },
            categoryId: 1
          }
          // Add more mock posts as needed
        ];
        
        // Find post by slug
        const foundPost = posts.find(p => p.slug === route.params.slug);
        
        if (foundPost) {
          post.value = foundPost;
          
          // Get related posts (excluding current post)
          relatedPosts.value = posts
            .filter(p => p.id !== foundPost.id && p.categoryId === foundPost.categoryId)
            .slice(0, 2);
        }
        
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const formatDate = (dateString) => {
      const options = { day: '2-digit', month: 'long', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    };
    
    onMounted(() => {
      fetchPost();
    });
    
    return {
      loading,
      post,
      relatedPosts,
      formatDate
    };
  }
};
</script>
