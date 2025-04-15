import { useState, useEffect, useRef } from "react";
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileIcon as FileIconReact, defaultStyles } from "react-file-icon";
import { uploadFileToS3 } from "../services/uploadToS3";
import EmojiPickerComponent from "./EmojiPickerComponent";
import MessageImage from "./MessageImage";

import { messageService } from "../services/api/message.service";
import { socketService } from "../services/socket";

const ChatInterface = ({ conversation }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const imgInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")).user;
  console.log("user", user);

  console.log("conversation chat container", conversation);

  // Lấy đuôi file
  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    return fileName.split(".").pop();
  };

  // Xử lý chọn emoji
  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };

  // Gửi tin nhắn văn bản
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMessageData = {
      conversationId: conversation._id,
      content: newMessage,
    };

    try {
      const sentMessage = await messageService.sendMessage(newMessageData);
      socketService.emitMessage(sentMessage);
      setNewMessage("");
      setMessages((prev) => [...prev, sentMessage]);
    } catch (error) {
      console.error("Gửi tin nhắn thất bại", error);
    }
  };

  // Gửi file
  const handleFileChange = async (event) => {
    if (event.target.files.length === 0) return;
    const selectedFile = event.target.files[0];

    try {
      const uploadedUrl = await uploadFileToS3(selectedFile);
      const newMessageData = {
        conversationId: user.conversationId,
        messageType: "file",
        fileInfo: {
          fileUrl: uploadedUrl,
          fileName: selectedFile.name,
          fileSize: Math.round(selectedFile.size / 1024), // KB
        },
      };

      const sentMessage = await messageService.sendFileFolder(newMessageData);
      socketService.emitMessage(sentMessage);
      setMessages((prev) => [...prev, sentMessage]);
    } catch (error) {
      console.error("Gửi file thất bại", error);
    }
  };

  // Gửi ảnh
  const handleImageChange = async (event) => {
    if (event.target.files.length === 0) return;
    const selectedFile = event.target.files[0];

    try {
      const uploadedUrl = await uploadFileToS3(selectedFile);
      const newMessageData = {
        conversationId: user.conversationId,
        messageType: "image",
        fileInfo: {
          fileUrl: uploadedUrl,
          fileName: selectedFile.name,
          fileSize: Math.round(selectedFile.size / 1024), // KB
        },
      };

      const sentMessage = await messageService.sendFileFolder(newMessageData);
      socketService.emitMessage(sentMessage);
      setMessages((prev) => [...prev, sentMessage]);
    } catch (error) {
      console.error("Gửi ảnh thất bại", error);
    }
  };

  // Gửi folder
  const handleFolderChange = async (event) => {
    if (event.target.files.length === 0) return;
    const selectedFiles = Array.from(event.target.files);
    const folderName = selectedFiles[0].webkitRelativePath.split("/")[0];

    try {
      const uploadedFiles = await Promise.all(
        selectedFiles.map(async (file) => ({
          fileName: file.name,
          fileSize: Math.round(file.size / 1024), // KB
          fileUrl: await uploadFileToS3(file),
        }))
      );

      const newMessageData = {
        conversationId: user.conversationId,
        messageType: "folder",
        folderInfo: {
          folderName,
          files: uploadedFiles,
        },
      };

      const sentMessage = await messageService.sendFileFolder(newMessageData);
      socketService.emitMessage(sentMessage);
      setMessages((prev) => [...prev, sentMessage]);
    } catch (error) {
      console.error("Gửi thư mục thất bại", error);
    }
  };

  // Component bong bóng tin nhắn
  const MessageBubble = ({ message }) => {
    const isSender = message.senderId._id === user._id;

    return (
      <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
        <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
          {message.messageType === "text" ? (
            <div>
              <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                <p className="text-sm">{message.content}</p>
              </pre>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : message.messageType === "image" ? (
            <div className="flex flex-col gap-2">
              <MessageImage
                fileUrl={message.fileInfo.fileUrl}
                fileName={message.fileInfo.fileName}
              />
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : message.messageType === "video" ? (
            <div>
              <video controls className="max-w-xs rounded-lg shadow-md">
                <source src={message.fileInfo.fileUrl} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ video.
              </video>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : message.messageType === "audio" ? (
            <div>
              <audio controls className="w-full">
                <source src={message.fileInfo.fileUrl} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ âm thanh.
              </audio>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : message.messageType === "file" ? (
            <div className="group relative">
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
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : message.messageType === "folder" ? (
            <div>
              <p className="text-sm text-gray-500">
                📁 {message.folderInfo.folderName}
              </p>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Khởi tạo socket và lấy tin nhắn ban đầu
  useEffect(() => {
    // Kết nối socket
    socketService.connect(user._id);

    const handleNewMessage = (message) => {
      if (message.conversationId === conversation._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socketService.onNewMessage(handleNewMessage);

    // Lấy danh sách tin nhắn
    const fetchMessages = async () => {
      try {
        const data = await messageService.getMessagesByConversationId({
          conversationId: conversation._id,
          beforeMessageId: null,
          limit: 50,
        });
        console.log("Tin nhắn:", data.data);
        setMessages(data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
      }
    };

    fetchMessages();

    return () => {
      socketService.offNewMessage();
    };
  }, [conversation._id]);

  // Xử lý nhấn Enter để gửi tin nhắn
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {conversation.avatar ? (
              <img
                src={conversation.avatar}
                alt="avatar"
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                {conversation.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
          </Avatar>
          <span className="font-medium">
            {conversation.name && conversation.name.trim() !== ""
              ? conversation.name
              : conversation.groupName}
          </span>
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

      {/* Input Area */}
      <div className="w-full flex mx-auto border-t">
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex items-center gap-2 p-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => imgInputRef.current.click()}
            >
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            <input
              type="file"
              accept="image/*"
              ref={imgInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
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
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          <div className="w-full flex items-center border-t gap-2 p-2">
            <input
              type="text"
              placeholder={`Nhập @, tin nhắn tới ${conversation.name}`}
              className="w-full outline-none flex-1"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
            {newMessage.length === 0 ? (
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
              <button
                onClick={handleSendMessage}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
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
