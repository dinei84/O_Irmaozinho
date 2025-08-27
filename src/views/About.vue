<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="bg-primary text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl font-bold mb-6">Sobre Nós</h1>
        <p class="text-xl mb-8 max-w-2xl mx-auto">
          Conheça nossa história, missão e os valores que guiam o blog O Irmãozinho.
        </p>
      </div>
    </section>

    <!-- About Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div class="space-y-6">
            <h2 class="text-3xl font-bold text-primary">Nossa História</h2>
            <div class="space-y-4 text-gray-600">
              <p>
                O Irmãozinho nasceu do desejo de compartilhar reflexões cristãs que pudessem tocar corações e transformar vidas. Fundado em 2020, nosso blog tem como objetivo oferecer conteúdo inspirador através de crônicas que abordam temas do cotidiano sob a perspectiva da fé cristã.
              </p>
              <p>
                Ao longo dos anos, temos crescido e alcançado milhares de leitores que buscam palavras de esperança, conforto e direcionamento espiritual. Nossa comunidade é formada por pessoas de diferentes denominações cristãs, unidas pelo amor a Cristo e pelo desejo de viver segundo Seus ensinamentos.
              </p>
              <p>
                Acreditamos que as pequenas histórias do dia a dia podem revelar grandes verdades espirituais, e é isso que buscamos compartilhar em nossas crônicas.
              </p>
            </div>
          </div>
          <div class="bg-gray-200 rounded-lg p-8 text-center">
            <div class="text-6xl text-gray-400 mb-4">
              <svg class="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <p class="text-gray-600">Imagem da equipe será carregada aqui</p>
          </div>
        </div>

        <!-- Mission, Vision & Values -->
        <div class="grid md:grid-cols-3 gap-8 mb-16">
          <div class="bg-white p-8 rounded-lg shadow-md text-center">
            <div class="bg-primary text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-4 text-primary">Nossa Missão</h3>
            <p class="text-gray-600">
              Inspirar e fortalecer a fé cristã através de reflexões que conectam a Palavra de Deus com as experiências do cotidiano, promovendo transformação espiritual e crescimento na fé.
            </p>
          </div>

          <div class="bg-white p-8 rounded-lg shadow-md text-center">
            <div class="bg-primary text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-4 text-primary">Nossa Visão</h3>
            <p class="text-gray-600">
              Ser reconhecido como um espaço de referência para reflexões cristãs autênticas e relevantes, alcançando pessoas em diferentes estágios de sua jornada espiritual e contribuindo para o fortalecimento da fé.
            </p>
          </div>

          <div class="bg-white p-8 rounded-lg shadow-md text-center">
            <div class="bg-primary text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-4 text-primary">Nossos Valores</h3>
            <p class="text-gray-600">
              Fidelidade à Palavra de Deus, autenticidade nas reflexões, respeito à diversidade, excelência no conteúdo, e compromisso com a edificação espiritual de nossos leitores.
            </p>
          </div>
        </div>

        <!-- Team Section -->
        <div class="mb-16">
          <h2 class="text-3xl font-bold text-center mb-12 text-primary">Nossa Equipe</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-md text-center">
              <div class="bg-gray-200 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8c0 2.208-1.79 4-3.998 4-2.208 0-3.998-1.792-3.998-4s1.79-4 3.998-4c2.208 0 3.998 1.792 3.998 4z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-2">João Silva</h3>
              <p class="text-primary font-medium mb-3">Fundador & Editor Chefe</p>
              <p class="text-gray-600 mb-4">
                Teólogo e escritor apaixonado por compartilhar a mensagem do evangelho através de histórias do cotidiano.
              </p>
              <div class="flex justify-center space-x-3">
                <a href="#" class="text-gray-400 hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" class="text-gray-400 hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" class="text-gray-400 hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-md text-center">
              <div class="bg-gray-200 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8c0 2.208-1.79 4-3.998 4-2.208 0-3.998-1.792-3.998-4s1.79-4 3.998-4c2.208 0 3.998 1.792 3.998 4z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-2">Maria Oliveira</h3>
              <p class="text-primary font-medium mb-3">Escritora & Teóloga</p>
              <p class="text-gray-600 mb-4">
                Especialista em estudos bíblicos com mestrado em teologia, traz profundidade às reflexões publicadas no blog.
              </p>
              <div class="flex justify-center space-x-3">
                <a href="#" class="text-gray-400 hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" class="text-gray-400 hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" class="text-gray-400 hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-md text-center">
              <div class="bg-gray-200 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8c0 2.208-1.79 4-3.998 4-2.208 0-3.998-1.792-3.998-4s1.79-4 3.998-4c2.208 0 3.998 1.792 3.998 4z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-2">Pedro Santos</h3>
              <p class="text-primary font-medium mb-3">Designer & Desenvolvedor</p>
              <p class="text-gray-600 mb-4">
                Responsável pela identidade visual e experiência digital do blog, combinando criatividade e tecnologia.
              </p>
              <div class="flex justify-center space-x-3">
                <a href="#" class="text-gray-400 hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" class="text-gray-400 hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" class="text-gray-400 hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Testimonials Section -->
        <div class="bg-gray-50 py-16 rounded-lg">
          <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-12 text-primary">O Que Dizem Nossos Leitores</h2>
            <div class="max-w-4xl mx-auto">
              <div v-for="(testimonial, index) in testimonials" :key="index" 
                   v-show="currentTestimonial === index"
                   class="bg-white p-8 rounded-lg shadow-md text-center">
                <div class="text-primary text-4xl mb-4">
                  <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>
                <p class="text-gray-600 text-lg mb-6 italic">"{{ testimonial.quote }}"</p>
                <div class="flex items-center justify-center space-x-4">
                  <div class="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8c0 2.208-1.79 4-3.998 4-2.208 0-3.998-1.792-3.998-4s1.79-4 3.998-4c2.208 0 3.998 1.792 3.998 4z"/>
                    </svg>
                  </div>
                  <div class="text-left">
                    <h4 class="font-semibold">{{ testimonial.author }}</h4>
                    <p class="text-gray-500 text-sm">{{ testimonial.role }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Testimonial Navigation -->
              <div class="flex justify-center mt-8 space-x-2">
                <button 
                  v-for="(testimonial, index) in testimonials" 
                  :key="index"
                  @click="currentTestimonial = index"
                  :class="[
                    'w-3 h-3 rounded-full transition-colors',
                    currentTestimonial === index ? 'bg-primary' : 'bg-gray-300'
                  ]"
                ></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'About',
  
  setup() {
    const currentTestimonial = ref(0);
    let intervalId = null;
    
    const testimonials = ref([
      {
        quote: "As crônicas do O Irmãozinho têm sido uma fonte de inspiração diária para mim. Cada texto parece falar diretamente ao meu coração e me ajuda a enxergar Deus nas pequenas coisas do dia a dia.",
        author: "Ana Beatriz",
        role: "Leitora desde 2021"
      },
      {
        quote: "Encontrei no O Irmãozinho um espaço de reflexão profunda e autêntica. As crônicas abordam temas do cotidiano com uma perspectiva bíblica que me ajuda a crescer na fé e a aplicar os ensinamentos de Cristo em minha vida.",
        author: "Carlos Eduardo",
        role: "Leitor desde 2020"
      }
    ]);
    
    const startTestimonialRotation = () => {
      intervalId = setInterval(() => {
        currentTestimonial.value = (currentTestimonial.value + 1) % testimonials.value.length;
      }, 5000);
    };
    
    const stopTestimonialRotation = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    
    onMounted(() => {
      startTestimonialRotation();
    });
    
    onUnmounted(() => {
      stopTestimonialRotation();
    });
    
    return {
      testimonials,
      currentTestimonial,
      startTestimonialRotation,
      stopTestimonialRotation
    };
  }
};
</script>

<style scoped>
/* Estilos específicos para a página sobre */
.bg-primary {
  background-color: #1e40af;
}

.text-primary {
  color: #1e40af;
}

.hover\:text-primary:hover {
  color: #1e40af;
}
</style>
