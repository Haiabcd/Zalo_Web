import Sidebar from "@/components/Sidebar";
import NoChatSelected from "../../components/NoChatSelected";
import ChatContainer from "../../components/ChatContainer";
import MenuHome from "../../components/MenuHome";
import { useState } from "react";
import { useUser } from "../../context/UserContext";

const HomePage = () => {
  const { selectedUser } = useUser();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const openUpdateModal = () => {
    closeProfileModal();
    setIsUpdateModalOpen(true);
  };
  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    openProfileModal();
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar chiếm 5% chiều ngang, 100% chiều dọc */}
      <div className="w-[60px] h-full bg-gray-200">
        <MenuHome onOpenProfileModal={openProfileModal} />
      </div>

      {/* Sidebar chiếm 30% chiều ngang, 100% chiều dọc */}
      <div className="w-[350px] h-full bg-gray-200 border-r border-gray-300">
        <Sidebar />
      </div>

      {/* ChatContainer chiếm phần còn lại */}
      <div className="flex-1 h-full bg-white">
        {selectedUser ? (
          <ChatContainer user={selectedUser} />
        ) : (
          <NoChatSelected />
        )}
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[400px] overflow-hidden relative">
            {/* Nút đóng */}
            <button
              onClick={closeProfileModal}
              className="absolute top-2 right-2 text-white z-20"
            >
              ✕
            </button>

            {/* Ảnh bìa */}
            <div
              className="relative h-32 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://randomuser.me/api/portraits/men/32.jpg')",
              }}
            >
              {/* Ảnh đại diện */}
              <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-md">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Nội dung */}
            <div className="pt-10 px-6 pb-6">
              {/* Tên + icon chỉnh sửa */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Phan Nguyên Khôi Nguyên
                </h3>
                <button className="text-blue-600 hover:underline text-sm">
                  ✎
                </button>
              </div>

              {/* Thông tin cá nhân */}
              <div className="mt-4 border-t pt-4 space-y-2 text-sm text-gray-700">
                <div>
                  <span className="font-semibold">Thông tin cá nhân</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex-none">Giới tính</span>
                  <span className="w-[260px]">Nam</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex-none">Ngày sinh</span>
                  <span className="w-[260px]">01 tháng 12, 2003</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex-none">Điện thoại</span>
                  <span className="w-[260px]">+84 934 185 833</span>
                </div>
              </div>
              {/* Ghi chú */}
              <p className="mt-4 text-xs text-gray-500">
                Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này
              </p>
              {/* Nút cập nhật */}
              <button
                onClick={openUpdateModal} // Add onClick to open update modal
                className="mt-6 w-full flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                <span className="font-semibold">Cập nhật</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal (New Modal for Editing) */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[400px] p-6 relative">
            {/* Nút đóng */}
            <button
              onClick={closeUpdateModal}
              className="absolute top-2 right-2 text-gray-600"
            >
              ✕
            </button>

            {/* Tiêu đề */}
            <h3 className="text-lg font-semibold mb-4">
              Cập nhật thông tin cá nhân
            </h3>

            {/* Form chỉnh sửa */}
            <div className="space-y-4">
              {/* Tên hiển thị */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  defaultValue="Phan Nguyên Khôi Nguyên"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              {/* Giới tính */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giới tính
                </label>
                <div className="mt-1 flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Nam"
                      defaultChecked
                      className="mr-2"
                    />
                    Nam
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Nữ"
                      className="mr-2"
                    />
                    Nữ
                  </label>
                </div>
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ngày sinh
                </label>
                <div className="mt-1 flex space-x-2">
                  <select
                    defaultValue="01"
                    className="border border-gray-300 rounded-md p-2"
                  >
                    {[...Array(31)].map((_, i) => (
                      <option
                        key={i + 1}
                        value={String(i + 1).padStart(2, "0")}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <select
                    defaultValue="12"
                    className="border border-gray-300 rounded-md p-2"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option
                        key={i + 1}
                        value={String(i + 1).padStart(2, "0")}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <select
                    defaultValue="2003"
                    className="border border-gray-300 rounded-md p-2"
                  >
                    {[...Array(100)].map((_, i) => {
                      const year = 2025 - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Nút Hủy và Cập nhật */}
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={closeUpdateModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={closeUpdateModal} // Add logic to save changes here
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
