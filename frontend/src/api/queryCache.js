// api/queryCache.js
/**
 * Sistema simple pero efectivo de caché para queries de API
 * Evita requests duplicados en la misma sesión
 * Expiración automática después de N segundos
 */

class QueryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.hits = 0;
    this.misses = 0;
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos por defecto
  }

  /**
   * Obtener valor del caché
   */
  get(key) {
    if (this.cache.has(key)) {
      this.hits++;
      console.log(`✅ CACHE HIT: ${key} (Total hits: ${this.hits})`);
      return this.cache.get(key);
    }
    this.misses++;
    console.log(`❌ CACHE MISS: ${key} (Total misses: ${this.misses})`);
    return null;
  }

  /**
   * Guardar valor en caché
   */
  set(key, value, ttl = this.defaultTTL) {
    // Limpiar timer anterior si existe
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, value);

    // Expiración automática
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
      console.log(`🗑️  Cache expirado: ${key}`);
    }, ttl);

    this.timers.set(key, timer);
  }

  /**
   * Limpiar caché específica
   */
  clear(keyPattern) {
    if (!keyPattern) {
      // Limpiar todo si no se especifica patrón
      this.cache.clear();
      this.timers.forEach((timer) => clearTimeout(timer));
      this.timers.clear();
      console.log("🗑️  Cache completamente limpiado");
      return;
    }

    // Limpiar por patrón
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key));
          this.timers.delete(key);
        }
      }
    }
    console.log(`🗑️  Cache limpiado para patrón: ${keyPattern}`);
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(2) : 0;
    return {
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.size,
    };
  }

  /**
   * Resetear estadísticas
   */
  resetStats() {
    this.hits = 0;
    this.misses = 0;
    console.log("📊 Estadísticas reseteadas");
  }
}

// Instancia global
export const queryCache = new QueryCache();

/**
 * Wrapper para cachear un fetch automaticamente
 * Usage:
 *   const data = await cacheFetch('libros_home', () => contentAPI.getLibros(...))
 */
export const cacheFetch = async (cacheKey, fetchFn, ttl = 5 * 60 * 1000) => {
  // Verificar caché primero
  const cached = queryCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Si no está en caché, hacer la petición
  try {
    const result = await fetchFn();
    queryCache.set(cacheKey, result, ttl);
    return result;
  } catch (error) {
    console.error(`Error en cacheFetch para ${cacheKey}:`, error);
    throw error;
  }
};

// Para debugging en console
if (typeof window !== "undefined") {
  window.__queryCache = queryCache;
  console.log("💾 Query Cache disponible como window.__queryCache");
}
