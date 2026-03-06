<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ReadingHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registrar un nuevo usuario
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

              // 📩 ENVIAR CORREO DE CONFIRMACIÓN
            $user->sendEmailVerificationNotification();

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Usuario registrado exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al registrar el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Iniciar sesión
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Verificar si faltan datos demográficos
        $needs_demographics = is_null($user->date_of_birth) || is_null($user->gender) || is_null($user->country);

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Sesión iniciada exitosamente',
            'needs_demographics' => $needs_demographics
        ], 200);
    }

    /**
     * Cerrar sesión
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ], 200);
    }

    /**
     * Obtener usuario actual
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Actualizar datos demográficos del usuario
     */
    public function updateDemographics(Request $request)
    {
        $validated = $request->validate([
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:masculino,femenino,otro',
            'country' => 'required|string|max:100',
        ]);

        try {
            $user = $request->user();
            $user->update($validated);

            return response()->json([
                'user' => $user,
                'message' => 'Datos demográficos actualizados exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar datos demográficos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de lectura del usuario
     */
    public function getUserStats(Request $request)
    {
        try {
            $user = $request->user();
            
            // Obtener historial de lectura agrupado por tipo de contenido
            $stats = ReadingHistory::where('user_id', $user->id)
                ->selectRaw('
                    content_type,
                    COUNT(DISTINCT content_id) as count,
                    SUM(reading_time_minutes) as total_minutes
                ')
                ->groupBy('content_type')
                ->get()
                ->keyBy('content_type');

            // Calcular totales
            $totalMinutes = ReadingHistory::where('user_id', $user->id)
                ->sum('reading_time_minutes');

            return response()->json([
                'libros' => $stats->has('libro') ? (int)$stats['libro']->count : 0,
                'mangas' => $stats->has('manga') ? (int)$stats['manga']->count : 0,
                'comics' => $stats->has('comic') ? (int)$stats['comic']->count : 0,
                'audiobooks' => $stats->has('audiobook') ? (int)$stats['audiobook']->count : 0,
                'horasLectura' => round($totalMinutes / 60, 1),
                'minutosLectura' => (int)$totalMinutes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}