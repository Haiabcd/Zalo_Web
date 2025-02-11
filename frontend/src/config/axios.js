import axios from "axios";
import { API_CONFIG } from "./api.config";

// Instance cho Auth Service
export const authAPI = axios.create({
  baseURL: API_CONFIG.AUTH_SERVICE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Instance cho Friend Service
export const friendAPI = axios.create({
  baseURL: API_CONFIG.FRIEND_SERVICE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor cho cả 2 instance
[authAPI, friendAPI].forEach((instance) => {
  instance.interceptors.request.use(
    (config) => {
      const user = localStorage.getItem("user");
      if (user) {
        const { token } = JSON.parse(user);
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
});
