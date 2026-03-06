// hooks/useContentCache.js
import { useCallback, useRef, useEffect } from "react";

/**
 * Hook personalizado para cachear contenido con expiración automática
 * Reduce requests duplicados y mejora rendimiento
 */
export const useContentCache = (cacheTimeMs = 5 * 60 * 1000) => {
  const cacheRef = useRef(new Map());
  const timersRef = useRef(new Map());

  const getCached = useCallback((key) => {
    return cacheRef.current.get(key);
  }, []);

  const setCached = useCallback(
    (key, value) => {
      // Limpiar timer anterior si existe
      if (timersRef.current.has(key)) {
        clearTimeout(timersRef.current.get(key));
      }

      // Guardar valor
      cacheRef.current.set(key, value);

      // Configurar expiración automática
      const timer = setTimeout(() => {
        cacheRef.current.delete(key);
        timersRef.current.delete(key);
      }, cacheTimeMs);

      timersRef.current.set(key, timer);
    },
    [cacheTimeMs],
  );

  const clearCache = useCallback((key) => {
    cacheRef.current.delete(key);
    if (timersRef.current.has(key)) {
      clearTimeout(timersRef.current.get(key));
      timersRef.current.delete(key);
    }
  }, []);

  const clearAllCache = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    cacheRef.current.clear();
    timersRef.current.clear();
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => clearAllCache();
  }, [clearAllCache]);

  return { getCached, setCached, clearCache, clearAllCache };
};
