<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class ReadingHistory extends Model
{
    use HasFactory;

    protected $table = 'reading_history';

    protected $fillable = [
        'user_id',
        'content_type',
        'content_id',
        'pages_read',
        'total_pages',
        'reading_time_minutes',
        'progress_percentage',
        'status',
        'rating',
        'review',
        'started_at',
        'last_read_at',
        'completed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'last_read_at' => 'datetime',
        'completed_at' => 'datetime',
        'progress_percentage' => 'float',
    ];

    /**
     * Relationship: Usuario propietario del historial
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtener el contenido polimórfico (Libro, Manga, Comic, Audiobook)
     */
    public function getContent()
    {
        return match($this->content_type) {
            'libro' => Libro::find($this->content_id),
            'manga' => Manga::find($this->content_id),
            'comic' => Comic::find($this->content_id),
            'audiobook' => Audiobook::find($this->content_id),
            default => null,
        };
    }

    /**
     * Calcular duración desde que comenzó la lectura
     */
    public function getDaysReadingAttribute()
    {
        if (!$this->started_at) {
            return 0;
        }
        return $this->started_at->diffInDays($this->completed_at ?? now());
    }

    /**
     * Calcular velocidad de lectura (páginas por día)
     */
    public function getReadingSpeedAttribute()
    {
        $days = $this->days_reading ?: 1;
        return round($this->pages_read / $days, 2);
    }

    /**
     * Determinar calidad del contenido por rating promedio
     */
    public function getQualityIndicatorAttribute()
    {
        if (!$this->rating) {
            return null;
        }
        return match(true) {
            $this->rating >= 5 => 'excelente',
            $this->rating >= 4 => 'bueno',
            $this->rating >= 3 => 'regular',
            default => 'pobre',
        };
    }

    /**
     * Scope: Lecturas completadas
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope: Lecturas activas
     */
    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'completed')->where('status', '!=', 'abandoned');
    }

    /**
     * Scope: Por tipo de contenido
     */
    public function scopeByContentType($query, $type)
    {
        return $query->where('content_type', $type);
    }

    /**
     * Scope: Entre fechas
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Actualizar progreso de lectura
     */
    public function updateProgress($pagesRead, $totalPages = null)
    {
        $this->pages_read = $pagesRead;
        if ($totalPages) {
            $this->total_pages = $totalPages;
        }
        
        $this->progress_percentage = ($this->total_pages > 0) 
            ? min(100, ($pagesRead / $this->total_pages) * 100) 
            : 0;
        
        if ($this->progress_percentage >= 100) {
            $this->status = 'completed';
            $this->completed_at = now();
        } elseif ($this->progress_percentage > 0) {
            $this->status = 'reading';
        }
        
        $this->last_read_at = now();
        return $this->save();
    }
};
