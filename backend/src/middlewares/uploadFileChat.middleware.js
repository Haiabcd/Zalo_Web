// middlewares/multer.middleware.js
import multer from "multer";

const MAX_SIZE_FILE = 1024 * 1024 * 1024; // 1024MB = 1GB
const MAX_FILES = 20; // Số file tối đa trong một thư mục

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Cho phép mọi định dạng file
  cb(null, true);
};

const limits = {
  fileSize: MAX_SIZE_FILE, // Giới hạn 1GB
  files: MAX_FILES, // Giới hạn số lượng file cho folder
};

// Middleware cho gửi file đơn lẻ
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_FILE },
}).single("file");

// Middleware cho gửi folder
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits,
}).array("files", MAX_FILES);

// Middleware kiểm tra dung lượng file (chung cho cả file và folder)
export const checkFileSize = (req, res, next) => {
  // Kiểm tra cho file đơn lẻ
  if (req.file) {
    if (req.file.size > MAX_SIZE_FILE) {
      return res.status(400).json({
        message: `File ${req.file.originalname} vượt quá dung lượng cho phép (1024MB)`,
      });
    }
    return next();
  }

  // Kiểm tra cho folder
  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ message: "Không có file nào được đính kèm." });
  }

  if (!req.body.folderName) {
    return res.status(400).json({ message: "Tên thư mục là bắt buộc." });
  }

  for (const file of req.files) {
    if (file.size > MAX_SIZE_FILE) {
      return res.status(400).json({
        message: `File ${file.originalname} vượt quá dung lượng cho phép (1024MB)`,
      });
    }
  }

  next();
};
