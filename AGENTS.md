# 📜 AGENTS.md — Guia de Engenharia e Regras de Execução
**Projeto:** O Irmãozinho — Blog cristão com e-commerce integrado
**Versão:** 1.2 | **Mantenedor:** CEO/CTO (Claude LLM)
**Atualização:** 2026-07-22

> **LEITURA OBRIGATÓRIA.** Todo agente CLI (Claude Code, Gemini, Codex) deve ler este arquivo COMPLETO antes de iniciar qualquer OS. Sem exceção. O não cumprimento de qualquer regra aqui é considerado falha de execução.

---

## 0. Modelo de Trabalho e Papéis

```
Product Owner (Humano — Dinei)
    │ decisões de produto e priorização
    ▼
CEO / CTO (Claude LLM — esta conversa)
    │ gera OS, revisa código, atualiza STATE, emite próxima OS
    ▼
CLI Agent (Claude Code / Gemini / Codex)
    │ lê OS + documentos de contexto, implementa, testa, commita, reporta
    ▼
Repositório Git (branch: main)
```

### Responsabilidades por papel

| Papel | Faz | Não faz |
|---|---|---|
| Product Owner | Aprova escopo, responde dúvidas de negócio (produto, pagamento, LGPD) | Toma decisões técnicas sem CTO |
| CEO/CTO | Gera OS, define arquitetura, valida DoD, revisa o relatório do CLI Agent, aprova ou devolve, atualiza STATE | Escreve código de produção para implementar uma OS — exceção só para correção pequena e simples encontrada na revisão (ver §0.1) |
| CLI Agent | Implementa, testa, commita, gera o relatório de execução | Toma decisões de produto ou escopo |

### 0.1 Fronteira entre CTO e CLI Agent nesta sessão

Esta conversa (Product Owner ↔ Claude) é o espaço de **CTO**: aqui se arquiteta a
solução, se emite a OS, se acompanha o resultado e se aprova ou não. A **implementação
de código de uma OS não acontece nesta conversa** — é sempre delegada a um CLI Agent
(um subagente disparado via ferramenta de agente, ou uma sessão separada de
Claude Code/Gemini/Codex que o Product Owner rode por conta própria), que lê a OS +
`PROJECT_CONTEXT.md` + `PROJECT_STATE.md`, implementa, testa e devolve um relatório de
execução (`docs/execution-reports/`).

**Única exceção:** durante a revisão de um relatório, se o CTO encontrar um problema
**pequeno e simples** (poucas linhas, sem decisão de arquitetura ou de produto — ex.:
erro de digitação, import faltando, ajuste de uma classe CSS), pode corrigir
diretamente e registrar o que foi corrigido e por quê. Qualquer coisa que exija mudança
substancial **não é feita "de passagem"** — volta para uma nova rodada do CLI Agent,
como correção ou como micro-OS (mesmo espírito do §9.9, aplicado aqui ao CTO em vez de
apenas ao PO).

---

## 1. Fluxo de Execução — Ciclo de uma OS

```
1. CTO emite a OS como arquivo em docs/os/OS_[bloco]_[seq]_[descrição].md
   (ou instrução equivalente em chat, para trabalho pequeno)
2. CLI Agent lê: AGENTS.md + PROJECT_CONTEXT.md + PROJECT_STATE.md + a OS
   (+ PROJECT_SPEC.md se a OS mexer em UI/design; + docs/seguranca/ se mexer
   em pagamento, Firestore Rules ou renderização de conteúdo de usuário)
3. CLI Agent executa seguindo os padrões deste documento
4. CLI Agent verifica cada item do DoD da OS
5. CLI Agent gera relatório de execução (commit message detalhada ou
   docs/execution-reports/EXECUTION_REPORT_[ID].md para trabalho grande — ver §6.3)
6. CLI Agent commita código + relatório
7. CTO lê o relatório, valida, atualiza PROJECT_STATE.md e o status da OS em docs/os/
8. CTO emite próxima OS
```

