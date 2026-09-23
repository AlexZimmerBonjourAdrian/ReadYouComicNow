# Script para instalar dependencias del proyecto
# ZimmZimm Games - Official Website

Write-Host "Instalando dependencias del proyecto..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js versión: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js no está instalado. Por favor instálalo primero." -ForegroundColor Red
    exit 1
}

# Verificar si npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "npm versión: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: npm no está instalado." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Ejecutando npm install..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar npm install
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Dependencias instaladas exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para iniciar el servidor de desarrollo, ejecuta:" -ForegroundColor Cyan
    Write-Host "  npm run dev" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}
