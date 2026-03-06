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
        Schema::create('reading_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Polymorphic relationship para contenido (libro, manga, comic, audiobook)
            $table->string('content_type'); // 'libro', 'manga', 'comic', 'audiobook'
            $table->unsignedBigInteger('content_id');
            
            // Datos de lectura
            $table->integer('pages_read')->default(0); // Páginas/capítulos leídos
            $table->integer('total_pages')->default(0); // Total del contenido
            $table->integer('reading_time_minutes')->default(0); // Tiempo en minutos
            $table->decimal('progress_percentage', 5, 2)->default(0); // 0-100%
            $table->enum('status', ['started', 'reading', 'completed', 'paused', 'abandoned'])->default('started');
            
            // Ranking
            $table->integer('rating')->nullable(); // 1-5 stars
            $table->text('review')->nullable();
            
            // Timestamps
            $table->timestamp('started_at')->nullable();
            $table->timestamp('last_read_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            // Indexes para queries rápidas
            $table->index('user_id');
            $table->index('content_type');
            $table->index('status');
            $table->index(['user_id', 'content_type']);
            $table->index(['content_type', 'content_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reading_history');
    }
};
