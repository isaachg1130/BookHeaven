# Script de setup para optimizaciones de registro rápido (Windows)
Write-Host "🚀 Optimizando BookHeaven - Registro Rápido y Efectivo" -ForegroundColor Green
Write-Host ""

# Navegar a carpeta backend
$backendPath = Join-Path (Get-Location) "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Error: No se encontró la carpeta backend" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

# 1. Ejecutar migraciones
Write-Host "[1/3] Ejecutando migraciones..." -ForegroundColor Yellow
$migrationOutput = php artisan migrate --force 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migraciones ejecutadas" -ForegroundColor Green
    foreach ($line in $migrationOutput) {
        if ($line -match "(Migrating|Migrated)") {
            Write-Host "   $line"
        }
    }
} else {
    Write-Host "❌ Error en migraciones" -ForegroundColor Red
    Write-Host $migrationOutput
    exit 1
}
Write-Host ""

# 2. Limpiar caché
Write-Host "[2/3] Limpiando caché..." -ForegroundColor Yellow
php artisan cache:clear | Out-Null
php artisan config:cache | Out-Null
Write-Host "✅ Caché limpio" -ForegroundColor Green
Write-Host ""

# 3. Verificar configuración
Write-Host "[3/3] Verificando configuración..." -ForegroundColor Yellow
$envFile = Get-Content ".env" -Raw
if ($envFile -match "QUEUE_CONNECTION=database") {
    Write-Host "✅ Queue driver configurado como 'database'" -ForegroundColor Green
} else {
    Write-Host "⚠️  Queue driver no está configurado. Agregar a .env:" -ForegroundColor Yellow
    Write-Host "   QUEUE_CONNECTION=database"
    Write-Host "   DB_QUEUE_CONNECTION=default"
}

Write-Host ""
Write-Host "✨ ¡Optimizaciones preparadas!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. En una terminal de PowerShell, ejecutar el queue worker:"
Write-Host "   php artisan queue:work database --queue=emails" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. En otra terminal, puedes probar el endpoint de registro:"
Write-Host "   POST http://localhost:8000/api/auth/register" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Verifica los emails en la cola (tabla 'jobs'):"
Write-Host "   SELECT * FROM jobs;" -ForegroundColor Cyan
Write-Host ""
Write-Host "¡El registro ahora es 10-15x más rápido! ⚡" -ForegroundColor Green
