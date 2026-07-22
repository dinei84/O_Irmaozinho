# PROJECT_CONTEXT — O Irmãozinho
**Última atualização:** 2026-07-20 | **Versão:** 1.0
**Mantenedor:** CEO/CTO (Claude LLM)

> **LEITURA OBRIGATÓRIA** para todo agente CLI antes de iniciar qualquer OS.
> Leia também: `AGENTS.md`, `PROJECT_STATE.md` e a OS designada.

---

## 1. Visão do produto

Blog cristão (artigos, crônicas, reflexões) com e-commerce integrado — o blog é o núcleo do produto, a loja é secundária e usa o mesmo sistema visual (ver `PROJECT_SPEC.md` para a especificação completa de design, aprovada pela diretoria).

## 2. Stack e Infraestrutura

| Camada | Tecnologia | Observação |
|--------|-----------|------------|
| Frontend | React 18 + Vite 5 + React Router 6 | SPA. Sem TypeScript hoje (JS/JSX puro, sem `tsconfig.json`) |
| Estilo | Tailwind CSS 3 + Framer Motion | Paleta e tipografia migrando para `PROJECT_SPEC.md` (terracota/oliva/Spectral+Mulish) |
| Auth | Firebase Authentication | Role via custom claim (`role: 'admin'`), não JWT emitido pela aplicação |
| Banco | Cloud Firestore | NoSQL. Autorização real vive nas **Firestore Rules**, não em schema/migration |
| Backend transacional | Cloud Functions (Node 20, `firebase-functions` v4 / API v1) | `functions/index.js` — pagamento, webhook. Migração para API v2 planejada (`PLANO_DE_ACAO.md` Fase 1.2) |
| Pagamento | Mercado Pago (PIX, boleto, cartão) via `functions/gateways/` (`BaseGateway`/`GatewayFactory`) | Gateway plugável — abstração já existe para novo provedor |
| Deploy | Firebase Hosting (frontend + regras) | `firebase deploy` / `firebase deploy --only hosting|firestore:rules|functions` |
| Sanitização | DOMPurify (`src/lib/sanitize.js`) | Ponto único de sanitização de HTML vindo do Firestore |
| Testes | Vitest (unitário/integração) + `@firebase/rules-unit-testing` (Firestore Rules via emulador) | `npm test`, `npm run test:rules` |
| Lint | ESLint (configurado no `package.json`, **sem arquivo de config presente** — ver `PROJECT_STATE.md`) | `npm run lint` está quebrado hoje |

---

## 3. Modelo de Trabalho Multi-Agente

```
Product Owner (Humano — Dinei)
    │ priorização, decisões de produto e de pagamento/LGPD
    ▼
CEO / CTO (Claude LLM)
    │ gera OS, revisa código, valida DoD, atualiza STATE, emite próxima OS
    ▼
CLI Agents (Claude Code / Gemini / Codex)
    │ implementam, testam, commitam, reportam
    ▼
Repositório Git — trabalho em `develop`, merge para `main` a cada OS aprovada (ver
`AGENTS.md` §9.7)
```

**Regra:** CLI Agents nunca decidem escopo. Dúvidas registradas no relatório e resolvidas pelo CTO na próxima OS.

---

## 4. Arquitetura

O projeto **não** usa Clean Architecture em camadas (`core/use-cases/infra`) — é uma SPA React organizada por convenção de pasta/feature, com Cloud Functions à parte para o que exige confiança do servidor:

```
src/
├── components/     ← componentes React por domínio (auth/, checkout/, features/, layout/, orders/, ui/)
├── contexts/       ← Context API (AuthContext, CartContext)
├── hooks/          ← hooks customizados (useMercadoPago, useTextToSpeech)
├── lib/            ← utilitários puros (roles.js, sanitize.js, validators.js, dateUtils.js, firebase.js)
├── pages/          ← rotas (React Router), inclusive pages/admin/
├── services/       ← única camada que deve falar com Firestore/Functions para dados de domínio
└── test/           ← setup global de testes (Vitest + Testing Library)

functions/
├── gateways/       ← BaseGateway / MercadoPagoGateway / GatewayFactory
├── config/         ← configuração de pagamento
└── index.js        ← Cloud Functions exportadas
```

**Fluxo obrigatório de uma requisição:**
```
Leitura/escrita simples:
Componente → services/*.js (Firebase SDK) → Firestore → decidido por Firestore Rules

Operação financeira:
Cliente → Cloud Function (onCall) → recalcula valores no servidor → Gateway → Mercado Pago
                                    ↓ (Admin SDK — bypassa as Rules)
                              Firestore atualizado
```

