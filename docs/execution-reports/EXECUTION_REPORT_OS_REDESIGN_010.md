# Execution Report — OS_REDESIGN_010 (Performance e revisão final)

**Branch:** `feature/os-010-performance` (criada a partir de `develop`)
**Data:** 2026-08-13
**Executor:** CLI Agent (Claude Code / Sonnet 5)

---

## Escopo implementado

- [x] **Code-splitting de rotas** em `src/App.jsx`: os 20 imports de página viraram
      `React.lazy(() => import(...))`, e as `<Routes>` foram envolvidas em
      `<Suspense fallback={<PageLoader />}>` (spinner centralizado com o padrão
      `animate-spin ... border-primary` já usado no projeto). **Nenhuma mudança de
      comportamento** — apenas a forma de import. As 8 telas de `pages/admin/*` saíram do
      bundle inicial (maior ganho para o visitante comum).
- [x] **Lazy-load de imagens**: `loading="lazy"` + `decoding="async"` nos `<img>` abaixo da
      dobra (14 arquivos). Hero da Home e logo do Header mantidos eager; hero recebeu
      `fetchpriority="high"`. `srcset` **não** aplicado (imagens são URL única de
      Firestore/placeholder, sem variantes responsivas — ver Decisões).
- [x] **Revisão de contraste (spec §3)**: 5 ocorrências de `text-white` fora de testes,
      todas sobre `bg-primary` (terracota), convertidas para `text-background` (`#F7F1E7`).
- [x] **Alvos de toque ≥ 44×44 (spec §5.1)**: ajustados botões só-ícone e controles pequenos
      (detalhe em "Toque" abaixo). `Button` já garantia `min-h-[44px]`.

## Arquivos alterados

| Arquivo | O que mudou | Status |
|---|---|---|
| `src/App.jsx` | `React.lazy` + `Suspense` + `PageLoader` | ✅ Alterado |
| `src/pages/Home.jsx` | Cards `lazy`; hero eager + `fetchpriority="high"` | ✅ Alterado |
| `src/pages/Articles.jsx` | Imagens `loading="lazy"` + `decoding="async"` | ✅ Alterado |
| `src/pages/Chronicles.jsx` | Idem | ✅ Alterado |
| `src/pages/Store.jsx` | Idem + botão fechar modal `p-2` → `p-3` | ✅ Alterado |
| `src/pages/ArticleDetail.jsx` | Imagem + relacionados `lazy`; botão compartilhar `p-3` | ✅ Alterado |
| `src/pages/Checkout.jsx` | Imagem do resumo `lazy` | ✅ Alterado |
| `src/components/features/cart/CartDrawer.jsx` | Imagem `lazy`; fechar/remover `p-3`+min; qty `w-11 h-11` | ✅ Alterado |
| `src/components/features/comments/CommentItem.jsx` | Avatar `lazy` | ✅ Alterado |
| `src/components/checkout/PixPaymentForm.jsx` | QR `lazy` + `decoding` | ✅ Alterado |
| `src/components/layout/Footer.jsx` | Logo `lazy`; redes sociais `w-10` → `w-11` | ✅ Alterado |
| `src/components/layout/Header.jsx` | Badge `text-white`→`text-background`; carrinho/user `p-3`; itens de menu `min-h-[44px]` | ✅ Alterado |
| `src/components/features/likes/LikeButton.jsx` | `py-2` → `py-3` (altura 44px) | ✅ Alterado |
| `src/components/features/textToSpeech/TextToSpeechPlayer.jsx` | Botões parar/expandir `p-3` + min 44 | ✅ Alterado |
| `src/components/features/textToSpeech/TextSelectionControls.jsx` | Container `text-white`→`text-background`; botões min 44 | ✅ Alterado |
| `src/components/features/pwa/InstallPrompt.jsx` | Instalar `py-3`; dispensar min 44 | ✅ Alterado |
| `src/pages/admin/Dashboard.jsx` | Imagem `lazy`; editar/excluir min 44 | ✅ Alterado |
| `src/pages/admin/ProductEditor.jsx` | Preview `lazy` | ✅ Alterado |
| `src/pages/admin/ArticleEditor.jsx` | Preview `lazy` | ✅ Alterado |
| `src/pages/admin/ProductsManager.jsx` | Imagem `lazy`; editar/excluir min 44 | ✅ Alterado |
| `src/pages/admin/SuppliersManager.jsx` | Editar/excluir min 44 | ✅ Alterado |
| `src/pages/admin/OrdersManager.jsx` | Filtro ativo `text-white`→`text-background` | ✅ Alterado |
| `src/pages/admin/OrderDetailAdmin.jsx` | Botão salvar `text-white`→`text-background` (2x) | ✅ Alterado |
| `docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_010.md` | Relatório | ✅ Criado |

