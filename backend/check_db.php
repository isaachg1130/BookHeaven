<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$tables = ['users', 'roles', 'jobs'];

foreach ($tables as $table) {
    echo "Table: $table\n";
    if (Schema::hasTable($table)) {
        try {
            $indexes = Schema::getIndexes($table);
            foreach ($indexes as $index) {
                echo " - Index: " . ($index['name'] ?? 'unnamed') . " (Columns: " . implode(', ', $index['columns']) . ")\n";
            }
        } catch (\Exception $e) {
            echo " - Error getting indexes: " . $e->getMessage() . "\n";
        }
    } else {
        echo " - Table does not exist\n";
    }
}
