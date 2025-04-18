import {
  Pencil,
  ChevronLeft,
  X,
  Users,
  Share2,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { authService } from "../services/api/auth.service";
import PropTypes from "prop-types";

const AccountInformation = ({ isOpen, onClose, onReturn }) => {
  // Kiểm tra dữ liệu người dùng
  const user = authService.getCurrentUser()?.user;

  // Nếu không có dữ liệu người dùng, hiển thị thông báo lỗi
  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-lg w-[360px] max-w-full overflow-hidden p-4">
          <p className="text-center text-red-500">
            Không tìm thấy thông tin người dùng
          </p>
        </div>
      </div>
    );
  }

  // Hàm định dạng ngày tháng
  const formatDate = (isoDateStr) => {
    const date = new Date(isoDateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Hàm định dạng giới tính
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-[360px] max-w-full min-h-[76vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
          <button onClick={onReturn} className="text-gray-700 hover:text-black">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-800">Thông tin cá nhân</span>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="flex flex-col gap-4 p-4">
          {/* Ảnh bìa */}
          <div
            className="h-32 bg-cover bg-center relative"
            style={{
              backgroundImage: user.coverImage
                ? `url('${user.coverImage}')`
                : "none",
              backgroundColor: user.coverImage ? "transparent" : "#1E90FF",
            }}
          ></div>

          {/* Avatar và tên */}
          <div className=" -mt-12">
            <div className="relative flex justify-start">
              <div className="w-20 h-20 rounded-full border-2 border-white shadow-md overflow-hidden">
                <img
                  src={user.profilePic || "/user.jpg"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center ml-2 mt-6">
                <h4 className="text-base font-semibold mr-1.5">
                  {user.fullName}
                </h4>
                <button className="text-blue-600 hover:underline text-sm">
                  <span className="flex items-center text-sm text-black font-semibold">
                    <Pencil className="w-3 h-3 text-black hover:text-blue-800" />
                    _
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Nút Kết bạn / Nhắn tin */}
          <div className="flex justify-center gap-2 mt-1 px-4">
            <button className="flex-1 py-1 rounded-md border font-medium text-sm hover:bg-gray-100">
              Kết bạn
            </button>
            <button className="flex-1 py-1 rounded-md bg-blue-100 text-blue-700 font-medium text-sm hover:bg-blue-200">
              Nhắn tin
            </button>
          </div>

          <div className="w-full border-t-4 mt-1 border-gray-300"></div>

          {/* Thông tin cá nhân */}
          <div className="space-y-2 text-sm">
            <h3 className="text-gray-700 font-semibold">Thông tin cá nhân</h3>
            <div className="flex text-xs">
              <span className="text-gray-500">Giới tính</span>
              <span className="ml-14">{formatGender(user.gender)}</span>
            </div>
            <div className="flex text-xs">
              <span className="text-gray-500">Ngày sinh</span>
              <span className="ml-12">{formatDate(user.dateOfBirth)}</span>
            </div>
          </div>

          <div className="w-full border-t-4 mt-1 border-gray-300"></div>

          {/* Ghi chú */}
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span>Nhóm chung (0)</span>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ danh thiếp</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-red-600">
              <Ban className="w-4 h-4" />
              <span>Chặn tin nhắn và cuộc gọi</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Báo xấu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AccountInformation.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onReturn: PropTypes.func.isRequired,
};

export default AccountInformation;
