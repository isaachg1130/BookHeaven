<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\VerifyEmailCustom;
use App\Notifications\ResetPasswordCustom;


class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * OPTIMIZACIÓN: Removido eager loading automático de 'role' 
     * para evitar queries innecesarias. Usar load('role') explícitamente cuando sea necesario.
     */
    // protected $with = ['role']; // ❌ Removido - causa queries innecesarias en cada instancia

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'profile_photo_path',
        'premium_expires_at',
        'is_active',
        'bio',
        'last_login_at',
        'date_of_birth',
        'gender',
        'country',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'premium_expires_at' => 'datetime',
            'last_login_at' => 'datetime',
            'date_of_birth' => 'date',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmailCustom());
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordCustom($token));
    }

    /**
     * Obtener el rol del usuario
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Verificar si el usuario es admin
     * OPTIMIZACIÓN: Cache el resultado en memoria para evitar búsquedas repetidas
     */
    public function isAdmin(): bool
    {
        if (!isset($this->_isAdmin)) {
            $this->_isAdmin = $this->role && $this->role->name === 'admin';
        }
        return $this->_isAdmin;
    }
    private ?bool $_isAdmin = null;

    /**
     * Verificar si el usuario es premium
     * OPTIMIZACIÓN: Cache el resultado en memoria para evitar búsquedas repetidas
     */
    public function isPremium(): bool
    {
        if (!isset($this->_isPremium)) {
            // Premium si: (1) tiene rol premium Y (2) no ha expirado
            if (!$this->role || $this->role->name !== 'premium') {
                $this->_isPremium = false;
            } else if ($this->premium_expires_at === null) {
                $this->_isPremium = true; // Premium indefinido
            } else {
                $this->_isPremium = $this->premium_expires_at->isFuture();
            }
        }
        return $this->_isPremium;
    }
    private ?bool $_isPremium = null;

    /**
     * Verificar si el usuario es estándar
     * OPTIMIZACIÓN: Cache el resultado en memoria
     */
    public function isStandard(): bool
    {
        if (!isset($this->_isStandard)) {
            $this->_isStandard = $this->role && $this->role->name === 'standard';
        }
        return $this->_isStandard;
    }
    private ?bool $_isStandard = null;

    /**
     * Verificar si el usuario tiene un permiso específico
     */
    public function hasPermission(string $permissionName): bool
    {
        if (!$this->role) {
            return false;
        }
        return $this->role->hasPermission($permissionName);
    }

    /**
     * Asignar un rol al usuario
     */
    public function assignRole(Role|string $role): self
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->update(['role_id' => $role->id]);

        return $this;
    }

    /**
     * Obtener los pagos del usuario
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Obtener el historial de lectura del usuario
     */
    public function readingHistory()
    {
        return $this->hasMany(ReadingHistory::class);
    }
}
