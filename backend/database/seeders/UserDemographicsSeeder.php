<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserDemographicsSeeder extends Seeder
{
    /**
     * Seed the application's database with test users containing demographic data
     */
    public function run(): void
    {
        $standardRole = Role::where('name', 'standard')->first();
        $premiumRole = Role::where('name', 'premium')->first();

        // Datos de prueba: géneros
        $generos = ['masculino', 'femenino', 'otro'];
        
        // Datos de prueba: países hispanohablantes
        $paises = [
            'Colombia', 'España', 'Argentina', 'México', 'Perú',
            'Chile', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay',
            'Uruguay', 'Costa Rica', 'Panamá', 'El Salvador', 'Honduras'
        ];

        // Crear 15 usuarios: 8 standard y 7 premium
        $usuarios = [
            // Standard Users
            [
                'name' => 'Juan García',
                'email' => 'juan.garcia@test.com',
                'gender' => 'masculino',
                'country' => 'Colombia',
                'birth_year' => 1998,
                'role' => 'standard',
            ],
            [
                'name' => 'María López',
                'email' => 'maria.lopez@test.com',
                'gender' => 'femenino',
                'country' => 'España',
                'birth_year' => 2002,
                'role' => 'standard',
            ],
            [
                'name' => 'Carlos Rodríguez',
                'email' => 'carlos.rodriguez@test.com',
                'gender' => 'masculino',
                'country' => 'Argentina',
                'birth_year' => 1996,
                'role' => 'standard',
            ],
            [
                'name' => 'Ana Martínez',
                'email' => 'ana.martinez@test.com',
                'gender' => 'femenino',
                'country' => 'México',
                'birth_year' => 2000,
                'role' => 'standard',
            ],
            [
                'name' => 'Pedro Sánchez',
                'email' => 'pedro.sanchez@test.com',
                'gender' => 'masculino',
                'country' => 'Perú',
                'birth_year' => 1985,
                'role' => 'standard',
            ],
            [
                'name' => 'Laura Gómez',
                'email' => 'laura.gomez@test.com',
                'gender' => 'femenino',
                'country' => 'Chile',
                'birth_year' => 1999,
                'role' => 'standard',
            ],
            [
                'name' => 'Ricardo Flores',
                'email' => 'ricardo.flores@test.com',
                'gender' => 'masculino',
                'country' => 'Venezuela',
                'birth_year' => 1992,
                'role' => 'standard',
            ],
            [
                'name' => 'Sofia Díaz',
                'email' => 'sofia.diaz@test.com',
                'gender' => 'femenino',
                'country' => 'Ecuador',
                'birth_year' => 2001,
                'role' => 'standard',
            ],
            // Premium Users
            [
                'name' => 'Diego Morales',
                'email' => 'diego.morales@test.com',
                'gender' => 'masculino',
                'country' => 'Bolivia',
                'birth_year' => 1988,
                'role' => 'premium',
            ],
            [
                'name' => 'Valentina Silva',
                'email' => 'valentina.silva@test.com',
                'gender' => 'femenino',
                'country' => 'Paraguay',
                'birth_year' => 1997,
                'role' => 'premium',
            ],
            [
                'name' => 'Miguel Torres',
                'email' => 'miguel.torres@test.com',
                'gender' => 'masculino',
                'country' => 'Uruguay',
                'birth_year' => 1991,
                'role' => 'premium',
            ],
            [
                'name' => 'Catalina Ruiz',
                'email' => 'catalina.ruiz@test.com',
                'gender' => 'femenino',
                'country' => 'Costa Rica',
                'birth_year' => 2003,
                'role' => 'premium',
            ],
            [
                'name' => 'Andrés Vargas',
                'email' => 'andres.vargas@test.com',
                'gender' => 'masculino',
                'country' => 'Panamá',
                'birth_year' => 1994,
                'role' => 'premium',
            ],
            [
                'name' => 'Isabela Castro',
                'email' => 'isabela.castro@test.com',
                'gender' => 'femenino',
                'country' => 'El Salvador',
                'birth_year' => 1986,
                'role' => 'premium',
            ],
            [
                'name' => 'Felipe Navarro',
                'email' => 'felipe.navarro@test.com',
                'gender' => 'masculino',
                'country' => 'Honduras',
                'birth_year' => 1999,
                'role' => 'premium',
            ],
        ];

        // Crear los usuarios
        foreach ($usuarios as $userData) {
            $role = $userData['role'] === 'premium' ? $premiumRole : $standardRole;
            
            // Calcular fecha de nacimiento aleatoria dentro del año
            $month = rand(1, 12);
            $day = rand(1, 28);
            $dateOfBirth = Carbon::createFromDate($userData['birth_year'], $month, $day);

            User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make('password123'),
                'role_id' => $role->id,
                'is_active' => true,
                'email_verified_at' => now(),
                'date_of_birth' => $dateOfBirth,
                'gender' => $userData['gender'],
                'country' => $userData['country'],
            ]);
        }

        $this->command->info('✅ 15 usuarios de prueba con datos demográficos creados exitosamente');
        $this->command->info('   - 8 usuarios Standard');
        $this->command->info('   - 7 usuarios Premium');
    }
}
