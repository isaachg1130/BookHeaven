// src/api/content.js
import apiClient from "./client";

export const contentAPI = {
  // Libros
  getLibros: (params) => apiClient.get("/content/libros", { params }),
  getLibro: (id) => apiClient.get(`/content/libros/${id}`),
  createLibro: (formData) => apiClient.post("/content/libros", formData),
  updateLibro: (id, formData) =>
    apiClient.put(`/content/libros/${id}`, formData),
  deleteLibro: (id) => apiClient.delete(`/content/libros/${id}`),

  // Mangas
  getMangas: (params) => apiClient.get("/content/mangas", { params }),
  getManga: (id) => apiClient.get(`/content/mangas/${id}`),
  createManga: (formData) => apiClient.post("/content/mangas", formData),
  updateManga: (id, formData) =>
    apiClient.put(`/content/mangas/${id}`, formData),
  deleteManga: (id) => apiClient.delete(`/content/mangas/${id}`),

  // Cómics
  getComics: (params) => apiClient.get("/content/comics", { params }),
  getComic: (id) => apiClient.get(`/content/comics/${id}`),
  createComic: (formData) => apiClient.post("/content/comics", formData),
  updateComic: (id, formData) =>
    apiClient.put(`/content/comics/${id}`, formData),
  deleteComic: (id) => apiClient.delete(`/content/comics/${id}`),

  // Audiolibros
  getAudiobooks: (params) => apiClient.get("/content/audiolibros", { params }),
  getAudiobook: (id) => apiClient.get(`/content/audiolibros/${id}`),
  createAudiobook: (formData) =>
    apiClient.post("/content/audiolibros", formData),
  updateAudiobook: (id, formData) =>
    apiClient.put(`/content/audiolibros/${id}`, formData),
  deleteAudiobook: (id) => apiClient.delete(`/content/audiolibros/${id}`),

  // Servir contenido seguro
  getPdfUrl: (type, id) => `/api/content/serve-pdf/${type}/${id}`,
  getAudioUrl: (id) => `/api/content/serve-audio/${id}`,

  // Estadísticas
  getContentStats: () => apiClient.get("/admin/content/stats"),

  // Favoritos
  getFavorites: () => apiClient.get("/favorites"),
  toggleFavorite: (type, id) =>
    apiClient.post("/favorites/toggle", { content_type: type, content_id: id }),
  removeFavorite: (type, id) => apiClient.delete(`/favorites/${type}/${id}`),
};
