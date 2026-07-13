# garbage/ — candidatos a exclusão

Esta pasta é uma **antessala da lixeira**. Nada aqui foi excluído: os arquivos foram movidos com `git mv`, então o histórico está preservado e qualquer um pode ser restaurado com `git mv garbage/<pasta>/<arquivo> docs/<destino>/`.

Motivo de existir: a documentação do projeto tinha 54 arquivos, muitos deles descrevendo problemas já resolvidos, recursos que não existem no código ou status desatualizados. Documentação errada é pior que documentação nenhuma — ela é lida como verdade. Os arquivos abaixo foram separados por esse critério.

**Sugestão**: revise, e quando estiver confortável, apague a pasta inteira (`git rm -r garbage/`). O conteúdo continua recuperável pelo histórico do git.

---

## 🔴 `credenciais-vazadas/` — apagar depois de rotacionar as credenciais

| Arquivo | Motivo |
|---|---|
| `CONFIGURAR_MERCADOPAGO_CLI.md` | **Contém o Client Secret e o Client ID do Mercado Pago em texto puro.** Ver V-06 da auditoria. |
| `CONFIGURAR_MERCADOPAGO_PASSO_A_PASSO.md` | Guia redundante com `docs/setup/CONFIGURAR_MERCADOPAGO_METODOS_PAGAMENTO.md` (que é mais completo e não tem segredos). |

> ⚠️ **Mover o arquivo não remove o segredo do histórico do git.** O Client Secret continua recuperável em commits antigos, e o repositório é público. A ação que resolve é **rotacionar as credenciais no painel do Mercado Pago**. Ver V-06 em `docs/seguranca/AUDITORIA_SEGURANCA.md`.

## 🟠 `status-desatualizado/` — documentos que afirmam coisas falsas

| Arquivo | Motivo |
|---|---|
| `ANALISE_SEGURANCA_PAGAMENTO.md` | Afirma **"Status Geral: SEGURO"**. A auditoria de 13/07/2026 encontrou 4 vulnerabilidades críticas no fluxo de pagamento. É o documento mais perigoso do repositório: dá confiança falsa. Substituído por `docs/seguranca/AUDITORIA_SEGURANCA.md`. |
| `TESTES_SEGURANCA_GUIA.md` | Testes de segurança superficiais ("o token está no frontend?"). Passa em todos e não detecta nenhuma das vulnerabilidades reais. Será substituído por testes automatizados das Security Rules. |
| `BACKEND_CHECKLIST.md` | Afirma "backend 95% completo". Desatualizado. |
| `TESTING_STATUS.md` | Snapshot de status de testes de uma data específica. |
| `TEST_FAILURES_ANALYSIS.md` | Análise de 12 testes que falhavam num momento passado. |
| `test_output.txt` | Saída bruta de uma execução de testes, commitada por engano. |

## 🟠 `email-troubleshooting/` — documentam um recurso que não existe

Seis documentos sobre verificação de e-mail. O `EMAIL_VERIFICATION.md` afirma que *"o sistema de verificação de email foi implementado"* — **é falso**: não há nenhuma chamada a `sendEmailVerification` em todo o `src/` (ver V-07 da auditoria). Os outros cinco são tentativas de depurar por que o e-mail "não chega" — ele não chega porque nunca é enviado.

`EMAIL_DEBUG.md`, `EMAIL_NOT_ARRIVING.md`, `EMAIL_QUICK_FIX.md`, `EMAIL_TROUBLESHOOTING.md`, `QUICK_EMAIL_SETUP.md`, `EMAIL_VERIFICATION.md`

Quando a verificação de e-mail for de fato implementada (Fase 1 do plano), escreva **um** documento novo.

## 🟡 `windows-ambiente/` — problema de máquina, não do projeto

Oito arquivos sobre o Windows bloqueando executáveis do `node_modules`. O desenvolvimento agora é em Linux e o problema não se aplica. Nada disso descreve a aplicação.

`WINDOWS_BLOCKED_FILES_FIX.md`, `INSTRUCOES_DESBLOQUEIO.md`, `RESUMO_PROBLEMA_WINDOWS.md`, `SOLUCAO_ALTERNATIVA.md`, `INSTRUCOES_RAPIDAS.md`, `SOLUCAO_PERMISSION_DENIED.md`, `fix-windows-block.ps1`, `desbloquear-arquivos.ps1`

> Relacionado: o `package.json` tem `@rollup/rollup-win32-x64-msvc` em `optionalDependencies`, resíduo desse mesmo problema. Pode ser removido.

## 🟡 `fixes-pontuais/` — bugs já corrigidos no código

Documentos de "como corrigi este bug", escritos durante a correção. O código já contém a correção; o documento só descreve um estado passado.

| Arquivo | Situação |
|---|---|
| `PIX_PAYMENT_FIX.md` | A correção está no código (`MercadoPagoGateway.formatPaymentResponse` força `pending` para PIX/boleto). |
| `CORS_ERROR_FIX.md` | Erro de CORS pontual em desenvolvimento. |
| `MERCADOPAGO_TOKEN_ERROR_FIX.md` | Erro de credencial de teste vs. produção. |
| `FIREBASE_BLAZE_PLAN_UPGRADE.md` | O upgrade para o plano Blaze já foi feito. |

## 🟡 `meta-reorganizacao/` — documentação sobre documentação

`REORGANIZATION_PLAN.md` (havia duas cópias idênticas, na raiz e em `docs/`) e `REORGANIZATION_COMPLETE.md`. Descrevem uma reorganização de pastas anterior, já executada — e agora substituída por esta.

---

## Fora do garbage, mas candidatos a limpeza

Coisas que **não** movi porque não são documentação, mas que valem atenção:

- **`dist/` está versionado no git.** É saída de build (regenerável com `npm run build`) e não deveria estar no repositório. Correção: `git rm -r --cached dist` (o `.gitignore` já tem a entrada, mas os arquivos foram commitados antes dela).
- **`Proposta_Revitalizacao_OIrmaozinho.pdf`** (1 MB, na raiz): mantido, é o material aprovado pela diretoria que originou o `PROJECT_SPEC.md`. Considere movê-lo para `docs/` ou para um drive.
- **`src/hooks/README.md`**: lista "hooks planejados" que nunca foram criados. Inofensivo, mas vazio de conteúdo.
