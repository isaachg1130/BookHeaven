<?php
// Verificar estructura de la tabla usuarios
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$columns = \DB::getSchemaBuilder()->getColumnListing('users');
echo "✅ Columnas de la tabla 'users':\n";
foreach ($columns as $col) {
    echo "  - $col\n";
}

// Verificar que nuestros campos están presentes
$required_fields = ['date_of_birth', 'gender', 'country'];
$missing = array_diff($required_fields, $columns);

if (empty($missing)) {
    echo "\n✅ Todos los campos demográficos están presentes:\n";
    echo "  - date_of_birth ✓\n";
    echo "  - gender ✓\n";
    echo "  - country ✓\n";
} else {
    echo "\n❌ Faltan campos: " . implode(', ', $missing) . "\n";
}
