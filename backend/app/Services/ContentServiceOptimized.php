<?php

namespace App\Services;

use App\Models\User;
use App\Models\Libro;
use App\Models\Manga;
use App\Models\Comic;
use App\Models\Audiobook;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * ContentService - OPTIMIZADO para mejor rendimiento
 * 
 * OPTIMIZACIONES APLICADAS:
 * 1. Usa UNION queries a nivel de BD en lugar de cargar todo en memoria
 * 2. Implementa caching inteligente para búsquedas comunes
 * 3. Solo selecciona campos necesarios
 * 4. Lazy loading de relaciones
 */
class ContentServiceOptimized
{
    const CACHE_TTL = 300; // 5 minutos

    /**
     * Obtener contenido unificado - OPTIMIZADO
     */
    public function getUnifiedContent(?User $user, array $params = []): array
    {
        $perPage = (int) ($params['per_page'] ?? 20);
        $page = (int) ($params['page'] ?? 1);
        $categories = $params['categories'] ?? ['libro', 'manga', 'comic', 'audiobook'];
        $genres = $params['genres'] ?? [];
        $search = $params['search'] ?? null;
        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortOrder = $params['sort_order'] ?? 'desc';

        // Validaciones
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $perPage = min($perPage, 100);
        $perPage = max($perPage, 1);

        // Cargar role solo cuando es necesario
        if ($user && !$user->relationLoaded('role')) {
            $user->loadMissing('role');
        }

        $canViewPremium = $user && ($user->isAdmin() || $user->isPremium());

        // Generar cache key para búsquedas sin parámetros personalizados
        $cacheKey = null;
        if (!$search && empty($genres)) {
            $cacheKey = "content_unified_page_{$page}_{$perPage}_" . 
                       md5(implode(',', $categories) . $sortBy . $sortOrder . 
                           ($canViewPremium ? 'premium' : 'standard'));
            if ($cached = Cache::get($cacheKey)) {
                return $cached;
            }
        }

        $fields = ['id', 'titulo', 'autor', 'imagen', 'genero', 'is_premium', 'popularidad', 'created_at'];
        $queries = [];

        // Construir queries con UNION
        foreach ($categories as $category) {
            if ($category === 'libro') {
                $q = $this->buildLibroQuery($canViewPremium, $genres, $search)
                    ->select(DB::raw("'libro' as type"), 'libros.id', 'libros.titulo', 'libros.autor', 
                             'libros.imagen', 'libros.genero', 'libros.is_premium', 
                             'libros.popularidad', 'libros.created_at');
                $queries[] = $q;
            } elseif ($category === 'manga') {
                $q = $this->buildMangaQuery($canViewPremium, $genres, $search)
                    ->select(DB::raw("'manga' as type"), 'mangas.id', 'mangas.titulo', 'mangas.autor',
                             'mangas.imagen', 'mangas.genero', 'mangas.is_premium',
                             'mangas.popularidad', 'mangas.created_at');
                $queries[] = $q;
            } elseif ($category === 'comic') {
                $q = $this->buildComicQuery($canViewPremium, $genres, $search)
                    ->select(DB::raw("'comic' as type"), 'comics.id', 'comics.titulo', 'comics.autor',
                             'comics.imagen', 'comics.genero', 'comics.is_premium',
                             'comics.popularidad', 'comics.created_at');
                $queries[] = $q;
            } elseif ($category === 'audiobook') {
                $q = $this->buildAudiobookQuery($canViewPremium, $genres, $search)
                    ->select(DB::raw("'audiobook' as type"), 'audiobooks.id', 'audiobooks.titulo', 'audiobooks.autor',
                             'audiobooks.imagen', 'audiobooks.genero', 'audiobooks.is_premium',
                             'audiobooks.popularidad', 'audiobooks.created_at');
                $queries[] = $q;
            }
        }

        if (empty($queries)) {
            return $this->emptyResult($perPage, $page);
        }

        // Combinar con UNION y paginar a nivel de BD
        $unionQuery = array_shift($queries);
        foreach ($queries as $q) {
            $unionQuery->unionAll($q);
        }

        $unionQuery->orderBy($sortBy, $sortOrder);
        $paginated = $unionQuery->paginate($perPage, ['*'], 'page', $page);

        $result = [
            'data' => $paginated->items(),
            'pagination' => [
                'total' => $paginated->total(),
                'per_page' => $paginated->perPage(),
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'from' => $paginated->firstItem() ?? 0,
                'to' => $paginated->lastItem() ?? 0,
            ],
        ];

        // Cachear solo búsquedas estándar
        if ($cacheKey) {
            Cache::put($cacheKey, $result, self::CACHE_TTL);
        }

        return $result;
    }

