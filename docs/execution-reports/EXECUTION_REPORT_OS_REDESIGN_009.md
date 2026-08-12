# Execution Report — OS_REDESIGN_009 (PWA: instalabilidade + offline)

**Branch:** `feature/os-009-pwa` (criada a partir de `develop`)
**Data:** 2026-08-12
**Executor:** CLI Agent (Claude Code / Sonnet 5)

---

## Escopo implementado

- [x] Instalado `vite-plugin-pwa` (v1.3.0) como devDependency — `package.json`/`package-lock.json` atualizados.
- [x] `vite.config.js`: adicionado `VitePWA({...})` com `registerType: 'autoUpdate'` e `manifest` gerado pelo plugin (sem `public/manifest.json` separado):
  - `name`: "O Irmãozinho", `short_name`: "Irmãozinho"
  - `theme_color`: `#47533F` (oliva), `background_color`: `#F7F1E7` (papel)
  - `display`: `standalone`, `start_url`: `/`, `lang`: `pt-BR`, `scope`: `/`
  - `icons`: `pwa-icon-192x192.png` (any) e `pwa-icon-512x512.png` (any + **maskable**)
- [x] Workbox `runtimeCaching`: `StaleWhileRevalidate` para `request.destination === 'image'` (cache "images", 60 entradas, 30 dias) — permite reabrir imagens/artigos já visitados offline.
- [x] `globPatterns` cobre `js/css/html/svg/png/woff2` → precache do app shell (77 entradas, incluindo fontes `@fontsource`).
- [x] `index.html`: meta `theme-color` base `#FBF7EF` adicionada (estático — dinâmico por tela registrado como melhoria, ver §Decisão).
- [x] `src/components/features/pwa/InstallPrompt.jsx` (novo): cartão flutuante não intrusivo,
  - Fundo `bg-secondary` (oliva), marca em `text-pessego`, texto "Instalar o app" + "Leia offline, na tela inicial".
  - Botão pill "Instalar" `bg-pessego text-text-primary` (tinta, conforme PROJECT_SPEC §5.7 "texto tinta escura" — ver Decisão).
  - Acionado por `beforeinstallprompt` (capturado e adiado); dispensável (X) com `localStorage` (`oirmaozinho:pwa-dismissed`) — reaparece só após 3 dias.
  - **Fallback iOS**: detecta iOS + não-standalone e mostra instrução "Compartilhar → Adicionar à Tela de Início" (Safari não expõe `beforeinstallprompt`).
- [x] Montado `<InstallPrompt />` em `src/App.jsx` (após `CartDrawer`, no layout raiz).
- [x] `dist/index.html` revertido após build (não commitado).

## Arquivos alterados

| Arquivo | Tipo | Status |
|---|---|---|
| `package.json` | Dependência | ✅ Alterado |
| `package-lock.json` | Lockfile | ✅ Alterado |
| `vite.config.js` | Config (plugin + manifest + runtimeCaching) | ✅ Alterado |
| `index.html` | Meta `theme-color` | ✅ Alterado |
| `src/App.jsx` | Montagem do `InstallPrompt` | ✅ Alterado |
| `src/components/features/pwa/InstallPrompt.jsx` | Componente novo (prompt) | ✅ Criado |
| `docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_009.md` | Relatório | ✅ Criado |

**Não commitados (corretamente, são build output):** `dist/sw.js`, `dist/workbox-*.js`, `dist/registerSW.js`, `dist/manifest.webmanifest`. O `dist/` é gitignorado; `dist/index.html` foi revertido.

## Testes

Rodados com o servidor de dev **desligado** (`npx vitest run`, duas execuções consecutivas):

**Execução 1 (pré-change — baseline):**
```
 Test Files  10 failed | 11 passed (21)
      Tests  14 failed | 284 passed (298)
   Start at  15:39:31
   Duration  6.44s
```

**Execução 2 (pré-change — confirmação):**
```
 Test Files  10 failed | 11 passed (21)
      Tests  14 failed | 284 passed (298)
   Start at  15:39:42
   Duration  6.33s
```

**Execução 3 (pós-change):**
```
 Test Files  10 failed | 11 passed (21)
      Tests  14 failed | 284 passed (298)
   Start at  15:42:53
   Duration  6.45s
```

**Execução 4 (pós-change — confirmação):**
```
 Test Files  10 failed | 11 passed (21)
      Tests  14 failed | 284 passed (298)
   Start at  15:43:04
   Duration  6.38s
```

- Baseline: 298 total / 284 passando / **14 falhas pré-existentes**.
- Resultado: **idêntico à baseline em todas as 4 execuções — nenhuma nova falha.**

## Build / verificação PWA

`npx vite build` (pós-change):
```
PWA v1.3.0
mode      generateSW
precache  77 entries (5296.72 KiB)
files generated
  dist/sw.js
  dist/workbox-dc521307.js
✓ built in 3.17s
```

