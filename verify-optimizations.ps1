# Script de verificación rápida de optimizaciones (Windows)

Write-Host "🔍 Verificando Optimizaciones de Registro Rápido" -ForegroundColor Green
Write-Host ""
Write-Host "================================"

$backendPath = Join-Path (Get-Location) "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "Error: No se encuentra carpeta backend" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

Write-Host "1. Verificando archivos creados..." -ForegroundColor Blue
Write-Host ""

$files = @(
    "app/Jobs/SendEmailVerification.php",
    "database/migrations/2026_03_02_add_auth_indexes.php"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2. Verificando sintaxis PHP..." -ForegroundColor Blue
Write-Host ""

$phpFiles = @(
    "app/Jobs/SendEmailVerification.php",
    "app/Http/Controllers/API/AuthController.php",
    "database/migrations/2026_03_02_add_auth_indexes.php"
)

foreach ($phpFile in $phpFiles) {
    $output = php -l $phpFile 2>&1
    if ($output -match "syntax errors") {
        Write-Host "❌ Error en $phpFile" -ForegroundColor Red
    } else {
        Write-Host "✅ $phpFile" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "3. Verificando configuración .env..." -ForegroundColor Blue
Write-Host ""

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "QUEUE_CONNECTION=database") {
        Write-Host "✅ QUEUE_CONNECTION=database" -ForegroundColor Green
    } else {
        Write-Host "⚠️  QUEUE_CONNECTION no está configurado como database" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Verificando estado de migraciones..." -ForegroundColor Blue
Write-Host ""

$migrationStatus = php artisan migrate:status 2>&1
if ($migrationStatus -match "2026_03_02") {
    Write-Host "✅ Migración de índices lista" -ForegroundColor Green
} else {
    Write-Host "⚠️  Migración de índices no ejecutada (ejecuta: php artisan migrate)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================"
Write-Host "✨ Verificación completada" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ejecutar: php artisan migrate"
Write-Host "2. En otra terminal: php artisan queue:work database --queue=emails"
Write-Host "3. Probar registro en: http://localhost:8000/api/auth/register"
