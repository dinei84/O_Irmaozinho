# OS_DEPLOY_002 — Deploy consolidado (Sprint 0 + R-08 + OS_PAYMENT_001)

**Status:** 🔲 Não executada
**Tipo:** operacional (deploy em produção) — **não é OS de código**.
**Substitui:** [`OS_DEPLOY_SPRINT0.md`](./OS_DEPLOY_SPRINT0.md), cujas baselines e avisos
estão desatualizados (ver §0).
**Projeto Firebase:** `admoirmaozinho` (`.firebaserc`)
**Commit alvo:** `main` @ `d783afa` (sincronizada com `origin/main`)
**Data de preparação:** 2026-08-19

---

## 0. O que mudou desde o runbook anterior

O `OS_DEPLOY_SPRINT0.md` foi escrito quando o Sprint 0 era a única coisa pendente. Não use
mais aquele arquivo: quatro pontos dele estão factualmente errados hoje.

| O que aquele runbook diz | Realidade em 2026-08-19 |
|---|---|
| "baseline 284/298, 14 falhas pré-existentes" | **343/343 passando** (verificado, §2) |
| "test:rules 19/19" | **23/23 passando** (verificado, §2) |
| "⚠️ V-02 continua aberta — decisão de produto obrigatória antes de abrir a loja" | **V-02 fechada** pelo R-08 (`createOrder` no servidor, OS_HARDENING_001). E a loja está fora do ar de qualquer forma (§1) |
| "as functions declaram `secrets: ['MERCADOPAGO_ACCESS_TOKEN']`" | Declaram `paymentConfig.getRequiredSecrets()` (OS_PAYMENT_001). O secret exigido continua sendo o mesmo — só o caminho mudou |

---

## 1. O que este deploy publica

Três levas de trabalho que nunca foram a produção, mais a página de construção:

1. **Sprint 0 de segurança** (`d41bf2a`) — fecha V-01/V-03/V-04/V-08 e adiciona os headers
   de segurança/CSP (R-06). Ver `docs/seguranca/RELATORIO_SPRINT_0.md`.
2. **R-08 / OS_HARDENING_001** — `createOrder` no servidor: o preço passa a vir de
   `products`, nunca do cliente. **É o que fecha a V-02** (fraude via `localStorage`).
3. **OS_PAYMENT_001** — abstração de gateway selada (roteamento por pedido, secrets
   centralizados, webhook sem formato do MP). Refatoração, sem mudança de comportamento.
4. **Loja em construção** — `/store` e `/checkout` passam a renderizar
   `StoreUnderConstruction.jsx`. **Efeito prático: nenhuma venda nova acontece em
   produção depois deste deploy**, por decisão do PO, até o meio de pagamento ser
   resolvido.

> **Consequência boa:** o item mais arriscado de todo deploy anterior — validar o checkout
> real com CSP nova e credencial nova — **sai do caminho crítico**. Não há checkout no ar
> para quebrar. Isso torna este deploy muito mais seguro do que o planejado no runbook antigo.

---

## 2. Pré-flight — JÁ EXECUTADO (2026-08-19, por agente CLI)

Tudo aqui é local e não toca produção. Resultados reais:

```
$ npx vitest run
 Test Files  21 passed (21)
      Tests  343 passed (343)

$ npm run test:rules          # emulador Firestore, 23 testes
 Test Files  1 passed (1)
      Tests  23 passed (23)
✔  Script exited successfully (code 0)

$ npm run lint
✖ 61 problems (0 errors, 61 warnings)

$ npx vite build
✓ built in 3.18s
```

Estado do repositório: `main` @ `d783afa`, working tree limpa, `git log origin/main..main`
vazio.

### ⚠️ A armadilha que o pré-flight revelou — leia antes de deployar

**`npm run build` passa mesmo SEM o `.env`, e publica um site quebrado.**

Prova (executada nesta máquina, que não tem `.env`):

```
$ npx vite build
build concluiu com status 0

$ grep -ohE "projectId:[^,]{0,40}" dist/assets/*.js
projectId:void 0
```

