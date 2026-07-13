# Documentação — O Irmãozinho

Índice da documentação técnica. A raiz do repositório guarda os três documentos de mais alto nível; tudo o mais está organizado aqui por finalidade.

## Documentos de referência (raiz do projeto)

| Documento | O que é |
|---|---|
| [`README.md`](../README.md) | Visão geral do projeto e primeiros passos |
| [`PROJECT_SPEC.md`](../PROJECT_SPEC.md) | **Fonte única de verdade do design** — identidade, paleta, tipografia, componentes, PWA. Aprovado pela diretoria. |
| [`PLANO_DE_ACAO.md`](../PLANO_DE_ACAO.md) | **Plano de profissionalização em 6 fases** — segurança, LGPD, e-commerce, redesign, qualidade |

---

## 🔒 [`seguranca/`](./seguranca/)

| Documento | O que é |
|---|---|
| [AUDITORIA_SEGURANCA.md](./seguranca/AUDITORIA_SEGURANCA.md) | **O diagnóstico.** 14 vulnerabilidades (4 críticas), com prova de conceito, impacto e correção. Leia antes de mexer em pagamento, rules ou renderização de conteúdo. |
| [PLANO_REMEDIACAO.md](./seguranca/PLANO_REMEDIACAO.md) | **O passo a passo.** 19 passos em 3 sprints, cada um com código, verificação e deploy. É o documento de trabalho do dia a dia. |
| [RELATORIO_SPRINT_0.md](./seguranca/RELATORIO_SPRINT_0.md) | **O que já foi entregue.** Sprint 0 concluído em 13/07/2026: as 4 críticas fechadas no código, 35 testes novos. Aguarda deploy. |

> ⚠️ **Sprint 0 concluído no código, aguardando deploy.** Atenção: a fraude de preço (V-02) **continua possível** via adulteração do carrinho no `localStorage` até o passo **R-08** (criar o pedido no servidor) estar em produção.

## ⚙️ [`setup/`](./setup/) — configurar o ambiente

| Documento | O que é |
|---|---|
| [SETUP.md](./setup/SETUP.md) | Guia de setup completo (Firebase, variáveis de ambiente, primeiro deploy) |
| [PROJETO_FIREBASE_CONFIGURACAO.md](./setup/PROJETO_FIREBASE_CONFIGURACAO.md) | Qual projeto Firebase usar e por quê |
| [COMO_TORNAR_ADMIN.md](./setup/COMO_TORNAR_ADMIN.md) | Conceder o custom claim `role: admin` a um usuário |
| [CONFIGURAR_MERCADOPAGO_METODOS_PAGAMENTO.md](./setup/CONFIGURAR_MERCADOPAGO_METODOS_PAGAMENTO.md) | Habilitar PIX, boleto e cartão no Mercado Pago |
| [GUIA_MIGRACAO_CONTA_MERCADOPAGO.md](./setup/GUIA_MIGRACAO_CONTA_MERCADOPAGO.md) | Migrar de conta pessoal para conta empresa |
| [PAYMENT_SETUP_GUIDE.md](./setup/PAYMENT_SETUP_GUIDE.md) | Configuração do sistema de pagamento |
| [VERCEL_DEPLOY.md](./setup/VERCEL_DEPLOY.md) | Variáveis de ambiente no deploy da Vercel |

## 🏗️ [`arquitetura/`](./arquitetura/) — decisões e análises técnicas

**Pagamentos e loja**
- [ECOMMERCE_ROADMAP.md](./arquitetura/ECOMMERCE_ROADMAP.md) — panorama do que existe e do que falta na loja
- [PAYMENT_API_PLAN.md](./arquitetura/PAYMENT_API_PLAN.md) — desenho da API de pagamento
- [PAYMENT_SYSTEM_COMPLETION_ANALYSIS.md](./arquitetura/PAYMENT_SYSTEM_COMPLETION_ANALYSIS.md) — análise de conclusão do sistema
- [MODULARIZACAO_PAGAMENTO_PLAN.md](./arquitetura/MODULARIZACAO_PAGAMENTO_PLAN.md) — arquitetura de gateways plugáveis (`BaseGateway`/`GatewayFactory`)
- [ESTUDO_CASO_BOLETO_CARTAO.md](./arquitetura/ESTUDO_CASO_BOLETO_CARTAO.md) — estudo de caso de boleto e cartão

