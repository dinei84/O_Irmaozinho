# PROJECT_SPEC.md — O Irmãozinho · Revitalização de Design

Status: **Aprovado pela diretoria**. Este documento é a fonte única de verdade (bíblia) para a refatoração visual e de UX do site/app "O Irmãozinho". Qualquer implementação (web, PWA, mobile) deve seguir estas especificações.

---

## 1. Visão e princípios

- **Produto**: blog cristão (artigos, crônicas, reflexões) com e-commerce integrado (loja).
- **Prioridade de conteúdo**: o **blog é o coração do produto**; a loja é secundária e usa o mesmo sistema visual.
- **Tom**: moderno, aconchegante, editorial — "um cantinho de fé para respirar a alma".
- **Princípios de design**:
  1. Legibilidade acima de tudo — textos longos devem ser confortáveis de ler em qualquer aparelho.
  2. Calor humano — evitar frieza corporativa (azul genérico, cinza técnico).
  3. Simplicidade editorial — poucos elementos, hierarquia clara, muito espaço em branco.
  4. Mobile-first — a maioria dos leitores acessa pelo celular; desktop é a extensão, não o ponto de partida.
  5. Instalável — o site deve funcionar como app (PWA) em qualquer aparelho, sem loja de apps.

---

## 2. Identidade de marca

### 2.1 Logo / símbolo
- **Símbolo**: dois círculos concêntricos-adjacentes representando **"irmão" (maior, contorno)** e **"irmãozinho" (menor, preenchido)** — sobrepostos no canto inferior direito do círculo maior. Representa proximidade, cuidado e comunhão.
- **Versões obrigatórias**:
  - **Logo principal (horizontal)**: símbolo + "O Irmãozinho" (Spectral Bold) + tagline opcional "reflexões para a vida cristã" (Mulish, uppercase, tracking largo, cinza-neutro).
  - **Versão empilhada**: símbolo acima, nome abaixo, centralizado — usar em espaços quadrados/estreitos (splash screen, ícone de app com texto, redes sociais).
  - **Símbolo isolado (mark only)**: apenas os dois círculos — usar como favicon, ícone de PWA/app, avatar de marca, loading spinner.
