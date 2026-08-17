# PROJECT_STATE — O Irmãozinho

**Versão:** 1.0 (adoção do modelo de governança CTO/CLI Agent)
**Data:** 2026-07-20
**Mantenedor:** CEO/CTO (Claude LLM)

---

## 0. Sumário Executivo

Esta é a primeira versão do `PROJECT_STATE.md` — o projeto passa a adotar o modelo de governança documentado em `AGENTS.md` (papéis, DoD, disciplina de testes e commits), inspirado em um projeto irmão, mas adaptado à stack real de "O Irmãozinho" (React/Vite/Firebase/Mercado Pago, sem Prisma/Express/Next.js).

**Estado herdado (não gerado por esta sessão):** o commit mais recente (`d41bf2a`) fecha, no código, as 4 vulnerabilidades críticas do Sprint 0 de segurança (ver `docs/seguranca/RELATORIO_SPRINT_0.md`). Essas correções **ainda aguardam deploy** em produção.

**Branch:** `main` | **Commit topo no momento desta versão:** `d41bf2a`

**Verificado nesta sessão (baseline real, não estimado):**
- `npx vitest run`: **343 testes, 343 passando, 0 falhando** — nova baseline após a
  OS_HARDENING_001 (R-08 + triagem de testes). As 14 falhas pré-existentes (DT-02) foram
  corrigidas, e 4 arquivos de teste que **crashavam no import** (transitivamente importavam
  `src/lib/firebase.js`, que lança sem `.env`) passaram a coletar e executar — revelando ~37
  testes "stale" do redesign que também foram corrigidos. Ver §3.3.
  **A baseline 343/343 é determinística** — confirmada pelo CTO em 24 execuções consecutivas
  da suíte completa (0 falha, 0 chamada de rede real) após corrigir uma flakiness encontrada
  na revisão (commit `81ae017`: listener `onSnapshot` real vazando de `Checkout.integration`
  + fila `mockResolvedValueOnce` frágil no `CommentsSection`). Antes da correção, a suíte
  falhava ~37-50% das vezes.
- `npm run test:rules` (**23 testes** de Firestore Rules via emulador): **23/23 passando**
  (4 novos testes de V-02 — criação de pedido negada no cliente — adicionados na OS_HARDENING_001).
- `npm run lint`: **verde (0 erros, 61 warnings)** — config do ESLint criada na OS_HARDENING_001
  (DT-01 resolvida).
- `npx vite build`: limpo (aviso "chunk >500 kB" segue pré-existente, sem relação com esta OS).

---

## 1. Próximas ações (ordem de prioridade)

0. **Reativar a loja** — `/store` e `/checkout` renderizam uma página de construção
   (`src/pages/StoreUnderConstruction.jsx`) por decisão do PO, enquanto o meio de pagamento
   é revisto. Reativar é descomentar dois lazy imports e voltar duas rotas em `src/App.jsx`
   (instruções no cabeçalho da própria página). `Store.jsx` e `Checkout.jsx` estão intactos.
1. **Deploy do Sprint 0 + R-08** — o código das correções de segurança (incluindo agora a
   `createOrder` server-side, que fecha a V-02) está pronto e testado, mas não em produção.
   Ver `docs/seguranca/RELATORIO_SPRINT_0.md` e `docs/os/OS_HARDENING_001*.md` para o checklist.
2. **R-10** — assinatura do webhook do Mercado Pago (`x-signature` + idempotência) — o webhook
   ainda é um endpoint público que aceita qualquer POST (ver `PLANO_DE_ACAO.md` Fase 0.4).
3. **Testes das Cloud Functions com emulador** (`firebase-functions-test`) — o `createOrder`
   novo tem a segurança provada por (a) teste de rules (create negado no cliente) e (b) leitura
   de código; falta teste direto da function (ver DT-07).
4. **Fase 1 do `PLANO_DE_ACAO.md`** — App Check, migração de Functions para API v2, transações
   reais de estoque, verificação de e-mail obrigatória.
5. **DT-08** — config de ESLint em `functions/` (o `npm run lint` do backend segue quebrado).

---

## 2. Marcos recentes (histórico, não desta sessão)

