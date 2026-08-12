# Execution Report — OS_REDESIGN_006 (Listagens: Artigos, Crônicas)

**Branch:** `feature/os-006-listagens` (criada a partir de `develop`)
**Data:** 2026-08-12
**Executor:** CLI Agent (Claude Code / Sonnet 5)

---

## Escopo implementado

- [x] Aplicado o mesmo card de conteúdo da Home (redesenhado na OS_REDESIGN_004) na
      grade de listagem de `src/pages/Articles.jsx` — commit `feat(listagens)`
- [x] Aplicado o mesmo card de conteúdo da Home na grade de listagem de
      `src/pages/Chronicles.jsx` — mesmo commit
- [x] Grade responsiva 3/2/1 colunas mantida/confirmada
      (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`), com `gap-6 md:gap-8` igual ao Home
      (spec §6.1: mobile 1 col, tablet 2 cols, desktop 3 cols)
- [x] Relatório de execução gerado (este arquivo)

Reskin **estritamente visual** da grade de listagem. Não houve alteração na lógica de
busca de dados no Firestore (as funções `fetchArticles`/`fetchChronicles` permanecem
intactas). `src/lib/sanitize.js` **não foi tocado**.

## O que mudou no card da grade (antes → depois)

Alinhado 1:1 ao card da Home (`src/pages/Home.jsx`, seção "Últimos Conteúdos"):

| Aspecto | Antes | Depois (padrão Home) |
|---|---|---|
| Imagem | `h-48`, só renderizada se `imageUrl` existisse | `aspect-[16/9]` sempre renderizada, com placeholder de fallback |
| Categoria | `text-primary` uppercase via `.toUpperCase()` | badge pill estático `bg-[#EDE1CD] text-[#8A5A2E]` |
| Data | ausente na grade | metadado ao lado da badge via helper `formatDate` |
| Título | `mb-3`, sem hover | `line-clamp-2` + `group-hover:text-primary` |
| Corpo | `line-clamp-3` | `line-clamp-3 flex-grow` (empurra rodapé p/ base) |
| Rodapé | Button "Ler mais" + `LikeButton` | Button "Ler mais" (seta animada) + `LikeButton` |
| Animação | `animate` imediato | `whileInView` + `viewport once` + delay escalonado por índice |

## Arquivos alterados

| Arquivo | Tipo | Status |
|---|---|---|
| `src/pages/Articles.jsx` | Página (reskin da grade + helper `formatDate`) | ✅ Alterado |
| `src/pages/Chronicles.jsx` | Página (reskin da grade + helper `formatDate`) | ✅ Alterado |
| `docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_006.md` | Relatório | ✅ Criado |

## Testes

Rodados com o servidor de dev **desligado** (conforme instrução — evitar contenção de
recursos). `npx vitest run`, duas execuções consecutivas:

**Execução 1:**
```
 Test Files  10 failed | 11 passed (21)
      Tests  14 failed | 284 passed (298)
```

**Execução 2:**
```
 Test Files  10 failed | 11 passed (21)
      Tests  14 failed | 284 passed (298)
```

- Baseline conhecida (`PROJECT_STATE.md` §0): 298 total / 284 passando / **14 falhas
  pré-existentes**.
- Resultado: **idêntico à baseline — nenhuma nova falha introduzida.**
- Não existem testes automatizados específicos para `Articles.jsx`/`Chronicles.jsx`/
  `Home.jsx` (confirmado: `find` por `*.test.jsx` casando articles/chronicles/home não
  retornou nada), portanto não há teste de página para atualizar.
- As 14 falhas pré-existentes concentram-se em (amostra observada no log):
  `src/components/checkout/__tests__/BoletoPaymentForm.test.jsx` e
  `src/components/features/comments/__tests__/CommentItem.test.jsx` — sem relação com
  esta OS (ver DT-02 em `PROJECT_STATE.md`).

## Build

`npx vite build`:
```
dist/assets/index-CNVllIOu.js   1,012.14 kB │ gzip: 259.88 kB
(!) Some chunks are larger than 500 kB after minification.
✓ built in 3.28s
```
Build limpo. O único aviso é o de chunk > 500 kB, **pré-existente e conhecido**.
`dist/index.html` foi modificado pelo build e revertido com
`git checkout -- dist/index.html` (artefato de build rastreado por engano, fora do
escopo — conforme instrução da OS).

## DoD

- [x] `npx vitest run` sem novas falhas (2 execuções, 284/14/298 nas duas)
- [x] `npx vite build` limpo (só o warning de chunk pré-existente)
- [x] Grade responsiva 3/2/1 colunas (spec §6.1)
- [x] Card idêntico ao da Home (OS_REDESIGN_004)
- [x] Relatório de execução gerado
- [~] **Conferência visual manual em navegador: NÃO foi possível.** O ambiente não tem
      credenciais do Firebase (`.env` ausente). O `src/lib/firebase.js` lança erro na
      inicialização (variáveis `VITE_FIREBASE_*` faltando), o app não monta e a página
      fica em branco — confirmado via console do dev server:
      `❌ Variáveis de ambiente do Firebase não configuradas`. Verificação feita por
      **leitura/comparação de código** contra `Home.jsx` + build + testes automatizados,
      não por navegador ao vivo. (Honestidade §9.5 — não marco como concluída.)

## Decisões / ambiguidades resolvidas (para o CTO)

1. **`LikeButton` mantido no rodapé (em vez do `<Heart>` estático da Home).** O card da
   Home exibe um coração **estático somente-leitura** (`likesCount`). As páginas de
   listagem já possuíam o componente **interativo** `LikeButton` (curtir a partir da
   listagem). Trocá-lo pelo `Heart` estático removeria funcionalidade — seria regressão
   funcional, não "reskin visual". Decisão conservadora (AGENTS.md §8.1): preservei o
   `LikeButton` na mesma posição de rodapé onde a Home tem o coração. Visualmente é um
   coração com contador (equivalente); funcionalmente mantém o "curtir da listagem".
   **É o único ponto em que o card não é byte-a-byte igual ao da Home.** Se o CTO
   preferir o `Heart` estático (paridade visual total, perda do curtir na listagem),
   é uma micro-OS trivial.

2. **Seção "em Destaque" (featured) NÃO foi alterada.** A OS pede o "card de conteúdo"
   (o card da grade), não o card grande de destaque. O featured usa tokens da paleta
   (`bg-primary/10 text-primary`, `text-secondary`, `text-text-secondary`) — não há
   cores cruas (`gray-*`/`blue-*`) a corrigir nessas páginas. Mantido no escopo.

3. **`formatDate` helper local adicionado** em cada página (copiado 1:1 da Home) para
   exibir a data no card, que antes não aparecia na grade. Trata
   `seconds`/`_seconds`/número, igual à Home.

4. **Armadilha `CATEGORY_BADGES` evitada.** Nenhum objeto de badge por categoria no
   singular foi criado. A badge usa a classe estática `bg-[#EDE1CD] text-[#8A5A2E]`
   direto (padrão pós-correção da Home). O rótulo usa `article.category`/`chronicle.category`
   (valores reais no plural: `'Artigos'`/`'Crônicas'`), com fallback textual
   `'Artigo'`/`'Crônica'` idêntico ao fallback da Home.

## Dívidas técnicas identificadas

- Nenhuma nova. `LikeButton` internamente usa cores cruas (`gray-*`/`red-*`) fora da
  paleta da spec, mas isso é do componente compartilhado `src/components/features/likes/LikeButton.jsx`,
  fora do escopo desta OS (a OS proíbe reescrever lógica e o componente é usado em
  várias telas). Fica como observação para uma eventual OS de reskin de componentes de
  interação.

## Verificação independente do CTO — Aprovado (2026-08-12)

- `npx vitest run` (2x, servidor de dev desligado): 284/298, mesma baseline, zero
  regressão — confirmado de forma independente.
- `npx vite build`: limpo; `dist/index.html` revertido.
- Diffs de `Articles.jsx` e `Chronicles.jsx` revisados: reskin simétrico e fiel ao card
  da Home, badge estático (armadilha do `CATEGORY_BADGES` evitada com sucesso),
  `sanitize.js` e a lógica de busca intactos, sem cores cruas introduzidas.
- **Decisão do `LikeButton` validada e aprovada:** manter o componente interativo nas
  listagens (em vez do `<Heart>` estático que a Home usa) é a escolha certa — trocar
  removeria o "curtir da listagem", seria regressão funcional, não reskin. Fica assim.
  (Anota-se a assimetria Home-estático vs. listagem-interativa como possível ajuste
  futuro de produto, não bloqueante.)
- **Verificação visual ao vivo:** também não foi possível para o CTO (mesma limitação de
  Firebase deste ambiente). A correção visual é herdada: o card usa exatamente as mesmas
  classes Tailwind do card da Home, que foi verificado ao vivo em navegador na
  OS_REDESIGN_004. Base de aprovação: revisão de código + testes + build + reuso de
  padrão já validado.

**Aprovado.**
