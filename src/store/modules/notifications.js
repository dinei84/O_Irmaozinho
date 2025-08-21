const state = {
  notifications: [],
};

const mutations = {
  ADD_NOTIFICATION(state, notification) {
    state.notifications.push({
      ...notification,
      id: Date.now(),
    });
  },
  
  REMOVE_NOTIFICATION(state, notificationId) {
    state.notifications = state.notifications.filter(n => n.id !== notificationId);
  },
  
  CLEAR_NOTIFICATIONS(state) {
    state.notifications = [];
  },
};

const actions = {
  addNotification({ commit }, { type = 'info', message, timeout = 5000 }) {
    const notification = {
      type,
      message,
      timeout,
    };
    
    const notificationId = Date.now();
    
    commit('ADD_NOTIFICATION', notification);
    
    // Auto-remove notification after timeout
    if (timeout > 0) {
      setTimeout(() => {
        commit('REMOVE_NOTIFICATION', notificationId);
      }, timeout);
    }
    
    return notificationId;
  },
  
  removeNotification({ commit }, notificationId) {
    commit('REMOVE_NOTIFICATION', notificationId);
  },
  
  clearNotifications({ commit }) {
    commit('CLEAR_NOTIFICATIONS');
  },
};

const getters = {
  notifications: state => state.notifications,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
