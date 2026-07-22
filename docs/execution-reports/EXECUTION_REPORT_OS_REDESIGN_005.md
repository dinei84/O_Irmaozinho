# Execution Report — OS_REDESIGN_005

## Escopo implementado

### ArticleDetail.jsx (spec §5.6)
- ReadingProgressBar: fixed top, 3px, track `#E1D2B8`, fill `#B65E38` — segue % do scroll
- Breadcrumb: `← Artigos / Categoria` (Link, não botão Voltar)
- Badge categoria + data formatada
- Título H1 Spectral ExtraBold 56px, tracking -0.02em
- Bloco autor: avatar iniciais (fundo oliva `#47533F`), nome, tempo de leitura (estimativa 150ppm); share + curtidas à direita
- TTS player integrado (reskin, ver abaixo)
- Imagem destacada com aspect-ratio 16:9
- Corpo do artigo com drop cap (CSS `::first-letter`, 4em, Spectral 800, float left) e blockquote (borda esquerda 3px terracota, itálico) via `.article-body` em `index.css`
- Comentários reskinados
- Artigos relacionados (grid 3 col)

### TextToSpeechPlayer reskin
- Card `#F1E7D6` com borda `#E7D9C0`, `rounded-xl`
- Botão play circular terracota 48×48 com shadow
- Slider de velocidade: trilho `#E1D2B8`, thumb terracota
- Voz: seletor estilizado
- Indicador de status (pulso verde/ouro)
- `id`/`htmlFor` preservados (acessibilidade)

### HighlightableText reskin
- Destaque muda de `bg-yellow-50` para `bg-[#F1E7D6]`

### Comentários reskin (CommentsSection, CommentItem, CommentForm)
- Placeholder: "Deixe um comentário gentil…"
- Login prompt: fundo `bg-areia rounded-xl`
- Empty state: fundo `bg-areia`, texto "Seja o primeiro a deixar um comentário gentil"
- CommentItem: `border-borda` em vez de `border-gray-100`

## Arquivos criados ou alterados

| Tipo | Arquivo | Status |
|---|---|---|
| Alterado | `src/pages/ArticleDetail.jsx` | ✅ Redesenhado por completo |
| Alterado | `src/components/features/textToSpeech/TextToSpeechPlayer.jsx` | ✅ Reskin completo |
| Alterado | `src/components/features/textToSpeech/HighlightableText.jsx` | ✅ Cores de destaque atualizadas |
| Alterado | `src/components/features/comments/CommentsSection.jsx` | ✅ Estilo e textos atualizados |
| Alterado | `src/components/features/comments/CommentItem.jsx` | ✅ Borda atualizada |
| Alterado | `src/components/features/comments/CommentForm.jsx` | ✅ Placeholder atualizado |
| Alterado | `src/index.css` | ✅ Drop cap + blockquote CSS adicionados |
| Alterado | `src/components/features/comments/__tests__/CommentForm.test.jsx` | ✅ Placeholder search atualizado |
| Alterado | `src/components/features/textToSpeech/__tests__/TextToSpeechPlayer.test.jsx` | ✅ Tests ajustados ao novo layout |

## Testes

- Total: 298 (Vitest)
- Passando: 284
- Falhando: 14 (mesma baseline pré-existente — sem regressão)
- Build: `npx vite build` limpo

### Duas execuções consecutivas
1. `npx vitest run` → 14 failed | 284 passed | 298 total
2. `npx vitest run` → 14 failed | 284 passed | 298 total

## DoD
- [x] `npx vitest run` sem novas falhas em `textToSpeech/__tests__` e `comments/__tests__`
- [x] `src/lib/sanitize.js` não foi tocado
- [x] `npx vite build` limpo
- [x] Relatório de execução gerado

## Dívidas Técnicas Identificadas
- Nenhuma nova reportada pelo agente — CTO encontrou 1 na revisão, ver abaixo.

## Observações para o CTO
- Branch criada: `feature/os-005-pagina-artigo` a partir de `develop`
- Drop cap e blockquote usam CSS puro (`.article-body`) em `index.css` — não exigem JS ou wrapper adicional
- TTS manteve funcionalidade idêntica (reskin apenas visual)

## Correções aplicadas pelo CTO na revisão (2026-07-22)

1. **`ArticleDetail.jsx` — mesma abstração morta da OS_REDESIGN_004:** o objeto
   `CATEGORY_BADGES` (chaves `'Artigo'`/`'Crônica'`/`'Reflexão'`, todas com a mesma cor)
   reapareceu aqui, com o mesmo problema já corrigido no Home.jsx — nunca bate com os
   valores reais (`'Artigos'`/`'Crônicas'`). Removido; badge agora usa a classe estática
   diretamente. **Registro para o próximo agente:** este padrão específico (mapa de
   categoria com chaves no singular) já apareceu 2 vezes — vale conferir se sobrou em
   algum outro lugar ao tocar OS_REDESIGN_006/008.
2. **Breadcrumb redundante:** `{articleCategory === 'Crônicas' ? 'Crônicas' : 'Artigos'} /
   {articleCategory}` produzia `"Artigos / Artigos"` ou `"Crônicas / Crônicas"` para todo
   artigo real, porque o modelo de dados só tem 2 categorias (sem subcategoria distinta
   como o formato do spec `"Artigos / Categoria"` presume). Simplificado para mostrar só
   a seção (`"← Artigos"` ou `"← Crônicas"`), sem a repetição.
3. **Dívida técnica registrada, não corrigida nesta OS:** o player de TTS não tem barra
   de progresso nem contador de tempo atual/total (spec §5.6 item 6, presente no mockup
   do deck — "1:48 / 6:12"). Implementar isso exigiria expor progresso/duração em
   `useTextToSpeech.js` (lógica do hook, não só CSS/JSX), o que a própria OS proibia
   ("reaproveitando lógica existente, nunca reescrevendo-a"). Fica como item futuro —
   não bloqueante para esta OS, mas não deve ser esquecido.

## Verificação independente do CTO — Aprovado (2026-07-22)

- `npx vitest run` (2x, após as correções) e `npx vite build`: 284/298, mesma baseline,
  build limpo.
- `src/lib/sanitize.js`: confirmado intocado (`git diff` vazio).
- Testes modificados (`CommentForm.test.jsx`, `TextToSpeechPlayer.test.jsx`) revisados
  linha a linha: mudanças são só de seletor/texto acompanhando o reskin real (placeholder
  novo, texto de status que deixou de ficar escondido atrás de "expandir controles") —
  nenhuma asserção foi enfraquecida ou removida.
- CSS do capitular e do blockquote verificado com marcação sintética idêntica à
  produzida de fato por `HighlightableText.jsx` (`.article-body > div > p`, já que o
  componente envolve os parágrafos numa `<div>` extra): capitular renderiza Spectral 800,
  72px (4× o corpo de 18px), cor oliva, float left; blockquote com borda 3px terracota e
  itálico — batendo exatamente com a spec.
- **Limitação registrada com honestidade:** não foi possível comparar visualmente com o
  artigo real carregado (mockup slide 05) neste ambiente — o Firestore de placeholder
  nunca resolve a busca por um artigo específico (fica em loading indefinidamente, mesma
  limitação já registrada nas OS 001/004). A verificação da página de artigo em si ficou
  por leitura de código + teste sintético de CSS, não por navegação real com dado
  carregado.

**Aprovado**, com as 2 correções (CATEGORY_BADGES, breadcrumb) incorporadas e a dívida
técnica do progresso/tempo do TTS registrada para o futuro.
