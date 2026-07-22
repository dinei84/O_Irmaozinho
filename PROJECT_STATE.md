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
- `npx vitest run`: **298 testes, 284 passando, 14 falhando** — as 14 falhas são **pré-existentes e conhecidas**, batendo com a baseline documentada em `docs/seguranca/RELATORIO_SPRINT_0.md` (284 passando / 14 falhas pré-existentes, "nenhuma regressão introduzida"). Não foram investigadas a fundo nesta sessão — ver §3.1.
- `npm run test:rules` (19 testes de Firestore Rules via emulador): **não executado nesta sessão** (não roda por padrão sem subir o emulador do Firestore) — última execução registrada e confirmada é a do próprio Sprint 0 (19/19 passando).
- `npx vite build`: não executado nesta sessão (sem alteração de código-fonte).
- `npm run lint`: **quebrado** — não existe arquivo de configuração do ESLint no repositório (nem raiz, nem `functions/`), apesar do script e das dependências (`eslint`, `eslint-plugin-react` etc.) estarem no `package.json`. Ver DT-01.
- Não existe `tsconfig.json` — o projeto é JavaScript puro (JSX), não há checagem de tipos a rodar.

---

## 1. Próximas ações (ordem de prioridade)

1. **Deploy do Sprint 0 de segurança** — o código das 4 correções críticas está pronto e testado (`d41bf2a`), mas não está em produção. Até o deploy, as vulnerabilidades continuam exploráveis ao vivo. Ver `docs/seguranca/RELATORIO_SPRINT_0.md` para o checklist de saída.
2. **R-08 / Fase 3.1 do `PLANO_DE_ACAO.md`** — criar pedido no servidor (`createOrder` callable, preços/estoque validados no backend). Enquanto isso não existe, a fraude de preço (V-02) **continua parcialmente possível** via adulteração do carrinho no `localStorage`, mesmo após o deploy do Sprint 0 — mitigação parcial já feita (Function ignora `amount` do cliente e lê `finalTotal` do pedido), mas o próprio `finalTotal` ainda nasce no cliente até o pedido ser criado server-side.
3. **DT-01** — corrigir `npm run lint` (sem config de ESLint) antes de depender dele em qualquer pipeline de CI.
4. **Fase 1 do `PLANO_DE_ACAO.md`** — App Check, migração de Functions para API v2, transações reais de estoque, idempotência do webhook, verificação de e-mail obrigatória.
5. Investigar as 14 falhas pré-existentes de teste (§3.1) — hoje aceitas como baseline conhecida, mas nunca formalmente triadas uma a uma neste novo modelo de governança.

---

## 2. Marcos recentes (histórico, não desta sessão)

| Marco | Descrição | Status |
|---|---|---|
| Auditoria de segurança (2026-07-13) | 14 vulnerabilidades encontradas, 4 críticas | ✅ Diagnosticado — `docs/seguranca/AUDITORIA_SEGURANCA.md` |
| Sprint 0 de segurança (2026-07-13) | Fecha as 4 críticas no código + 35 testes novos (19 de rules) | ✅ Código concluído, **aguardando deploy** — `docs/seguranca/RELATORIO_SPRINT_0.md`, commit `d41bf2a` |
| Reorganização de documentação | Docs obsoletos isolados em `garbage/`, `docs/` reorganizado por finalidade | ✅ Concluído — commit `1e30b4d` |
| `PROJECT_SPEC.md` versionado | Especificação de design aprovada pela diretoria | ✅ Concluído — commit `fbd41eb` |

---

## 3. Dívidas Técnicas (DT) — estado atual

### 3.1 Abertas, encontradas/confirmadas nesta sessão

| DT | Severidade | Descrição |
|---|---|---|
| DT-01 | MÉDIA | `npm run lint` não funciona — não existe `.eslintrc*`/`eslint.config.*` em nenhum lugar do repositório (raiz ou `functions/`), apesar do script e das dependências do ESLint estarem presentes no `package.json`. Bloqueia qualquer adoção de CI que dependa de lint. |
| DT-02 | A investigar | 14 testes falhando em `npx vitest run` (de 298 totais) — aceitos como "pré-existentes" porque batem com a baseline do `RELATORIO_SPRINT_0.md`, mas nunca triados individualmente sob este novo modelo de governança. Arquivos com falha observados nesta sessão incluem `src/components/checkout/__tests__/BoletoPaymentForm.test.jsx` e `src/components/features/comments/__tests__/CommentItem.test.jsx` — não investigados a fundo, apenas confirmados como parte da contagem conhecida. |
| DT-03 | BAIXA | `TextToSpeechPlayer.jsx` (reskin na OS_REDESIGN_005) não tem barra de progresso nem contador de tempo atual/total, presentes no `PROJECT_SPEC.md` §5.6 item 6 e no mockup do deck (slide 05, "1:48 / 6:12"). Implementar exigiria expor progresso/duração em `src/hooks/useTextToSpeech.js` — fora do escopo de um "reskin visual" (a OS explicitamente proibia reescrever lógica). Fica para uma OS futura dedicada. |

### 3.2 Herdadas do plano de ação (não redigitadas aqui — ver fonte)

O `PLANO_DE_ACAO.md` já documenta, em detalhe e com correção sugerida, as dívidas de segurança e arquitetura conhecidas (idempotency key fixa no gateway de pagamento, ausência de transação atômica real no decremento de estoque, `dist/` versionado no git, ausência de App Check, Functions ainda em API v1, verificação de e-mail não obrigatória, entre outras). Este documento **não duplica** essa lista — consultar `PLANO_DE_ACAO.md` (Fases 0–5) e `docs/seguranca/PLANO_REMEDIACAO.md` como fonte de verdade, para evitar dois documentos divergentes (mesma regra já em vigor em `docs/README.md`).

### 3.3 Resolvidas

| DT | Descrição | Status |
|---|---|---|
| V-01/R-03 | Valor do pagamento definido pelo cliente (price tampering) | ✅ Mitigado no código (Sprint 0) — **fechamento definitivo depende de R-08** (§1, item 2), aguarda deploy |
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
