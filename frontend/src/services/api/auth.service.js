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


  async updateProfile(userId, updateData) {
    try {
      const response = await authAPI.put(`/auth/update-profile/${userId}`, updateData);
      // Cập nhật localStorage nếu muốn giữ thông tin mới sau khi cập nhật
      const updatedUser = response.data;
      const current = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ ...current, user: updatedUser }));
      return updatedUser;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updateAvatar(file) {
    try {
      const formData = new FormData();
      formData.append("profilePic", file); 
  
      const response = await authAPI.put(
        "/auth/update-avatar", 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      const updatedUser = response.data;
      const current = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ ...current, user: updatedUser }));
      return updatedUser;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

};
