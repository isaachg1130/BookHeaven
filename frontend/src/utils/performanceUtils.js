/**
 * Performance Utilities - Herramientas para optimizar rendimiento
 */

/**
 * Debounce - Evita múltiples llamadas a función mientras se escriba/realiza acciones
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Milisegundos de espera
 * @returns {Function} Función debounceada
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle - Ejecuta función máximo una vez cada X milisegundos
 * Útil para scroll, resize events
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Milisegundos entre ejecuciones
 * @returns {Function} Función throttleada
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function throttled(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * RequestAnimationFrame Throttle - Para optimizar animations y scroll
 * @param {Function} func - Función a ejecutar
 * @returns {Function} Función optimizada con RAF
 */
export const rafThrottle = (func) => {
  let frameId = null;
  return function raf(...args) {
    if (frameId === null) {
      frameId = requestAnimationFrame(() => {
        func(...args);
        frameId = null;
      });
    }
  };
};

/**
 * Lazy Load Images - Precarga imágenes usando Intersection Observer
 * @param {Function} callback - Función a ejecutar cuando imagen es visible
 */
export const observeIntersection = (elements, callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: "50px",
    threshold: 0.01,
    ...options,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);

  elements.forEach((el) => observer.observe(el));
  return observer;
};

/**
 * Prefetch DNS - Mejora latencia al resolver dominios anticipadamente
 * @param {string} domain - Dominio a prefetch
 */
export const prefetchDomain = (domain) => {
  if (typeof document !== "undefined") {
    const link = document.createElement("link");
    link.rel = "dns-prefetch";
    link.href = domain;
    document.head.appendChild(link);
  }
};

/**
 * Preload Resource - Preload recursos críticos
 * @param {string} href - URL del recurso
 * @param {string} as - Tipo de recurso (script, style, font, etc)
 */
export const preloadResource = (href, as = "script") => {
  if (typeof document !== "undefined") {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = as;
    link.href = href;
    if (as === "font") {
      link.crossOrigin = "anonymous";
    }
    document.head.appendChild(link);
  }
};

/**
 * Memory-efficient debounce para búsquedas y filtrados
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Milisegundos de espera
 * @returns {Function} Función debounceada con capacidad de cancelación
 */
export const createDebounce = (func, wait = 300) => {
  let timeoutId = null;

  const debounced = (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
};

/**
 * Preload siguiente página automáticamente durante scroll
 * Útil para carousels y listas infinitas
 * @param {Function} loader - Función que carga el siguiente set de datos
 * @param {number} threshold - % del scroll antes de cargar
 */
export const createInfiniteScrollLoader = (loader, threshold = 0.8) => {
  let isLoading = false;

  const handleScroll = () => {
    if (isLoading) return;

    const scrollPercentage =
      (window.innerHeight + window.scrollY) /
      document.documentElement.scrollHeight;

    if (scrollPercentage > threshold) {
      isLoading = true;
      loader().finally(() => {
        isLoading = false;
      });
    }
  };

  return throttle(handleScroll, 500);
};

/**
 * Medir performance de una operación
 * @param {string} label - Nombre de la operación
 * @param {Function} fn - Función a medir
 * @returns {Promise<any>} Resultado de la función
 */
export const measurePerformance = async (label, fn) => {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.log(`⏱️  ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`❌ ${label} falló en ${(end - start).toFixed(2)}ms:`, error);
    throw error;
  }
};

/**
 * Batch DOM updates para reducir repaints
 * @param {Array<Function>} updates - Array de funciones que actualizan DOM
 */
export const batchDOMUpdates = (updates) => {
  requestAnimationFrame(() => {
    updates.forEach((update) => update());
  });
};

/**
 * Reportar Core Web Vitals para monitoreo
 */
export const reportWebVitals = () => {
  if ("web-vital" in window) return;

  // Largest Contentful Paint
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log("📊 LCP:", lastEntry.renderTime || lastEntry.loadTime);
    });
    observer.observe({ entryTypes: ["largest-contentful-paint"] });
  } catch {
    // Ignored - PerformanceObserver not supported
  }

  // Cumulative Layout Shift
  try {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      console.log("📊 CLS:", clsValue);
    });
    observer.observe({ entryTypes: ["layout-shift"] });
  } catch {
    // Ignored - PerformanceObserver not supported
  }
};

export default {
  debounce,
  throttle,
  rafThrottle,
  observeIntersection,
  prefetchDomain,
  preloadResource,
  createDebounce,
  createInfiniteScrollLoader,
  measurePerformance,
  batchDOMUpdates,
  reportWebVitals,
};
