<?php
/**
 * Script para verificar y crear roles necesarios
 */

// Cargar LaravelML
require __DIR__ . '/vendor/autoload.php';

// Cargar la aplicación
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Role;
use Illuminate\Support\Facades\DB;

echo "=== VERIFICACIÓN DE ROLES ===\n\n";

// Listar todos los roles existentes
$roles = Role::all();
echo "📋 Roles existentes en la base de datos:\n";
if ($roles->isEmpty()) {
    echo "   ⚠️  No hay roles creados\n\n";
} else {
    foreach ($roles as $role) {
        echo "   ✅ {$role->id}: {$role->name}\n";
    }
    echo "\n";
}

// Verificar roles requeridos
$requiredRoles = ['admin', 'standard', 'premium'];
echo "🔍 Buscando roles requeridos:\n";

foreach ($requiredRoles as $roleName) {
    $role = Role::where('name', $roleName)->first();
    if ($role) {
        echo "   ✅ '$roleName' existe (ID: {$role->id})\n";
    } else {
        echo "   ❌ '$roleName' NO existe\n";
    }
}

echo "\n🛠️  Creando roles faltantes...\n";
$created = 0;

foreach ($requiredRoles as $roleName) {
    $role = Role::where('name', $roleName)->first();
    if (!$role) {
        Role::create(['name' => $roleName]);
        echo "   ✨ Creado: $roleName\n";
        $created++;
    }
}

if ($created === 0) {
    echo "   ℹ️  Todos los roles requeridos ya existen\n";
} else {
    echo "   ✅ Se crearon $created roles\n";
}

echo "\n=== RESULTADO FINAL ===\n";
$allRoles = Role::pluck('name')->toArray();
echo "Roles disponibles: " . implode(', ', $allRoles) . "\n";
