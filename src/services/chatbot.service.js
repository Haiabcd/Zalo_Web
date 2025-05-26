import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config(); // Load biến môi trường từ file .env

// Lấy API Key từ biến môi trường
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Lỗi: GEMINI_API_KEY không được định nghĩa trong file .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Prompt mặc định mô tả nhiệm vụ cho AI
const basePrompt = `
Bạn là một trợ lý trò chuyện của Nhóm 7 môn công nghệ mới , thầy Tôn Long Phước giảng dạy. 
Hãy trò chuyện như một người bạn 
`;

export const geminiService = {
  /**
   * Gửi một prompt tới Gemini API và nhận phản hồi.
   * @param {string} promptText - Nội dung câu hỏi/yêu cầu cụ thể của người dùng.
   * @param {string} modelName - Tên của mô hình Gemini (mặc định: 'gemini-pro').
   * @returns {Promise<string>} - Nội dung phản hồi từ Gemini.
   */
  async generateContent(promptText, modelName = "gemini-2.0-flash") {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const fullPrompt = `${basePrompt}\n\nYêu cầu của người dùng: ${promptText}`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error(`Lỗi khi gọi Gemini API với model ${modelName}:`, error);

      if (error.response && error.response.status) {
        throw new Error(
          `API Error: ${error.response.status} - ${
            error.response.statusText || "Unknown error"
          }. Message: ${error.response.data?.error?.message || error.message}`
        );
      }

      throw new Error(`Không thể kết nối tới Gemini API: ${error.message}`);
    }
  },
};
