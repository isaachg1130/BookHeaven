<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Carbon\Carbon;

class VerifyTestData extends Command
{
    protected $signature = 'test:verify-data';
    protected $description = 'Verify test data created for dashboard';

    public function handle()
    {
        $this->line('');
        $this->info('╔════════════════════════════════════════════════════════════════╗');
        $this->info('║        DATOS DE PRUEBA DEL DASHBOARD - RESUMEN                ║');
        $this->info('╚════════════════════════════════════════════════════════════════╝');
        $this->line('');

        // Total de usuarios
        $totalUsers = User::count();
        $this->line('📊 USUARIOS TOTALES: ' . $totalUsers);
        $this->line('   └─ Standard: ' . User::whereHas('role', fn($q) => $q->where('name', 'standard'))->count());
        $this->line('   └─ Premium: ' . User::whereHas('role', fn($q) => $q->where('name', 'premium'))->count());
        $this->line('   └─ Admin: ' . User::whereHas('role', fn($q) => $q->where('name', 'admin'))->count());
        $this->line('');

        // Usuarios con datos demográficos
        $conDatos = User::whereNotNull('date_of_birth')
            ->whereNotNull('gender')
            ->whereNotNull('country')
            ->count();

        $porcentaje = $totalUsers > 0 ? round(($conDatos / $totalUsers) * 100, 2) : 0;
        $this->line('📋 DATOS DEMOGRÁFICOS COMPLETOS: ' . $conDatos . ' usuarios (' . $porcentaje . '%)');
        $this->line('');

        // Distribución por género
        $generos = User::whereNotNull('gender')
            ->groupBy('gender')
            ->selectRaw('gender, count(*) as total')
            ->pluck('total', 'gender')
            ->toArray();

        $this->line('👥 DISTRIBUCIÓN POR GÉNERO:');
        foreach ($generos as $genero => $cantidad) {
            $this->line('   └─ ' . ucfirst($genero) . ': ' . $cantidad);
        }
        $this->line('');

        // Top países
        $paises = User::whereNotNull('country')
            ->groupBy('country')
            ->selectRaw('country, count(*) as total')
            ->orderBy('total', 'desc')
            ->pluck('total', 'country')
            ->toArray();

        $this->line('🌍 DISTRIBUCIÓN POR PAÍS (Top 5):');
        $top = 0;
        foreach ($paises as $pais => $cantidad) {
            if ($top >= 5) break;
            $this->line('   └─ ' . $pais . ': ' . $cantidad);
            $top++;
        }
        $this->line('');

        // Distribución por edad
        $this->line('🎂 DISTRIBUCIÓN POR RANGO DE EDAD:');

        $edades = [
            '13-18' => 0,
            '19-25' => 0,
            '26-35' => 0,
            '36-50' => 0,
            '50+' => 0,
        ];

        $usuariosConFecha = User::whereNotNull('date_of_birth')
            ->select('date_of_birth')
            ->get();

        foreach ($usuariosConFecha as $usuario) {
            if ($usuario->date_of_birth) {
                $edad = $usuario->date_of_birth->age;
                if ($edad >= 13 && $edad <= 18) {
                    $edades['13-18']++;
                } elseif ($edad >= 19 && $edad <= 25) {
                    $edades['19-25']++;
                } elseif ($edad >= 26 && $edad <= 35) {
                    $edades['26-35']++;
                } elseif ($edad >= 36 && $edad <= 50) {
                    $edades['36-50']++;
                } elseif ($edad > 50) {
                    $edades['50+']++;
                }
            }
        }

        foreach ($edades as $rango => $cantidad) {
            $this->line('   └─ ' . $rango . ' años: ' . $cantidad);
        }

        $this->line('');
        $this->info('╔════════════════════════════════════════════════════════════════╗');
        $this->info('║  ✅ DATOS LISTOS PARA PROBAR EN EL DASHBOARD                 ║');
        $this->info('╚════════════════════════════════════════════════════════════════╝');
        $this->line('');

        // Mostrar credenciales de prueba
        $this->line('🔐 CREDENCIALES PARA PROBAR:');
        $this->line('');
        $this->line('ADMIN:');
        $this->line('   Email: kristofercanotaborda@gmail.com');
        $this->line('   Contraseña: admin123');
        $this->line('');
        $this->line('USUARIOS DE PRUEBA (15 nuevos):');
        $this->line('   Email: juan.garcia@test.com (Standard)');
        $this->line('   Email: diego.morales@test.com (Premium)');
        $this->line('   Contraseña: password123 (todos)');
        $this->line('');
    }
}