**Não commitados (corretamente):** `dist/` — `dist/index.html` foi revertido após o build
(`git checkout -- dist/index.html`), conforme instrução da OS.

## Bundle antes × depois

**Antes** (`npx vite build`, um único chunk JS):
```
dist/assets/index-DGvf7C21.js                                1,014.74 kB │ gzip: 260.69 kB
(!) Some chunks are larger than 500 kB after minification.
```

**Depois** — o chunk principal caiu de **1.014,74 kB → 776,36 kB** (gzip 260.69 → 208.79 kB,
**−238 kB, ~23% no bruto**), e cada página virou um chunk próprio:
```
dist/assets/index-91UGXqsV.js                                776.36 kB │ gzip: 208.79 kB
dist/assets/Checkout-DPo4Ac_V.js                              35.49 kB │ gzip:   8.89 kB
dist/assets/ArticleDetail-_KabB1to.js                         29.95 kB │ gzip:   9.23 kB
dist/assets/SupplierEditor-DL8BIeIv.js                        17.05 kB │ gzip:   4.12 kB
dist/assets/OrderDetail-4hMWPL5N.js                           11.03 kB │ gzip:   3.04 kB
dist/assets/OrderDetailAdmin-CtFg83xo.js                      10.83 kB │ gzip:   3.00 kB
dist/assets/ArticleEditor-BFH58xu8.js                          9.63 kB │ gzip:   3.37 kB
dist/assets/ProductEditor-BG6kk8CV.js                          8.97 kB │ gzip:   2.88 kB
dist/assets/SignUp-cxZJscRa.js                                 8.84 kB │ gzip:   2.56 kB
dist/assets/SuppliersManager-DzT0YveX.js                       7.58 kB │ gzip:   2.31 kB
dist/assets/ProductsManager-BH1BahUt.js                        7.52 kB │ gzip:   2.54 kB
dist/assets/Dashboard-CM8ZTIEm.js                              7.28 kB │ gzip:   2.56 kB
dist/assets/Store-uAIrx1qt.js                                  7.20 kB │ gzip:   2.32 kB
dist/assets/OrdersManager-ZxZiOYaK.js                          6.05 kB │ gzip:   1.93 kB
dist/assets/Home-DYrmVynq.js                                   5.62 kB │ gzip:   2.16 kB
dist/assets/Articles-BUlIX1gN.js                               5.24 kB │ gzip:   1.89 kB
dist/assets/Chronicles-bnCRqLVH.js                             5.24 kB │ gzip:   1.89 kB
dist/assets/Login-BEhOkwa3.js                                  3.96 kB │ gzip:   1.47 kB
dist/assets/Orders-DPeVNka4.js                                 3.54 kB │ gzip:   1.35 kB
dist/assets/About-8FlrA3fa.js                                  1.36 kB │ gzip:   0.67 kB
```
(+ chunks compartilhados de `services/`/componentes usados pelas páginas debaixo do gonzo.)

**Aviso de ">500 kB":** **ainda presente** — o chunk principal (776 kB gzip 209 kB) concentra
o shell + vendors (React, react-dom, `react-router`, **Firebase SDK**, **framer-motion**,
lucide-react, contexts/Header/Footer/CartDrawer/InstallPrompt). Tirar as 20 páginas de rotas
reduziu o chunk inicial em ~24%, mas o aviso só some com split de vendor
(`build.rollupOptions.output.manualChunks`), que **é uma mudança de config de build fora do
escopo desta OS** (a OS escopou `React.lazy`). Atende ao DoD pela cláusula "ou o chunk
principal cai claramente". Ver Decisões.

