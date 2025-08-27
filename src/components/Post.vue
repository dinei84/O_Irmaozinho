<template>
  <article class="post">
    <h2 class="post-title">{{ title }}</h2>
    <p class="post-date">{{ formattedDate }}</p>
    <div class="post-content" v-if="isHTML" v-html="content"></div>
    <div class="post-content" v-else>{{ content }}</div>
  </article>
</template>

<script setup>
import { computed } from 'vue';

// Definição das props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  renderHTML: {
    type: Boolean,
    default: false
  }
});

// Formatação da data
const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(props.date);
});

// Verifica se o conteúdo é HTML
const isHTML = computed(() => {
  return props.renderHTML || props.content.includes('<') && props.content.includes('>');
});
</script>

<style scoped>
.post {
  padding: 1.5rem;
  margin-bottom: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.post-date {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.post-content {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #444;
}
</style>