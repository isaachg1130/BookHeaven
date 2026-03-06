<?php

namespace Database\Seeders;

use App\Models\Libro;
use Illuminate\Database\Seeder;

class LibroSeeder extends Seeder
{
    public function run(): void
    {
        $libros = [
            // PREMIUM BOOKS (5 items)
            [
                'titulo' => 'Cien años de soledad',
                'descripcion' => 'La historia de la familia Buendía a lo largo de varias generaciones en el pueblo ficticio de Macondo.',
                'autor' => 'Gabriel García Márquez',
                'imagen' => '/storage/media/libros/imagenes/cien.png',
                'pdf' => '/storage/media/libros/pdfs/1.pdf',
                'genero' => 'Realismo Mágico',
                'is_premium' => true,
                'tiene_derechos_autor' => true,
                'popularidad' => 98,
            ],
            [
                'titulo' => 'Don Quijote de la Mancha',
                'descripcion' => 'Un hidalgo enloquece leyendo libros de caballería y decide convertirse en caballero andante.',
                'autor' => 'Miguel de Cervantes Saavedra',
                'imagen' => '/storage/media/libros/imagenes/don.png',
                'pdf' => '/storage/media/libros/pdfs/don_quijote.pdf',
                'genero' => 'Novela',
                'is_premium' => true,
                'tiene_derechos_autor' => true,
                'popularidad' => 95,
            ],
            [
                'titulo' => '1984',
                'descripcion' => 'Una sociedad vigilada por el Gran Hermano donde el pensamiento libre está prohibido.',
                'autor' => 'George Orwell',
                'imagen' => '/storage/media/libros/imagenes/1984.png',
                'pdf' => '/storage/media/libros/pdfs/1984.pdf',
                'genero' => 'Distopía',
                'is_premium' => true,
                'tiene_derechos_autor' => true,
                'popularidad' => 92,
            ],
            [
                'titulo' => 'El Señor de los Anillos',
                'descripcion' => 'Un hobbit emprende una peligrosa misión para destruir un anillo poderoso.',
                'autor' => 'J. R. R. Tolkien',
                'imagen' => '/storage/media/libros/imagenes/anillos.png',
                'pdf' => '/storage/media/libros/pdfs/senor_anillos.pdf',
                'genero' => 'Fantasía',
                'is_premium' => true,
                'tiene_derechos_autor' => true,
                'popularidad' => 99,
            ],
            [
                'titulo' => 'Harry Potter y la Piedra Filosofal',
                'descripcion' => 'Un niño descubre que es mago y asiste a una escuela de magia.',
                'autor' => 'J. K. Rowling',
                'imagen' => '/storage/media/libros/imagenes/harry.png',
                'pdf' => '/storage/media/libros/pdfs/harry_potter.pdf',
                'genero' => 'Fantasía',
                'is_premium' => true,
                'tiene_derechos_autor' => true,
                'popularidad' => 97,
            ],
            
            // STANDARD BOOKS
            [
                'titulo' => 'El Principito',
                'descripcion' => 'Un relato poético sobre la amistad, el amor y el sentido de la vida.',
                'autor' => 'Antoine de Saint-Exupéry',
                'imagen' => '/storage/media/libros/imagenes/principito.png',
                'pdf' => '/storage/media/libros/pdfs/principito.pdf',
                'genero' => 'Fábula',
                'is_premium' => false,
                'tiene_derechos_autor' => false,
                'popularidad' => 90,
            ],
            [
                'titulo' => 'Crimen y castigo',
                'descripcion' => 'La lucha psicológica de un joven que comete un asesinato y enfrenta su culpa.',
                'autor' => 'Fiódor Dostoyevski',
                'imagen' => '/storage/media/libros/imagenes/crimen.png',
                'pdf' => '/storage/media/libros/pdfs/crimen_castigo.pdf',
                'genero' => 'Novela Psicológica',
                'is_premium' => false,
                'tiene_derechos_autor' => false,
                'popularidad' => 88,
            ],
            [
                'titulo' => 'La metamorfosis',
                'descripcion' => 'Un hombre despierta convertido en un insecto gigante, cambiando su vida y la de su familia.',
                'autor' => 'Franz Kafka',
                'imagen' => '/storage/media/libros/imagenes/meta.png',
                'pdf' => '/storage/media/libros/pdfs/metamorfosis.pdf',
                'genero' => 'Absurdo',
                'is_premium' => false,
                'tiene_derechos_autor' => false,
                'popularidad' => 85,
            ],
            [
                'titulo' => 'Orgullo y prejuicio',
                'descripcion' => 'Una historia de amor y diferencias sociales en la Inglaterra del siglo XIX.',
                'autor' => 'Jane Austen',
                'imagen' => '/storage/media/libros/imagenes/orgullo.png',
                'pdf' => '/storage/media/libros/pdfs/orgullo_prejuicio.pdf',
                'genero' => 'Romance',
                'is_premium' => false,
                'tiene_derechos_autor' => false,
                'popularidad' => 89,
            ],
            [
                'titulo' => 'Fahrenheit 451',
                'descripcion' => 'En un futuro donde los libros están prohibidos, los bomberos se encargan de quemarlos.',
                'autor' => 'Ray Bradbury',
                'imagen' => '/storage/media/libros/imagenes/fah.png',
                'pdf' => '/storage/media/libros/pdfs/fahrenheit_451.pdf',
                'genero' => 'Ciencia Ficción',
                'is_premium' => false,
                'tiene_derechos_autor' => false,
                'popularidad' => 87,
            ],
        ];

        foreach ($libros as $libro) {
            Libro::create($libro);
        }
    }
}

