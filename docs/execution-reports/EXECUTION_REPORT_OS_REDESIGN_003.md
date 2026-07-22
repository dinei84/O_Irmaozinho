# Execution Report — OS_REDESIGN_003

## Escopo implementado
- [x] Header.jsx redesenhado: fundo `#FBF7EF`, borda inferior `borda`, sticky no scroll, menu hamburguer removido em mobile (navegação primária passa para tab bar)
- [x] BottomTabBar.jsx criado: 4 itens (Início, Artigos, Crônicas, Loja), fixed bottom, `md:hidden`, ícone + label 10px uppercase, altura 64px, ativo em terracota
- [x] Desktop nav mantida com 5 itens (Início → em vez de "Home"), navegação funcional com NavLink
- [x] App.jsx: BottomTabBar montado após Footer, main com `pb-16 md:pb-0` para evitar overlap da tab bar

## Arquivos criados ou alterados

| Tipo | Arquivo | Status |
|---|---|---|
| Alterado | `src/components/layout/Header.jsx` | ✅ Fundo, borda, nav items renomeados, mobile actions simplificados, hamburger removido |
| Criado | `src/components/layout/BottomTabBar.jsx` | ✅ Componente novo de navegação inferior mobile |
| Alterado | `src/App.jsx` | ✅ BottomTabBar importado e montado, padding inferior no main para mobile |

## Testes

- Total: 298 (Vitest)
- Passando: 284
- Falhando: 14 (mesma baseline pré-existente — sem regressão)
- Build: `npx vite build` limpo

### Duas execuções consecutivas
1. `npx vitest run` → 14 failed | 284 passed | 298 total
2. `npx vitest run` → 14 failed | 284 passed | 298 total

## DoD
- [x] Navegação funcional em desktop (menu horizontal) e mobile (tab bar)
- [x] Sem regressão nos testes existentes (284/298 baseline mantida)
- [x] `npx vitest run` sem novas falhas (2 execuções)
- [x] `npx vite build` limpo
- [x] Relatório de execução gerado

## Dívidas Técnicas Identificadas
- Nenhuma nova.

## Observações para o CTO
- O bottom tab bar é `md:hidden` (visível apenas em mobile < 768px). Desktop mantém o header horizontal completo.
- As actions (carrinho + usuário) agora são visíveis tanto em desktop quanto mobile, sem o hamburger de intermediação.
- A verificação manual em navegador real (DoD item 4) fica a cargo do CTO/PO — não foi possível simular viewport mobile neste ambiente.

## Correção aplicada pelo CTO na revisão (2026-07-22)

Verificação em navegador real (viewport mobile 375×812, scroll até o fim da página)
encontrou um problema não coberto pelos testes automatizados: `BottomTabBar` é `fixed`
com 64px de altura e vem depois do `Footer` no DOM; só `<main>` recebeu `pb-16
md:pb-0` para compensar a barra fixa. O `Footer`, que vem depois do `main`, não tinha
essa compensação — medindo via `getBoundingClientRect()` no navegador real, os últimos
~64px do Footer (incluindo o link "Termos", o mais ao fundo) ficavam cobertos pela tab
bar fixa ao rolar até o final em mobile.

**Correção (pequena e simples, aplicada diretamente pelo CTO conforme AGENTS.md §0.1):**
`src/components/layout/Footer.jsx` — `py-8` → `py-8 pb-24 md:pb-8`, mesmo padrão já usado
em `App.jsx` para o `<main>`. Reverificado no navegador real pós-correção: conteúdo real
do rodapé (copyright, links Privacidade/Termos) totalmente visível acima da tab bar
(`lastLinkCoveredByTabBar: false`); testes rodados novamente, sem impacto (nenhum teste
cobre `Footer.jsx`).

**Nota de processo, não relacionada ao código desta OS:** durante a revisão, rodar
`npx vitest run` com o servidor de dev (`npm run dev`) ativo ao mesmo tempo produziu um
resultado muito diferente (42 falhas/302 passando/344 total, ~44s de duração) da
baseline conhecida — investigado antes de reportar como regressão: era contenção de
recursos (dois processos Node concorrendo), não um bug real. Com o servidor de dev
parado, o resultado voltou à baseline exata (14 falhas/284 passando/298 total, ~6s),
confirmado em 2 execuções consecutivas. Lição registrada: nunca rodar a suíte de testes
com o servidor de dev ligado ao mesmo tempo — os números não são confiáveis nessa
condição.

## Verificação independente do CTO — Aprovado (2026-07-22)

- `npx vitest run` (2x, servidor de dev parado): 284/298, mesma baseline, zero
  regressão.
- `npx vite build`: limpo.
- Navegador real, viewport mobile (375×812): tab bar visível e funcional, hamburger
  removido, ícones de carrinho/usuário acessíveis, "Sobre" continua alcançável via
  Footer (fora da tab bar, por decisão da própria spec — não é uma lacuna).
- Bug de overlap Footer/tab bar encontrado e corrigido nesta revisão (ver acima).

**Aprovado**, com a correção do Footer incorporada.
