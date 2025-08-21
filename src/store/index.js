import { createStore } from 'vuex';
import cart from './modules/cart';
import products from './modules/products';
import notifications from './modules/notifications';

export default createStore({
  modules: {
    cart,
    products,
    notifications,
  },
  state: {
    isLoading: false,
  },
  mutations: {
    SET_LOADING(state, status) {
      state.isLoading = status;
    },
  },
  actions: {
    setLoading({ commit }, status) {
      commit('SET_LOADING', status);
    },
  },
  getters: {
    isLoading: (state) => state.isLoading,
  },
});
