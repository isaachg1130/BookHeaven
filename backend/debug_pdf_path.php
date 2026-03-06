<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

use App\Models\Libro;
use Illuminate\Support\Facades\Storage;

echo "Checking PDF Paths...\n";

$libro = Libro::first();

if (!$libro) {
    echo "No books found in database.\n";
    exit;
}

echo "Found Book ID: " . $libro->id . "\n";
echo "Title: " . $libro->titulo . "\n";
echo "PDF path in DB: " . $libro->pdf . "\n";

$publicPath = public_path('storage');
echo "Public Storage Path: " . $publicPath . "\n";

try {
    $fullPath = Storage::disk('public_direct')->path($libro->pdf);
    echo "Full Path from Storage Disk: " . $fullPath . "\n";

    if (file_exists($fullPath)) {
        echo "File EXISTS!\n";
    } else {
        echo "File DOES NOT EXIST!\n";
        
        // Check if directory exists at least
        $dir = dirname($fullPath);
        if (is_dir($dir)) {
            echo "Directory exists: $dir\n";
            echo "Files in directory:\n";
            $files = scandir($dir);
            print_r($files);
        } else {
            echo "Directory does not exist: $dir\n";
        }
    }
} catch (\Exception $e) {
    echo "Error accessing storage: " . $e->getMessage() . "\n";
}
