<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Audiobook extends Model
{
    use HasFactory;

    protected $fillable = [
        'titulo',
        'descripcion',
        'autor',
        'imagen',
        'archivo_audio',
        'duracion_segundos',
        'narrador',
        'genero',
        'is_premium',
        'tiene_derechos_autor',
        'fecha_publicacion',
        'popularidad',
        'uploaded_by',
    ];

    protected $casts = [
        'is_premium' => 'boolean',
        'tiene_derechos_autor' => 'boolean',
        'fecha_publicacion' => 'datetime',
    ];

    /**
     * Obtener el usuario que subió el audiolibro
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Obtener la URL segura para acceder al audio
     */
    public function getAudioUrl(): string
    {
        return route('api.content.serve-audio', ['id' => $this->id]);
    }

    /**
     * Incrementar popularidad
     */
    public function incrementPopularity(): void
    {
        $this->increment('popularidad');
    }

    /**
     * Convertir duración de segundos a formato legible
     */
    public function getFormattedDuration(): string
    {
        $hours = intdiv($this->duracion_segundos, 3600);
        $minutes = intdiv($this->duracion_segundos % 3600, 60);
        $seconds = $this->duracion_segundos % 60;

        if ($hours > 0) {
            return sprintf('%dh %dm %ds', $hours, $minutes, $seconds);
        }

        return sprintf('%dm %ds', $minutes, $seconds);
    }

    /**
     * Booted - Model events
     */
    protected static function booted(): void
    {
        static::creating(function ($model) {
            // Si tiene derechos de autor, automáticamente es premium
            if ($model->tiene_derechos_autor) {
                $model->is_premium = true;
            }
        });

        static::updating(function ($model) {
            // Si tiene derechos de autor, automáticamente es premium
            if ($model->tiene_derechos_autor) {
                $model->is_premium = true;
            }
        });
    }
}
