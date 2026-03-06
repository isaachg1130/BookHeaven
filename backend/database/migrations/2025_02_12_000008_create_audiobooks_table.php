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
        Schema::create('audiobooks', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->string('autor')->nullable();
            $table->string('imagen')->nullable();
            $table->string('archivo_audio')->nullable();
            $table->integer('duracion_segundos')->default(0); // duración en segundos
            $table->string('narrador')->nullable();
            $table->string('genero')->nullable();
            $table->boolean('is_premium')->default(false);
            $table->boolean('tiene_derechos_autor')->default(false);
            $table->timestamp('fecha_publicacion')->nullable();
            $table->integer('popularidad')->default(0);
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audiobooks');
    }
};
