import { geminiService } from "../services/chatbot.service.js"; // import service ES module

const geminiController = {
  /**
   * Xử lý yêu cầu tạo nội dung từ Gemini API.
   * @param {Object} req - Đối tượng Request từ Express.
   * @param {Object} res - Đối tượng Response từ Express.
   */
  async generateContent(req, res) {
    console.log("Request body:", req.body);
    const { prompt, model } = req.body || {};

    if (!prompt) {
      return res
        .status(400)
        .json({ error: 'Thiếu trường "prompt" trong yêu cầu.' });
    }

    try {
      const text = await geminiService.generateContent(prompt, model);

      res.status(200).json({
        success: true,
        data: text,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Có lỗi xảy ra khi gọi Gemini API.",
      });
    }
  },
};

export default geminiController;
