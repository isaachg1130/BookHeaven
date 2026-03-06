import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useDashboardData - Custom hook para consumir datos del dashboard
 *
 * Consume: GET /api/admin/dashboard (backend-optimized endpoint)
 * Retorna: { data, loading, error, retry, isAutoRefreshing }
 *
 * Features:
 * - Single optimized endpoint (no N+1 queries)
 * - Auth token auto-handled via localStorage
 * - Retry logic para errores de red
 * - Loading/error states
 * - Memoization del retry callback
 * - Auto-refresh cada 30 segundos (configurable)
 */
const useDashboardData = (refreshIntervalSeconds = 30) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const intervalRef = useRef(null);

  /**
   * Fetch dashboard data desde backend
   * GET /api/admin/dashboard (admin-only, requires auth:sanctum)
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      if (!isAutoRefreshing) {
        setLoading(true);
      }
      setError(null);

      // El token está guardado en localStorage desde useAuth context
      const token = localStorage.getItem("auth_token");
      console.log("🔐 Token encontrado:", !!token);
      console.log("📡 Intentando conectar con /api/admin/dashboard");

      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log("✅ Response status:", response.status);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("No tienes permisos para acceder al dashboard");
        }
        if (response.status === 401) {
          throw new Error("Sesión expirada. Por favor inicia sesión de nuevo");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Error desconocido del servidor");
      }

      // Data verificada y correcta
      setData(result.data);
      setError(null);
      if (!isAutoRefreshing) {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "No se pudo cargar los datos del dashboard");
      if (!isAutoRefreshing) {
        setLoading(false);
      }
    }
  }, [isAutoRefreshing]);

  /**
   * Configurar auto-refresh con interval
   */
  useEffect(() => {
    // Fetch inicial
    fetchDashboardData();

    // Configurar interval para auto-refresh
    if (refreshIntervalSeconds > 0) {
      setIsAutoRefreshing(true);
      intervalRef.current = setInterval(() => {
        fetchDashboardData();
      }, refreshIntervalSeconds * 1000);

      console.log(
        `🔄 Auto-refresh configurado cada ${refreshIntervalSeconds}s`,
      );
    }

    // Cleanup: limpio el interval al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log("🛑 Auto-refresh detenido");
      }
    };
  }, [fetchDashboardData, refreshIntervalSeconds]);

  /**
   * Retry handler - usuario puede forzar recarga
   */
  const retry = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    retry,
    isAutoRefreshing,
  };
};

export default useDashboardData;
