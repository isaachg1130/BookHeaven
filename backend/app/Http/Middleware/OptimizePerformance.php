<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * OPTIMIZACIÓN: Middleware para agregar HTTP caching headers y optimizaciones de rendimiento
 * 
 * Este middleware:
 * 1. Agrega Cache-Control headers para static assets
 * 2. Agrega ETag para validación de caché
 * 3. Compresión de respuestas
 * 4. Otros headers de optimización
 */
class OptimizePerformance
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // OPTIMIZACIÓN: Caching headers para assets estáticos
        if ($this->isStaticAsset($request)) {
            $response->header('Cache-Control', 'public, max-age=31536000, immutable'); // 1 año para assets versionados
            $response->header('X-Content-Type-Options', 'nosniff');
        }

        // OPTIMIZACIÓN: Caching para contenido dinámico (pero cacheable)
        if ($request->method() === 'GET' && !$request->user()) {
            // Solo cachear contenido público sin autenticación
            if ($this->isCacheableContent($request)) {
                $response->header('Cache-Control', 'public, max-age=3600'); // 1 hora
            }
        }

        // OPTIMIZACIÓN: Headers generales de seguridad y optimización
        $response->header('X-Frame-Options', 'SAMEORIGIN');
        $response->header('X-XSS-Protection', '1; mode=block');
        $response->header('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // OPTIMIZACIÓN: Comprensión (gzip)
        $response->header('Vary', 'Accept-Encoding');

        // OPTIMIZACIÓN: ETag para validación de caché del lado del cliente
        if ($response->isSuccessful() && in_array($response->headers->get('Content-Type'), [
            'application/json',
            'text/html; charset=UTF-8',
        ])) {
            $etag = md5($response->getContent());
            $response->setEtag($etag);
            $response->setCache([
                'etag' => $etag,
                'public' => true,
                'max_age' => 3600,
            ]);
        }

        return $response;
    }

    /**
     * Determinar si una solicitud es para un asset estático
     */
    private function isStaticAsset(Request $request): bool
    {
        $path = $request->path();
        
        // Assets versionados (con hash)
        return preg_match('/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf|otf)-[a-f0-9]{8}\.[a-z0-9]+$/', $path) ||
               preg_match('/^(css|js|images|fonts|vendor)\//', $path);
    }

    /**
     * Determinar si el contenido es cacheable
     */
    private function isCacheableContent(Request $request): bool
    {
        $path = $request->path();
        
        // Rutas públicas que se pueden cachear
        $cacheablePaths = [
            'api/content/libros',
            'api/content/mangas',
            'api/content/comics',
            'api/content/audiolibros',
            'api/payments/plans',
            'api/reviews',
        ];

        foreach ($cacheablePaths as $pattern) {
            if (strpos($path, $pattern) === 0) {
                return true;
            }
        }

        return false;
    }
}
