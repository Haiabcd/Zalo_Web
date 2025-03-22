import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import {
  Smile,
  ImageIcon,
  Paperclip,
  FileSpreadsheet,
  Gift,
  Video,
  MessageSquare,
  MoreHorizontal,
  FolderIcon,
  FileIcon,
  Download,
  Folder,
  Copy,
  ThumbsUp,
} from "lucide-react";

const EmojiPickerComponent = ({ onEmojiSelect }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji.emoji);
    setShowPicker(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Nút mở emoji */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowPicker((prev) => !prev)}
      >
        <Smile className="h-5 w-5 text-gray-500" />
      </Button>

      {/* Hiển thị emoji picker khi bấm vào */}
      {showPicker && (
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "0px",
            zIndex: 1000,
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerComponent;