**Regra de ouro:** o CLI Agent nunca decide o que fazer além do que está na OS. Se encontrar ambiguidade, registra e aguarda a próxima OS com clareza (ver §8).

---

## 2. Arquitetura Obrigatória

### 2.1 Stack

| Camada | Tecnologia | Observação |
|---|---|---|
| Frontend | React 18 + Vite 5 + React Router 6 | SPA, sem SSR/framework de meta-routing |
| Estilo | Tailwind CSS + Framer Motion | Paleta e componentes seguem `PROJECT_SPEC.md` |
| Auth | Firebase Authentication | Role via **custom claim** (`role: 'admin'`), não JWT próprio |
| Banco | Cloud Firestore | NoSQL — sem schema/migrations como Prisma; validação vive nas **Firestore Rules** |
| Backend transacional | Cloud Functions (Node 20, `firebase-functions` v4 = API v1) | Pagamento, webhook, tarefas server-side |
| Pagamento | Mercado Pago via `functions/gateways/` (`BaseGateway`/`GatewayFactory`) | Gateway plugável — novo provedor = nova classe, não `if/else` espalhado |
| Hospedagem | Firebase Hosting (frontend) | Deploy: `firebase deploy` |
| Sanitização | DOMPurify (`src/lib/sanitize.js`) | Único ponto de sanitização de HTML vindo do Firestore |
| Testes | Vitest (unitário/integração) + `@firebase/rules-unit-testing` (Firestore Rules) | Ver §5 |
| Linguagem | JavaScript (JSX) — **sem TypeScript** hoje | Não existe `tsconfig.json`; não inventar checagem de tipos que não existe |

**Não existe:** Prisma, Postgres, Express, Next.js, JWT emitido pela própria aplicação. Não introduzir esses conceitos em código ou documentação por analogia com outros projetos.

### 2.2 Organização do código (convenção atual — não é Clean Architecture em camadas)

```
src/
├── components/    ← componentes React por domínio (auth/, checkout/, features/, layout/, orders/, ui/)
├── contexts/      ← Context API (AuthContext, CartContext)
├── hooks/         ← hooks customizados
├── lib/           ← utilitários puros (roles.js, sanitize.js, validators.js, dateUtils.js, firebase.js)
├── pages/         ← rotas (React Router), inclusive pages/admin/
├── services/      ← acesso ao Firestore/Functions (única camada que deve importar o SDK do Firebase para dados)
└── test/          ← setup global de testes

functions/
├── gateways/      ← BaseGateway/MercadoPagoGateway/GatewayFactory — abstração de provedor de pagamento
├── config/        ← configuração de pagamento
└── index.js       ← Cloud Functions exportadas (onCall, onRequest)
```

**Permitido:**
- Componentes e páginas chamam `services/*` para ler/escrever dados — nunca o SDK do Firestore diretamente espalhado pela UI.
- Novo provedor externo (frete, e-mail transacional) segue o padrão de gateway plugável já usado em pagamento.

**PROIBIDO:**
- Lógica de negócio (cálculo de preço, total, frete, decremento de estoque) em componente/página — vive em `services/` (client) ou em Cloud Function (quando precisa ser confiável/servidor).
- Confiar em qualquer valor numérico vindo do cliente para decisões financeiras (preço, total, troco) — **sempre recalcular a partir do dado gravado no Firestore**, dentro da Cloud Function. Esta é a lição do incidente de price tampering (V-01/R-03, ver `docs/seguranca/`); nunca reintroduzir esse padrão.
- Renderizar HTML vindo do Firestore (`dangerouslySetInnerHTML`, `innerHTML`, ou qualquer função que atribua a `.innerHTML` "só para extrair texto") sem passar por `src/lib/sanitize.js` primeiro. Isso vale inclusive para funções auxiliares como `stripHtml` — atribuir a `innerHTML` **executa** HTML malicioso mesmo que o retorno usado seja só texto.

### 2.3 Fluxo de uma requisição

