const state = {
  items: [],
  isOpen: false,
};

const mutations = {
  ADD_ITEM(state, { product, quantity = 1 }) {
    const existingItem = state.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      state.items.push({
        ...product,
        quantity,
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(state.items));
  },
  
  REMOVE_ITEM(state, productId) {
    state.items = state.items.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(state.items));
  },
  
  UPDATE_QUANTITY(state, { productId, quantity }) {
    const item = state.items.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
    }
    localStorage.setItem('cart', JSON.stringify(state.items));
  },
  
  CLEAR_CART(state) {
    state.items = [];
    localStorage.removeItem('cart');
  },
  
  TOGGLE_CART(state) {
    state.isOpen = !state.isOpen;
  },
  
  SET_CART(state, items) {
    state.items = items || [];
  },
};

const actions = {
  addToCart({ commit }, { product, quantity = 1 }) {
    commit('ADD_ITEM', { product, quantity });
  },
  
  removeFromCart({ commit }, productId) {
    commit('REMOVE_ITEM', productId);
  },
  
  updateQuantity({ commit }, { productId, quantity }) {
    commit('UPDATE_QUANTITY', { productId, quantity });
  },
  
  clearCart({ commit }) {
    commit('CLEAR_CART');
  },
  
  toggleCart({ commit }) {
    commit('TOGGLE_CART');
  },
};

const getters = {
  items: state => state.items,
  isOpen: state => state.isOpen,
  itemCount: state => state.items.reduce((total, item) => total + item.quantity, 0),
  subtotal: state => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
  totalItems: state => state.items.reduce((total, item) => total + item.quantity, 0),
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
