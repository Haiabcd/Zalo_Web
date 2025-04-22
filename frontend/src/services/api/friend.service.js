import { API } from "../../config/axios";

const userData = JSON.parse(localStorage.getItem("user"));
const token = userData?.token;

export const friendService = {
  // Gửi yêu cầu kết bạn
  sendRequest: async (phoneNumber) => {
    try {
      const response = await API.post(
        `/friend/request`,
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
  },

  getFriendStatus: async (userId) => {
    try {
      const response = await API.get(`/friend/status/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Không thể kiểm tra trạng thái bạn bè");
    }
  },
};