**Leitura/escrita de dado simples (conteúdo, produto, comentário, curtida):**
```
Componente → Context/Hook → services/*.js (Firebase SDK client) → Firestore
                                                                      ↓
                                                        Firestore Rules decidem (allow/deny)
```
Client-side validation (ex.: `lib/validators.js`) é só UX — **as Firestore Rules são o perímetro de segurança real**, não uma camada opcional.

**Operação transacional/financeira (pagamento, webhook):**
```
Cliente → Cloud Function (onCall) → valida input + recalcula valores no servidor
                                    → Gateway (BaseGateway/MercadoPagoGateway) → Mercado Pago
                                    ↓
                         Firestore atualizado via Admin SDK (bypassa Firestore Rules)

Mercado Pago → Cloud Function (onRequest, webhook) → valida assinatura (x-signature) → Admin SDK
```

---

## 3. Padrões de Código

### 3.1 Validação de entrada em Cloud Functions

Todo dado recebido em `onCall`/`onRequest` deve ser validado explicitamente antes de uso — não existe Zod no projeto hoje, mas o princípio é o mesmo: falhar cedo e explícito.

```javascript
// ✅ CORRETO — valida e recalcula no servidor
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login necessário');
  const order = await db.collection('orders').doc(data.orderId).get();
  if (!order.exists) throw new functions.https.HttpsError('not-found', 'Pedido não encontrado');
  const amount = order.data().finalTotal; // nunca data.amount vindo do cliente

// ❌ ERRADO — confia em valor do cliente para decisão financeira
  const amount = data.amount;
```

### 3.2 Tratamento de erros em Cloud Functions

Usar `functions.https.HttpsError` com código explícito (`unauthenticated`, `permission-denied`, `invalid-argument`, `not-found`, `failed-precondition`, `internal`). O cliente decide o que mostrar a partir do `code`.

```javascript
// ✅ CORRETO
throw new functions.https.HttpsError('invalid-argument', 'ISBN já cadastrado');

// ❌ ERRADO
throw new Error('ISBN já cadastrado'); // sem código, chega genérico no cliente
```

### 3.3 Firestore Rules como contrato de dados

Toda coleção nova precisa de uma função de validação nas rules (`isValidX(data)`, seguindo o padrão já usado em `isValidArticle`, `isValidProduct`, `isValidOrder`, `isValidComment`) **antes** de qualquer `allow create/update`. Regra sem validação de shape é a mesma classe de bug que gerou a brecha de `orders` (V-03).

### 3.4 Performance

- **Paginação obrigatória** em qualquer listagem que possa crescer sem limite (produtos, pedidos no admin, comentários).
- **N+1 client-side proibido**: nunca fazer 1 `getDoc`/`onSnapshot` por item dentro de um loop de renderização — buscar em lote ou desnormalizar o necessário no documento pai.
- Toda função de leitura repetida (ex.: estoque disponível por produto) deve ter uma única fonte de verdade compartilhada entre as telas que a usam, não uma chamada por tela.

---

## 4. Segurança — Regras Inegociáveis

### 4.1 O perímetro real é Firestore Rules + Cloud Functions

Cloud Functions com Admin SDK **bypassam** as Firestore Rules — por isso toda regra de autorização "porque a function precisa" deve ser questionada (foi exatamente o raciocínio equivocado por trás da brecha em `/orders`, V-03: a rule achava que precisava liberar update para o webhook, mas o webhook usa Admin SDK e nunca passou pelas rules). Validação no cliente é só UX; nunca é garantia de segurança.

### 4.2 Roles

```javascript
// Custom claim no Firebase Auth, verificado em src/lib/roles.js e nas Firestore Rules (isAdmin())
type Role = "admin" | "user"; // "user" é o padrão implícito — não há claim para isso
```

Mapeamento de acesso por coleção — refletir sempre o que está em `firestore.rules`, não o inverso (se divergir, corrigir as rules ou este documento, nunca deixar os dois contarem histórias diferentes):

