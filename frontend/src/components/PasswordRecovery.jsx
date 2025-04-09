import { useState } from "react";
import { Smartphone } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import ZaloPasswordReset from "./PasswordReset";
import { authAPI } from "../config/axios";

const ZaloPasswordRecovery = () => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("phone");
  const [captchaToken, setCaptchaToken] = useState("");
  const [lang, setLang] = useState("vi");
  const [tempToken, setTempToken] = useState("");
  const [error, setError] = useState("");

  const normalizePhoneNumber = (phoneInput) => {
    // Nếu bắt đầu bằng +84 thì giữ nguyên
    if (phoneInput.startsWith("+84")) {
      return phoneInput;
    }
    // Nếu bắt đầu bằng 0 thì bỏ 0 và thêm +84
    if (phoneInput.startsWith("0")) {
      return `+84${phoneInput.slice(1)}`;
    }
    // Nếu không có tiền tố, thêm +84
    return `+84${phoneInput}`;
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    setError("");
    setStep("captcha");
  };

  const handleCaptchaSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      setError(
        lang === "vi" ? "Vui lòng xác minh CAPTCHA" : "Please verify CAPTCHA"
      );
      return;
    }

    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      const response = await authAPI.post("/auth/forgot-password/request", {
        phoneNumber: normalizedPhone,
        captchaValue: captchaToken,
      });

      setTempToken(response.data.tempToken);
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const handleSubmit = (e) => {
    if (step === "phone") {
      handlePhoneSubmit(e);
    } else if (step === "captcha") {
      handleCaptchaSubmit(e);
    }
  };

  if (step === "reset") {
    return (
      <ZaloPasswordReset phone={phone} lang={lang} tempToken={tempToken} />
    );
  }

  const content = {
    vi: {
      title: "Khôi phục mật khẩu Zalo",
      subtitle: "để kết nối với ứng dụng Zalo Web",
      label: "Nhập số điện thoại của bạn",
      placeholder: "Số điện thoại",
      continue: "Tiếp tục",
      verify: "Xác minh",
      back: "« Quay lại",
      language: "Tiếng Việt",
    },
    en: {
      title: "Recover your Zalo password",
      subtitle: "to connect with Zalo Web application",
      label: "Enter your phone number",
      placeholder: "Phone number",
      continue: "Continue",
      verify: "Verify",
      back: "« Go back",
      language: "English",
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-36 bg-[#f0f6fd] px-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-semibold text-[#0068ff]">Zalo</h1>
        <p className="text-gray-700 mt-2">
          {content[lang].title}
          <br />
          {content[lang].subtitle}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md w-[22%] p-6 space-y-4"
      >
        <label className="text-gray-700 font-medium flex items-center justify-center">
          {content[lang].label}
        </label>
        <div className="flex items-center border-0 border-b border-gray-300 rounded px-3 py-2">
          <Smartphone className="w-4 h-4 text-gray-600 mr-2" />
          <span className="text-gray-600 mr-2">+84</span>
          <input
            type="tel"
            className="flex-1 border-gray-400 outline-none focus:border-blue-500"
            placeholder={content[lang].placeholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="text-red-500 mb-4">
            {lang === "vi" ? error : "An error occurred"}
          </div>
        )}

        {step === "captcha" && (
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(value) => setCaptchaToken(value)}
          />
        )}

        <button
          type="submit"
          className="w-full bg-[#0068ff] text-white py-2 rounded font-medium hover:bg-blue-600 transition"
        >
          {step === "captcha" ? content[lang].verify : content[lang].continue}
        </button>

        <div className="text-sm text-left text-gray-600 hover:underline cursor-pointer">
          {content[lang].back}
        </div>
      </form>

      <div className="mt-16 text-sm text-gray-600">
        <span
          className={`font-semibold cursor-pointer ${
            lang === "vi" ? "text-[#0068ff]" : "hover:underline"
          }`}
          onClick={() => setLang("vi")}
        >
          Tiếng Việt
        </span>{" "}
        |{" "}
        <span
          className={`cursor-pointer ${
            lang === "en" ? "text-[#0068ff] font-semibold" : "hover:underline"
          }`}
          onClick={() => setLang("en")}
        >
          English
        </span>
      </div>
    </div>
  );
};

export default ZaloPasswordRecovery;
