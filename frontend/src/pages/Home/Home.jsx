import Sidebar from "@/components/Sidebar";
import NoChatSelected from "../../components/NoChatSelected";
import ChatContainer from "../../components/ChatContainer";
import MenuHome from "../../components/MenuHome";

import { useUser } from "../../context/UserContext";

const HomePage = () => {
  const { selectedUser } = useUser();

  return (
    <div className="h-screen flex">
      {/* Sidebar chiếm 10% chiều ngang, 100% chiều dọc */}
      <div className="w-[5%] h-full bg-gray-200 ">
        <MenuHome />
      </div>

      {/* Sidebar chiếm 35% chiều ngang, 100% chiều dọc */}
      <div className="w-[30%] h-full bg-gray-200 ">
        <Sidebar />
      </div>

      {/* NoChatSelected chiếm 60% chiều ngang, 100% chiều dọc */}
      <div className="w-[60%] h-full bg-white">
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
