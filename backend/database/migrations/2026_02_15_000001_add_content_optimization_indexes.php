<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Índices optimizados para queries comunes:
     * - Filtrado por is_premium
     * - Búsqueda por género
     * - Ordenamiento por created_at y popularidad
     * - Relación con usuario uploader
     */
    public function up(): void
    {
        // Índices para tabla libros
        if (Schema::hasTable('libros')) {
            Schema::table('libros', function (Blueprint $table) {
                if (Schema::hasColumn('libros', 'is_premium')) {
                    $table->index('is_premium');
                }
                if (Schema::hasColumn('libros', 'genero')) {
                    $table->index('genero');
                }
                if (Schema::hasColumn('libros', 'uploaded_by')) {
                    $table->index('uploaded_by');
                }
                if (Schema::hasColumn('libros', 'created_at') && Schema::hasColumn('libros', 'is_premium')) {
                    $table->index(['created_at', 'is_premium']);
                }
                if (Schema::hasColumn('libros', 'popularidad') && Schema::hasColumn('libros', 'is_premium')) {
                    $table->index(['popularidad', 'is_premium']);
                }
                if (Schema::hasColumn('libros', 'titulo') && Schema::hasColumn('libros', 'descripcion') && Schema::hasColumn('libros', 'autor')) {
                    $table->fullText(['titulo', 'descripcion', 'autor']);
                }
            });
        }

        // Índices para tabla mangas
        if (Schema::hasTable('mangas')) {
            Schema::table('mangas', function (Blueprint $table) {
                if (Schema::hasColumn('mangas', 'is_premium')) {
                    $table->index('is_premium');
                }
                if (Schema::hasColumn('mangas', 'genero')) {
                    $table->index('genero');
                }
                if (Schema::hasColumn('mangas', 'uploaded_by')) {
                    $table->index('uploaded_by');
                }
                if (Schema::hasColumn('mangas', 'created_at') && Schema::hasColumn('mangas', 'is_premium')) {
                    $table->index(['created_at', 'is_premium']);
                }
                if (Schema::hasColumn('mangas', 'popularidad') && Schema::hasColumn('mangas', 'is_premium')) {
                    $table->index(['popularidad', 'is_premium']);
                }
                if (Schema::hasColumn('mangas', 'titulo') && Schema::hasColumn('mangas', 'descripcion') && Schema::hasColumn('mangas', 'autor')) {
                    $table->fullText(['titulo', 'descripcion', 'autor']);
                }
            });
        }

        // Índices para tabla comics
        if (Schema::hasTable('comics')) {
            Schema::table('comics', function (Blueprint $table) {
                if (Schema::hasColumn('comics', 'is_premium')) {
                    $table->index('is_premium');
                }
                if (Schema::hasColumn('comics', 'genero')) {
                    $table->index('genero');
                }
                if (Schema::hasColumn('comics', 'uploaded_by')) {
                    $table->index('uploaded_by');
                }
                if (Schema::hasColumn('comics', 'created_at') && Schema::hasColumn('comics', 'is_premium')) {
                    $table->index(['created_at', 'is_premium']);
                }
                if (Schema::hasColumn('comics', 'popularidad') && Schema::hasColumn('comics', 'is_premium')) {
                    $table->index(['popularidad', 'is_premium']);
                }
                if (Schema::hasColumn('comics', 'titulo') && Schema::hasColumn('comics', 'descripcion') && Schema::hasColumn('comics', 'autor')) {
                    $table->fullText(['titulo', 'descripcion', 'autor']);
                }
            });
        }

        // Índices para tabla audiobooks
        if (Schema::hasTable('audiobooks')) {
            Schema::table('audiobooks', function (Blueprint $table) {
                if (Schema::hasColumn('audiobooks', 'is_premium')) {
                    $table->index('is_premium');
                }
                if (Schema::hasColumn('audiobooks', 'genero')) {
                    $table->index('genero');
                }
                if (Schema::hasColumn('audiobooks', 'uploaded_by')) {
                    $table->index('uploaded_by');
                }
                if (Schema::hasColumn('audiobooks', 'created_at') && Schema::hasColumn('audiobooks', 'is_premium')) {
                    $table->index(['created_at', 'is_premium']);
                }
                if (Schema::hasColumn('audiobooks', 'popularidad') && Schema::hasColumn('audiobooks', 'is_premium')) {
                    $table->index(['popularidad', 'is_premium']);
                }
                if (Schema::hasColumn('audiobooks', 'titulo') && Schema::hasColumn('audiobooks', 'descripcion') && Schema::hasColumn('audiobooks', 'autor')) {
                    $table->fullText(['titulo', 'descripcion', 'autor']);
                }
            });
        }

        // Índices para tabla users (para búsquedas de admin)
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'role_id')) {
                    $table->index('role_id');
                }
                if (Schema::hasColumn('users', 'is_active')) {
                    $table->index('is_active');
                }
                if (Schema::hasColumn('users', 'created_at') && Schema::hasColumn('users', 'is_active')) {
                    $table->index(['created_at', 'is_active']);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No implementamos down() para mantener los índices en rollback
        // Los índices son beneficiosos y minimales en costo
    }
};
