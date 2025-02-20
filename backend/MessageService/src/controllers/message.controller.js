import {
  sendMessage,
  getMessagesBetweenUsers,
  getLastMessageByParticipants,
} from "../services/message.service.js";

export const send = async (req, res) => {
  console.log("Đã vào controller");
  try {
    const { senderId, receiverId, messageType, content, file, folder } =
      req.body.params;

    console.log("controller: ", req.body.params);

    let fileData = null;
    let folderData = null;

    if (messageType === "file" && file) {
      fileData = {
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize || 0,
      };
    } else if (messageType === "folder" && folder) {
      folderData = {
        folderName: folder.folderName,
        files: folder.files.map((f) => ({
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileSize: f.fileSize || 0,
        })),
      };
    }

    // Gửi tin nhắn
    const newMessage = await sendMessage(
      senderId,
      receiverId,
      messageType,
      content,
      fileData,
      folderData
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessagesBetweenTwoUsers = async (req, res) => {
  try {
    const { userId1, userId2 } = req.query;

    if (!userId1 || !userId2) {
      return res.status(400).json({ message: "Thiếu userId1 hoặc userId2" });
    }

    const messages = await getMessagesBetweenUsers(userId1, userId2);
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getLastMessage = async (req, res) => {
  try {
    const { participants } = req.query;
    console.log("participants", participants);

    if (!participants) {
      return res.status(400).json({ message: "Cần 2 participants hợp lệ!" });
    }

    const lastMessage = await getLastMessageByParticipants(participants);
    res.json(lastMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
