<?php

namespace App\Services;

use App\Models\User;
use App\Models\Libro;
use App\Models\Manga;
use App\Models\Comic;
use App\Models\Audiobook;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * DashboardService - Lógica centralizada para el dashboard admin
 * 
 * Responsabilidades:
 * - Recolectar datos agregados de forma eficiente
 * - Evitar N+1 queries mediante eager loading
 * - Usar agregaciones SQL cuando sea posible
 * - Cachear datos si es necesario
 */
class AdminDashboardService
{
    /**
     * Obtener todos los datos del dashboard en una sola respuesta
     * 
     * Optimizaciones:
     * - Una query para usuarios totales + distribución por rol
     * - Agregaciones SQL para contar contenido
     * - Growth data de últimos 12 meses
     * - Usuarios recientes sin eager load innecesario
     * 
     * @return array
     */
    public function getDashboardData(): array
    {
        return [
            'summary' => $this->getSummary(),
            'growth_data' => $this->getUserGrowthData(),
            'content_distribution' => $this->getContentDistribution(),
            'recent_users' => $this->getRecentUsers(),
            'recent_content' => $this->getRecentContent(),
            'premium_stats' => $this->getPremiumStats(),
            'demographics' => $this->getDemographicsStats(),
            'reading_analytics' => $this->getReadingAnalytics(),
            'revenue_analytics' => $this->getRevenueAnalytics(),
        ];
    }

    /**
     * Resumen general: totales por categoría
     * 
     * Query optimizada: 1 query por tabla (4 total)
     */
    private function getSummary(): array
    {
        return [
            'total_users' => User::count(),
            'admin_count' => User::whereHas('role', function ($q) {
                $q->where('name', 'admin');
            })->count(),
            'premium_active_count' => User::whereHas('role', function ($q) {
                $q->where('name', 'premium');
            })->where(function ($q) {
                $q->whereNull('premium_expires_at')
                  ->orWhere('premium_expires_at', '>', now());
            })->count(),
            'standard_count' => User::whereHas('role', function ($q) {
                $q->where('name', 'standard');
            })->count(),
            'total_books' => Libro::count(),
            'total_mangas' => Manga::count(),
            'total_comics' => Comic::count(),
            'total_audiobooks' => Audiobook::count(),
        ];
    }

    /**
     * Crecimiento de usuarios en los últimos 12 meses
     * 
     * Query optimizada: 1 query con agregación GROUP BY
     */
    private function getUserGrowthData(): array
    {
        $months = collect();

        // Generar últimos 12 meses
        for ($i = 11; $i >= 0; $i--) {
            $months->push(Carbon::now()->subMonths($i));
        }

        // Una sola query con agregación
        $growth = User::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as count')
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get()
            // Clave SIN cero a la izquierda para coincidir con MONTH() que devuelve entero
            ->keyBy(fn($item) => "{$item->year}-{$item->month}");

        return $months->map(function ($date) use ($growth) {
            // MONTH() retorna int sin cero, usar 'Y-n' (n = mes sin cero inicial)
            $key = $date->format('Y-n');
            $count = optional($growth->get($key))->count ?? 0;

            return [
                'month'       => $date->format('M'),   // "Jan", "Feb"...
                'month_es'    => $this->monthNameEs($date->month), // "Ene", "Feb"...
                'month_num'   => (int) $date->format('n'),
                'year'        => (int) $date->format('Y'),
                'count'       => (int) $count,
            ];
        })->toArray();
    }

    private function monthNameEs(int $month): string
    {
        $names = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        return $names[$month - 1] ?? '';
    }

