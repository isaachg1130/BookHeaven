<?php
/**
 * Script para probar el registro de usuario completo
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

echo "═══════════════════════════════════════════\n";
echo "   🧪 PRUEBA DE REGISTRO DE USUARIO\n";
echo "═══════════════════════════════════════════\n\n";

// Datos de prueba
$testEmail = 'test_' . time() . '@example.com';
$testData = [
    'name' => 'Usuario Prueba',
    'email' => $testEmail,
    'password' => 'Prueba123456',
];

echo "📋 Datos de prueba:\n";
echo "   Nombre: {$testData['name']}\n";
echo "   Email: {$testData['email']}\n";
echo "   Password: {$testData['password']}\n\n";

try {
    // 1. Verificar rol
    echo "1️⃣  Verificando rol 'standard'...\n";
    $standardRole = Role::where('name', 'standard')->first();
    if (!$standardRole) {
        throw new Exception("Rol 'standard' no encontrado");
    }
    echo "   ✅ Rol encontrado (ID: {$standardRole->id})\n\n";

    // 2. Verificar email único
    echo "2️⃣  Verificando que el email no existe...\n";
    $existingUser = User::where('email', $testData['email'])->first();
    if ($existingUser) {
        throw new Exception("El email ya existe en la base de datos");
    }
    echo "   ✅ Email disponible\n\n";

    // 3. Crear usuario
    echo "3️⃣  Creando usuario...\n";
    $user = User::create([
        'name' => $testData['name'],
        'email' => $testData['email'],
        'password' => Hash::make($testData['password']),
        'role_id' => $standardRole->id,
        'is_active' => true,
    ]);
    echo "   ✅ Usuario creado (ID: {$user->id})\n\n";

    // 4. Intentar enviar verificación de email
    echo "4️⃣  Enviando email de verificación...\n";
    try {
        $user->sendEmailVerificationNotification();
        echo "   ✅ Email de verificación enviado\n\n";
    } catch (\Exception $emailError) {
        echo "   ⚠️  ERROR al enviar email: {$emailError->getMessage()}\n";
        echo "       (El usuario se creó pero no se pudo enviar el email)\n\n";
    }

    // 5. Crear token
    echo "5️⃣  Creando token de autenticación...\n";
    $token = $user->createToken('auth_token')->plainTextToken;
    echo "   ✅ Token creado: " . substr($token, 0, 20) . "...\n\n";

    // RESULTADO FINAL
    echo "═══════════════════════════════════════════\n";
    echo "✨ ¡REGISTRO EXITOSO!\n";
    echo "═══════════════════════════════════════════\n\n";
    echo "Usuario creado:\n";
    echo "   ID: {$user->id}\n";
    echo "   Nombre: {$user->name}\n";
    echo "   Email: {$user->email}\n";
    echo "   Rol: {$user->role->name}\n";
    echo "   Activo: " . ($user->is_active ? 'Sí' : 'No') . "\n";
    echo "   Verificado: " . ($user->email_verified_at ? 'Sí' : 'No') . "\n";

    // Limpiar: eliminar usuario de prueba
    echo "\n🧹 Eliminando usuario de prueba...\n";
    $user->delete();
    echo "   ✅ Usuario eliminado\n";

} catch (\Exception $e) {
    echo "❌ ERROR:\n";
    echo "   Clase: " . get_class($e) . "\n";
    echo "   Mensaje: " . $e->getMessage() . "\n";
    echo "   Línea: " . $e->getLine() . "\n";
    echo "   Archivo: " . basename($e->getFile()) . "\n\n";
    
    // Intentar limpiar si el usuario se creó
    if (isset($user) && $user->id) {
        try {
            $user->delete();
            echo "🧹 Usuario de prueba eliminado\n";
        } catch (\Exception $deleteError) {
            echo "⚠️  No se pudo limpiar el usuario de prueba\n";
        }
    }
}

echo "\n═══════════════════════════════════════════\n";
