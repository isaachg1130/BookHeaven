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
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Polymorphic relationship para contenido (libro, manga, comic, audiobook)
            $table->string('content_type'); // 'libro', 'manga', 'comic', 'audiobook'
            $table->unsignedBigInteger('content_id');
            
            $table->timestamps();

            // Evitar duplicados: un usuario solo puede tener un item como favorito una vez
            $table->unique(['user_id', 'content_type', 'content_id']);
            
            // Indices para mejorar performance
            $table->index(['user_id']);
            $table->index(['content_type', 'content_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
