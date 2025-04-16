import axios from "axios";
import { API_CONFIG } from "./api.config";

// Instance cho Auth Service
export const authAPI = axios.create({
  baseURL: API_CONFIG.AUTH_SERVICE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Instance cho Friend Service
export const friendAPI = axios.create({
  baseURL: API_CONFIG.FRIEND_SERVICE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Instance cho Message Service
export const messageAPI = axios.create({
  baseURL: API_CONFIG.MESSAGE_SERVICE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

[authAPI, friendAPI, messageAPI].forEach((instance) => {
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
      console.log(
        "Response error:",
        error.response?.status,
        error.response?.data
      );
      if (error.response?.status === 401) {
        console.log("Received 401 error, logging out...");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
});
