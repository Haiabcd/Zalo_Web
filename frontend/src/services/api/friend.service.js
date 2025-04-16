import axios from "axios";

const API_URL = "http://localhost:5001/api/friend";

const userData = JSON.parse(localStorage.getItem("user"));
const token = userData?.token;

export const friendService = {
  // Gửi yêu cầu kết bạn
  sendRequest: async (phoneNumber) => {
    try {
      const response = await axios.post(
        `${API_URL}/request`,
        { phoneNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true, 
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Không thể gửi yêu cầu kết bạn");
    }
  }
};
