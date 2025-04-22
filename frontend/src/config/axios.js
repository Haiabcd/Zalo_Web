import axios from "axios";

export const API = axios.create({
  baseURL: "http://192.168.225.106:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Gắn token nếu có trước khi gửi request
API.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
    if (user) {
      const { token } = JSON.parse(user);
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi 401
API.interceptors.response.use(
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
