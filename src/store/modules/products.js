// Mock data - In a real app, this would come from an API
const mockProducts = [
  {
    id: 1,
    name: 'Bíblia de Estudo',
    slug: 'biblia-de-estudo',
    price: 149.90,
    description: 'Bíblia de estudo com notas explicativas e referências cruzadas.',
    category: 'Livros',
    image: '/images/products/biblia-estudo.jpg',
    images: [
      '/images/products/biblia-estudo-1.jpg',
      '/images/products/biblia-estudo-2.jpg',
    ],
    featured: true,
    stock: 50,
    rating: 4.9,
    reviews: 128,
  },
  // More products will be added here
];

const state = {
  products: [],
  featuredProducts: [],
  categories: [
    { id: 1, name: 'Livros', slug: 'livros' },
    { id: 2, name: 'Camisetas', slug: 'camisetas' },
    { id: 3, name: 'Acessórios', slug: 'acessorios' },
    { id: 4, name: 'Presentes', slug: 'presentes' },
  ],
};

const mutations = {
  SET_PRODUCTS(state, products) {
    state.products = products;
  },
  SET_FEATURED_PRODUCTS(state, products) {
    state.featuredProducts = products;
  },
};

const actions = {
  async fetchProducts({ commit }) {
    // In a real app, this would be an API call
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      commit('SET_PRODUCTS', mockProducts);
      commit('SET_FEATURED_PRODUCTS', mockProducts.filter(p => p.featured));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  },
  
  async fetchProductById({ state }, productId) {
    // In a real app, this would be an API call
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return state.products.find(p => p.id === parseInt(productId)) || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },
  
  async fetchProductsByCategory({ state }, categorySlug) {
    // In a real app, this would be an API call with filtering
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return state.products.filter(p => p.category.toLowerCase() === categorySlug);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  },
};

const getters = {
  allProducts: state => state.products,
  featuredProducts: state => state.featuredProducts,
  categories: state => state.categories,
  getProductById: state => id => state.products.find(p => p.id === parseInt(id)),
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
