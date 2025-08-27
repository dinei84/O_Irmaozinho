<template>
  <div class="fixed top-4 right-4 z-50 w-full max-w-sm space-y-4">
    <transition-group
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="rounded-lg p-4 shadow-lg"
        :class="{
          'bg-green-50': notification.type === 'success',
          'bg-red-50': notification.type === 'error',
          'bg-blue-50': notification.type === 'info',
          'bg-yellow-50': notification.type === 'warning',
        }"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <!-- Success Icon -->
            <svg v-if="getNotificationIcon(notification.type) === 'success-icon'" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <!-- Error Icon -->
            <svg v-else-if="getNotificationIcon(notification.type) === 'error-icon'" class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <!-- Warning Icon -->
            <svg v-else-if="getNotificationIcon(notification.type) === 'warning-icon'" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <!-- Info Icon -->
            <svg v-else class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p 
              class="text-sm font-medium"
              :class="{
                'text-green-800': notification.type === 'success',
                'text-red-800': notification.type === 'error',
                'text-blue-800': notification.type === 'info',
                'text-yellow-800': notification.type === 'warning',
              }"
            >
              {{ notification.message }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="removeNotification(notification.id)"
              class="inline-flex rounded-md focus:outline-none"
              :class="{
                'text-green-400 hover:text-green-500': notification.type === 'success',
                'text-red-400 hover:text-red-500': notification.type === 'error',
                'text-blue-400 hover:text-blue-500': notification.type === 'info',
                'text-yellow-400 hover:text-yellow-500': notification.type === 'warning',
              }"
            >
              <span class="sr-only">Fechar</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Notification',
  
  setup() {
    const store = useStore();
    
    const notifications = computed(() => store.getters['notifications/notifications']);
    
    const removeNotification = (id) => {
      store.dispatch('notifications/removeNotification', id);
    };
    
    const getNotificationIcon = (type) => {
      switch (type) {
        case 'success':
          return 'success-icon';
        case 'error':
          return 'error-icon';
        case 'warning':
          return 'warning-icon';
        case 'info':
        default:
          return 'info-icon';
      }
    };
    
    return {
      notifications,
      removeNotification,
      getNotificationIcon,
    };
  },
});
</script>
