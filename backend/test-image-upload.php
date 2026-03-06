<?php
/**
 * Script de prueba para diagnóstico de carga de imágenes
 * 
 * Uso:
 * 1. Asegúrate de estar autenticado en el sistema
 * 2. Ejecuta este script desde la carpeta backend
 * 3. Verifica los logs en storage/logs/laravel.log
 */

// Cargar ambiente Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

// Crear un request simulado POST con imagen
$headers = [
    'HTTP_HOST' => 'localhost:8000',
    'HTTP_USER_AGENT' => 'PHP CLI Test',
    'CONTENT_TYPE' => 'multipart/form-data; boundary=----FormBoundary123',
    'REQUEST_METHOD' => 'POST',
];

// Crear archivo temporal de imagen para prueba (JPEG mínimo válido)
$tempImage = tempnam(sys_get_temp_dir(), 'test_') . '.jpg';
// JPEG válido mínimo: marcador SOI + marcador EOI
$jpegData = "\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xFF\xD9";
file_put_contents($tempImage, $jpegData);

echo "=== TEST DE CARGA DE IMÁGENES ===\n";
echo "Archivo temporal: $tempImage\n";
echo "Tamaño: " . filesize($tempImage) . " bytes\n";
echo "\n";

// Verificar directorios
$dirs = [
    'public/storage' => public_path('storage'),
    'public/storage/images' => public_path('storage/images'),
    'public/storage/images/libros' => public_path('storage/images/libros'),
];

foreach ($dirs as $name => $path) {
    $exists = is_dir($path);
    $readable = is_readable($path);
    $writable = is_writable($path);
    echo "$name: " . ($exists ? '✓ EXISTS' : '✗ MISSING');
    echo " | Readable: " . ($readable ? '✓' : '✗');
    echo " | Writable: " . ($writable ? '✓' : '✗') . "\n";
}

echo "\n=== VERIFICAR CONFIGURACIÓN DEL DISCO ===\n";
$config = config('filesystems.disks.public_direct');
echo "Root: " . $config['root'] . "\n";
echo "URL: " . $config['url'] . "\n";
echo "\n";

// Intentar guardar archivo directamente
echo "=== PRUEBA DIRECTA CON STORAGE ===\n";
try {
    // Copiar archivo a storage
    $testImageName = 'test_' . time() . '.jpg';
    $testImagePath = 'images/libros/' . $testImageName;
    
    // Usar almacenamiento
    $content = file_get_contents($tempImage);
    $saved = \Illuminate\Support\Facades\Storage::disk('public_direct')->put($testImagePath, $content);
    
    if ($saved) {
        echo "✓ Archivo guardado: $testImagePath\n";
        $fullPath = public_path('storage/' . $testImagePath);
        echo "  Ruta completa: $fullPath\n";
        echo "  Existe: " . (file_exists($fullPath) ? '✓' : '✗') . "\n";
        echo "  Tamaño: " . filesize($fullPath) . " bytes\n";
        
        // Limpiar archivo de prueba
        \Illuminate\Support\Facades\Storage::disk('public_direct')->delete($testImagePath);
        echo "  Eliminado para prueba\n";
    } else {
        echo "✗ Error al guardar archivo\n";
    }
} catch (\Exception $e) {
    echo "✗ Excepción: " . $e->getMessage() . "\n";
}

// Limpiar archivo temporal
unlink($tempImage);

echo "\n=== VERIFICAR BD ===\n";
try {
    $libro = \App\Models\Libro::first();
    if ($libro) {
        echo "Primer libro encontrado:\n";
        echo "  ID: " . $libro->id . "\n";
        echo "  Título: " . $libro->titulo . "\n";
        echo "  Imagen actual: " . ($libro->imagen ?? 'NULL') . "\n";
        echo "  PDF: " . ($libro->pdf ?? 'NULL') . "\n";
    } else {
        echo "No hay libros en la BD\n";
    }
} catch (\Exception $e) {
    echo "Error en BD: " . $e->getMessage() . "\n";
}

echo "\n=== VERIFICAR PERMISOS DE CARPETA ===\n";
$storageDir = public_path('storage/images/libros');
if (is_dir($storageDir)) {
    echo "Permisos (octal): " . substr(sprintf('%o', fileperms($storageDir)), -4) . "\n";
    echo "Contenido:\n";
    $files = array_slice(scandir($storageDir), 2);
    if (empty($files)) {
        echo "  (Carpeta vacía)\n";
    } else {
        foreach ($files as $file) {
            $size = filesize("$storageDir/$file");
            echo "  - $file ($size bytes)\n";
        }
    }
}

echo "\nFin del test\n";
