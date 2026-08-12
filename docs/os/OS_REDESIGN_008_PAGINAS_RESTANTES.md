# OS_REDESIGN_008 — Páginas restantes + limpeza final de cores cruas

**Status:** ✅ Concluída — commit `464571f` na branch `feature/os-008-paginas-restantes`
**Branch:** criar `feature/os-008-paginas-restantes` a partir de `develop` — nunca em
`main` (ver `AGENTS.md` §9.7). **Passo zero, antes de qualquer edição.**
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Depende de:** OS_REDESIGN_001 a 007 (design system, componentes e telas principais já
prontos — esta é a varredura final)

---

## Leitura obrigatória antes de começar (nesta ordem)

1. `AGENTS.md` (governança, disciplina de branch, DoD, sanções)
2. `PROJECT_CONTEXT.md`
3. `PROJECT_STATE.md` (baseline de testes e dívidas técnicas conhecidas)
4. Esta OS
5. `PROJECT_SPEC.md` — §3 (paleta **e a exceção de cores funcionais**), §4, §5.1, §5.3
6. Referências já aprovadas: `src/pages/Home.jsx`, `src/pages/ArticleDetail.jsx`,
   `src/pages/Checkout.jsx` (padrões de cor/token pós-OS_007)

## Passo zero (obrigatório)

```bash
git checkout develop
git checkout -b feature/os-008-paginas-restantes
git branch --show-current   # DEVE imprimir feature/os-008-paginas-restantes
```

---

## Escopo

Esta é a **varredura final de cores cruas** do redesign + reskin simples das páginas que
ainda não passaram por OS dedicada. Reskin visual apenas — sem redesenho estrutural (a
spec não detalha essas telas) e sem tocar lógica.

### A) Páginas restantes (reskin simples, herdando tokens/componentes)

- `src/pages/Login.jsx` (4 cores cruas)
- `src/pages/SignUp.jsx` (14)
- `src/pages/Orders.jsx` (4)
- `src/pages/OrderDetail.jsx` (6)
- `src/pages/About.jsx` (já limpo — conferir, provavelmente nada a fazer)

### B) Componentes compartilhados que ainda têm cor crua (limpeza)

- `src/components/layout/Header.jsx` (dropdown de usuário: `bg-white`/`border-gray-200`/
  `hover:bg-gray-50`)
- `src/components/layout/Footer.jsx` (`text-white`, `bg-gray-700`, `text-gray-*` — atenção
  à regra de contraste §3: sobre oliva use `#F7F1E7`, não branco puro)
- `src/components/features/cart/CartDrawer.jsx`
- `src/components/features/comments/CommentForm.jsx`,
  `src/components/features/comments/CommentsSection.jsx` (cinzas residuais)
- `src/components/orders/OrderCard.jsx`, `OrderStatusBadge.jsx`, `OrderTimeline.jsx`
- `src/components/features/likes/LikeButton.jsx` (converter cinzas para tokens; o
  **vermelho do coração curtido é funcional** — mantém, conforme exceção do spec §3)

### Regra da conversão

- Cinza frio / azul / preto puro (`gray-*`, `blue-*`, `indigo-*`, `slate-*`) → tokens da
  paleta (`background`/`surface`/`text-primary`/`text-secondary`/`borda`/`areia`/`neutro`),
  **caso a caso** (não find-and-replace cego).
- **Cores funcionais são permitidas e devem ser mantidas** (exceção do `PROJECT_SPEC.md`
  §3, aprovada em 2026-08-12): verde=sucesso, vermelho=erro/validação/curtido,
  dourado=aviso. Ex.: badges de status de pedido (`OrderStatusBadge`) podem usar
  verde/vermelho/dourado para o significado; só o cinza frio "neutro" vira `areia`/`neutro`.
- Contraste (§3): nunca branco puro sobre terracota/oliva/tinta — usar `#F7F1E7`.

## Armadilhas conhecidas (não repita)

- **NÃO** crie objeto `CATEGORY_BADGES` com chaves no singular (removido nas OS_004/005).
- Rode `npx vitest run` com o **servidor de dev DESLIGADO**.
- Se o build modificar `dist/index.html`, reverta: `git checkout -- dist/index.html`.
- **NÃO** toque em `src/lib/sanitize.js`, nem em lógica de serviços/hooks.
- **NÃO** faça merge nem `git push` — deixe a branch pronta para o CTO revisar.

## Fora de escopo

- `src/pages/admin/*` — telas internas, não detalhadas na spec; herdam tokens via
  `Button`/`Card`. **Não** entram nesta varredura.
- Redesenho estrutural de qualquer tela (só cor/token, mantendo layout).
- Lógica de qualquer serviço, hook ou cálculo.

---

## Definition of Done

- [ ] Reskin das 5 páginas (A) e limpeza dos componentes (B) aplicados com tokens da paleta
- [ ] `grep -rlE "gray-[0-9]|blue-[0-9]|indigo-[0-9]|slate-[0-9]" src --include="*.jsx"`,
      **excluindo `src/pages/admin/` e `__tests__`**, retorna **vazio** (só devem restar
      cores **funcionais** — `red-*`/`green-*`/`dourado`, que são permitidas)
- [ ] Nenhuma mudança de lógica (só classes/markup visuais)
- [ ] `npx vitest run` (2 execuções consecutivas, dev server desligado) **sem novas falhas**
      (baseline: 284 passando / 14 falhas pré-existentes / 298 total — ver `PROJECT_STATE.md`)
- [ ] `npx vite build` limpo (warning de chunk >500KB é pré-existente, ok)
- [ ] Conferência visual na medida do possível no ambiente; ser honesto no report sobre o
      que não deu para verificar ao vivo (Firebase de placeholder pode impedir a navegação)
- [ ] **Arquivo de report gerado (ver "Entrega obrigatória" abaixo)**

---

## Entrega obrigatória — arquivo de report para análise

Ao final, o agente **DEVE** criar `docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_008.md`
seguindo o template do `AGENTS.md` §6.3. **Sem esse arquivo, a OS NÃO está concluída** — é
o que o CTO vai ler para analisar e aprovar (ou devolver). Precisa conter, no mínimo:

- **Escopo implementado** (o que mudou, por arquivo)
- **Arquivos alterados** (tabela)
- **Testes**: a linha de resultado (`Test Files`/`Tests`) das **2 execuções**, colada literal
- **Build**: resultado do `npx vite build`
- **Resultado do grep de cores cruas** do DoD (colar a saída — deve estar vazia fora de
  admin/tests, ou listar só o que for funcional com justificativa)
- **DoD**: cada item marcado com honestidade (`[x]`/`[ ]`/`[~]` com motivo)
- **Decisões / ambiguidades resolvidas**
- **Dívidas técnicas identificadas**
- **Observações para o CTO**

Depois do report, faça o(s) commit(s) na branch `feature/os-008-paginas-restantes`
(Conventional Commits, terminando com
`Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`) e **pare** — sem merge, sem push.

---

## Arquivos a alterar (resumo)

**Páginas:** `About.jsx`, `Login.jsx`, `SignUp.jsx`, `Orders.jsx`, `OrderDetail.jsx`
**Componentes:** `layout/Header.jsx`, `layout/Footer.jsx`, `features/cart/CartDrawer.jsx`,
`features/comments/CommentForm.jsx`, `features/comments/CommentsSection.jsx`,
`features/likes/LikeButton.jsx`, `orders/OrderCard.jsx`, `orders/OrderStatusBadge.jsx`,
`orders/OrderTimeline.jsx`
**Novo:** `docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_008.md` (o report)
