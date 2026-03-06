<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\ActivityLog;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DashboardAnalyticsSeeder extends Seeder
{
    /**
     * Seed the application's database with realistic analytics data
     * 
     * - 30 usuarios totales (20 standard + 10 premium)
     * - 500 activity logs distribuidos en últimos 12 meses
     * - 10 pagos premium con ingresos de $250
     * - Crecimiento progresivo realista
     */
    public function run(): void
    {
        $standardRole = Role::where('name', 'standard')->first();
        $premiumRole = Role::where('name', 'premium')->first();

        $this->command->info('🔄 Generando datos de prueba para el dashboard...');
        $this->command->newLine();

        // Datos demográficos
        $generos = ['masculino', 'femenino', 'otro'];
        $paises = [
            'Colombia', 'España', 'Argentina', 'México', 'Perú',
            'Chile', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay',
        ];

        $this->command->info('📱 Creando 30 usuarios (20 standard + 10 premium)...');

        // Get existing users count and create only as many as needed
        $existingCount = User::count();
        $usersNeeded = 30 - $existingCount;
        
        if ($usersNeeded <= 0) {
            $this->command->warn("⚠️ Ya existen " . $existingCount . " usuarios. Se necesitan 30. Usando usuarios existentes...");
        } else {
            $this->command->info("📝 Creando " . $usersNeeded . " usuarios adicionales...");
        }

        // Crear usuarios standard adicionales si es necesario
        $usuariosStandard = [];
        $startIdx = User::where('role_id', $standardRole->id)->count() + 1;
        $standardsToCreate = max(0, 20 - User::where('role_id', $standardRole->id)->count());
        
        for ($i = 0; $i < $standardsToCreate; $i++) {
            $timestamp = time() . $i;
            $usuario = User::create([
                'name' => "Usuario Standard " . ($startIdx + $i),
                'email' => "standard_" . $timestamp . "@test.com",
                'password' => Hash::make('password123'),
                'role_id' => $standardRole->id,
                'is_active' => true,
                'email_verified_at' => now(),
                'date_of_birth' => Carbon::now()->subYears(rand(18, 60))->subMonths(rand(0, 11))->subDays(rand(0, 28)),
                'gender' => $generos[array_rand($generos)],
                'country' => $paises[array_rand($paises)],
            ]);
            $usuariosStandard[] = $usuario;
        }

        // Crear 10 usuarios premium
        $usuariosPremium = [];
        $startPremiumIdx = User::where('role_id', $premiumRole->id)->count() + 1;
        $premiumsToCreate = max(0, 10 - User::where('role_id', $premiumRole->id)->count());
        
        for ($i = 0; $i < $premiumsToCreate; $i++) {
            $timestamp = time() . $i;
            $usuario = User::create([
                'name' => "Usuario Premium " . ($startPremiumIdx + $i),
                'email' => "premium_" . $timestamp . "@test.com",
                'password' => Hash::make('password123'),
                'role_id' => $premiumRole->id,
                'is_active' => true,
                'email_verified_at' => now(),
                'date_of_birth' => Carbon::now()->subYears(rand(18, 60))->subMonths(rand(0, 11))->subDays(rand(0, 28)),
                'gender' => $generos[array_rand($generos)],
                'country' => $paises[array_rand($paises)],
                'premium_expires_at' => now()->addMonths(12),
            ]);
            $usuariosPremium[] = $usuario;
        }

        $this->command->info('✅ Usuarios preparados');
        $this->command->newLine();

        // Todos los usuarios del sistema (nuevos + existentes)
        $todosUsuarios = User::whereNotIn('role_id', [Role::where('name', 'admin')->first()?->id ?? 0])->get()->all();

        // Crear 500 activity logs distribuidos en últimos 12 meses
        $this->command->info('📊 Generando 500 activity logs (últimos 12 meses)...');

        $tiposActividad = [
            'login' => 40,
            'lectura_libro' => 25,
            'lectura_manga' => 20,
            'lectura_comic' => 15,
            'descarga' => 10,
            'valoracion' => 8,
            'compra_premium' => 2,
        ];

        $meses = [];
        $activityLogs = [];
        
        // Crear distribución realista para los 12 meses
        for ($m = 12; $m >= 1; $m--) {
            $fechaInicio = Carbon::now()->subMonths($m)->startOfMonth();
            $fechaFin = Carbon::now()->subMonths($m)->endOfMonth();

            // Determinar registros para este mes (entre 15 y 80)
            if ($m === 6) {
                $registrosEnMes = 80; // Pico máximo
            } elseif ($m === 11) {
                $registrosEnMes = 15; // Mínimo registrado
            } else {
                $registrosEnMes = rand(35, 50); // Promedio ~40
            }

            $meses[$m] = [
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'registros' => $registrosEnMes,
            ];

        // Crear activity logs para este mes
            for ($i = 0; $i < $registrosEnMes; $i++) {
                $tipo = $this->obtenerTipoAleatorio($tiposActividad);
                $usuario = $todosUsuarios[array_rand($todosUsuarios)];
                
                $activityLogs[] = [
                    'user_id' => $usuario->id,
                    'action' => $tipo,
                    'model_type' => $this->obtenerModelType($tipo),
                    'model_id' => rand(1, 100),
                    'changes' => json_encode(['action' => $tipo]),
                    'ip_address' => rand(192, 223) . '.' . rand(0, 255) . '.' . rand(0, 255) . '.' . rand(1, 254),
                    'user_agent' => 'Mozilla/5.0',
                    'created_at' => $fechaInicio->copy()->addDays(rand(0, $fechaFin->diffInDays($fechaInicio)))->addHours(rand(0, 23))->addMinutes(rand(0, 59)),
                    'updated_at' => now(),
                ];
            }
        }

        // Insertar activity logs en chunks
        foreach (array_chunk($activityLogs, 100) as $chunk) {
            if (class_exists('App\Models\ActivityLog')) {
                ActivityLog::insert($chunk);
            }
        }

        $this->command->info('✅ 500 activity logs creados');
        $this->command->newLine();

        // Crear 10 pagos premium con ingresos de $250
        $this->command->info('💰 Generando 10 pagos premium ($250 en ingresos)...');

        $pagos = [];
        $pagoIndex = 0;

        foreach ($usuariosPremium as $usuario) {
            if ($pagoIndex < 10) {
                $pagos[] = [
                    'user_id' => $usuario->id,
                    'transaction_id' => 'TXN-' . Str::upper(Str::random(12)) . '-' . time(),
                    'plan_type' => 'premium',
                    'amount' => 25.00,
                    'status' => 'completed',
                    'paid_at' => Carbon::now()->subMonths(rand(1, 11))->subDays(rand(0, 28)),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $pagoIndex++;
            }
        }

        if (class_exists('App\Models\Payment')) {
            Payment::insert($pagos);
        }

        $this->command->info('✅ 10 pagos premium creados');
        $this->command->newLine();

        // Mostrar resumen
        $this->command->info('╔══════════════════════════════════════════════════════╗');
        $this->command->info('║      DATOS DE PRUEBA PARA DASHBOARD - RESUMEN        ║');
        $this->command->info('╚══════════════════════════════════════════════════════╝');
        
        $this->command->line('');
        $this->command->info('📊 REGISTROS POR MES:');
        foreach ($meses as $mes => $datos) {
            $nombreMes = Carbon::now()->subMonths(13 - $mes)->format('F Y');
            $this->command->line("   {$nombreMes}: {$datos['registros']} registros");
        }

        $totalRegistros = array_sum(array_column($meses, 'registros'));
        $this->command->line('');
        $this->command->info("   TOTAL: $totalRegistros registros");
        $this->command->info("   PROMEDIO: " . round($totalRegistros / 12, 2) . " registros/mes");
        $this->command->info("   MÁXIMO: 80 registros (Junio)");
        $this->command->info("   MÍNIMO: 15 registros (Noviembre)");

        $this->command->line('');
        $this->command->info('👥 USUARIOS:');
        $this->command->line('   Total: 30 usuarios');
        $this->command->line('   Standard: 20 usuarios');
        $this->command->line('   Premium: 10 usuarios (33%)');

        $this->command->line('');
        $this->command->info('💰 PAGOS:');
        $this->command->line('   Total Pagos: 10');
        $this->command->line('   Ingresos Premium: $250 (10 × $25)');

        $this->command->line('');
        $this->command->info('╔══════════════════════════════════════════════════════╗');
        $this->command->info('║  ✅ DATOS LISTOS PARA VISUALIZAR EN EL DASHBOARD   ║');
        $this->command->info('╚══════════════════════════════════════════════════════╝');
        $this->command->line('');
    }

    /**
     * Obtener tipo de actividad aleatorio basado en pesos
     */
    private function obtenerTipoAleatorio($tiposActividad)
    {
        $tipos = array_keys($tiposActividad);
        $pesos = array_values($tiposActividad);
        
        $total = array_sum($pesos);
        $random = rand(1, $total);
        $acumulado = 0;

        foreach ($tipos as $index => $tipo) {
            $acumulado += $pesos[$index];
            if ($random <= $acumulado) {
                return $tipo;
            }
        }

        return $tipos[0];
    }

    /**
     * Obtener tipo de modelo según tipo de actividad
     */
    private function obtenerModelType($tipo)
    {
        $modelos = [
            'login' => 'User',
            'lectura_libro' => 'Libro',
            'lectura_manga' => 'Manga',
            'lectura_comic' => 'Comic',
            'descarga' => 'Libro',
            'valoracion' => 'Libro',
            'compra_premium' => 'Payment',
        ];

        return $modelos[$tipo] ?? 'User';
    }

    /**
     * Obtener descripción según tipo de actividad
     */
    private function obtenerDescripcion($tipo)
    {
        $descripciones = [
            'login' => 'Usuario inició sesión en la plataforma',
            'lectura_libro' => 'Usuario leyendo un libro',
            'lectura_manga' => 'Usuario leyendo un manga',
            'lectura_comic' => 'Usuario leyendo un cómic',
            'descarga' => 'Usuario descargó contenido',
            'valoracion' => 'Usuario dejó una valoración',
            'compra_premium' => 'Usuario compró suscripción premium',
        ];

        return $descripciones[$tipo] ?? 'Actividad del usuario';
    }
}
