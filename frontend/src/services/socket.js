import io from "socket.io-client";
const SOCKET_URL = "http://localhost:5003";

class SocketService {
  constructor() {
    this.socket = null;
  }

  // Kết nối socket
  connect(userId) {
    this.socket = io(SOCKET_URL, {
      query: {
        userId,
        deviceType: "web",
      },
    });
    return this.socket;
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("newMessage", (message) => {
        callback(message);
      });
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off("newMessage");
    }
  }

  // Gửi tin nhắn qua socket
  emitMessage(message) {
    if (this.socket) {
      this.socket.emit("sendMessage", message);
    }
  }

  // Ngắt kết nối
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const socketService = new SocketService();