    /**
     * Obtener contenido de una categoría - OPTIMIZADO
     */
    public function getCategoryContent(string $category, ?User $user, array $params = [])
    {
        $perPage = (int) ($params['per_page'] ?? 20);
        $perPage = min($perPage, 100);

        if ($user && !$user->relationLoaded('role')) {
            $user->loadMissing('role');
        }

        $canViewPremium = $user && ($user->isAdmin() || $user->isPremium());

        // Cache key para búsquedas estándar
        $cacheKey = null;
        if (!($params['search'] ?? null) && empty($params['genres'] ?? [])) {
            $cacheKey = "category_{$category}_page_" . ($params['page'] ?? 1) . "_{$perPage}_" .
                       md5(($params['sort_by'] ?? 'created_at') . 
                           ($params['sort_order'] ?? 'desc') .
                           ($canViewPremium ? 'p' : 's'));
            if ($cached = Cache::get($cacheKey)) {
                return $cached;
            }
        }

        $query = match ($category) {
            'libros' => $this->buildLibroQuery($canViewPremium, $params['genres'] ?? [], $params['search'] ?? null),
            'mangas' => $this->buildMangaQuery($canViewPremium, $params['genres'] ?? [], $params['search'] ?? null),
            'comics' => $this->buildComicQuery($canViewPremium, $params['genres'] ?? [], $params['search'] ?? null),
            'audiobooks' => $this->buildAudiobookQuery($canViewPremium, $params['genres'] ?? [], $params['search'] ?? null),
            default => null,
        };

        if (!$query) {
            return null;
        }

        // Seleccionar solo campos necesarios
        $query->select([
            'id', 'titulo', 'descripcion', 'autor', 'imagen', 
            'genero', 'is_premium', 'popularidad', 'created_at', 'uploaded_by'
        ])->with(['uploader:id,name,profile_photo_path']);

        $result = $query
            ->orderBy($params['sort_by'] ?? 'created_at', $params['sort_order'] ?? 'desc')
            ->paginate($perPage);

        if ($cacheKey) {
            Cache::put($cacheKey, $result, self::CACHE_TTL);
        }

        return $result;
    }

    /**
     * Construir query para Libros - OPTIMIZADA
     */
    private function buildLibroQuery(bool $canViewPremium, array $genres = [], ?string $search = null): Builder
    {
        $query = Libro::query();

        if (!$canViewPremium) {
            $query->where('is_premium', false);
        }

        if (!empty($genres)) {
            $query->whereIn('genero', $genres);
        }

        if ($search) {
            $search = "%{$search}%";
            $query->where(function (Builder $q) use ($search) {
                $q->where('titulo', 'like', $search)
                  ->orWhere('descripcion', 'like', $search)
                  ->orWhere('autor', 'like', $search);
            });
        }

        return $query;
    }

    /**
     * Construir query para Mangas - OPTIMIZADA
     */
    private function buildMangaQuery(bool $canViewPremium, array $genres = [], ?string $search = null): Builder
    {
        $query = Manga::query();

        if (!$canViewPremium) {
            $query->where('is_premium', false);
        }

        if (!empty($genres)) {
            $query->whereIn('genero', $genres);
        }

        if ($search) {
            $search = "%{$search}%";
            $query->where(function (Builder $q) use ($search) {
                $q->where('titulo', 'like', $search)
                  ->orWhere('descripcion', 'like', $search)
                  ->orWhere('autor', 'like', $search);
            });
        }

        return $query;
    }

    /**
     * Construir query para Comics - OPTIMIZADA
     */
    private function buildComicQuery(bool $canViewPremium, array $genres = [], ?string $search = null): Builder
    {
        $query = Comic::query();

        if (!$canViewPremium) {
            $query->where('is_premium', false);
        }

        if (!empty($genres)) {
            $query->whereIn('genero', $genres);
        }

        if ($search) {
            $search = "%{$search}%";
            $query->where(function (Builder $q) use ($search) {
                $q->where('titulo', 'like', $search)
                  ->orWhere('descripcion', 'like', $search)
                  ->orWhere('autor', 'like', $search);
            });
        }

        return $query;
    }

