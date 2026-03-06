<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'transaction_id',
        'amount',
        'currency',
        'status',
        'plan_type',
        'duration_days',
        'payment_method',
        'response_data',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'response_data' => 'array',
    ];

    /**
     * Obtener el usuario que realizó el pago
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Verificar si el pago fue completado
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Obtener el estado del pago en formato legible
     */
    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'pending' => 'Pendiente',
            'completed' => 'Completado',
            'failed' => 'Fallido',
            'cancelled' => 'Cancelado',
            default => 'Desconocido',
        };
    }
}