| Marco | Descrição | Status |
|---|---|---|
| OS_PAYMENT_001 (2026-08-17) | Sela a abstração de gateway (V3/V4/V5): `gateway` do pedido vem da config, roteamento por pedido, secrets centralizados, webhook sem formato do MP | ✅ Código concluído, aguardando revisão do CTO — `docs/execution-reports/EXECUTION_REPORT_OS_PAYMENT_001.md` |
| Loja em construção (2026-08-17) | `/store` e `/checkout` apontam para página temporária enquanto o pagamento é revisto (decisão do PO) | ✅ Em `main` — reativação descrita em §1 item 0 |
| Estudo Asaas (2026-08-17) | Viabilidade de trocar/coexistir o gateway. **Conclusão: não migrar agora** (custo maior no perfil da loja + PCI-DSS no cartão); reabrir se o marketplace com split andar | ✅ `docs/arquitetura/ESTUDO_GATEWAY_ASAAS.md` — decisão do PO |
| OS_HARDENING_001 (2026-08-13) | R-08 (pedido no servidor fecha V-02) + lint + triagem de testes (343/343) + CI/CD | ✅ Código concluído, aguardando revisão do CTO |
| Auditoria de segurança (2026-07-13) | 14 vulnerabilidades encontradas, 4 críticas | ✅ Diagnosticado — `docs/seguranca/AUDITORIA_SEGURANCA.md` |
| Sprint 0 de segurança (2026-07-13) | Fecha as 4 críticas no código + 35 testes novos (19 de rules) | ✅ Código concluído, **aguardando deploy** — `docs/seguranca/RELATORIO_SPRINT_0.md`, commit `d41bf2a` |
| Reorganização de documentação | Docs obsoletos isolados em `garbage/`, `docs/` reorganizado por finalidade | ✅ Concluído — commit `1e30b4d` |
| `PROJECT_SPEC.md` versionado | Especificação de design aprovada pela diretoria | ✅ Concluído — commit `fbd41eb` |

---

## 3. Dívidas Técnicas (DT) — estado atual

### 3.1 Abertas, encontradas/confirmadas nesta sessão

| DT | Severidade | Descrição |
|---|---|---|
| DT-03 | BAIXA | `TextToSpeechPlayer.jsx` (reskin na OS_REDESIGN_005) não tem barra de progresso nem contador de tempo atual/total, presentes no `PROJECT_SPEC.md` §5.6 item 6 e no mockup do deck (slide 05, "1:48 / 6:12"). Implementar exigiria expor progresso/duração em `src/hooks/useTextToSpeech.js` — fora do escopo de um "reskin visual" (a OS explicitamente proibia reescrever lógica). Fica para uma OS futura dedicada. |
| DT-04 | BAIXA/MÉDIA | Leitura offline **plena do texto** dos artigos (PWA, OS_REDESIGN_009). O Workbox cacheia shell + imagens, mas o texto vem do Firestore (gRPC/websocket) e não persiste offline. Exigiria `enableIndexedDbPersistence` do Firestore (lógica de dados, não PWA/visual). OS futura. |
| DT-05 | BAIXA | `theme-color` dinâmico por tela (`PROJECT_SPEC.md` §6.3) não implementado na OS_REDESIGN_009 — entregue estático (`#FBF7EF`). Melhoria futura; o estático satisfaz o mínimo. |
| DT-06 | BAIXA | Splash screen nativa iOS (`apple-touch-startup-image`) não implementada (OS_REDESIGN_009). Navegadores modernos geram splash a partir do manifest; iOS exige imagens dedicadas por resolução. Melhoria futura. |
| DT-07 | MÉDIA | A Cloud Function `createOrder` (R-08) não tem teste direto com emulador de functions (`firebase-functions-test`). A segurança está provada por (a) teste de rules (`firestore.rules.test.js` — create negado no cliente) e (b) leitura de código, mas falta prova automatizada de que o preço vem de `products` e não do cliente. Registrar e cobrir numa OS futura (PLANO_DE_ACAO.md 5.2). |
| DT-08 | BAIXA/MÉDIA | `functions/` segue **sem config de ESLint** própria — o `npm run lint` do backend (`functions/package.json`) falha por não existir `.eslintrc`/`eslint.config` ali (só `eslint-config-google` instalado). A OS_HARDENING_001 criou a config do **front** (raiz) e ignorou `functions/`; a do backend fica para uma OS futura. |
| DT-09 | BAIXA | `checkPaymentStatus` (`functions/index.js`) declara `secrets` e valida a config de pagamento sem nunca instanciar um gateway — só lê `payment.status` do Firestore. Peso morto herdado; encontrado na OS_PAYMENT_001, que não o removeu por ser mudança de comportamento fora do escopo. Remover junto com DT-07. |
| DT-07 | BAIXA | Aviso de build ">500 kB": mesmo após o code-splitting de rotas (OS_REDESIGN_010, chunk principal 1.014→776 kB), os vendors (Firebase SDK, framer-motion, react) seguem no chunk inicial. Zerar o aviso exige `build.rollupOptions.output.manualChunks` (split de vendor) — mudança de config de build, unidade de trabalho própria. Micro-OS futura; não bloqueante. |