PWA precache: **77 → 120 entries** (mais chunks = mais entradas; custo aceitável).

## Imagens — lazy vs eager

**`loading="lazy"` + `decoding="async"` (abaixo da dobra):**
- `Home.jsx` — cards de "Últimos Conteúdos"
- `Articles.jsx` — imagem do destaque + cards
- `Chronicles.jsx` — imagem do destaque + cards
- `Store.jsx` — card de produto + imagem do modal
- `ArticleDetail.jsx` — imagem do artigo + cards "Artigos Relacionados"
- `Checkout.jsx` — itens do resumo do pedido
- `CartDrawer.jsx` — itens do carrinho
- `CommentItem.jsx` — avatar de comentário
- `PixPaymentForm.jsx` — QR code PIX
- `Footer.jsx` — logo do rodapé
- `admin/Dashboard.jsx`, `admin/ProductsManager.jsx` — miniaturas das tabelas
- `admin/ProductEditor.jsx`, `admin/ArticleEditor.jsx` — previews de imagem

**Eager (críticas acima da dobra):**
- `Header.jsx` — logo do header (SVG pequeno `logo-symbol.svg`)
- `Home.jsx` — hero da Home (recebeu `fetchpriority="high"`)

**`srcset`:** não aplicado. As imagens são URL única (Firestore ou placeholder) sem variantes
de tamanho — `srcset` sem fontes reais seria `srcset` morto. Decisão registrada conforme
sugerido pela própria OS.

## Revisão de contraste — `grep text-white`

Comando executado antes de qualquer alteração:
```
grep -rn "text-white" src --include="*.jsx" | grep -v "__tests__"
```
Resultado **antes** (5 ocorrências, todas sobre `bg-primary` terracota):
```
src/pages/admin/OrderDetailAdmin.jsx:179  : 'bg-primary text-white hover:bg-primary/90'
src/pages/admin/OrderDetailAdmin.jsx:375  : 'bg-primary text-white hover:bg-primary/90'
src/pages/admin/OrdersManager.jsx:177    ? 'bg-primary text-white'
src/components/layout/Header.jsx:68       bg-primary text-white ...
src/components/features/textToSpeech/TextSelectionControls.jsx:103  bg-primary text-white ...
```
Resultado **depois**: `text-white` sem ocorrências fora dos `__tests__` (comando acima não
imprime nada). Nenhuma podia ser "legítima" — todas eram texto branco-puro sobre terracota;
convertidas para `text-background` (`#F7F1E7`) conforme spec §3. O `text-white` restante nos
`__tests__` são `expect` de testes pré-existentes (ex.: snapshots) — não alterados, fora de
escopo.

## Revisão de alvos de toque ≥ 44×44

**Ajustados (consumidor):** fechar do CartDrawer, remover item, quantidade `+`/`−`
(`w-8`→`w-11`), fechar modal da loja, compartilhar (ArticleDetail), curtir (LikeButton,
`py-3`), carrinho e menu de usuário do Header (`p-3`), itens do dropdown do usuário
(`min-h-[44px]`), botões do player de áudio (parar/expandir), controles de seleção de texto
(play/stop/fechar, `min-h/min-w 44`), redes sociais do footer (`w-11`), botão/fechar do
InstallPrompt, botões editar/excluir das tabelas de admin (Dashboard/Products/Suppliers).

**Mantidos e validados:** `Button` já com `min-h-[44px]`; bottom tab bar (h-16 = 64px);
play do TTS (w-12 h-12). Menos de 44 só onde **intencionalmente mantido** — ver Decisões
(toolbar de formatação do editor admin).

## Testes

Servidor de dev **desligado**. Duas execuções consecutivas pós-change:

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

- Baseline documentada (PROJECT_STATE §0): **298 testes, 284 passando, 14 falhas
  pré-existentes conhecidas**. Resultado **idêntico à baseline** — nenhuma falha nova
  introduzida pelo `React.lazy`/`Suspense` (os testes renderizam componentes direto, não via
  `App`/rotas) nem pelas alterações de imagem/estilo.
- 14 falhas = as mesmas da baseline (DT-02): `validators` (4), `commentService` (3),
  `likeService` (2), `userService` (2), `BoletoPaymentForm` (2), `CommentItem` (1). Confirmado
  por diff dos nomes dos testes falhando vs. baseline.
