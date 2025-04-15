import axios from "axios";

const API_URL = "http://localhost:5001/api";
const userData = JSON.parse(localStorage.getItem("user"));
const token = userData?.token;

export const messageService = {
  // Gửi tin nhắn văn bản
  async sendMessage(data) {
    try {
      const response = await axios.post(
        `${API_URL}/messages/sendMessage`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Gửi tin nhắn thất bại");
    }
  },
  // Lây danh sách tin nhắn theo conversationId
  async getMessagesByConversationId({
    conversationId,
    beforeMessageId,
    limit = 50,
  }) {
    try {
      const response = await axios.get(
        `${API_URL}/messages/getMessages/${conversationId}`,
        {
          params: { beforeMessageId, limit },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Lấy danh sách tin nhắn thất bại"
      );
    }
  },

  // Gửi file hoặc folder
  async sendFileFolder(data) {
    try {
      const response = await axios.post(
        `${API_URL}/messages/sendFileFolder`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Gửi file/folder thất bại"
      );
    }
  },

  // Lấy danh sách tin nhắn
  async getMessage({ userId2 }) {
    try {
      const response = await axios.get(`${API_URL}/messages`, {
        params: { userId2 },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Lấy tin nhắn thất bại");
    }
  },

  // Gửi file hoặc thư mục
  async sendFileFolder(formData) {
    try {
      const response = await axios.post(
        `${API_URL}/messages/send-file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Gửi file/folder thất bại"
      );
    }
  },
};
