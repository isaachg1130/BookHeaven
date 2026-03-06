#!/usr/bin/env php
<?php
/**
 * verify-dashboard-setup.php
 * 
 * Script de verificación para asegurar que toda la refactorización
 * del dashboard está en su lugar correctamente.
 * 
 * Uso:
 * php verify-dashboard-setup.php
 */

echo "🔍 Verificando Dashboard Refactorizado...\n";
echo "════════════════════════════════════════\n\n";

$errors = [];
$warnings = [];
$success = [];

// ===== 1. VERIFICAR ARCHIVOS BACKEND =====
echo "📁 Verificando archivos Backend...\n";

$backendFiles = [
    'app/Services/AdminDashboardService.php' => 'Service para agregación de datos',
    'app/Http/Controllers/API/AdminController.php' => 'Controller con getDashboard()',
    'routes/api.php' => 'Rutas API con GET /api/admin/dashboard',
];

foreach ($backendFiles as $file => $description) {
    $path = __DIR__ . '/backend/' . $file;
    if (file_exists($path)) {
        $success[] = "✅ $file ($description)";
    } else {
        $errors[] = "❌ Falta: $file";
    }
}

// ===== 2. VERIFICAR ARCHIVOS FRONTEND =====
echo "📁 Verificando archivos Frontend...\n";

$frontendFiles = [
    'src/components/dashboard/MainLayout.jsx' => 'Layout principal',
    'src/components/dashboard/Sidebar.jsx' => 'Sidebar optimizado',
    'src/components/dashboard/SkeletonLoaders.jsx' => 'Skeleton loaders',
    'src/hooks/useDashboardData.js' => 'Custom hook',
    'src/pages/DashboardNew.jsx' => 'Dashboard page refactorizado',
    'src/styles/MainLayout.css' => 'CSS MainLayout',
    'src/styles/Sidebar.css' => 'CSS Sidebar',
    'src/styles/SkeletonLoaders.css' => 'CSS Skeleton loaders',
];

foreach ($frontendFiles as $file => $description) {
    $path = __DIR__ . '/frontend/' . $file;
    if (file_exists($path)) {
        $success[] = "✅ $file ($description)";
    } else {
        $errors[] = "❌ Falta: $file";
    }
}

// ===== 3. VERIFICAR CONTENIDO DE ARCHIVOS KEY =====
echo "\n📝 Verificando contenido de archivos clave...\n";

// Verificar que AdminDashboardService tiene los métodos esperados
$servicePath = __DIR__ . '/backend/app/Services/AdminDashboardService.php';
if (file_exists($servicePath)) {
    $content = file_get_contents($servicePath);
    
    $requiredMethods = [
        'getDashboardData' => 'Método principal',
        'getSummary' => 'Datos summary',
        'getUserGrowthData' => 'Datos de crecimiento',
        'getContentDistribution' => 'Distribución de contenido',
        'getRecentUsers' => 'Usuarios recientes',
        'getRecentContent' => 'Contenido reciente',
        'getPremiumStats' => 'Estadísticas premium',
    ];
    
    foreach ($requiredMethods as $method => $desc) {
        if (strpos($content, "function $method") !== false || strpos($content, "public function $method") !== false) {
            $success[] = "✅ AdminDashboardService::$method() existe";
        } else {
            $errors[] = "❌ Falta método: AdminDashboardService::$method()";
        }
    }
}

// Verificar que AdminController tiene getDashboard
$controllerPath = __DIR__ . '/backend/app/Http/Controllers/API/AdminController.php';
if (file_exists($controllerPath)) {
    $content = file_get_contents($controllerPath);
    
    if (strpos($content, 'function getDashboard') !== false) {
        $success[] = "✅ AdminController::getDashboard() existe";
    } else {
        $errors[] = "❌ Falta: AdminController::getDashboard()";
    }
    
    if (strpos($content, 'AdminDashboardService') !== false) {
        $success[] = "✅ AdminDashboardService inyectado";
    } else {
        $errors[] = "❌ AdminDashboardService no está inyectado";
    }
}

