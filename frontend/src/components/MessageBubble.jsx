import { useState } from "react";
import { FileIcon, FolderIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileIcon as FileIconReact, defaultStyles } from "react-file-icon";
import MessageImage from "./MessageImage";
import { messageService } from "../services/api/message.service";

const MessageBubble = ({ message, user, getFileExtension }) => {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const isSender = message.senderId?._id === user._id;

  // Hàm thu hồi tin nhắn
  const handleRecallMessage = async () => {
    try {
      await messageService.recallMessage(message._id);
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error.message);
    }
  };

  // Xử lý chuột phải
  const handleContextMenu = (e) => {
    e.preventDefault();
    if (isSender) {
      setIsContextMenuOpen(true);
    }
  };

  return (
    <DropdownMenu open={isContextMenuOpen} onOpenChange={setIsContextMenuOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className={`flex ${isSender ? "justify-end" : "justify-start"}`}
          onContextMenu={handleContextMenu}
        >
          <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
            {message.messageType === "text" ? (
              <div>
                <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                  <p className="text-sm">
                    {" "}
                    {message.status === "recalled"
                      ? "Tin nhắn đã được thu hồi"
                      : message.content}
                  </p>
                </pre>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ) : message.messageType === "image" ? (
              <MessageImage message={message} isSender={isSender} />
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
      </DropdownMenuTrigger>
      {isSender && (
        <DropdownMenuContent
          align="end"
          className="z-50 bg-white border rounded-md shadow-lg"
        >
          <DropdownMenuItem onClick={handleRecallMessage}>
            Thu hồi tin nhắn
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default MessageBubble;
