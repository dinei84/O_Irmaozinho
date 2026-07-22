# OS_REDESIGN_009 — PWA (instalabilidade + offline)

**Status:** 🔲 Não iniciada
**Branch:** criar `feature/os-009-pwa` a partir de `develop` — nunca em `main`
(ver `AGENTS.md` §9.7). **Passo zero, antes de qualquer edição.**
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Depende de:** OS_REDESIGN_002 (ícones 192/512 já gerados)

## Escopo (`PROJECT_SPEC.md` §6.3, mockup do deck slide 06)

- `npm i vite-plugin-pwa`.
- `manifest.json`: `name` "O Irmãozinho", `short_name` "Irmãozinho",
  `theme_color` `#47533F`, `background_color` `#F7F1E7`, `display: standalone`, ícones
  192/512 (gerados na OS_REDESIGN_002).
- Service worker: precache do shell (HTML/CSS/JS/fontes) + `staleWhileRevalidate` para
  artigos já visitados (leitura offline).
- Prompt de instalação customizado (spec §5.7): cartão sobre fundo oliva, texto
  "Instalar o app" / "Leia offline, na tela inicial", acionado por
  `beforeinstallprompt`, com fallback textual em iOS (instruções "Adicionar à Tela de
  Início" via Safari).
- `theme-color` dinâmico por tela.

## Atenção

O CSP definido no Sprint 0 de segurança (`firebase.json`) precisa permitir o service
worker — testar o registro do SW manualmente **depois** do deploy do Sprint 0 de
segurança (ver `PROJECT_STATE.md` §1). Se o Sprint 0 ainda não estiver em produção
quando esta OS rodar, testar localmente e registrar a pendência de verificação em
produção no relatório de execução.

## Definition of Done

- [ ] App instalável testado em navegador real (Chrome desktop "Instalar app" e
      Chrome Android via `beforeinstallprompt`)
- [ ] Leitura de um artigo já visitado funciona offline
- [ ] `npx vitest run` sem novas falhas
- [ ] `npx vite build` limpo
- [ ] **`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_009.md` gerado** seguindo o
      template de `AGENTS.md` §6.3 — sem esse relatório a OS não está concluída

## Arquivos a alterar

- `manifest.json` (novo)
- `vite.config.js`
- Service worker (novo, gerado por `vite-plugin-pwa`)
- `index.html` (meta tags de PWA/theme-color)
