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
            // Si existe 'nombre' pero también existe 'titulo', dropar 'nombre'
            if (Schema::hasColumn('libros', 'nombre') && Schema::hasColumn('libros', 'titulo')) {
                $table->dropColumn('nombre');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No hacer nada en reverse
    }
};
