import { useState } from "react";
import { Users, UserPlus, UsersRound, UserCheck, Search } from "lucide-react";
import AddFriendModal from "./AddFriendModal"; // Import AddFriendModal

const menuItems = [
  {
    icon: <Users className="w-5 h-5" />,
    label: "Danh sách bạn bè",
  },
  {
    icon: <UsersRound className="w-5 h-5" />,
    label: "Danh sách nhóm và cộng đồng",
  },
  {
    icon: <UserPlus className="w-5 h-5" />,
    label: "Lời mời kết bạn",
  },
  {
    icon: <UserCheck className="w-5 h-5" />,
    label: "Lời mời vào nhóm và cộng đồng",
  },
];

const mockFriendRequests = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=3",
    mutualFriends: 5,
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=5",
    mutualFriends: 2,
  },
];

export default function ContactSidebar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0); // Theo dõi menu được chọn
  const [requests, setRequests] = useState(mockFriendRequests);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const handleAccept = (id) => {
    setRequests(requests.filter((req) => req.id !== id));
    // Gọi API nếu cần
  };

  const handleReject = (id) => {
    setRequests(requests.filter((req) => req.id !== id));
    // Gọi API nếu cần
  };

  return (
    <div className="w-full bg-white rounded-md shadow p-4 space-y-4">
      {/* Thanh tìm kiếm */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={openDialog} className="p-2 hover:bg-gray-100 rounded">
          <UserPlus className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <Users className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Danh sách menu */}
      <div className="space-y-1">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveMenuIndex(index)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer 
              ${
                index === activeMenuIndex
                  ? "bg-blue-100 font-medium text-blue-700"
                  : "hover:bg-blue-50 text-gray-700"
              }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Dialog thêm bạn */}
      {isDialogOpen && <AddFriendModal onClose={closeDialog} />}

      {/* Danh sách lời mời kết bạn */}
      {activeMenuIndex === 2 && (
        <div className="space-y-4 p-4">
          <h2 className="text-lg font-semibold">Lời mời kết bạn</h2>
          {requests.length === 0 ? (
            <p className="text-gray-500">Không có lời mời nào.</p>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
              >
                <img
                  src={req.avatar}
                  alt={req.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{req.name}</p>
                  <p className="text-sm text-gray-500">
                    {req.mutualFriends} bạn chung
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    size="sm"
                    onClick={() => handleAccept(req.id)}
                    className="border border-gray-300 rounded px-3 py-1 hover:bg-gray-100"
                  >
                    Chấp nhận
                  </button>
                  <button
                    size="sm"
                    onClick={() => handleReject(req.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
