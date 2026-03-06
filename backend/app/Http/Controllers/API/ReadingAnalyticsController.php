<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\ReadingAnalyticsService;
use Illuminate\Http\JsonResponse;

class ReadingAnalyticsController extends Controller
{
    private ReadingAnalyticsService $analyticsService;

    public function __construct(ReadingAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Obtener todas las comparativas de lectura por datos demográficos
     * GET /api/admin/reading-analytics
     */
    public function compare(): JsonResponse
    {
        return response()->json([
            'comparativas' => $this->analyticsService->compareContentPreferences(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Obtener análisis de lectura por género
     * GET /api/admin/reading-analytics/by-gender
     */
    public function byGender(): JsonResponse
    {
        return response()->json($this->analyticsService->getReadingByDemographics());
    }

    /**
     * Obtener análisis de lectura por rango de edad
     * GET /api/admin/reading-analytics/by-age
     */
    public function byAge(): JsonResponse
    {
        return response()->json($this->analyticsService->getReadingByAgeRange());
    }

    /**
     * Obtener análisis de lectura por país
     * GET /api/admin/reading-analytics/by-country
     */
    public function byCountry(): JsonResponse
    {
        return response()->json($this->analyticsService->getReadingByCountry());
    }

    /**
     * Obtener análisis de lectura por tipo de usuario (premium/standard)
     * GET /api/admin/reading-analytics/by-user-type
     */
    public function byUserType(): JsonResponse
    {
        return response()->json($this->analyticsService->getReadingByUserType());
    }

    /**
     * Obtener tendencias mensuales
     * GET /api/admin/reading-analytics/monthly-trends
     */
    public function monthlyTrends(): JsonResponse
    {
        return response()->json([
            'trends' => $this->analyticsService->getMonthlyTrends(12),
        ]);
    }

    /**
     * Obtener contenido más popular
     * GET /api/admin/reading-analytics/popular-content
     */
    public function popularContent(): JsonResponse
    {
        return response()->json([
            'content' => $this->analyticsService->getPopularContent(),
        ]);
    }
}
