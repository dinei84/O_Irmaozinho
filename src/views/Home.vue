<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="bg-primary text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl font-bold mb-6">Bem-vindo ao O Irmãozinho</h1>
        <p class="text-xl mb-8 max-w-2xl mx-auto">Inspiração e produtos para sua jornada de fé.</p>
        <div class="flex flex-wrap justify-center gap-4">
          <router-link to="/blog" class="bg-white text-primary px-6 py-2 rounded-lg font-medium">
            Ler Artigos
          </router-link>
          <router-link to="/loja" class="border-2 border-white text-white px-6 py-2 rounded-lg font-medium">
            Visitar Loja
          </router-link>
        </div>
      </div>
    </section>

    <!-- Featured Posts -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Artigos em Destaque</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="post in featuredPosts" :key="post.id" class="bg-white rounded-lg shadow-md overflow-hidden">
            <img :src="post.image" :alt="post.title" class="w-full h-40 object-cover">
            <div class="p-4">
              <h3 class="font-bold mb-2">{{ post.title }}</h3>
              <p class="text-sm text-gray-600 mb-3">{{ post.excerpt }}</p>
              <router-link :to="`/blog/${post.slug}`" class="text-primary text-sm font-medium">
                Ler mais →
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Produtos em Destaque</h2>
        <div class="grid md:grid-cols-4 gap-4">
          <div v-for="product in featuredProducts" :key="product.id" class="bg-white rounded-lg shadow-md overflow-hidden">
            <img :src="product.image" :alt="product.name" class="w-full h-40 object-cover">
            <div class="p-4">
              <h3 class="font-semibold">{{ product.name }}</h3>
              <div class="flex justify-between items-center mt-2">
                <span class="text-primary font-bold">{{ formatCurrency(product.price) }}</span>
                <button @click="addToCart(product)" class="text-primary">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'Home',
  
  setup() {
    const store = useStore();
    
    const featuredPosts = ref([
      {
        id: 1,
        title: 'O Poder da Oração',
        excerpt: 'Como a oração pode transformar sua vida espiritual.',
        image: '/images/blog/prayer.jpg',
        slug: 'o-poder-da-oracao'
      },
      {
        id: 2,
        title: 'Fé em Tempos de Crise',
        excerpt: 'Mantenha sua fé inabalável nas dificuldades.',
        image: '/images/blog/faith.jpg',
        slug: 'fe-em-tempos-de-crise'
      },
      {
        id: 3,
        title: 'A Importância da Comunhão',
        excerpt: 'Vida em comunidade para crescimento espiritual.',
        image: '/images/blog/community.jpg',
        slug: 'a-importancia-da-comunhao'
      }
    ]);
    
    const featuredProducts = ref([
      { id: 1, name: 'Bíblia de Estudo', price: 149.90, image: '/images/products/bible.jpg' },
      { id: 2, name: 'Camiseta Versículo', price: 59.90, image: '/images/products/tshirt.jpg' },
      { id: 3, name: 'Livro Devocional', price: 39.90, image: '/images/products/book.jpg' },
      { id: 4, name: 'Caneca Inspiradora', price: 34.90, image: '/images/products/mug.jpg' }
    ]);
    
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };
    
    const addToCart = (product) => {
      store.dispatch('cart/addToCart', { product, quantity: 1 });
      store.dispatch('notifications/addNotification', {
        type: 'success',
        message: 'Produto adicionado ao carrinho!',
        timeout: 3000
      });
    };
    
    return {
      featuredPosts,
      featuredProducts,
      formatCurrency,
      addToCart
    };
  }
};
</script>
