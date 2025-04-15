import { Pencil } from "lucide-react";
import { Camera } from "lucide-react";
import { X } from "lucide-react";
import { authService } from "../services/api/auth.service";
import PropTypes from "prop-types";

const ProfileModal = ({ isOpen, onClose, onUpdate, openAvatarChange }) => {
  const user = authService.getCurrentUser().user;

  const formatDate = (isoDateStr) => {
    const date = new Date(isoDateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatGender = (gender) => {
    switch (gender) {
      case "Male":
        return "Nam";
      case "Female":
        return "Nữ";
      case "Other":
        return "Khác";
      default:
        return "Không xác định";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[360px] h-[460px] overflow-hidden relative">
        {/* Nút đóng */}
        <div className="w-full h-9 bg-white rounded-t-lg px-4 py-3 flex items-center justify-between shadow-sm">
          <span className="text-base font-semibold text-slate-800">
            Thông Tin Cá Nhân
          </span>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ảnh bìa + Ảnh đại diện + Tên */}
        <div className="relative bg-white">
          {/* Ảnh bìa */}
          <div
            className="h-36 bg-cover bg-center"
            style={{
              backgroundImage: user.coverImage
                ? `url('${user.coverImage}')`
                : "none",
              backgroundColor: user.coverImage ? "transparent" : "#1E90FF",
            }}
          ></div>

          {/* Ảnh đại diện + Tên */}
          <div className="absolute -bottom-12 left-4 flex items-center ">
            {/* Ảnh đại diện */}
            <div className="relative w-fit">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
                <img
                  src={user.profilePic || "/user.jpg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                className="absolute bottom-0 left-14 bg-white p-1 rounded-full shadow-md cursor-pointer hover:bg-gray-200 border"
                onClick={openAvatarChange}
              >
                <Camera className="w-5 h-5 text-gray-600" />
                <input type="file" className="hidden" />
              </button>
            </div>

            {/* Tên và chỉnh sửa */}
            <div className="ml-4 mt-8">
              <div className="flex items-center">
                <h4 className="text-base font-semibold mr-1.5">
                  {user.fullName}
                </h4>
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={onUpdate}
                >
                  <span className="flex items-center text-sm text-black font-semibold">
                    <Pencil className="w-3 h-3 text-black hover:text-blue-800" />
                    _
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin cá nhân */}
        <div className="mt-16 border-t-4 pt-4 space-y-2 text-sm px-4">
          <div>
            <span className="font-semibold">Thông tin cá nhân</span>
          </div>
          <div className="flex justify-between">
            <span className="flex-none text-xs text-gray-500">Giới tính</span>
            <span className="w-[250px] text-xs">
              {formatGender(user.gender)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="flex-none text-xs text-gray-500">Ngày sinh</span>
            <span className="w-[250px] text-xs">
              {formatDate(user.dateOfBirth)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="flex-none text-xs text-gray-500">Điện thoại</span>
            <span className="w-[250px] text-xs">{user.phoneNumber}</span>
          </div>
        </div>

        {/* Ghi chú */}
        <p className="mt-4 text-xs text-gray-500 px-4">
          Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này.
        </p>
        <hr className="border-t border-gray-300 w-full my-4 mt-2" />

        {/* Nút cập nhật */}
        <button
          onClick={onUpdate}
          className="w-full flex items-center justify-center gap-x-2 mb-4"
        >
          <span className="flex items-center text-sm text-black font-semibold">
            <Pencil className="w-3 h-3 text-black hover:text-blue-800" />_
          </span>
          <span className="font-semibold text-sm text-black">Cập nhật</span>
        </button>
      </div>
    </div>
  );
};

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  openAvatarChange: PropTypes.func.isRequired,
};

export default ProfileModal;
