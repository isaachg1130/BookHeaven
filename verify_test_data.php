<?php

require 'backend/vendor/autoload.php';
require 'backend/bootstrap/app.php';

use App\Models\User;
use App\Models\Role;

// Título
echo "\n";
echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║        DATOS DE PRUEBA DEL DASHBOARD - RESUMEN                ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

// Total de usuarios
$totalUsers = User::count();
echo "📊 USUARIOS TOTALES: " . $totalUsers . "\n";
echo "   └─ Standard: " . User::whereHas('role', fn($q) => $q->where('name', 'standard'))->count() . "\n";
echo "   └─ Premium: " . User::whereHas('role', fn($q) => $q->where('name', 'premium'))->count() . "\n";
echo "   └─ Admin: " . User::whereHas('role', fn($q) => $q->where('name', 'admin'))->count() . "\n\n";

// Usuarios con datos demográficos
$conDatos = User::whereNotNull('date_of_birth')
    ->whereNotNull('gender')
    ->whereNotNull('country')
    ->count();

$porcentaje = $totalUsers > 0 ? round(($conDatos / $totalUsers) * 100, 2) : 0;
echo "📋 DATOS DEMOGRÁFICOS:\n";
echo "   └─ Usuarios con datos completos: " . $conDatos . " (" . $porcentaje . "%)\n\n";

// Distribución por género
$generos = User::whereNotNull('gender')
    ->groupBy('gender')
    ->selectRaw('gender, count(*) as total')
    ->pluck('total', 'gender')
    ->toArray();

echo "👥 DISTRIBUCIÓN POR GÉNERO:\n";
foreach ($generos as $genero => $cantidad) {
    $label = ucfirst($genero);
    echo "   └─ $label: $cantidad\n";
}
echo "\n";

// Top países
$paises = User::whereNotNull('country')
    ->groupBy('country')
    ->selectRaw('country, count(*) as total')
    ->orderBy('total', 'desc')
    ->pluck('total', 'country')
    ->toArray();

echo "🌍 DISTRIBUCIÓN POR PAÍS (Top 5):\n";
$top = 0;
foreach ($paises as $pais => $cantidad) {
    if ($top >= 5) break;
    echo "   └─ $pais: $cantidad\n";
    $top++;
}
echo "\n";

// Distribución por edad
echo "🎂 DISTRIBUCIÓN POR RANGO DE EDAD:\n";

$edades = [
    '13-18' => 0,
    '19-25' => 0,
    '26-35' => 0,
    '36-50' => 0,
    '50+' => 0,
];

$usuariosConFecha = User::whereNotNull('date_of_birth')
    ->select('date_of_birth')
    ->get();

foreach ($usuariosConFecha as $usuario) {
    if ($usuario->date_of_birth) {
        $edad = $usuario->date_of_birth->age;
        if ($edad >= 13 && $edad <= 18) {
            $edades['13-18']++;
        } elseif ($edad >= 19 && $edad <= 25) {
            $edades['19-25']++;
        } elseif ($edad >= 26 && $edad <= 35) {
            $edades['26-35']++;
        } elseif ($edad >= 36 && $edad <= 50) {
            $edades['36-50']++;
        } elseif ($edad > 50) {
            $edades['50+']++;
        }
    }
}

foreach ($edades as $rango => $cantidad) {
    echo "   └─ $rango años: $cantidad\n";
}

echo "\n";
echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║  ✅ DATOS LISTOS PARA PROBAR EN EL DASHBOARD                 ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

// Mostrar credenciales de prueba
echo "🔐 CREDENCIALES PARA PROBAR:\n\n";
echo "ADMIN:\n";
echo "   Email: kristofercanotaborda@gmail.com\n";
echo "   Contraseña: admin123\n\n";

echo "USUARIO STANDARD:\n";
echo "   Email: test@example.com\n";
echo "   Contraseña: password\n\n";

echo "USUARIO PREMIUM:\n";
echo "   Email: premium@example.com\n";
echo "   Contraseña: premium123\n\n";

echo "USUARIOS DE PRUEBA (15 nuevos):\n";
echo "   Email: juan.garcia@test.com (estándar)\n";
echo "   Email: diego.morales@test.com (premium)\n";
echo "   Contraseña: password123 (todos)\n\n";
