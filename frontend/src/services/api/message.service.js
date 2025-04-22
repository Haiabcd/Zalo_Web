import { API } from "../../config/axios";
const userData = JSON.parse(localStorage.getItem("user"));
const token = userData?.token;

export const messageService = {
  // Gửi tin nhắn văn bản
  async sendMessage(data) {
    try {
      const response = await API.post(`/messages/sendMessage`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      const response = await API.get(
        `/messages/getMessages/${conversationId}`,
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

  // Lấy danh sách tin nhắn
  async getMessage({ userId2 }) {
    try {
      const response = await API.get(`/messages/`, {
        params: { userId2 },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Lấy tin nhắn thất bại");
    }
  },

  // Gửi file
  async sendFileFolder(formData) {
    try {
      const response = await API.post(`/messages/send-file`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Gửi file/folder thất bại"
      );
    }
  },

  // Gửi folder
  async sendFolder({ conversationId, folderName, files }) {
    try {
      const formData = new FormData();
      formData.append("conversationId", conversationId);
      formData.append("folderName", folderName);

      // Thêm các file vào trường "files" (khớp với Multer .array("files"))
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await API.post(`/messages/send-folder`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Gửi folder thất bại");
    }
  },

  async recallMessage(messageId) {
    try {
      const response = await API.post(
        `/messages/recall-message`,
        { messageId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Thu hồi tin nhắn thất bại"
      );
    }
  },

  async deleteMessage(messageId) {
    try {
      const response = await axios.post(
        `${API_URL}/messages/delete-message`,
        { messageId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Xóa tin nhắn thất bại");
    }
  },

  // Gửi lại tin nhắn (chuyển tiếp)
  async forwardMessage({ originalMessageId, senderId, targetConversationIds }) {
    try {
      const response = await API.post(
        `/messages/forward`,
        {
          originalMessageId,
          senderId,
          targetConversationIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Chuyển tiếp tin nhắn thất bại"
      );
    }
  },
};
