<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Libro;

class LibroPolicy
{
    /**
     * Determine whether the user can view the libro.
     */
    public function view(User $user, Libro $libro): bool
    {
        // Si no es premium, solo puede ver contenido no premium
        if ($libro->is_premium && !$user->isAdmin() && !$user->isPremium()) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can create libros.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isPremium();
    }

    /**
     * Determine whether the user can update the libro.
     */
    public function update(User $user, Libro $libro): bool
    {
        // Solo el propietario o admin pueden editar
        return $user->isAdmin() || $libro->uploaded_by === $user->id;
    }

    /**
     * Determine whether the user can delete the libro.
     */
    public function delete(User $user, Libro $libro): bool
    {
        // Solo el propietario o admin pueden eliminar
        return $user->isAdmin() || $libro->uploaded_by === $user->id;
    }

    /**
     * Determine whether the user can change premium status.
     */
    public function changePremiumStatus(User $user, Libro $libro): bool
    {
        // Solo admin puede cambiar el estado premium
        return $user->isAdmin();
    }
}
