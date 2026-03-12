<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'kristofercanotaborda@gmail.com';
$password = 'admin123';

try {
    $user = User::where('email', $email)->first();
    
    if ($user) {
        $user->password = Hash::make($password);
        $user->save();
        echo "SUCCESS: Password updated for {$email}\n";
    } else {
        echo "ERROR: User not found\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
