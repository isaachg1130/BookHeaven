<?php

namespace App\Services;

use App\Models\ReadingHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReadingAnalyticsService
{
    /**
     * Obtener análisis de lectura por género
     * ¿Qué géneros leen las mujeres vs hombres?
     */
    public function getReadingByDemographics()
    {
        $analytics = [];

        foreach (['masculino', 'femenino', 'otro'] as $gender) {
            $userIds = User::where('gender', $gender)->pluck('id');

            if ($userIds->isEmpty()) {
                continue;
            }

            $contentTypes = ReadingHistory::whereIn('user_id', $userIds)
                ->selectRaw('content_type, COUNT(*) as count')
                ->groupBy('content_type')
                ->pluck('count', 'content_type')
                ->toArray();

            $avgProgress = ReadingHistory::whereIn('user_id', $userIds)
                ->avg('progress_percentage');

            $avgRating = ReadingHistory::whereIn('user_id', $userIds)
                ->whereNotNull('rating')
                ->avg('rating');

            $analytics[$gender] = [
                'usuarios' => $userIds->count(),
                'total_lecturas' => ReadingHistory::whereIn('user_id', $userIds)->count(),
                'promedio_progreso' => round($avgProgress ?? 0, 2),
                'calificacion_promedio' => round($avgRating ?? 0, 2),
                'preferencia_contenido' => $contentTypes,
            ];
        }

        return $analytics;
    }

    /**
     * Obtener análisis de lectura por rango de edad
     */
    public function getReadingByAgeRange()
    {
        $ranges = [
            '13-18' => [13, 18],
            '19-25' => [19, 25],
            '26-35' => [26, 35],
            '36-50' => [36, 50],
            '50+' => [51, 150],
        ];

        $analytics = [];

        foreach ($ranges as $rangeKey => [$minAge, $maxAge]) {
            $users = User::whereRaw("YEAR(CURDATE()) - YEAR(date_of_birth) BETWEEN ? AND ?", [$minAge, $maxAge])
                ->pluck('id');

            if ($users->isEmpty()) {
                continue;
            }

            $userIds = $users;

            $contentTypes = ReadingHistory::whereIn('user_id', $userIds)
                ->selectRaw('content_type, COUNT(*) as count')
                ->groupBy('content_type')
                ->pluck('count', 'content_type')
                ->toArray();

            $avgProgress = ReadingHistory::whereIn('user_id', $userIds)
                ->avg('progress_percentage');

            $avgRating = ReadingHistory::whereIn('user_id', $userIds)
                ->whereNotNull('rating')
                ->avg('rating');

            $completedRate = ReadingHistory::whereIn('user_id', $userIds)->count() > 0
                ? round((ReadingHistory::whereIn('user_id', $userIds)->where('status', 'completed')->count() / 
                        ReadingHistory::whereIn('user_id', $userIds)->count()) * 100, 2)
                : 0;

            $analytics[$rangeKey] = [
                'usuarios' => $userIds->count(),
                'total_lecturas' => ReadingHistory::whereIn('user_id', $userIds)->count(),
                'promedio_progreso' => round($avgProgress ?? 0, 2),
                'calificacion_promedio' => round($avgRating ?? 0, 2),
                'tasa_completación' => $completedRate,
                'preferencia_contenido' => $contentTypes,
            ];
        }

        return $analytics;
    }

    /**
     * Obtener análisis de lectura por país
     */
    public function getReadingByCountry()
    {
        $countryReadings = DB::table('reading_history')
            ->join('users', 'reading_history.user_id', '=', 'users.id')
            ->select(
                'users.country',
                DB::raw('COUNT(reading_history.id) as total_lecturas'),
                DB::raw('COUNT(DISTINCT users.id) as usuarios'),
                DB::raw('AVG(reading_history.progress_percentage) as promedio_progreso'),
                DB::raw('AVG(reading_history.reading_time_minutes) as promedio_tiempo'),
                DB::raw('AVG(reading_history.rating) as calificacion_promedio')
            )
            ->where('users.country', '!=', null)
            ->groupBy('users.country')
            ->orderByDesc('total_lecturas')
            ->limit(10)
            ->get()
            ->toArray();

        return $countryReadings;
    }

    /**
     * Obtener análisis premium vs standard
     */
    public function getReadingByUserType()
    {
        $analytics = [];

        foreach (['premium', 'standard'] as $role) {
            $userIds = User::whereHas('role', function ($q) use ($role) {
                $q->where('name', $role);
            })->pluck('id');

            if ($userIds->isEmpty()) {
                continue;
            }

            $totalReadings = ReadingHistory::whereIn('user_id', $userIds)->count();
            $completedReadings = ReadingHistory::whereIn('user_id', $userIds)
                ->where('status', 'completed')
                ->count();

            $analytics[$role] = [
                'usuarios' => $userIds->count(),
                'total_lecturas' => $totalReadings,
                'lecturas_completadas' => $completedReadings,
                'tasa_completación' => $totalReadings > 0 
                    ? round(($completedReadings / $totalReadings) * 100, 2) 
                    : 0,
                'promedio_progreso' => round(
                    ReadingHistory::whereIn('user_id', $userIds)->avg('progress_percentage') ?? 0,
                    2
                ),
                'calificacion_promedio' => round(
                    ReadingHistory::whereIn('user_id', $userIds)
                        ->whereNotNull('rating')
                        ->avg('rating') ?? 0,
                    2
                ),
                'promedio_tiempo_minutos' => round(
                    ReadingHistory::whereIn('user_id', $userIds)->avg('reading_time_minutes') ?? 0,
                    2
                ),
            ];
        }

        return $analytics;
    }

    /**
     * Obtener tendencias mensual es de lectura
     */
    public function getMonthlyTrends($months = 12)
    {
        return ReadingHistory::selectRaw('
            DATE_FORMAT(created_at, "%Y-%m") as month,
            COUNT(*) as total_lecturas,
            SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completadas,
            SUM(CASE WHEN status = "abandoned" THEN 1 ELSE 0 END) as abandonadas,
            AVG(progress_percentage) as promedio_progreso,
            AVG(rating) as calificacion_promedio
        ')
            ->where('created_at', '>=', now()->subMonths($months))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();
    }

    /**
     * Obtener contenido más popular por tipo
     */
    public function getPopularContent()
    {
        $contentTypes = ['libro', 'manga', 'comic', 'audiobook'];
        $allContent = [];

        foreach ($contentTypes as $type) {
            $tableName = match($type) {
                'libro' => 'libros',
                'manga' => 'mangas',
                'comic' => 'comics',
                'audiobook' => 'audiobooks',
            };

            $results = DB::table('reading_history')
                ->select(
                    'content_type',
                    'content_id',
                    DB::raw($tableName . '.titulo as title'),
                    DB::raw('COUNT(*) as lecturas_total'),
                    DB::raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as lecturas_completadas'),
                    DB::raw('AVG(rating) as calificacion_promedio'),
                    DB::raw('COUNT(DISTINCT user_id) as usuarios_unicos')
                )
                ->leftJoin($tableName, 'reading_history.content_id', '=', $tableName . '.id')
                ->where('content_type', $type)
                ->whereNotNull('rating')
                ->groupBy('content_type', 'content_id', $tableName . '.titulo')
                ->get();

            foreach ($results as $item) {
                $allContent[] = $item;
            }
        }

        // Ordenar por calificación promedio
        usort($allContent, function($a, $b) {
            return (float)$b->calificacion_promedio <=> (float)$a->calificacion_promedio;
        });

        // Limitar a 10
        return array_slice($allContent, 0, 10);
    }

    /**
     * Comparar preferencias de contenido por demográficos
     */
    public function compareContentPreferences()
    {
        $comparison = [
            'por_genero' => $this->getReadingByDemographics(),
            'por_edad' => $this->getReadingByAgeRange(),
            'por_pais' => $this->getReadingByCountry(),
            'por_tipo_usuario' => $this->getReadingByUserType(),
        ];

        return $comparison;
    }
}
