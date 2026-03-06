<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Índices para mejorar búsquedas en libros
        if (Schema::hasTable('libros')) {
            Schema::table('libros', function (Blueprint $table) {
                // Si los índices ya existen, no harán nada
                if (Schema::hasColumns('libros', ['titulo', 'descripcion']) && !Schema::hasIndex('libros', 'idx_titulo')) {
                    $table->fullText(['titulo', 'descripcion'])->change();
                }
                if (Schema::hasColumn('libros', 'autor') && !Schema::hasIndex('libros', 'idx_autor')) {
                    $table->index('autor', 'idx_autor');
                }
                if (Schema::hasColumn('libros', 'genero') && !Schema::hasIndex('libros', 'idx_genero')) {
                    $table->index('genero', 'idx_genero');
                }
                if (Schema::hasColumn('libros', 'is_premium') && !Schema::hasIndex('libros', 'idx_is_premium')) {
                    $table->index('is_premium', 'idx_is_premium');
                }
                if (Schema::hasColumn('libros', 'created_at') && !Schema::hasIndex('libros', 'idx_created_at')) {
                    $table->index('created_at', 'idx_created_at');
                }
                if (Schema::hasColumn('libros', 'popularidad') && !Schema::hasIndex('libros', 'idx_popularidad')) {
                    $table->index('popularidad', 'idx_popularidad');
                }
            });
        }

        // Índices para mangas
        if (Schema::hasTable('mangas')) {
            Schema::table('mangas', function (Blueprint $table) {
                if (Schema::hasColumns('mangas', ['titulo', 'descripcion']) && !Schema::hasIndex('mangas', 'idx_titulo')) {
                    $table->fullText(['titulo', 'descripcion'])->change();
                }
                if (Schema::hasColumn('mangas', 'autor') && !Schema::hasIndex('mangas', 'idx_autor')) {
                    $table->index('autor', 'idx_autor');
                }
                if (Schema::hasColumn('mangas', 'genero') && !Schema::hasIndex('mangas', 'idx_genero')) {
                    $table->index('genero', 'idx_genero');
                }
                if (Schema::hasColumn('mangas', 'created_at') && !Schema::hasIndex('mangas', 'idx_created_at')) {
                    $table->index('created_at', 'idx_created_at');
                }
            });
        }

        // Índices para cómics
        if (Schema::hasTable('comics')) {
            Schema::table('comics', function (Blueprint $table) {
                if (Schema::hasColumns('comics', ['titulo', 'descripcion']) && !Schema::hasIndex('comics', 'idx_titulo')) {
                    $table->fullText(['titulo', 'descripcion'])->change();
                }
                if (Schema::hasColumn('comics', 'autor') && !Schema::hasIndex('comics', 'idx_autor')) {
                    $table->index('autor', 'idx_autor');
                }
                if (Schema::hasColumn('comics', 'genero') && !Schema::hasIndex('comics', 'idx_genero')) {
                    $table->index('genero', 'idx_genero');
                }
                if (Schema::hasColumn('comics', 'created_at') && !Schema::hasIndex('comics', 'idx_created_at')) {
                    $table->index('created_at', 'idx_created_at');
                }
            });
        }

        // Índices para audiolibros
        if (Schema::hasTable('audiobooks')) {
            Schema::table('audiobooks', function (Blueprint $table) {
                if (Schema::hasColumns('audiobooks', ['titulo', 'descripcion']) && !Schema::hasIndex('audiobooks', 'idx_titulo')) {
                    $table->fullText(['titulo', 'descripcion'])->change();
                }
                if (Schema::hasColumn('audiobooks', 'narrador') && !Schema::hasIndex('audiobooks', 'idx_narrador')) {
                    $table->index('narrador', 'idx_narrador');
                }
                if (Schema::hasColumn('audiobooks', 'genero') && !Schema::hasIndex('audiobooks', 'idx_genero')) {
                    $table->index('genero', 'idx_genero');
                }
                if (Schema::hasColumn('audiobooks', 'created_at') && !Schema::hasIndex('audiobooks', 'idx_created_at')) {
                    $table->index('created_at', 'idx_created_at');
                }
            });
        }
    }

    public function down(): void
    {
        // Remover índices de forma segura
        if (Schema::hasTable('libros')) {
            Schema::table('libros', function (Blueprint $table) {
                $table->dropIndexIfExists('idx_titulo');
                $table->dropIndexIfExists('idx_autor');
                $table->dropIndexIfExists('idx_genero');
                $table->dropIndexIfExists('idx_is_premium');
                $table->dropIndexIfExists('idx_created_at');
                $table->dropIndexIfExists('idx_popularidad');
            });
        }

        if (Schema::hasTable('mangas')) {
            Schema::table('mangas', function (Blueprint $table) {
                $table->dropIndexIfExists('idx_titulo');
                $table->dropIndexIfExists('idx_autor');
                $table->dropIndexIfExists('idx_genero');
                $table->dropIndexIfExists('idx_created_at');
            });
        }

        if (Schema::hasTable('comics')) {
            Schema::table('comics', function (Blueprint $table) {
                $table->dropIndexIfExists('idx_titulo');
                $table->dropIndexIfExists('idx_autor');
                $table->dropIndexIfExists('idx_genero');
                $table->dropIndexIfExists('idx_created_at');
            });
        }

        if (Schema::hasTable('audiobooks')) {
            Schema::table('audiobooks', function (Blueprint $table) {
                $table->dropIndexIfExists('idx_titulo');
                $table->dropIndexIfExists('idx_narrador');
                $table->dropIndexIfExists('idx_genero');
                $table->dropIndexIfExists('idx_created_at');
            });
        }
    }
};
