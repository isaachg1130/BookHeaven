import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useReadingAnalytics - Custom hook para consumir datos de análisis de lectura
 *
 * Endpoints:
 * - GET /api/admin/reading-analytics (comparativa completa)
 * - GET /api/admin/reading-analytics/by-gender
 * - GET /api/admin/reading-analytics/by-age
 * - GET /api/admin/reading-analytics/by-country
 * - GET /api/admin/reading-analytics/by-user-type
 * - GET /api/admin/reading-analytics/monthly-trends
 * - GET /api/admin/reading-analytics/popular-content
 *
 * Retorna: { data, loading, error, retry }
 * Auto-refresh cada 30 segundos
 */
const useReadingAnalytics = (
  endpoint = "/api/admin/reading-analytics",
  refreshIntervalSeconds = 30,
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchReadingAnalytics = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        setError(null);

        const token = localStorage.getItem("auth_token");

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(
            `Error ${response.status}: No se pudo obtener datos de lectura`,
          );
        }

        const responseData = await response.json();
        setData(responseData);
      } catch (err) {
        console.error("Error en useReadingAnalytics:", err);
        setError(err.message || "Error al obtener datos de lectura");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [endpoint],
  );

  useEffect(() => {
    fetchReadingAnalytics();

    if (refreshIntervalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        fetchReadingAnalytics(true); // silent: no spinner en auto-refresh
      }, refreshIntervalSeconds * 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchReadingAnalytics, refreshIntervalSeconds]);

  const retry = useCallback(() => {
    fetchReadingAnalytics();
  }, [fetchReadingAnalytics]);

  return { data, loading, error, retry };
};

export default useReadingAnalytics;