### 3.2 Herdadas do plano de ação (não redigitadas aqui — ver fonte)

O `PLANO_DE_ACAO.md` já documenta, em detalhe e com correção sugerida, as dívidas de segurança e arquitetura conhecidas (idempotency key fixa no gateway de pagamento, ausência de transação atômica real no decremento de estoque, `dist/` versionado no git, ausência de App Check, Functions ainda em API v1, verificação de e-mail não obrigatória, entre outras). Este documento **não duplica** essa lista — consultar `PLANO_DE_ACAO.md` (Fases 0–5) e `docs/seguranca/PLANO_REMEDIACAO.md` como fonte de verdade, para evitar dois documentos divergentes (mesma regra já em vigor em `docs/README.md`).

### 3.3 Resolvidas

| DT | Descrição | Status |
|---|---|---|
| DT-01 | `npm run lint` quebrado (sem config ESLint) | ✅ Resolvido na OS_HARDENING_001 — `.eslintrc.cjs` criado (raiz/front), `npm run lint` verde (0 erros, 61 warnings) |
| DT-02 | 14 testes falhando (baseline pré-existente) + 4 arquivos que crashavam no import | ✅ Resolvido na OS_HARDENING_001 — suíte triada; nova baseline **343/343** |
| V-02/R-08 | Pedido montado no cliente (price tampering via carrinho/localStorage) | ✅ Resolvido na OS_HARDENING_001 — `createOrder` server-side + `orders` create negado nas rules |
| V-01/R-03 | Valor do pagamento definido pelo cliente (price tampering) | ✅ Mitigado no código (Sprint 0) — fechamento definitivo agora completo via R-08, aguarda deploy |
| V-03/R-02 | Firestore Rules permitiam update de `orders` por qualquer usuário autenticado | ✅ Resolvido no código (Sprint 0), aguarda deploy |
| V-04/R-04 | XSS armazenado em artigos + rule temporária liberando criação de conteúdo para qualquer usuário | ✅ Resolvido no código (Sprint 0: DOMPurify + rule restaurada), aguarda deploy |
| V-08/R-05 | Comentários: campos arbitráveis na edição + identidade forjável + janela de 1h desativada/quebrada | ✅ Resolvido no código (Sprint 0), aguarda deploy |
| V-09/R-06 | Ausência de headers de segurança no Hosting (CSP, HSTS, etc.) | ✅ Resolvido no código (Sprint 0), aguarda deploy |

---

## 4. Convenção de atualização deste documento

A partir desta versão, toda OS concluída e validada pelo CTO deve:
1. Mover a entrada correspondente de "Próximas ações" (§1) para "Marcos recentes" (§2) ou "Resolvidas" (§3.3).
2. Registrar qualquer dívida técnica nova encontrada durante a execução em §3.1, com severidade e descrição factual (sem prosa vaga — arquivo, comportamento observado, comando que confirma).
3. Atualizar a contagem de testes em §0 sempre que ela mudar, com o comando exato usado para verificar.

*Fim do PROJECT_STATE.md v1.0.*