| Coleção | Leitura | Escrita |
|---|---|---|
| `content` (artigos/crônicas) | Pública | Só ADMIN |
| `products` | Pública se `active == true`; ADMIN vê tudo | Só ADMIN |
| `suppliers` | Autenticado | Só ADMIN |
| `orders` | Dono ou ADMIN | Criação: dono autenticado (valores recalculados na Function, não na Rule); update: ADMIN ou dono cancelando o próprio pedido (campos restritos); delete: só ADMIN |
| `comments` | Pública | Criação: autenticado, identidade deve bater com o token; edição: autor, campos restritos (`content`, `updatedAt`), janela de 1h; delete físico: proibido |
| `likes` | Pública | Criação/remoção: autenticado, dono do próprio like; update: proibido |
| `users/{userId}` | Dono ou ADMIN | Dono ou ADMIN, campos restritos |
| `audit_logs` | Só ADMIN | Só ADMIN cria; update/delete sempre proibido (append-only) |
| `admins` | Só ADMIN | Sempre proibido pelo cliente (gerido via Admin SDK/script) |
| Qualquer coleção não listada | Negado | Negado (regra default `if false`) |

### 4.3 Idempotência em operações financeiras

Toda Cloud Function que dispara uma cobrança ou processa um webhook de pagamento deve usar uma chave de idempotência **gerada por requisição** (não fixa/hardcoded — essa é uma dívida técnica conhecida e aberta hoje, ver `PROJECT_STATE.md`), e todo webhook deve registrar o evento processado (ex.: `x-request-id`) para ignorar reentregas duplicadas do provedor.

### 4.4 Nunca confiar em dado financeiro vindo do cliente

Preço, total, frete e troco **sempre** são recalculados a partir do dado persistido no Firestore, dentro da Cloud Function — nunca aceitos como parâmetro do cliente. Esta regra existe por causa de um incidente real (compra por R$ 0,01 via adulteração do `amount` enviado ao Mercado Pago) e é inegociável em qualquer código novo de pagamento, frete ou desconto.

### 4.5 Sanitização de conteúdo gerado por usuário

Todo HTML que chega do Firestore (artigo, comentário, qualquer campo de texto rico) passa por `src/lib/sanitize.js` (DOMPurify) antes de qualquer `dangerouslySetInnerHTML`/`innerHTML`. Isso inclui funções "utilitárias" que pareçam inofensivas (extrair texto puro, contar caracteres) — se a implementação usa `innerHTML` internamente, o HTML é executado antes de qualquer coisa acontecer.

### 4.6 Transações atômicas em concorrência

Qualquer alteração de estoque, saldo ou contador que possa sofrer condição de corrida (dois webhooks simultâneos, dois cliques em "comprar") deve usar `db.runTransaction()` com leitura e escrita atômicas — nunca "ler, calcular no client, escrever" (read-then-write) para dado que muda sob concorrência.

---

## 5. Qualidade e Testes (TDD)

### 5.1 Workflow obrigatório

```
Red   → escreve o teste que falha (unitário/integração com Vitest, ou de Firestore Rules com o emulador)
Green → escreve o mínimo de código para passar
Refactor → limpa sem quebrar o teste
```

### 5.2 O que cobrir em cada OS

- Happy path
- Não autenticado (rejeitado)
- Role sem permissão (rejeitado — testar com claim `user` tentando ação de `admin`)
- Dado inválido (rejeitado, seja por validação client-side ou pela Firestore Rule)
- **Toda correção de segurança precisa de dois testes, não um**: o teste que prova que o ataque agora falha, **e** o teste que prova que o fluxo legítimo continua funcionando. Esta lição vem de um bug real do Sprint 0 — uma regra de Firestore Rules corrigida sem esse segundo teste teria ido para produção quebrando a edição legítima de comentários sem ninguém perceber (`timestamp.seconds` usado como propriedade em vez de `.toMillis()`).

### 5.3 Testes de Firestore Rules

Toda mudança em `firestore.rules` **exige** teste correspondente em `firestore.rules.test.js`, rodado via `npm run test:rules` (sobe o emulador do Firestore). Rules sem teste não é considerado trabalho concluído — foi a ausência histórica desses testes que permitiu a maior parte das vulnerabilidades críticas encontradas na auditoria (ver `docs/seguranca/AUDITORIA_SEGURANCA.md`).

