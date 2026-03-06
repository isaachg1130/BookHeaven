<?php
// Script para verificar que no hay errores de sintaxis en los controladores

require 'backend/vendor/autoload.php';

try {
    // Cargar las clases
    require 'backend/app/Http/Controllers/API/DashboardController.php';
    require 'backend/app/Services/AdminDashboardService.php';
    
    echo "✅ DashboardController - OK\n";
    echo "✅ AdminDashboardService - OK\n";
    echo "\nNo hay errores de sintaxis.\n";
    
} catch (\Throwable $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    die(1);
}
