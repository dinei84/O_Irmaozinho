# OS_HARDENING_001 — R-08 (pedido no servidor) + lint + triagem de testes + CI/CD

**Status:** 🔲 Não iniciada
**Branch:** criar `feature/hardening-001` a partir de `develop` — nunca em `main`
(ver `AGENTS.md` §9.7). **Passo zero, antes de qualquer edição.**
**Roadmap/fonte:** `PLANO_DE_ACAO.md` (Fase 0 R-08, Fase 5.1 CI/CD),
`docs/seguranca/RELATORIO_SPRINT_0.md` (V-02), `PROJECT_STATE.md` (DT-01, DT-02).

> **Nota do CTO:** esta OS junta 4 frentes por decisão do PO ("fazer tudo de uma vez").
> A **Parte A (R-08) é a mais crítica e arriscada** — é a correção de segurança nº 1 do
> plano. Ela merece o maior escrutínio no report. As 4 partes são **independentes**: cada
> uma tem sua própria prova. **Ordem obrigatória: A → B → C → D** (o CI da Parte D só
> fica verde depois que o lint da B e os testes da C estiverem sãos).

## Regra de report desta OS (o PO vai usar para conferir se a entrega foi real)

Para **cada parte**, o report precisa de **prova reexecutável** — não basta "feito":
- O **comando exato** que comprova, com o **output literal colado** (antes e depois quando fizer sentido).
- Um **passo de verificação que o CTO/PO possa rodar sozinho** e chegar ao mesmo resultado.
- DoD honesto (`[x]`/`[ ]`/`[~]`), dizendo o que **não** deu para provar no ambiente (ex.: run de CI real no GitHub, checkout com pagamento real) — sem inventar.

Marcar qualquer item como feito sem a prova literal = invalidação (`AGENTS.md` §9.5).

---

# Parte A — R-08: criar o pedido no servidor (fecha a V-02)

**Problema (V-02):** hoje o pedido é montado no **cliente** — `src/pages/Checkout.jsx`
calcula `subtotal`/`finalTotal` a partir do carrinho no `localStorage` (linhas ~191–194) e
`src/services/orderService.js::createOrder` faz `addDoc` direto em `orders`. A rule
`isValidOrder` só checa `finalTotal is number >= 0` — **aceita qualquer valor**. Um
atacante edita o carrinho e cria um pedido de R$ 0,01.

**Correção:**
1. **Nova Cloud Function `createOrder`** (callable, em `functions/index.js`) que recebe
   **apenas** `items: [{ productId, quantity }]` + `customer` + `shippingAddress` +
   `paymentMethod` (e frete, se houver cálculo). **Nunca** recebe preço/subtotal/total do
   cliente. Ela:
   - Autentica (`context.auth`), valida input.
   - Busca o **preço real** de cada `productId` na coleção `products` (Admin SDK).
   - Valida estoque/disponibilidade (`active`, e estoque se aplicável).
   - Calcula `subtotal`/`shipping`/`finalTotal` **no servidor**.
   - Grava o pedido via Admin SDK (bypassa as rules) com `orderStatus: 'pending'`.
   - Retorna o `orderId`. O `createPaymentIntent` já lê `order.finalTotal` do banco — agora
     esse valor é confiável ponta a ponta.
2. **`firestore.rules`:** trocar o `allow create` de `/orders` para **`if false`** (ou só
   `isAdmin()`), já que o pedido passa a nascer só via function/Admin SDK. Manter os
   `allow read/update/delete` como estão (dono lê/cancela, admin tudo).
3. **Cliente:** `orderService.js::createOrder` passa a **chamar a callable**
   (`httpsCallable(functions, 'createOrder')`) em vez de `addDoc`; `Checkout.jsx` para de
   calcular e enviar preço/total — envia só `productId`+`quantity`+dados de entrega.
4. **Testes de rules** (`firestore.rules.test.js`): um teste provando que um usuário comum
   **NÃO** consegue mais `create` em `orders` direto (o exploit falha), e que o fluxo
   legítimo (dono lê/cancela) segue funcionando. (Testes da própria function com emulador
   são desejáveis; se não der, registrar.)

**Prova exigida no report (Parte A):**
- `npm run test:rules` com o **novo teste passando** (output literal) — o teste "usuário
  comum não cria pedido direto" é a prova de que a V-02 fechou pela regra.
- Trecho do código da nova function `createOrder` mostrando que o preço vem de `products`,
  não do cliente.
- Descrição do fluxo de checkout pós-mudança (o cliente não envia mais preço).
- **Limitação honesta:** checkout com pagamento real precisa de deploy/Firebase real — se
  não der para rodar aqui, dizer isso; a prova local é o teste de rules + o teste da
  function no emulador.

---

# Parte B — DT-01: consertar o `npm run lint`

**Problema:** `npx eslint .` falha ("Oops! Something went wrong") — não existe config do
ESLint, apesar de `eslint@8`, `eslint-plugin-react`, `-react-hooks`, `-react-refresh`
estarem instalados.

**Correção:**
- Criar config do ESLint 8 (`.eslintrc.cjs` legado, ou `eslint.config.js` flat — escolher
  e justificar) para React + Vite (browser, JSX, ES2022, hooks, react-refresh).
- `functions/` é Node CommonJS — precisa de override/config próprio (env node) ou ser
  ignorado pelo lint do front (registrar a decisão).
