<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Comic;

class ComicPolicy
{
    public function view(User $user, Comic $comic): bool
    {
        if ($comic->is_premium && !$user->isAdmin() && !$user->isPremium()) {
            return false;
        }
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isPremium();
    }

    public function update(User $user, Comic $comic): bool
    {
        return $user->isAdmin() || $comic->uploaded_by === $user->id;
    }

    public function delete(User $user, Comic $comic): bool
    {
        return $user->isAdmin() || $comic->uploaded_by === $user->id;
    }

    public function changePremiumStatus(User $user, Comic $comic): bool
    {
        return $user->isAdmin();
    }
}
