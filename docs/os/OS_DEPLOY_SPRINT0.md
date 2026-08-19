# OS_DEPLOY_SPRINT0 — Deploy do Sprint 0 de segurança (runbook operacional)

> ⚠️ **SUBSTITUÍDO — não use este arquivo.**
> Use [`OS_DEPLOY_002_SPRINT0_R08_PAYMENT001.md`](./OS_DEPLOY_002_SPRINT0_R08_PAYMENT001.md),
> que consolida este deploy com o R-08 e a OS_PAYMENT_001. As baselines de teste
> daqui estão desatualizadas e o aviso sobre a V-02 não vale mais (foi fechada pelo
> R-08). Mantido só como registro histórico.

**Status:** ⛔ Substituído por OS_DEPLOY_002
**Tipo:** operacional (deploy em produção) — **não é uma OS de código**. A maior parte é
executada **por você (PO)**, não por um agente CLI: login no Firebase, credenciais,
segredos e a promoção para produção são ações humanas (ver `AGENTS.md` — entrar
credenciais e publicar em produção não são tarefas de agente).
**Projeto Firebase:** `admoirmaozinho` (ver `.firebaserc`)
**Fonte de verdade:** `docs/seguranca/RELATORIO_SPRINT_0.md`, `docs/seguranca/PLANO_REMEDIACAO.md`,
`PLANO_DE_ACAO.md` Fase 0.

---

## Contexto — leia antes de tudo

1. **O Sprint 0 (código pronto desde `d41bf2a`) nunca foi deployado.** Fecha, no código,
   as 4 vulnerabilidades críticas (escrita em pedido alheio V-03, valor do pagamento no
   cliente V-01/R-03, XSS armazenado V-04, + headers de segurança/CSP R-06 e comentários
   V-08). Ver `RELATORIO_SPRINT_0.md`.
2. **⚠️ `main` hoje contém o Sprint 0 + TODO o redesign (Fase 4, OS_REDESIGN_001–010).**
   Um `firebase deploy` a partir de `main` publica **os dois juntos**: as correções de
   segurança **e** o site redesenhado (paleta terrosa, PWA, etc.). Decida conscientemente
   se quer publicar o redesign junto (recomendado — está tudo revisado/aprovado) ou se
   quer segurar o frontend (aí ver "Variante: só backend" abaixo).
3. **⚠️ Risco residual que este deploy NÃO fecha (V-02):** a fraude de preço via
   adulteração do carrinho no `localStorage` continua possível até o **R-08** (criar o
   pedido no servidor), que é do **Sprint 1**. O Sprint 0 elimina o ataque trivial (chamar
   a function com outro `amount`), mas não o de quem edita o `localStorage`.
   → **Decisão de produto obrigatória antes de abrir a loja:** desativar o checkout até o
   R-08, **ou** aceitar o risco monitorando os valores dos pedidos. Ver
   `RELATORIO_SPRINT_0.md` (V-02) e `PLANO_DE_ACAO.md` Fase 3.1.

---

## Pré-requisitos (você / PO — antes de qualquer deploy)

- [ ] **Firebase CLI** logado com acesso ao projeto `admoirmaozinho`
      (`firebase login`; conferir com `firebase projects:list`).
- [ ] **Credencial do Mercado Pago recriada.** A aplicação antiga foi **excluída** e os
      tokens revogados (R-01). Sem o secret, `createPaymentIntent`/`checkPaymentStatus`/
      `handlePaymentWebhook` (que declaram `secrets: ['MERCADOPAGO_ACCESS_TOKEN']`) falham
      no deploy/execução. Criar nova aplicação no painel MP e rodar:
      ```bash
      firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN
      ```
      (Opcional, se o front usar: `MERCADOPAGO_PUBLIC_KEY` via env do build.)
      **Nunca** colar o token em arquivo versionado — só no secret manager.
- [ ] **`.env` real do frontend** na raiz (fora do git — está no `.gitignore`), com os
      `VITE_FIREBASE_*` reais do projeto. O build do hosting (`npm run build`) precisa
      dele; sem, o app não monta em produção.
- [ ] Working tree limpa e em `main` sincronizada com `origin/main`
      (`git status` limpo, `git log origin/main..main` vazio).

---

## Pré-flight (pode ser feito por um agente CLI, sem tocar produção)

- [ ] `npx vitest run` — baseline conhecida (284/298, 14 falhas pré-existentes).
- [ ] `npm run test:rules` — os testes das Security Rules (emulador) devem passar
      (19/19 na última execução registrada) — é a prova de que os exploits V-03/V-04/V-08
      falham. Rodar antes de subir as rules.
