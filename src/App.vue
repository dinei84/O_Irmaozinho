<template>
  <div class="min-h-screen flex flex-col bg-light">
    <AppHeader />
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
    <CartSidebar />
    <Notification />
  </div>
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import { useStore } from 'vuex';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import CartSidebar from '@/components/cart/CartSidebar.vue';
import Notification from '@/components/ui/Notification.vue';

export default defineComponent({
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
    CartSidebar,
    Notification,
  },
  setup() {
    const store = useStore();

    onMounted(() => {
      // Initialize cart from localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        store.commit('cart/SET_CART', JSON.parse(savedCart));
      }

      // Load products if not already loaded
      if (store.getters['products/allProducts'].length === 0) {
        store.dispatch('products/fetchProducts');
      }
    });

    return {};
  },
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
