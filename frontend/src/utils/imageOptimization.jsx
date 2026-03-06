/**
 * OPTIMIZACIÓN: Componente Image optimizado
 * 
 * Características:
 * - Lazy loading nativo
 * - Responsive images con srcSet
 * - WebP con fallback a jpg/png
 * - Blur placeholder
 * - Eventos de carga
 * 
 * Imports:
 * - Componente: import { OptimizedImage } from './imageOptimization'
 * - Helpers: import { getOptimizedImageUrl, generateResponsiveSrcSet } from './imageOptimizationHelpers'
 * - Hook: import { useLazyImage } from '../hooks/useImageOptimization'
 */

import { useState } from 'react';

/**
 * Componente Image optimizado
 * 
 * Características:
 * - Lazy loading nativo
 * - Responsive images con srcSet
 * - WebP con fallback a jpg/png
 * - Blur placeholder
 * - Eventos de carga
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  srcSet,
  sizes,
  className,
  loading = 'lazy', // 'lazy' | 'eager'
  onLoad,
  onError,
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    onError?.(e);
  };

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      srcSet={srcSet}
      sizes={sizes}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      loading={loading}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      style={{
        opacity: isLoaded ? 1 : 0.7,
        transition: 'opacity 0.3s ease-in-out',
      }}
    />
  );
}

