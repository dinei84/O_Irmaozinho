# OS_REDESIGN_002 — Marca (símbolo + ícones)

**Status:** 🔲 Não iniciada
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
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

- [ ] Favicon novo visível na aba do navegador
- [ ] Símbolo renderiza nítido em 16px e em 512px (verificação visual — SVG deve
      escalar sem serrilhado)
- [ ] `npx vitest run` sem novas falhas
- [ ] `npx vite build` limpo
- [ ] **`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_002.md` gerado** seguindo o
      template de `AGENTS.md` §6.3 — sem esse relatório a OS não está concluída

## Arquivos a alterar

- `public/assets/icons/*` (novos: SVG do símbolo, favicons, touch icon, ícones PWA)
- `index.html`
- `src/components/layout/Header.jsx`

## Fora de escopo desta OS

Bottom tab bar mobile e restante do header (fica para OS_REDESIGN_003).
