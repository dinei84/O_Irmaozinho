# OS_REDESIGN_005 — Página de leitura do artigo

**Status:** 🔲 Não iniciada
**Branch:** criar `feature/os-005-pagina-artigo` a partir de `develop` — nunca em `main`
(ver `AGENTS.md` §9.7). **Passo zero, antes de qualquer edição.**
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Depende de:** OS_REDESIGN_001 (tokens)

## Escopo (`PROJECT_SPEC.md` §5.6, mockup do deck slide 05)

Maior densidade de mudança visual desta fase, mas **reaproveitando lógica existente**,
nunca reescrevendo-a:

- Barra de progresso de leitura fixa no topo (componente novo, baseado em scroll).
- Capitular na primeira letra do primeiro parágrafo (`::first-letter` ou wrapper).
- Blockquote com borda esquerda terracota 3px, itálico.
- Player de TTS: **reskin** de `TextToSpeechPlayer.jsx`/`HighlightableText.jsx` — a
  funcionalidade de ouvir o artigo já existe e **deve ser mantida**; só a casca visual
  muda para o cartão `#F1E7D6` do spec.
- Seção de comentários: reskin de `CommentsSection.jsx`/`CommentItem.jsx`/
  `CommentForm.jsx`, com o texto acolhedor já definido no spec §7 ("Deixe um comentário
  gentil…").

## Definition of Done

- [ ] `npx vitest run` sem novas falhas em `textToSpeech/__tests__` e `comments/__tests__`
      (mudança é só visual — comportamento de ouvir/comentar preservado)
- [ ] `src/lib/sanitize.js` **não** é tocado nem contornado — mesma regra de
      `AGENTS.md` §4.5
- [ ] Comparação visual com o mockup do deck (slide 05)
- [ ] `npx vite build` limpo
- [ ] **`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_005.md` gerado** seguindo o
      template de `AGENTS.md` §6.3 — sem esse relatório a OS não está concluída

## Arquivos a alterar

- `src/pages/ArticleDetail.jsx`
- `src/components/features/textToSpeech/TextToSpeechPlayer.jsx`
- `src/components/features/textToSpeech/HighlightableText.jsx`
- `src/components/features/textToSpeech/TextSelectionControls.jsx`
- `src/components/features/comments/CommentsSection.jsx`,
  `CommentItem.jsx`, `CommentForm.jsx`
