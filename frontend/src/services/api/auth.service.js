import { authAPI } from "../../config/axios";

export const authService = {
  async login(phoneNumber, password) {
    try {
      const response = await authAPI.post(
        "/auth/login",
        {
          phoneNumber,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout() {
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
