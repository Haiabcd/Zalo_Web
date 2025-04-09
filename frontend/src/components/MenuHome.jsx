import { useState } from "react";
import PropTypes from "prop-types";
import {
  MessageSquare,
  FileText,
  CheckSquare,
  Cloud,
  Briefcase,
  Settings,
} from "lucide-react";
import NavItem from "./ui/NavItem";

const MenuHome = ({ onOpenProfileModal }) => {
  // State để kiểm soát việc hiển thị
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"))?.user;
  const avatarUrl = user?.profilePic || "/user.jpg";

  // Hàm toggle menu
  const openMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Hàm đóng menu khi nhấn ra ngoài
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col items-center bg-blue-600 text-white py-4">
      {/* Avatar - Khi nhấn sẽ toggle menu */}
      <div className="relative">
        <div
          className="w-10 h-10 mb-8 rounded-full overflow-hidden cursor-pointer"
          onClick={openMenu}
        >
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        {isMenuOpen && (
          <div
            className="absolute left-16 top-0 w-64 bg-white text-black rounded-lg shadow-lg p-4 z-50"
            onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click lan ra ngoài
          >
            <div className="flex items-center gap-3 border-b-2 pb-3">
              <div>
                <h3 className="font-semibold text-sm">
                  Phan Nguyên Khôi Nguyên
                </h3>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <button
                onClick={() => {
                  closeMenu();
                  onOpenProfileModal();
                }}
                className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded w-full text-left"
              >
                Hồ sơ của bạn
              </button>
              <a
                href="/settings"
                className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded"
              >
                Cài đặt
              </a>
            </div>

            {/* Thông báo */}
            <div className="mt-3 text-xs border-t-2 pt-3">
              <a
                href="/logout"
                className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded"
              >
                Đăng xuất
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Thanh điều hướng */}
      <nav className="flex-1 flex flex-col items-center gap-4">
        <NavItem href="/messages" icon={<MessageSquare />} label="Messages" />
        <NavItem href="/documents" icon={<FileText />} label="Documents" />
        <NavItem href="/tasks" icon={<CheckSquare />} label="Tasks" />
      </nav>

      <div className="flex flex-col items-center gap-4 mb-4">
        <NavItem href="/cloud" icon={<Cloud />} label="Cloud Storage" />
        <div className="w-8 h-px bg-blue-400 my-2" aria-hidden="true" />
        <NavItem href="/work" icon={<Briefcase />} label="Work" />
        <NavItem href="/settings" icon={<Settings />} label="Settings" />
      </div>
    </aside>
  );
};

MenuHome.propTypes = {
  onOpenProfileModal: PropTypes.func.isRequired,
};

export default MenuHome;
