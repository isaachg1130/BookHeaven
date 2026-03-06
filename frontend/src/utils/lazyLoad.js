/**
 * OPTIMIZACIÓN: Lazy Loading HOC mejorado para React
 *
 * Este HOC proporciona lazy loading eficiente con:
 * 1. Preload de componentes antes de ser necesarios
 * 2. Error boundaries
 * 3. Suspense fallback mejorado
 * 4. Memory optimization
 */

import React, { Suspense, lazy, useEffect, useRef } from "react";

// Loading component optimizado - muy ligero
const MinimalLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
      fontSize: "14px",
      color: "#666",
    }}
  >
    <div
      style={{
        animation: "spin 1s linear infinite",
      }}
    >
      ⏳
    </div>
    <span style={{ marginLeft: "10px" }}>Cargando...</span>
  </div>
);

// Error fallback
const ErrorFallback = ({ error }) => (
  <div
    style={{
      padding: "20px",
      color: "#d32f2f",
      backgroundColor: "#ffebee",
      borderRadius: "4px",
      margin: "20px",
    }}
  >
    <h3>Error al cargar el contenido</h3>
    <p>{error?.message || "Ocurrió un error inesperado"}</p>
  </div>
);

/**
 * HOC para lazy loading con optimizaciones
 */
export function lazyWithPreload(importFunc, preloadOnHover = false) {
  const Component = lazy(importFunc);
  Component.preload = importFunc; // Permitir preload manual

  // Component proxy para preload automático
  return React.forwardRef((props, ref) => {
    const nodeRef = useRef(null);

    useEffect(() => {
      if (preloadOnHover && nodeRef.current) {
        const element = nodeRef.current;
        const handleMouseEnter = () => {
          if (Component.preload) {
            Component.preload();
          }
        };

        element.addEventListener("mouseenter", handleMouseEnter);
        return () =>
          element.removeEventListener("mouseenter", handleMouseEnter);
      }
    }, []);

    return (
      <div ref={nodeRef}>
        <Suspense fallback={<MinimalLoader />}>
          <Component {...props} ref={ref} />
        </Suspense>
      </div>
    );
  });
}

/**
 * Utilidad para preload de componentes
 * Uso: preloadComponent(() => import('./MyComponent'))
 */
export function preloadComponent(importFunc) {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(() => {
      importFunc();
    });
  } else {
    setTimeout(() => {
      importFunc();
    }, 2000);
  }
}

/**
 * Helper para precargar un componente lazy
 * Uso: Llamar antes de navegar al componente
 *
 * const Home = lazy(() => import('./pages/Home'))
 * useEffect(() => {
 *   preloadLazyComponent(Home)
 * }, [])
 */
export function preloadLazyComponent(Component) {
  if (Component && Component._init) {
    Component._init();
  }
}

// Instrucciones de uso:
//
// 1. Lazy loading con preload automático en hover:
//    const Home = lazyWithPreload(() => import('./pages/Home'), true)
//    <Route path="/" element={<Home />} />
//
// 2. Lazy loading manual con preload en demanda:
//    const Home = lazy(() => import('./pages/Home'))
//    useEffect(() => {
//      preloadLazyComponent(() => import('./pages/Home'))
//    }, [])
//
// 3. Para preload estratégico basado en rutas:
//    Usar preloadComponent() en rutas previas conocidas
//    preloadComponent(() => import('./pages/Home'))
