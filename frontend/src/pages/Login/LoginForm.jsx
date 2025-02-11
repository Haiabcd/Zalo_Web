import React, { useState } from 'react';
// import { useAuth } from "../../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api/auth.service';

function LoginForm() {
  const [language, setLanguage] = useState('vi');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+84');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  // const { login } = useAuth();

  const texts = {
    vi: {
      title: 'Đăng nhập tài khoản Zalo',
      subtitle: 'để kết nối với ứng dụng Zalo Web',
      loginWithPassword: 'Đăng nhập với mật khẩu',
      phoneNumber: 'Số điện thoại',
      password: 'Mật khẩu',
      loginButton: 'Đăng nhập với mật khẩu',
      forgotPassword: 'Quên mật khẩu',
      loginWithQR: 'Đăng nhập qua mã QR',
      downloadTitle: 'Nâng cao hiệu quả công việc với Zalo PC',
      downloadDesc: 'Gửi file lớn lên đến 1 GB, chụp màn hình, gọi video và nhiều tiện ích hơn nữa',
      download: 'Tải ngay'
    },
    en: {
      title: 'Login to Zalo Account',
      subtitle: 'to connect with Zalo Web application',
      loginWithPassword: 'Login with password',
      phoneNumber: 'Phone number',
      password: 'Password',
      loginButton: 'Login with password',
      forgotPassword: 'Forgot password',
      loginWithQR: 'Login with QR code',
      downloadTitle: 'Enhance work efficiency with Zalo PC',
      downloadDesc: 'Send large files up to 1 GB, take screenshots, make video calls and more utilities',
      download: 'Download now'
    }
  };

  const t = texts[language];

  const handleSubmit = async (e) => {
    e.preventDefault();  
    setError("");
    setLoading(true);
    try {
      const userData = await authService.login(phoneNumber, password);
      if (userData) {
        console.log("🔑 userData:", userData);
        navigate('/home', { replace: true });
      } else {
        console.error("⚠ Không có dữ liệu user, không thể điều hướng");
      }
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4">
      {/* Login Card */}
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-md">
        <div className="text-center mb-6">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bYe9k7HqqsFfMzt1D4lpO35LKxrPrO.png"
            alt="Zalo Logo"
            className="w-24 mx-auto mb-4"
          />
          <h1 className="text-xl font-bold">{t.title}</h1>
          <p className="text-gray-600 text-sm">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-center text-lg font-semibold">{t.loginWithPassword}</h2>

          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="bg-gray-100 px-4 py-2 border-r border-gray-300 outline-none"
            >
              <option value="+84">+84</option>
              <option value="+1">+1</option>
            </select>
            <input
              type="tel"
              placeholder={t.phoneNumber}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 p-2 outline-none"
            />
          </div>

          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md outline-none"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : t.loginButton}
          </button>

          {error && <div className="text-red-500 text-center">{error}</div>}

          <div className="flex flex-col items-center space-y-2 text-sm">
            <a href="#" className="text-blue-600 hover:underline">{t.forgotPassword}</a>
            <a href="#" className="text-blue-600 hover:underline">{t.loginWithQR}</a>
          </div>
        </form>
      </div>

      {/* Download Card */}
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-md mt-4 flex items-center">
        <div className="flex-shrink-0 text-blue-600">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path fill="currentColor" d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/>
          </svg>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="font-semibold">{t.downloadTitle}</h3>
          <p className="text-sm text-gray-600">{t.downloadDesc}</p>
        </div>
        <button className="border border-blue-600 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 transition">
          {t.download}
        </button>
      </div>

      {/* Language Selector */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setLanguage('vi')}
          className={`px-3 py-1 rounded-md text-sm ${language === 'vi' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
        >
          Tiếng Việt
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-md text-sm ${language === 'en' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
        >
          English
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
