import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io("http://192.168.225.106:5001", {
      query: {
        userId,
        deviceType: "web",
      },
    });

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("friendRequest", (data) => {
      console.log("Received friend request:", data);
      // Xử lý thông báo lời mời kết bạn
      // Ví dụ: dispatch action để cập nhật UI
    });

    socket.on("friendRequestAccepted", (data) => {
      console.log("Friend request accepted:", data);
      // Xử lý thông báo chấp nhận kết bạn
    });

    // socket.on("forceLogout", (data) => {
    //   localStorage.removeItem("user");
    //   window.location.href = "/login";
    // });

    socket.on("newMessage", (message) => {
      console.log("New message received:", message);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
