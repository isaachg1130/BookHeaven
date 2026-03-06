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
        Schema::table('libros', function (Blueprint $table) {
            // Agregar columnas faltantes
            if (!Schema::hasColumn('libros', 'titulo')) {
                $table->string('titulo')->after('nombre')->nullable();
            }
            if (!Schema::hasColumn('libros', 'genero')) {
                $table->string('genero')->nullable();
            }
            if (!Schema::hasColumn('libros', 'is_premium')) {
                $table->boolean('is_premium')->default(false);
            }
            if (!Schema::hasColumn('libros', 'tiene_derechos_autor')) {
                $table->boolean('tiene_derechos_autor')->default(false);
            }
            if (!Schema::hasColumn('libros', 'fecha_publicacion')) {
                $table->timestamp('fecha_publicacion')->nullable();
            }
            if (!Schema::hasColumn('libros', 'popularidad')) {
                $table->integer('popularidad')->default(0);
            }
            if (!Schema::hasColumn('libros', 'uploaded_by')) {
                $table->foreignId('uploaded_by')->nullable()->constrained('users')->cascadeOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('libros', function (Blueprint $table) {
            if (Schema::hasColumn('libros', 'titulo')) {
                $table->dropColumn('titulo');
            }
            if (Schema::hasColumn('libros', 'genero')) {
                $table->dropColumn('genero');
            }
            if (Schema::hasColumn('libros', 'is_premium')) {
                $table->dropColumn('is_premium');
            }
            if (Schema::hasColumn('libros', 'tiene_derechos_autor')) {
                $table->dropColumn('tiene_derechos_autor');
            }
            if (Schema::hasColumn('libros', 'fecha_publicacion')) {
                $table->dropColumn('fecha_publicacion');
            }
            if (Schema::hasColumn('libros', 'popularidad')) {
                $table->dropColumn('popularidad');
            }
            if (Schema::hasColumn('libros', 'uploaded_by')) {
                $table->dropForeign(['uploaded_by']);
                $table->dropColumn('uploaded_by');
            }
        });
    }
};
