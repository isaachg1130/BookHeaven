<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear roles
        $adminRole = Role::create([
            'name' => 'admin',
            'display_name' => 'Administrador',
            'description' => 'Tiene acceso total al sistema',
        ]);

        $premiumRole = Role::create([
            'name' => 'premium',
            'display_name' => 'Usuario Premium',
            'description' => 'Usuario con suscripción premium',
        ]);

        $standardRole = Role::create([
            'name' => 'standard',
            'display_name' => 'Usuario Estándar',
            'description' => 'Usuario estándar sin suscripción',
        ]);

        // Crear permisos
        $permissions = [
            // Permisos de Dashboard
            [
                'name' => 'view_dashboard',
                'display_name' => 'Ver Dashboard',
                'description' => 'Acceso al dashboard administrativo',
            ],
            [
                'name' => 'view_statistics',
                'display_name' => 'Ver Estadísticas',
                'description' => 'Ver estadísticas del sistema',
            ],
            [
                'name' => 'export_reports',
                'display_name' => 'Exportar Reportes',
                'description' => 'Exportar reportes en PDF/Excel',
            ],

            // Permisos de Usuarios
            [
                'name' => 'manage_users',
                'display_name' => 'Gestionar Usuarios',
                'description' => 'Crear, editar y eliminar usuarios',
            ],
            [
                'name' => 'assign_roles',
                'display_name' => 'Asignar Roles',
                'description' => 'Asignar roles a usuarios',
            ],
            [
                'name' => 'view_payment_history',
                'display_name' => 'Ver Historial de Pagos',
                'description' => 'Ver historial de pagos de usuarios',
            ],

            // Permisos de Contenido
            [
                'name' => 'create_content',
                'display_name' => 'Crear Contenido',
                'description' => 'Crear libros, mangas, cómics y audiolibros',
            ],
            [
                'name' => 'edit_content',
                'display_name' => 'Editar Contenido',
                'description' => 'Editar contenido existente',
            ],
            [
                'name' => 'delete_content',
                'display_name' => 'Eliminar Contenido',
                'description' => 'Eliminar contenido',
            ],
            [
                'name' => 'upload_files',
                'display_name' => 'Subir Archivos',
                'description' => 'Subir PDFs y archivos de audio',
            ],

            // Permisos de Contenido Premium
            [
                'name' => 'access_premium_content',
                'display_name' => 'Acceder a Contenido Premium',
                'description' => 'Acceso a contenido marca como premium',
            ],
            [
                'name' => 'access_all_content',
                'display_name' => 'Acceder a Todo el Contenido',
                'description' => 'Acceso sin restricciones a todo el contenido',
            ],

            // Permisos de Actividades
            [
                'name' => 'view_activity_logs',
                'display_name' => 'Ver Registros de Actividad',
                'description' => 'Ver logs de actividades del sistema',
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        // Asignar permisos a roles
        // Admin: todos los permisos
        $adminPermissions = Permission::all();
        foreach ($adminPermissions as $permission) {
            $adminRole->givePermission($permission);
        }

        // Premium: permisos limitados
        $premiumPermissions = Permission::whereIn('name', [
            'create_content',
            'edit_content',
            'upload_files',
            'access_premium_content',
            'access_all_content',
        ])->get();

        foreach ($premiumPermissions as $permission) {
            $premiumRole->givePermission($permission);
        }

        // Standard: permisos muy limitados
        $standardPermissions = Permission::whereIn('name', [
            'view_dashboard', // Puede ver su propio dashboard
        ])->get();

        foreach ($standardPermissions as $permission) {
            $standardRole->givePermission($permission);
        }

        // Crear usuario admin de prueba si no existe
        if (!User::where('email', 'admin@test.com')->exists()) {
            $admin = User::create([
                'name' => 'Administrador',
                'email' => 'admin@test.com',
                'password' => Hash::make('admin123456'),
                'role_id' => $adminRole->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $this->command->line('✅ Usuario admin creado: admin@test.com / admin123456');
        }

        $this->command->info('Roles y permisos creados exitosamente.');
    }
}
