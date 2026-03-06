<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * OPTIMIZACIÓN: Agregar índices para mejorar rendimiento de queries
 * 
 * Estos índices optimizan:
 * - Búsquedas LIKE por título, autor, descripción
 * - Filtros por is_premium y genero
 * - Ordenamiento por popularidad y fecha de creación
 * - Relaciones entre tablas
 */
return new class extends Migration
{
    public function up(): void
    {
        // Observación: Los índices se agregan solo si las tablas existen

        // OPTIMIZACIÓN: Índices para tabla libros
        if (Schema::hasTable('libros')) {
            Schema::table('libros', function (Blueprint $table) {
                // Crear índices si no existen y las columnas existen
                if (Schema::hasColumn('libros', 'titulo')) $table->index('titulo', 'idx_libros_titulo');
                if (Schema::hasColumn('libros', 'autor')) $table->index('autor', 'idx_libros_autor');
                if (Schema::hasColumn('libros', 'genero')) $table->index('genero', 'idx_libros_genero');
                if (Schema::hasColumns('libros', ['is_premium', 'popularidad'])) $table->index(['is_premium', 'popularidad'], 'idx_libros_premium_popularity');
                if (Schema::hasColumn('libros', 'created_at')) $table->index('created_at', 'idx_libros_created_at');
                if (Schema::hasColumn('libros', 'popularidad')) $table->index('popularidad', 'idx_libros_popularidad');
            });
        }

        // OPTIMIZACIÓN: Índices para tabla mangas
        if (Schema::hasTable('mangas')) {
            Schema::table('mangas', function (Blueprint $table) {
                if (Schema::hasColumn('mangas', 'titulo')) $table->index('titulo', 'idx_mangas_titulo');
                if (Schema::hasColumn('mangas', 'autor')) $table->index('autor', 'idx_mangas_autor');
                if (Schema::hasColumn('mangas', 'genero')) $table->index('genero', 'idx_mangas_genero');
                if (Schema::hasColumns('mangas', ['is_premium', 'popularidad'])) $table->index(['is_premium', 'popularidad'], 'idx_mangas_premium_popularity');
                if (Schema::hasColumn('mangas', 'created_at')) $table->index('created_at', 'idx_mangas_created_at');
                if (Schema::hasColumn('mangas', 'popularidad')) $table->index('popularidad', 'idx_mangas_popularidad');
            });
        }

        // OPTIMIZACIÓN: Índices para tabla comics
        if (Schema::hasTable('comics')) {
            Schema::table('comics', function (Blueprint $table) {
                if (Schema::hasColumn('comics', 'titulo')) $table->index('titulo', 'idx_comics_titulo');
                if (Schema::hasColumn('comics', 'autor')) $table->index('autor', 'idx_comics_autor');
                if (Schema::hasColumn('comics', 'genero')) $table->index('genero', 'idx_comics_genero');
                if (Schema::hasColumns('comics', ['is_premium', 'popularidad'])) $table->index(['is_premium', 'popularidad'], 'idx_comics_premium_popularity');
                if (Schema::hasColumn('comics', 'created_at')) $table->index('created_at', 'idx_comics_created_at');
                if (Schema::hasColumn('comics', 'popularidad')) $table->index('popularidad', 'idx_comics_popularidad');
            });
        }

        // OPTIMIZACIÓN: Índices para tabla audiobooks
        if (Schema::hasTable('audiobooks')) {
            Schema::table('audiobooks', function (Blueprint $table) {
                if (Schema::hasColumn('audiobooks', 'titulo')) $table->index('titulo', 'idx_audiobooks_titulo');
                if (Schema::hasColumn('audiobooks', 'autor')) $table->index('autor', 'idx_audiobooks_autor');
                if (Schema::hasColumn('audiobooks', 'genero')) $table->index('genero', 'idx_audiobooks_genero');
                if (Schema::hasColumns('audiobooks', ['is_premium', 'popularidad'])) $table->index(['is_premium', 'popularidad'], 'idx_audiobooks_premium_popularity');
                if (Schema::hasColumn('audiobooks', 'created_at')) $table->index('created_at', 'idx_audiobooks_created_at');
                if (Schema::hasColumn('audiobooks', 'popularidad')) $table->index('popularidad', 'idx_audiobooks_popularidad');
            });
        }

        // OPTIMIZACIÓN: Índices para tabla users
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'email')) $table->index('email', 'idx_users_email');
                if (Schema::hasColumn('users', 'role_id')) $table->index('role_id', 'idx_users_role_id');
                if (Schema::hasColumns('users', ['is_active', 'premium_expires_at'])) $table->index(['is_active', 'premium_expires_at'], 'idx_users_active_premium');
            });
        }

        // OPTIMIZACIÓN: Índices para tabla readings_history
        if (Schema::hasTable('reading_history')) {
            Schema::table('reading_history', function (Blueprint $table) {
                $table->index(['user_id', 'created_at'], 'idx_reading_user_date');
                $table->index('content_type', 'idx_reading_content_type');
            });
        }

        // OPTIMIZACIÓN: Índices para tabla reviews
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->index(['content_id', 'content_type'], 'idx_reviews_content');
                $table->index(['user_id', 'created_at'], 'idx_reviews_user_date');
                $table->index('rating', 'idx_reviews_rating');
            });
        }

        // OPTIMIZACIÓN: Índices para tabla favorites
        if (Schema::hasTable('favorites')) {
            Schema::table('favorites', function (Blueprint $table) {
                $table->index(['user_id', 'content_id'], 'idx_favorites_user_content');
                $table->index('content_type', 'idx_favorites_content_type');
            });
        }
    }

    public function down(): void
    {
        // Remover índices de forma segura
        if (Schema::hasTable('libros')) {
            Schema::table('libros', function (Blueprint $table) {
                $table->dropIndexIfExists('idx_libros_titulo');
                $table->dropIndexIfExists('idx_libros_autor');
                $table->dropIndexIfExists('idx_libros_genero');
                $table->dropIndexIfExists('idx_libros_premium_popularity');
                $table->dropIndexIfExists('idx_libros_created_at');
                $table->dropIndexIfExists('idx_libros_popularidad');
            });
        }

        if (Schema::hasTable('mangas')) {
            Schema::table('mangas', function (Blueprint $table) {
                $table->dropIndexIfExists('idx_mangas_titulo');
                $table->dropIndexIfExists('idx_mangas_autor');
                $table->dropIndexIfExists('idx_mangas_genero');
                $table->dropIndexIfExists('idx_mangas_premium_popularity');
                $table->dropIndexIfExists('idx_mangas_created_at');
                $table->dropIndexIfExists('idx_mangas_popularidad');
            });
        }

        if (Schema::hasTable('comics')) {
            Schema::table('comics', function (Blueprint $table) {
                $table->dropIndexIfExists('idx_comics_titulo');
                $table->dropIndexIfExists('idx_comics_autor');
                $table->dropIndexIfExists('idx_comics_genero');
                $table->dropIndexIfExists('idx_comics_premium_popularity');
                $table->dropIndexIfExists('idx_comics_created_at');
                $table->dropIndexIfExists('idx_comics_popularidad');
            });
        }

        if (Schema::hasTable('audiobooks')) {
            Schema::table('audiobooks', function (Blueprint $table) {
                $table->dropIndexIfExists('idx_audiobooks_titulo');
                $table->dropIndexIfExists('idx_audiobooks_autor');
                $table->dropIndexIfExists('idx_audiobooks_genero');
                $table->dropIndexIfExists('idx_audiobooks_premium_popularity');
                $table->dropIndexIfExists('idx_audiobooks_created_at');
                $table->dropIndexIfExists('idx_audiobooks_popularidad');
            });
        }

        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndexIfExists('idx_users_email');
                $table->dropIndexIfExists('idx_users_role_id');
                $table->dropIndexIfExists('idx_users_active_premium');
            });
        }

        if (Schema::hasTable('reading_history')) {
            Schema::table('reading_history', function (Blueprint $table) {
                $table->dropIndexIfExists('idx_reading_user_date');
                $table->dropIndexIfExists('idx_reading_content_type');
            });
        }

        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->dropIndexIfExists('idx_reviews_content');
                $table->dropIndexIfExists('idx_reviews_user_date');
                $table->dropIndexIfExists('idx_reviews_rating');
            });
        }

        if (Schema::hasTable('favorites')) {
            Schema::table('favorites', function (Blueprint $table) {
                $table->dropIndexIfExists('idx_favorites_user_content');
                $table->dropIndexIfExists('idx_favorites_content_type');
            });
        }
    }
};
