<template>
  <header class="bg-white shadow-md fixed w-full z-50">
    <div class="container">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <router-link to="/" class="flex items-center">
          <img src="../../../html/assets/image1/001 (12).jpeg" alt="O Irmãozinho" class="h-12 w-auto">
          <span class="ml-3 text-xl font-bold text-primary">O Irmãozinho</span>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path" 
            :to="link.path"
            class="text-gray-700 hover:text-primary transition-colors font-medium"
            active-class="text-primary font-semibold">
            {{ link.label }}
          </router-link>
        </nav>

        <!-- Right side (search + cart) -->
        <div class="flex items-center space-x-4">
          <button @click="toggleCart" class="relative p-2 text-gray-600 hover:text-primary">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-10 0h10m0 0a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span v-if="itemCount > 0" class="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {{ itemCount }}
            </span>
          </button>
          
          <button @click="toggleMobileMenu" class="md:hidden p-2 text-gray-600 hover:text-primary">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMobileMenuOpen" class="md:hidden py-4 border-t mt-4">
        <nav class="flex flex-col space-y-3">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path" 
            :to="link.path"
            class="text-gray-700 hover:text-primary py-2"
            active-class="text-primary font-semibold"
            @click="closeMobileMenu">
            {{ link.label }}
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AppHeader',
  setup() {
    const store = useStore();
    const isMobileMenuOpen = ref(false);
    
    const navLinks = [
      { path: '/', label: 'Início' },
      { path: '/blog', label: 'Blog' },
      { path: '/loja', label: 'Loja' },
      { path: '/sobre', label: 'Sobre' },
      { path: '/contato', label: 'Contato' },
    ];
    
    const itemCount = computed(() => store.getters['cart/itemCount']);
    
    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    };
    
    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
    };
    
    const toggleCart = () => {
      store.dispatch('cart/toggleCart');
    };
    
    return {
      navLinks,
      isMobileMenuOpen,
      itemCount,
      toggleMobileMenu,
      closeMobileMenu,
      toggleCart
    };
  }
};
</script>
