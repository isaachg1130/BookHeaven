<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Audiobook;

class AudiobookPolicy
{
    public function view(User $user, Audiobook $audiobook): bool
    {
        if ($audiobook->is_premium && !$user->isAdmin() && !$user->isPremium()) {
            return false;
        }
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isPremium();
    }

    public function update(User $user, Audiobook $audiobook): bool
    {
        return $user->isAdmin() || $audiobook->uploaded_by === $user->id;
    }

    public function delete(User $user, Audiobook $audiobook): bool
    {
        return $user->isAdmin() || $audiobook->uploaded_by === $user->id;
    }

    public function changePremiumStatus(User $user, Audiobook $audiobook): bool
    {
        return $user->isAdmin();
    }
}
