import { useState } from "react";
import { useUser } from "../../context/UserContext";
import Sidebar from "@/components/Sidebar";
import NoChatSelected from "../../components/NoChatSelected";
import ChatContainer from "../../components/ChatContainer";
import MenuHome from "../../components/MenuHome";
import ProfileModal from "../../components/ProfileModal";
import UpdateModal from "../../components/UpdateModal";
import AvatarChange from "../../components/AvatarChange";

const HomePage = () => {
  const { selectedUser } = useUser();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAvatarChangeOpen, setIsAvatarChangeOpen] = useState(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const openAvatarChange = () => {
    closeProfileModal();
    setIsAvatarChangeOpen(true);
  };
  const closeAvatarChange = () => setIsAvatarChangeOpen(false);

  const openUpdateModal = () => {
    closeProfileModal();
    setIsUpdateModalOpen(true);
  };
  const closeUpdateModal = () => setIsUpdateModalOpen(false);

  const returnProfileModel = () => {
    setIsUpdateModalOpen(false);
    openProfileModal();
  };

  const returnProfileModel_2 = () => {
    setIsAvatarChangeOpen(false);
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
          <ChatContainer conversation={selectedUser} />
        ) : (
          <NoChatSelected />
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        onUpdate={openUpdateModal}
        openAvatarChange={openAvatarChange}
      />

      {/* Update Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={closeUpdateModal}
        onReturn={returnProfileModel}
      />

      {/* AvatarChange Component */}
      <AvatarChange
        isOpen={isAvatarChangeOpen}
        onClose={closeAvatarChange}
        onReturn={returnProfileModel_2}
      />
    </div>
  );
};

export default HomePage;
