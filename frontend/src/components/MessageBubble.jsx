import { useState, useRef, useEffect } from "react";
import { FolderIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FileIcon as FileIconReact, defaultStyles } from "react-file-icon";
import MessageImage from "./MessageImage";
import MessageFolder from "./MessageFolder";
import { messageService } from "../services/api/message.service";

const MessageBubble = ({ message, user, getFileExtension }) => {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const isSender = message.senderId?._id === user._id;
  const messageRef = useRef(null);

  // Thu hồi tin nhắn
  const handleRecallMessage = async () => {
    try {
      await messageService.recallMessage(message._id);
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error.message);
    }
  };

  // Xóa tin nhắn phía tôi
  const handleDeleteForMe = async () => {
    try {
      await messageService.deleteMessage(message._id);
    } catch (error) {
      console.error("Lỗi khi xoá tin nhắn phía tôi:", error.message);
    }
  };

  // Chuột phải mở menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setIsContextMenuOpen(true);
  };

  // Đóng menu khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (messageRef.current && !messageRef.current.contains(e.target)) {
        setIsContextMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <div
        ref={messageRef}
        className={`flex ${isSender ? "justify-end" : "justify-start"}`}
        onContextMenu={handleContextMenu}
      >
        <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
          {message.messageType === "text" ? (
            <div>
              <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                <p className="text-sm">
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
                    {/* NUT DOWNLOAD */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            message.fileInfo?.fileUrl
                          );
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);

                          const a = document.createElement("a");
                          a.href = url;
                          a.download = message.fileInfo?.fileName || "download";
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error("Tải file thất bại:", error);
                        }
                      }}
                    >
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
            <MessageFolder
              folderInfo={message.folderInfo}
              createdAt={message.createdAt}
            />
          ) : null}
        </div>
      </div>

      {/* Context Menu xuất hiện tại vị trí chuột */}
      {isContextMenuOpen && (
        <DropdownMenu open>
          <DropdownMenuContent
            style={{
              position: "fixed",
              top: contextMenuPosition.y,
              left: contextMenuPosition.x,
              zIndex: 9999,
            }}
            className="bg-white border rounded-md shadow-lg"
          >
            <DropdownMenuItem onClick={handleDeleteForMe}>
              Chuyển tiếp tin nhắn
            </DropdownMenuItem>
            {isSender && (
              <DropdownMenuItem
                onClick={handleRecallMessage}
                className="text-red-500"
              >
                Thu hồi tin nhắn
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDeleteForMe}
              className="text-red-500"
            >
              Xóa chỉ phía tôi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default MessageBubble;
