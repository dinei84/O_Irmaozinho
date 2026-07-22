# OS_REDESIGN_003 — Header/navegação + bottom tab bar mobile

**Status:** 🔲 Não iniciada
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Depende de:** OS_REDESIGN_002 (símbolo da marca)

## Escopo (`PROJECT_SPEC.md` §5.5)

- Redesenhar `src/components/layout/Header.jsx`: sticky no scroll, fundo `#FBF7EF`,
  borda inferior sutil (`borda`), logo já atualizado na OS_REDESIGN_002.
- Criar `src/components/layout/BottomTabBar.jsx` (**componente novo — não existe hoje**):
  navegação inferior fixa em mobile, 4 itens (Início, Artigos, Crônicas, Loja), ícone +
  label 10px, altura 64px, item ativo em terracota.
- Header desktop (menu horizontal) permanece; em mobile, a navegação primária passa a
  ser a tab bar — não usar menu hambúrguer escondido como navegação primária do blog
  (regra explícita do spec §6.2: leitura sempre acessível em 1 toque).

## Definition of Done

- [ ] Navegação funcional em desktop (menu horizontal) e mobile (tab bar)
- [ ] Sem regressão nos testes existentes de navegação/rotas (se houver)
- [ ] `npx vitest run` sem novas falhas
- [ ] Verificação manual em navegador real, em viewport mobile e desktop

## Arquivos a alterar

- `src/components/layout/Header.jsx`
- `src/components/layout/BottomTabBar.jsx` (novo)
- `src/App.jsx` (se a tab bar precisar ser montada no layout raiz)