### 5.4 Estrutura de testes

```javascript
describe("createPaymentIntent", () => {
  it("cria o pagamento usando o valor do pedido no servidor", async () => { ... });
  it("rejeita se não autenticado", async () => { ... });
  it("rejeita se o pedido não existe", async () => { ... });
  it("ignora qualquer 'amount' enviado pelo cliente", async () => { ... });
});
```

---

## 6. Gerenciamento de Configuração

### 6.1 Conventional Commits

```
feat(comments): permite editar comentário na primeira hora
fix(seguranca): remove brecha de update em orders de terceiros
test(rules): cobre tentativa de escrita em pedido alheio
docs: atualiza PROJECT_STATE após deploy do Sprint 0
chore: remove dist/ do versionamento
```

### 6.2 Regra de commit — OBRIGATÓRIO

- **Um commit por intenção lógica concluída** — nunca acumular múltiplas correções/features não relacionadas em um commit.
- Commit só após os itens do DoD daquela intenção estarem verificados (testes passando, build ok).
- Branch de trabalho: `main` — é a convenção atual deste repositório (projeto pequeno, um desenvolvedor + CTO/agente). Não criar branches de longa duração sem necessidade explícita. A adoção de branch protection + PR obrigatório está no roadmap (`PLANO_DE_ACAO.md`, Fase 5.1); quando isso for implementado, esta seção deve ser atualizada.
- **Nunca commitar segredos**: chaves do Firebase server-side, `serviceAccountKey.json`, tokens do Mercado Pago. Todos já devem estar no `.gitignore` — confirmar antes de qualquer `git add`.

### 6.3 Relatório de execução

Para OS pequenas (1 correção, 1 componente), o corpo do commit é suficiente como relatório, desde que inclua: o que mudou, por quê, e a prova (testes/comando executado). Para OS grandes (nova feature, mudança de arquitetura, correção de segurança com múltiplos arquivos), gerar `docs/execution-reports/EXECUTION_REPORT_[ID].md` com:

```markdown
# Execution Report — [ID]

## Escopo implementado
- [x] Descrição — commit `abc1234`

## Rotas/Functions/Rules criadas ou alteradas
| Tipo | Nome | Status |
|---|---|---|
| Cloud Function (onCall) | createOrder | ✅ Criada |
| Firestore Rule | /orders/{orderId} | ✅ Alterada |

## Testes
- Total: N (Vitest) + N (Firestore Rules)
- Passando: N
- Falhando: N (comparar contra a baseline conhecida em PROJECT_STATE.md)

## DoD
- [x] Critério 1

## Dívidas Técnicas Identificadas
- (se houver)

## Observações para o CTO
- (ambiguidades encontradas, decisões tomadas, riscos)
```

### 6.4 Estrutura de pastas de governança

```
docs/
├── os/                  ← Ordens de Serviço (o que fazer) — 1 arquivo por OS,
│                           nomeado OS_[bloco]_[seq]_[descrição].md, com Status,
│                           Escopo e DoD. É o que o CTO emite.
├── execution-reports/   ← Relatórios de execução (o que o CLI Agent fez) — 1 arquivo
│                           por OS concluída de porte médio/grande, seguindo o
│                           template de §6.3. É o que o CLI Agent entrega.
├── arquitetura/         ← Decisões técnicas e roadmaps (ex.: PLANO_REDESIGN_VISUAL.md)
│                           — contexto compartilhado por várias OS, não é OS em si.
├── historico/           ← Registro narrativo de implementações concluídas, anterior
│                           a este modelo de governança. Não confundir com
│                           execution-reports/: historico/ é resumo em prosa; um
│                           execution-report é o comprovante formal de DoD de uma OS.
├── seguranca/, setup/, guias/  ← ver docs/README.md
```

