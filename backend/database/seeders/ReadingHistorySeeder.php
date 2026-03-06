<?php

namespace Database\Seeders;

use App\Models\ReadingHistory;
use App\Models\User;
use App\Models\Libro;
use App\Models\Manga;
use App\Models\Comic;
use App\Models\Audiobook;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ReadingHistorySeeder extends Seeder
{
    /**
     * Seed the application's database with reading history data
     * 
     * - 3-5 elementos leídos por usuario en últimos 12 meses
     * - Distribución realista: algunos leen más, otros menos
     * - Mix de materiales completados, en progreso, abandonados
     * - Calificaciones realistas basadas en tiempo de lectura
     */
    public function run(): void
    {
        $this->command->info('📚 Generando historial de lectura realista...');
        $this->command->newLine();

        // Obtener todos los usuarios (excepto admin)
        $usuarios = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['standard', 'premium']);
        })->get();

        // Obtener contenido disponible
        $libros = Libro::pluck('id')->toArray();
        $mangas = Manga::pluck('id')->toArray();
        $comics = Comic::pluck('id')->toArray();
        $audiobooks = Audiobook::pluck('id')->toArray();

        if (empty($libros) && empty($mangas) && empty($comics) && empty($audiobooks)) {
            $this->command->warn('⚠️ No hay contenido disponible para generar historial');
            return;
        }

        $contentAvailable = [
            'libro' => $libros,
            'manga' => $mangas,
            'comic' => $comics,
            'audiobook' => $audiobooks,
        ];

        // Definir distribuciones realistas
        $statuses = ['completed' => 60, 'reading' => 25, 'abandoned' => 10, 'paused' => 5];
        $contentTypeWeights = ['libro' => 40, 'manga' => 30, 'comic' => 20, 'audiobook' => 10];

        $totalReadings = 0;

        foreach ($usuarios as $usuario) {
            // Cada usuario leerá entre 3 y 8 elementos (distribución realista)
            $readingCount = $this->getRealisticReadingCount($usuario);

            for ($i = 0; $i < $readingCount; $i++) {
                // Seleccionar tipo de contenido de forma ponderada
                $contentType = $this->weightedRandom($contentTypeWeights);
                
                if (empty($contentAvailable[$contentType])) {
                    continue;
                }

                $contentId = $contentAvailable[$contentType][array_rand($contentAvailable[$contentType])];
                $status = $this->weightedRandom($statuses);

                // Generar fechas realistas en últimos 12 meses
                $startDate = Carbon::now()->subMonths(12);
                $endDate = Carbon::now();
                $startedAt = Carbon::createFromTimestamp(
                    rand($startDate->timestamp, $endDate->timestamp)
                );

                // Datos realistas de lectura
                $totalPages = rand(50, 500);
                
                if ($status === 'completed') {
                    $pagesRead = $totalPages;
                    $progressPercentage = 100;
                    $completedAt = $startedAt->copy()->addDays(rand(3, 30));
                    $lastReadAt = $completedAt;
                } elseif ($status === 'reading') {
                    $pagesRead = rand(10, $totalPages - 10);
                    $progressPercentage = round(($pagesRead / $totalPages) * 100, 2);
                    $completedAt = null;
                    $lastReadAt = Carbon::now()->subDays(rand(0, 7));
                } elseif ($status === 'abandoned') {
                    $pagesRead = rand(5, min(50, $totalPages));
                    $progressPercentage = round(($pagesRead / $totalPages) * 100, 2);
                    $completedAt = null;
                    $lastReadAt = $startedAt->copy()->addDays(rand(1, 5));
                } else { // paused
                    $pagesRead = rand(10, $totalPages - 10);
                    $progressPercentage = round(($pagesRead / $totalPages) * 100, 2);
                    $completedAt = null;
                    $lastReadAt = Carbon::now()->subDays(rand(8, 30));
                }

                // Calcular tiempo de lectura realista (minutos por página)
                $minutesPerPage = rand(1, 5); // Varies based on content difficulty
                $readingTimeMinutes = max(30, round($pagesRead * $minutesPerPage / 2));

                // Calificación solo si completado o bastante progresado
                $rating = null;
                if ($status === 'completed' || $progressPercentage >= 80) {
                    // Usuarios premium tienden a dar calificaciones más altas
                    $isPremium = $usuario->role?->name === 'premium';
                    $baseRating = $isPremium ? 4 : 3;
                    $rating = min(5, max(1, $baseRating + rand(-1, 2)));
                }

                ReadingHistory::create([
                    'user_id' => $usuario->id,
                    'content_type' => $contentType,
                    'content_id' => $contentId,
                    'pages_read' => $pagesRead,
                    'total_pages' => $totalPages,
                    'reading_time_minutes' => $readingTimeMinutes,
                    'progress_percentage' => $progressPercentage,
                    'status' => $status,
                    'rating' => $rating,
                    'review' => $rating ? $this->generateReview() : null,
                    'started_at' => $startedAt,
                    'last_read_at' => $lastReadAt,
                    'completed_at' => $completedAt,
                ]);

                $totalReadings++;
            }
        }

        $this->command->info('✅ ' . $totalReadings . ' registros de lectura creados');
        $this->command->newLine();

        // Mostrar estadísticas
        $this->displayStatistics();
    }

    /**
     * Obtener número realista de lecturas por usuario
     * Algunos usuarios leen más que otros
     */
    private function getRealisticReadingCount($usuario): int
    {
        $isPremium = $usuario->role?->name === 'premium';
        
        if ($isPremium) {
            // Premium users tend to read more
            $weights = [3 => 15, 4 => 25, 5 => 30, 6 => 20, 7 => 10];
        } else {
            // Standard users
            $weights = [2 => 10, 3 => 25, 4 => 35, 5 => 20, 6 => 10];
        }

        return $this->weightedRandom($weights);
    }

    /**
     * Seleccionar elemento de forma ponderada
     */
    private function weightedRandom(array $weights): string|int
    {
        $total = array_sum($weights);
        $rand = rand(1, $total);
        $running = 0;

        foreach ($weights as $item => $weight) {
            $running += $weight;
            if ($rand <= $running) {
                return $item;
            }
        }

        return array_key_first($weights);
    }

    /**
     * Generar reseña realista
     */
    private function generateReview(): string
    {
        $positiveReviews = [
            'Excelente lectura, muy entretenido.',
            'Me encantó, no podía dejar de leer.',
            'Muy bueno, recomendado.',
            'Hubo momentos algo lentos pero en general está bien.',
            'Buena trama pero el final decepcionó.',
            'Interesante perspectiva, muy bien escrito.',
            'Lectura rápida y divertida.',
            'Personajes bien desarrollados.',
            'Perfecto para pasar el tiempo.',
            'Imprescindible para fans del género.',
        ];

        return $positiveReviews[array_rand($positiveReviews)];
    }

    /**
     * Mostrar estadísticas del seeding
     */
    private function displayStatistics()
    {
        $this->command->info('📊 ESTADÍSTICAS DEL HISTORIAL:');
        $this->command->newLine();

        // Por estado
        $byStatus = ReadingHistory::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();
        
        $this->command->info('  Por estado:');
        foreach ($byStatus as $stat) {
            $this->command->line('    - ' . ucfirst($stat->status) . ': ' . $stat->count);
        }
        $this->command->newLine();

        // Por tipo de contenido
        $byContent = ReadingHistory::selectRaw('content_type, COUNT(*) as count')
            ->groupBy('content_type')
            ->get();
        
        $this->command->info('  Por tipo de contenido:');
        foreach ($byContent as $stat) {
            $this->command->line('    - ' . ucfirst($stat->content_type) . ': ' . $stat->count);
        }
        $this->command->newLine();

        // Promedio de progreso
        $avgProgress = ReadingHistory::avg('progress_percentage');
        $this->command->info('  Progreso promedio: ' . round($avgProgress, 2) . '%');
        $this->command->newLine();

        // Tiempo promedio de lectura
        $avgReadingTime = ReadingHistory::avg('reading_time_minutes');
        $hours = floor($avgReadingTime / 60);
        $minutes = intval($avgReadingTime) % 60;
        $this->command->info('  Tiempo promedio de lectura: ' . $hours . 'h ' . $minutes . 'm');
        $this->command->newLine();

        // Calificaciones
        $avgRating = ReadingHistory::whereNotNull('rating')->avg('rating');
        $this->command->info('  Calificación promedio: ' . round($avgRating, 2) . '/5 ⭐');
    }
}
