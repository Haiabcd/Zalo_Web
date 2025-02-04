import React, { useState } from 'react'
import { useAuth } from "../../context/AuthContext"
import './LoginForm.css'
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const [language, setLanguage] = useState('vi')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [countryCode, setCountryCode] = useState('+84')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate();

  const { login } = useAuth()

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
  }

  const t = texts[language]

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const userData = await login(phoneNumber, password);
      
      // Kiểm tra xem dữ liệu có được lưu vào localStorage không
      console.log("User data:", userData);
      console.log("LocalStorage user:", localStorage.getItem('user'));
  
      navigate('/home', { replace: true });
  
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bYe9k7HqqsFfMzt1D4lpO35LKxrPrO.png" alt="Zalo Logo" className="logo" />
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>{t.loginWithPassword}</h2>
          
          <div className="phone-input">
            <select 
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="country-code"
            >
              <option value="+84">+84</option>
              <option value="+1">+1</option>
            </select>
            <input
              type="tel"
              placeholder={t.phoneNumber}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="phone-number"
            />
          </div>

          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
          />

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Đang xử lý...' : t.loginButton}
          </button>
          {error && <div className="error-message">{error}</div>}

          <div className="links">
            <a href="#" className="forgot-password">{t.forgotPassword}</a>
            <a href="#" className="qr-login">{t.loginWithQR}</a>
          </div>
        </form>
      </div>

      <div className="download-card">
        <div className="download-content">
          <div className="download-icon">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path fill="#0068FF" d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/>
            </svg>
          </div>
          <div className="download-text">
            <h3>{t.downloadTitle}</h3>
            <p>{t.downloadDesc}</p>
          </div>
          <button className="download-button">{t.download}</button>
        </div>
      </div>

      <div className="language-selector">
        <button 
          onClick={() => setLanguage('vi')}
          className={language === 'vi' ? 'active' : ''}
        >
          Tiếng Việt
        </button>
        <button 
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'active' : ''}
        >
          English
        </button>
      </div>
    </div>
  )
}

export default LoginForm