    /**
     * Construir query para Audiobooks - OPTIMIZADA
     */
    private function buildAudiobookQuery(bool $canViewPremium, array $genres = [], ?string $search = null): Builder
    {
        $query = Audiobook::query();

        if (!$canViewPremium) {
            $query->where('is_premium', false);
        }

        if (!empty($genres)) {
            $query->whereIn('genero', $genres);
        }

        if ($search) {
            $search = "%{$search}%";
            $query->where(function (Builder $q) use ($search) {
                $q->where('titulo', 'like', $search)
                  ->orWhere('descripcion', 'like', $search)
                  ->orWhere('autor', 'like', $search);
            });
        }

        return $query;
    }

    /**
     * Obtener estadísticas - OPTIMIZADO (resultado cacheado)
     */
    public function getContentStats(?User $user): array
    {
        $cacheKey = 'content_stats_' . ($user && $user->isAdmin() ? 'admin' : 'user');
        
        if ($cached = Cache::get($cacheKey)) {
            return $cached;
        }

        if ($user && !$user->relationLoaded('role')) {
            $user->loadMissing('role');
        }

        $canViewPremium = $user && ($user->isAdmin() || $user->isPremium());

        $stats = [
            'libros' => $this->getStats('Libro', $canViewPremium),
            'mangas' => $this->getStats('Manga', $canViewPremium),
            'comics' => $this->getStats('Comic', $canViewPremium),
            'audiobooks' => $this->getStats('Audiobook', $canViewPremium),
        ];

        $stats['total_content'] = array_sum(array_map(function($s) { return $s['available']; }, $stats));

        Cache::put($cacheKey, $stats, self::CACHE_TTL);
        return $stats;
    }

    /**
     * Helper para obtener estadísticas por modelo
     */
    private function getStats(string $modelClass, bool $canViewPremium): array
    {
        $modelClass = "App\\Models\\{$modelClass}";
        $total = $modelClass::count();
        $premium = $modelClass::where('is_premium', true)->count();
        $available = $canViewPremium ? $total : ($total - $premium);

        return [
            'total' => $total,
            'premium' => $premium,
            'available' => $available,
        ];
    }

    /**
     * Obtener contenido popular - OPTIMIZADO
     */
    public function getPopularContent(?User $user, int $limit = 10): array
    {
        $cacheKey = 'popular_content_' . $limit . '_' . ($user?->isAdmin() ? 'admin' : 'user');
        
        if ($cached = Cache::get($cacheKey)) {
            return $cached;
        }

        if ($user && !$user->relationLoaded('role')) {
            $user->loadMissing('role');
        }

        $canViewPremium = $user && ($user->isAdmin() || $user->isPremium());

        $result = [
            'libros' => $this->getPopularByModel('Libro', $limit, $canViewPremium),
            'mangas' => $this->getPopularByModel('Manga', $limit, $canViewPremium),
            'comics' => $this->getPopularByModel('Comic', $limit, $canViewPremium),
        ];

        Cache::put($cacheKey, $result, self::CACHE_TTL);
        return $result;
    }

    /**
     * Helper para obtener popular por modelo
     */
    private function getPopularByModel(string $modelClass, int $limit, bool $canViewPremium): array
    {
        $modelClass = "App\\Models\\{$modelClass}";
        $query = $modelClass::query();

        if (!$canViewPremium) {
            $query->where('is_premium', false);
        }

        return $query->orderBy('popularidad', 'desc')
                    ->limit($limit)
                    ->select(['id', 'titulo', 'autor', 'imagen', 'genero', 'is_premium', 'popularidad'])
                    ->get()
                    ->toArray();
    }

    /**
     * Helper para resultado vacío
     */
    private function emptyResult($perPage, $page): array
    {
        return [
            'data' => [],
            'pagination' => [
                'total' => 0,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => 0,
                'from' => 0,
                'to' => 0,
            ],
        ];
    }

    /**
     * Limpiar cache de contenido
     */
    public function clearCache(): void
    {
        // Limpiar caché de contenido
        Cache::flush(); // En producción, usar tagging más específico
    }
}
