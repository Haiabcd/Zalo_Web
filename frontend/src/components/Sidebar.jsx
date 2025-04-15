import { useState, useEffect } from "react";
import { Search, MoreHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "../context/UserContext";
import { getConversationList } from "../services/api/conversation.service";
import { formatUpdatedAt } from "../services/formatDate";

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

  useEffect(() => {
    fetchConversations();
  }, []);

  console.log("chatItems", chatItems);

  return (
    <div className="w-full h-full max-w-md mx-auto bg-white">
      {/* Thanh tìm kiếm */}
      <div className="flex items-center justify-between p-2.5 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Thanh điều hướng */}
      <div className="flex justify-between items-center border-b px-4">
        <div>
          <Button
            variant="ghost"
            className="text-blue-600 font-medium relative py-4"
          >
            Tất cả
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
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
    </div>
  );
};

export default Sidebar;
