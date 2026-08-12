# OS_REDESIGN_009 — PWA (instalabilidade + offline)

**Status:** ✅ Aprovada pelo CTO em 2026-08-12 — SW verificado registrando/ativo em
navegador real (preview), manifest válido, zero lógica tocada; DT-04/05/06 registradas.
Instalação real e offline com dados reais dependem de deploy HTTPS (não bloqueante).
**Relatório de execução:** [`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_009.md`](../execution-reports/EXECUTION_REPORT_OS_REDESIGN_009.md)
**Branch:** criar `feature/os-009-pwa` a partir de `develop` — nunca em `main`
(ver `AGENTS.md` §9.7). **Passo zero, antes de qualquer edição.**
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Depende de:** OS_REDESIGN_002 (ícones PWA 192/512 já gerados em `public/assets/icons/`)

---

## Leitura obrigatória antes de começar (nesta ordem)

1. `AGENTS.md`  2. `PROJECT_CONTEXT.md`  3. `PROJECT_STATE.md`  4. Esta OS
5. `PROJECT_SPEC.md` — §2.2 (ícone de app), §5.7 (prompt de instalação), §6.3 (PWA)
6. `Proposta_Revitalizacao_OIrmaozinho.pdf` slide 06 (mockup mobile/PWA + prompt)

## Passo zero (obrigatório)

```bash
git checkout develop
git checkout -b feature/os-009-pwa
git branch --show-current   # DEVE imprimir feature/os-009-pwa
```

---

## Escopo

Tornar o app instalável (PWA) com service worker e leitura offline do que já foi
visitado, conforme `PROJECT_SPEC.md` §6.3. Usar **`vite-plugin-pwa`** (Workbox por baixo).

1. **Instalar:** `npm i -D vite-plugin-pwa`
2. **`vite.config.js`:** adicionar o plugin `VitePWA({...})`. O manifest é gerado **pelo
   plugin** (não precisa de `public/manifest.json` separado — configurar via opção
   `manifest`):
   - `name`: "O Irmãozinho", `short_name`: "Irmãozinho"
   - `theme_color`: `#47533F` (oliva), `background_color`: `#F7F1E7` (papel)
   - `display`: `standalone`, `start_url`: `/`, `lang`: `pt-BR`
   - `icons`: `pwa-icon-192x192.png` e `pwa-icon-512x512.png` (já existem em
     `public/assets/icons/`; incluir o 512 também com `purpose: "maskable"` — há o
     `logo-app-icon-maskable.svg`/PNG da OS_002 se preferir um maskable dedicado)
   - `registerType: 'autoUpdate'`
   - **Workbox / runtime caching:**
     - Precache do app shell (HTML/CSS/JS/fontes `@fontsource` — já entram no
       `globPatterns` padrão do plugin sobre o build).
     - `runtimeCaching` com `StaleWhileRevalidate` para imagens (`img-src`) e assets —
       permite reabrir conteúdo já visitado offline.
3. **Prompt de instalação customizado (spec §5.7)** — componente novo (ex.:
   `src/components/features/pwa/InstallPrompt.jsx`), montado no layout raiz:
   - Cartão flutuante sobre fundo **oliva** (`bg-secondary`), símbolo em pêssego, texto
     "Instalar o app" + "Leia offline, na tela inicial", botão pill "Instalar" em
     `bg-pessego text-secondary`.
   - Acionado pelo evento `beforeinstallprompt` (capturado e adiado); dispensável e não
     intrusivo (não bloquear conteúdo); reaparece só depois de alguns dias se dispensado
     (pode usar `localStorage` para lembrar a dispensa).
   - **Fallback iOS** (Safari não expõe `beforeinstallprompt`): instrução textual
     "Adicionar à Tela de Início" (detectar iOS + standalone).
4. **`theme-color`:** meta tag base `#FBF7EF` no `index.html`. Dinâmico por tela é
   desejável (ver spec §6.3), mas **um `theme-color` estático já satisfaz o mínimo** —
   se o dinâmico ficar complexo, entregar o estático e registrar o dinâmico como melhoria.

## Boa notícia (não precisa mexer): CSP já é compatível

O CSP do Sprint 0 (`firebase.json`) já tem **`worker-src 'self'`** e `default-src 'self'`
— service worker e manifest same-origin são permitidos. **Não altere o `firebase.json`.**
Apenas registre no report que o registro do SW foi verificado localmente; a validação em
produção depende do deploy do Sprint 0 (ainda pendente — `PROJECT_STATE.md` §1).

