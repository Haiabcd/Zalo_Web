import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  ChevronDown,
  Users,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "../context/UserContext";
import {
  getConversationList,
  getConversationById,
} from "../services/api/conversation.service";
import { formatUpdatedAt } from "../services/formatDate";
import { getSocket } from "../services/socket";
import FriendPage from "./ParentComponentFriend";

const Sidebar = () => {
  const [chatItems, setChatItems] = useState([]);
  const { setSelectedUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const conversations = await getConversationList();
      setChatItems(conversations.data);
      setError(null);
    } catch (err) {
      setError("Failed to load conversations");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversationById = async (conversationId) => {
    try {
      const conversation = await getConversationById(conversationId);
      setChatItems((prevChatItems) => {
        const updated = prevChatItems.map((chat) => {
          if (chat._id === conversationId) {
            return conversation; // thay thế toàn bộ object cũ bằng mới
          }
          return chat;
        });

        // Đưa conversation mới cập nhật lên đầu danh sách
        updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        return updated;
      });
    } catch (err) {
      console.error("Error fetching conversation by ID", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const socket = getSocket();
    if (socket) {
      socket.on("newMessage", (newMessage) => {
        // Khi có tin nhắn mới, chỉ tải lại cuộc trò chuyện có tin nhắn mới
        fetchConversationById(newMessage.conversationId);
      });
      socket.on("friendRequestAccepted", fetchConversations);
    }

    return () => {
      if (socket) {
        socket.off("newMessage", fetchConversationById);
      }
    };
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = () => {
    setIsDialogOpen(false); // Đóng modal
  };

  return (
    <div className="w-full h-full max-w-md mx-auto bg-white">
      {/* Thanh tìm kiếm */}
      <div className="flex items-center justify-between p-2.5 border-b">
        <div className="flex items-center w-full p-0.5 bg-gray-100 rounded-full">
          <Search className="text-gray-400 h-4 w-4 mr-3" />{" "}
          {/* Thêm khoảng cách giữa icon và input */}
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="w-full py-2 bg-transparent text-sm focus:outline-none"
          />
        </div>

        {/* Nút mở dialog */}
        <button
          onClick={() => setIsDialogOpen(true)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <UserPlus className="w-5 h-5 text-gray-600" />
        </button>

        <button className="p-2 hover:bg-gray-100 rounded">
          <Users className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Thanh điều hướng */}
      <div className="flex justify-between items-center border-b px-4">
        <div>
          <Button variant="ghost" className="text-blue-600 font-medium py-4">
            Tất cả
            <div className=" bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          </Button>
          <Button variant="ghost" className="text-gray-600 font-medium py-4">
            Chưa đọc
          </Button>
        </div>
        <div className="flex-1 flex justify-end items-center gap-2">
          <Button
            variant="ghost"
            className="text-gray-600 flex items-center gap-1"
          >
            Phân loại
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Danh sách chat */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {isLoading ? (
          <div className="p-4 text-center">Đang tải...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <div className="divide-y">
            {chatItems.map((chat) => (
              <div
                key={chat._id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedUser(chat)}
              >
                {chat.avatar ? (
                  <img
                    src={chat.avatar}
                    alt="avatar"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                    {chat.name
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}

                <div className="flex flex-col w-full ">
                  <div className="flex justify-between items-center">
                    <h3 className="truncate">
                      {chat.name && chat.name.trim() !== ""
                        ? chat.name
                        : chat.groupName}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatUpdatedAt(chat.updatedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-sm text-gray-500 truncate max-w-[80%]">
                      {chat.lastMessage?.content || "Không có tin nhắn"}
                    </p>
                    {chat.unseenCount > 0 && (
                      <div className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                        {chat.unseenCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hiển thị AddFriendModal khi isDialogOpen là true */}
      {isDialogOpen && <FriendPage onClose={closeDialog} />}
    </div>
  );
};

export default Sidebar;
