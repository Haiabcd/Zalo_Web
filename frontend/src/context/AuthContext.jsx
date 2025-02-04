import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api/auth.service';

const AuthContext = createContext(null); // Khởi tạo context (quản lý state và function)

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []); // Chỉ chạy 1 lần sau khi render lần đầu

  useEffect(() => {
    if (user) {  // Nếu user tồn tại
      localStorage.setItem('user', JSON.stringify(user));  // Lưu user vào localStorage
    } else {
      localStorage.removeItem('user'); // Xóa user khỏi localStorage
    }
  }, [user]); //Khi user thay đổi thì chạy

  const login = async (phoneNumber, password) => {
    try {
      const data = await authService.login(phoneNumber, password);
      setUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  //Chứa các giá trị và chức năng cần thiết để cung cấp ngữ cảnh xác thực cho các component con.
  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}  {/* Nếu loading = false thì render children */}
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
