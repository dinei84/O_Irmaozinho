import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './assets/css/main.css';

// Import components
import Home from './views/Home.vue';
import Blog from './views/Blog.vue';
import Post from './views/Post.vue';
import Shop from './views/Shop.vue';
import Product from './views/Product.vue';
import Cart from './views/Cart.vue';
import Checkout from './views/Checkout.vue';
import About from './views/About.vue';
import Contact from './views/Contact.vue';

// Initialize router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/blog', component: Blog },
    { path: '/blog/:slug', component: Post },
    { path: '/loja', component: Shop },
    { path: '/produto/:id', component: Product },
    { path: '/carrinho', component: Cart },
    { path: '/checkout', component: Checkout },
    { path: '/sobre', component: About },
    { path: '/contato', component: Contact },
  ],
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

// Create and mount the app
const app = createApp(App);
app.use(router);
app.mount('#app');