- Rodar `npm run lint` e deixar **passando**. Se houver muitos erros pré-existentes reais,
  a estratégia aceitável é: corrigir os triviais e baixar para `warn` (não `error`) o que
  for volumoso/estilístico, deixando o comando **verde**, e registrar no report quantos
  erros/warnings restaram e por quê. **Não** desligar regras críticas (ex.: `react-hooks/
  rules-of-hooks`) só para passar.

**Prova exigida no report (Parte B):**
- `npx eslint .` **antes** (o erro atual) e **depois** (colar o output — 0 erros; dizer
  quantos warnings).
- O arquivo de config criado (nome + resumo do que ativa).

---

# Parte C — DT-02: triagem dos 14 testes que falham

**Problema:** `npx vitest run` = 284 passando / **14 falhando** (baseline pré-existente).
São: `validators.test.js` (4), `commentService.test.js` (3), `likeService.test.js` (2),
`userService.test.js` (2), `BoletoPaymentForm.test.jsx` (2), `CommentItem.test.jsx` (1).

**Correção:**
- Investigar **cada uma** das 14. Para cada: dizer a **causa raiz** e a **disposição** —
  corrigida (teste ou código), ou deixada com justificativa técnica clara (e virar DT
  específica). O objetivo é **maximizar** o número de testes verdes de forma honesta —
  **não** apagar/`skip` teste para "sumir" com a falha (isso é falsificação, §9.5). Se um
  teste estiver testando algo errado, corrigir o teste é legítimo (explicando).
- **Atenção:** se a Parte A mudou `orderService`/rules, alguns testes de checkout/order
  podem precisar de ajuste legítimo — separar claramente "ajuste por causa do R-08" de
  "correção de falha pré-existente".

**Prova exigida no report (Parte C):**
- **Tabela das 14** (arquivo + nome do teste → causa raiz → corrigida/deferida + motivo).
- `npx vitest run` **antes** (284/14) e **depois** (novo número), output literal das 2
  execuções finais. A nova baseline vira a referência em `PROJECT_STATE.md`.

---

# Parte D — CI/CD (GitHub Actions) — depende de B e C sãos

**Correção:**
1. **Workflow de CI** (`.github/workflows/ci.yml`): em `pull_request` e `push` para
   `develop`/`main` → `npm ci` → `npm run lint` → `npx vitest run` → `npm run build` →
   `npm run test:rules` (este precisa de **Java** no runner para o emulador do Firestore —
   usar `actions/setup-java`). Todos precisam passar (por isso B e C antes).
2. **Workflow de CD** (`.github/workflows/deploy.yml`): em `push` para `main` → build +
   `firebase deploy --only hosting` usando um **secret do GitHub** (`FIREBASE_TOKEN` ou
   service account) — **o PO cria o secret no GitHub**, o workflow só o referencia. Deploy
   de `functions`/`rules` fica **manual** (aprovação humana), conforme `PLANO_DE_ACAO.md`
   5.1. **Não** commitar nenhum token.
3. **`firebase.json`:** adicionar `predeploy` no hosting para buildar antes
   (`"predeploy": ["npm run build"]`) — evita publicar `dist/` velho.
4. **Branch protection** na `main` (proibir push direto, exigir o CI verde): é config do
   **GitHub** (UI/API) — **o PO faz**; documentar o passo no report, não é arquivo do repo.

**Prova exigida no report (Parte D):**
- Os arquivos de workflow criados (conteúdo).
- **Validação de sintaxe** dos YAML localmente (ex.: `yamllint` ou parse) — colar.
- **Limitação honesta:** o **run verde real** do CI só acontece no GitHub após o push —
  não é verificável neste ambiente. O report deve dizer isso e deixar o link do primeiro
  run como item a confirmar pós-push. Não afirmar "CI passou" sem o run real.
- Passo documentado para o PO: criar o secret e ligar branch protection.

---

## DoD consolidado

- [ ] **A:** `createOrder` server-side criado; `orders` create nas rules = `if false`/admin;
      cliente não envia mais preço; **teste de rules provando que o create direto falha**
      passa (`npm run test:rules`)
- [ ] **B:** config de ESLint criada; `npx eslint .` **verde** (0 erros); output antes/depois
- [ ] **C:** 14 testes triados um a um (tabela); nova contagem de `vitest run` (2 execuções,
      literal); `PROJECT_STATE.md` atualizado com a nova baseline
- [ ] **D:** workflows de CI e CD criados + `predeploy` no `firebase.json`; sintaxe validada;
      passo de secret/branch-protection documentado para o PO
- [ ] `npx vite build` limpo
- [ ] **`docs/execution-reports/EXECUTION_REPORT_OS_HARDENING_001.md`** gerado — com a prova
      reexecutável de cada parte (ver "Regra de report" no topo)
- [~] Itens que **exigem produção/GitHub** e ficam a validar depois: checkout com pagamento
      real (A), run verde do CI (D), branch protection efetiva (D) — marcar honestamente

## Armadilhas / regras

- Rode `npx vitest run` com o **dev server DESLIGADO**.
- Se o build mexer no `dist/index.html`, reverta (`git checkout -- dist/index.html`).
- **NÃO** committar segredos (token do Firebase/MP) — só via GitHub Secrets / secret manager.
- Commits por intenção lógica (A, B, C, D em commits separados — 1 por parte no mínimo).
- **NÃO** faça merge nem `git push` — deixe a branch pronta para o CTO revisar.

## Ordem de execução obrigatória

**A (R-08)** → **B (lint)** → **C (testes, já contando o efeito do A)** → **D (CI/CD, que
depende de B e C verdes)**.
