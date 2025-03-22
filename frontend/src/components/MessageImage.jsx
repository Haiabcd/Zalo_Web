import { useEffect, useState } from "react";
import { messageService } from "../services/api/message.service.js";

const MessageImage = ({ fileUrl, fileName }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (fileUrl) {
        const url = await messageService.getImage(fileUrl);
        setImageUrl(url);
      }
    };
    fetchImage();
  }, [fileUrl]);

  if (!imageUrl) {
    return <p>Đang tải ảnh...</p>; // Hiển thị loading nếu chưa có URL
  }

  return (
    <img
      src={imageUrl}
      alt={fileName}
      className="max-w-xs rounded-lg shadow-md"
    />
  );
};

export default MessageImage;
