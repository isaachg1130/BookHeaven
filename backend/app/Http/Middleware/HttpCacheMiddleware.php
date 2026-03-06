<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware para agregar cache HTTP headers a las respuestas
 * Mejora el rendimiento del navegador al cachear respuestas de API
 */
class HttpCacheMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $maxAge = 300): Response
    {
        $response = $next($request);

        // Solo aplicar cache a respuestas exitosas GET
        if ($request->isMethod('GET') && $response->isSuccessful()) {
            // Generar ETag basado en el contenido
            $content = $response->getContent();
            $etag = md5($content);
            
            // Verificar si el cliente tiene una versión cacheada
            $requestEtag = $request->header('If-None-Match');
            
            if ($requestEtag && $requestEtag === $etag) {
                // El cliente tiene la versión más reciente
                return response('', 304)
                    ->header('ETag', $etag)
                    ->header('Cache-Control', "public, max-age={$maxAge}");
            }
            
            // Agregar headers de cache
            $response->headers->set('Cache-Control', "public, max-age={$maxAge}");
            $response->headers->set('ETag', $etag);
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            
            // Agregar Vary header para respuestas basadas en autenticación
            if ($request->bearerToken()) {
                $response->headers->set('Vary', 'Authorization');
            }
        }

        return $response;
    }
}
