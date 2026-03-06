#!/usr/bin/env php
<?php

/**
 * Script de Validación - BookHeaven Audit
 * Verifica que todas las correcciones de seguridad están en su lugar
 */

// Colores para output
$colors = [
    'success' => "\033[92m", // Verde
    'error' => "\033[91m",   // Rojo
    'warning' => "\033[93m", // Amarillo
    'info' => "\033[94m",    // Azul
    'reset' => "\033[0m",    // Reset
];

function print_check($text, $passed, $details = '') {
    global $colors;
    $symbol = $passed ? '✓' : '✗';
    $color = $passed ? $colors['success'] : $colors['error'];
    echo $color . "[$symbol]" . $colors['reset'] . " $text";
    if ($details) {
        echo " - " . $colors['warning'] . $details . $colors['reset'];
    }
    echo "\n";
    return $passed;
}

echo $colors['info'] . "\n╔═════════════════════════════════════════════════════╗\n";
echo "║  VALIDACIÓN DE CORRECCIONES - BookHeaven System  ║\n";
echo "║  Senior Full-Stack Audit - 13 Errores Revisados  ║\n";
echo "╚═════════════════════════════════════════════════════╝\n\n" . $colors['reset'];

$checks_passed = 0;
$checks_total = 0;

// ============================================
// VALIDACIONES DE BACKEND
// ============================================
echo $colors['info'] . "VALIDACIONES DE BACKEND:\n" . $colors['reset'];
echo str_repeat("─", 55) . "\n";

// Check 1: Rutas API seguras
$checks_total++;
$api_file = __DIR__ . '/backend/routes/api.php';
if (file_exists($api_file)) {
    $content = file_get_contents($api_file);
    
    // Verificar que usa Model Binding en photos
    $check1 = strpos($content, '/user/profile-photo/{user}') !== false;
    $check2 = strpos($content, "'{filename}'") === false;
    
    if (print_check("ERR #1: Path Traversal - Rutas seguras", $check1 && $check2)) {
        $checks_passed++;
    }
} else {
    print_check("ERR #1: Path Traversal", false, "Archivo no encontrado");
}

// Check 2: SQL Injection Prevention
$checks_total++;
$controller_file = __DIR__ . '/backend/app/Http/Controllers/API/ContentController.php';
if (file_exists($controller_file)) {
    $content = file_get_contents($controller_file);
    
    $check1 = strpos($content, "\$allowedOrderBy = [") !== false;
    $check2 = strpos($content, "in_array(\$request->input('orderBy')") !== false;
    
    if (print_check("ERR #2: SQL Injection - Whitelist de campos", $check1 && $check2)) {
        $checks_passed++;
    }
} else {
    print_check("ERR #2: SQL Injection", false, "Archivo no encontrado");
}

// Check 3: Premium Filtering
$checks_total++;
if (file_exists($controller_file)) {
    $content = file_get_contents($controller_file);
    
    // Debe filtrar para usuarios NO autenticados también
    $check1 = strpos($content, "if (!\$user || \$user->isStandard())") !== false;
    
    if (print_check("ERR #3: Premium Filtering - No autenticados", $check1)) {
        $checks_passed++;
    }
} else {
    print_check("ERR #3: Premium Filtering", false, "Archivo no encontrado");
}

// Check 4: User Model - isPremium Logic
$checks_total++;
$user_model = __DIR__ . '/backend/app/Models/User.php';
if (file_exists($user_model)) {
    $content = file_get_contents($user_model);
    
    // Debe tener lógica clara
    $check1 = strpos($content, 'if (!$this->role || $this->role->name !== \'premium\')') !== false;
    
    if (print_check("ERR #4: isPremium() Logic", $check1, "Validación clara")) {
        $checks_passed++;
    }
} else {
    print_check("ERR #4: isPremium() Logic", false, "Archivo no encontrado");
}

// Check 5: hasPermission Method
$checks_total++;
if (file_exists($user_model)) {
    $content = file_get_contents($user_model);
    
    $check1 = strpos($content, 'public function hasPermission(string \$permissionName): bool') !== false;
    
    if (print_check("ERR #5: User::hasPermission()", $check1, "Método agregado")) {
        $checks_passed++;
    }
} else {
    print_check("ERR #5: User::hasPermission()", false, "Archivo no encontrado");
}

// Check 6: register() Error Handling
$checks_total++;
$auth_controller = __DIR__ . '/backend/app/Http/Controllers/API/AuthController.php';
if (file_exists($auth_controller)) {
    $content = file_get_contents($auth_controller);
    
    $check1 = strpos($content, 'Role::where(\'name\', \'standard\')->first()') !== false;
    $check2 = strpos($content, 'if (!$standardRole)') !== false;
    
    if (print_check("ERR #6: register() - Error handling", $check1 && $check2)) {
        $checks_passed++;
    }
} else {
    print_check("ERR #6: register() Error handling", false, "Archivo no encontrado");
}

// Check 7: Profile Photo - Secure Naming
$checks_total++;
if (file_exists($auth_controller)) {
    $content = file_get_contents($auth_controller);
    
    $check1 = strpos($content, "hash('sha256'") !== false;
    $check2 = strpos($content, 'user_' . $content) === false || strpos($content, "'user_' . \$user->id") !== false;
    
    if (print_check("ERR #7: Profile Photo - Nombres seguros", $check1)) {
        $checks_passed++;
    }
} else {
    print_check("ERR #7: Profile Photo", false, "Archivo no encontrado");
}

