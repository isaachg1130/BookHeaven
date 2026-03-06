<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DebugController
{
    /**
     * Endpoint de debug para verificar el estado de autenticación
     */
    public function checkAuth(Request $request): JsonResponse
    {
        $user = $request->user();
        $sanctumUser = auth('sanctum')->user();
        $bearer_token = $request->bearerToken();
        
        return response()->json([
            'request_user' => $user ? [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role->name ?? 'unknown'
            ] : null,
            'sanctum_user' => $sanctumUser ? [
                'id' => $sanctumUser->id,
                'email' => $sanctumUser->email,
                'role' => $sanctumUser->role->name ?? 'unknown'
            ] : null,
            'bearer_token_present' => $bearer_token ? 'yes' : 'no',
            'auth_check' => auth('sanctum')->check() ? 'authenticated' : 'not_authenticated',
            'default_guard' => config('auth.defaults.guard'),
        ]);
    }
}
