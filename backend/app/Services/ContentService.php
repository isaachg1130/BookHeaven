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
 * ContentService - Servicio centralizado para gestión de contenido
 * 
 * Responsabilidades:
 * - Unificar lógica de queries para todas las categorías
 * - Aplicar filtros de acceso (premium/estándar) automáticamente
 * - Optimizar queries con eager loading
 * - Aplicar paginación consistente
 * - Cachear resultados cuando sea apropiado
 */
class ContentService
{
    /**
     * Obtener contenido unificado de todas las categorías
     * Optimizado: evita cargar todo en memoria de forma innecesaria
     */
    public function getUnifiedContent(?User $user, array $params = []): array
    {
        // Parámetros por defecto
        $perPage = (int) ($params['per_page'] ?? 20);
        $page = (int) ($params['page'] ?? 1);
        $categories = $params['categories'] ?? ['libro', 'manga', 'comic', 'audiobook'];
        $genres = $params['genres'] ?? [];
        $search = $params['search'] ?? null;
        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortOrder = $params['sort_order'] ?? 'desc';

        // Validar parámetros
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $perPage = min($perPage, 100);
        $perPage = max($perPage, 1);

        $canViewPremium = $user && ($user->isAdmin() || $user->isPremium());

        // Construcción de queries por categoría - solo campos necesarios
        $queries = [];
        $fields = ['id', 'titulo', 'autor', 'imagen', 'genero', 'is_premium', 'popularidad', 'created_at'];

        if (in_array('libro', $categories)) {
            $queries['libro'] = $this->buildLibroQuery($canViewPremium, $genres, $search)->select($fields);
        }

        if (in_array('manga', $categories)) {
            $queries['manga'] = $this->buildMangaQuery($canViewPremium, $genres, $search)->select($fields);
        }

        if (in_array('comic', $categories)) {
            $queries['comic'] = $this->buildComicQuery($canViewPremium, $genres, $search)->select($fields);
        }

        if (in_array('audiobook', $categories)) {
            $queries['audiobook'] = $this->buildAudiobookQuery($canViewPremium, $genres, $search)->select($fields);
        }

        // Si no hay queries, retornar vacío
        if (empty($queries)) {
            return ['data' => [], 'pagination' => [
                'total' => 0, 'per_page' => $perPage, 'current_page' => $page,
                'last_page' => 0, 'from' => 0, 'to' => 0,
            ]];
        }

        // Obtener todos los resultados e identificar tipo
        $mergedResults = [];
        $typeMap = ['libro', 'manga', 'comic', 'audiobook'];
        
        foreach ($queries as $type => $query) {
            $results = $query->get();
            foreach ($results as $item) {
                $item->type = $type;
                $mergedResults[] = $item;
            }
        }

        // Obtener total antes de paginar
        $total = count($mergedResults);

        // Ordenar en memoria (optimizado: solo si hay resultados)
        if ($total > 0) {
            usort($mergedResults, function ($a, $b) use ($sortBy, $sortOrder) {
                $valueA = $a->{$sortBy} ?? '';
                $valueB = $b->{$sortBy} ?? '';

                if ($valueA == $valueB) return 0;
                
                $comparison = $valueA < $valueB ? -1 : 1;
                return $sortOrder === 'desc' ? -$comparison : $comparison;
            });
        }

        // Aplicar paginación
        $startIndex = ($page - 1) * $perPage;
        $paginatedResults = array_slice($mergedResults, $startIndex, $perPage);

        return [
            'data' => $paginatedResults,
            'pagination' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($total / $perPage),
                'from' => $total > 0 ? $startIndex + 1 : 0,
                'to' => min($startIndex + $perPage, $total),
            ],
        ];
    }

    /**
     * Obtener contenido de una categoría específica con optimizaciones
     */
    public function getCategoryContent(string $category, ?User $user, array $params = [])
    {
        $perPage = (int) ($params['per_page'] ?? 20);
        $perPage = min($perPage, 100);
        $canViewPremium = $user && ($user->isAdmin() || $user->isPremium());

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

        return $query
            ->select([
                'id', 'titulo', 'descripcion', 'autor', 'imagen', 
                'genero', 'is_premium', 'popularidad', 'created_at', 'uploaded_by'
            ])
            ->with(['uploader:id,name,profile_photo_path'])
            ->orderBy($params['sort_by'] ?? 'created_at', $params['sort_order'] ?? 'desc')
            ->paginate($perPage);
    }

    /**
     * Construir query optimizada para Libros
     */
    private function buildLibroQuery(bool $canViewPremium, array $genres = [], ?string $search = null): Builder
    {
        $query = Libro::query();

        // Filtro de premium/estándar
        if (!$canViewPremium) {
            $query->where('is_premium', false);
        }

        // Filtro de géneros
        if (!empty($genres)) {
            $query->whereIn('genero', $genres);
        }

        // Búsqueda
        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('titulo', 'like', "%$search%")
                    ->orWhere('descripcion', 'like', "%$search%")
                    ->orWhere('autor', 'like', "%$search%");
            });
        }

        return $query;
    }

    /**
     * Construir query optimizada para Mangas
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
            $query->where(function (Builder $q) use ($search) {
                $q->where('titulo', 'like', "%$search%")
                    ->orWhere('descripcion', 'like', "%$search%")
                    ->orWhere('autor', 'like', "%$search%");
            });
        }

        return $query;
    }

    /**
     * Construir query optimizada para Comics
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
            $query->where(function (Builder $q) use ($search) {
                $q->where('titulo', 'like', "%$search%")
                    ->orWhere('descripcion', 'like', "%$search%")
                    ->orWhere('autor', 'like', "%$search%");
            });
        }

        return $query;
    }

    /**
     * Construir query optimizada para Audiobooks
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
            $query->where(function (Builder $q) use ($search) {
                $q->where('titulo', 'like', "%$search%")
                    ->orWhere('descripcion', 'like', "%$search%")
                    ->orWhere('autor', 'like', "%$search%");
            });
        }

        return $query;
    }

    /**
     * Determinar el tipo de item
     */
    private function getItemType($item): string
    {
        if ($item instanceof Libro) {
            return 'libro';
        } elseif ($item instanceof Manga) {
            return 'manga';
        } elseif ($item instanceof Comic) {
            return 'comic';
        } elseif ($item instanceof Audiobook) {
            return 'audiobook';
        }
        return 'unknown';
    }

    /**
     * Obtener estadísticas de contenido optimizadas
     */
    public function getContentStats(?User $user): array
    {
        $canViewPremium = $user && ($user->isAdmin() || $user->isPremium());

        return [
            'total_content' => $this->countByCategory($canViewPremium),
            'libros' => [
                'total' => Libro::count(),
                'available' => $canViewPremium ? Libro::count() : Libro::where('is_premium', false)->count(),
                'premium' => Libro::where('is_premium', true)->count(),
            ],
            'mangas' => [
                'total' => Manga::count(),
                'available' => $canViewPremium ? Manga::count() : Manga::where('is_premium', false)->count(),
                'premium' => Manga::where('is_premium', true)->count(),
            ],
            'comics' => [
                'total' => Comic::count(),
                'available' => $canViewPremium ? Comic::count() : Comic::where('is_premium', false)->count(),
                'premium' => Comic::where('is_premium', true)->count(),
            ],
            'audiobooks' => [
                'total' => Audiobook::count(),
                'available' => $canViewPremium ? Audiobook::count() : Audiobook::where('is_premium', false)->count(),
                'premium' => Audiobook::where('is_premium', true)->count(),
            ],
        ];
    }

    /**
     * Contar contenido disponible por categoría
     */
    private function countByCategory(bool $canViewPremium): int
    {
        $count = Libro::count() + Manga::count() + Comic::count() + Audiobook::count();

        if (!$canViewPremium) {
            $count = 
                Libro::where('is_premium', false)->count() +
                Manga::where('is_premium', false)->count() +
                Comic::where('is_premium', false)->count() +
                Audiobook::where('is_premium', false)->count();
        }

        return $count;
    }

    /**
     * Obtener contenido popular
     */
    public function getPopularContent(?User $user, int $limit = 10): array
    {
        $canViewPremium = $user && ($user->isAdmin() || $user->isPremium());

        $libros = Libro::query();
        if (!$canViewPremium) {
            $libros->where('is_premium', false);
        }
        $libros = $libros->orderBy('popularidad', 'desc')->limit($limit)->get();

        $mangas = Manga::query();
        if (!$canViewPremium) {
            $mangas->where('is_premium', false);
        }
        $mangas = $mangas->orderBy('popularidad', 'desc')->limit($limit)->get();

        $comics = Comic::query();
        if (!$canViewPremium) {
            $comics->where('is_premium', false);
        }
        $comics = $comics->orderBy('popularidad', 'desc')->limit($limit)->get();

        return [
            'libros' => $libros,
            'mangas' => $mangas,
            'comics' => $comics,
        ];
    }
}
