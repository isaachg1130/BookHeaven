// src/api/client.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Cache simple en memoria para GET requests
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 segundos timeout para operaciones con archivos
});

// Interceptor para caché de GET requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Si NO es FormData, transformar a JSON y establecer header
  if (!(config.data instanceof FormData)) {
    if (config.data && typeof config.data === "object") {
      config.data = JSON.stringify(config.data);
      config.headers["Content-Type"] = "application/json";
    }
  } else {
    // Si ES FormData, ELIMINAR Content-Type para que axios lo auto-establezca
    delete config.headers["Content-Type"];
  }

  return config;
});

// Interceptor para manejar respuestas con error
apiClient.interceptors.response.use(
  (response) => {
    // Caché para GET requests exitosas
    if (response.config.method === "get") {
      const cacheKey = response.config.url;
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  (error) => {
    // En caso de error, intentar usar caché si existe
    if (error.config?.method === "get") {
      const cacheKey = error.config.url;
      const cachedData = requestCache.get(cacheKey);

      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        console.warn(`Usando caché para ${cacheKey}`);
        return Promise.resolve({ data: cachedData.data, cached: true });
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
