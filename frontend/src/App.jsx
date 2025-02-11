import React,{useEffect,useState} from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Context
import { AuthProvider } from './context/AuthContext'

// Pages
import LoginForm from './pages/Login/LoginForm'
import Home from './pages/Home/Home' 


// Component Layout bảo vệ cho các trang yêu cầu đăng nhập
const ProtectedRoute = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  const isAuthenticated = storedUser ? JSON.parse(storedUser) : null;

  console.log("📌 Kiểm tra storedUser:", storedUser);
  console.log("📌 Kiểm tra isAuthenticated:", isAuthenticated);

  if (!isAuthenticated) {
    console.log("🚫 Chưa đăng nhập, chuyển hướng về trang login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ Đã đăng nhập, hiển thị trang được bảo vệ");
  return children;
};




function App() {
  return (
    // <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
               </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to="/login" replace />} 
            />
            <Route 
              path="*" 
              element={<Navigate to="/login" replace />} 
            />
          </Routes>
        </div>
      </Router>
    // </AuthProvider>
  )
}

export default App