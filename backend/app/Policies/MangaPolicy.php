<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Manga;

class MangaPolicy
{
    public function view(User $user, Manga $manga): bool
    {
        if ($manga->is_premium && !$user->isAdmin() && !$user->isPremium()) {
            return false;
        }
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isPremium();
    }

    public function update(User $user, Manga $manga): bool
    {
        return $user->isAdmin() || $manga->uploaded_by === $user->id;
    }

    public function delete(User $user, Manga $manga): bool
    {
        return $user->isAdmin() || $manga->uploaded_by === $user->id;
    }

    public function changePremiumStatus(User $user, Manga $manga): bool
    {
        return $user->isAdmin();
    }
}
