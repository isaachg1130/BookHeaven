<?php

namespace Database\Factories;

use App\Models\Comic;
use Illuminate\Database\Eloquent\Factories\Factory;

class ComicFactory extends Factory
{
    protected $model = Comic::class;

    public function definition(): array
    {
        $comics = [
            [
                "nombre" => "Batman: The Killing Joke",
                "descripcion" => "Una de las historias más icónicas del Joker y Batman.",
                "autor" => "Alan Moore",
                "imagen" => "comics/batman_killing_joke.jpg",
                "pdf" => "comics/batman_killing_joke.pdf",
            ],
            [
                "nombre" => "Watchmen",
                "descripcion" => "Un mundo donde los superhéroes existen en la realidad.",
                "autor" => "Alan Moore",
                "imagen" => "comics/watchmen.jpg",
                "pdf" => "comics/watchmen.pdf",
            ],
            [
                "nombre" => "Spider-Man: Blue",
                "descripcion" => "Una historia emotiva de Peter Parker.",
                "autor" => "Jeph Loeb",
                "imagen" => "comics/spiderman_blue.jpg",
                "pdf" => "comics/spiderman_blue.pdf",
            ],
            [
                "nombre" => "Civil War",
                "descripcion" => "Los héroes se enfrentan por el registro de superhumanos.",
                "autor" => "Mark Millar",
                "imagen" => "comics/civil_war.jpg",
                "pdf" => "comics/civil_war.pdf",
            ],
            [
                "nombre" => "The Dark Knight Returns",
                "descripcion" => "Batman regresa después de años de retiro.",
                "autor" => "Frank Miller",
                "imagen" => "comics/dark_knight_returns.jpg",
                "pdf" => "comics/dark_knight_returns.pdf",
            ],
            [
                "nombre" => "V for Vendetta",
                "descripcion" => "Una historia de revolución y anarquía.",
                "autor" => "Alan Moore",
                "imagen" => "comics/v_for_vendetta.jpg",
                "pdf" => "comics/v_for_vendetta.pdf",
            ],
            [
                "nombre" => "Infinity Gauntlet",
                "descripcion" => "Thanos reúne las gemas del infinito.",
                "autor" => "Jim Starlin",
                "imagen" => "comics/infinity_gauntlet.jpg",
                "pdf" => "comics/infinity_gauntlet.pdf",
            ],
            [
                "nombre" => "Kingdom Come",
                "descripcion" => "Un futuro oscuro para los superhéroes.",
                "autor" => "Mark Waid",
                "imagen" => "comics/kingdom_come.jpg",
                "pdf" => "comics/kingdom_come.pdf",
            ],
            [
                "nombre" => "Sandman",
                "descripcion" => "El señor de los sueños y su reino.",
                "autor" => "Neil Gaiman",
                "imagen" => "comics/sandman.jpg",
                "pdf" => "comics/sandman.pdf",
            ],
            [
                "nombre" => "X-Men: Days of Future Past",
                "descripcion" => "Un futuro dominado por centinelas.",
                "autor" => "Chris Claremont",
                "imagen" => "comics/xmen_future_past.jpg",
                "pdf" => "comics/xmen_future_past.pdf",
            ],
        ];

        return $comics[array_rand($comics)];
    }
}
