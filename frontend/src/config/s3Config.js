import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Bắt buộc để tương thích trình duyệt
  forceBundle: true, // ✅ Fix lỗi "Module util has been externalized for browser compatibility"
});
