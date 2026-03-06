<?php

namespace App\Console\Commands;

use App\Models\ReadingHistory;
use App\Models\User;
use Illuminate\Console\Command;

class VerifyReadingData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:verify-reading-data';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Verify reading history data in the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('╔════════════════════════════════════════════════════════════════╗');
        $this->info('║        VERIFICACIÓN DE DATOS DE LECTURA - RESUMEN              ║');
        $this->info('╚════════════════════════════════════════════════════════════════╝');
        $this->newLine();

        // Total de lecturas
        $totalReadings = ReadingHistory::count();
        $this->info("📚 TOTAL DE LECTURAS: $totalReadings");
        $this->newLine();

        // Por estado
        $this->info('📊 LECTURAS POR ESTADO:');
        $byStatus = ReadingHistory::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();
        
        foreach ($byStatus as $stat) {
            $percentage = round(($stat->count / $totalReadings) * 100, 2);
            $this->line("   └─ " . ucfirst($stat->status) . ": {$stat->count} ({$percentage}%)");
        }
        $this->newLine();

        // Por tipo de contenido
        $this->info('📖 LECTURAS POR TIPO DE CONTENIDO:');
        $byContent = ReadingHistory::selectRaw('content_type, COUNT(*) as count')
            ->groupBy('content_type')
            ->get();
        
        foreach ($byContent as $stat) {
            $percentage = round(($stat->count / $totalReadings) * 100, 2);
            $this->line("   └─ " . ucfirst($stat->content_type) . ": {$stat->count} ({$percentage}%)");
        }
        $this->newLine();

        // Usuarios con lecturas
        $usersWithReadings = ReadingHistory::select('user_id')->distinct()->count();
        $totalUsers = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['standard', 'premium']);
        })->count();
        $percentage = round(($usersWithReadings / $totalUsers) * 100, 2);
        $this->info("👥 USUARIOS CON LECTURAS: $usersWithReadings / $totalUsers ({$percentage}%)");
        $this->newLine();

        // Top lectores
        $this->info('🏆 TOP 5 LECTORES:');
        $topReaders = ReadingHistory::selectRaw('user_id, COUNT(*) as reading_count')
            ->groupBy('user_id')
            ->orderByDesc('reading_count')
            ->take(5)
            ->with('user:id,name,email')
            ->get();
        
        $position = 1;
        foreach ($topReaders as $reader) {
            $this->line("   $position. {$reader->user->name} - {$reader->reading_count} lecturas");
            $position++;
        }
        $this->newLine();

        // Estadísticas de progreso
        $avgProgress = ReadingHistory::avg('progress_percentage');
        $this->info("📈 PROGRESO PROMEDIO: " . round($avgProgress, 2) . "%");
        $this->newLine();

        // Tiempo de lectura
        $avgReadingTime = ReadingHistory::avg('reading_time_minutes');
        $hours = floor($avgReadingTime / 60);
        $minutes = intval($avgReadingTime) % 60;
        $this->info("⏱️  TIEMPO PROMEDIO DE LECTURA: {$hours}h {$minutes}m");
        $this->newLine();

        // Calificaciones
        $avgRating = ReadingHistory::whereNotNull('rating')->avg('rating');
        $ratingCount = ReadingHistory::whereNotNull('rating')->count();
        $this->info("⭐ CALIFICACIÓN PROMEDIO: " . round($avgRating, 2) . "/5 ($ratingCount calificaciones)");
        $this->newLine();

        // Tasa de abandono
        $abandonedCount = ReadingHistory::where('status', 'abandoned')->count();
        $abandonmentRate = $totalReadings > 0 ? round(($abandonedCount / $totalReadings) * 100, 2) : 0;
        $this->info("❌ TASA DE ABANDONO: $abandonmentRate%");
        $this->newLine();

        // Lecturas completadas
        $completedCount = ReadingHistory::where('status', 'completed')->count();
        $completionRate = $totalReadings > 0 ? round(($completedCount / $totalReadings) * 100, 2) : 0;
        $this->info("✅ LECTURAS COMPLETADAS: $completedCount ($completionRate%)");
        $this->newLine();

        // Por rol
        $this->info('💎 ANÁLISIS POR TIPO DE USUARIO:');
        
        $standardUsers = User::whereHas('role', function ($q) {
            $q->where('name', 'standard');
        })->pluck('id');
        
        $premiumUsers = User::whereHas('role', function ($q) {
            $q->where('name', 'premium');
        })->pluck('id');

        $standardReadings = ReadingHistory::whereIn('user_id', $standardUsers)->count();
        $premiumReadings = ReadingHistory::whereIn('user_id', $premiumUsers)->count();

        $standardAvgProgress = ReadingHistory::whereIn('user_id', $standardUsers)->avg('progress_percentage');
        $premiumAvgProgress = ReadingHistory::whereIn('user_id', $premiumUsers)->avg('progress_percentage');

        $this->line("   └─ Standard: $standardReadings lecturas, progreso: " . round($standardAvgProgress, 2) . "%");
        $this->line("   └─ Premium: $premiumReadings lecturas, progreso: " . round($premiumAvgProgress, 2) . "%");
        $this->newLine();

        // Distribución mensual
        $this->info('📅 DISTRIBUCIÓN MENSUAL (últimos 3 meses):');
        $monthlyReadings = ReadingHistory::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(3))
            ->groupBy('month')
            ->orderBy('month')
            ->get();
        
        foreach ($monthlyReadings as $reading) {
            $this->line("   └─ {$reading->month}: {$reading->count} lecturas");
        }
        $this->newLine();

        $this->info('╔════════════════════════════════════════════════════════════════╗');
        $this->info('║  ✅ DATOS DE LECTURA LISTOS PARA VISUALIZAR EN DASHBOARD      ║');
        $this->info('╚════════════════════════════════════════════════════════════════╝');
        $this->newLine();

        $this->info('🔗 ENDPOINTS DISPONIBLES:');
        $this->line('   - GET /api/admin/dashboard-stats (incluye sección de lecturas)');
        $this->line('   - GET /api/admin/reading-analytics (comparativas completas)');
        $this->line('   - GET /api/admin/reading-analytics/by-gender');
        $this->line('   - GET /api/admin/reading-analytics/by-age');
        $this->line('   - GET /api/admin/reading-analytics/by-country');
        $this->line('   - GET /api/admin/reading-analytics/by-user-type');
        $this->line('   - GET /api/admin/reading-analytics/monthly-trends');
        $this->line('   - GET /api/admin/reading-analytics/popular-content');
    }
}
