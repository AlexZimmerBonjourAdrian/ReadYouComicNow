<#
.SYNOPSIS
  Herramienta cómoda para ejecutar y probar ReadYouComicNow.
.DESCRIPTION
  1. Verifica node/npm. 2. Instala dependencias si faltan.
  3. Genera un cómic de prueba (test-data/demo.cbz) si no existe.
  4. Elige un puerto libre y arranca Next.js. 5. Abre el navegador solo.
.PARAMETER Port
  Puerto preferido (por defecto 3000; si está ocupado usa el siguiente libre).
.PARAMETER SamplePages
  Páginas del cómic de prueba (por defecto 6).
.PARAMETER Build
  Usa build de producción + start en vez del servidor dev.
.PARAMETER OnlySample
  Solo genera el cómic de prueba y sale (no arranca servidor).
.PARAMETER NoBrowser
  No abre el navegador automáticamente.
.EXAMPLE
  .\LeerComic.ps1
.EXAMPLE
  .\LeerComic.ps1 -Build -Port 4000
.EXAMPLE
  .\LeerComic.ps1 -OnlySample -SamplePages 10
#>
param(
  [int]$Port = 3000,
  [int]$SamplePages = 6,
  [switch]$Build,
  [switch]$OnlySample,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

$SampleComic = Join-Path (Get-Location) 'test-data\demo.cbz'

function Test-Command($Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-FreePort {
  param([int]$Preferred)
  for ($p = $Preferred; $p -lt ($Preferred + 50); $p++) {
    $listener = $null
    try {
      $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $p)
      $listener.Start()
      return $p
    } catch {
      continue
    } finally {
      if ($listener) { $listener.Stop() }
    }
  }
  throw "No hay puertos libres desde $Preferred."
}

function New-TestComic {
  param([string]$OutFile, [int]$Pages)
  if (Test-Path $OutFile) {
    Write-Host "Cómic de prueba ya existe: $OutFile" -ForegroundColor DarkGray
    return
  }
  Write-Host "Generando cómic de prueba ($Pages páginas)..." -ForegroundColor Yellow
  $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ('comicdemo-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $tmp | Out-Null
  try {
    Add-Type -AssemblyName System.Drawing
    $font = New-Object System.Drawing.Font([System.Drawing.FontFamily]::GenericSansSerif, 72, [System.Drawing.FontStyle]::Bold)
    $small = New-Object System.Drawing.Font([System.Drawing.FontFamily]::GenericSansSerif, 28)
    $brush = [System.Drawing.Brushes]::White
    $gray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(156, 163, 175))
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(192, 57, 43), 8)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    for ($i = 1; $i -le $Pages; $i++) {
      $bmp = New-Object System.Drawing.Bitmap(800, 1200)
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      $g.Clear([System.Drawing.Color]::FromArgb(26, 26, 26))
      $g.DrawRectangle($pen, 30, 30, 740, 1140)
      $g.DrawString("PAGINA $i", $font, $brush, 400, 500, $fmt)
      $g.DrawString('ReadYouComicNow - demo', $small, $gray, 400, 640, $fmt)
      $g.DrawString("$i / $Pages", $small, $gray, 400, 700, $fmt)
      $bmp.Save((Join-Path $tmp ('page-{0:D3}.png' -f $i)), [System.Drawing.Imaging.ImageFormat]::Png)
      $g.Dispose()
      $bmp.Dispose()
    }
    $pen.Dispose()
    $outDir = Split-Path $OutFile -Parent
    if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
    Compress-Archive -Path (Join-Path $tmp '*.png') -DestinationPath ($OutFile + '.zip') -Force
    Move-Item -Force -Path ($OutFile + '.zip') -Destination $OutFile
    Write-Host "Listo: $OutFile" -ForegroundColor Green
  } finally {
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
  }
}

# 1. Requisitos
if (-not (Test-Command 'node')) { Write-Host 'Error: Node.js no está instalado o no está en el PATH.' -ForegroundColor Red; exit 1 }
if (-not (Test-Command 'npm')) { Write-Host 'Error: npm no está disponible.' -ForegroundColor Red; exit 1 }
Write-Host "Node: $(node --version) | npm: $(npm --version)" -ForegroundColor Cyan

# 2. Dependencias
if (-not (Test-Path 'node_modules')) {
  Write-Host 'Instalando dependencias (solo la primera vez)...' -ForegroundColor Yellow
  npm install
  if ($LASTEXITCODE -ne 0) { Write-Host 'Error al instalar dependencias.' -ForegroundColor Red; exit 1 }
}

# 3. Cómic de prueba
try {
  New-TestComic -OutFile $SampleComic -Pages $SamplePages
} catch {
  Write-Host "Aviso: no se pudo generar el demo ($($_.Exception.Message)). Usa tu propio .cbz/.pdf." -ForegroundColor Yellow
}
if ($OnlySample) { exit 0 }

# 4. Puerto libre
$port = Get-FreePort -Preferred $Port
$url = "http://localhost:$port"
Write-Host ''
Write-Host '  COMO PROBARLO (2 min):' -ForegroundColor Cyan
Write-Host "  1. En la pagina, carga test-data\demo.cbz" -ForegroundColor White
Write-Host '  2. Cambia Simple / Doble / Scroll y activa modo Manga' -ForegroundColor White
Write-Host '  3. Recarga el navegador: el cómic persiste (IndexedDB local)' -ForegroundColor White
Write-Host '  4. Prueba Limpiar y cargar tu propio .cbz/.pdf' -ForegroundColor White
Write-Host ''

# 5. Navegador cuando el servidor responda
$browserJob = $null
if (-not $NoBrowser) {
  $browserJob = Start-Job -ScriptBlock {
    param($u, $p)
    for ($i = 0; $i -lt 60; $i++) {
      try {
        $c = New-Object System.Net.Sockets.TcpClient
        $iar = $c.BeginConnect('localhost', $p, $null, $null)
        if ($iar.AsyncWaitHandle.WaitOne(500) -and $c.Connected) { $c.Close(); break }
        $c.Close()
      } catch { }
      Start-Sleep -Milliseconds 500
    }
    Start-Process $u
  } -ArgumentList @($url, $port)
}

# 6. Servidor (primer plano: Ctrl+C lo detiene)
try {
  if ($Build) {
    Write-Host "Build de producción en $url ..." -ForegroundColor Green
    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'Falló npm run build.' }
    npm run start -- --port $port
  } else {
    Write-Host "Servidor dev en $url  (Ctrl+C para detener)" -ForegroundColor Green
    npm run dev -- --port $port
  }
} finally {
  if ($browserJob) { Remove-Job -Force $browserJob -ErrorAction SilentlyContinue }
}
