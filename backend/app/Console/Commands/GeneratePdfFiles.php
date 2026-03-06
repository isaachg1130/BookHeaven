<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Libro;
use App\Models\Comic;
use App\Models\Manga;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class GeneratePdfFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:pdfs {--type=all}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Genera archivos PDF para libros, cómics y mangas que no tengan archivos reales';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $type = $this->option('type');

        $this->info('🚀 Iniciando generación de archivos PDF...');
        $this->newLine();

        $count = 0;

        if ($type === 'all' || $type === 'libros') {
            $count += $this->generateLibrosPdfs();
        }

        if ($type === 'all' || $type === 'comics') {
            $count += $this->generateComicsPdfs();
        }

        if ($type === 'all' || $type === 'mangas') {
            $count += $this->generateMangasPdfs();
        }

        $this->newLine();
        $this->info("✅ Generación completada: $count archivos PDF creados");
        $this->newLine();
    }

    /**
     * Generar PDFs para libros
     */
    private function generateLibrosPdfs(): int
    {
        $this->info('📚 Generando PDFs para Libros...');
        $libros = Libro::all();
        $count = 0;

        foreach ($libros as $libro) {
            if ($this->generatePdf('libros', $libro)) {
                $count++;
                $this->line("   ✓ {$libro->titulo}");
            }
        }

        $this->info("✅ {$count} PDFs de libros generados");
        $this->newLine();
        return $count;
    }

    /**
     * Generar PDFs para cómics
     */
    private function generateComicsPdfs(): int
    {
        $this->info('💥 Generando PDFs para Cómics...');
        $comics = Comic::all();
        $count = 0;

        foreach ($comics as $comic) {
            if ($this->generatePdf('comics', $comic)) {
                $count++;
                $this->line("   ✓ {$comic->titulo}");
            }
        }

        $this->info("✅ {$count} PDFs de cómics generados");
        $this->newLine();
        return $count;
    }

    /**
     * Generar PDFs para mangas
     */
    private function generateMangasPdfs(): int
    {
        $this->info('🎨 Generando PDFs para Mangas...');
        $mangas = Manga::all();
        $count = 0;

        foreach ($mangas as $manga) {
            if ($this->generatePdf('mangas', $manga)) {
                $count++;
                $this->line("   ✓ {$manga->titulo}");
            }
        }

        $this->info("✅ {$count} PDFs de mangas generados");
        $this->newLine();
        return $count;
    }

    /**
     * Generar un PDF individual
     */
    private function generatePdf(string $type, $model): bool
    {
        try {
            // Extraer nombre del archivo de la ruta PDF
            $pdfPath = $model->pdf;
            $filename = basename($pdfPath); // Ej: "watchmen.pdf"

            // Ruta completa donde guardar el archivo
            $directory = storage_path("../public/storage/media/{$type}/pdfs");
            $fullPath = "{$directory}/{$filename}";

            // No regenerar si ya existe
            if (file_exists($fullPath)) {
                return false;
            }

            // Crear directorio si no existe
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            // Generar contenido HTML
            $html = $this->generatePdfContent($type, $model);

            // Generar PDF usando DomPDF
            $pdf = Pdf::loadHTML($html)
                ->setPaper('a4')
                ->setOption('defaultFont', 'Helvetica')
                ->setOption('isHtml5ParserEnabled', true);

            // Guardar archivo
            $pdf->save($fullPath);

            return true;
        } catch (\Exception $e) {
            $this->error("Error generando PDF para {$model->titulo}: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Generar contenido HTML para el PDF
     */
    private function generatePdfContent(string $type, $model): string
    {
        $imageUrl = $model->imagen ?? '';
        $titulo = htmlspecialchars($model->titulo);
        $autor = htmlspecialchars($model->autor);
        $descripcion = htmlspecialchars($model->descripcion);
        $genero = htmlspecialchars($model->genero);
        $popularidad = $model->popularidad;
        $premium = $model->is_premium ? '✓ PREMIUM' : 'Estándar';

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background-color: white;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 30px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
        }
        h1 {
            font-size: 32px;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .cover-image {
            text-align: center;
            margin: 30px 0;
        }
        .cover-image img {
            max-width: 250px;
            height: auto;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .metadata {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 5px;
            margin: 30px 0;
        }
        .metadata-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .metadata-row:last-child {
            border-bottom: none;
        }
        .metadata-label {
            font-weight: bold;
            color: #374151;
        }
        .metadata-value {
            color: #6b7280;
        }
        .premium-badge {
            background-color: #fbbf24;
            color: #78350f;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
        }
        .popularity {
            color: #ef4444;
            font-weight: bold;
        }
        .description {
            background-color: #ecfdf5;
            padding: 20px;
            border-left: 4px solid #10b981;
            margin: 30px 0;
            border-radius: 3px;
        }
        .description-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #047857;
        }
        .description-text {
            color: #374151;
            line-height: 1.8;
        }
        .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            color: #999;
            font-size: 11px;
        }
        .footer-date {
            margin-top: 5px;
        }
        .type-label {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">BookHeaven</div>
            <div class="type-label">$type</div>
            <h1>$titulo</h1>
        </div>

        <div class="cover-image">
            {$this->getImageHtml($imageUrl)}
        </div>

        <div class="metadata">
            <div class="metadata-row">
                <span class="metadata-label">Autor:</span>
                <span class="metadata-value">$autor</span>
            </div>
            <div class="metadata-row">
                <span class="metadata-label">Género:</span>
                <span class="metadata-value">$genero</span>
            </div>
            <div class="metadata-row">
                <span class="metadata-label">Estado:</span>
                <span class="metadata-value">
                    <span class="premium-badge">$premium</span>
                </span>
            </div>
            <div class="metadata-row">
                <span class="metadata-label">Popularidad:</span>
                <span class="metadata-value"><span class="popularity">$popularidad/100</span></span>
            </div>
        </div>

        <div class="description">
            <div class="description-title">Sinopsis</div>
            <div class="description-text">$descripcion</div>
        </div>

        <div class="footer">
            <p>Este documento fue generado automáticamente por BookHeaven</p>
            <div class="footer-date">Fecha: " . now()->format('d/m/Y H:i') . "</div>
        </div>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Generar HTML para imagen
     */
    private function getImageHtml(string $imageUrl): string
    {
        if (empty($imageUrl)) {
            return '<div style="background-color: #e5e7eb; width: 200px; height: 300px; margin: 0 auto; display: flex; align-items: center; justify-content: center; border-radius: 5px;">
                <span style="color: #999; text-align: center;">Sin imagen disponible</span>
            </div>';
        }

        return "<img src=\"{$imageUrl}\" alt=\"Portada\" />";
    }
}
