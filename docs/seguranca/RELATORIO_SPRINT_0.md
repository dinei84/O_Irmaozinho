# Relatório de Entrega — Sprint 0 (Segurança Emergencial)

**Data**: 13/07/2026
**Escopo**: Sprint 0 do [PLANO_REMEDIACAO.md](./PLANO_REMEDIACAO.md) — fechar as vulnerabilidades exploráveis por qualquer usuário com conta comum.
**Situação**: código concluído e verificado. **Aguarda deploy.**

---

## Resumo

As **4 vulnerabilidades críticas** da auditoria foram fechadas no código, junto com 2 de severidade alta/média. As correções estão cobertas por **35 testes automatizados novos**, dos quais 19 rodam contra o emulador do Firestore e provam, um a um, que os exploits agora falham.

| | Antes | Depois |
|---|---|---|
| Vulnerabilidades críticas abertas | 4 | **0** (1 mitigada, fechamento definitivo no Sprint 1 — ver V-02 abaixo) |
| Testes passando | 268 | **303** (284 na suíte + 19 de rules) |
| Testes das Security Rules | 0 | **19** |
| Falhas pré-existentes | 14 | 14 *(inalteradas — nenhuma regressão introduzida)* |

---

## O que foi executado

### ✅ R-02 · Escrita em pedidos de terceiros (V-03, crítica)
`firestore.rules` — removida a cláusula do `allow update` de `/orders` que liberava escrita a **qualquer usuário autenticado** sobre **qualquer pedido**. Ela existia por uma crença equivocada de que os webhooks precisavam dela; as Cloud Functions usam o Admin SDK, que ignora as Security Rules. Restou o correto: admin pode tudo, e o dono só pode cancelar o próprio pedido.

### ✅ R-03 · Valor do pagamento definido pelo cliente (V-01, crítica)
`functions/index.js` — a `createPaymentIntent` não aceita mais `amount` do cliente: lê `order.finalTotal` do Firestore e usa esse valor, rejeitando o pedido se o total for inválido. `src/services/paymentService.js` e os 5 pontos de chamada (`Checkout.jsx`, `CardPaymentForm.jsx`) deixaram de enviar valores.

### ✅ R-04 · XSS armazenado com escalada para admin (V-04, crítica)
Duas frentes, ambas necessárias:
- **Rules**: `allow create` em `content` voltou a exigir `isAdmin()` (estava marcado como "TEMPORÁRIO … para debug", permitindo a qualquer usuário publicar artigos).
- **Sanitização**: criado `src/lib/sanitize.js` (DOMPurify) como ponto único, e aplicado em **todos** os lugares que injetavam HTML do banco: `HighlightableText.jsx`, `stringUtils.js`, `TextToSpeechPlayer.jsx` e `ArticleEditor.jsx` (na carga, na colagem e na gravação).

> Um detalhe que merece registro: a `stripHtml` antiga fazia `div.innerHTML = html` para "extrair só o texto". Isso **executa** o `onerror` de um `<img>` no momento da atribuição, mesmo o retorno sendo texto puro. Era um vetor de XSS nas telas de listagem (Home, Artigos, Crônicas), não só na página do artigo.

### ✅ R-05 · Comentários: campos arbitrários e identidade forjada (V-08, alta)
- A edição passou a exigir `affectedKeys().hasOnly(['content', 'updatedAt'])`: antes, o dono podia reescrever `userName`, `articleId` ou `createdAt` do próprio comentário.
- A janela de edição de 1 hora, que estava desativada com um `true` literal, foi **reativada e corrigida** (ver seção seguinte).
- O `userName` deixou de ser aceito do cliente: agora precisa bater com o token (`name`, ou o prefixo do e-mail quando não houver `displayName`). Não é mais possível assinar um comentário como "Administrador".
- `AuthContext.signup` passou a gravar o `displayName` também no Auth (antes ia só para o Firestore), que é o que coloca o claim `name` no token.

