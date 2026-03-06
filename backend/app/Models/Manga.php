<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\GeneratesPdfPath;

class Manga extends Model
{
    use HasFactory, GeneratesPdfPath;

    protected $fillable = [
        'titulo',
        'descripcion',
        'autor',
        'imagen',
        'pdf',
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
     * Obtener el usuario que subió el manga
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Obtener la URL segura para acceder al PDF
     */
    public function getPdfUrl(): string
    {
        return route('api.content.serve-pdf', ['type' => 'manga', 'id' => $this->id]);
    }

    /**
     * Incrementar popularidad
     */
    public function incrementPopularity(): void
    {
        $this->increment('popularidad');
    }

    /**
     * Booted - Model events
     */
    protected static function booted(): void
    {
        static::creating(function ($model) {
            // Generar PDF e imagen si están vacíos
            $model->generateMediaPathsIfEmpty('mangas');

            // Si tiene derechos de autor, automáticamente es premium
            if ($model->tiene_derechos_autor) {
                $model->is_premium = true;
            }
        });

        static::updating(function ($model) {
            // Generar PDF e imagen si están vacíos
            $model->generateMediaPathsIfEmpty('mangas');

            // Si tiene derechos de autor, automáticamente es premium
            if ($model->tiene_derechos_autor) {
                $model->is_premium = true;
            }
        });
    }
}

