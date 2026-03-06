<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = App\Models\User::where('email', 'kristofercanotaborda@gmail.com')->first();
if ($user) {
    $token = $user->createToken('dashboard')->plainTextToken;
    echo "Token: " . $token . "\n";
    echo "User ID: " . $user->id . "\n";
    echo "User Name: " . $user->name . "\n";
    echo "Role ID: " . $user->role_id . "\n";
} else {
    echo "User not found\n";
}
