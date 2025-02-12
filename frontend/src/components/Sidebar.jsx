import { useState, useEffect } from "react";
import { Search, MoreHorizontal, ChevronDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { friendService } from "../services/api/friend.service";
import { authService } from "../services/api/auth.service";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Sidebar() {
  const [chatItems, setChatItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setSelectedUser } = useUser();


  // Gọi API khi component mount
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser) {
          navigate("/login");
          return;
        }
        setIsLoading(true);
        setError(null);
        const friends = await friendService.getFriends();
        setChatItems(Array.isArray(friends) ? friends : []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách bạn bè:", error);
        setError(error.message || "Không thể tải danh sách bạn bè");
        setChatItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFriends();
  }, [navigate]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }


  return (
    <div className="w-full max-w-md mx-auto bg-white">
      {/* Thanh tìm kiếm */}
      <div className="flex items-center justify-between p-4 border-b">
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
      <div className="flex items-center border-b px-4">
        <Button variant="ghost" className="text-blue-600 font-medium relative py-4">
          Tất cả
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
        </Button>
        <Button variant="ghost" className="text-gray-600 font-medium py-4">
          Chưa đọc
        </Button>
        <div className="flex-1 flex justify-end items-center gap-2">
          <Button variant="ghost" className="text-gray-600 flex items-center gap-1">
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
        <div className="divide-y">
          {chatItems.map((chat) => (
            <div 
               key={chat._id} 
               className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
               onClick={() => setSelectedUser(chat.friendInfo)}
            >
              {/* <Avatar className="h-12 w-12">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar> */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">{chat.friendInfo.fullName}</h3>
                  {/* <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{chat.time}</span> */}
                </div>
                {/* <p className="text-sm text-gray-500 truncate">{chat.message}</p> */}
              </div>
              {/* {chat.unread && (
                <div className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1.5">
                  {chat.unread}
                </div>
              )} */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}