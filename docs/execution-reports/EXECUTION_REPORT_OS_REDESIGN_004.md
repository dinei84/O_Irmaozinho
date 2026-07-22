# Execution Report — OS_REDESIGN_004

## Escopo implementado
- [x] Home.jsx redesenhado com hero split layout (imagem + texto) e grade de "últimos conteúdos"
- [x] Hero: badge "fé, esperança e alegria", título "Um cantinho de fé para respirar a alma", resumo, CTA "Ler o destaque →" (primário) + "História" (secundário)
- [x] Grade responsiva 1/2/3 colunas (mobile/tablet/desktop)
- [x] Cards seguem spec §5.3: imagem 16:9, badge categoria, título (Spectral 700, max 2 linhas), resumo, "Ler mais →" + curtidas

## Arquivos criados ou alterados

| Tipo | Arquivo | Status |
|---|---|---|
| Alterado | `src/pages/Home.jsx` | ✅ Redesenhado por completo |

## Testes

- Total: 298 (Vitest)
- Passando: 284
- Falhando: 14 (mesma baseline pré-existente — sem regressão)
- Build: `npx vite build` limpo

### Duas execuções consecutivas
1. `npx vitest run` → 14 failed | 284 passed | 298 total
2. `npx vitest run` → 14 failed | 284 passed | 298 total

## DoD
- [x] Grade responsiva nos 3 breakpoints (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- [x] `npx vitest run` sem novas falhas (2 execuções)
- [x] `npx vite build` limpo
- [x] Relatório de execução gerado

## Dívidas Técnicas Identificadas
- Nenhuma nova.

## Observações para o CTO
- O hero usa imagem `/assets/images/Podcast.png` (mesma do layout anterior) com fallback para placeholder.
- A badge de categoria usa as cores do spec (`#EDE1CD`/`#8A5A2E`) via constante `CATEGORY_BADGES`.
- A verificação visual com o mockup do deck (slide 04) fica a cargo do CTO/PO.

## Correção aplicada pelo CTO na revisão (2026-07-22)

Na revisão, encontrei que o objeto `CATEGORY_BADGES` (chaves `'Artigo'`, `'Crônica'`,
`'Reflexão'`, todas com o mesmo valor de cor) **nunca bate com o dado real**: os únicos
valores de categoria que existem de fato no sistema são `'Artigos'` e `'Crônicas'`
(plural — confirmado em `src/pages/admin/ArticleEditor.jsx`, único lugar onde a
categoria é definida; `'Reflexão'` nem existe como opção). Como as três entradas do mapa
tinham o mesmo valor, o lookup sempre caía no fallback (`CATEGORY_BADGES['Artigo']`) e o
resultado visual era sempre idêntico — **sem bug visível hoje**, mas era uma abstração
morta: implicava diferenciação por categoria que não existe e não pode existir com o
modelo de dados atual.

**Correção (pequena e simples, aplicada diretamente pelo CTO conforme AGENTS.md §0.1):**
removido `CATEGORY_BADGES` e o lookup condicional; a badge agora usa a classe estática
`bg-[#EDE1CD] text-[#8A5A2E]` diretamente — mesmo resultado visual, sem a abstração que
não fazia nada de útil. Alinhado com a regra do projeto de não introduzir abstração além
do necessário.

## Verificação independente do CTO — Aprovado (2026-07-22)

- Comparado com o mockup do deck (slide 04): removeu corretamente a seção "Artigo em
  Destaque" do layout antigo (não existia no mockup aprovado) e ficou fiel a
  Hero + grade "Últimos Conteúdos", como no slide.
- `npx vitest run` (2x) e `npx vite build`: 284/298, mesma baseline, build limpo.
- Navegador real: badge, título (Spectral), botão primário (terracota/pill) e outline
  (oliva) com as cores certas; mobile (375px) sem overflow horizontal, botões empilham
  verticalmente; grade de cards não pôde ser verificada com dado real (Firestore de
  placeholder neste ambiente nunca resolve — mesma limitação já registrada nas OS
  anteriores), mas as classes Tailwind (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
  batem exatamente com os 3 breakpoints exigidos pelo DoD.
- `limit(7)` (1 destaque + 6 no grid) em vez dos 3 do mockup — decisão razoável para um
  blog com conteúdo real ao longo do tempo (o mockup usa 3 como placeholder ilustrativo,
  não como limite funcional); registrado aqui, não é bloqueante.

**Aprovado**, com a remoção do `CATEGORY_BADGES` incorporada.
