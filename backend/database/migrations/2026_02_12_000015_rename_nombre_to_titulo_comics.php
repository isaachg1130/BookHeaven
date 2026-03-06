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
        if (Schema::hasColumn('comics', 'nombre')) {
            Schema::table('comics', function (Blueprint $table) {
                $table->renameColumn('nombre', 'titulo');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('comics', 'titulo')) {
            Schema::table('comics', function (Blueprint $table) {
                $table->renameColumn('titulo', 'nombre');
            });
        }
    }
};
