<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Libro;
use App\Models\Manga;
use App\Models\Comic;
use App\Models\Audiobook;
use App\Policies\LibroPolicy;
use App\Policies\MangaPolicy;
use App\Policies\ComicPolicy;
use App\Policies\AudiobookPolicy;
use App\Services\ContentService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Registrar ContentService como singleton para reutilización
        $this->app->singleton(ContentService::class, function ($app) {
            return new ContentService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registrar Policies
        Gate::policy(Libro::class, LibroPolicy::class);
        Gate::policy(Manga::class, MangaPolicy::class);
        Gate::policy(Comic::class, ComicPolicy::class);
        Gate::policy(Audiobook::class, AudiobookPolicy::class);
    }
}
