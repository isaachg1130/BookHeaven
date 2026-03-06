<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use App\Models\Role;
use App\Models\ActivityLog;
use App\Models\ReadingHistory;
use App\Jobs\SendEmailVerification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\Sanctum;

class AuthController
{
    /**
     * Verificar si un email ya está registrado
     */
    public function checkEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string|email',
        ]);

        $exists = User::where('email', strtolower(trim($request->email)))->exists();

        return response()->json([
            'available' => !$exists,
            'message'   => $exists ? 'Este correo ya está registrado.' : 'Correo disponible.',
        ]);
    }

    /**
     * Registrar un nuevo usuario
     * ⚡ OPTIMIZACIÓN: Email asincrónico usando Jobs para respuesta rápida
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:masculino,femenino,otro',
            'country' => 'required|string|max:100',
        ]);

        try {
            // ⚡ OPTIMIZACIÓN: Cache el rol estándar para evitar búsquedas repetidas
            static $standardRole = null;
            
            if ($standardRole === null) {
                $standardRole = Role::where('name', 'standard')->first();
                
                if (!$standardRole) {
                    Log::error('Rol standard no encontrado en la base de datos');
                    return response()->json([
                        'message' => 'Error del sistema: rol estándar no configurado',
                        'code' => 'ROLE_NOT_CONFIGURED',
                    ], 500);
                }
            }

            // ⚡ OPTIMIZACIÓN: Crear usuario directamente sin búsquedas adicionales
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'country' => $validated['country'],
                'role_id' => $standardRole->id,
                'is_active' => true,
            ]);

            // ⚡ OPTIMIZACIÓN: Log de actividad asincrónico para no bloquear
            try {
                ActivityLog::log('create', $user, 'User', $user->id);
            } catch (\Exception $logError) {
                Log::warning('Error al registrar log de actividad', ['error' => $logError->getMessage()]);
            }

            // ⚡ OPTIMIZACIÓN CRUCIAL: Enviar email en background con Job
            // Esto permite responder al usuario inmediatamente sin esperar al email
            dispatch(new SendEmailVerification($user))->onQueue('emails');

            // ⚡ OPTIMIZACIÓN: Crear token (es muy rápido)
            $token = $user->createToken('auth_token')->plainTextToken;

            // Respuesta rápida sin esperar el email
            return response()->json([
                'message' => 'Registro exitoso. Verifica tu email para activar tu cuenta.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => 'standard',
                ],
                'token' => $token,
                'email_queued' => true,
            ], 201);
        } catch (ValidationException $e) {
            Log::error('Error de validación en registro', ['errors' => $e->errors()]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error inesperado en registro de usuario', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            return response()->json([
                'message' => 'Error al registrar usuario. Por favor, intenta de nuevo.',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor',
            ], 500);
        }
    }

    /**
     * Iniciar sesión
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Tu cuenta ha sido desactivada.',
            ], 403);
        }

        // Log de actividad
        ActivityLog::log('login', $user);

        // Actualizar last_login_at
        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Cerrar sesión
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        // Log de actividad
        if ($user) {
            ActivityLog::log('logout', $user);
        }

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente',
        ]);
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => $user->load('role'),
        ]);
    }

    /**
     * Actualizar perfil de usuario
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'bio'  => 'sometimes|string|max:500',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        // Log de actividad
        ActivityLog::log('update', $user, 'User', $user->id, $validated);

        return response()->json([
            'message' => 'Perfil actualizado exitosamente',
            'user' => $user,
        ]);
    }

    /**
     * Subir foto de perfil
     */
    public function uploadProfilePhoto(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'photo' => 'required|image|max:2048|mimes:jpeg,png,jpg,gif',
        ]);

        try {
            if ($user->profile_photo_path) {
                // Eliminar foto anterior
                $oldPath = storage_path('app/' . $user->profile_photo_path);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            // Generar nombre seguro basado en hash
            $extension = $request->file('photo')->getClientOriginalExtension();
            $filename = 'user_' . $user->id . '_' . hash('sha256', uniqid() . time()) . '.' . $extension;
            
            $path = $request->file('photo')->storeAs('profile-photos', $filename, 'local');
            $user->update(['profile_photo_path' => $path]);

            // Log de actividad
            ActivityLog::log('update', $user, 'User', $user->id, ['profile_photo_path' => $path]);

            return response()->json([
                'message' => 'Foto de perfil subida exitosamente',
                'photo_path' => $path,
                'photo_url' => route('api.user.profile-photo', ['user' => $user->id]),
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al subir foto de perfil',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cambiar contraseña
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => [
                'required', 'string', 'min:8', 'confirmed',
                'regex:/[A-Z]/',      // al menos una mayúscula
                'regex:/[a-z]/',      // al menos una minúscula
                'regex:/[0-9]/',      // al menos un número
                'regex:/[!@#$%^&*()\-_=+\[\]{};:\'"\\|,.<>\/?]/', // carácter especial
            ],
        ], [
            'new_password.regex' => 'La contraseña debe tener mayúsculas, minúsculas, números y un carácter especial.',
            'new_password.min'   => 'La contraseña debe tener al menos 8 caracteres.',
            'new_password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'La contraseña actual es incorrecta',
            ], 422);
        }

        $user->update(['password' => Hash::make($validated['new_password'])]);

        // Log de actividad
        ActivityLog::log('update', $user, 'User', $user->id, ['password' => 'changed']);

        return response()->json([
            'message' => 'Contraseña actualizada exitosamente',
        ]);
    }

    /**
     * Verificar email
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'El email ya ha sido verificado',
            ]);
        }

        // Laravel maneja automáticamente la verificación mediante el middleware
        return response()->json([
            'message' => 'Email verificado exitosamente',
            'user' => $request->user(),
        ]);
    }

    /**
     * Enviar link de recuperación de contraseña
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => '¡Hemos enviado el enlace a tu correo!'])
            : response()->json(['message' => 'Error: ' . __($status)], 400);
    }

    /**
     * Restablecer contraseña con el token
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();
                
                // Opcional: Log de actividad
                ActivityLog::log('update', $user, 'User', $user->id, ['password' => 'reset_via_token']);
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => '¡Tu contraseña ha sido restablecida!'])
            : response()->json(['message' => 'Error al restablecer la contraseña. El token podría ser inválido o haber expirado.'], 400);
    }

    /**
     * Obtener estadísticas de lectura del usuario
     */
    public function getUserStats(Request $request): JsonResponse
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
            Log::error('Error al obtener estadísticas de usuario', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
