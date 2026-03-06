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

echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║         ESTADO DE CONTRASEÑAS - USUARIOS PREMIUM              ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

$premiumUsers = User::where('role_id', $premiumRole->id)->limit(5)->get();

foreach ($premiumUsers as $index => $user) {
    echo "Usuario " . ($index + 1) . ": " . $user->name . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Contraseña (hasheada): \n";
    echo "   " . substr($user->password, 0, 40) . "...\n";
    echo "   (Tipo de hash: " . (strpos($user->password, '$2y') === 0 ? 'Bcrypt' : 'Desconocido') . ")\n";
    echo "\n";
}

echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║  ⚠️  IMPORTANTE: Las contraseñas están HASHEADAS (irreversibles) ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

echo "Opciones disponibles:\n\n";
echo "1️⃣  RESETEAR CONTRASEÑA:\n";
echo "   Usa el endpoint: POST /auth/forgot-password\n";
echo "   Se enviará un email con link de reset\n\n";

echo "2️⃣  CAMBIAR CONTRASEÑA DIRECTAMENTE (Admin):\n";
echo "   Usa artisan: php artisan tinker\n";
echo "   \$user = App\\Models\\User::find(4);\n";
echo "   \$user->password = Hash::make('nueva_contraseña');\n";
echo "   \$user->save();\n\n";

echo "3️⃣  CREAR NUEVA CUENTA DE PRUEBA:\n";
echo "   Usa el endpoint: POST /api/auth/register\n";
echo "   Con contraseña en texto plano que tú elijas\n\n";

echo "Las contraseñas de prueba conocidas (si existen en código):\n";
echo "   - premium@example.com: premium123\n";
echo "   - (Otros usuarios de prueba: verificar en seeders)\n";
?>
