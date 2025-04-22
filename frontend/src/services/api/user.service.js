import { API } from "../../config/axios";
const userData = JSON.parse(localStorage.getItem("user"));
const token = userData?.token;

export const userService = {
  async findUserByPhoneNumber(phoneNumber) {
    try {
      const res = await API.get(`/auth/getUserByPhoneNumber`, {
        params: { phoneNumber },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error) {
      console.error("Lỗi khi tìm user theo số điện thoại:", error);
      throw error;
    }
  },
};
