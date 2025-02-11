import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Khi trang load lại, kiểm tra user trong localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Cập nhật user vào localStorage mỗi khi user thay đổi
  useEffect(() => {
    console.log(user);
    if (user && user._id) {
      console.log("🔄 Cập nhật localStorage với user hợp lệ:", user);
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      console.log("⚠ Dữ liệu user không hợp lệ, không lưu vào localStorage");
      localStorage.removeItem("user");
    }
  }, [user]);
  

  const login = async (phoneNumber, password) => {
    setLoading(true);
    try {
      console.log("Login authContext start");
      const data = await authService.login(phoneNumber, password);
      console.log("✅ Nhận dữ liệu user từ server:", data);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (error) {
      console.error("❌ Lỗi trong login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};