**Marketplace e fornecedores**
- [MARKETPLACE_PAYMENT_ANALYSIS.md](./arquitetura/MARKETPLACE_PAYMENT_ANALYSIS.md) — modelos de repasse multi-fornecedor
- [MARKETPLACE_PHASE1_PLAN.md](./arquitetura/MARKETPLACE_PHASE1_PLAN.md) — MVP de fornecedores
- [SUPPLIERS_SYSTEM_ANALYSIS.md](./arquitetura/SUPPLIERS_SYSTEM_ANALYSIS.md) — sistema de fornecedores

**Blog e engajamento**
- [COMMENTS_LIKES_AND_RECOMMENDATIONS_ANALYSIS.md](./arquitetura/COMMENTS_LIKES_AND_RECOMMENDATIONS_ANALYSIS.md) — comentários, curtidas e recomendação
- [COMMENTS_LIKES_DATA_STRUCTURE.md](./arquitetura/COMMENTS_LIKES_DATA_STRUCTURE.md) — modelagem no Firestore
- [TEXT_TO_SPEECH_ANALYSIS.md](./arquitetura/TEXT_TO_SPEECH_ANALYSIS.md) — sistema de leitura em áudio (TTS)

**Usuários**
- [PROFESSIONAL_ROLES_GUIDE.md](./arquitetura/PROFESSIONAL_ROLES_GUIDE.md) — sistema de roles e permissões

## 🧪 [`guias/`](./guias/) — testar e operar

| Documento | O que é |
|---|---|
| [TESTING_GUIDE.md](./guias/TESTING_GUIDE.md) | Guia geral de testes |
| [QUICK_TEST.md](./guias/QUICK_TEST.md) | Checklist rápido de sanidade (5 min) |
| [TESTE_CHECKOUT_GUIA.md](./guias/TESTE_CHECKOUT_GUIA.md) | Teste manual do checkout |
| [PAYMENT_TESTING_GUIDE.md](./guias/PAYMENT_TESTING_GUIDE.md) | Testes do pagamento PIX |
| [TESTES_PAGAMENTO.md](./guias/TESTES_PAGAMENTO.md) | Testes automatizados de PIX, boleto e cartão |
| [TROUBLESHOOTING.md](./guias/TROUBLESHOOTING.md) | Problemas comuns e soluções |

## 📜 [`historico/`](./historico/) — registro de implementações concluídas

Não são guias; são o registro do que foi feito e quando. Úteis como contexto, não como instruções.

- [COMMENTS_SYSTEM_IMPLEMENTATION.md](./historico/COMMENTS_SYSTEM_IMPLEMENTATION.md)
- [LIKES_SYSTEM_IMPLEMENTATION.md](./historico/LIKES_SYSTEM_IMPLEMENTATION.md)
- [SUPPLIERS_IMPLEMENTATION_SUMMARY.md](./historico/SUPPLIERS_IMPLEMENTATION_SUMMARY.md)
- [REVISAO_IMPLEMENTACAO_BOLETO_CARTAO.md](./historico/REVISAO_IMPLEMENTACAO_BOLETO_CARTAO.md)

---

## 🗑️ [`../garbage/`](../garbage/)

Documentos separados para exclusão: obsoletos, duplicados, sobre problemas de ambiente já resolvidos, ou que **afirmam coisas falsas sobre o código**. Nada foi apagado — veja [`garbage/README.md`](../garbage/README.md) para o motivo de cada um.

## Convenções

- Documento novo nasce numa destas pastas. Se não couber em nenhuma, provavelmente não deveria existir.
- Documento de troubleshooting de um bug pontual **não é documentação** — a correção vai no código e, se necessário, num `CHANGELOG`.
- Se um documento passar a contradizer o código, corrija-o ou mande-o para `garbage/`. Nunca deixe os dois convivendo — foi assim que seis documentos passaram a descrever uma verificação de e-mail que nunca existiu.
- Segredos (tokens, chaves, secrets) **nunca** entram em documentação. Use placeholders.