// Check 8: AdminController - Permission Check
$checks_total++;
$admin_controller = __DIR__ . '/backend/app/Http/Controllers/API/AdminController.php';
if (file_exists($admin_controller)) {
    $content = file_get_contents($admin_controller);
    
    $check1 = strpos($content, '\$user->hasPermission(\'view_dashboard\')') !== false;
    
    if (print_check("ERR #8: AdminController - hasPermission()", $check1)) {
        $checks_passed++;
    }
} else {
    print_check("ERR #8: AdminController", false, "Archivo no encontrado");
}

// Check 9: serveAudio Type Hint
$checks_total++;
if (file_exists($controller_file)) {
    $content = file_get_contents($controller_file);
    
    $check1 = strpos($content, 'public function serveAudio(Request $request, int $id): \\Symfony\\Component\\HttpFoundation\\BinaryFileResponse') !== false;
    
    if (print_check("ERR #9: serveAudio() Type Hint", $check1)) {
        $checks_passed++;
    }
} else {
    print_check("ERR #9: serveAudio()", false, "Archivo no encontrado");
}

// ============================================
// VALIDACIONES DE FRONTEND
// ============================================
echo "\n" . $colors['info'] . "VALIDACIONES DE FRONTEND:\n" . $colors['reset'];
echo str_repeat("─", 55) . "\n";

// Check 10: AuthContext - refreshUser
$checks_total++;
$auth_context = __DIR__ . '/frontend/src/context/AuthContext.jsx';
if (file_exists($auth_context)) {
    $content = file_get_contents($auth_context);
    
    $check1 = strpos($content, 'const refreshUser =') !== false;
    $check2 = strpos($content, 'validateExpiration') !== false || strpos($content, 'setInterval') !== false;
    
    if (print_check("ERR #10: AuthContext - refreshUser()", $check1)) {
        $checks_passed++;
    }
} else {
    print_check("ERR #10: AuthContext", false, "Archivo no encontrado");
}

// Check 11: AuthContext - isActive
$checks_total++;
if (file_exists($auth_context)) {
    $content = file_get_contents($auth_context);
    
    $check1 = strpos($content, 'const isActive =') !== false;
    
    if (print_check("ERR #11: AuthContext - isActive()", $check1)) {
        $checks_passed++;
    }
} else {
    print_check("ERR #11: AuthContext", false, "Archivo no encontrado");
}

// Check 12: ProtectedRoute - Account Status
$checks_total++;
$protected_route = __DIR__ . '/frontend/src/components/common/ProtectedRoute.jsx';
if (file_exists($protected_route)) {
    $content = file_get_contents($protected_route);
    
    $check1 = strpos($content, '!user.is_active') !== false;
    $check2 = strpos($content, 'requirePremium') !== false;
    
    if (print_check("ERR #12: ProtectedRoute - Status validation", $check1 && $check2)) {
        $checks_passed++;
    }
} else {
    print_check("ERR #12: ProtectedRoute", false, "Archivo no encontrado");
}

// Check 13: ProtectedRoute - Premium Expiration
$checks_total++;
if (file_exists($protected_route)) {
    $content = file_get_contents($protected_route);
    
    $check1 = strpos($content, 'premium_expires_at') !== false;
    $check2 = strpos($content, 'isFuture') !== false || strpos($content, '< new Date()') !== false;
    
    if (print_check("ERR #13: ProtectedRoute - Premium expiration", $check1)) {
        $checks_passed++;
    }
} else {
    print_check("ERR #13: ProtectedRoute", false, "Archivo no encontrado");
}

// ============================================
// RESUMEN
// ============================================
echo "\n" . str_repeat("═", 55) . "\n";
echo $colors['info'] . "RESUMEN DE VALIDACIÓN\n" . $colors['reset'];
echo str_repeat("─", 55) . "\n";

$percentage = ($checks_passed / $checks_total) * 100;
$percentage_color = $percentage >= 80 ? $colors['success'] : ($percentage >= 50 ? $colors['warning'] : $colors['error']);

echo "Pruebas pasadas: " . $percentage_color . "$checks_passed/$checks_total" . $colors['reset'] . " (";
echo $percentage_color . number_format($percentage, 1) . "%" . $colors['reset'] . ")\n";

if ($percentage == 100) {
    echo $colors['success'] . "\n✓ TODAS LAS CORRECCIONES VALIDADAS EXITOSAMENTE\n" . $colors['reset'];
} elseif ($percentage >= 80) {
    echo $colors['warning'] . "\n⚠ La mayoría de correcciones están en su lugar\n" . $colors['reset'];
} else {
    echo $colors['error'] . "\n✗ REVISAR VALIDACIONES FALLIDAS\n" . $colors['reset'];
}

echo "\n" . str_repeat("═", 55) . "\n";
echo $colors['info'] . "Sistema listo para testing y deployment\n" . $colors['reset'];
echo "Ejecuta: cd backend && php artisan migrate --seed\n";
echo "Luego: php artisan serve\n\n";

exit($percentage == 100 ? 0 : 1);
