# Script para desbloquear arquivos do Rollup bloqueados pelo Windows
# Execute como Administrador!

Write-Host "Desbloqueando arquivos do Rollup..." -ForegroundColor Yellow

$rollupFile = "node_modules\@rollup\rollup-win32-x64-msvc\rollup.win32-x64-msvc.node"

if (Test-Path $rollupFile) {
    # Método 1: Unblock-File
    Write-Host "Tentativa 1: Usando Unblock-File..." -ForegroundColor Cyan
    try {
        Unblock-File -Path $rollupFile -ErrorAction Stop
        Write-Host "OK: Desbloqueado com Unblock-File" -ForegroundColor Green
    }
    catch {
        Write-Host "ERRO: Falhou - $_" -ForegroundColor Red
    }
    
    # Método 2: Remover Zone.Identifier stream
    Write-Host "Tentativa 2: Removendo Zone.Identifier..." -ForegroundColor Cyan
    try {
        $zoneId = "${rollupFile}:Zone.Identifier"
        if (Test-Path $zoneId) {
            Remove-Item -Path $zoneId -Force -ErrorAction Stop
            Write-Host "OK: Zone.Identifier removido" -ForegroundColor Green
        }
        else {
            Write-Host "  Zone.Identifier nao encontrado" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "ERRO: Falhou - $_" -ForegroundColor Red
    }
    
    # Método 3: Alterar atributos do arquivo
    Write-Host "Tentativa 3: Alterando atributos do arquivo..." -ForegroundColor Cyan
    try {
        $file = Get-Item $rollupFile -Force
        $file.Attributes = "Archive"
        Write-Host "OK: Atributos alterados" -ForegroundColor Green
    }
    catch {
        Write-Host "ERRO: Falhou - $_" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Tente executar novamente: npm run dev" -ForegroundColor Cyan
}
else {
    Write-Host "Arquivo nao encontrado. Execute 'npm install' primeiro." -ForegroundColor Red
}

Write-Host ""
pause
