import Sidebar from "@/components/Sidebar";
import NoChatSelected from "../../components/NoChatSelected";
import ChatContainer from "../../components/ChatContainer";

const HomePage = () => {
  return (
    <div className="h-screen flex">
      {/* Sidebar chiếm 30% chiều ngang, 100% chiều dọc */}
      <div className="w-[30%] h-full bg-gray-200">
        <Sidebar />
      </div>

      {/* NoChatSelected chiếm 70% chiều ngang, 100% chiều dọc */}
      <div className="w-[70%] h-full bg-white">
        <NoChatSelected />
      </div>
    </div>
  );
};

export default HomePage;
