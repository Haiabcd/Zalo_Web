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

export default function ContactSidebar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Quản lý trạng thái hiển thị dialog

  const openDialog = () => {
    setIsDialogOpen(true); // Mở dialog
  };

  const closeDialog = () => {
    setIsDialogOpen(false); // Đóng dialog
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
        {/* Nút mở dialog */}
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
            className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 cursor-pointer ${
              index === 0
                ? "bg-blue-100 font-medium text-blue-700"
                : "text-gray-700"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Hiển thị AddFriendModal khi isDialogOpen là true */}
      {isDialogOpen && <AddFriendModal onClose={closeDialog} />}
    </div>
  );
}
