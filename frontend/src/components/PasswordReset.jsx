import { useState } from "react";
import { Lock } from "lucide-react";

const ZaloPasswordReset = ({ phone }) => {
  const [lang, setLang] = useState("vi");

  const texts = {
    vi: {
      title: "Zalo",
      instruction:
        "Nhập mã xác thực được gửi đến số điện thoại của bạn để đặt lại mật khẩu.",
      phonePrefix: "(+84)",
      codePlaceholder: "Nhập mã kích hoạt",
      passwordPlaceholder: "Vui lòng nhập mật khẩu.",
      confirmPasswordPlaceholder: "Nhập lại mật khẩu",
      submit: "Xác nhận",
    },
    en: {
      title: "Zalo",
      instruction:
        "Enter the verification code sent to your phone number to reset your password.",
      phonePrefix: "(+84)",
      codePlaceholder: "Enter activation code",
      passwordPlaceholder: "Enter new password.",
      confirmPasswordPlaceholder: "Confirm new password",
      submit: "Confirm",
    },
  };

  const t = texts[lang];

  const handleLanguageSwitch = (newLang) => {
    setLang(newLang);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f6fd] px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-[22%]">
        <h2 className="text-center text-blue-600 font-bold text-xl mb-4">
          {t.title}
        </h2>
        <p className="text-center text-gray-700 mb-4">
          {t.instruction}
          <br />
          <span className="text-blue-600 font-medium">
            {t.phonePrefix} {phone}
          </span>
        </p>

        <input
          type="text"
          placeholder={t.codePlaceholder}
          className="w-full mb-3 px-3 py-2 border rounded"
        />

        <div className="relative mb-3">
          <Lock className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            placeholder={t.passwordPlaceholder}
            className="w-full px-10 py-2 border rounded"
          />
        </div>

        <div className="relative mb-4">
          <Lock className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            placeholder={t.confirmPasswordPlaceholder}
            className="w-full px-10 py-2 border rounded"
          />
        </div>

        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          {t.submit}
        </button>
      </div>

      {/* Ngôn ngữ cố định */}
      <div className="mt-8 text-sm text-gray-600">
        <span
          className={`cursor-pointer hover:underline ${
            lang === "vi" ? "font-semibold text-[#0068ff]" : ""
          }`}
          onClick={() => handleLanguageSwitch("vi")}
        >
          Tiếng Việt
        </span>{" "}
        |{" "}
        <span
          className={`cursor-pointer hover:underline ${
            lang === "en" ? "font-semibold text-[#0068ff]" : ""
          }`}
          onClick={() => handleLanguageSwitch("en")}
        >
          English
        </span>
      </div>
    </div>
  );
};

export default ZaloPasswordReset;