- **Área de proteção**: mínimo de 0.5× a altura do símbolo ao redor do logo em qualquer aplicação.
- **Fundo**: o símbolo deve funcionar sobre papel claro (#F7F1E7), sobre oliva (#47533F) e sobre terracota (#B65E38) — sempre com contraste suficiente (trocar cor de preenchimento do símbolo conforme fundo, ver seção 3).
- **Não fazer**: não distorcer, não girar, não aplicar sombra externa, não usar sobre fotos sem um scrim de contraste.

### 2.2 Ícone de app (PWA / mobile)
- Base: símbolo isolado, centralizado, sobre fundo sólido **#B65E38** (terracota) ou **#47533F** (oliva) — cantos em squircle conforme guidelines de cada plataforma (iOS: superellipse; Android: adaptive icon com padding de segurança de 66% da área).
- Tamanhos mínimos a gerar: 512×512 (manifest), 192×192, 180×180 (iOS touch icon), 32×32 e 16×16 (favicon).

---

## 3. Paleta de cores

Paleta terrosa e acolhedora — substitui integralmente o azul/navy atual.

| Papel | Nome | Hex | Uso |
|---|---|---|---|
| Cor de ação primária | Terracota | `#B65E38` | Botões primários (CTA), links de destaque, ícone ativo, barra de progresso, player de áudio |
| Cor de ação secundária / base escura | Oliva | `#47533F` | Botões secundários (outline/fill), footer, seções de destaque em bloco cheio, header do app |
| Cor de destaque / dourado | Dourado | `#C79A3E` | Selos de categoria secundários, marcações de destaque, hover states pontuais |
| Cor de texto principal | Tinta | `#2A2620` | Texto principal (headings, corpo de alta ênfase) |
| Fundo de página | Papel | `#F7F1E7` / `#FBF7EF` | Fundo padrão de página (dois tons intercambiáveis conforme seção) |
| Fundo alternativo | Areia | `#EFE6D5` | Seções alternadas, cards de apoio, fundo de blocos de features |
| Acento suave / superfícies | Pêssego | `#E8C9B4` | Ícone/CTA sobre fundo oliva, badges suaves, prompts de instalação PWA |
| Texto secundário / neutro | Neutro | `#8B7C64` | Metadados (datas, tempo de leitura), texto de apoio, placeholders |
| Bordas | Borda | `#EFE6D5` / `#E4D9C7` | Bordas de cards, divisores |

**Cores de apoio derivadas (uso pontual)**:
- Badge de categoria "Reflexão"/"Crônica"/"Artigo": fundo `#EDE1CD`, texto `#8A5A2E`.
- Fundo do player de áudio (TTS): `#F1E7D6`, borda `#E7D9C0`.
- Trilha de progresso (barra/áudio): fundo `#E1D2B8` / `#EFE6D5`, preenchido `#B65E38`.

**Regras de contraste**: todo texto sobre terracota, oliva ou tinta deve usar `#F7F1E7` (quase-branco quente) — nunca branco puro (#FFF), para manter a paleta quente. Nunca usar azul, cinza frio ou preto puro em qualquer novo componente.

---

## 4. Tipografia

- **Títulos e corpo de leitura (artigos)**: **Spectral** (serifada, Google Fonts) — pesos 400, 500, 600, 700, 800, e itálico 400/500.
  - Uso: H1–H3, corpo de texto de artigos/crônicas, citações (itálico), capitulares.
- **Interface e apoio**: **Mulish** (sans humanista, Google Fonts) — pesos 400, 500, 600, 700, 800.
  - Uso: navegação, botões, badges, metadados, formulários, comentários, footer.
- **Monoespaçada (uso decorativo only)**: `ui-monospace`/`SF Mono` — apenas para eyebrows/labels técnicos em maiúsculas com tracking largo (ex.: "01 · Home"). Não usar em UI de produção real, é um recurso só de apresentação/documentação.

### Escala tipográfica (referência desktop, 1920px base / escalar proporcionalmente)
- H1 hero: 56–104px, peso 800, line-height 1.02–1.08, letter-spacing -0.02em.
- H2 seção: 60–76px, peso 700.
- H3 card/artigo: 20–44px, peso 700.
- Corpo de leitura (artigo): 20–26px, peso 400, line-height 1.72–1.75.
- Corpo de interface: 14–16px, peso 400–600.
- Metadado/legenda: 11–15px, peso 600–700, uppercase quando for label de categoria.
- Citação em destaque (blockquote): 24–27px, itálico, peso 500.
- Capitular (drop cap): primeira letra do artigo em Spectral Bold, ~4x o tamanho do corpo, float left.

### Regras de legibilidade (ergonomia de leitura)
- **Medida de linha**: 620–720px de largura de coluna de texto (~65–75 caracteres por linha) em qualquer breakpoint acima de mobile.
- **Line-height mínimo do corpo de leitura**: 1.7.
- Nunca usar texto abaixo de 14px na interface, nem abaixo de 17px no corpo de artigo em mobile.

---

## 5. Componentes de UI (especificação funcional)

### 5.1 Botões
- **Primário**: fundo terracota `#B65E38`, texto `#F7F1E7`, peso 700, border-radius 999px (pill), padding generoso (~14×28px desktop / mínimo 44px de altura em mobile).
- **Secundário**: transparente, borda 1.5px oliva `#47533F`, texto oliva, mesmo pill/padding.
- **Terciário/link**: apenas texto terracota com seta "→", sem fundo.
- Todos os botões: alvo de toque mínimo 44×44px em qualquer tela.

### 5.2 Badges/Tags de categoria
- Pill pequeno, fundo `#EDE1CD`, texto `#8A5A2E`, peso 700, uppercase, letter-spacing 0.06–0.1em. Categorias: Artigo, Crônica, Reflexão (expansível).

### 5.3 Cards de conteúdo (grade "últimos conteúdos")
- Fundo branco/#FFF, borda 1px `#EFE6D5`, radius 16–20px.
- Imagem no topo (proporção ~16:9 ou 3:2), depois padding interno 18–24px: badge categoria → título (Spectral 700, 2 linhas máx.) → resumo (Mulish, 2–3 linhas, cor neutra) → rodapé do card com "Ler mais →" (terracota) e contador de curtidas (♥ + número).

### 5.4 Artigo em destaque (hero de conteúdo)
- Layout dividido: imagem generosa (mín. 340px altura desktop) + bloco de texto — badge "novo/destaque", categoria+data+tempo de leitura, título grande, resumo, CTA primário + contador de curtidas.

### 5.5 Header/navegação
- Logo à esquerda, menu central (Início, Artigos, Crônicas, Loja, Sobre), busca + botão "Entrar" à direita (desktop).
- Sticky no scroll. Fundo `#FBF7EF` com borda inferior sutil `#EFE6D5`.
- **Mobile**: navegação inferior fixa (bottom tab bar) com 4 itens (Início, Artigos, Crônicas, Loja), ícone + label 10px, altura 64px, item ativo em terracota.

### 5.6 Página de leitura do artigo
Elementos obrigatórios, nesta ordem:
1. Barra de progresso de leitura fixa no topo (3–5px), preenchimento terracota conforme scroll.
2. Breadcrumb simples ("← Artigos / Categoria").
3. Badge de categoria + data.
4. Título (H1 grande, Spectral 800).
5. Bloco autor + metadados: avatar circular (iniciais sobre fundo oliva), nome, tempo de leitura; à direita: botão compartilhar + contador de curtidas.
6. **Player de áudio (TTS - ouvir o artigo)**: card com fundo `#F1E7D6`, botão play circular terracota, barra de progresso, contador de tempo (atual/total), seletor de velocidade (1×). Obrigatório em todo artigo — funcionalidade já existente no site atual, deve ser mantida e redesenhada.
7. Corpo do texto: capitular na primeira letra do primeiro parágrafo, parágrafos com medida de leitura controlada, citações em destaque (blockquote com borda esquerda terracota 3px, itálico).
8. Tags relacionadas (pills neutras).
9. Seção de comentários: lista com avatar + nome + tempo relativo + texto; campo de novo comentário com placeholder acolhedor ("Deixe um comentário gentil…") e botão "Enviar".

### 5.7 Prompt de instalação (PWA)
- Cartão flutuante sobre fundo oliva `#47533F`, símbolo em pêssego, texto "Instalar o app" + "Leia offline, na tela inicial", botão pill "Instalar" em pêssego `#E8C9B4` com texto tinta escura.
- Deve aparecer de forma não intrusiva (dispensável, reaparece após alguns dias se dispensado) — nunca bloquear conteúdo.

---

## 6. Responsividade e comportamento por dispositivo

### 6.1 Breakpoints
- **Mobile**: até 599px — coluna única, navegação inferior fixa, tipografia reduzida conforme escala (ver 4).
- **Tablet**: 600–1023px — grade de 2 colunas em listagens, header ainda completo ou simplificado.
- **Desktop**: 1024–1439px — grade de 3 colunas, header completo.
- **Desktop grande**: 1440px+ — mesma estrutura do desktop, com limite de largura de conteúdo (max-width ~1280–1320px centralizado) para não esticar demais linhas de texto.

### 6.2 Regras mobile-first obrigatórias
- Todo componente é desenhado primeiro para mobile (360–420px de largura útil) e depois adaptado para telas maiores — nunca o inverso.
- Alvos de toque ≥ 44×44px em qualquer botão, ícone clicável ou item de lista.
- Imagens: usar `srcset`/tamanhos responsivos; nunca carregar imagem desktop em conexão mobile.
- Grades de cards colapsam: 3 colunas (desktop) → 2 (tablet) → 1 (mobile).
- Header desktop (menu horizontal) vira bottom tab bar em mobile — não usar menu hambúrguer escondido como navegação primária do blog (a leitura deve ser sempre acessível em 1 toque).

### 6.3 PWA — requisitos técnicos obrigatórios
- **Web App Manifest** (`manifest.json`): name "O Irmãozinho", short_name "Irmãozinho", theme_color `#47533F`, background_color `#F7F1E7`, display `standalone`, ícones 192/512 (símbolo isolado sobre terracota ou oliva, ver 2.2).
- **Service Worker**: cache de shell da aplicação (HTML/CSS/JS/fontes) + estratégia stale-while-revalidate para artigos já visitados, permitindo **leitura offline** do que já foi acessado.
- **Instalabilidade**: prompt de instalação customizado (ver 5.7) acionado pelo evento `beforeinstallprompt`, com fallback textual em iOS (instruções "Adicionar à Tela de Início" via Safari, já que iOS não expõe o prompt nativo).
- **Splash screen**: fundo `#F7F1E7` com símbolo centralizado (versão empilhada), seguindo specs de splash do iOS/Android.
- **Performance**: o app deve carregar e ficar interativo mesmo em conexões 3G/instáveis — priorizar fontes com `font-display: swap`, lazy-load de imagens abaixo da dobra.
- **Status/navigation bar**: `theme-color` meta tag deve refletir a cor de fundo do header ativo (`#FBF7EF` claro ou `#47533F` em telas de imersão), para status bar do sistema combinar com o app.

### 6.4 Aplicativo nativo-like (wrapper, se aplicável no futuro)
- Caso o PWA seja empacotado como app nativo (TWA/Capacitor), a bottom tab bar (5.5) e os componentes acima devem ser reaproveitados sem alteração visual — o design system é único entre web, PWA e wrapper nativo.

---

## 7. Conteúdo e tom de voz (diretrizes de copy, para consistência visual)
- Categorias de conteúdo: **Artigo**, **Crônica**, **Reflexão** — cada uma com badge próprio mas mesma paleta (dourado como acento neutro entre elas).
- Chamada para ação preferencial de leitura: "Ler artigo completo →", "Ler o destaque →", "Ler mais →".
- Tom de comentário/formulário: acolhedor, nunca genérico ("Deixe um comentário gentil…").
- Emoji permitido apenas com moderação em contextos afetivos (🙏), nunca em UI funcional (botões, navegação, badges).

---

## 8. O que muda em relação ao site atual
- Substituição total da paleta azul (#4A90E2) + navy (#2C3E50) pela paleta terrosa (seção 3).
- Substituição de Poppins/Open Sans por Spectral (títulos/leitura) + Mulish (interface).
- Novo símbolo de marca (dois círculos) substituindo o logotipo atual.
- Redesenho de Home, página de artigo, header e navegação mobile conforme seções 5–6.
- Adição de manifest + service worker para tornar o site instalável como PWA (não existia antes).
- Funcionalidades existentes mantidas e redesenhadas na nova identidade: TTS (ouvir artigo), curtidas, comentários, loja.

---

## 9. Referências visuais aprovadas
- `O Irmaozinho Redesign.dc.html` — prancheta de identidade + telas Home/Artigo/Mobile.
- `Proposta Revitalizacao Deck.dc.html` — apresentação aprovada pela diretoria (11 slides).

Este documento deve ser atualizado sempre que uma nova decisão de design for aprovada, mantendo-se como a referência única do projeto.
