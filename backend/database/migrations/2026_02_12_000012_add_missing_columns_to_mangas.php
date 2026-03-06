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
        Schema::table('mangas', function (Blueprint $table) {
            // Agregar columnas faltantes
            if (!Schema::hasColumn('mangas', 'genero')) {
                $table->string('genero')->nullable();
            }
            if (!Schema::hasColumn('mangas', 'is_premium')) {
                $table->boolean('is_premium')->default(false);
            }
            if (!Schema::hasColumn('mangas', 'tiene_derechos_autor')) {
                $table->boolean('tiene_derechos_autor')->default(false);
            }
            if (!Schema::hasColumn('mangas', 'fecha_publicacion')) {
                $table->timestamp('fecha_publicacion')->nullable();
            }
            if (!Schema::hasColumn('mangas', 'popularidad')) {
                $table->integer('popularidad')->default(0);
            }
            if (!Schema::hasColumn('mangas', 'uploaded_by')) {
                $table->foreignId('uploaded_by')->nullable()->constrained('users')->cascadeOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mangas', function (Blueprint $table) {
            if (Schema::hasColumn('mangas', 'genero')) {
                $table->dropColumn('genero');
            }
            if (Schema::hasColumn('mangas', 'is_premium')) {
                $table->dropColumn('is_premium');
            }
            if (Schema::hasColumn('mangas', 'tiene_derechos_autor')) {
                $table->dropColumn('tiene_derechos_autor');
            }
            if (Schema::hasColumn('mangas', 'fecha_publicacion')) {
                $table->dropColumn('fecha_publicacion');
            }
            if (Schema::hasColumn('mangas', 'popularidad')) {
                $table->dropColumn('popularidad');
            }
            if (Schema::hasColumn('mangas', 'uploaded_by')) {
                $table->dropForeign(['uploaded_by']);
                $table->dropColumn('uploaded_by');
            }
        });
    }
};
