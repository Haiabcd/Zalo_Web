import { API } from "../../config/axios";

export const getConversationList = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.token;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await API.get(`/conversations/getList`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching conversation list:", error);
    throw error;
  }
};

export const getConversationById = async (conversationId) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.token;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await API.get(`/conversations/${conversationId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching conversation by ID:", error);
    throw error;
  }
};
