<?php
require 'backend/vendor/autoload.php';

// Load Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Role;

// Obtener usuarios premium
$premiumRole = Role::where('name', 'premium')->first();

if (!$premiumRole) {
    echo "No existe el rol premium\n";
    exit;
}

echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║            USUARIOS PREMIUM EN BOOKHEAVEN                     ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

$premiumUsers = User::where('role_id', $premiumRole->id)->get();

if ($premiumUsers->isEmpty()) {
    echo "No hay usuarios premium registrados.\n";
} else {
    echo "Total de usuarios premium: " . $premiumUsers->count() . "\n\n";
    
    foreach ($premiumUsers as $index => $user) {
        echo "Usuario " . ($index + 1) . ":\n";
        echo "   ID: " . $user->id . "\n";
        echo "   Nombre: " . $user->name . "\n";
        echo "   Email: " . $user->email . "\n";
        echo "   Género: " . ($user->gender ?? 'N/A') . "\n";
        echo "   País: " . ($user->country ?? 'N/A') . "\n";
        echo "   Premium expires: " . ($user->premium_expires_at ?? 'No definido') . "\n";
        echo "   Estado: " . ($user->is_active ? 'Activo' : 'Inactivo') . "\n";
        echo "   Creado: " . $user->created_at . "\n";
        echo "─────────────────────────────────────────────────────────────\n";
    }
}
