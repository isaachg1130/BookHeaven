<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Libro;
use App\Models\Comic;
use App\Models\Manga;
use App\Models\Audiobook;
use App\Models\User;
use App\Models\ReadingHistory;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        // Obtener conteos de contenido en una sola query
        $contentCounts = DB::table('libros')
            ->selectRaw('
                "libro" as type,
                COUNT(*) as count
            ')
            ->union(
                DB::table('comics')
                    ->selectRaw('"comic" as type, COUNT(*) as count')
            )
            ->union(
                DB::table('mangas')
                    ->selectRaw('"manga" as type, COUNT(*) as count')
            )
            ->union(
                DB::table('audiobooks')
                    ->selectRaw('"audiobook" as type, COUNT(*) as count')
            )
            ->get()
            ->pluck('count', 'type')
            ->toArray();

        $librosCount = $contentCounts['libro'] ?? 0;
        $comicsCount = $contentCounts['comic'] ?? 0;
        $mangasCount = $contentCounts['manga'] ?? 0;
        $audiobooksCount = $contentCounts['audiobook'] ?? 0;

        $usuarios_con_demograficos = User::whereNotNull('date_of_birth')
            ->whereNotNull('gender')
            ->whereNotNull('country')
            ->count();

        $total_users = User::count();

        // Distribución por género
        $generos = User::whereNotNull('gender')
            ->groupBy('gender')
            ->selectRaw('gender, count(*) as total')
            ->pluck('total', 'gender')
            ->toArray();

        // Top 10 países
        $paises = User::whereNotNull('country')
            ->groupBy('country')
            ->selectRaw('country, count(*) as total')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->pluck('total', 'country')
            ->toArray();

        // Distribución por rango de edad (optimizada en BD)
        $edades = [
            '13-18' => 0,
            '19-25' => 0,
            '26-35' => 0,
            '36-50' => 0,
            '50+' => 0,
        ];

        $ageDistribution = User::whereNotNull('date_of_birth')
            ->selectRaw('
                CASE 
                    WHEN YEAR(CURDATE())-YEAR(date_of_birth) BETWEEN 13 AND 18 THEN "13-18"
                    WHEN YEAR(CURDATE())-YEAR(date_of_birth) BETWEEN 19 AND 25 THEN "19-25"
                    WHEN YEAR(CURDATE())-YEAR(date_of_birth) BETWEEN 26 AND 35 THEN "26-35"
                    WHEN YEAR(CURDATE())-YEAR(date_of_birth) BETWEEN 36 AND 50 THEN "36-50"
                    WHEN YEAR(CURDATE())-YEAR(date_of_birth) > 50 THEN "50+"
                END as rango,
                COUNT(*) as total
            ')
            ->groupBy('rango')
            ->pluck('total', 'rango')
            ->toArray();

        $edades = array_merge($edades, $ageDistribution);

        return response()->json([
            // Cards
            'libros' => $librosCount,
            'comics' => $comicsCount,
            'mangas' => $mangasCount,
            'audiobooks' => $audiobooksCount,
            'usuarios' => $total_users,
            'total_contenido' => $librosCount + $comicsCount + $mangasCount + $audiobooksCount,

            // Gráfica distribución
            'distribucion' => [
                'libros' => $librosCount,
                'comics' => $comicsCount,
                'mangas' => $mangasCount,
                'audiobooks' => $audiobooksCount,
            ],

            // Últimos agregados (solo campos necesarios)
            'ultimos' => [
                'libros' => Libro::latest()->select('id', 'titulo', 'autor', 'imagen', 'created_at')->take(5)->get(),
                'comics' => Comic::latest()->select('id', 'titulo', 'autor', 'imagen', 'created_at')->take(5)->get(),
                'mangas' => Manga::latest()->select('id', 'titulo', 'autor', 'imagen', 'created_at')->take(5)->get(),
                'audiobooks' => Audiobook::latest()->select('id', 'titulo', 'autor', 'narrador', 'imagen', 'created_at')->take(5)->get(),
            ],

            // Estadísticas demográficas
            'demograficas' => [
                'usuarios_con_datos' => $usuarios_con_demograficos,
                'porcentaje_completados' => $total_users > 0 
                    ? round(($usuarios_con_demograficos / $total_users) * 100, 2) 
                    : 0,
                'generos' => $generos,
                'paises_top' => $paises,
                'distribucion_edades' => $edades,
            ],

            // 📚 ESTADÍSTICAS DE LECTURA (cacheable)
            'lecturas' => cache()->remember('dashboard.reading_stats', 300, fn() => $this->getReadingStatistics()),
        ]);
    }

    /**
     * Obtener estadísticas de lectura
     */
    private function getReadingStatistics()
    {
        // Total de lecturas
        $totalReadings = ReadingHistory::count();
        
        // Por estado
        $byStatus = ReadingHistory::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
        
        // Por tipo de contenido
        $byContentType = ReadingHistory::selectRaw('content_type, COUNT(*) as count')
            ->groupBy('content_type')
            ->pluck('count', 'content_type')
            ->toArray();
        
        // Usuarios más activos (top lectores)
        $topReaders = ReadingHistory::selectRaw('user_id, COUNT(*) as reading_count')
            ->groupBy('user_id')
            ->orderByDesc('reading_count')
            ->limit(5)
            ->with('user:id,name,email')
            ->get()
            ->toArray();
        
        // Progreso promedio
        $avgProgress = ReadingHistory::avg('progress_percentage');
        
        // Tiempo promedio de lectura (en minutos)
        $avgReadingTime = ReadingHistory::avg('reading_time_minutes');
        
        // Calificación promedio
        $avgRating = ReadingHistory::whereNotNull('rating')->avg('rating');
        $ratingCount = ReadingHistory::whereNotNull('rating')->count();
        
        // Tasa de abandono (abandoned / total * 100)
        $abandonmentRate = $totalReadings > 0 
            ? round((($byStatus['abandoned'] ?? 0) / $totalReadings) * 100, 2) 
            : 0;
        
        // Progresión mensual de lecturas (últimos 12 meses)
        $monthlyReadings = ReadingHistory::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();
        
        // Género más leído globalmente (conectar con modelos de content)
        $topGenreByContent = ReadingHistory::selectRaw('content_type, COUNT(*) as count')
            ->groupBy('content_type')
            ->orderByDesc('count')
            ->first();
        
        // Contenido mejor calificado
        $topRatedContent = ReadingHistory::whereNotNull('rating')
            ->selectRaw('content_type, content_id, AVG(rating) as avg_rating, COUNT(*) as review_count')
            ->groupBy('content_type', 'content_id')
            ->orderByDesc('avg_rating')
            ->limit(5)
            ->get()
            ->toArray();
        
        return [
            'total_lecturas' => $totalReadings,
            'por_estado' => $byStatus,
            'por_tipo_contenido' => $byContentType,
            'usuarios_activos' => ReadingHistory::selectRaw('COUNT(DISTINCT user_id) as count')->first()->count ?? 0,
            'promedio_progreso' => round($avgProgress ?? 0, 2),
            'promedio_tiempo_lectura_minutos' => round($avgReadingTime ?? 0, 2),
            'calificacion_promedio' => round($avgRating ?? 0, 2),
            'resenas_totales' => $ratingCount,
            'tasa_abandono_porcentaje' => $abandonmentRate,
            'lecturas_completadas' => $byStatus['completed'] ?? 0,
            'lecturas_en_progreso' => $byStatus['reading'] ?? 0,
            'usuarios_top_lectores' => $topReaders,
            'lecturas_mensuales' => $monthlyReadings,
            'contenido_mas_popular' => $topGenreByContent?->content_type,
            'contenido_mejor_calificado' => $topRatedContent,
        ];
    }
}