- `npm run test:rules`: **não executado — não é exigido nesta OS** (nenhuma mudança em
  `firestore.rules`).

## DoD

- [x] Rotas convertidas para `React.lazy` + `Suspense` em `src/App.jsx`; chunk inicial
      reduzido de **1.014,74 kB → 776,36 kB** (gzip 260,69 → 208,79 kB) — "cai claramente"
      (~23%). Aviso de ">500 kB" **persiste** no chunk principal por causa de libs vendor
      eager (Firebase/framer-motion) — ver Decisões; para o aviso sumir seria preciso
      `manualChunks` (fora do escopo).
- [x] `loading="lazy"` (+ `decoding="async"`) nos `<img>` abaixo da dobra; hero da Home e
      logo do Header **não** lazy (hero com `fetchpriority="high"`).
- [x] `grep "text-white"` (fora de tests) revisado — **0 ocorrências** após conversão para
      `text-background` (resultado colado acima).
- [x] Alvos de toque ≥44px conferidos e ajustados; ver execção documentada na toolbar do
      editor admin em "Decisões".
- [x] `npx vitest run` (2x, dev server desligado) **sem novas falhas** (284/298, baseline).
- [x] `npx vite build` limpo, com chunk inicial menor (prova objetiva acima).
- [~] Lighthouse mobile ≥ 90 — **a validar em produção**: o ambiente não tem `.env` com
      Firebase real, o app não monta, e Lighthouse precisa do app rodando. **Não inventado
      número** (honestidade §9.5).
- [x] **Arquivo de report gerado** (`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_010.md`).

## Decisões / ambiguidades

1. **Aviso ">500 kB" persistente:** o escopo da OS era code-splitting de rotas via
   `React.lazy`. O chunk principal ainda é 776 kB porque `firebase`/`framer-motion`/shell
   continuam eager. Remover o aviso exigiria `manualChunks` (config de build) — **não**
   implementado por estar fora do escopo ("o CLI Agent nunca decide o que fazer além do que
   está na OS"). Na dúvida, atendi o DoD pela cláusula "ou o chunk principal cai claramente".
   **Recomendo ao CTO** avaliar uma micro-OS de `manualChunks` para eliminar o aviso.
2. **`srcset` não aplicado:** imagens são URL única (sem variantes), conforme a própria OS
   orientou ("não force srcset se não há fontes responsivas").
3. **Imagens de destaque de `Articles.jsx`/`Chronicles.jsx`** (topo da lista) receberam
   `lazy` — a OS listou os arquivos inteiros como alvo e só eximiu a hero da Home e o logo;
   se o CTO quiser LCP mais agressivo nessas páginas, elas podem voltar a eager.
4. **QR code PIX (`PixPaymentForm`)** é data URI (base64) — `loading="lazy"` não tem efeito
   prático, mas foi aplicado por constar na lista de arquivos da OS (inofensivo).
5. **Toolbar de formatação do `admin/ArticleEditor` (Negrito/Itálico/Sublinhado):** mantida
   em `p-2` (~34px). São controles de editor de texto rico (com atalhos de teclado) e subir
   para 44px estouraria a largura da toolbar no card estreito do editor em mobile — um padrão
   de exceção comum em editores. **Aberto para validação do CTO.**
6. **Lighthouse [~]:** não mensurável neste ambiente; validar em produção após deploy.

## Dívidas técnicas identificadas

- **DT-PERF-01 (BAIXA):** Chunk principal ainda 776 kB (aviso ">500 kB") por falta de split
  de vendor (`manualChunks`). Melhoraria adicional fora do escopo desta OS; ver Decisões §1.

## Observações para o CTO

- Nenhuma lógica de dados, serviço, hook ou pagamento foi tocada (proibido pela OS).
  `src/lib/sanitize.js` intocado. Code-splitting é só forma de import.
- `dist/index.html` revertido após cada build; nada de `dist/` commitado.
- Branch pronta para revisão — **sem merge, sem push** (instrução da OS).
- A validação de Lighthouse/perf real fica para produção (app não monta localmente sem `.env`
  do Firebase — estado pré-existente).