Uma OS nova sempre nasce em `docs/os/`. Um relatório de execução novo sempre nasce em
`docs/execution-reports/`. Nunca misturar os dois na mesma pasta — foi exatamente essa
mistura (tudo dentro de `docs/arquitetura/`) que motivou esta separação.

---

## 7. Documentos que todo CLI Agent deve ler antes de executar

Em ordem:
1. `AGENTS.md` ← este arquivo
2. `PROJECT_CONTEXT.md` ← stack, arquitetura, domínio, glossário
3. `PROJECT_STATE.md` ← estado atual, dívidas técnicas, próximas ações
4. A OS designada para execução
5. Quando aplicável ao escopo: `PROJECT_SPEC.md` (qualquer mudança de UI/design), `PLANO_DE_ACAO.md` (contexto do roadmap de profissionalização), `docs/seguranca/*` (qualquer mudança em pagamento, Firestore Rules ou renderização de conteúdo de usuário)

Sem a leitura desses documentos, **não iniciar a implementação**.

---

## 8. O que fazer quando houver dúvida

1. **Dúvida técnica de implementação:** tomar a decisão mais conservadora (menor acoplamento, menor risco, nunca confiar em dado do cliente para decisão financeira), registrar a decisão tomada e aguardar validação do CTO.
2. **Dúvida de escopo/produto:** **não implementar**. Registrar como bloqueio e commitar o que foi feito até aquele ponto.
3. **Erro de ambiente (Firebase, emulador, dependência):** registrar com o stack trace completo.

---

## 9. Governança de Execução

### 9.1 Pré-flight obrigatório

Toda OS começa com:
1. `npx vitest run` — output literal completo
2. `npm run test:rules` — obrigatório se a OS tocar `firestore.rules`; output literal completo
3. `npx vite build` — output literal completo
4. Comparação contra a baseline conhecida (ver `PROJECT_STATE.md` — hoje: 298 testes Vitest, 284 passando, **14 falhas pré-existentes e conhecidas**, sem relação com a mudança em curso; 19 testes de Firestore Rules)

Falha nova (fora da baseline conhecida) em qualquer ponto → bloquear, reportar, devolver ao CTO.

**Nota conhecida:** `npm run lint` está quebrado hoje (não existe arquivo de configuração do ESLint no repositório, nem na raiz nem em `functions/`, apesar do script e das dependências existirem). Não é uma falha introduzida pela OS em execução — é uma dívida técnica preexistente (ver `PROJECT_STATE.md`). Não tentar "corrigir de passagem"; registrar e seguir, a menos que a OS seja especificamente sobre isso.

### 9.2 Validação rigorosa

Toda OS termina com mínimo **2 execuções consecutivas** de `npx vitest run`, com output literal de cada uma colado no relatório.

### 9.3 Tabela explícita de testes

O relatório deve conter tabela com todos os testes tocados, por arquivo:

| Caso de teste | Arquivo | Status |
|---|---|---|
| ... | ... | NOVO / MANTIDO / REFATORADO / REMOVIDO |

### 9.4 Granularidade de commits

- 1 commit por intenção lógica distinta.
- Refactors em áreas independentes não se consolidam no mesmo commit.
- Mensagens seguem Conventional Commits.
- **Sob sanção:** consolidação de commits independentes invalida a OS.

### 9.5 Sanção por falsificação

- Marcar item de DoD como concluído sem prova literal.
- Inflar ou desviar contagem de testes.
- Atribuir testes criados a "pré-existentes" sem verificação via `git log`/`git diff`.
- Declarar build/testes limpos sem colar o output.
- Marcar "verificação manual" (ex.: navegador, checkout real) como feita quando na verdade só rodou teste automatizado ou `curl`.

→ **Invalidação imediata + refação total** da OS. Reincidência sem proporcionalidade após esta política.

### 9.6 Log literal sem edição

Outputs de Vitest, emulador do Firestore, `vite build` e git devem ser mostrados sem edição no momento da revisão (chat da sessão, corpo do commit ou descrição do PR) — incluindo banners, timestamps e warnings. Resumir, cortar ou "arrumar" o output antes de mostrá-lo configura quebra de governança.

