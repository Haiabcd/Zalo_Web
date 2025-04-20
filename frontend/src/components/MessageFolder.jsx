// components/MessageFolder.jsx
import { Folder, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const MessageFolder = ({ folderInfo, createdAt }) => {
  console.log("folderInfo", folderInfo);
  const handleDownload = async () => {
    const zip = new JSZip();

    try {
      for (const file of folderInfo.files) {
        const response = await fetch(file.fileUrl);
        const blob = await response.blob();
        zip.file(file.fileName, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${folderInfo.folderName || "folder"}.zip`);
    } catch (error) {
      console.error("Tải thư mục thất bại:", error);
    }
  };

  return (
    <div className="flex bg-white rounded-xl border p-4 gap-4 items-center shadow-sm w-fit">
      <div className="flex items-center gap-3">
        <span className="text-4xl">📁</span>

        <div className="flex flex-col">
          <span className="font-medium text-gray-900 text-base">
            {folderInfo.folderName}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-green-600 font-medium">✓ Đã có trên máy</span>
          </div>
          <span className="text-xs text-gray-400 mt-1">
            {new Date(createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      <div className="ml-auto flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => alert("Mở thư mục")}
          className="hover:bg-gray-100"
        >
          <Folder className="w-5 h-5 text-gray-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          className="hover:bg-gray-100"
        >
          <Download className="w-5 h-5 text-gray-600" />
        </Button>
      </div>
    </div>
  );
};

export default MessageFolder;
