<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController
{
    /**
     * Obtener lista de usuarios con paginación
     * GET /api/admin/users
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Validar que sea admin
        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'message' => 'Acceso denegado. Solo administradores.',
            ], 403);
        }

        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search', '');
            $roleFilter = $request->get('role', '');

            $query = User::with('role');

            // Búsqueda por nombre o email
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Filtro por rol
            if ($roleFilter) {
                $query->whereHas('role', function ($q) use ($roleFilter) {
                    $q->where('name', $roleFilter);
                });
            }

            $users = $query->orderBy('created_at', 'desc')
                          ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuarios: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener detalle de un usuario
     * GET /api/admin/users/{id}
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();

        // Validar que sea admin
        if (!$authUser || !$authUser->isAdmin()) {
            return response()->json([
                'message' => 'Acceso denegado. Solo administradores.',
            ], 403);
        }

        try {
            $user->load('role');

            return response()->json([
                'success' => true,
                'data' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuario: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Crear nuevo usuario
     * POST /api/admin/users
     */
    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();

        // Validar que sea admin
        if (!$authUser || !$authUser->isAdmin()) {
            return response()->json([
                'message' => 'Acceso denegado. Solo administradores.',
            ], 403);
        }

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'role_id' => 'required|exists:roles,id',
                'is_active' => 'boolean',
                'bio' => 'nullable|string|max:500',
            ]);

            // Hash password
            $validated['password'] = Hash::make($validated['password']);
            $validated['email_verified_at'] = now();
            $validated['is_active'] = $validated['is_active'] ?? true;

            $user = User::create($validated);
            $user->load('role');

            return response()->json([
                'success' => true,
                'message' => 'Usuario creado exitosamente',
                'data' => $user,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear usuario: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Actualizar usuario
     * PUT /api/admin/users/{id}
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();

        // Validar que sea admin
        if (!$authUser || !$authUser->isAdmin()) {
            return response()->json([
                'message' => 'Acceso denegado. Solo administradores.',
            ], 403);
        }

        try {
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'email' => [
                    'sometimes',
                    'required',
                    'email',
                    Rule::unique('users', 'email')->ignore($user->id),
                ],
                'password' => 'sometimes|required|string|min:8',
                'role_id' => 'sometimes|required|exists:roles,id',
                'is_active' => 'sometimes|boolean',
                'bio' => 'nullable|string|max:500',
                'premium_expires_at' => 'nullable|date',
            ]);

            // Hash password si fue proporcionado
            if (isset($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            $user->update($validated);
            $user->load('role');

            return response()->json([
                'success' => true,
                'message' => 'Usuario actualizado exitosamente',
                'data' => $user,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar usuario: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar usuario
     * DELETE /api/admin/users/{id}
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();

        // Validar que sea admin
        if (!$authUser || !$authUser->isAdmin()) {
            return response()->json([
                'message' => 'Acceso denegado. Solo administradores.',
            ], 403);
        }

        try {
            // Evitar que se elimine a sí mismo
            if ($authUser->id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes eliminar tu propia cuenta',
                ], 400);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Usuario eliminado exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar usuario: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener lista de roles disponibles
     * GET /api/admin/roles
     */
    public function getRoles(Request $request): JsonResponse
    {
        $user = $request->user();

        // Validar que sea admin
        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'message' => 'Acceso denegado. Solo administradores.',
            ], 403);
        }

        try {
            $roles = Role::all();

            return response()->json([
                'success' => true,
                'data' => $roles,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener roles: ' . $e->getMessage(),
            ], 500);
        }
    }
}
