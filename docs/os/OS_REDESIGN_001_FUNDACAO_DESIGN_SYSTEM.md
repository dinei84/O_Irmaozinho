# OS_REDESIGN_001 — Fundação do Design System

**Status:** ✅ Implementada e verificada — aguardando commit
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Relatório de execução:** [`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_001.md`](../execution-reports/EXECUTION_REPORT_OS_REDESIGN_001.md)

## Escopo

Aplicar a paleta e a tipografia do `PROJECT_SPEC.md` na base do projeto (tokens Tailwind,
fontes, componentes de UI genéricos), sem tocar página por página ainda.

- `tailwind.config.js`: remapear os tokens **já usados em 38 arquivos**
  (`primary`, `secondary`, `background`, `surface`, `text-primary`, `text-secondary`,
  `font-heading`, `font-sans`) para os valores da paleta terrosa — ver a tabela de
  remapeamento e a decisão de arquitetura em
  [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md).
  Adicionar tokens novos sem conflito de nome: `dourado`, `areia`, `pessego`, `borda`.
- Trocar o `@import url(...)` do Google Fonts em `src/index.css` por
  `@fontsource/spectral` + `@fontsource/mulish` (self-hosted — spec §6.3 e
  `PLANO_DE_ACAO.md` 4.1).
- `Button.jsx`: `rounded-xl` → `rounded-full` (pill), altura mínima 44px, variantes
  `primary`/`secondary`/`outline` seguem §5.1 do spec; variante `ghost` mantida.
- `Card.jsx`: `border-gray-100`/`bg-gray-50` → `border-borda`/`areia`.
- Criar `.badge-categoria` (`src/index.css`) conforme §5.2 do spec.

## Definition of Done

- [x] `npx vitest run` sem novas falhas (baseline: 284/298 passando, 14 falhas
      pré-existentes — ver `PROJECT_STATE.md` §0)
- [x] `npx vite build` limpo
- [x] Conferência visual/computada no navegador (Home): cores, tipografia e forma dos
      botões mudaram; nenhuma quebra visual
- [x] 2 execuções consecutivas de `npx vitest run`, output literal no relatório de execução

## Arquivos alterados

- `tailwind.config.js`
- `src/index.css`
- `src/components/ui/Button.jsx`
- `src/components/ui/Card.jsx`
- `package.json` / `package-lock.json` (dependências `@fontsource/spectral`,
  `@fontsource/mulish`)

## Observações

Ver `docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_001.md` para o detalhe completo
da verificação, incluindo a limitação de não ter sido possível capturar screenshot no
ambiente de execução (a prova foi feita por estilos computados via JavaScript no
navegador real, não por imagem).
