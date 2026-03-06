<?php
/**
 * Generate Test Token for Admin User
 */

// Load Laravel boot file
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

// Get or create admin user
$admin = User::where('email', 'kristofercanotaborda@gmail.com')->first();

if ($admin) {
    // Delete any existing tokens
    $admin->tokens()->delete();
    
    // Create new token
    $token = $admin->createToken('dashboard_test')->plainTextToken;
    
    echo "==== Admin Token Generated ====\n";
    echo "User: " . $admin->email . "\n";
    echo "Role: " . ($admin->role ? $admin->role->name : 'No role') . "\n";
    echo "Token: " . $token . "\n";
    echo "==== Use this token in your API requests ====\n";
} else {
    echo "Admin user not found!\n";
    echo "Available users:\n";
    User::all()->each(function($u) {
        $role = $u->role ? $u->role->name : 'none';
        echo "  - {$u->email} (Role: {$role})\n";
    });
}
?>
