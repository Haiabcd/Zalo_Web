import { useState, useEffect } from "react";
import {
  Smile,
  ImageIcon,
  Paperclip,
  FileSpreadsheet,
  Video,
  MessageSquare,
  MoreHorizontal,
  FolderIcon,
  FileIcon,
  Download,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { messageService } from "../services/api/message.service";
import io from "socket.io-client";
import { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileIcon as FileIconReact, defaultStyles } from "react-file-icon";
import { uploadFileToS3 } from "../services/uploadToS3";
import EmojiPickerComponent from "./EmojiPickerComponent";

const ChatInterface = ({ user }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // console.log("Message: ", messages);

  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    return fileName.split(".").pop();
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };

  // Message bubble component
  const MessageBubble = ({ message }) => {
    if (message.receiverId == user._id) {
      // Tin nhắn gửi
      return (
        <div className="flex justify-end">
          <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
            {message.messageType === "text" ? (
              <div>
                <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                  <p className="text-sm">{message.content}</p>
                </pre>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ) : message.messageType === "image" ? (
              <img
                src={message.fileInfo.fileUrl}
                alt={message.fileInfo.fileName}
                className="max-w-xs rounded-lg shadow-md"
              />
            ) : message.messageType === "video" ? (
              <video controls className="max-w-xs rounded-lg shadow-md">
                <source src={message.fileInfo.fileUrl} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            ) : message.messageType === "audio" ? (
              <audio controls className="w-full">
                <source src={message.fileInfo.fileUrl} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ âm thanh.
              </audio>
            ) : message.messageType === "file" ? (
              <div className="group relative">
                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <FileIconReact
                        extension={getFileExtension(message.fileInfo?.fileName)}
                        {...defaultStyles[
                          getFileExtension(message.fileInfo?.fileName)
                        ]}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {message.fileInfo?.fileName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {message.fileInfo?.fileSize} KB
                        </span>
                        <Button variant="ghost" size="icon">
                          <Download className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <FolderIcon className="mr-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                📁 {message.folderInfo.folderName}
              </p>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="flex justify-start">
        <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
          {message.messageType === "text" ? (
            <div>
              <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                <p className="text-sm">{message.content}</p>
              </pre>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : message.messageType === "image" ? (
            <img
              src={message.fileInfo.fileUrl}
              alt={message.fileInfo.fileName}
              className="max-w-xs rounded-lg shadow-md"
            />
          ) : message.messageType === "video" ? (
            <video controls className="max-w-xs rounded-lg shadow-md">
              <source src={message.fileInfo.fileUrl} type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          ) : message.messageType === "audio" ? (
            <audio controls className="w-full">
              <source src={message.fileInfo.fileUrl} type="audio/mpeg" />
              Trình duyệt của bạn không hỗ trợ âm thanh.
            </audio>
          ) : message.messageType === "file" ? (
            <div className="group relative">
              <div className="p-4 bg-sky-50 border border-sky-100 rounded-lg shadow-sm max-w-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <FileIconReact
                      extension={getFileExtension(message.fileInfo?.fileName)}
                      {...defaultStyles[
                        getFileExtension(message.fileInfo?.fileName)
                      ]}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {message.fileInfo?.fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {message.fileInfo?.fileSize} KB
                      </span>
                      {message.fileInfo?.isDownloaded && (
                        <span className="text-xs text-green-600">
                          Downloaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              📁 {message.folderInfo.folderName}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Kết nối tới server WebSocket
  const socket = useRef(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  //Gửi file
  const handleFileChange = async (event) => {
    if (event.target.files.length > 0) {
      const selectedFile = event.target.files[0];

      const uploadedUrl = await uploadFileToS3(selectedFile);

      const newMessageData = {
        receiverId: user._id,
        messageType: "file",
        file: uploadedUrl,
        folder: null,
      };

      try {
        const sentMessage = await messageService.sendFileFolder(newMessageData);
        socket.current.emit("sendMessage", sentMessage.data);
        setNewMessage("");
      } catch (error) {
        console.error("Gửi tin nhắn thất bại", error);
      }
    }
  };

  //Gửi folder
  const handleFolderChange = async (event) => {
    if (event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      const folderName = selectedFiles[0].webkitRelativePath.split("/")[0];

      try {
        // Upload từng file lên S3 và lấy URL
        const uploadedFiles = await Promise.all(
          selectedFiles.map(async (file) => ({
            fileName: file.name,
            fileSize: file.size,
            fileUrl: await uploadFileToS3(file), // Hàm upload file lên S3
          }))
        );

        const newMessageData = {
          receiverId: user._id,
          messageType: "folder",
          file: null,
          folder: {
            folderName,
            files: uploadedFiles,
          },
        };

        const sentMessage = await messageService.sendFileFolder(newMessageData);
        socket.current.emit("sendMessage", sentMessage.data);
        setNewMessage("");
      } catch (error) {
        console.error("Gửi thư mục thất bại", error);
      }
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMessageData = {
      receiverId: user._id,
      messageType: "text",
      content: newMessage,
    };

    try {
      const sentMessage = await messageService.sendMessage(newMessageData);
      socket.current.emit("sendMessage", sentMessage.data);
      setNewMessage("");
    } catch (error) {
      console.error("Gửi tin nhắn thất bại", error);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    socket.current = io("http://localhost:5003");

    // Lắng nghe tin nhắn mới
    socket.current.on("newMessage", (message) => {
      if (message.receiverId === user._id || message.senderId === user._id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    // Dọn dẹp kết nối khi unmount
    return () => {
      socket.current.disconnect();
    };
  }, [user._id]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await messageService.getMessage({ userId2: user._id });
        setMessages(data || []);
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
      }
    };

    fetchMessages();
  }, [user._id]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Ngăn chặn xuống dòng
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rkeiYAqxzOaQcH0HddM0hO2SXZwvh8.png"
              alt="User avatar"
              className="rounded-full"
            />
          </Avatar>
          <span className="font-medium">{user.fullName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message._id} message={message} />
        ))}
      </div>

      {/* Input Area*/}
      <div className="w-full flex mx-auto border-t">
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex items-center gap-2 p-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            {/* Chọn file và folder */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={folderInputRef}
              className="hidden"
              webkitdirectory="true"
              directory="true"
              onChange={handleFolderChange}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => fileInputRef.current.click()}>
                  <FileIcon className="mr-2 h-4 w-4" />
                  Chọn File
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => folderInputRef.current.click()}
                >
                  <FolderIcon className="mr-2 h-4 w-4" />
                  Chọn Thư mục
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
              <FileSpreadsheet className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <FileSpreadsheet className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <FileSpreadsheet className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <FileSpreadsheet className="h-5 w-5 text-gray-500" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          <div className="w-full flex items-center border-t gap-2 p-2">
            <input
              type="text"
              placeholder={`Nhập @, tin nhắn tới ${user.fullName}`}
              className="w-full outline-none flex-1"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            {/* Nút chọn icon (luôn hiển thị) */}
            <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />

            {/* Kiểm tra nếu chưa nhập tin nhắn */}
            {newMessage.length === 0 ? (
              // Nút Like (khi chưa nhập)
              <button className="ml-2 text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.25 9V5.25a2.25 2.25 0 00-3.586-1.724L6 9m-2.25 9h15.58a2.25 2.25 0 002.25-2.25v-.058a2.25 2.25 0 00-.234-.996l-3.478-7.305A2.25 2.25 0 0015.06 6H6.75"
                  />
                </svg>
              </button>
            ) : (
              // Nút Gửi (khi có tin nhắn)
              <button className="ml-2 text-blue-500 hover:text-blue-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 12l16.5-7.5m-16.5 7.5l16.5 7.5m-16.5-7.5h16.5"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
