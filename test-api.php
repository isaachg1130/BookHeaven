<?php
/**
 * Test script para verificar el endpoint del dashboard
 */

// Simular una solicitud a la API
$ch = curl_init();

// URL del endpoint
$url = 'http://localhost:8000/api/admin/dashboard';

// Headers necesarios
$token = 'test-token-here'; // Necesitarás generar un token válido

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Bearer ' . $token,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "=== Test Dashboard API ===\n";
echo "URL: $url\n";
echo "HTTP Code: $httpCode\n";
echo "Response:\n";
echo json_encode(json_decode($response), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

if ($error) {
    echo "Error: $error\n";
}
