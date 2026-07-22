# Execution Report — OS_REDESIGN_001

**OS:** [`docs/os/OS_REDESIGN_001_FUNDACAO_DESIGN_SYSTEM.md`](../os/OS_REDESIGN_001_FUNDACAO_DESIGN_SYSTEM.md)
**Data:** 2026-07-22
**Status:** implementado e verificado — **aguardando commit** (aguardando decisão do PO
sobre quando commitar o conjunto desta sessão)

## Escopo implementado

- [x] `tailwind.config.js` — tokens remapeados para a paleta terrosa (`primary`→terracota
      `#B65E38`, `secondary`→oliva `#47533F`, `background`→papel `#F7F1E7`,
      `text-primary`→tinta `#2A2620`, `text-secondary`→neutro `#8B7C64`) + tokens novos
      (`dourado`, `areia`, `pessego`, `borda`).
- [x] `src/index.css` — Google Fonts CDN substituído por `@fontsource/spectral` +
      `@fontsource/mulish` self-hosted (pesos 400/500/600/700/800 + itálico 400/500 em
      Spectral); nova classe `.badge-categoria`.
- [x] `src/components/ui/Button.jsx` — `rounded-xl` → `rounded-full` (pill), altura
      mínima 44px, fonte Mulish/bold; variante `outline` passou a seguir o "Secundário"
      do spec (borda/texto oliva, transparente); `primary`/`secondary` usam texto papel
      em vez de branco puro (regra de contraste do spec §3).
- [x] `src/components/ui/Card.jsx` — `gray-100`/`gray-50` → `borda`/`areia`.
- [x] Dependências instaladas: `@fontsource/spectral`, `@fontsource/mulish`.

## Arquivos alterados

| Arquivo | Tipo de mudança |
|---|---|
| `tailwind.config.js` | Valores de tokens de cor e de fonte |
| `src/index.css` | Import de fontes + classes de componente |
| `src/components/ui/Button.jsx` | Forma, tamanho, variantes de cor |
| `src/components/ui/Card.jsx` | Cores de borda/fundo |
| `package.json` / `package-lock.json` | 2 dependências novas |

## Testes

- Total: 298 (Vitest) — não há teste de Firestore Rules nesta OS (nenhuma mudança em
  `firestore.rules`).
- Passando: **284** (2 execuções consecutivas, mesmo resultado nas duas)
- Falhando: **14** — idênticas à baseline pré-existente registrada em
  `PROJECT_STATE.md` §0/§3.1 (DT-02), **zero regressão introduzida**:
  - `src/lib/__tests__/validators.test.js` (4 casos)
  - `src/services/__tests__/commentService.test.js` (3 casos)
  - `src/services/__tests__/likeService.test.js` (2 casos)
  - `src/services/__tests__/userService.test.js` (2 casos)
  - `src/components/checkout/__tests__/BoletoPaymentForm.test.jsx` (2 casos)
  - `src/components/features/comments/__tests__/CommentItem.test.jsx` (1 caso)

  (Contagem e nomes conferidos linha a linha contra o resultado das duas execuções;
  nenhum arquivo desta lista foi tocado por esta OS.)
- `npx vite build`: limpo nas duas verificações (aviso pré-existente de chunk >500KB,
  não relacionado a esta OS — é o mesmo aviso do build antes da mudança, fica registrado
  como pauta da OS_REDESIGN_010).

## DoD

- [x] `npx vitest run` sem novas falhas (2 execuções consecutivas)
- [x] `npx vite build` limpo
- [x] Conferência visual em navegador real

## Verificação manual (navegador)

Servidor de desenvolvimento local (`npm run dev`), com um `.env` de placeholder criado
só para esta sessão (sem credenciais reais — removido ao final; o projeto não tinha
`.env` configurado neste ambiente). Como não há dados reais no Firestore aqui, a Home
carregou o layout mas sem itens na grade de conteúdo — o teste de `Card.jsx` foi
validado por leitura de código, não visualmente com dado real.

Verificado via `getComputedStyle`/`document.fonts` no navegador real (não houve captura
de screenshot possível neste ambiente — a pane não compositou; esta é uma limitação do
ambiente, registrada aqui em vez de omitida):

| Verificação | Resultado |
|---|---|
| `body` font-family | `Mulish, sans-serif` ✅ |
| `body` background | `rgb(247, 241, 231)` = `#F7F1E7` (papel) ✅ |
| `body` color | `rgb(42, 38, 32)` = `#2A2620` (tinta) ✅ |
| `h1` font-family | `Spectral, serif` ✅ |
| `h1` color | `rgb(71, 83, 63)` = `#47533F` (oliva) ✅ |
| Botão primário — background | `rgb(182, 94, 56)` = `#B65E38` (terracota) ✅ |
| Botão primário — border-radius | `9999px` (pill) ✅ |
| Botão primário — min-height | `44px` ✅ |
| Botão primário — color (texto) | `rgb(247, 241, 231)` = papel, não branco puro ✅ |
| Botão outline — border/color | `rgb(71, 83, 63)` = oliva, background transparente ✅ |
| `document.fonts` carregadas | Spectral 400/500/600/700/800 (+ 400/500 itálico) e Mulish 400/500/600/700/800 — exatamente os pesos importados, nenhum a mais ✅ |
| Overflow horizontal | `0` (sem scroll lateral indevido) ✅ |

## Dívidas Técnicas Identificadas

Nenhuma nova. O aviso de chunk JS >500KB no build já existia antes desta OS (não
investigado a fundo agora — fica para OS_REDESIGN_010, que trata performance/bundle).

## Observações para o CTO

- **Exceção de processo, registrada por transparência:** esta OS foi implementada
  diretamente na sessão de CTO, antes da fronteira CTO/CLI Agent ser formalizada em
  `AGENTS.md` §0.1. A partir da OS_REDESIGN_002, a implementação passa a ser delegada a
  um CLI Agent (subagente); a sessão de CTO passa a atuar só como revisora, aplicando no
  máximo correções pequenas e simples durante a revisão.
- As classes `.btn`/`.btn-primary`/`.btn-secondary`/`.btn-outline`/`.card` em
  `src/index.css` não são usadas por nenhum componente da árvore atual (`Button.jsx`/
  `Card.jsx` usam classes Tailwind inline, não essas classes de `@layer components`).
  Foram atualizadas por consistência (mesmos tokens), mas são código morto — candidatas
  a remoção numa faxina futura, fora do escopo desta OS.
- `npx vite build` regenerou `dist/index.html` (artefato de build rastreado por engano
  no git, dívida técnica já conhecida — `PLANO_DE_ACAO.md` 1.7). Revertido com
  `git checkout -- dist/index.html` para não poluir o diff desta OS; nenhuma mudança de
  `dist/` faz parte desta entrega.
- Nada foi commitado ainda — aguardando decisão do PO sobre agrupamento dos commits
  desta sessão (governança + OS_REDESIGN_001).
