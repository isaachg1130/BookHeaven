<?php
/**
 * Script para generar datos recientes y realistas en el dashboard
 * Ejecutar desde terminal: php seed_recent_dashboard_data.php
 */

require_once __DIR__ . '/backend/vendor/autoload.php';

$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

echo "\n========== GENERANDO DATOS RECIENTES DEL DASHBOARD ==========\n\n";

// Obtener usuarios premium (podrían tener pagos)
$premium_users = User::whereHas('role', fn($q) => $q->where('name', 'premium'))->limit(10)->get();

if ($premium_users->isEmpty()) {
    echo "⚠️  No hay usuarios premium para generar pagos.\n\n";
    exit(1);
}

echo "📍 Generando pagos realistas para los últimos 30 días...\n\n";

$count = 0;
$total_revenue = 0;

// Generar 15-25 pagos en los últimos 30 días
$payment_count = rand(15, 25);

for ($i = 0; $i < $payment_count; $i++) {
    $user = $premium_users->random();
    
    // Fecha aleatoria en los últimos 30 días
    $daysAgo = rand(0, 29);
    $hoursAgo = rand(0, 23);
    $minutesAgo = rand(0, 59);
    
    $paid_at = Carbon::now()
        ->subDays($daysAgo)
        ->subHours($hoursAgo)
        ->subMinutes($minutesAgo);
    
    // Monto premium típico ($9.99, $19.99, $29.99)
    $amounts = [9.99, 19.99, 29.99];
    $amount = $amounts[array_rand($amounts)];
    
    // Crear el pago
    try {
        // Comprobar que no exista un pago idéntico en la misma fecha
        $exists = Payment::where('user_id', $user->id)
            ->whereDate('paid_at', $paid_at->toDateString())
            ->exists();
        
        if (!$exists) {
            Payment::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'plan_type' => 'premium',
                'status' => 'completed',
                'transaction_id' => 'TXN_' . strtoupper(uniqid()) . '_' . time(),
                'paid_at' => $paid_at,
                'currency' => 'USD',
            ]);
            
            $count++;
            $total_revenue += $amount;
            
            echo "  ✅ Pago creado: {$user->name} - \${$amount} - {$paid_at->format('d/m/Y H:i')}\n";
        }
    } catch (\Exception $e) {
        echo "  ❌ Error creando pago: {$e->getMessage()}\n";
    }
}

echo "\n========== RESUMEN ==========\n";
echo "✅ {$count} pagos creados\n";
echo "💰 Ingresos generados: \$" . number_format($total_revenue, 2) . "\n\n";

// Mostrar resumen de ingresos por período
echo "📊 RESUMEN DE INGRESOS:\n";

$now = Carbon::now();

$today = (float) Payment::where('status', 'completed')
    ->whereDate('paid_at', $now->toDateString())
    ->sum('amount');

$this_week = (float) Payment::where('status', 'completed')
    ->whereBetween('paid_at', [
        $now->clone()->startOfWeek(),
        $now->clone()->endOfWeek()
    ])
    ->sum('amount');

$this_month = (float) Payment::where('status', 'completed')
    ->whereYear('paid_at', $now->year)
    ->whereMonth('paid_at', $now->month)
    ->sum('amount');

$all_time = (float) Payment::where('status', 'completed')->sum('amount');

echo "  ├─ Hoy: \$" . number_format($today, 2) . "\n";
echo "  ├─ Esta semana: \$" . number_format($this_week, 2) . "\n";
echo "  ├─ Este mes: \$" . number_format($this_month, 2) . "\n";
echo "  └─ Total (all-time): \$" . number_format($all_time, 2) . "\n\n";

echo "✅ Dashboard actualizado con datos recientes.\n\n";
?>
