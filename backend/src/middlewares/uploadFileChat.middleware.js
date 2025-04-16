// middlewares/multer.middleware.js
import multer from "multer";

const MAX_SIZE_FILE = 1024 * 1024 * 1024; // 1024MB = 1GB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Cho phép mọi định dạng file
  cb(null, true);
};

const limits = {
  fileSize: MAX_SIZE_FILE, // Giới hạn 1GB
};

const upload = multer({
  storage,
  fileFilter,
  limits,
}).single("file");

// Middleware kiểm tra dung lượng (phòng trường hợp cần logic riêng sau này)
export const checkFileSize = (req, res, next) => {
  if (!req.file) return next();

  const { size } = req.file;

  if (size > MAX_SIZE_FILE) {
    return res
      .status(400)
      .json({ message: "File vượt quá dung lượng cho phép (1024MB)" });
  }

  next();
};

export default upload;
