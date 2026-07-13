# Script para resolver problemas de arquivos bloqueados no Windows
# Execute este script como Administrador

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Fix: Arquivos Bloqueados no Windows  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está executando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERRO: Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Como executar:" -ForegroundColor Yellow
    Write-Host "1. Clique com botão direito no PowerShell" -ForegroundColor Yellow
    Write-Host "2. Selecione 'Executar como administrador'" -ForegroundColor Yellow
    Write-Host "3. Navegue até a pasta do projeto" -ForegroundColor Yellow
    Write-Host "4. Execute: .\fix-windows-block.ps1" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✓ Executando como Administrador" -ForegroundColor Green
Write-Host ""

# Obter caminho atual
$projectPath = Get-Location
Write-Host "Pasta do projeto: $projectPath" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Desbloquear todos os arquivos
Write-Host "[1/4] Desbloqueando arquivos..." -ForegroundColor Yellow
try {
    Get-ChildItem -Path $projectPath -Recurse -File -ErrorAction SilentlyContinue | 
        Unblock-File -ErrorAction SilentlyContinue
    Write-Host "✓ Arquivos desbloqueados" -ForegroundColor Green
} catch {
    Write-Host "⚠ Aviso: Alguns arquivos podem não ter sido desbloqueados" -ForegroundColor Yellow
}
Write-Host ""

# Passo 2: Remover node_modules e package-lock.json
Write-Host "[2/4] Limpando node_modules e package-lock.json..." -ForegroundColor Yellow
try {
    if (Test-Path "node_modules") {
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction Stop
        Write-Host "✓ node_modules removido" -ForegroundColor Green
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Path "package-lock.json" -Force -ErrorAction Stop
        Write-Host "✓ package-lock.json removido" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Erro ao remover arquivos (pode ser normal se já foram removidos)" -ForegroundColor Yellow
}
Write-Host ""

# Passo 3: Limpar cache do npm
Write-Host "[3/4] Limpando cache do npm..." -ForegroundColor Yellow
try {
    npm cache clean --force 2>&1 | Out-Null
    Write-Host "✓ Cache limpo" -ForegroundColor Green
} catch {
    Write-Host "⚠ Erro ao limpar cache (continuando...)" -ForegroundColor Yellow
}
Write-Host ""

# Passo 4: Reinstalar dependências
Write-Host "[4/4] Reinstalando dependências (isso pode levar alguns minutos)..." -ForegroundColor Yellow
Write-Host ""
try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host "  ✓ Instalação concluída com sucesso!  " -ForegroundColor Green
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Agora você pode executar:" -ForegroundColor Cyan
        Write-Host "  npm run dev    - Iniciar servidor de desenvolvimento" -ForegroundColor White
        Write-Host "  npm test       - Executar testes" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "⚠ A instalação teve alguns erros" -ForegroundColor Yellow
        Write-Host "Tente executar manualmente: npm install" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "✗ Erro durante a instalação" -ForegroundColor Red
    Write-Host "Erro: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tente executar manualmente: npm install" -ForegroundColor Yellow
}

Write-Host ""
pause
