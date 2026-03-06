<?php
require 'vendor/autoload.php';
require 'bootstrap/app.php';

use App\Models\Libro;
use App\Models\Manga;
use App\Models\Comic;
use App\Models\Audiobook;
use App\Models\User;

$libros = Libro::count();
$mangas = Manga::count();
$comics = Comic::count();
$audiobooks = Audiobook::count();
$users = User::whereHas('role', function ($q) {
    $q->whereIn('name', ['standard', 'premium']);
})->count();

echo "📊 CONTENIDO DISPONIBLE:\n";
echo "Libros: $libros\n";
echo "Mangas: $mangas\n";
echo "Comics: $comics\n";
echo "Audiobooks: $audiobooks\n";
echo "Usuarios (no-admin): $users\n";
