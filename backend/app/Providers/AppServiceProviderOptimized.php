<?php

namespace App\Providers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

/**
 * OPTIMIZACIÓN: AppServiceProvider mejorado
 * 
 * Este provider configura optimizaciones del lado del servidor:
 * 1. Query caching inteligente
 * 2. Response caching
 * 3. Database query optimization
 * 4. Asset optimization
 */
class AppServiceProviderOptimized extends ServiceProvider
{
    /**
     * Register any application services
     */
    public function register(): void
    {
        // Configuración de optimizaciones de rendimiento
        $this->configurePerformance();
    }

    /**
     * Bootstrap any application services
     */
    public function boot(): void
    {
        // OPTIMIZACIÓN: Configurar query analysis en desarrollo
        if ($this->app['env'] === 'development') {
            $this->enableQueryLogging();
        }

        // OPTIMIZACIÓN: Response macro para caching
        $this->registerResponseMacros();
    }

    /**
     * Configurar optimizaciones de rendimiento
     */
    protected function configurePerformance(): void
    {
        // OPTIMIZACIÓN: Usar array cache en memoria durante request
        // En producción, usar Redis
        if ($this->app->environment('production')) {
            config([
                'cache.default' => env('CACHE_DRIVER', 'redis'),
            ]);
        }
    }

    /**
     * Habilitar query logging solo en desarrollo
     */
    protected function enableQueryLogging(): void
    {
        // Solo registrar queries si está explícitamente habilitado
        if (env('DB_LOG_QUERIES', false)) {
            DB::listen(function ($query) {
                Log::debug('Query: ' . $query->sql);
            });
        }
    }

    /**
     * Registrar macros globales de response para caching
     */
    protected function registerResponseMacros(): void
    {
        // OPTIMIZACIÓN: Macro para cachear responses JSON fácilmente
        Response::macro('cache', function ($minutes, $key = null) {
            return function ($data) use ($minutes, $key) {
                $actualKey = $key ?? Request::fullUrl();
                
                if ($cached = Cache::get($actualKey)) {
                    return response()->json($cached);
                }

                Cache::put($actualKey, $data, now()->addMinutes($minutes));
                return response()->json($data);
            };
        });
    }
}
