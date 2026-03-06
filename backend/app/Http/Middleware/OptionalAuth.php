<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OptionalAuth
{
    /**
     * Intenta autenticar con Sanctum pero sin fallar si no hay usuario.
     * 
     * Este middleware permite que $request->user() devuelva el usuario autenticado
     * si hay un token Bearer válido, pero nunca lanza excepciones.
     */
    public function handle(Request $request, Closure $next)
    {
        // Establecer el guard a sanctum para esta petición
        Auth::setDefaultDriver('sanctum');
        
        // Intentar obtener el usuario del token
        // auth('sanctum')->user() no lanza error, solo retorna null si no hay usuario
        if (auth('sanctum')->check()) {
            // El usuario está autenticado y está disponible en auth()->user()
            // No necesitamos hacer nada más, continuamos
        }
        // Si no hay usuario, auth()->user() retornará null pero eso está bien

        return $next($request);
    }
}
