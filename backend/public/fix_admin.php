<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

// We need to bootstrap the container to use facades/models properly
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'kristofercanotaborda@gmail.com';

try {
    $user = User::where('email', $email)->first();
    
    if (!$user) {
        echo "USER_NOT_FOUND\n";
        exit;
    }

    $adminRole = Role::where('name', 'admin')->first();
    
    if (!$adminRole) {
        echo "ADMIN_ROLE_NOT_FOUND\n";
        exit;
    }

    $user->role_id = $adminRole->id;
    $user->save();

    echo "SUCCESS: User {$user->email} updated to Role: {$adminRole->name} (ID: {$adminRole->id})\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
