import { useState, useEffect} from "react"
import { Smile, ImageIcon, Paperclip, FileSpreadsheet, Gift, Video, MessageSquare, MoreHorizontal } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {messageService} from "../services/api/message.service"

const ChatInterface = ({ user }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  

  // Message bubble component
  const MessageBubble = ({ message }) => {
    if (message.receiverId == user._id) {
      return (
        <div className="flex justify-end">
          <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
                {message.messageType === "text" ? (
                  <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                    <p className="text-sm">{message.content}</p>
                  </pre>
                ) : (
                  <p className="text-sm">...............</p>
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
          <img src={message.senderId?.avatar || "/user.jpg"} alt={message.receiverId} className="rounded-full" />
        </Avatar>
        <div className="space-y-1">
          <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
            {message.messageType === "text" ? (
              <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                <p className="text-sm">{message.content}</p>
              </pre>
            ) : (
              <p className="text-sm">...............</p>
            )}
          </div>
          <span className="text-xs text-gray-500">{message.timestamp}</span>
        </div>
      </div>
    )

  }

  console.log("user", user)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await messageService.getMessage({ userId2: user._id });
        console.log("data", data);
        setMessages(data || []); 
        console.log("messages", messages);
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
      }
    };

    fetchMessages();
  }, [user._id]); 

  useEffect(() => {
    console.log("messages updated:", JSON.stringify(messages));
  }, [messages]); 
  


  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMessageData = {
      receiverId: user._id,
      messageType: "text",
      content: newMessage,
    };

    try {
      const sentMessage = await messageService.sendMessage(newMessageData);
      setMessages((prevMessages) => [...prevMessages, sentMessage.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Gửi tin nhắn thất bại", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {  
      e.preventDefault(); // Ngăn chặn xuống dòng
      handleSendMessage();
    }
  };


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
          <MessageBubble key={message._id} message={message} />
        ))}
      </div>

      {/* Input Area*/}
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
              placeholder={`Nhập @, tin nhắn tới ${user.fullName}`}
              className="w-full rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface

