/**
 * OPTIMIZACIÓN: Custom Hooks para optimización de imágenes
 */

import { useEffect, useCallback } from "react";

/**
 * Hook para lazy loading de imágenes
 */
export function useLazyImage(ref, callback) {
  const callbackRef = useCallback(() => {
    if (callback) {
      callback(ref.current);
    }
  }, [callback, ref]);

  useEffect(() => {
    const currentRef = ref.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && currentRef) {
            callbackRef();
            observer.unobserve(currentRef);
          }
        });
      },
      {
        rootMargin: "50px",
      },
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, callbackRef]);
}
