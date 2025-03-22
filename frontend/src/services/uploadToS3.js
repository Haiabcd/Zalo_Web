import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "../config/s3Config";

const BUCKET_NAME = "myzallo";

export const uploadFileToS3 = async (file) => {
  const key = `uploads/${Date.now()}-${file.name}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: uint8Array,
        ContentType: file.type,
      },
    });

    const result = await upload.done();

    return {
      fileName: file.name,
      fileKey: key,
      fileUrl: result.Location,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};
