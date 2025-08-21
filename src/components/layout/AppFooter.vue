<template>
  <footer class="bg-gray-900 text-white pt-12 pb-8">
    <div class="container">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- About -->
        <div class="col-span-1 md:col-span-2">
          <h3 class="text-xl font-bold mb-4">Sobre Nós</h3>
          <p class="text-gray-400 mb-4">
            O Irmãozinho é um ministério dedicado a compartilhar o amor de Cristo através de conteúdo inspirador 
            e produtos de qualidade que fortalecem a fé cristã.
          </p>
          <div class="flex space-x-4">
            <a v-for="social in socialLinks" :key="social.name" :href="social.url" class="text-gray-400 hover:text-white">
              <span class="sr-only">{{ social.name }}</span>
              <component :is="social.icon" class="h-6 w-6" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-xl font-bold mb-4">Links Rápidos</h3>
          <ul class="space-y-2">
            <li v-for="link in quickLinks" :key="link.path">
              <router-link :to="link.path" class="text-gray-400 hover:text-white">
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-xl font-bold mb-4">Contato</h3>
          <ul class="space-y-2 text-gray-400">
            <li class="flex items-start">
              <svg class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              contato@oirmaozinho.com.br
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              (11) 1234-5678
            </li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
        <p>© {{ currentYear }} O Irmãozinho. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'AppFooter',
  setup() {
    const currentYear = ref(new Date().getFullYear());
    
    const socialLinks = [
      {
        name: 'Facebook',
        url: '#',
        icon: 'FacebookIcon'
      },
      {
        name: 'Instagram',
        url: '#',
        icon: 'InstagramIcon'
      },
      {
        name: 'YouTube',
        url: '#',
        icon: 'YoutubeIcon'
      }
    ];

    const quickLinks = [
      { path: '/', label: 'Início' },
      { path: '/blog', label: 'Blog' },
      { path: '/loja', label: 'Loja' },
      { path: '/sobre', label: 'Sobre Nós' },
      { path: '/contato', label: 'Contato' },
      { path: '/politica-de-privacidade', label: 'Política de Privacidade' },
      { path: '/termos-de-uso', label: 'Termos de Uso' },
    ];

    return {
      currentYear,
      socialLinks,
      quickLinks
    };
  }
});
</script>
