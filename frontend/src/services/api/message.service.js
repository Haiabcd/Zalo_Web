import { messageAPI } from "../../config/axios";

export const messageService = {
  async sendMessage({ receiverId, messageType, content }) {
    try {
      // Lấy dữ liệu từ localStorage
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      const token = user?.token || "";
      if (!token) {
        throw new Error("Người dùng chưa đăng nhập hoặc token không hợp lệ.");
      }

      const response = await messageAPI.post("/messages/send", {
        params: {
          senderId: user.user._id,
          receiverId: receiverId,
          messageType: messageType,
          content: content,
          file: null,
          folder: null,
        },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("🚨 Lỗi gửi tin nhắn:", error);
      if (error.response) {
        console.error("📌 Server phản hồi:", error.response.data);
        throw new Error(error.response.data.message || "Lỗi từ server.");
      } else if (error.request) {
        console.error("📌 Không nhận được phản hồi từ server.");
        throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
      } else {
        console.error("📌 Lỗi trong quá trình gửi request:", error.message);
        throw new Error("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  },

  async sendFileFolder({ receiverId, messageType, file, folder }) {
    try {
      // Lấy dữ liệu từ localStorage
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      const token = user?.token || "";
      if (!token) {
        throw new Error("Người dùng chưa đăng nhập hoặc token không hợp lệ.");
      }

      const response = await messageAPI.post("/messages/send", {
        params: {
          senderId: user.user._id,
          receiverId: receiverId,
          messageType: messageType,
          content: null,
          file: file,
          folder: folder,
        },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("🚨 Lỗi gửi tin nhắn:", error);
      if (error.response) {
        console.error("📌 Server phản hồi:", error.response.data);
        throw new Error(error.response.data.message || "Lỗi từ server.");
      } else if (error.request) {
        console.error("📌 Không nhận được phản hồi từ server.");
        throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
      } else {
        console.error("📌 Lỗi trong quá trình gửi request:", error.message);
        throw new Error("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  },

  async getMessage({ userId2 }) {
    try {
      // Lấy dữ liệu từ localStorage
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      const token = user?.token || "";
      if (!token) {
        throw new Error("Người dùng chưa đăng nhập hoặc token không hợp lệ.");
      }

      const response = await messageAPI.get("/messages/getMessage", {
        params: {
          userId1: user.user._id,
          userId2: userId2,
        },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("🚨 Lỗi lấy tin nhắn:", error);
      if (error.response) {
        console.error("📌 Server phản hồi:", error.response.data);
        throw new Error(error.response.data.message || "Lỗi từ server.");
      } else if (error.request) {
        console.error("📌 Không nhận được phản hồi từ server.");
        throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
      } else {
        console.error("📌 Lỗi trong quá trình gửi request:", error.message);
        throw new Error("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  },

  async getLastMessages(friendIds) {
    try {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      const token = user?.token || "";
      if (!token) {
        throw new Error("Người dùng chưa đăng nhập hoặc token không hợp lệ.");
      }

      const response = await messageAPI.get("/messages/last-message", {
        params: {
          participants: [friendIds, user.user._id],
        },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn cuối:", error);
      return [];
    }
  },
};
