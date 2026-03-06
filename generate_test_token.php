<?php
// Test script to get admin token and test dashboard API

// Use artisan command to get the admin user's token
$commands = [
    // Generate a token for the admin user
    'php artisan tinker <<\'EOF\''
    . "\n" . 'use App\Models\User;'
    . "\n" . '$admin = User::where("email", "kristofercanotaborda@gmail.com")->first();'
    . "\n" . 'if ($admin) {'
    . "\n" . '  $token = $admin->createToken("test_token")->plainTextToken;'
    . "\n" . '  echo "TOKEN: " . $token;'
    . "\n" . '} else {'
    . "\n" . '  echo "Admin user not found";'
    . "\n" . '}'
    . "\n" . 'EOF'
];

echo "Running token generation...\n";
$output = shell_exec('cd "c:\\Users\\Kristofer\\Downloads\\bb\\BookHeaven (2)\\BookHeaven\\backend" ; ' . $commands[0]);
echo $output . "\n";