### ✅ R-06 · Headers de segurança (V-09, média)
`firebase.json` — adicionados CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`. A CSP é a rede de proteção do R-04: limita o estrago de qualquer XSS que escape da sanitização.

### ✅ Antecipação parcial do R-16 · Testes das Security Rules
Criados `firestore.rules.test.js` (19 testes) e o script `npm run test:rules`, que sobe o emulador do Firestore e roda a suíte. Cada vulnerabilidade tem dois testes: **o ataque falha** e **o fluxo legítimo continua funcionando**. O segundo é tão importante quanto o primeiro — sem ele, a próxima "correção de segurança" quebra o produto sem ninguém perceber.

---

## O bug que os testes encontraram

Escrever os testes valeu a pena antes mesmo do deploy.

A janela de edição de comentários de 1 hora estava assim no código original, comentada com a observação *"DESATIVADO TEMPORARIAMENTE PARA DEBUG"*:

```
(request.time.seconds - resource.data.createdAt.seconds) <= 3900
```

Quando reativei a regra, o teste do fluxo legítimo (autor editando o próprio comentário) começou a falhar com `PERMISSION_DENIED`. O motivo: **em Firestore Rules, `timestamp.seconds()` é um método que devolve o segundo do minuto (0–59), não a época Unix.** Acessar `.seconds` como propriedade faz a expressão falhar, e a regra nega *toda* edição — inclusive a legítima.

Ou seja: a regra original nunca funcionou. Foi provavelmente por isso que o autor a desativou "temporariamente para debug" — o sintoma era que ninguém conseguia editar comentário —, e a desativação virou permanente. A correção usa `toMillis()`:

```
(request.time.toMillis() - resource.data.createdAt.toMillis()) <= 3900000
```

Sem teste automatizado, esse mesmo ciclo se repetiria: a regra iria para produção, quebraria a edição, e seria desativada de novo.

---

## Verificação executada

| Verificação | Resultado |
|---|---|
| `npm run test:rules` (emulador Firestore) | **19/19 passando** |
| Suíte principal (`npx vitest run`) | 284 passando · 14 falhas **pré-existentes**, idênticas à baseline |
| Regressão introduzida | **Nenhuma** (diff de falhas contra a baseline: vazio) |
| `npx vite build` | ✅ sem erros |
| Sintaxe das rules (emulador) | ✅ compila |

Os 19 testes de rules cobrem: escrita em pedido alheio, auto-aprovação de pagamento, redirecionamento de entrega, criação de artigo por usuário comum e por anônimo, edição de artigo por não-admin, forja de `userName`, edição de campos além do texto, edição fora da janela de 1 h, delete físico de comentário — e os fluxos legítimos correspondentes (dono cancela pedido, admin publica artigo, autor edita o próprio texto, visitante lê conteúdo).

### O que **não** foi verificado
- **Nada foi testado contra produção nem com pagamento real.** A verificação é automatizada, contra emulador.
- A **CSP não foi validada em navegação real**. Precisa ir a um preview channel antes da produção (ver abaixo) — uma diretiva mal calibrada quebra o carregamento do SDK do Mercado Pago.
- Os testes de rules cobrem V-03, V-04 e V-08. **V-02, V-11 e V-14 ainda não têm teste** — entram junto com as respectivas correções, no Sprint 1.

---

## Arquivos alterados

**Segurança (núcleo)**
- `firestore.rules` — orders, content e comments
- `functions/index.js` — valor do pagamento no servidor
- `firebase.json` — headers de segurança + porta do emulador
- `src/lib/sanitize.js` *(novo)* — ponto único de sanitização

**Aplicação**
- `src/services/paymentService.js`, `src/pages/Checkout.jsx`, `src/components/checkout/CardPaymentForm.jsx` — sem `amount`
- `src/contexts/AuthContext.jsx` — `displayName` no Auth
- `src/lib/stringUtils.js`, `src/components/features/textToSpeech/HighlightableText.jsx`, `.../TextToSpeechPlayer.jsx`, `src/pages/admin/ArticleEditor.jsx` — sanitização

**Testes**
- `firestore.rules.test.js` *(novo)* — 19 testes de rules
- `src/lib/__tests__/sanitize.test.js` *(novo)* — 16 testes de sanitização
- `vitest.rules.config.js` *(novo)*, `vitest.config.js`, `package.json` — script `test:rules`
- `src/services/__tests__/paymentService.test.js` — nova assinatura + regressão da V-01
- `src/contexts/__tests__/AuthContext.test.jsx`, `src/pages/__tests__/Checkout.integration.test.jsx`, `src/components/checkout/__tests__/CardPaymentForm.test.jsx`

**Dependências**: `dompurify`, `@firebase/rules-unit-testing` (dev, fixado em `^3.0.4` — a versão 5 exige Firebase 12, e a atualização do SDK é o passo R-19).

---

## ⚠️ O que ainda está aberto (leia antes de considerar a loja segura)

**A fraude de preço ainda é possível por outro caminho.** O R-03 fechou o `amount` na Cloud Function, mas o **pedido inteiro — itens, preços, subtotal e total — continua sendo montado no cliente**, a partir do carrinho que vive no `localStorage`, e as rules aceitam qualquer `finalTotal`. Como a function agora usa `order.finalTotal`, basta ao atacante adulterar o carrinho antes do checkout para criar um pedido de R$ 0,01 — e o pagamento sairá com esse valor.

Isso é a **V-02**, e o fechamento definitivo é o **R-08** (criar o pedido no servidor, com os preços buscados no banco), no Sprint 1. É o passo mais importante do plano inteiro.

> **Recomendação**: se a loja estiver aberta ao público, considere desativar o checkout até o R-08 estar em produção, ou aceite conscientemente o risco monitorando os valores dos pedidos. O Sprint 0 elimina o ataque trivial (chamar a function com outro valor), mas não o ataque de quem edita o `localStorage`.

---

## Próximos passos

### 1. Deploy do Sprint 0 (você)
As correções **ainda não estão em produção**. Antes do deploy:

```bash
# 1. Validar a CSP sem afetar o site ativo
npm run build
npx firebase hosting:channel:deploy csp-test
# → navegue por todas as telas com o console aberto; toda violação aparece
#   como "Refused to load…". Ajuste as diretivas em firebase.json se preciso.

