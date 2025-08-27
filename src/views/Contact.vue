<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="bg-primary text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl font-bold mb-6">Entre em Contato</h1>
        <p class="text-xl mb-8 max-w-2xl mx-auto">
          Estamos aqui para ouvir você. Compartilhe suas dúvidas, sugestões ou apenas diga olá!
        </p>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-2 gap-12">
          <!-- Contact Info -->
          <div class="bg-white p-8 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6 text-primary">Informações de Contato</h2>
            <p class="text-gray-600 mb-8">
              Ficaremos felizes em responder suas perguntas e ouvir seus comentários sobre nossas crônicas e produtos.
            </p>
            
            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <div class="bg-primary text-white p-3 rounded-full">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-lg">Endereço</h3>
                  <p class="text-gray-600">Rua das Bênçãos, 123<br>Bairro Esperança<br>São Paulo - SP</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-4">
                <div class="bg-primary text-white p-3 rounded-full">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-lg">Telefone</h3>
                  <p class="text-gray-600">(11) 98765-4321</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-4">
                <div class="bg-primary text-white p-3 rounded-full">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-lg">Email</h3>
                  <p class="text-gray-600">contato@oirmaozinho.com.br</p>
                </div>
              </div>
            </div>
            
            <!-- Social Links -->
            <div class="mt-8">
              <h3 class="font-semibold text-lg mb-4">Siga-nos</h3>
              <div class="flex space-x-4">
                <a href="#" class="bg-primary text-white p-3 rounded-full hover:bg-primary-dark transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" class="bg-primary text-white p-3 rounded-full hover:bg-primary-dark transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" class="bg-primary text-white p-3 rounded-full hover:bg-primary-dark transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" class="bg-primary text-white p-3 rounded-full hover:bg-primary-dark transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="bg-white p-8 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6 text-primary">Envie uma Mensagem</h2>
            <form @submit.prevent="submitForm" class="space-y-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  id="name"
                  v-model="form.name"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
              </div>
              
              <div>
                <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">Assunto</label>
                <input
                  type="text"
                  id="subject"
                  v-model="form.subject"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
              </div>
              
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="5"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                ></textarea>
              </div>
              
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full bg-primary text-white py-3 px-6 rounded-md font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting ? 'Enviando...' : 'Enviar Mensagem' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="bg-gray-200 rounded-lg p-8 text-center">
          <div class="text-6xl text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Nossa Localização</h3>
          <p class="text-gray-600">Mapa será carregado aqui</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'Contact',
  
  setup() {
    const store = useStore();
    const isSubmitting = ref(false);
    
    const form = reactive({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    const submitForm = async () => {
      isSubmitting.value = true;
      
      try {
        // Simular envio do formulário
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mostrar notificação de sucesso
        store.dispatch('notifications/addNotification', {
          type: 'success',
          message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
        });
        
        // Limpar formulário
        form.name = '';
        form.email = '';
        form.subject = '';
        form.message = '';
        
      } catch (error) {
        store.dispatch('notifications/addNotification', {
          type: 'error',
          message: 'Erro ao enviar mensagem. Tente novamente.'
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    
    return {
      form,
      isSubmitting,
      submitForm
    };
  }
};
</script>

<style scoped>
/* Estilos específicos para a página de contato */
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

.focus\:ring-primary:focus {
  --tw-ring-color: #1e40af;
}
</style>
