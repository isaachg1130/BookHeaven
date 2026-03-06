// src/api/auth.js
import apiClient from "./client";

export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
  logout: () => apiClient.post("/auth/logout"),
  getMe: () => apiClient.get("/auth/me"),
  updateProfile: (data) => apiClient.put("/auth/profile", data),
  uploadProfilePhoto: (formData) =>
    apiClient.post("/auth/profile-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  changePassword: (data) => apiClient.post("/auth/change-password", data),
  getUserStats: () => apiClient.get("/user/stats"),
};
