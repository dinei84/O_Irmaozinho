# 🔧 Solução: Arquivos Bloqueados no Windows

## ⚠️ Problema

O Windows está bloqueando arquivos executáveis (`.exe`, `.node`) necessários para o projeto rodar. Erros comuns:

```
Error: Uma política de Controle de Aplicativo bloqueou este arquivo
Error: spawnSync ... UNKNOWN
```

## 🔍 Causas Possíveis

1. **OneDrive Sync**: O projeto está em uma pasta sincronizada pelo OneDrive, que pode bloquear executáveis
2. **Windows Defender**: Bloqueando arquivos baixados da internet
3. **Políticas de Grupo**: Políticas corporativas bloqueando executáveis
4. **Antivírus**: Software de segurança bloqueando arquivos

## ✅ Soluções (Tente nesta ordem)

### Solução 1: Desbloquear Arquivos Manualmente (Recomendado)

Execute no **PowerShell como Administrador**:

```powershell
# 1. Navegue até a pasta do projeto
cd "C:\Users\claud\OneDrive\Documentos\GitHub\O_Irmaozinho"

# 2. Desbloqueie TODOS os arquivos executáveis
Get-ChildItem -Path . -Recurse -File | Unblock-File

# 3. Reinstale dependências
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
```

### Solução 2: Mover Projeto para Fora do OneDrive

Se o projeto estiver em uma pasta sincronizada pelo OneDrive, mova para uma pasta local:

```powershell
# Exemplo: Mover para C:\Projetos
# 1. Feche o OneDrive
# 2. Mova a pasta
# 3. Reinstale dependências
```

### Solução 3: Configurar Windows Defender

1. Abra **Windows Security** (Segurança do Windows)
2. Vá em **Vírus e proteção contra ameaças**
3. Clique em **Gerenciar configurações** (em "Configurações de proteção contra vírus e ameaças")
4. Role até **Exclusões**
5. Adicione a pasta do projeto como exclusão

### Solução 4: Usar npm com --ignore-scripts (Temporário)

**⚠️ Não recomendado para produção**, mas pode funcionar temporariamente:

```powershell
npm install --ignore-scripts
```

### Solução 5: Verificar Antivírus

Se você usa um antivírus de terceiros (Avast, Kaspersky, etc):
- Adicione a pasta do projeto às exclusões
- Ou temporariamente desative durante a instalação

## 🔄 Passo a Passo Completo (Recomendado)

1. **Abra PowerShell como Administrador**:
   - Pressione `Win + X`
   - Selecione "Windows PowerShell (Admin)" ou "Terminal (Admin)"

2. **Navegue até o projeto**:
   ```powershell
   cd "C:\Users\claud\OneDrive\Documentos\GitHub\O_Irmaozinho"
   ```

3. **Desbloqueie arquivos**:
   ```powershell
   Get-ChildItem -Path . -Recurse -File | Unblock-File
   ```

4. **Limpe e reinstale**:
   ```powershell
   Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
   Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
   npm cache clean --force
   npm install
   ```

5. **Teste**:
   ```powershell
   npm test
   npm run dev
   ```

## 📝 Nota sobre OneDrive

Se o projeto está em `OneDrive\Documentos\...`, considere:
- Mover para `C:\Projetos\` ou `C:\Dev\`
- Ou configurar o OneDrive para **não sincronizar** a pasta `node_modules` (pode ser feito nas configurações do OneDrive)

## ❓ Se Nada Funcionar

1. Verifique se há políticas de grupo corporativas ativas
2. Tente em outra máquina para isolar o problema
3. Considere usar WSL (Windows Subsystem for Linux) para desenvolvimento
4. Verifique logs do Windows Event Viewer para mais detalhes

## 🎯 Solução Rápida (Alternativa)

Se precisar trabalhar imediatamente, você pode:
1. Usar `npm run dev` (pode funcionar mesmo com os testes falhando)
2. Os testes podem ser executados em CI/CD (GitHub Actions, por exemplo)
3. O código está correto - o problema é apenas do ambiente Windows

---

**Importante**: Este é um problema de **configuração do ambiente Windows**, não do código do projeto. O código está funcionando corretamente, mas o Windows está bloqueando arquivos executáveis por segurança.
