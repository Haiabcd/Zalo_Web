import { API } from "../../config/axios";
import { initializeSocket, disconnectSocket } from "../../services/socket";

export const authService = {
  async login(phoneNumber, password) {
    try {
      const response = await API.post(
        "/auth/login",
        {
          phoneNumber,
          password,
          deviceType: "web",
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200 && response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
        initializeSocket(response.data.user._id);
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  async logout() {
    try {
      const response = await API.post(
        "/auth/logout",
        {
          deviceType: "web",
        },
        {
          withCredentials: true,
        }
      );

      localStorage.removeItem("user");
      disconnectSocket();
      window.location.href = "/login";
      return response.data;
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  async updateProfile(userId, updateData) {
    try {
      const response = await API.put(
        `/auth/update-profile/${userId}`,
        updateData
      );
      // Cập nhật localStorage nếu muốn giữ thông tin mới sau khi cập nhật
      const updatedUser = response.data;
      const current = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...current, user: updatedUser })
      );
      return updatedUser;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updateAvatar(file) {
    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      const response = await API.put("/auth/update-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data;
      const current = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...current, user: updatedUser })
      );
      return updatedUser;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
