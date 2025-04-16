import { ChevronLeft, X } from "lucide-react";
import Select from "react-select";
import { authService } from "../services/api/auth.service";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const generateOptions = (count, offset = 0, pad = true) =>
  Array.from({ length: count }, (_, i) => {
    const value = i + 1 + offset;
    return {
      value: pad ? String(value).padStart(2, "0") : value,
      label: pad ? String(value).padStart(2, "0") : String(value),
    };
  });

const dayOptions = generateOptions(31);
const monthOptions = generateOptions(12);
const yearOptions = Array.from({ length: 100 }, (_, i) => {
  const year = 2025 - i;
  return { value: year, label: String(year) };
});

const customSelectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "32px",
    height: "32px",
    fontSize: "12px",
    paddingLeft: "2px",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    paddingTop: 2,
    paddingBottom: 2,
  }),
  valueContainer: (base) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: 0,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: "32px",
  }),
};

const UpdateModal = ({ isOpen, onClose, onReturn }) => {
  const user = authService.getCurrentUser().user;

  const dob = new Date(user.dateOfBirth);
  const initialDay = String(dob.getDate()).padStart(2, "0");
  const initialMonth = String(dob.getMonth() + 1).padStart(2, "0");
  const initialYear = dob.getFullYear();

  const [fullName, setFullName] = useState(user.fullName);
  const [gender, setGender] = useState(user.gender);
  const [day, setDay] = useState(initialDay);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    const isChanged =
      fullName !== user.fullName ||
      gender !== user.gender ||
      day !== initialDay ||
      month !== initialMonth ||
      year !== initialYear;
    setHasChanged(isChanged);
  }, [fullName, gender, day, month, year]);

  const handleUpdate = async () => {
    const updatedData = {
      fullName,
      gender,
      dateOfBirth: `${year}-${month}-${day}`,
    };

    try {
      await authService.updateProfile(user._id, updatedData);
      toast.success("Cập nhật thông tin thành công");
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      toast.error("Cập nhật thất bại");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[360px] h-[460px] p-6 relative">
        {/* Header */}
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

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-sans text-gray-700">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-3 block w-full border border-gray-300 rounded-md p-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Thông tin cá nhân
            </label>
            <div className="mt-3 flex space-x-4">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={gender === "Male"}
                  onChange={() => setGender("Male")}
                  className="mr-2 w-3 h-3"
                />
                Nam
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={gender === "Female"}
                  onChange={() => setGender("Female")}
                  className="mr-2 w-3 h-3"
                />
                Nữ
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-sans text-gray-700">
              Ngày sinh
            </label>
            <div className="mt-2 flex space-x-2 w-full">
              <div className="w-1/3">
                <Select
                  options={dayOptions}
                  value={dayOptions.find((d) => d.value === day)}
                  onChange={(option) => setDay(option.value)}
                  isSearchable={false}
                  styles={customSelectStyles}
                />
              </div>
              <div className="w-1/3">
                <Select
                  options={monthOptions}
                  value={monthOptions.find((m) => m.value === month)}
                  onChange={(option) => setMonth(option.value)}
                  isSearchable={false}
                  styles={customSelectStyles}
                />
              </div>
              <div className="w-1/3">
                <Select
                  options={yearOptions}
                  value={yearOptions.find((y) => y.value === year)}
                  onChange={(option) => setYear(option.value)}
                  isSearchable={false}
                  styles={customSelectStyles}
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-t border-gray-300 w-full mt-28" />

        {/* Footer */}
        <div className="mt-8 flex justify-end space-x-2">
          <button
            onClick={onReturn}
            className="px-3 text-xs text-gray-600 bg-gray-300 border border-gray-300 rounded-sm font-bold py-2"
          >
            Hủy
          </button>
          <button
            onClick={hasChanged ? handleUpdate : null}
            className={`px-3 py-2 text-xs rounded-sm bg-blue-600 text-white font-bold
              ${hasChanged ? "" : "opacity-50 cursor-not-allowed"}`}
            disabled={!hasChanged}
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
};

UpdateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onReturn: PropTypes.func.isRequired,
};

export default UpdateModal;