**Artefatos gerados em `dist/` (servidos via `npm run preview`):**
- `manifest.webmanifest` → 200
- `sw.js` → 200
- `registerSW.js` → 200
- `assets/icons/pwa-icon-512x512.png` → 200

**Conteúdo do `sw.js` confirmado:** `precacheAndRoute` com 77 entradas (HTML, CSS, JS, fontes `@fontsource` woff2, PNGs dos ícones) + `cleanupOutdatedCaches()` + `NavigationRoute` (SPA fallback para `index.html`) + `registerRoute` de imagens com `StaleWhileRevalidate` (cache "images", 60 entradas, 2592000s).

**`dist/index.html` confirmado:** injetado `<link rel="manifest" href="/manifest.webmanifest">` e `<script id="vite-plugin-pwa:register-sw" src="/registerSW.js">`. Meta `theme-color` presente.

**CSP:** `firebase.json` já tem `worker-src 'self'` + `default-src 'self'` → service worker e manifest same-origin permitidos (não alterado, conforme OS).

## DoD

- [x] `vite-plugin-pwa` instalado e configurado em `vite.config.js`
- [x] `npx vite build` gera **manifest e service worker válidos** em `dist/` (`manifest.webmanifest` + `sw.js`, com name/short_name/theme_color/ícones corretos — conferido acima)
- [x] `npm run preview`: SW **registrado sem erro** (endpoints 200, SW contém precache + runtime caching corretos). Validação de "console sem erro" limitada a checagem de serviço HTTP — ver observação abaixo.
- [x] Prompt de instalação customizado implementado (com fallback iOS), montado no layout
- [x] `npx vitest run` (2x, dev server desligado) **sem novas falhas** (baseline 284/298)
- [x] `npx vite build` limpo (chunk >500KB pré-existente)
- [~] Instalação real ("Install app") e leitura offline com dado real — **não testável 100% neste ambiente** (requer HTTPS + engajamento do navegador + Firebase real). Verificado: build gera SW/manifest válidos, preview os serve com 200 e o SW tem o roteamento correto. **Não** marquei "instalável testado em navegador real" — honestidade §9.5.
- [x] **Arquivo de report gerado** (`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_009.md`)

## Decisão sobre leitura offline

Entregue **shell + assets + imagens offline** (precache do app shell + `StaleWhileRevalidate` de imagens). O conteúdo textual dos artigos vem do Firestore (gRPC/websocket) e **não** é cacheado pelo Workbox — abrir um artigo já visitado offline mostra o shell + imagens, mas o texto renderizado depende de ter carregado antes (o HTML do shell é o mesmo; o conteúdo vem via JS/Firestore em runtime). Leitura offline **plena do texto** exigiria `enableIndexedDbPersistence` do Firestore — **lógica de dados, fora do escopo desta OS**.

→ **Registrado como dívida técnica** (ver abaixo): leitura offline completa do texto de artigos via persistência do Firestore.

## Dívidas Técnicas identificadas

- **DT-PWA-01 (BAIXA/MÉDIA):** Leitura offline completa do texto de artigos. O Workbox só cobre shell + imagens; o texto do Firestore não persiste offline. Requer `enableIndexedDbPersistence` (lógica de dados, nova OS). Fora do escopo da OS_009.
- **DT-PWA-02 (BAIXA):** `theme-color` dinâmico por tela (spec §6.3) não implementado — entregue estático (`#FBF7EF`). Melhoria futura; o estático já satisfaz o mínimo do DoD.
- **DT-PWA-03 (BAIXA):** Splash screen nativa (spec §6.3) não implementada explicitamente. Navegadores modernos geram splash a partir de `background_color` + ícone do manifest; iOS exige `apple-touch-startup-image` (complexo). Fora do DoD da OS.

## Observações para o CTO

- Cores do prompt: o OS dizia "botão bg-pessego `text-secondary`", mas PROJECT_SPEC §5.7 (fonte de verdade) diz "texto tinta escura". Usei `text-text-primary` (tinta `#2A2620`) por melhor contraste sobre pêssego — registrado aqui a divergência.
- `vite-plugin-pwa` adicionou 158 pacotes transitivos; `npm audit` reporta vulnerabilidades em deps transitivas do plugin (comum). Não afeta runtime do app; opcional investigar.
- **Não** mexido em `src/lib/sanitize.js`, serviços, hooks ou pagamento (proibido pela OS).
- **Não** alterado `firebase.json` (CSP já compatível).
- Branch pronta para revisão — **sem merge, sem push** (instrução da OS).
- Validação de instalação em navegador real + leitura offline com dados reais ficam para produção (HTTPS + deploy do Sprint 0 pendente, PROJECT_STATE §1).
