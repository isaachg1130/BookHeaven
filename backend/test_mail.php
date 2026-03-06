<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Password;

$user = User::first();
if (!$user) {
    echo "No hay usuarios en la base de datos.\n";
    exit;
}

echo "Enviando enlace de recuperación a: " . $user->email . "\n";

$status = Password::sendResetLink(['email' => $user->email]);

echo "Estado: " . $status . "\n";
