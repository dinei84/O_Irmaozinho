<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">Exemplo de Uso do Componente Post</h1>
    
    <div class="max-w-3xl mx-auto bg-gray-100 p-6 rounded-lg mb-8">
      <h2 class="text-xl font-semibold mb-4">Exemplo 1: Post com texto simples</h2>
      <Post 
        title="Meu Primeiro Post"
        content="Este é um exemplo de post com texto simples. O componente Post.vue é versátil e pode ser usado em diferentes contextos."
        :date="new Date()"
      />
    </div>
    
    <div class="max-w-3xl mx-auto bg-gray-100 p-6 rounded-lg mb-8">
      <h2 class="text-xl font-semibold mb-4">Exemplo 2: Post com conteúdo HTML</h2>
      <Post 
        title="Post com HTML"
        :content="htmlContent"
        :date="new Date('2023-10-15')"
        :renderHTML="true"
      />
    </div>
    
    <div class="max-w-3xl mx-auto bg-gray-100 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Exemplo 3: Post com data personalizada</h2>
      <Post 
        title="Post com Data Antiga"
        content="Este post tem uma data de publicação mais antiga para demonstrar a formatação de datas."
        :date="new Date('2020-05-01')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Post from '../components/Post.vue';

const htmlContent = ref(`
  <p>Este é um exemplo de post com <strong>conteúdo HTML</strong>.</p>
  <h3>Subtítulo do Post</h3>
  <p>O componente Post.vue pode renderizar conteúdo HTML quando a propriedade <code>renderHTML</code> é definida como <code>true</code>.</p>
  <ul>
    <li>Item 1 da lista</li>
    <li>Item 2 da lista</li>
    <li>Item 3 da lista</li>
  </ul>
  <blockquote>
    <p>Esta é uma citação de exemplo para demonstrar a formatação de blockquote.</p>
  </blockquote>
`);
</script>