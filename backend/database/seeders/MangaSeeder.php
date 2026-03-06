<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Manga;

class MangaSeeder extends Seeder
{
    public function run(): void
    {
        $mangas = [
            // PREMIUM MANGAS (5 items)
            [
                'titulo' => 'One Piece',
                'descripcion' => 'Monkey D. Luffy viaja por los mares para encontrar el One Piece y convertirse en el Rey de los Piratas.',
                'autor' => 'Eiichiro Oda',
                'imagen' => '/storage/media/mangas/imagenes/one.png',
                'pdf' => '/storage/media/mangas/pdfs/one_piece.pdf',
                'genero' => 'Shonen',
                'is_premium' => true,
                'tiene_derechos_autor' => true,
                'popularidad' => 100,
            ],
            [
                'titulo' => 'Attack on Titan',
                'descripcion' => 'La humanidad lucha por sobrevivir contra gigantes devoradores de hombres conocidos como Titanes.',
                'autor' => 'Hajime Isayama',
                'imagen' => '/storage/media/mangas/imagenes/aot.png',
                'pdf' => '/storage/media/mangas/pdfs/aot.pdf',
                'genero' => 'Seinen',
                'is_premium' => true,
                'tiene_derechos_autor' => true,
                'popularidad' => 99,
            ],
            [
                'titulo' => 'Berserk',
                'descripcion' => 'Guts, un mercenario solitario, lucha contra demonios y su propio destino maldito.',
                'autor' => 'Kentaro Miura',
                'imagen' => '/storage/media/mangas/imagenes/berserk.png',
                'pdf' => '/storage/media/mangas/pdfs/berserk.pdf',
                'genero' => 'Fantasía Oscura',
                'is_premium' => true,
                'tiene_derechos_autor' => true,
                'popularidad' => 98,
            ],
            [
                'titulo' => 'Naruto',
                'descripcion' => 'Un joven ninja busca reconocimiento y sueña con convertirse en el Hokage de su aldea.',
                'autor' => 'Masashi Kishimoto',
                'imagen' => '/storage/media/mangas/imagenes/naruto.png',
                'pdf' => '/storage/media/mangas/pdfs/naruto.pdf',
                'genero' => 'Shonen',
                'is_premium' => true,
                'tiene_derechos_autor' => true,
                'popularidad' => 97,
            ],
            [
                'titulo' => 'Blue Lock',
                'descripcion' => 'Un grupo de jóvenes futbolistas compite en un programa de entrenamiento intensivo para convertirse en el mejor delantero del mundo.',
                'autor' => 'Muneyuki Kaneshiro',
                'imagen' => '/storage/media/mangas/imagenes/blue_lock.png',
                'pdf' => '/storage/media/mangas/pdfs/blue_lock.pdf',
                'genero' => 'Deportes',
                'is_premium' => true,
                'tiene_derechos_autor' => true,
                'popularidad' => 96,
            ],

            // STANDARD MANGAS
            [
                'titulo' => 'Death Note',
                'descripcion' => 'Un estudiante encuentra un cuaderno sobrenatural que le permite matar a cualquiera escribiendo su nombre.',
                'autor' => 'Tsugumi Ohba',
                'imagen' => '/storage/media/mangas/imagenes/death.png',
                'pdf' => '/storage/media/mangas/pdfs/death_note.pdf',
                'genero' => 'Thriller',
                'is_premium' => false,
                'tiene_derechos_autor' => false,
                'popularidad' => 95,
            ],
            [
                'titulo' => 'Date A Live',
                'descripcion' => 'Un chico debe hacer que misteriosas chicas con poderes llamadas Espíritus se enamoren de él para sellar sus habilidades y evitar desastres. Combina citas románticas con batallas sobrenaturales.',
                'autor' => 'Kohei Horikoshi',
                'imagen' => '/storage/media/mangas/imagenes/date.png',
                'pdf' => '/storage/media/mangas/pdfs/date_a_live.pdf',
                'genero' => 'Superhéroes',
                'is_premium' => false,
                'tiene_derechos_autor' => false,
                'popularidad' => 94,
            ],
            [
                'titulo' => 'Demon Slayer',
                'descripcion' => 'Un joven se convierte en cazador de demonios para vengar a su familia y curar a su hermana.',
                'autor' => 'Koyoharu Gotouge',
                'imagen' => '/storage/media/mangas/imagenes/demon.png',
                'pdf' => '/storage/media/mangas/pdfs/demon_slayer.pdf',
                'genero' => 'Acción',
                'is_premium' => false,
                'tiene_derechos_autor' => false,
                'popularidad' => 93,
            ],
            [
                'titulo' => 'Vinland Saga',
                'descripcion' => 'Un joven guerrero busca venganza y justicia en la era de los vikingos.',
                'autor' => 'Makoto Yukimura',
                'imagen' => '/storage/media/mangas/imagenes/vinland.png',
                'pdf' => '/storage/media/mangas/pdfs/vinland_saga.pdf',
                'genero' => 'Horror',
                'is_premium' => false,
                'tiene_derechos_autor' => false,
                'popularidad' => 92,
            ],
            [
                'titulo' => 'Dragon Ball',
                'descripcion' => 'Las aventuras de Goku mientras busca las Esferas del Dragón y lucha contra enemigos poderosos.',
                'autor' => 'Akira Toriyama',
                'imagen' => '/storage/media/mangas/imagenes/Dargo.png',
                'pdf' => '/storage/media/mangas/pdfs/dragon_ball.pdf',
                'genero' => 'Aventura',
                'is_premium' => false,
                'tiene_derechos_autor' => false,
                'popularidad' => 91,
            ],
        ];

        foreach ($mangas as $manga) {
            Manga::create($manga);
        }
    }
}