## Decisão em aberto (resolva e registre no report)

**Leitura offline de artigos:** o conteúdo vem do Firestore (gRPC/websocket), que o
Workbox não cacheia bem via `runtimeCaching` de HTTP. O precache do shell + cache de
imagens/assets dá "abre offline e mostra o que já estava renderizado"; **leitura offline
plena do texto do artigo** provavelmente exigiria a persistência offline do próprio
Firestore (`enableIndexedDbPersistence`) — o que é **lógica de dados, fora do escopo
visual/PWA desta OS**. Entregue o shell + assets offline e, se a leitura plena do texto
exigir a persistência do Firestore, **registre como dívida técnica** para uma OS futura,
não force aqui.

## Armadilhas conhecidas (não repita)

- Rode `npx vitest run` com o **servidor de dev DESLIGADO**.
- Se o build modificar `dist/index.html`, reverta: `git checkout -- dist/index.html`.
  (O `dist/` é gitignorado exceto `index.html`; o `sw.js`/`manifest` gerados ficam em
  `dist/` e **não** devem ser commitados.)
- **NÃO** toque em `src/lib/sanitize.js`, nem em lógica de serviços/hooks/pagamento.
- **NÃO** faça merge nem `git push` — deixe a branch pronta para o CTO revisar.

## Fora de escopo

- Persistência offline do Firestore (`enableIndexedDbPersistence`) — é lógica de dados.
- Deploy / verificação em produção (depende do deploy do Sprint 0).
- `pages/admin/*`.

---

## Definition of Done

- [x] `vite-plugin-pwa` instalado e configurado em `vite.config.js`
- [x] `npx vite build` gera **manifest e service worker válidos** em `dist/` (conferir que
      `dist/manifest.webmanifest` e `dist/sw.js` — ou nomes equivalentes do plugin —
      existem, e que o manifest tem name/short_name/theme_color/ícones corretos)
- [x] `npm run preview` (build de produção servido localmente): o SW **registra sem erro
      no console**, o manifest é servido, e o app continua funcionando
- [x] Prompt de instalação customizado implementado (com fallback iOS), montado no layout
- [x] `npx vitest run` (2x, dev server desligado) **sem novas falhas** (baseline 284/298)
- [x] `npx vite build` limpo
- [~] Instalação real ("Install app") e leitura offline com dado real — **verificar na
      medida do possível** (localhost/preview); ser honesto no report sobre o que exige
      deploy HTTPS + dados reais (provavelmente não testável 100% neste ambiente)
- [x] **Arquivo de report gerado (ver "Entrega obrigatória" abaixo)**

> **Nota de verificação:** service worker e instalação PWA precisam de HTTPS ou
> `localhost`, e a instalação depende de heurísticas de engajamento do navegador +
> manifest válido. O `beforeinstallprompt` pode não disparar num ambiente sem
> engajamento. Verifique o que der (build gera SW/manifest, preview registra o SW, sem
> erro no console, Lighthouse PWA se rodar) e **seja honesto** sobre o que ficou para
> validar em produção. Nunca marque "instalável testado em navegador real" sem prova.

---

## Entrega obrigatória — arquivo de report para análise

Ao final, o agente **DEVE** criar `docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_009.md`
(template do `AGENTS.md` §6.3). **Sem esse arquivo, a OS NÃO está concluída.** Precisa
conter, no mínimo: escopo implementado; arquivos alterados (tabela); testes (linha de
resultado das 2 execuções, literal); build (incluindo confirmação de que SW/manifest
foram gerados); DoD marcado com honestidade (`[x]`/`[ ]`/`[~]` com motivo); a **decisão
sobre a leitura offline** (shell-only vs. Firestore persistence → DT); dívidas técnicas;
observações para o CTO.

Depois do report, commit(s) na branch `feature/os-009-pwa` (Conventional Commits,
terminando com `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`) e **pare** —
sem merge, sem push.

---

## Arquivos a alterar (resumo)

- `package.json` / `package-lock.json` (dependência `vite-plugin-pwa`)
- `vite.config.js` (plugin + manifest + runtime caching)
- `index.html` (meta `theme-color`; o link do manifest costuma ser injetado pelo plugin)
- `src/components/features/pwa/InstallPrompt.jsx` (novo) + montagem em `src/App.jsx`
- `docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_009.md` (novo — o report)
- **Não** committar artefatos gerados em `dist/` (sw.js/manifest são build output)
