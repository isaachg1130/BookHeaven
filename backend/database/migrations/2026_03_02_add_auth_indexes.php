<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Índices para búsquedas rápidas de autenticación
            if (!Schema::hasColumn('users', 'email') || !$this->indexExists('users', 'email')) {
                $table->index('email')->change(); // Búsquedas por email durante login
            }
            
            $table->index('role_id'); // Búsquedas por rol
            $table->index('is_active'); // Búsquedas de usuarios activos
            $table->index('email_verified_at'); // Búsquedas de usuarios verificados
            $table->index('created_at'); // Ordenamiento por fecha de creación
            
            // Índice compuesto para búsquedas comunes
            $table->index(['is_active', 'role_id']); // Búsquedas de usuarios activos por rol
        });

        Schema::table('roles', function (Blueprint $table) {
            if (!$this->indexExists('roles', 'name')) {
                $table->unique('name'); // El nombre del rol debe ser único
            }
        });

        // Crear tabla de jobs si no existe (necesaria para queue:database)
        if (!Schema::hasTable('jobs')) {
            Schema::create('jobs', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('queue')->index();
                $table->longText('payload');
                $table->unsignedTinyInteger('attempts');
                $table->unsignedInteger('reserved_at')->nullable();
                $table->unsignedInteger('available_at');
                $table->unsignedInteger('created_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if ($this->indexExists('users', 'email')) {
                $table->dropIndex('email');
            }
            if ($this->indexExists('users', 'role_id')) {
                $table->dropIndex(['role_id']);
            }
            if ($this->indexExists('users', 'is_active')) {
                $table->dropIndex(['is_active']);
            }
            if ($this->indexExists('users', 'email_verified_at')) {
                $table->dropIndex(['email_verified_at']);
            }
            if ($this->indexExists('users', 'created_at')) {
                $table->dropIndex(['created_at']);
            }
            if ($this->indexExists('users', 'is_active_role_id')) {
                $table->dropIndex(['is_active', 'role_id']);
            }
        });

        Schema::table('roles', function (Blueprint $table) {
            if ($this->indexExists('roles', 'name')) {
                $table->dropUnique('name');
            }
        });

        if (Schema::hasTable('jobs')) {
            Schema::dropIfExists('jobs');
        }
    }

    /**
     * Helper para verificar si un índice existe
     */
    private function indexExists(string $table, $columns): bool
    {
        $indexes = Schema::getIndexes($table);
        $columnArray = is_array($columns) ? $columns : [$columns];
        
        foreach ($indexes as $index) {
            if ($index['columns'] === $columnArray) {
                return true;
            }
        }
        return false;
    }
};
