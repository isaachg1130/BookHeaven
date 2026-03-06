<?php

require 'bootstrap/app.php';

$app = app();

$user = \App\Models\User::where('email', 'kristofercanotaborda@gmail.com')->first();
if ($user) {
    $adminRole = \App\Models\Role::where('name', 'admin')->first();
    $user->update(['role_id' => $adminRole->id]);
    echo "✅ Usuario actualizado a admin: " . $user->email . "\n";
    echo "   Nombre: " . $user->name . "\n";
    echo "   Rol: " . $user->role->name . "\n";
} else {
    echo "❌ Usuario no encontrado\n";
}
