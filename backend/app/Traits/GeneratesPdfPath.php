<?php

namespace App\Traits;

use Illuminate\Support\Str;

/**
 * Trait GeneratesPdfPath
 * 
 * Genera automáticamente rutas de PDF basadas en el título cuando no existe uno.
 * Uso en modelos:
 *   use GeneratesPdfPath;
 *   
 *   protected static function booted(): void
 *   {
 *       static::creating(function ($model) {
 *           $model->generatePdfIfEmpty('libros'); // o 'comics', 'mangas'
 *       });
 *   }
 */
trait GeneratesPdfPath
{
    /**
     * Convierte un título en un slug válido para nombre de archivo
     * 
     * @param string $titulo
     * @return string
     */
    protected function slugifyTitulo(string $titulo): string
    {
        return Str::slug($titulo, '_');
    }

    /**
     * Genera automáticamente la ruta del PDF si está vacío
     * 
     * @param string $contentType El tipo de contenido: 'libros', 'comics' o 'mangas'
     * @return void
     */
    public function generatePdfIfEmpty(string $contentType = 'libros'): void
    {
        // Si el PDF está vacío o null, generar uno basado en el título
        if (empty($this->pdf)) {
            $slug = $this->slugifyTitulo($this->titulo);
            $this->pdf = "/storage/media/{$contentType}/pdfs/{$slug}.pdf";
        }
    }

    /**
     * Genera automáticamente la ruta de la imagen si está vacío
     * 
     * @param string $contentType El tipo de contenido: 'libros', 'comics' o 'mangas'
     * @return void
     */
    public function generateImagenIfEmpty(string $contentType = 'libros'): void
    {
        // Si la imagen está vacía o null, generar una basada en el título
        if (empty($this->imagen)) {
            $slug = $this->slugifyTitulo($this->titulo);
            $this->imagen = "/storage/media/{$contentType}/imagenes/{$slug}.png";
        }
    }

    /**
     * Genera ambas rutas (PDF e imagen) si están vacías
     * 
     * @param string $contentType El tipo de contenido: 'libros', 'comics' o 'mangas'
     * @return void
     */
    public function generateMediaPathsIfEmpty(string $contentType = 'libros'): void
    {
        $this->generatePdfIfEmpty($contentType);
        $this->generateImagenIfEmpty($contentType);
    }
}
