import React, { useState, useEffect } from "react";

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 KB";
  const k = 1024;
  const dm = 2;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const MessageImage = ({ message, isSender }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleImageDoubleClick = () => {
    setIsZoomed(true);
  };

  const closeZoom = () => {
    setIsZoomed(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(message.fileInfo.fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = message.fileInfo.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // giải phóng bộ nhớ

      setIsDownloaded(true);
    } catch (error) {
      console.error("Lỗi khi tải ảnh:", error);
    }
  };

  useEffect(() => {
    // Nếu ảnh đã được cache cục bộ, hiển thị là đã có trên máy
    const img = new Image();
    img.src = message.fileInfo.fileUrl;
    img.onload = () => setIsDownloaded(true);
  }, [message.fileInfo.fileUrl]);

  return (
    <div
      className={`flex flex-col gap-1 max-w-[100%] h-[700px]${
        isSender ? "ml-auto items-end" : "mr-auto items-start"
      }`}
    >
      <div
        className={`rounded-xl overflow-hidden p-2 shadow-sm border ${
          isSender ? "bg-blue-100" : "bg-gray-100"
        }`}
      >
        {/* Ảnh chính */}
        <img
          src={message.fileInfo.fileUrl}
          alt={message.fileInfo.fileName}
          className="w-full max-w-xs rounded-md object-cover mb-2"
          onDoubleClick={handleImageDoubleClick}
        />
        {isZoomed && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            {/* Nút đóng */}
            <button
              onClick={closeZoom}
              className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-red-400 transition"
              title="Đóng"
            >
              ×
            </button>

            {/* Ảnh phóng to */}
            <img
              src={message.fileInfo.fileUrl}
              alt="Zoomed"
              className="max-w-full max-h-full rounded shadow-lg"
            />
          </div>
        )}

        {/* Thông tin file */}
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/337/337940.png"
              className="w-6 h-6"
              alt="icon"
            />
            <div>
              <div className="font-medium">{message.fileInfo.fileName}</div>
              <div className="text-xs text-gray-600">
                {formatBytes(message.fileInfo.fileSize)}{" "}
                {isDownloaded && (
                  <span className="text-green-600 ml-1">● Đã có trên máy</span>
                )}
              </div>
            </div>
          </div>

          {/* Nút tải về */}
          <button
            onClick={handleDownload}
            className="text-gray-600 hover:text-gray-900 transition"
            title="Tải xuống"
          >
            ⬇️
          </button>
        </div>
      </div>

      {/* Thời gian gửi */}
      <span className="text-xs text-gray-500">
        {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
};

export default MessageImage;
