<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content_type',
        'content_id',
    ];

    /**
     * Get the owning content model.
     */
    public function content()
    {
        // Esto es un poco especial porque Laravel espera Relation::morphMap o nombres completos de clases app\Models\Libro
        // Pero en la DB estamos guardando 'libro', 'manga', etc.
        // Podríamos definir un accesor o usar lógica custom.
        // Por simplicidad, asumiremos que content_type es el string simple y lo mapeamos.
        
        $modelClass = match($this->content_type) {
            'libro' => Libro::class,
            'manga' => Manga::class,
            'comic' => Comic::class,
            'audiobook' => Audiobook::class,
            default => null,
        };
        
        if ($modelClass) {
            return $this->belongsTo($modelClass, 'content_id');
        }
        
        return null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