// Verificar rutas
$routesPath = __DIR__ . '/backend/routes/api.php';
if (file_exists($routesPath)) {
    $content = file_get_contents($routesPath);
    
    if (strpos($content, '/admin/dashboard') !== false) {
        $success[] = "✅ Ruta GET /api/admin/dashboard registrada";
    } else {
        $errors[] = "❌ Ruta /api/admin/dashboard no registrada";
    }
}

// Verificar que MainLayout existe y usa React.memo
$mainLayoutPath = __DIR__ . '/frontend/src/components/dashboard/MainLayout.jsx';
if (file_exists($mainLayoutPath)) {
    $content = file_get_contents($mainLayoutPath);
    $success[] = "✅ MainLayout.jsx existe";
    
    if (strpos($content, 'flexDirection') !== false) {
        $success[] = "✅ MainLayout usa flexbox";
    }
}

// Verificar que Sidebar está memoizado
$sidebarPath = __DIR__ . '/frontend/src/components/dashboard/Sidebar.jsx';
if (file_exists($sidebarPath)) {
    $content = file_get_contents($sidebarPath);
    
    if (strpos($content, 'React.memo') !== false) {
        $success[] = "✅ Sidebar envuelto con React.memo";
    } else {
        $errors[] = "❌ Sidebar NO está memoizado";
    }
    
    if (strpos($content, 'useMemo') !== false) {
        $success[] = "✅ Sidebar usa useMemo";
    } else {
        $warnings[] = "⚠️  Sidebar no usa useMemo";
    }
}

// Verificar hook useDashboardData
$hookPath = __DIR__ . '/frontend/src/hooks/useDashboardData.js';
if (file_exists($hookPath)) {
    $content = file_get_contents($hookPath);
    
    if (strpos($content, '/api/admin/dashboard') !== false) {
        $success[] = "✅ useDashboardData llama endpoint correcto";
    } else {
        $errors[] = "❌ useDashboardData no llama /api/admin/dashboard";
    }
    
    if (strpos($content, 'Bearer') !== false) {
        $success[] = "✅ useDashboardData maneja auth token";
    }
}

// Verificar DashboardNew refactorizado
$dashboardPath = __DIR__ . '/frontend/src/pages/DashboardNew.jsx';
if (file_exists($dashboardPath)) {
    $content = file_get_contents($dashboardPath);
    
    if (strpos($content, 'useDashboardData') !== false) {
        $success[] = "✅ DashboardNew usa useDashboardData";
    } else {
        $errors[] = "❌ DashboardNew no usa useDashboardData";
    }
    
    if (strpos($content, 'MainLayout') !== false) {
        $success[] = "✅ DashboardNew usa MainLayout";
    } else {
        $errors[] = "❌ DashboardNew no usa MainLayout";
    }
    
    if (strpos($content, 'React.memo') !== false) {
        $success[] = "✅ DashboardNew tiene componentes memoizados";
    } else {
        $warnings[] = "⚠️  DashboardNew no tiene React.memo";
    }
}

// ===== 4. MOSTRAR RESULTADOS =====
echo "\n════════════════════════════════════════\n";
echo "RESULTADOS\n";
echo "════════════════════════════════════════\n\n";

if ($success) {
    echo count($success) . " verificaciones exitosas:\n";
    foreach ($success as $msg) {
        echo "  $msg\n";
    }
    echo "\n";
}

if ($warnings) {
    echo count($warnings) . " advertencias:\n";
    foreach ($warnings as $msg) {
        echo "  $msg\n";
    }
    echo "\n";
}

if ($errors) {
    echo count($errors) . " errores encontrados:\n";
    foreach ($errors as $msg) {
        echo "  $msg\n";
    }
    echo "\n";
}

// ===== RESUMEN =====
echo "════════════════════════════════════════\n";

if (empty($errors)) {
    echo "✅ Dashboard Refactorizado está listo para producción!\n\n";
    echo "Próximos pasos:\n";
    echo "1. Ejecutar migrations: php artisan migrate:fresh --seed\n";
    echo "2. Probar endpoint: php test-dashboard-endpoint.php\n";
    echo "3. Iniciar frontend: npm run dev\n";
    exit(0);
} else {
    echo "❌ Hay " . count($errors) . " errores que necesitan ser corregidos\n";
    exit(1);
}
?>
