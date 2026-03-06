<?php
/**
 * Script para verificar datos en el dashboard
 * Ejecutar desde terminal: php verify_dashboard_data.php
 */

require_once __DIR__ . '/backend/vendor/autoload.php';

$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Libro;
use App\Models\Manga;
use App\Models\Comic;
use App\Models\Audiobook;
use App\Models\Payment;
use App\Models\ReadingSession;
use Illuminate\Support\Facades\DB;

echo "\n========== VERIFICACIÓN DE DATOS DEL DASHBOARD ==========\n\n";

// 1. Usuarios
echo "📊 USUARIOS:\n";
$total_users = User::count();
$premium_users = User::whereHas('role', fn($q) => $q->where('name', 'premium'))->count();
$admin_users = User::whereHas('role', fn($q) => $q->where('name', 'admin'))->count();
$standard_users = User::whereHas('role', fn($q) => $q->where('name', 'standard'))->count();

echo "  ├─ Total: $total_users\n";
echo "  ├─ Premium: $premium_users\n";
echo "  ├─ Admin: $admin_users\n";
echo "  └─ Standard: $standard_users\n\n";

// 2. Contenido
echo "📚 CONTENIDO:\n";
$libs = Libro::count();
$mangas = Manga::count();
$comics = Comic::count();
$audiobooks = Audiobook::count();
$total_content = $libs + $mangas + $comics + $audiobooks;

echo "  ├─ Libros: $libs\n";
echo "  ├─ Mangas: $mangas\n";
echo "  ├─ Cómics: $comics\n";
echo "  └─ Audiolibros: $audiobooks\n";
echo "  └─ TOTAL: $total_content\n\n";

// 3. Premium Content
echo "🌟 CONTENIDO PREMIUM:\n";
$premium_libs = Libro::where('is_premium', true)->count();
$premium_mangas = Manga::where('is_premium', true)->count();
$premium_comics = Comic::where('is_premium', true)->count();
$premium_audiobooks = Audiobook::where('is_premium', true)->count();
$total_premium = $premium_libs + $premium_mangas + $premium_comics + $premium_audiobooks;

echo "  ├─ Libros Premium: $premium_libs\n";
echo "  ├─ Mangas Premium: $premium_mangas\n";
echo "  ├─ Cómics Premium: $premium_comics\n";
echo "  ├─ Audiolibros Premium: $premium_audiobooks\n";
echo "  └─ TOTAL: $total_premium\n\n";

// 4. Pagos
echo "💰 PAGOS:\n";
if (DB::getSchemaBuilder()->hasTable('payments')) {
    $total_payments = Payment::count();
    $completed_payments = Payment::where('status', 'completed')->count();
    $pending_payments = Payment::where('status', 'pending')->count();
    $total_revenue = (float) Payment::where('status', 'completed')->sum('amount');
    $monthly_revenue = (float) Payment::where('status', 'completed')
        ->whereYear('paid_at', date('Y'))
        ->whereMonth('paid_at', date('m'))
        ->sum('amount');

    echo "  ├─ Total Pagos: $total_payments\n";
    echo "  ├─ Pagos Completados: $completed_payments\n";
    echo "  ├─ Pagos Pendientes: $pending_payments\n";
    echo "  ├─ Ingresos Totales: \$" . number_format($total_revenue, 2) . "\n";
    echo "  └─ Ingresos Este Mes: \$" . number_format($monthly_revenue, 2) . "\n\n";

    // Ingresos últimos 7 días
    $last_7_days = (float) Payment::where('status', 'completed')
        ->where('paid_at', '>=', now()->subDays(7))
        ->sum('amount');
    echo "  └─ Últimos 7 días: \$" . number_format($last_7_days, 2) . "\n\n";
} else {
    echo "  ⚠️  Tabla de pagos no existe\n\n";
}

// 5. Sesiones de lectura
echo "👁️  SESIONES DE LECTURA:\n";
if (DB::getSchemaBuilder()->hasTable('reading_sessions')) {
    $total_sessions = DB::table('reading_sessions')->count();
    $today_sessions = DB::table('reading_sessions')->whereDate('created_at', today())->count();
    $avg_duration = (float) DB::table('reading_sessions')->avg('duration_seconds');

    echo "  ├─ Total Sesiones: $total_sessions\n";
    echo "  ├─ Sesiones Hoy: $today_sessions\n";
    echo "  └─ Duración Promedio: " . round($avg_duration / 60, 2) . " minutos\n\n";
} else {
    echo "  ⚠️  Tabla de sesiones no existe\n\n";
}

// 6. Últimas actividades
echo "🔔 ÚLTIMAS ACTIVIDADES:\n";
$recent_users = User::orderBy('created_at', 'desc')->limit(5)->get();
echo "  Últimos 5 usuarios registrados:\n";
foreach ($recent_users as $user) {
    echo "    • {$user->name} ({$user->email}) - {$user->created_at->diffForHumans()}\n";
}

echo "\n";
$recent_payments = Payment::where('status', 'completed')->orderBy('paid_at', 'desc')->limit(5)->get();
if ($recent_payments->count() > 0) {
    echo "  Últimas 5 transacciones:\n";
    foreach ($recent_payments as $payment) {
        echo "    • User ID {$payment->user_id}: \${$payment->amount} - {$payment->paid_at?->diffForHumans()}\n";
    }
} else {
    echo "  ⚠️  Sin transacciones completadas\n";
}

echo "\n========== RESUMEN ==========\n";
if ($total_users > 0 && $total_content > 0 && $total_payments > 0) {
    echo "✅ Dashboard tiene datos reales y completos\n";
} else {
    echo "⚠️  Datos incompletos:\n";
    if ($total_users === 0) echo "  • No hay usuarios\n";
    if ($total_content === 0) echo "  • No hay contenido\n";
    if ($total_payments === 0) echo "  • No hay pagos registrados\n";
}

echo "\n";
?>