# 2. Deploy
npx firebase deploy --only firestore:rules,functions,hosting
```

⚠️ **Ordem importa**: as rules podem ir a qualquer momento (só restringem). As Functions dependem do secret `MERCADOPAGO_ACCESS_TOKEN` — que **precisa ser recriado**, já que você excluiu a aplicação antiga do Mercado Pago (R-01). Sem esse secret, `createPaymentIntent` falha no deploy.

### 2. Pendências do R-01 (você, no painel)
- [ ] Criar a nova aplicação no Mercado Pago e rodar `firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN`
- [ ] Também `MERCADOPAGO_WEBHOOK_SECRET` (será usado no R-10)
- [ ] Ativar secret scanning + push protection no GitHub

### 3. Sprint 1 — a correção estrutural
Na ordem do [PLANO_REMEDIACAO.md](./PLANO_REMEDIACAO.md):

| Passo | O que é | Por que importa |
|---|---|---|
| **R-08** | **Criar o pedido no servidor** | **Fecha a V-02 — a fraude de preço que continua aberta.** É o passo mais importante do plano. |
| R-10 | Assinatura do webhook + idempotência | O webhook é um endpoint público que aceita qualquer POST |
| R-13 | Verificação de e-mail | Não existe hoje; é pré-requisito do consentimento LGPD da newsletter |
| R-12 | App Check | Bloqueia chamadas fora do app — o vetor de todos os exploits desta auditoria |
| R-14, R-15, R-09, R-11 | Fornecedores, contadores, idempotency key, expiração de pedidos | Severidade média/baixa |

**Sugestão de sequência**: comece pelo **R-08**. Ele é o único que ainda separa a loja de estar de fato protegida contra fraude de preço, e habilita o R-11 (expiração de pedidos com devolução de estoque).
