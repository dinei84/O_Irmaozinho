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
            <component
              :is="getNotificationIcon(notification.type)"
              class="h-5 w-5"
              :class="{
                'text-green-400': notification.type === 'success',
                'text-red-400': notification.type === 'error',
                'text-blue-400': notification.type === 'info',
                'text-yellow-400': notification.type === 'warning',
              }"
              aria-hidden="true"
            />
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
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationIcon } from '@heroicons/vue/outline';

export default defineComponent({
  name: 'Notification',
  
  components: {
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ExclamationIcon,
  },
  
  setup() {
    const store = useStore();
    
    const notifications = computed(() => store.getters['notifications/notifications']);
    
    const removeNotification = (id) => {
      store.dispatch('notifications/removeNotification', id);
    };
    
    const getNotificationIcon = (type) => {
      switch (type) {
        case 'success':
          return 'CheckCircleIcon';
        case 'error':
          return 'XCircleIcon';
        case 'warning':
          return 'ExclamationIcon';
        case 'info':
        default:
          return 'InformationCircleIcon';
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
