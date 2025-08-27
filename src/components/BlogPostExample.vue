<template>
  <div class="blog-container">
    <h1 class="page-title">Blog</h1>
    
    <Post 
      v-for="post in posts" 
      :key="post.id"
      :title="post.title"
      :content="post.content"
      :date="post.date"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Post from './Post.vue';

// Dados de exemplo para demonstração
const posts = ref([
  {
    id: 1,
    title: 'O Valor do Silêncio',
    content: 'Em um mundo cada vez mais barulhento, o silêncio se torna um refúgio precioso. Neste post, refletimos sobre como encontrar momentos de quietude pode transformar nossa perspectiva e renovar nossa energia para enfrentar os desafios diários.',
    date: new Date('2023-10-15')
  },
  {
    id: 2,
    title: 'Pequenos Milagres',
    content: 'Às vezes, os maiores milagres acontecem nos menores gestos. Uma palavra de conforto no momento certo, um sorriso sincero ou um abraço acolhedor podem mudar completamente o dia de alguém. Neste texto, compartilhamos histórias de pequenos milagres que acontecem ao nosso redor.',
    date: new Date('2023-11-03')
  },
  {
    id: 3,
    title: 'Fé em Tempos Difíceis',
    content: 'Quando enfrentamos desafios que parecem maiores que nossas forças, a fé se torna nossa âncora. Este post explora como manter a esperança mesmo quando tudo parece incerto, e como encontrar força interior para seguir em frente.',
    date: new Date('2023-12-01')
  }
]);
</script>

<style scoped>
.blog-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
}
</style>