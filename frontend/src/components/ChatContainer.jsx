"use client"

import { useState } from "react"
import { Smile, ImageIcon, Paperclip, FileSpreadsheet, Gift, Video, MessageSquare, MoreHorizontal } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const ChatInterface = ({ user }) => {
  const [newMessage, setNewMessage] = useState("")

  // Hardcoded messages data
  const messages = [
    {
      id: "1",
      content:
        "bạch truật 12g, hoàng kỳ sao 12g, long nhãn 12g, táo nhân sao chảy đen 12g, đảng sâm 10g, Cam thảo 8g, Viễn chí sao vàng 8g, Đơn bì 12g, Chỉ tử sao 12g, Nghệ vàng khô 16g, Hạt sen 16g, Bạch thược 12g, Ngưu tất 12g, Thục địa 10g.",
      sender: {
        id: "123",
        name: "Anh Hải",
        avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rkeiYAqxzOaQcH0HddM0hO2SXZwvh8.png",
      },
      type: "text",
      timestamp: "15:27",
    },
    {
      id: "2",
      content: `MONGODB_URI=mongodb+srv://haianhhidan:CKiNiX4Nxx7sNt5u@cluster0.p3fld.mongodb.net/chat_db?retryWrites=true&w=majority&appName=Cluster0
PORT=5001
JWT_SECRET=mysecretkey
NODE_ENV=development
CLOUDANAR_CLOUD_NAME=djnikrvkh
CLOUDINARY_API_KEY=638696644194388
CLOUDINARY_API_SECRET=Ke3SY1JZDYQGzy0zoMx5-SyRBpo`,
      sender: {
        id: "456",
        name: "System",
        avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rkeiYAqxzOaQcH0HddM0hO2SXZwvh8.png",
      },
      type: "code",
      timestamp: "Hôm nay",
      isOwn: true,
    },
    {
      id: "3",
      content: `MONGODB_URI=mongodb+srv://haianhhidan:CKiNiX4Nxx7sNt5u@cluster0.p3fld.mongodb.net/chat_db?retryWrites=true&w=majority&appName=Cluster0
PORT=5002
AUTH_SERVICE_URL=http://localhost:5001/api/auth
JWT_SECRET=mysecretkey`,
      sender: {
        id: "456",
        name: "System",
        avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rkeiYAqxzOaQcH0HddM0hO2SXZwvh8.png",
      },
      type: "code",
      timestamp: "12:38",
      isOwn: true,
    },
    {
      id: "4",
      content: "docker run --name redis-container -d -p 6379:6379 redis",
      sender: {
        id: "123",
        name: "Anh Hải",
        avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rkeiYAqxzOaQcH0HddM0hO2SXZwvh8.png",
      },
      type: "code",
      timestamp: "12:43",
    },
  ]

  // Message bubble component
  const MessageBubble = ({ message }) => {
    if (message.isOwn) {
      return (
        <div className="flex justify-end">
          <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
            {message.type === "code" ? (
              <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                <code>{message.content}</code>
              </pre>
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
            <div className="text-right mt-1">
              <span className="text-xs text-gray-500">{message.timestamp}</span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 mt-1">
          <img src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} className="rounded-full" />
        </Avatar>
        <div className="space-y-1">
          <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
            {message.type === "code" ? (
              <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                <code>{message.content}</code>
              </pre>
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
          <span className="text-xs text-gray-500">{message.timestamp}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rkeiYAqxzOaQcH0HddM0hO2SXZwvh8.png"
              alt="User avatar"
              className="rounded-full"
            />
          </Avatar>
          <span className="font-medium">Anh Hải</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Input Area - đã sửa */}
      <div className="sticky bottom-0 border-t bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon">
              <Smile className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <ImageIcon className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <FileSpreadsheet className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <Gift className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Nhập @, tin nhắn tới Anh Hải"
              className="w-full rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface

