# Script de Build e Deploy - CORRECRAT
# Com correções GPS implementadas
# Versão PowerShell para Windows

Write-Host "🚀 Iniciando build do CORRECRAT com correções GPS..." -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script no diretório correcrat/app" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependências instaladas" -ForegroundColor Green
Write-Host ""

Write-Host "🔨 Buildando aplicação..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído" -ForegroundColor Green
Write-Host ""

Write-Host "📱 Sincronizando com Capacitor..." -ForegroundColor Yellow
npx cap sync android

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao sincronizar com Capacitor" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Sincronização concluída" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Abrindo Android Studio..." -ForegroundColor Yellow
npx cap open android

Write-Host ""
Write-Host "✅ Build completo!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. No Android Studio, clique em 'Run' ou pressione Shift+F10"
Write-Host "2. Selecione seu dispositivo físico (não use emulador para GPS)"
Write-Host "3. Aguarde a instalação"
Write-Host "4. Teste em um percurso conhecido"
Write-Host "5. Compare com Strava"
Write-Host ""
Write-Host "📊 Melhorias implementadas:" -ForegroundColor Cyan
Write-Host "  ✓ Filtro de movimento: 3m → 1m" -ForegroundColor Green
Write-Host "  ✓ Precisão GPS: 40m → 50m" -ForegroundColor Green
Write-Host "  ✓ Interpolação em gaps de sinal" -ForegroundColor Green
Write-Host "  ✓ Timeout GPS: 10s → 5s" -ForegroundColor Green
Write-Host "  ✓ Permissões otimizadas" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Veja GPS_FIXES.md para detalhes completos" -ForegroundColor Yellow
Write-Host "🧪 Veja GPS_TEST_GUIDE.md para guia de testes" -ForegroundColor Yellow
