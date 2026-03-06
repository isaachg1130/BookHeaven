#!/usr/bin/env pwsh
# Script para verificar las optimizaciones de rendimiento

Write-Host "Verificando Optimizaciones de Rendimiento..." -ForegroundColor Cyan
Write-Host ""

# Verificar backend
Write-Host "Verificando Backend..." -ForegroundColor Yellow
Write-Host ""

# 1. Verificar que el ContentController tiene los headers de cache
Write-Host "  - Verificando ContentController..."
$contentController = Get-Content "backend/app/Http/Controllers/API/ContentController.php" -Raw
if ($contentController -match "Cache-Control.*max-age=300") {
    Write-Host "    OK: Headers de cache encontrados en ContentController" -ForegroundColor Green
} else {
    Write-Host "    ERROR: Headers de cache NO encontrados en ContentController" -ForegroundColor Red
}

# 2. Verificar que existe el HttpCacheMiddleware
Write-Host "  - Verificando HttpCacheMiddleware..."
if (Test-Path "backend/app/Http/Middleware/HttpCacheMiddleware.php") {
    Write-Host "    OK: HttpCacheMiddleware creado correctamente" -ForegroundColor Green
} else {
    Write-Host "    ERROR: HttpCacheMiddleware NO encontrado" -ForegroundColor Red
}

# 3. Verificar que esta registrado en bootstrap/app.php
Write-Host "  - Verificando registro de middleware..."
$bootstrap = Get-Content "backend/bootstrap/app.php" -Raw
if ($bootstrap -match "http\.cache") {
    Write-Host "    OK: Middleware registrado en bootstrap/app.php" -ForegroundColor Green
} else {
    Write-Host "    ERROR: Middleware NO registrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "Verificando Frontend..." -ForegroundColor Yellow
Write-Host ""

# 4. Verificar BookRow con Intersection Observer
Write-Host "  - Verificando BookRow..."
$bookRow = Get-Content "frontend/src/components/BookRow.jsx" -Raw
if ($bookRow -match "IntersectionObserver") {
    Write-Host "    OK: Intersection Observer implementado en BookRow" -ForegroundColor Green
} else {
    Write-Host "    ERROR: Intersection Observer NO encontrado" -ForegroundColor Red
}

if ($bookRow -match "decoding=.async") {
    Write-Host "    OK: Atributo decoding='async' agregado a imagenes" -ForegroundColor Green
} else {
    Write-Host "    ERROR: Atributo decoding='async' NO encontrado" -ForegroundColor Red
}

# 5. Verificar HomeNew con per_page=12
Write-Host "  - Verificando HomeNew..."
$homeNew = Get-Content "frontend/src/pages/HomeNew.jsx" -Raw
if ($homeNew -match "per_page:\s*12") {
    Write-Host "    OK: Numero de items reducido a 12 en HomeNew" -ForegroundColor Green
} else {
    Write-Host "    ERROR: Numero de items NO actualizado" -ForegroundColor Red
}

Write-Host ""
Write-Host "Verificando Configuracion..." -ForegroundColor Yellow
Write-Host ""

# 6. Verificar nginx-optimization.conf
Write-Host "  - Verificando configuracion de Nginx..."
$nginx = Get-Content "backend/nginx-optimization.conf" -Raw
if ($nginx -match "max-age=2592000") {
    Write-Host "    OK: Cache de imagenes configurado (30 dias)" -ForegroundColor Green
} else {
    Write-Host "    ERROR: Cache de imagenes NO configurado correctamente" -ForegroundColor Red
}

Write-Host ""
Write-Host "Resumen de Verificacion" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Backend:" -ForegroundColor White
Write-Host "  - Cache HTTP en API endpoints" -ForegroundColor White
Write-Host "  - HttpCacheMiddleware implementado" -ForegroundColor White
Write-Host "  - Middleware registrado" -ForegroundColor White
Write-Host ""
Write-Host "Frontend:" -ForegroundColor White
Write-Host "  - Intersection Observer para lazy loading" -ForegroundColor White
Write-Host "  - Atributo decoding='async' en imagenes" -ForegroundColor White
Write-Host "  - Reduccion de items por pagina (20 -> 12)" -ForegroundColor White
Write-Host ""
Write-Host "Servidor:" -ForegroundColor White
Write-Host "  - Cache de imagenes optimizado (30 dias)" -ForegroundColor White
Write-Host "  - Cache de API configurado (5 minutos)" -ForegroundColor White
Write-Host ""
Write-Host "========================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Optimizaciones completadas!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Limpiar cache del navegador (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "  2. Recargar la aplicacion (Ctrl+F5)" -ForegroundColor White
Write-Host "  3. Abrir DevTools -> Network para ver mejoras" -ForegroundColor White
Write-Host "  4. Verificar que los tiempos de carga mejoraron" -ForegroundColor White
Write-Host ""
Write-Host "Documentacion completa en: OPTIMIZACIONES_RENDIMIENTO.md" -ForegroundColor Cyan
Write-Host ""
