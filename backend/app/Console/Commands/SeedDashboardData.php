<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Libro;
use App\Models\Manga;
use App\Models\Comic;
use App\Models\Audiobook;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SeedDashboardData extends Command
{
    protected $signature = 'seed:dashboard {--count=100 : Número de registros de lectura a crear}';
    protected $description = 'Genera datos de lectura y pagos realistas para el dashboard';

    public function handle()
    {
        $this->info('🌱 Iniciando seeding de datos del dashboard...');

        // 1. Obtener usuarios existentes
        $users = User::where('is_active', true)->limit(10)->get();
        if ($users->isEmpty()) {
            $this->error('❌ No hay usuarios activos. Crea usuarios primero.');
            return;
        }

        // 2. Obtener contenido
        $libros = Libro::limit(20)->get();
        $mangas = Manga::limit(20)->get();
        $comics = Comic::limit(20)->get();
        $audiobooks = Audiobook::limit(20)->get();

        $count = (int) $this->option('count');
        $createdReadings = 0;
        $createdPayments = 0;

        $this->info("👥 {$users->count()} usuarios encontrados");
        $this->info("📚 {$libros->count()} libros, {$mangas->count()} mangas, {$comics->count()} cómics, {$audiobooks->count()} audiolibros");

        // 3. Generar registros de lectura
        $this->output->write("📖 Creando registros de lectura...");

        for ($i = 0; $i < $count; $i++) {
            $user = $users->random();
            
            // Decidir qué tipo de contenido leer
            $type = collect(['libro', 'manga', 'comic', 'audiobook'])->random();
            
            switch ($type) {
                case 'libro':
                    if ($libros->isEmpty()) continue 2;
                    $content = $libros->random();
                    $contentType = 'libro';
                    break;
                case 'manga':
                    if ($mangas->isEmpty()) continue 2;
                    $content = $mangas->random();
                    $contentType = 'manga';
                    break;
                case 'comic':
                    if ($comics->isEmpty()) continue 2;
                    $content = $comics->random();
                    $contentType = 'comic';
                    break;
                default:
                    if ($audiobooks->isEmpty()) continue 2;
                    $content = $audiobooks->random();
                    $contentType = 'audiobook';
            }

            // Datos aleatorios realistas
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
                'content_id' => $content->id,
                'pages_read' => $pagesRead,
                'total_pages' => $totalPages,
                'reading_time_minutes' => $readingTimeMinutes,
                'progress_percentage' => $progressPercentage,
                'status' => $status,
                'rating' => $rating ?: null,
                'review' => $rating >= 4 ? "Excelente contenido, muy recomendado" : null,
                'started_at' => $createdAt,
                'last_read_at' => $createdAt->copy()->addMinutes(rand(30, 300)),
                'completed_at' => $status === 'completed' ? $createdAt->copy()->addDays(rand(1, 15)) : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            $createdReadings++;

            if ($createdReadings % 20 === 0) {
                $this->output->write('.');
            }
        }

        $this->newLine();
        $this->info("✅ Creados {$createdReadings} registros de lectura");

        // 4. Generar pagos realistas
        $this->output->write("💳 Creando registros de pagos...");

        $premiumUserCount = min(3, $users->count());
        $premiumUsers = $users->random($premiumUserCount);

        // Generar 20-50 pagos en los últimos 30 días
        $paymentsToCreate = rand(20, 50);

        for ($i = 0; $i < $paymentsToCreate; $i++) {
            $user = $premiumUsers->random();
            $daysAgo = rand(0, 30);
            $paidAt = now()->subDays($daysAgo)->addHours(rand(0, 23))->addMinutes(rand(0, 59));

            // Precios realistas: $9.99, $19.99, $49.99
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

            if ($createdPayments % 10 === 0) {
                $this->output->write('.');
            }
        }

        $this->newLine();
        $this->info("✅ Creados {$createdPayments} registros de pago");

        $this->newLine();
        $this->info('🎉 ¡Seeding completado!');
        $this->info("📊 Total: {$createdReadings} lecturas + {$createdPayments} pagos");
        $this->info('💡 Abre el dashboard para ver los datos en acción');
    }
}
