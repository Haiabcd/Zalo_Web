import { friendAPI } from "../../config/axios";

export const friendService = {
  async getFriends() {
    try {
      // Lấy dữ liệu từ localStorage
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      const token = user?.token || "";

      console.log("📌 Token:", token);

      if (!token) {
        throw new Error("Người dùng chưa đăng nhập hoặc token không hợp lệ.");
      }

      // Gửi request với Authorization header
      const response = await friendAPI.get("/friends/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("🚨 Lỗi khi lấy danh sách bạn bè:", error);

      // Xử lý lỗi rõ ràng hơn
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
};
