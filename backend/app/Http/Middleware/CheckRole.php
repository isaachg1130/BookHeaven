<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (!$user || !$user->role || $user->role->name !== $role) {
            return response()->json([
                'message' => 'Acceso denegado. Se requiere el rol: ' . $role,
                'code' => 'INSUFFICIENT_ROLE',
            ], 403);
        }

        return $next($request);
    }
}
