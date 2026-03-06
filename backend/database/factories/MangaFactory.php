<?php

namespace Database\Factories;

use App\Models\Manga;
use Illuminate\Database\Eloquent\Factories\Factory;

class MangaFactory extends Factory
{
    protected $model = Manga::class;

    public function definition(): array
    {
        $mangas = [
            [
                "nombre" => "Naruto",
                "descripcion" => "La historia del ninja que quiere ser Hokage.",
                "autor" => "Masashi Kishimoto",
                "imagen" => "mangas/naruto.jpg",
                "pdf" => "mangas/naruto.pdf",
            ],
            [
                "nombre" => "One Piece",
                "descripcion" => "Piratas en busca del tesoro legendario.",
                "autor" => "Eiichiro Oda",
                "imagen" => "mangas/one_piece.jpg",
                "pdf" => "mangas/one_piece.pdf",
            ],
            [
                "nombre" => "Attack on Titan",
                "descripcion" => "La humanidad contra los titanes.",
                "autor" => "Hajime Isayama",
                "imagen" => "mangas/attack_on_titan.jpg",
                "pdf" => "mangas/attack_on_titan.pdf",
            ],
            [
                "nombre" => "Death Note",
                "descripcion" => "Un cuaderno que decide la muerte.",
                "autor" => "Tsugumi Ohba",
                "imagen" => "mangas/death_note.jpg",
                "pdf" => "mangas/death_note.pdf",
            ],
            [
                "nombre" => "Dragon Ball",
                "descripcion" => "Las aventuras de Goku.",
                "autor" => "Akira Toriyama",
                "imagen" => "mangas/dragon_ball.jpg",
                "pdf" => "mangas/dragon_ball.pdf",
            ],
            [
                "nombre" => "Bleach",
                "descripcion" => "Shinigamis y almas perdidas.",
                "autor" => "Tite Kubo",
                "imagen" => "mangas/bleach.jpg",
                "pdf" => "mangas/bleach.pdf",
            ],
            [
                "nombre" => "Tokyo Ghoul",
                "descripcion" => "Humanos y ghouls conviven en secreto.",
                "autor" => "Sui Ishida",
                "imagen" => "mangas/tokyo_ghoul.jpg",
                "pdf" => "mangas/tokyo_ghoul.pdf",
            ],
            [
                "nombre" => "Demon Slayer",
                "descripcion" => "Cazadores de demonios.",
                "autor" => "Koyoharu Gotouge",
                "imagen" => "mangas/demon_slayer.jpg",
                "pdf" => "mangas/demon_slayer.pdf",
            ],
            [
                "nombre" => "Fullmetal Alchemist",
                "descripcion" => "La alquimia y el precio de la ambición.",
                "autor" => "Hiromu Arakawa",
                "imagen" => "mangas/fullmetal.jpg",
                "pdf" => "mangas/fullmetal.pdf",
            ],
            [
                "nombre" => "Jujutsu Kaisen",
                "descripcion" => "Hechiceros contra maldiciones.",
                "autor" => "Gege Akutami",
                "imagen" => "mangas/jujutsu_kaisen.jpg",
                "pdf" => "mangas/jujutsu_kaisen.pdf",
            ],
        ];

        return $mangas[array_rand($mangas)];
    }
}
