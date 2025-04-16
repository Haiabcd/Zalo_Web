import { useState } from "react";
import AddFriendModal from "./AddFriendModal";
import AccountInformation from "./AccountInformation";
import PropTypes from "prop-types";

export default function FriendPage({ onClose }) {
  const [isAddModalOpen, setAddModalOpen] = useState(true); // Mở mặc định
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);

  const handleSearch = () => {
    setAddModalOpen(false); // Ẩn modal "Thêm bạn"
    setInfoModalOpen(true); // Hiện modal "Thông tin cá nhân"
  };

  const returnhandleSearch = () => {
    setInfoModalOpen(false); // Đóng thông tin cá nhân
    setAddModalOpen(true); // Mở lại modal thêm bạn (nếu muốn)
  };

  const lostAccountInformation = () => {
    onClose();
    setInfoModalOpen(false);
  };

  const lostAddFriendModal = () => {
    onClose();
    setAddModalOpen(false);
  };
  return (
    <>
      {isAddModalOpen && (
        <AddFriendModal onClose={lostAddFriendModal} onSearch={handleSearch} />
      )}

      <AccountInformation
        isOpen={isInfoModalOpen}
        onClose={lostAccountInformation}
        onReturn={returnhandleSearch}
      />
    </>
  );
}
FriendPage.propTypes = {
  onClose: PropTypes.func.isRequired,
};
