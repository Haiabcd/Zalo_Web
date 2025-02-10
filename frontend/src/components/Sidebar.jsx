import { Search, MoreHorizontal, ChevronDown } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const chatItems = [
  {
    id: 1,
    name: "TIẾNG ANH KHUM KHÓ",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "Dieu Huong: MNG VAO XEM LIVE...",
    time: "12 giờ",
    unread: 1,
    isGroup: true,
  },
  {
    id: 2,
    name: "Thanh Yến",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "Bạn: Dạ mẹ",
    time: "14 giờ",
  },
  {
    id: 3,
    name: "Anh Hải",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "Giờ à đi",
    time: "16 giờ",
    unread: 4,
  },
  {
    id: 4,
    name: "Võ Kim Anh",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "Danh thiếp",
    time: "23 giờ",
    unread: 1,
  },
  {
    id: 5,
    name: "Điện máy XANH",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "đã em cảm ơn anh ạ",
    time: "2 ngày",
  },
]

export default function ChatInterface() {
  return (
    <div className="w-full max-w-md mx-auto bg-white">
      {/* Thanh tìm kiếm */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Thanh điều hướng */}
      <div className="flex items-center border-b px-4">
        <Button variant="ghost" className="text-blue-600 font-medium relative py-4">
          Tất cả
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
        </Button>
        <Button variant="ghost" className="text-gray-600 font-medium py-4">
          Chưa đọc
        </Button>
        <div className="flex-1 flex justify-end items-center gap-2">
          <Button variant="ghost" className="text-gray-600 flex items-center gap-1">
            Phân loại
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Danh sách chat */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        <div className="divide-y">
          {chatItems.map((chat) => (
            <div key={chat.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{chat.message}</p>
              </div>
              {chat.unread && (
                <div className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1.5">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

