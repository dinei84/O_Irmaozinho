# Plano de Ação — Redesign Visual (Fase 4 do `PLANO_DE_ACAO.md`)

**Status:** aprovado pelo PO em 2026-07-22. Execução por OS, uma de cada vez — ver
`AGENTS.md`. As OS individuais (escopo + DoD) vivem em [`docs/os/`](../os/); este
documento é o roadmap e o registro das decisões de arquitetura compartilhadas por
todas elas.

---

## Contexto

`PROJECT_SPEC.md` é a fonte única de verdade do design (aprovada pela diretoria) e o deck
`Proposta_Revitalizacao_OIrmaozinho.pdf` mostra os mockups reais (logo, Home, página de
artigo, mobile/PWA) que embasam a spec. O site ainda está na identidade antiga: azul
`#4A90E2`/navy `#2C3E50`, Poppins/Open Sans via Google Fonts CDN, botões `rounded-xl`
(não pill), sem PWA, sem o símbolo de marca. `PLANO_DE_ACAO.md` já esboça isso em alto
nível como "Fase 4" (4.1–4.5); a quebra executável dessa fase em OS está listada abaixo.

**Levantamento feito no início do planejamento (grep real, não estimado):**
- 38 arquivos usam as classes `bg-primary`/`text-primary`/`bg-secondary`/`text-secondary`/
  `font-heading`/`font-sans` — hoje resolvidas para azul/Poppins via `tailwind.config.js`.
- 34 arquivos usam cores cruas do Tailwind (`gray-*`, `blue-*`, `indigo-*`) fora do sistema
  de tokens — essas **não** são resolvidas automaticamente por uma troca de config.
- `Button.jsx` e `Card.jsx` (únicos componentes de UI genéricos) não têm suíte de testes
  dedicada.
- Nenhuma dependência de PWA instalada antes da OS_REDESIGN_009.

### Decisão de arquitetura para minimizar o raio de mudança

Manter os **nomes** dos tokens Tailwind já usados em 38 arquivos (`primary`, `secondary`,
`background`, `surface`, `text-primary`, `text-secondary`, `font-heading`, `font-sans`) e
só trocar os **valores** em `tailwind.config.js` para a paleta/tipografia do spec:

| Token atual (nome mantido) | Valor novo | Papel no spec |
|---|---|---|
| `primary` | `#B65E38` (terracota) | Ação primária |
| `secondary` | `#47533F` (oliva) | Ação secundária / base escura |
| `background` | `#F7F1E7` (papel) | Fundo de página |
| `surface` | `#FFFFFF` / papel | Superfície de card |
| `text-primary` | `#2A2620` (tinta) | Texto principal |
| `text-secondary` | `#8B7C64` (neutro) | Texto de apoio/metadado |
| `font-heading` | Spectral | Títulos/leitura |
| `font-sans` | Mulish | Interface |

Tokens **novos** adicionados (sem conflito de nome): `dourado` (`#C79A3E`), `areia`
(`#EFE6D5`), `pessego` (`#E8C9B4`), `borda` (`#E4D9C7`).

Essa decisão (implementada na OS_REDESIGN_001) significa que uma única OS já corrige a
cor/fonte de ~38 arquivos sem tocá-los. O trabalho por página, depois, é sobre **forma**
(pill em vez de `rounded-xl`, grids do spec, componentes novos) e sobre os 34 arquivos
com cor crua, tratados incrementalmente conforme cada página é redesenhada — nunca como
um find-and-replace cego de uma vez só.

### Nota de sequenciamento

O `PLANO_DE_ACAO.md` tem como "regra de ouro" que nenhuma feature nova entra em produção
antes da Fase 0 (segurança) estar concluída. O código da Fase 0 está pronto (`d41bf2a`)
mas **ainda não foi deployado** (`PROJECT_STATE.md` §0). Recomendação: fazer o deploy do
Sprint 0 de segurança antes de colocar qualquer entrega deste plano em produção — o
desenvolvimento do redesign em si pode prosseguir em paralelo, sem depender do deploy.

### Fora de escopo

Lógica de pagamento/checkout (Mercado Pago), regras do Firestore, LGPD, wrapper nativo
(spec §6.4, "se aplicável no futuro"), redesign dedicado das telas `pages/admin/*`.

---

## Roadmap de OS

| OS | Título | Status |
|---|---|---|
| [OS_REDESIGN_001](../os/OS_REDESIGN_001_FUNDACAO_DESIGN_SYSTEM.md) | Fundação do design system (tokens, fontes, `Button`/`Card`) | ✅ Implementada, aguardando commit |
| [OS_REDESIGN_002](../os/OS_REDESIGN_002_MARCA.md) | Marca (símbolo + ícones) | ✅ Aprovada |
| [OS_REDESIGN_003](../os/OS_REDESIGN_003_HEADER_NAV_MOBILE.md) | Header/navegação + bottom tab bar mobile | ✅ Aprovada |
| [OS_REDESIGN_004](../os/OS_REDESIGN_004_HOME.md) | Home | ✅ Aprovada |
| [OS_REDESIGN_005](../os/OS_REDESIGN_005_PAGINA_ARTIGO.md) | Página de leitura do artigo | ✅ Aprovada |
| [OS_REDESIGN_006](../os/OS_REDESIGN_006_LISTAGENS.md) | Listagens (Artigos, Crônicas) | 🔲 Não iniciada |
| [OS_REDESIGN_007](../os/OS_REDESIGN_007_LOJA_CHECKOUT.md) | Loja e Checkout | 🔲 Não iniciada |
| [OS_REDESIGN_008](../os/OS_REDESIGN_008_PAGINAS_RESTANTES.md) | Páginas restantes + limpeza de cores cruas | 🔲 Não iniciada |
| [OS_REDESIGN_009](../os/OS_REDESIGN_009_PWA.md) | PWA (instalabilidade + offline) | 🔲 Não iniciada |
| [OS_REDESIGN_010](../os/OS_REDESIGN_010_PERFORMANCE_REVISAO_FINAL.md) | Performance e revisão final | 🔲 Não iniciada |

Relatórios de execução ficam em [`docs/execution-reports/`](../execution-reports/),
um por OS concluída.

## Verificação end-to-end (aplicável a cada OS)

1. `npx vitest run` (2 execuções consecutivas, output literal no relatório de execução)
   — comparar contra a baseline conhecida (`PROJECT_STATE.md` §0: 298 testes, 284
   passando, 14 falhas pré-existentes).
2. `npx vite build` limpo.
3. **Verificação manual em navegador real** (não `curl`, não só teste automatizado):
   abrir a página tocada, comparar visualmente com o mockup correspondente do
   deck/spec, testar em viewport mobile e desktop.
4. Cada OS gera commit(s) próprio(s) (Conventional Commits), seguindo `AGENTS.md` §6.
