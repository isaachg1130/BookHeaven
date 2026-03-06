<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content_type',
        'content_id',
        'rating',
        'comment',
    ];

    /**
     * Get the user that wrote the review.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the content associated with the review.
     * Manual mapping since content_type is a simple string.
     */
    public function content()
    {
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
}
