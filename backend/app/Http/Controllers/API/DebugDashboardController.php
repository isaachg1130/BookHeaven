<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Models\Libro;
use App\Models\Manga;
use App\Models\Comic;
use App\Models\Audiobook;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * DebugDashboardController - Endpoint para generar datos de prueba en el dashboard
 * 
 * SOLO PARA DESARROLLO. Eliminar en producción.
 * 
 * Endpoints:
 * - GET /api/debug/dashboard/seed?count=100
 * - GET /api/debug/dashboard/clear
 * - GET /api/debug/dashboard/stats
 */
class DebugDashboardController
{
    /**
     * Generar datos de prueba para el dashboard
     * 
     * GET /api/debug/dashboard/seed?count=100&payments=30
     */
    public function seedData(Request $request): JsonResponse
    {
        // Solo en desarrollo
        if (config('app.env') === 'production') {
            return response()->json([
                'success' => false,
                'message' => 'Este endpoint no está disponible en producción'
            ], 403);
        }

        $count = (int) $request->query('count', 100);
        $paymentsCount = (int) $request->query('payments', 30);

        try {
            // Obtener datos base
            $users = User::where('is_active', true)->limit(15)->get();
            if ($users->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay usuarios activos disponibles'
                ], 400);
            }

            $libros = Libro::limit(20)->get()->toArray();
            $mangas = Manga::limit(20)->get()->toArray();
            $comics = Comic::limit(20)->get()->toArray();
            $audiobooks = Audiobook::limit(20)->get()->toArray();

            $contents = [
                'libro' => $libros,
                'manga' => $mangas,
                'comic' => $comics,
                'audiobook' => $audiobooks
            ];

            // Generar lecturas
            $createdReadings = 0;
            for ($i = 0; $i < $count; $i++) {
                $user = $users->random();
                
                $contentType = collect(array_keys($contents))->random();
                $contentList = $contents[$contentType];

                if (empty($contentList)) continue;

                $content = $contentList[array_rand($contentList)];
                $daysAgo = rand(0, 30);
                $createdAt = now()->subDays($daysAgo)->addHours(rand(0, 23))->addMinutes(rand(0, 59));

                $totalPages = match($contentType) {
                    'libro' => rand(150, 600),
                    'manga' => rand(50, 200),
                    'comic' => rand(30, 100),
                    'audiobook' => rand(120, 480),
                    default => 200
                };

                $pagesRead = rand(20, $totalPages);
                $progressPercentage = round(($pagesRead / $totalPages) * 100, 2);
                $readingTimeMinutes = rand(30, 300);
                $rating = rand(0, 5);
                $statuses = ['started', 'reading', 'completed', 'paused', 'abandoned'];
                $status = $statuses[array_rand($statuses)];

                DB::table('reading_history')->insert([
                    'user_id' => $user->id,
                    'content_type' => $contentType,
                    'content_id' => $content['id'],
                    'pages_read' => $pagesRead,
                    'total_pages' => $totalPages,
                    'reading_time_minutes' => $readingTimeMinutes,
                    'progress_percentage' => $progressPercentage,
                    'status' => $status,
                    'rating' => $rating ?: null,
                    'review' => $rating >= 4 ? "Contenido excelente" : null,
                    'started_at' => $createdAt,
                    'last_read_at' => $createdAt->copy()->addMinutes(rand(30, 300)),
                    'completed_at' => $status === 'completed' ? $createdAt->copy()->addDays(rand(1, 15)) : null,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                $createdReadings++;
            }

            // Generar pagos
            $createdPayments = 0;
            $premiumUsers = $users->random(min(3, $users->count()));

            for ($i = 0; $i < $paymentsCount; $i++) {
                $user = $premiumUsers instanceof \Illuminate\Database\Eloquent\Collection 
                    ? $premiumUsers->random() 
                    : $users->random();

                $daysAgo = rand(0, 30);
                $paidAt = now()->subDays($daysAgo)->addHours(rand(0, 23))->addMinutes(rand(0, 59));

                $amounts = [9.99, 19.99, 49.99];
                $amount = $amounts[array_rand($amounts)];

                DB::table('payments')->insert([
                    'user_id' => $user->id,
                    'transaction_id' => 'TXN_' . strtoupper(uniqid()),
                    'amount' => $amount,
                    'currency' => 'USD',
                    'status' => 'completed',
                    'plan_type' => 'premium',
                    'duration_days' => match($amount) {
                        9.99 => 7,
                        19.99 => 30,
                        49.99 => 365,
                        default => 30
                    },
                    'payment_method' => ['credit_card', 'debit_card', 'paypal'][array_rand(['credit_card', 'debit_card', 'paypal'])],
                    'response_data' => json_encode(['gateway' => 'stripe']),
                    'paid_at' => $paidAt,
                    'created_at' => $paidAt,
                    'updated_at' => $paidAt,
                ]);

                $createdPayments++;
            }

            return response()->json([
                'success' => true,
                'message' => 'Datos generados correctamente',
                'data' => [
                    'readings_created' => $createdReadings,
                    'payments_created' => $createdPayments,
                    'users_count' => $users->count(),
                    'total_revenue' => DB::table('payments')
                        ->where('status', 'completed')
                        ->where('plan_type', 'premium')
                        ->sum('amount'),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error seeding dashboard data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Limpiar datos de prueba
     * 
     * GET /api/debug/dashboard/clear
     */
    public function clearData(): JsonResponse
    {
        if (config('app.env') === 'production') {
            return response()->json([
                'success' => false,
                'message' => 'Este endpoint no está disponible en producción'
            ], 403);
        }

        try {
            $readingsDeleted = DB::table('reading_history')->delete();
            $paymentsDeleted = DB::table('payments')->delete();

            return response()->json([
                'success' => true,
                'message' => 'Datos eliminados correctamente',
                'data' => [
                    'readings_deleted' => $readingsDeleted,
                    'payments_deleted' => $paymentsDeleted,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ver estadísticas actuales
     * 
     * GET /api/debug/dashboard/stats
     */
    public function getStats(): JsonResponse
    {
        try {
            $readingCount = DB::table('reading_history')->count();
            $paymentCount = DB::table('payments')->where('status', 'completed')->count();
            $totalRevenue = DB::table('payments')
                ->where('status', 'completed')
                ->sum('amount');

            $readingsByType = DB::table('reading_history')
                ->selectRaw('content_type, COUNT(*) as count')
                ->groupBy('content_type')
                ->pluck('count', 'content_type')
                ->toArray();

            $revenueByDay = DB::table('payments')
                ->where('status', 'completed')
                ->selectRaw('DATE(paid_at) as date, SUM(amount) as total')
                ->where('paid_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_readings' => $readingCount,
                    'readings_by_type' => $readingsByType,
                    'total_payments' => $paymentCount,
                    'total_revenue' => round($totalRevenue, 2),
                    'avg_payment' => $paymentCount > 0 ? round($totalRevenue / $paymentCount, 2) : 0,
                    'daily_revenue' => $revenueByDay,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