O Vite substitui `import.meta.env.VITE_*` por literais em tempo de build. Sem `.env`, ele
embute `undefined`, o build **sai com código 0**, e o app quebra no boot em produção com
`Variáveis de ambiente do Firebase faltando` (`src/lib/firebase.js:34`).

Como `firebase.json` tem `predeploy: ["npm run build"]`, um `firebase deploy --only hosting`
rodado sem `.env` **publica esse bundle quebrado sem nenhum aviso**. É o maior risco deste
deploy — maior que a CSP.

**Mitigação obrigatória (passo 3.2).** Um `.env.example` foi criado na raiz com a lista de
variáveis.

---

## 3. Passo a passo — PO (humano)

> As etapas abaixo envolvem credenciais e publicação em produção. Por `AGENTS.md` e pelas
> regras do agente, **não são executadas por agente CLI**.

### 3.1 Login e acesso

```bash
npx firebase login
npx firebase projects:list
```
- [ ] `admoirmaozinho` aparece na lista.

*(Verificado em 2026-08-19: a CLI desta máquina **não está autenticada** — `firebase
projects:list` retorna "Failed to authenticate". Este é o primeiro passo real.)*

### 3.2 Criar o `.env` do frontend — o passo que evita publicar site quebrado

```bash
cp .env.example .env
# preencher com os valores reais do console do Firebase
```

Depois, **prove que o build ficou bom**:

```bash
npm run build
grep -ohE "projectId:[^,]{0,40}" dist/assets/*.js
```
- [ ] A saída mostra `projectId:"admoirmaozinho"` — **não** `projectId:void 0`.

Se aparecer `void 0`, pare: o `.env` não foi lido. Não deploye.

### 3.3 Secret do Mercado Pago

A credencial antiga foi **revogada** (R-01) e a aplicação excluída. As três functions
declaram o secret via `paymentConfig.getRequiredSecrets()`, e **o deploy das functions falha
se o secret não existir** — mesmo com a loja fora do ar.

```bash
npx firebase functions:secrets:access MERCADOPAGO_ACCESS_TOKEN   # existe?
npx firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN      # se não existir
```
- [ ] Secret existe no Secret Manager.

Nunca colar o token em arquivo versionado. Como a loja está em construção, **não é urgente
que o token seja válido para operar** — mas ele precisa existir para o deploy passar.

### 3.4 Canal de preview (valida a CSP sem tocar produção)

```bash
npm run build
npx firebase hosting:channel:deploy csp-test
```

Abrir a URL do canal e verificar **no console do navegador**:
- [ ] Sem erro de CSP.
- [ ] O app monta (sem o erro de variáveis do Firebase).
- [ ] Login funciona (Firebase Auth via `connect-src`).
- [ ] Artigos e crônicas carregam do Firestore.
- [ ] `/store` mostra a página de construção; `/checkout` redireciona para ela.
- [ ] Service worker registra (DevTools > Application).

**Ponto de atenção da CSP:** `connect-src` não inclui `wss:`. O Firestore normalmente usa
HTTPS, mas se cair para WebSocket o console vai acusar bloqueio — é exatamente o tipo de
coisa que o canal de preview existe para pegar. As diretivas de `fonts.googleapis.com` /
`fonts.gstatic.com` são **vestigiais**: as fontes hoje são self-hosted via `@fontsource`
(`src/index.css`), então `font-src 'self'` já basta. Não removê-las agora — mexer em CSP
no mesmo deploy que estreia a CSP é acumular risco à toa.

### 3.5 Deploy — ordem importa

Rules primeiro (só restringem), functions depois (dependem do secret), hosting por último.

```bash
npx firebase deploy --only firestore:rules
npx firebase deploy --only functions
npx firebase deploy --only hosting
```

- [ ] Rules no ar
- [ ] Functions no ar (`createOrder`, `createPaymentIntent`, `checkPaymentStatus`, `handlePaymentWebhook`)
- [ ] Hosting promovido

### 3.6 Webhook do Mercado Pago

Depois do deploy das functions, confirmar no painel do MP que a URL do webhook aponta para:

