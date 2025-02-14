import Sidebar from "@/components/Sidebar";
import NoChatSelected from "../../components/NoChatSelected";
import ChatContainer from "../../components/ChatContainer";
import MenuHome from "../../components/MenuHome";

import { useUser } from "../../context/UserContext";

const HomePage = () => {
  const { selectedUser } = useUser();

  return (
    <div className="h-screen flex">
      {/* Sidebar chiếm 5% chiều ngang, 100% chiều dọc */}
      <div className="w-[60px] h-full bg-gray-200">
        <MenuHome />
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
    </div>
  );
};

export default HomePage;
