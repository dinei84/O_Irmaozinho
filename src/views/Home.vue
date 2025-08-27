<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="bg-primary text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl font-bold mb-6">Bem-vindo ao O Irmãozinho</h1>
        <p class="text-xl mb-8 max-w-2xl mx-auto">Inspiração e produtos para sua jornada de fé.</p>
        <div class="flex flex-wrap justify-center gap-4">
          <router-link to="/blog" class="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Ler Artigos
          </router-link>
          <router-link to="/loja" class="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-primary transition-colors">
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
            <div class="bg-gray-200 h-40 flex items-center justify-center">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <p class="text-gray-500 text-sm">Imagem do artigo</p>
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-bold mb-2">{{ post.title }}</h3>
              <p class="text-sm text-gray-600 mb-3">{{ post.excerpt }}</p>
              <router-link :to="`/blog/${post.slug}`" class="text-primary text-sm font-medium hover:text-primary-dark">
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
            <div class="bg-gray-200 h-40 flex items-center justify-center">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <p class="text-gray-500 text-sm">Imagem do produto</p>
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-semibold">{{ product.name }}</h3>
              <div class="flex justify-between items-center mt-2">
                <span class="text-primary font-bold">{{ formatCurrency(product.price) }}</span>
                <button @click="addToCart(product)" class="text-primary hover:text-primary-dark transition-colors">
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
      store.dispatch('cart/addToCart', {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
      store.dispatch('notifications/addNotification', {
        type: 'success',
        message: `${product.name} adicionado ao carrinho!`
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

<style scoped>
/* Estilos específicos para a página home */
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

/* Estilos para os cards de artigos e produtos */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.rounded-lg {
  border-radius: 0.5rem;
}

/* Estilos para as imagens placeholder */
.object-cover {
  object-fit: cover;
}

/* Estilos para os botões */
.border-2 {
  border-width: 2px;
}

/* Estilos para o grid responsivo */
.grid {
  display: grid;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.md\:grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.md\:grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

/* Estilos para flexbox */
.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

/* Estilos para espaçamento */
.gap-4 {
  gap: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mb-12 {
  margin-bottom: 3rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

/* Estilos para padding */
.p-4 {
  padding: 1rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-16 {
  padding-top: 4rem;
  padding-bottom: 4rem;
}

.py-20 {
  padding-top: 5rem;
  padding-bottom: 5rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

/* Estilos para texto */
.text-center {
  text-align: center;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

/* Estilos para cores */
.text-white {
  color: #ffffff;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

.bg-white {
  background-color: #ffffff;
}

/* Estilos para transições */
.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Estilos para o container */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
</style>