---

## 5. Domínio — Coleções/Entidades Principais

| Entidade (coleção Firestore) | Conceito | Observação |
|----------|---------|------------|
| **users** | Perfil do usuário autenticado | Role real vem do custom claim no Auth, não deste documento |
| **content** | Artigo/crônica/reflexão do blog | Núcleo do produto. Escrita só ADMIN. `body` passa por sanitização (DOMPurify) antes de renderizar |
| **products** | Produto da loja | Leitura pública só se `active == true`; escrita só ADMIN |
| **suppliers** | Fornecedor/editora (marketplace) | Leitura autenticado; escrita só ADMIN |
| **orders** | Pedido de compra | Criação: dono autenticado, mas **valor sempre recalculado no servidor** (Cloud Function), nunca aceito do cliente. Update restrito (ADMIN, ou dono cancelando) |
| **comments** | Comentário em artigo | Identidade do autor deve bater com o token (sem forjar nome). Edição: só autor, campos restritos, janela de 1h. Delete físico proibido |
| **likes** | Curtida (`id`: `contentId_userId`) | Dono cria/remove o próprio like; update sempre proibido |
| **audit_logs** | Log de auditoria | Append-only. Só ADMIN lê/cria; update/delete sempre `false` |
| **admins** | Lista de administradores | Gerido fora do cliente (script/Admin SDK), nunca por escrita direta do app |

---

## 6. Glossário

- **OS (Operating Order):** unidade de trabalho emitida pelo CTO para um CLI Agent
- **Custom Claim:** atributo (`role`) gravado no token do Firebase Auth via Admin SDK — é o que define ADMIN vs. usuário comum
- **Firestore Rules:** o arquivo `firestore.rules` — perímetro de segurança real da aplicação (client-side validation é só UX)
- **RBAC:** controle de acesso por role (`admin`/`user`) — autenticação sozinha não é suficiente
- **Idempotência:** garantia de que reprocessar a mesma requisição/webhook não duplica efeito (cobrança, pedido) — hoje incompleta no gateway de pagamento (ver `PROJECT_STATE.md`)
- **Gateway (pagamento):** abstração plugável em `functions/gateways/` que isola o provedor real (Mercado Pago hoje) do resto do sistema
- **Webhook:** endpoint (`onRequest`) que recebe notificações assíncronas do Mercado Pago sobre status de pagamento
- **App Check:** proteção do Firebase (planejada, Fase 1.1 do `PLANO_DE_ACAO.md`) que bloqueia chamadas a Firestore/Functions vindas de fora do app legítimo
- **DoD:** Definition of Done — checklist obrigatório antes de qualquer commit

---

## 7. Estado Funcional e Dívidas Técnicas

O estado funcional atual, o roadmap de profissionalização e as dívidas técnicas **não são duplicados aqui** para evitar dois documentos contando histórias diferentes (regra já em vigor em `docs/README.md`). Fontes de verdade:

- **Estado atual, sessão corrente e próximas ações:** `PROJECT_STATE.md`
- **Roadmap completo em 6 fases (segurança → LGPD → e-commerce → redesign → qualidade contínua):** `PLANO_DE_ACAO.md`
- **Vulnerabilidades e plano de remediação:** `docs/seguranca/AUDITORIA_SEGURANCA.md` e `docs/seguranca/PLANO_REMEDIACAO.md`
- **Especificação de design (fonte única de verdade visual):** `PROJECT_SPEC.md`

---

## 8. Regras de Governança

- Todo agente CLI **deve** ler `AGENTS.md` + `PROJECT_CONTEXT.md` + `PROJECT_STATE.md` + a OS antes de executar qualquer trabalho (ver `AGENTS.md` §7 para a lista completa condicional ao escopo).
- Toda OS de porte médio/grande **deve** gerar relatório de execução (`docs/execution-reports/EXECUTION_REPORT_[ID].md` ou commit detalhado — ver `AGENTS.md` §6.3).
- Toda decisão de escopo/produto **deve** atualizar `PROJECT_STATE.md`.
- **Proibido** acumular múltiplas intenções lógicas não relacionadas em um único commit.
- **Proibido** iniciar nova OS antes do CTO validar a anterior.
- **Proibido** marcar verificação manual (navegador, checkout real) como concluída tendo como prova apenas teste automatizado ou `curl` — ver `AGENTS.md` §9.5.

---

*Fim do PROJECT_CONTEXT.md — v1.0*
