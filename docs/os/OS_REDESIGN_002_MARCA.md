# OS_REDESIGN_002 — Marca (símbolo + ícones)

**Status:** ✅ Implementada, verificada e aprovada pelo CTO em 2026-07-22
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Relatório de execução:** [`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_002.md`](../execution-reports/EXECUTION_REPORT_OS_REDESIGN_002.md)
**Depende de:** OS_REDESIGN_001 (tokens de cor já precisam existir)

## Escopo

- Criar o símbolo da marca em SVG: dois círculos concêntricos-adjacentes — maior em
  contorno terracota (representa "irmão"), menor preenchido sobreposto no canto
  inferior direito (representa "irmãozinho") — conforme `PROJECT_SPEC.md` §2.1 e o
  mockup do deck `Proposta_Revitalizacao_OIrmaozinho.pdf` (slide 04, logo no header).
- Gerar exportações a partir do SVG: favicon 16×16 e 32×32, touch icon 180×180 (iOS),
  ícones PWA 192×192 e 512×512 (maskable, padding de segurança 66% para Android) —
  estes últimos só serão **consumidos** na OS_REDESIGN_009 (PWA), mas devem ser gerados
  aqui junto com o símbolo-fonte.
- Atualizar `index.html` (`<link rel="icon">`) para o novo favicon.
- Atualizar o logo em `src/components/layout/Header.jsx`: símbolo + "O Irmãozinho" em
  Spectral Bold (hoje é só texto).

## Definition of Done

- [x] Favicon novo visível na aba do navegador
- [x] Símbolo renderiza nítido em 16px e em 512px (verificação visual — SVG deve
      escalar sem serrilhado)
- [x] `npx vitest run` sem novas falhas
- [x] `npx vite build` limpo
- [x] **`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_002.md` gerado** seguindo o
      template de `AGENTS.md` §6.3 — sem esse relatório a OS não está concluída

## Arquivos a alterar

- `public/assets/icons/*` (novos: SVG do símbolo, favicons, touch icon, ícones PWA)
- `index.html`
- `src/components/layout/Header.jsx`

## Fora de escopo desta OS

Bottom tab bar mobile e restante do header (fica para OS_REDESIGN_003).

## Verificação independente do CTO (2026-07-22)

O relatório do CLI Agent não reivindicou verificação em navegador real (só provas
automatizadas + argumento vetorial) — completei essa lacuna antes de aprovar:

- `npx vitest run` (2x) e `npx vite build`: confirmados de forma independente, mesmo
  resultado do relatório (284/298, 14 falhas pré-existentes, zero regressão).
- Geometria do SVG (`logo-symbol.svg`) conferida por cálculo: círculo maior
  (176px raio) e menor (108px raio) com centros a ~178px de distância — overlap real
  no canto inferior direito, batendo com a spec (não é só encostar, nem um dentro do
  outro).
- Regra de contraste da spec §3 (nunca terracota sobre terracota) verificada nos ícones
  de app: `logo-app-icon.svg`/`logo-app-icon-maskable.svg` usam símbolo em papel
  (`#F7F1E7`) sobre fundo terracota — correto, evita símbolo invisível sobre o próprio
  fundo.
- PNGs (`favicon-16x16.png`, `pwa-icon-512x512.png`) inspecionados visualmente — nítidos,
  sem serrilhado, batendo com o mockup do deck (slide 04).
- Navegador real (dev server local, `.env` placeholder temporário): `<link rel="icon">`
  presentes com os hrefs corretos (SVG + PNG 16/32 + apple-touch-icon), `<img>` do logo
  no Header carregado com sucesso (`200 OK`, `naturalWidth: 150`, `complete: true`).

**Aprovado.**