```
https://us-central1-admoirmaozinho.cloudfunctions.net/handlePaymentWebhook
```
- [ ] URL conferida (não muda com este deploy, mas vale checar — as functions foram redeployadas).

---

## 4. Verificação pós-deploy

### Headers (R-06)
```bash
curl -sI https://admoirmaozinho.web.app | grep -iE "content-security-policy|strict-transport|x-content-type|x-frame|referrer-policy|permissions-policy"
```
- [ ] As 6 chaves presentes.

### Exploits que devem FALHAR (conta comum de teste)
- [ ] **V-03** — usuário tenta `update` em pedido de outro → negado pelas rules.
- [ ] **V-02/R-08** — usuário tenta criar documento em `orders` direto pelo SDK → **negado**
      (o pedido só nasce via `createOrder`). Esta é a prova nova deste deploy.
- [ ] **V-01** — `createPaymentIntent` com `amount` adulterado → ignorado; o valor vem de
      `order.finalTotal`. *(Só testável quando a loja voltar — ver §5.)*
- [ ] **V-04** — usuário comum tenta criar em `content` → negado; HTML malicioso renderiza
      sanitizado.

### Funcional
- [ ] Home, artigos, crônicas, login e cadastro funcionando.
- [ ] `/store` mostra a página de construção; `/checkout` redireciona.
- [ ] PWA: manifest servido, service worker ativo.
- [ ] Redesign no ar (paleta terrosa, Spectral/Mulish, tab bar mobile).

---

## 5. O que este deploy NÃO prova

Honestidade sobre os limites, para não marcar como verificado o que não foi:

1. **O fluxo de pagamento não é exercitado.** A loja está fora do ar; PIX, boleto e cartão
   não têm como ser testados em produção. Toda a OS_PAYMENT_001 sobe **sem verificação de
   ponta a ponta** (`AGENTS.md` §9.5). Isso é aceitável **porque** nada a exercita — mas
   vira bloqueio no dia de reabrir a loja: **reativar `/store` exige um checkout de teste
   completo antes**, não depois.
2. **As Cloud Functions seguem sem testes automatizados** (DT-07).
3. **R-10 continua aberta** — o webhook é um endpoint público que aceita qualquer POST, sem
   assinatura nem idempotência (`PLANO_DE_ACAO.md` 0.4 e 0.7). Este deploy **não** muda isso.
   Com a loja fechada a exposição é menor, mas o endpoint está no ar.

---

## 6. Rollback

| Alvo | Como |
|---|---|
| Hosting | `npx firebase hosting:rollback` |
| Rules | `git checkout 459c71f -- firestore.rules && npx firebase deploy --only firestore:rules` |
| Functions | `git checkout 459c71f -- functions/ && npx firebase deploy --only functions` |

`459c71f` é o commit anterior a esta leva (estado de `main` antes do estudo/OS_PAYMENT_001).
A CSP é o item de maior risco de "quebrar o site" — por isso o canal de preview em 3.4.

---

## 7. Registro obrigatório ao concluir

- [ ] `docs/seguranca/RELATORIO_SPRINT_0.md`: "Aguarda deploy" → "Em produção desde <data>".
- [ ] `PROJECT_STATE.md` §1: remover o item 1 (deploy) das próximas ações; registrar em §2.
- [ ] Anotar o resultado de cada tentativa de exploit da §4.

## 8. Quem faz o quê

| Etapa | Quem |
|---|---|
| Pré-flight (testes, rules, lint, build) | ✅ **Feito por agente CLI** (§2) |
| Runbook, `.env.example`, comandos de verificação | ✅ **Feito por agente CLI** |
| `firebase login`, `.env` real, `secrets:set` | **PO (humano)** — credenciais |
| `hosting:channel:deploy`, `deploy`, promoção | **PO (humano)** — publica em produção |
| Tentativas de exploit pós-deploy | PO, com apoio do agente na montagem |
| Registro final nos docs | Agente CLI pode ajudar |

---

*Preparada pelo CTO/agente em 2026-08-19. Execução pendente do PO.*
