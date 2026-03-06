<?php

namespace Database\Factories;

use App\Models\Libro;
use Illuminate\Database\Eloquent\Factories\Factory;

class LibroFactory extends Factory
{
    protected $model = Libro::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->sentence(3),
            'descripcion' => $this->faker->text(200),
            'autor' => $this->faker->name(),
            'imagen' => 'libros/' . $this->faker->uuid . '.jpg',
            'pdf' => 'libros/' . $this->faker->uuid . '.pdf',
        ];
    }
}
