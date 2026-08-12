# OS_REDESIGN_010 — Performance e revisão final

**Status:** 🔲 Não iniciada
**Branch:** criar `feature/os-010-performance` a partir de `develop` — nunca em `main`
(ver `AGENTS.md` §9.7). **Passo zero, antes de qualquer edição.**
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Depende de:** todas as OS anteriores (é a revisão transversal que fecha o redesign)

---

## Leitura obrigatória antes de começar (nesta ordem)

1. `AGENTS.md`  2. `PROJECT_CONTEXT.md`  3. `PROJECT_STATE.md`  4. Esta OS
5. `PROJECT_SPEC.md` — §3 (regra de contraste), §5.1 (alvo de toque 44px), §6.2/§6.5
   (performance, lazy-load), §4 (`font-display: swap`)

## Passo zero (obrigatório)

```bash
git checkout develop
git checkout -b feature/os-010-performance
git branch --show-current   # DEVE imprimir feature/os-010-performance
```

---

## Contexto medido (estado atual, antes da OS)

- **Bundle:** um único chunk JS de ~**1.014 KB** (260 KB gzip) — o build emite o aviso
  "Some chunks are larger than 500 kB". As 21 páginas (incluindo 8 telas de `admin/`,
  usadas só por admin) são **todas importadas eager** em `src/App.jsx` — nenhum
  `React.lazy`/`Suspense` hoje.
- **Imagens:** 20 `<img>` em `src/`, **nenhum** com `loading="lazy"`.

## Escopo

### 1. Code-splitting de rotas (o maior ganho, e o mais mensurável)

- Converter os imports de página em `src/App.jsx` para `React.lazy(() => import(...))` e
  envolver as `<Routes>` num `<Suspense fallback={<...spinner...>}>`.
- **Prioridade:** as 8 telas de `pages/admin/*` (Dashboard, ArticleEditor,
  ProductsManager, ProductEditor, SuppliersManager, SupplierEditor, OrdersManager,
  OrderDetailAdmin) — são pesadas e só carregadas por admin; tirá-las do bundle inicial
  é o maior ganho para o visitante comum. Pode-se aplicar `lazy` a todas as páginas de
  rota.
- Fallback do `Suspense`: um spinner centralizado simples (reaproveitar o padrão
  `animate-spin ... border-primary` já usado nas páginas).
- **Meta concreta e verificável:** o chunk JS inicial cai de forma clara e o aviso de
  ">500 kB" some (ou o chunk principal fica bem abaixo de 500 KB). **Colar no report o
  tamanho dos chunks antes e depois.**

### 2. Lazy-load de imagens

- Adicionar `loading="lazy"` (e `decoding="async"`) aos `<img>` **abaixo da dobra**:
  imagens de card (Home/Articles/Chronicles/Store), imagem do artigo e relacionados
  (ArticleDetail), itens do carrinho (CartDrawer), avatar de comentário (CommentItem),
  produtos (admin).
- **NÃO** aplicar `loading="lazy"` a imagens críticas acima da dobra: a imagem do **hero
  da Home** e o **logo do Header** (o logo é SVG pequeno; a hero deve carregar cedo —
  pode até receber `fetchpriority="high"`).
- `srcset`: as imagens hoje são URL única (Firestore/placeholder) sem variantes de
  tamanho — **não force `srcset`** se não há fontes responsivas; se aplicar, que seja só
  onde houver tamanhos reais. Registrar a decisão no report.

### 3. Revisão final de contraste (spec §3)

- Garantir que **não há branco puro** (`text-white`, `#FFF`, `bg-white` como texto/ícone)
  sobre terracota/oliva/tinta — deve ser `text-background` (`#F7F1E7`). Rodar
  `grep -rn "text-white" src --include="*.jsx" | grep -v "__tests__"` e revisar cada
  ocorrência (algumas podem ser legítimas sobre fundo escuro não-paleta? não deve haver —
  converter). Colar o resultado do grep no report.

### 4. Revisão final de alvos de toque (spec §5.1)

- Conferir que botões e ícones clicáveis têm alvo ≥ 44×44px. O componente `Button` já
  garante `min-h-[44px]`; a atenção é para **botões só-ícone** (fechar/compartilhar/
  social/curtir) que possam estar menores — ajustar padding/tamanho onde necessário.

