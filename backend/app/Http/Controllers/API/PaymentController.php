<?php

namespace App\Http\Controllers\API;

use App\Models\Payment;
use App\Models\User;
use App\Models\Role;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;

class PaymentController extends Controller
{
    /**
     * Iniciar un pago para upgrade a premium
     */
    public function initiatePremiumPayment(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'duration_months' => 'required|integer|min:1|in:1,3,6,12',
            'payment_method' => 'required|string|in:credit_card,paypal,stripe',
        ]);

        // Calcular precio basado en meses
        $prices = [
            1 => 9.99,
            3 => 24.99,
            6 => 44.99,
            12 => 79.99,
        ];

        $amount = $prices[$validated['duration_months']];
        $durationDays = $validated['duration_months'] * 30;
        $transactionId = 'TXN-' . Str::random(16);

        try {
            // Crear registro de pago
            $payment = Payment::create([
                'user_id' => $user->id,
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'currency' => 'USD',
                'status' => 'pending',
                'plan_type' => 'premium',
                'duration_days' => $durationDays,
                'payment_method' => $validated['payment_method'],
            ]);

            // Log de actividad
            ActivityLog::log('create', $user, 'Payment', $payment->id, [
                'type' => 'premium_upgrade',
                'amount' => $amount,
                'duration_months' => $validated['duration_months'],
            ]);

            return response()->json([
                'message' => 'Pago iniciado',
                'payment' => $payment,
                'payment_url' => route('api.payment.complete', ['payment' => $payment->id]),
                'amount' => $amount,
                'currency' => 'USD',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al iniciar el pago',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Completar un pago (simulado)
     * En un sistema real, esto sería manejado por un webhook de Stripe, PayPal, etc.
     */
    public function completePayment(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();

        if ($payment->user_id !== $user->id) {
            return response()->json([
                'message' => 'No tienes permiso para completar este pago',
            ], 403);
        }

        if ($payment->status !== 'pending') {
            return response()->json([
                'message' => 'Este pago ya ha sido procesado',
            ], 422);
        }

        try {
            // Aquí irían las llamadas a APIs de pago externas (Stripe, PayPal, etc.)
            // Por ahora, simulamos un pago exitoso

            $validated = $request->validate([
                'token' => 'required|string', // Token de pago simulado
            ]);

            // Actualizar estado del pago
            $payment->update([
                'status' => 'completed',
                'paid_at' => now(),
                'response_data' => [
                    'token' => $validated['token'],
                    'gateway' => $payment->payment_method,
                    'timestamp' => now()->toDateTimeString(),
                ],
            ]);

            // Obtener el rol premium
            $premiumRole = Role::where('name', 'premium')->firstOrFail();

            // Actualizar el usuario a premium
            $premiumExpiresAt = now()->addDays($payment->duration_days);
            
            // Si el usuario ya es premium, extender su fecha
            if ($user->isPremium()) {
                $premiumExpiresAt = $user->premium_expires_at->addDays($payment->duration_days);
            }

            $user->update([
                'role_id' => $premiumRole->id,
                'premium_expires_at' => $premiumExpiresAt,
            ]);

            // Log de actividad
            ActivityLog::log('update', $user, 'User', $user->id, [
                'role' => 'premium',
                'premium_expires_at' => $premiumExpiresAt,
            ]);

            ActivityLog::log('complete', $user, 'Payment', $payment->id);

            return response()->json([
                'message' => 'Pago completado exitosamente. ¡Bienvenido a Premium!',
                'payment' => $payment,
                'user' => $user,
                'premium_expires_at' => $premiumExpiresAt,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al completar el pago',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener historial de pagos del usuario
     */
    public function getUserPayments(Request $request): JsonResponse
    {
        $user = $request->user();

        $payments = $user->payments()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($payments);
    }

    /**
     * Cancelar un pago pendiente
     */
    public function cancelPayment(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();

        if ($payment->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'message' => 'No tienes permiso para cancelar este pago',
            ], 403);
        }

        if ($payment->status !== 'pending') {
            return response()->json([
                'message' => 'Solo se pueden cancelar pagos pendientes',
            ], 422);
        }

        $payment->update(['status' => 'cancelled']);

        // Log de actividad
        ActivityLog::log('cancel', $user, 'Payment', $payment->id);

        return response()->json([
            'message' => 'Pago cancelado exitosamente',
            'payment' => $payment,
        ]);
    }

    /**
     * Obtener información de precios y planes
     */
    public function getPricingPlans(): JsonResponse
    {
        $plans = [
            [
                'id' => 'standard',
                'name' => 'Plan Estándar',
                'price' => 0,
                'currency' => 'USD',
                'duration_days' => null,
                'description' => 'Acceso a contenido no premium',
                'features' => [
                    'Acceso a libros, mangas y cómics estándar',
                    'Audiolibros estándar',
                    'Perfil personalizado',
                    'Uploads limitados',
                ],
            ],
            [
                'id' => 'premium_1month',
                'name' => 'Premium 1 Mes',
                'price' => 9.99,
                'currency' => 'USD',
                'duration_months' => 1,
                'duration_days' => 30,
                'description' => 'Acceso total por 1 mes',
                'features' => [
                    'Acceso a TODO el contenido premium',
                    'Audiolibros premium sin límites',
                    'Descargas offline (cuando esté disponible)',
                    'Sincronización de progreso',
                    'Sin anuncios',
                ],
            ],
            [
                'id' => 'premium_3months',
                'name' => 'Premium 3 Meses',
                'price' => 24.99,
                'currency' => 'USD',
                'duration_months' => 3,
                'duration_days' => 90,
                'description' => 'Mejor valor - Ahorra 10%',
                'features' => [
                    'Acceso a TODO el contenido premium',
                    'Audiolibros premium sin límites',
                    'Descargas offline (cuando esté disponible)',
                    'Sincronización de progreso',
                    'Sin anuncios',
                ],
            ],
            [
                'id' => 'premium_6months',
                'name' => 'Premium 6 Meses',
                'price' => 44.99,
                'currency' => 'USD',
                'duration_months' => 6,
                'duration_days' => 180,
                'description' => 'Mejor valor - Ahorra 25%',
                'features' => [
                    'Acceso a TODO el contenido premium',
                    'Audiolibros premium sin límites',
                    'Descargas offline (cuando esté disponible)',
                    'Sincronización de progreso',
                    'Sin anuncios',
                    'Acceso prioritario a nuevo contenido',
                ],
            ],
            [
                'id' => 'premium_1year',
                'name' => 'Premium 1 Año',
                'price' => 79.99,
                'currency' => 'USD',
                'duration_months' => 12,
                'duration_days' => 365,
                'description' => 'Mejor valor - Ahorra 33% + 2 Meses gratis',
                'features' => [
                    'Acceso a TODO el contenido premium',
                    'Audiolibros premium sin límites',
                    'Descargas offline (cuando esté disponible)',
                    'Sincronización de progreso',
                    'Sin anuncios',
                    'Acceso prioritario a nuevo contenido',
                    'Soporte por email prioritario',
                ],
            ],
        ];

        return response()->json(['plans' => $plans]);
    }

    /**
     * Relacionar Payment con User
     * Nota: Agregar esto en el modelo User
     */
    public function addPaymentRelation()
    {
        // Este método es solo para recordatorio.
        // Se debe agregar en el modelo User:
        // public function payments() { return $this->hasMany(Payment::class); }
    }
}
