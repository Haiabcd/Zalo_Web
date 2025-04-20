import axios from "axios";

const API_URL = "http://192.168.225.106:5001/api";
const userData = JSON.parse(localStorage.getItem("user"));
const token = userData?.token;

export const userService = {
  async findUserByPhoneNumber(phoneNumber) {
    try {
      const res = await axios.get(`${API_URL}/auth/getUserByPhoneNumber`, {
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
