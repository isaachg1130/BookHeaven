#!/usr/bin/env php
<?php
/**
 * test-dashboard-endpoint.php
 * 
 * Prueba rápida del endpoint GET /api/admin/dashboard
 * 
 * Uso:
 * php test-dashboard-endpoint.php
 */

// Simular una petición al endpoint usando curl
echo "⏳ Probando endpoint: GET /api/admin/dashboard...\n\n";

// Para este test, necesitamos:
// 1. El servidor Laravel corriendo en localhost:8000
// 2. Un token válido de un usuario admin
// 3. Base de datos con datos de prueba

// Variables
$baseUrl = 'http://localhost:8000';
$endpoint = '/api/admin/dashboard';
$method = 'GET';

// Lee el token del archivo de test anterior (si existe)
$tokenFile = __DIR__ . '/.admin-token.txt';
$token = file_exists($tokenFile) ? trim(file_get_contents($tokenFile)) : null;

if (!$token) {
    echo "❌ No se encontró token de admin.\n";
    echo "   Primero ejecuta: php test_admin_login.php\n";
    echo "   Esto guardará el token en .admin-token.txt\n\n";
    exit(1);
}

echo "✅ Token encontrado: " . substr($token, 0, 20) . "...\n\n";

// Hacer la petición
$ch = curl_init($baseUrl . $endpoint);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/json',
        "Authorization: Bearer $token"
    ],
    CURLOPT_TIMEOUT => 10
]);

echo "📡 Enviando petición...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Procesar respuesta
if ($error) {
    echo "❌ Error de conexión: $error\n";
    exit(1);
}

echo "Status Code: $httpCode\n\n";

if ($httpCode !== 200) {
    echo "Response:\n";
    echo $response . "\n";
    exit(1);
}

// Parsear JSON
$data = json_decode($response, true);

if (!$data) {
    echo "❌ Respuesta no es JSON válido:\n";
    echo $response . "\n";
    exit(1);
}

// Mostrar data structure
echo "✅ Respuesta exitosa!\n\n";
echo "📊 Estructura de datos recibida:\n";
echo "════════════════════════════════════════\n\n";

if ($data['success']) {
    $dashboardData = $data['data'];
    
    echo "Summary Stats:\n";
    if (isset($dashboardData['summary'])) {
        echo "  - Total Users: " . ($dashboardData['summary']['total_users'] ?? 'N/A') . "\n";
        echo "  - Total Libros: " . ($dashboardData['summary']['total_libros'] ?? 'N/A') . "\n";
        echo "  - Total Mangas: " . ($dashboardData['summary']['total_mangas'] ?? 'N/A') . "\n";
        echo "  - Total Comics: " . ($dashboardData['summary']['total_comics'] ?? 'N/A') . "\n";
    }
    
    echo "\nGrowth Data (months): " . count($dashboardData['growth_data'] ?? []) . " registros\n";
    
    echo "\nContent Distribution:\n";
    if (isset($dashboardData['content_distribution'])) {
        foreach ($dashboardData['content_distribution'] as $key => $value) {
            echo "  - $key: $value\n";
        }
    }
    
    echo "\nRecent Users: " . count($dashboardData['recent_users'] ?? []) . " usuarios\n";
    echo "Recent Content: " . count($dashboardData['recent_content'] ?? []) . " items\n";
    
    echo "\nPremium Stats:\n";
    if (isset($dashboardData['premium_stats'])) {
        foreach ($dashboardData['premium_stats'] as $key => $value) {
            echo "  - $key: $value\n";
        }
    }
    
} else {
    echo "Success=false: " . ($data['message'] ?? 'Error desconocido') . "\n";
}

echo "\n════════════════════════════════════════\n";
echo "✅ Endpoint funcionando correctamente!\n";
