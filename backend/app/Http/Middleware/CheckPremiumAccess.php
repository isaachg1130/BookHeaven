<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPremiumAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || (!$user->isAdmin() && !$user->isPremium())) {
            return response()->json([
                'message' => 'Acceso denegado. Se requiere suscripción premium.',
                'code' => 'PREMIUM_REQUIRED',
            ], 403);
        }

        return $next($request);
    }
}
