# Script para levantar la página de ZimmZimmGames para testing
Write-Host "Iniciando servidor de desarrollo de ZimmZimmGames..." -ForegroundColor Green

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar si npm está disponible
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: npm no está disponible" -ForegroundColor Red
    exit 1
}

# Instalar dependencias si es necesario
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error al instalar dependencias" -ForegroundColor Red
        exit 1
    }
}

# Levantar el servidor de desarrollo
Write-Host "Levantando servidor de desarrollo en http://localhost:3000" -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
npm run dev
