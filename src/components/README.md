# Componentes Vue

## Post.vue

O componente `Post.vue` é um componente reutilizável para exibir posts de blog. Ele foi projetado para ser flexível e pode ser usado em diferentes contextos, como listagens de posts, páginas de detalhes de posts e exemplos de demonstração.

### Props

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|------------|--------|------------|
| `title` | String | Sim | - | O título do post |
| `content` | String | Sim | - | O conteúdo do post |
| `date` | Date | Sim | - | A data de publicação do post |
| `renderHTML` | Boolean | Não | false | Define se o conteúdo deve ser renderizado como HTML |

### Uso Básico

```vue
<template>
  <Post 
    title="Meu Primeiro Post"
    content="Este é um exemplo de post com texto simples."
    :date="new Date()"
  />
</template>

<script setup>
import Post from '@/components/Post.vue';
</script>
```

### Renderizando Conteúdo HTML

Para renderizar conteúdo HTML, defina a prop `renderHTML` como `true`:

```vue
<template>
  <Post 
    title="Post com HTML"
    :content="htmlContent"
    :date="new Date()"
    :renderHTML="true"
  />
</template>

<script setup>
import { ref } from 'vue';
import Post from '@/components/Post.vue';

const htmlContent = ref(`
  <p>Este é um exemplo de post com <strong>conteúdo HTML</strong>.</p>
  <h3>Subtítulo do Post</h3>
  <p>O componente Post.vue pode renderizar conteúdo HTML.</p>
`);
</script>
```

### Exemplos

Para ver exemplos de uso do componente `Post.vue`, acesse a rota `/post-exemplo` na aplicação.

### Estilização

O componente vem com estilos básicos que podem ser personalizados conforme necessário. Os estilos são escoped ao componente, então não afetarão outros elementos da página.