/**
 * OPTIMIZACIÓN: Utilidades para optimización de imágenes (Funciones)
 *
 * Funciones helper sin estado de React:
 * 1. URL optimization
 * 2. Responsive images generation
 * 3. Image preload/prefetch
 */

/**
 * Obtener URL optimizada de imagen
 */
export function getOptimizedImageUrl(url, options = {}) {
  const {
    width,
    height,
    quality = 85,
    format = "auto", // 'auto' | 'webp' | 'jpg' | 'png'
  } = options;

  // Si es URL local, aplicar transformaciones
  if (url?.startsWith("/")) {
    const params = new URLSearchParams();
    if (width) params.append("w", width);
    if (height) params.append("h", height);
    params.append("q", quality);
    if (format !== "auto") params.append("f", format);

    return `${url}?${params.toString()}`;
  }

  return url;
}

/**
 * Generar srcSet responsivo
 */
export function generateResponsiveSrcSet(
  basePath,
  formats = [320, 640, 1024, 1920],
) {
  return formats
    .map((width) => `${getOptimizedImageUrl(basePath, { width })} ${width}w`)
    .join(", ");
}

/**
 * Preload de imágenes críticas
 */
export function preloadImage(url) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Prefetch de imágenes
 */
export function prefetchImage(url) {
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Instrucciones CSS para lazy loading
 */
export const lazyImageCSS = `
  img.loading {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shine 1.5s infinite;
  }

  @keyframes shine {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  img.loaded {
    opacity: 1;
  }
`;
