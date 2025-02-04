import axios from "axios";

const API_URL = "http://localhost:5001/api/auth"; // Điều chỉnh port phù hợp với backend

export const authService = {
  async login(phoneNumber, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        phoneNumber,
        password,
      });
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
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  },
};
