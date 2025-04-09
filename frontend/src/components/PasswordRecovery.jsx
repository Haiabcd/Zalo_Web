// ZaloPasswordRecovery.jsx
import { useState } from "react";
import { Smartphone } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import ZaloPasswordReset from "./PasswordReset";

const ZaloPasswordRecovery = () => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("phone");
  const [captchaToken, setCaptchaToken] = useState("");
  const [lang, setLang] = useState("vi");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (step === "phone") {
      setStep("captcha");
    } else if (step === "captcha") {
      if (!captchaToken) {
        alert(
          lang === "vi" ? "Vui lòng xác minh CAPTCHA" : "Please verify CAPTCHA"
        );
        return;
      }
      setStep("reset");
    }
  };

  if (step === "reset") {
    return <ZaloPasswordReset phone={phone} lang={lang} />;
  }

  const content = {
    vi: {
      title: "Khôi phục mật khẩu Zalo",
      subtitle: "để kết nối với ứng dụng Zalo Web",
      label: "Nhập số điện thoại của bạn",
      placeholder: "0934185833",
      continue: "Tiếp tục",
      verify: "Xác minh",
      back: "« Quay lại",
      language: "Tiếng Việt",
    },
    en: {
      title: "Recover your Zalo password",
      subtitle: "to connect with Zalo Web application",
      label: "Enter your phone number",
      placeholder: "0934185833",
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
