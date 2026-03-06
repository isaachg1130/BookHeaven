<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * Middleware para validar y ajustar parámetros de paginación
 * Evita que se carguen demasiados registros y causa lag
 */
class ValidatePaginationParams
{
    // Límites máximos por endpoint
    private const MAX_PER_PAGE = [
        'content/libros' => 50,
        'content/mangas' => 50,
        'content/comics' => 50,
        'content/audiolibros' => 50,
        'admin/content' => 100, // Admins pueden cargar más
        'default' => 50,
    ];

    // Umbrales de advertencia en logs
    private const WARNING_THRESHOLD = 500;

    public function handle(Request $request, Closure $next)
    {
        $path = $request->path();
        $perPage = (int) $request->input('per_page', 20);

        // Determinar límite máximo según el endpoint
        $maxPerPage = $this->getMaxPaginationLimit($path);

        // Validar per_page
        if ($perPage > $maxPerPage) {
            Log::warning("Pagination limit exceeded for path: {$path}", [
                'requested' => $perPage,
                'allowed' => $maxPerPage,
                'user_id' => Auth::id(),
                'ip' => $request->ip(),
            ]);

            $request->merge(['per_page' => $maxPerPage]);
        }

        // Validar que per_page sea mínimo 1
        if ($perPage < 1) {
            $request->merge(['per_page' => 1]);
        }

        // Log si se carga una cantidad sospechosamente grande
        if ($perPage > self::WARNING_THRESHOLD) {
            Log::warning("Large pagination requested", [
                'per_page' => $perPage,
                'path' => $path,
                'user_id' => Auth::id(),
            ]);
        }

        return $next($request);
    }

    private function getMaxPaginationLimit(string $path): int
    {
        foreach (self::MAX_PER_PAGE as $pattern => $limit) {
            if ($pattern === 'default' && count(self::MAX_PER_PAGE) > 1) {
                continue; // Skip default en la iteración
            }

            if (strpos($path, $pattern) === 0) {
                return $limit;
            }
        }

        return self::MAX_PER_PAGE['default'];
    }
}
