<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\ActivityLog;
use App\Models\Payment;
use App\Models\Libro;
use App\Models\Manga;
use App\Models\Comic;
use App\Models\Audiobook;
use App\Services\AdminDashboardService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AdminController
{
    protected AdminDashboardService $dashboardService;

    public function __construct(AdminDashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Obtener datos completos del dashboard (optimizado)
     * 
     * GET /api/admin/dashboard
     * 
     * Retorna toda la información del dashboard en una sola respuesta
     * optimizada para evitar N+1 queries.
     */
    public function getDashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        // Validar que sea admin
        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo administradores.',
            ], 403);
        }

        try {
            $data = $this->dashboardService->getDashboardData();

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener datos del dashboard',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor',
            ], 500);
        }
    }

    /**
     * Obtener estadísticas del dashboard
     */
    public function getDashboardStats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->hasPermission('view_dashboard') && !$user->isAdmin()) {
            abort(403, 'No tienes permiso para ver el dashboard');
        }

        // Obtener conteos de contenido en una sola query (más rápido)
        $contentCounts = [
            'libros' => Libro::count(),
            'mangas' => Manga::count(),
            'comics' => Comic::count(),
            'audiobooks' => Audiobook::count(),
        ];

        $premiumContentCounts = [
            'libros' => Libro::where('is_premium', true)->count(),
            'mangas' => Manga::where('is_premium', true)->count(),
            'comics' => Comic::where('is_premium', true)->count(),
            'audiobooks' => Audiobook::where('is_premium', true)->count(),
        ];

        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::whereHas('role', function ($q) {
                $q->where('name', 'admin');
            })->count(),
            'total_premium_users' => User::whereHas('role', function ($q) {
                $q->where('name', 'premium');
            })->count(),
            'total_standard_users' => User::whereHas('role', function ($q) {
                $q->where('name', 'standard');
            })->count(),
            'total_libros' => $contentCounts['libros'],
            'total_mangas' => $contentCounts['mangas'],
            'total_comics' => $contentCounts['comics'],
            'total_audiobooks' => $contentCounts['audiobooks'],
            'total_premium_content' => array_sum($premiumContentCounts),
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'monthly_revenue' => Payment::where('status', 'completed')
                ->whereYear('paid_at', date('Y'))
                ->whereMonth('paid_at', date('m'))
                ->sum('amount'),
        ];

        // Contenido más visto - solo campos necesarios
        $mostViewed = [
            'libros' => Libro::orderBy('popularidad', 'desc')->select('id', 'titulo', 'popularidad')->limit(5)->get(),
            'mangas' => Manga::orderBy('popularidad', 'desc')->select('id', 'titulo', 'popularidad')->limit(5)->get(),
            'comics' => Comic::orderBy('popularidad', 'desc')->select('id', 'titulo', 'popularidad')->limit(5)->get(),
            'audiobooks' => Audiobook::orderBy('popularidad', 'desc')->select('id', 'titulo', 'popularidad')->limit(5)->get(),
        ];

        // Usuarios registrados por mes
        $usersByMonth = User::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        // Ingresos por mes
        $revenueByMonth = Payment::where('status', 'completed')
            ->selectRaw('MONTH(paid_at) as month, YEAR(paid_at) as year, SUM(amount) as total')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return response()->json([
            'stats' => $stats,
            'most_viewed' => $mostViewed,
            'users_by_month' => $usersByMonth,
            'revenue_by_month' => $revenueByMonth,
        ]);
    }

    /**
     * Crear un nuevo usuario
     */
    public function createUser(Request $request): JsonResponse
    {
        $request->user()->isAdmin() || abort(403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role_id' => $validated['role_id'],
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Log de actividad
        ActivityLog::log('create', $request->user(), 'User', $user->id, $validated);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'user' => $user->load('role'),
        ], 201);
    }

    /**
     * Asignar rol a un usuario
     */
    public function assignRole(Request $request, User $user): JsonResponse
    {
        $request->user()->isAdmin() || abort(403);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $oldRoleId = $user->role_id;
        $user->update(['role_id' => $validated['role_id']]);

        // Log de actividad
        ActivityLog::log('update', $request->user(), 'User', $user->id, [
            'role_id' => ['old' => $oldRoleId, 'new' => $validated['role_id']],
        ]);

        return response()->json([
            'message' => 'Rol asignado exitosamente',
            'user' => $user->load('role'),
        ]);
    }

    /**
     * Listar todos los usuarios
     */
    public function listUsers(Request $request): JsonResponse
    {
        $request->user()->isAdmin() || abort(403);

        $users = User::with('role')
            ->paginate($request->per_page ?? 20);

        return response()->json($users);
    }

    /**
     * Ver historial de pagos
     */
    public function getPaymentHistory(Request $request): JsonResponse
    {
        $request->user()->isAdmin() || abort(403);

        $payments = Payment::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($payments);
    }

    /**
     * Ver historial de actividades
     */
    public function getActivityLog(Request $request): JsonResponse
    {
        $request->user()->isAdmin() || abort(403);

        $activities = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 50);

        return response()->json($activities);
    }

    /**
     * Exportar reportes en PDF
     * Nota: Se requiere barryvdh/laravel-dompdf
     */
    public function exportPDF(Request $request)
    {
        $request->user()->isAdmin() || abort(403);

        $reportType = $request->query('type', 'general');

        // Esta es una estructura básica; se recomienda usar barryvdh/laravel-dompdf
        $data = match ($reportType) {
            'users' => ['users' => User::all()],
            'payments' => ['payments' => Payment::all()],
            'content' => [
                'libros' => Libro::all(),
                'mangas' => Manga::all(),
                'comics' => Comic::all(),
                'audiobooks' => Audiobook::all(),
            ],
            default => ['stats' => $this->getDashboardStats($request)->getData()],
        };

        // Se recomienda usar una librería como Dompdf con una vista para generar el PDF
        return response()->json([
            'message' => 'Para generar PDF, configura barryvdh/laravel-dompdf',
            'data' => $data,
        ]);
    }

    /**
     * Exportar reportes en Excel
     * Nota: Se requiere maatwebsite/excel
     */
    public function exportExcel(Request $request)
    {
        $request->user()->isAdmin() || abort(403);

        $reportType = $request->query('type', 'general');

        // Esta es una estructura básica; se recomienda usar maatwebsite/excel
        return response()->json([
            'message' => 'Para generar Excel, configura maatwebsite/excel',
        ]);
    }

    /**
     * Desactivar usuario
     */
    public function deactivateUser(Request $request, User $user): JsonResponse
    {
        $request->user()->isAdmin() || abort(403);

        $user->update(['is_active' => false]);

        // Log de actividad
        ActivityLog::log('update', $request->user(), 'User', $user->id, ['is_active' => false]);

        return response()->json([
            'message' => 'Usuario desactivado exitosamente',
            'user' => $user,
        ]);
    }

    /**
     * Activar usuario
     */
    public function activateUser(Request $request, User $user): JsonResponse
    {
        $request->user()->isAdmin() || abort(403);

        $user->update(['is_active' => true]);

        // Log de actividad
        ActivityLog::log('update', $request->user(), 'User', $user->id, ['is_active' => true]);

        return response()->json([
            'message' => 'Usuario activado exitosamente',
            'user' => $user,
        ]);
    }

    /**
     * Gestionar permisos de rol
     */
    public function manageRolePermissions(Request $request, Role $role): JsonResponse
    {
        $request->user()->isAdmin() || abort(403);

        $validated = $request->validate([
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role->permissions()->sync($validated['permission_ids']);

        // Log de actividad
        ActivityLog::log('update', $request->user(), 'Role', $role->id, [
            'permissions' => $validated['permission_ids'],
        ]);

        return response()->json([
            'message' => 'Permisos del rol actualizados exitosamente',
            'role' => $role->load('permissions'),
        ]);
    }

    /**
     * Obtener estadísticas de contenido PREMIUM (optimizado)
     */
    public function getPremiumContentStats(Request $request): JsonResponse
    {
        $request->user()->isAdmin() || abort(403);

        // Obtener conteos totales y premium en variables
        $librosTotal = Libro::count();
        $librosPremium = Libro::where('is_premium', true)->count();
        $mangasTotal = Manga::count();
        $mangasPremium = Manga::where('is_premium', true)->count();
        $comicsTotal = Comic::count();
        $comicsPremium = Comic::where('is_premium', true)->count();
        $audiobooksTotal = Audiobook::count();
        $audiobooksPremium = Audiobook::where('is_premium', true)->count();

        $stats = [
            'total_premium_content' => [
                'libros' => $librosPremium,
                'mangas' => $mangasPremium,
                'comics' => $comicsPremium,
                'audiobooks' => $audiobooksPremium,
                'total' => $librosPremium + $mangasPremium + $comicsPremium + $audiobooksPremium,
            ],
            'premium_content_percentage' => [
                'libros' => round(($librosPremium / max($librosTotal, 1)) * 100, 2),
                'mangas' => round(($mangasPremium / max($mangasTotal, 1)) * 100, 2),
                'comics' => round(($comicsPremium / max($comicsTotal, 1)) * 100, 2),
                'audiobooks' => round(($audiobooksPremium / max($audiobooksTotal, 1)) * 100, 2),
            ],
            'most_popular_premium' => [
                'libro' => Libro::where('is_premium', true)->orderBy('popularidad', 'desc')->select('id', 'titulo', 'popularidad', 'created_at')->first(),
                'manga' => Manga::where('is_premium', true)->orderBy('popularidad', 'desc')->select('id', 'titulo', 'popularidad', 'created_at')->first(),
                'comic' => Comic::where('is_premium', true)->orderBy('popularidad', 'desc')->select('id', 'titulo', 'popularidad', 'created_at')->first(),
                'audiobook' => Audiobook::where('is_premium', true)->orderBy('popularidad', 'desc')->select('id', 'titulo', 'popularidad', 'created_at')->first(),
            ],
            'premium_users_accessing' => User::whereHas('role', function ($q) {
                $q->where('name', 'premium');
            })->count(),
            'admin_users_with_access' => User::whereHas('role', function ($q) {
                $q->where('name', 'admin');
            })->count(),
        ];

        return response()->json([
            'message' => 'Estadísticas de contenido premium',
            'data' => $stats,
        ]);
    }
}