## Armadilhas conhecidas (não repita)

- Rode `npx vitest run` com o **servidor de dev DESLIGADO**. Atenção: `React.lazy` +
  `Suspense` em `App.jsx` **não deve** quebrar os testes (eles renderizam componentes
  direto, não via App/rotas) — mas **confirme** a baseline 284/298 depois.
- Se o build modificar `dist/index.html`, reverta: `git checkout -- dist/index.html`.
- **NÃO** toque em `src/lib/sanitize.js`, nem em lógica de serviços/hooks/pagamento.
  Code-splitting é só a forma de import, não muda comportamento.
- **NÃO** faça merge nem `git push` — deixe a branch pronta para o CTO revisar.

## Fora de escopo / limitação honesta do ambiente

- **Lighthouse ≥ 90 NÃO é medível de forma confiável aqui:** o ambiente não tem `.env`
  com Firebase real, o app não monta, e Lighthouse precisa do app rodando. **Não invente
  um número de Lighthouse.** O DoD de Lighthouse fica **`[~]` a validar em
  produção/staging** após o deploy. O que é mensurável aqui é o **tamanho do bundle**
  (build) — use isso como prova objetiva do ganho de performance.
- `pages/admin/*` entram **apenas** no code-splitting (lazy import) e no lazy de imagens;
  sem redesenho visual.

---

## Definition of Done

- [ ] Rotas convertidas para `React.lazy` + `Suspense` em `src/App.jsx`; **chunk inicial
      reduzido** (colar tamanhos antes/depois; aviso de >500 KB some ou chunk principal
      cai claramente)
- [ ] `loading="lazy"` (+ `decoding="async"`) nos `<img>` abaixo da dobra; hero da Home e
      logo do Header **não** lazy
- [ ] `grep "text-white"` (fora de tests) revisado — sem branco puro sobre paleta escura
      (colar resultado no report)
- [ ] Alvos de toque ≥44px conferidos (com atenção a botões só-ícone)
- [ ] `npx vitest run` (2x, dev server desligado) **sem novas falhas** (baseline 284/298)
- [ ] `npx vite build` limpo (e com o bundle inicial menor que hoje)
- [~] Lighthouse mobile ≥ 90 (Perf/A11y/Best Practices/SEO) — **a validar em produção**
      (não medível neste ambiente; não inventar número)
- [ ] **Arquivo de report gerado (ver "Entrega obrigatória" abaixo)**

---

## Entrega obrigatória — arquivo de report para análise

Ao final, o agente **DEVE** criar `docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_010.md`
(template do `AGENTS.md` §6.3). **Sem esse arquivo, a OS NÃO está concluída.** Precisa
conter, no mínimo:

- **Escopo implementado** (o que mudou, por arquivo)
- **Arquivos alterados** (tabela)
- **Bundle antes × depois** (tamanho dos chunks JS do `npx vite build` — a prova objetiva
  do ganho; dizer se o aviso de >500 KB sumiu)
- **Imagens:** quais receberam `loading="lazy"` e quais ficaram eager (e por quê)
- **Resultado do grep `text-white`** (contraste)
- **Testes:** linha de resultado das **2 execuções**, literal
- **DoD** com honestidade (`[x]`/`[ ]`/`[~]` com motivo — em especial o Lighthouse `[~]`)
- **Decisões / ambiguidades**, **dívidas técnicas**, **observações para o CTO**

Depois do report, commit(s) na branch `feature/os-010-performance` (Conventional Commits,
terminando com `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`) e **pare** —
sem merge, sem push.

---

## Arquivos a alterar (resumo)

- `src/App.jsx` (React.lazy + Suspense)
- `<img>` abaixo da dobra em: `pages/Home.jsx` (só os cards, não a hero),
  `pages/Articles.jsx`, `pages/Chronicles.jsx`, `pages/Store.jsx`,
  `pages/ArticleDetail.jsx`, `pages/Checkout.jsx`, `components/features/cart/CartDrawer.jsx`,
  `components/features/comments/CommentItem.jsx`, `components/checkout/PixPaymentForm.jsx`,
  e as telas `pages/admin/*` com imagem
- Ajustes pontuais de contraste/toque onde o grep/revisão apontar
- `docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_010.md` (novo — o report)