    /**
     * Distribución de contenido por tipo (INCLUYE AUDIOLIBROS)
     * 
     * Queries optimizadas: 4 queries de conteo simple
     * Total incluye todos los tipos: libros + mangas + cómics + audiolibros
     */
    private function getContentDistribution(): array
    {
        $libros = Libro::count();
        $mangas = Manga::count();
        $comics = Comic::count();
        $audiobooks = Audiobook::count();
        $total = $libros + $mangas + $comics + $audiobooks;

        return [
            'libros_count' => $libros,
            'mangas_count' => $mangas,
            'comics_count' => $comics,
            'audiobooks_count' => $audiobooks,
            'total_content' => $total,
            'libros_percent' => $total > 0 ? round(($libros / $total) * 100, 1) : 0,
            'mangas_percent' => $total > 0 ? round(($mangas / $total) * 100, 1) : 0,
            'comics_percent' => $total > 0 ? round(($comics / $total) * 100, 1) : 0,
            'audiobooks_percent' => $total > 0 ? round(($audiobooks / $total) * 100, 1) : 0,
            'books' => $libros,
            'mangas' => $mangas,
            'comics' => $comics,
            'audiobooks' => $audiobooks,
        ];
    }

    /**
     * Usuarios más recientes
     * 
     * Query optimizada:
     * - Select solo columnas necesarias
     * - Eager load relationship (role)
     * - Limit resultado
     */
    private function getRecentUsers(int $limit = 5): array
    {
        return User::with('role')
            ->select('id', 'name', 'email', 'role_id', 'created_at', 'is_active', 'last_login_at')
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => optional($user->role)->name ?? 'user',
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at?->toISOString(),
                'last_login_human' => $user->last_login_at?->diffForHumans() ?? 'Nunca',
                'status' => $this->resolveUserStatus($user),
                'joined' => $user->created_at->diffForHumans(),
            ])
            ->toArray();
    }

    /**
     * Determinar el estado real de un usuario basado en last_login_at e is_active
     */
    private function resolveUserStatus(User $user): string
    {
        if (!$user->is_active) return 'inactive';
        if (!$user->last_login_at) return 'never';

        $minutesSince = $user->last_login_at->diffInMinutes(now());
        $hoursSince   = $user->last_login_at->diffInHours(now());
        $daysSince    = $user->last_login_at->diffInDays(now());

        if ($minutesSince <= 15)  return 'online';
        if ($hoursSince   <= 24)  return 'recent';
        if ($daysSince    <= 7)   return 'away';

        return 'offline';
    }

    /**
     * Contenido más reciente (mixed)
     * 
     * Queries optimizadas:
     * - Select solo columnas necesarias
     * - No eager load si no es necesario
     * - Limit pequeño
     * - Incluye audiolibros
     */
    private function getRecentContent(int $limit = 5): array
    {
        $libros = Libro::select('id', 'titulo', 'autor', 'imagen', 'is_premium', 'created_at')
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'title' => $item->titulo,
                'autor' => $item->autor,
                'imagen' => $item->imagen,
                'type' => 'Libro',
                'content_type' => 'libro',
                'is_premium' => $item->is_premium,
                'created_at' => $item->created_at->diffForHumans(),
            ]);

        $mangas = Manga::select('id', 'titulo', 'autor', 'imagen', 'is_premium', 'created_at')
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'title' => $item->titulo,
                'autor' => $item->autor,
                'imagen' => $item->imagen,
                'type' => 'Manga',
                'content_type' => 'manga',
                'is_premium' => $item->is_premium,
                'created_at' => $item->created_at->diffForHumans(),
            ]);

        $comics = Comic::select('id', 'titulo', 'autor', 'imagen', 'is_premium', 'created_at')
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'title' => $item->titulo,
                'autor' => $item->autor,
                'imagen' => $item->imagen,
                'type' => 'Cómic',
                'content_type' => 'comic',
                'is_premium' => $item->is_premium,
                'created_at' => $item->created_at->diffForHumans(),
            ]);

        $audiobooks = Audiobook::select('id', 'titulo', 'imagen', 'is_premium', 'created_at')
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'title' => $item->titulo,
                'autor' => null,
                'imagen' => $item->imagen,
                'type' => 'Audiolibro',
                'content_type' => 'audiobook',
                'is_premium' => $item->is_premium,
                'created_at' => $item->created_at->diffForHumans(),
            ]);

        // Combinar y ordenar por más reciente
        return collect()
            ->merge($libros)
            ->merge($mangas)
            ->merge($comics)
            ->merge($audiobooks)
            ->sortByDesc('created_at')
            ->take($limit)
            ->values()
            ->toArray();
    }

    /**
     * Estadísticas de contenido premium y suscripciones
     * 
     * Queries optimizadas: agregaciones SQL
     */
    private function getPremiumStats(): array
    {
        $total_users = User::count();
        $premium_users = User::whereHas('role', function ($q) {
            $q->where('name', 'premium');
        })->where(function ($q) {
            $q->whereNull('premium_expires_at')
              ->orWhere('premium_expires_at', '>', now());
        })->count();

        $total_content = Libro::count() + Manga::count() + Comic::count() + Audiobook::count();
        $premium_content = Libro::where('is_premium', true)->count() 
                         + Manga::where('is_premium', true)->count()
                         + Comic::where('is_premium', true)->count()
                         + Audiobook::where('is_premium', true)->count();

        // Ingresos de suscripciones premium
        $premium_revenue = 0;
        $monthly_revenue = 0;
        $conversion_rate = 0;

        // Si existe tabla de pagos, calcular ingresos (usando plan_type y paid_at)
        if (DB::getSchemaBuilder()->hasTable('payments')) {
            // Total de ingresos premium
            $premium_revenue = floatval(DB::table('payments')
                ->where('status', 'completed')
                ->where('plan_type', 'premium')
                ->sum('amount') ?? 0);
                
            // Ingresos del mes actual
            $monthly_revenue = floatval(DB::table('payments')
                ->where('status', 'completed')
                ->where('plan_type', 'premium')
                ->whereYear('paid_at', date('Y'))
                ->whereMonth('paid_at', date('m'))
                ->sum('amount') ?? 0);
        }

        if ($total_users > 0) {
            $conversion_rate = round(($premium_users / $total_users) * 100, 2);
        }

        return [
            'premium_users' => $premium_users,
            'premium_content' => $premium_content,
            'standard_content' => $total_content - $premium_content,
            'conversion_rate' => $conversion_rate,
            'premium_revenue' => round($premium_revenue, 2),
            'monthly_revenue' => round($monthly_revenue, 2),
            'premium_percentage' => $total_content > 0 ? round(($premium_content / $total_content) * 100, 2) : 0,
        ];
    }

    /**
     * Estadísticas demográficas de usuarios
     * 
     * Queries optimizadas: agregaciones SQL para género, país y edad
     */
    private function getDemographicsStats(): array
    {
        $total_users = User::count();
        
        // Usuarios con datos demográficos completos
        $usuarios_con_demograficos = User::whereNotNull('date_of_birth')
            ->whereNotNull('gender')
            ->whereNotNull('country')
            ->count();

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

        // Distribución por rango de edad - usando método diferente según BD
        $edades = [
            '13-18' => 0,
            '19-25' => 0,
            '26-35' => 0,
            '36-50' => 0,
            '50+' => 0,
        ];

        // Obtener todos los usuarios con fecha de nacimiento para calcular edad en PHP
        $usuarios_con_fecha = User::whereNotNull('date_of_birth')
            ->select('date_of_birth')
            ->get();

        foreach ($usuarios_con_fecha as $usuario) {
            if ($usuario->date_of_birth) {
                $edad = $usuario->date_of_birth->age;
                if ($edad >= 13 && $edad <= 18) {
                    $edades['13-18']++;
                } elseif ($edad >= 19 && $edad <= 25) {
                    $edades['19-25']++;
                } elseif ($edad >= 26 && $edad <= 35) {
                    $edades['26-35']++;
                } elseif ($edad >= 36 && $edad <= 50) {
                    $edades['36-50']++;
                } elseif ($edad > 50) {
                    $edades['50+']++;
                }
            }
        }

        return [
            'usuarios_con_datos' => $usuarios_con_demograficos,
            'porcentaje_completados' => $total_users > 0 
                ? round(($usuarios_con_demograficos / $total_users) * 100, 2) 
                : 0,
            'generos' => $generos,
            'paises_top' => $paises,
            'distribucion_edades' => $edades,
        ];
    }

    /**
     * Análisis de lectura: Más leídos, menos leídos y top 10s
     * 
     * Query optimizada: Usa agregación de reading_history para contar vistas
     */
    private function getReadingAnalytics(): array
    {
        // Verificar si existe la tabla reading_history
        if (!DB::getSchemaBuilder()->hasTable('reading_history')) {
            return [
                'most_read' => [],
                'least_read' => [],
                'top_10_most_viewed' => [],
                'top_10_least_viewed' => [],
            ];
        }

        // Los más leídos (por cantidad de lectores únicos)
        $most_read = $this->getContentWithReadingStats()
            ->sortByDesc('reader_count')
            ->take(10)
            ->values()
            ->toArray();

        // Los menos leídos (por cantidad de lectores)
        $least_read = $this->getContentWithReadingStats()
            ->sortBy('reader_count')
            ->take(10)
            ->values()
            ->toArray();

        // Top 10 por sesiones de lectura (más vistos)
        $top_10_most_viewed = $this->getContentWithReadingStats()
            ->sortByDesc('total_sessions')
            ->take(10)
            ->values()
            ->toArray();

        // Top 10 menos vistos
        $top_10_least_viewed = $this->getContentWithReadingStats()
            ->sortBy('total_sessions')
            ->take(10)
            ->values()
            ->toArray();

        return [
            'most_read' => $most_read,
            'least_read' => $least_read,
            'top_10_most_viewed' => $top_10_most_viewed,
            'top_10_least_viewed' => $top_10_least_viewed,
        ];
    }

    /**
     * Helper: Obtener estadísticas de lectura de todo el contenido
     */
    private function getContentWithReadingStats(): \Illuminate\Support\Collection
    {
        // Obtener datos agregados de reading_history
        $reading_stats = DB::table('reading_history')
            ->selectRaw('content_type, content_id, COUNT(DISTINCT user_id) as reader_count, COUNT(*) as total_sessions, AVG(rating) as avg_rating')
            ->groupBy('content_type', 'content_id')
            ->get()
            ->keyBy(fn($item) => $item->content_type . '_' . $item->content_id);

        $content = collect();

        // Obtener libros con stats
        $libros = Libro::select('id', 'titulo', 'is_premium', 'imagen', 'autor')
            ->get()
            ->map(function ($libro) use ($reading_stats) {
                $key = 'libro_' . $libro->id;
                $stats = $reading_stats->get($key);
                return [
                    'id' => $libro->id,
                    'title' => $libro->titulo,
                    'type' => 'Libro',
                    'author' => $libro->autor,
                    'image' => $libro->imagen,
                    'is_premium' => $libro->is_premium,
                    'reader_count' => $stats?->reader_count ?? 0,
                    'total_sessions' => $stats?->total_sessions ?? 0,
                    'avg_rating' => round($stats?->avg_rating ?? 0, 1),
                ];
            });

        // Obtener mangas con stats
        $mangas = Manga::select('id', 'titulo', 'is_premium', 'imagen', 'autor')
            ->get()
            ->map(function ($manga) use ($reading_stats) {
                $key = 'manga_' . $manga->id;
                $stats = $reading_stats->get($key);
                return [
                    'id' => $manga->id,
                    'title' => $manga->titulo,
                    'type' => 'Manga',
                    'author' => $manga->autor,
                    'image' => $manga->imagen,
                    'is_premium' => $manga->is_premium,
                    'reader_count' => $stats?->reader_count ?? 0,
                    'total_sessions' => $stats?->total_sessions ?? 0,
                    'avg_rating' => round($stats?->avg_rating ?? 0, 1),
                ];
            });

        // Obtener cómics con stats
        $comics = Comic::select('id', 'titulo', 'is_premium', 'imagen', 'autor')
            ->get()
            ->map(function ($comic) use ($reading_stats) {
                $key = 'comic_' . $comic->id;
                $stats = $reading_stats->get($key);
                return [
                    'id' => $comic->id,
                    'title' => $comic->titulo,
                    'type' => 'Cómic',
                    'author' => $comic->autor,
                    'image' => $comic->imagen,
                    'is_premium' => $comic->is_premium,
                    'reader_count' => $stats?->reader_count ?? 0,
                    'total_sessions' => $stats?->total_sessions ?? 0,
                    'avg_rating' => round($stats?->avg_rating ?? 0, 1),
                ];
            });

        // Obtener audiolibros con stats
        $audiobooks = Audiobook::select('id', 'titulo', 'is_premium', 'imagen', 'autor')
            ->get()
            ->map(function ($audiobook) use ($reading_stats) {
                $key = 'audiobook_' . $audiobook->id;
                $stats = $reading_stats->get($key);
                return [
                    'id' => $audiobook->id,
                    'title' => $audiobook->titulo,
                    'type' => 'Audiolibro',
                    'author' => $audiobook->autor,
                    'image' => $audiobook->imagen,
                    'is_premium' => $audiobook->is_premium,
                    'reader_count' => $stats?->reader_count ?? 0,
                    'total_sessions' => $stats?->total_sessions ?? 0,
                    'avg_rating' => round($stats?->avg_rating ?? 0, 1),
                ];
            });

        return $libros->merge($mangas)->merge($comics)->merge($audiobooks);
    }

    /**
     * Análisis de ingresos por período
     * 
     * Query optimizada: Una query por período
     */
    private function getRevenueAnalytics(): array
    {
        if (!DB::getSchemaBuilder()->hasTable('payments')) {
            return [
                'today' => 0,
                'this_week' => 0,
                'this_month' => 0,
                'this_year' => 0,
                'all_time' => 0,
                'daily_breakdown' => [],
            ];
        }

        $now = Carbon::now();

        // Ingresos de hoy
        $today = floatval(DB::table('payments')
            ->where('status', 'completed')
            ->where('plan_type', 'premium')
            ->whereDate('paid_at', $now->toDateString())
            ->sum('amount') ?? 0);

        // Ingresos de esta semana
        $this_week = floatval(DB::table('payments')
            ->where('status', 'completed')
            ->where('plan_type', 'premium')
            ->whereBetween('paid_at', [
                $now->clone()->startOfWeek(),
                $now->clone()->endOfWeek()
            ])
            ->sum('amount') ?? 0);

        // Ingresos de este mes
        $this_month = floatval(DB::table('payments')
            ->where('status', 'completed')
            ->where('plan_type', 'premium')
            ->whereYear('paid_at', $now->year)
            ->whereMonth('paid_at', $now->month)
            ->sum('amount') ?? 0);

        // Ingresos de este año
        $this_year = floatval(DB::table('payments')
            ->where('status', 'completed')
            ->where('plan_type', 'premium')
            ->whereYear('paid_at', $now->year)
            ->sum('amount') ?? 0);

        // Ingresos totales
        $all_time = floatval(DB::table('payments')
            ->where('status', 'completed')
            ->where('plan_type', 'premium')
            ->sum('amount') ?? 0);

        // Desglose diario de los últimos 30 días
        $daily_breakdown = collect();
        for ($i = 29; $i >= 0; $i--) {
            $date = $now->clone()->subDays($i);
            $amount = floatval(DB::table('payments')
                ->where('status', 'completed')
                ->where('plan_type', 'premium')
                ->whereDate('paid_at', $date->toDateString())
                ->sum('amount') ?? 0);
            
            $daily_breakdown->push([
                'date' => $date->format('d/m'),
                'amount' => round($amount, 2),
            ]);
        }

        return [
            'today' => round($today, 2),
            'this_week' => round($this_week, 2),
            'this_month' => round($this_month, 2),
            'this_year' => round($this_year, 2),
            'all_time' => round($all_time, 2),
            'daily_breakdown' => $daily_breakdown->toArray(),
        ];
    }
}