**Não committar o log bruto como arquivo permanente em `docs/`** — uma execução de `npx vitest run` neste projeto gera ~250KB de output (a suíte tem falhas pré-existentes cujo dump de HTML do Testing Library é grande). Commitar isso a cada OS é o mesmo padrão de inchaço de repositório já registrado como dívida técnica (`dist/` e `node_modules` versionados por engano em outros pontos deste histórico). O relatório de execução (`docs/execution-reports/`) guarda um **resumo fiel**: a linha de resultado (`Test Files`/`Tests` do Vitest) + a lista exata dos casos que falharam (arquivo + nome do teste, sem o stack trace/HTML) quando forem falhas pré-existentes conhecidas. Se uma OS específica precisar arquivar prova bruta (ex.: investigação de um bug difícil), ela vai para o scratchpad da sessão ou anexo do PR, não para o histórico permanente do repositório.

### 9.7 Branch de trabalho

**A partir de 2026-07-22** (adotado durante a Fase 4 — antecipação da Fase 5 do
`PLANO_DE_ACAO.md`): todo trabalho de OS acontece em `develop`, nunca direto em `main`.

```
main      ← só recebe merge de develop, sempre testado e aprovado pelo CTO
  ▲
  │ merge (após OS revisada e aprovada)
  │
develop   ← toda OS é implementada, testada e commitada aqui
```

- CLI Agent: sempre trabalha em `develop` (nunca cria branch própria por OS — não há
  benefício de isolamento quando as OS rodam uma de cada vez, não em paralelo; ver
  §0.1). Se isso mudar (múltiplos agentes rodando OS em paralelo), reavaliar um terceiro
  nível de branch por OS.
- CTO: revisa o trabalho em `develop`; quando aprovado, faz merge para `main`
  (`git merge --no-ff develop` ou equivalente, mantendo o histórico de commits da OS).
- Cadência recomendada: merge para `main` **a cada OS aprovada**, não em lote — mantém
  `main` sempre num estado testado e reduz o risco de conflito acumulado. Divergir dessa
  cadência é decisão do CTO, registrada no relatório de execução da OS em questão.
- `main` e `develop` nascem idênticas em 2026-07-22 (commit `39498e7`) — os commits de
  OS_REDESIGN_001 e OS_REDESIGN_002, já testados e aprovados individualmente antes de
  cada commit, permanecem em `main` sem necessidade de refazer histórico.

### 9.8 Decisões antes da OS

Decisões de produto/escopo são tomadas pelo CTO+PO **antes** da emissão da OS. Agente não decide escopo — registra ambiguidades e aguarda nova OS.

### 9.9 Fluxo quando o PO encontra desvio no trabalho do CLI Agent

Quando o PO, validando uma OS, encontra desvio entre o código entregue e a spec da OS:

1. **NÃO corrigir o código diretamente**, mesmo que a correção pareça trivial.
2. **Reportar ao CTO** descrevendo: (a) o que a spec pediu, (b) o que foi entregue, (c) extensão da divergência.
3. CTO decide entre:
   - (i) Aceitar como desvio menor + registrar dívida técnica em `PROJECT_STATE.md`
   - (ii) Emitir micro-OS de cleanup
   - (iii) Aplicar §9.5 e invalidar a OS
4. Em caso de (ii), CLI Agent implementa o cleanup mantendo histórico auditável.

**Exceções permitidas ao PO (sem consulta ao CTO):**
- Correção de erro de digitação em comentário/docstring (sem implicação técnica).
- Adição/correção de entry em `PROJECT_STATE.md` (documentação de governança).

**Exceção emergencial:** se houver bloqueio operacional crítico (ex.: produção fora do ar, vulnerabilidade ativa sendo explorada, agente CLI indisponível), o PO pode aplicar correção mínima documentando **imediatamente** no chat com o CTO. Aceito por exceção, não regra.

---

*Fim do AGENTS.md — Versão 1.2*
