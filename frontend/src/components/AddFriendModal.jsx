import { useState } from "react";
import { X, CircleUserRound } from "lucide-react";
import PropTypes from "prop-types";
import { userService } from "../services/api/user.service";

const suggestions = [
  {
    name: "An Nguyên",
    note: "Từ gợi ý kết bạn",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "Anh Duy",
    note: "Từ gợi ý kết bạn",
    avatar: "https://i.pravatar.cc/40?img=2",
  },
  {
    name: "Anh Thư",
    note: "Từ gợi ý kết bạn",
    avatar: "https://i.pravatar.cc/40?img=3",
  },
];

export default function AddFriendModal({ onClose, onSearch }) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSearch = async () => {
    try {
      const user = await userService.findUserByPhoneNumber(phoneNumber);
      onSearch(user);
    } catch (error) {
      alert(
        "Số điện thoại chưa đăng ký tài khoản hoặc không cho phép tìm kiếm"
      );
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg w-full max-w-96 min-h-[76vh] p-4 shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Thêm bạn</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600 hover:text-black" />
          </button>
        </div>

        <hr className="border-t border-gray-300 w-full mb-6" />

        {/* Nhập số điện thoại */}
        <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 mb-4 gap-2">
          <img
            src="https://flagcdn.com/w40/vn.png"
            alt="VN flag"
            className="w-5 h-4 object-cover rounded-sm"
          />
          <select className="w-16 text-sm text-gray-700 bg-transparent outline-none">
            <option value="VN">(+84)</option>
            <option value="US">(+1)</option>
            <option value="ID">(+62)</option>
            <option value="TH">(+66)</option>
          </select>
          <input
            type="number"
            placeholder="Số điện thoại"
            className="flex-1 outline-none text-sm pl-2"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        {/* Danh sách gợi ý */}
        <div className="space-y-3 mb-4 overflow-y-auto max-h-[60vh]">
          <div className="flex items-center gap-2 mb-6">
            <CircleUserRound className="w-5 h-5 text-gray-500" />
            <p className="text-sm text-gray-500 ">Có thể bạn quen</p>
          </div>
          {suggestions.map((user, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.note}</p>
                </div>
              </div>
              <button className="text-blue-600 border border-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50">
                Kết bạn
              </button>
            </div>
          ))}
        </div>
        <a href="#" className="text-sm text-blue-600 hover:underline mt-2">
          Xem thêm
        </a>

        <hr className="border-t border-gray-300 w-full my-4 mt-64" />

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-auto">
          <button
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );
}

// Cuối file AddFriendModal.jsx
AddFriendModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};
