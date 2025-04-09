import { useState } from "react";
import { ChevronLeft, X, ImagePlus } from "lucide-react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { authService } from "../services/api/auth.service";

const AvatarChange = ({ isOpen, onClose, onReturn }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsLoading(true); // 👈 Bắt đầu loading
        await authService.updateAvatar(file);
        toast.success("Cập nhật ảnh thành công");
        onClose();
      } catch (err) {
        toast.error("❌ Lỗi khi cập nhật ảnh");
        console.error(err);
      } finally {
        setIsLoading(false); // 👈 Kết thúc loading
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[360px] h-[460px] p-6 relative">
        {/* Nút đóng */}
        <div className="flex items-center justify-between w-full mb-3 h-2">
          <div className="flex items-center gap-3">
            <button
              className="text-gray-600 hover:text-black p-1"
              onClick={onReturn}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-base font-semibold text-slate-800">
              Cập nhật thông tin cá nhân
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <hr className="border-t border-gray-300 w-full my-4" />

        {/* Form chỉnh sửa */}
        <div className="space-y-4">
          <div className="mt-2 flex justify-center">
            <label className="w-full flex justify-center items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-200 cursor-pointer">
              <ImagePlus className="w-5 h-5 mr-2" />
              Tải lên từ máy tính
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {isLoading && (
            <div className="text-sm text-blue-600 text-center">
              Đang cập nhật ảnh đại diện...
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-black">
              Ảnh đại diện của tôi
            </label>
            <div className="mt-3 flex space-x-4">
              <label className="flex items-center text-sm">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Profile"
                  className="w-14 h-14 object-cover rounded-full"
                />
              </label>
              <label className="flex items-center text-sm">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Profile"
                  className="w-14 h-14 object-cover rounded-full"
                />
              </label>
              <label className="flex items-center text-sm">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Profile"
                  className="w-14 h-14 object-cover rounded-full"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AvatarChange.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onReturn: PropTypes.func.isRequired,
};

export default AvatarChange;