- [ ] `npm run build` **com o `.env` real** — build de produção limpo, gera o `dist/`
      (com SW/manifest da PWA).

---

## Deploy (ordem importa) — você / PO

> **Ordem segura:** rules e headers só **restringem** (podem ir a qualquer momento). As
> Functions dependem do secret do MP. O hosting (CSP + redesign) deve ser validado num
> **preview channel** antes da produção — uma diretiva de CSP mal calibrada quebra o SDK
> do Mercado Pago (`RELATORIO_SPRINT_0.md`).

### 1. Validar a CSP + o site num canal de preview (sem afetar produção)
```bash
npm run build            # com o .env real
firebase hosting:channel:deploy csp-test
```
- [ ] Abrir a URL do canal `csp-test` e verificar **no console do navegador**: sem erro de
      CSP; o SDK do Mercado Pago carrega; o **checkout inteiro** funciona (PIX/boleto/
      cartão de teste); o **service worker registra** (PWA); o redesign renderiza.

### 2. Deploy das rules (seguro, restringe)
```bash
firebase deploy --only firestore:rules
```

### 3. Deploy das Functions (depende do secret do MP já configurado)
```bash
firebase deploy --only functions
```

### 4. Promover o hosting para produção (depois do preview validado)
```bash
firebase deploy --only hosting
```

> **Ou tudo de uma vez, se o preview passou:**
> `firebase deploy --only firestore:rules,functions,hosting`

### Variante: só backend (se quiser segurar o redesign do frontend)
Se você **não** quer publicar o redesign ainda, publique só a segurança de backend agora:
```bash
firebase deploy --only firestore:rules,functions
```
O frontend antigo continua no ar (a CSP/headers, que são do hosting, ficam para quando
publicar o hosting). Nesse caso, a proteção de CSP do R-06 **ainda não estará ativa** —
registre isso.

---

## Verificação pós-deploy (checklist de saída da Fase 0)

- [ ] **Tentar os exploits e confirmar que FALHAM** (em produção, com conta comum de teste):
  - V-03: um usuário tentar escrever/`update` num pedido de outro → negado pelas rules.
  - V-01: chamar `createPaymentIntent` com `amount` adulterado → a function usa
    `order.finalTotal`, ignora o `amount`.
  - V-04: usuário comum tentar criar artigo em `content` → negado; conteúdo com HTML
    malicioso renderiza sanitizado (DOMPurify).
- [ ] Headers de segurança presentes na resposta (`curl -I` na URL de produção →
      `Content-Security-Policy`, `Strict-Transport-Security`, etc.).
- [ ] Checkout completo funciona em produção (com credencial MP nova).
- [ ] PWA: manifest servido, service worker registra (aba Application do DevTools).
- [ ] Redesign no ar (se o hosting foi promovido): paleta terrosa, fontes, tab bar mobile.

## Rollback (se algo quebrar)

- **Hosting:** `firebase hosting:rollback` (volta ao release anterior) — ou promover de
  novo um build bom.
- **Rules:** reaplicar a versão anterior (`git checkout <commit-anterior> -- firestore.rules`
  + `firebase deploy --only firestore:rules`).
- **Functions:** redeploy da versão anterior (mesmo padrão via git).
- A CSP é o item de maior risco de "quebrar o site" — por isso o preview channel no passo 1.

---

## Registro (obrigatório ao concluir)

Ao final, registrar o que foi feito em `docs/seguranca/` (ex.: atualizar
`RELATORIO_SPRINT_0.md` de "Aguarda deploy" para "Em produção desde <data>", ou um
`DEPLOY_LOG_SPRINT0.md`): data, o que foi deployado (rules/functions/hosting), resultado
das tentativas de exploit, e a decisão sobre o checkout/V-02. Atualizar também
`PROJECT_STATE.md` §1 (mover o item 1 de "próximas ações" para concluído).

## Quem faz o quê

| Etapa | Quem |
|---|---|
| Recriar credencial MP, `firebase functions:secrets:set`, `.env` real | **PO (humano)** — envolve segredos |
| Pré-flight (testes, test:rules, build) | Agente CLI **pode** ajudar |
| `firebase login`, `hosting:channel:deploy`, `deploy`, promover produção | **PO (humano)** — publica em produção |
| Tentativas de exploit / verificação pós-deploy | PO, com apoio do agente na montagem dos testes |
| Registro final (docs) | Agente CLI **pode** ajudar |

---

## Fora de escopo

- **R-08** (criar pedido no servidor, fecha a V-02) — é **Sprint 1**, a próxima prioridade
  de segurança depois deste deploy. É o passo mais importante do plano.
- Validação de assinatura do webhook (V-11), App Check, Functions v2 — Fase 1.
