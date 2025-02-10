import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Context
import { AuthProvider } from './context/AuthContext'

// Pages
import LoginForm from './pages/Login/LoginForm'
import Home from './pages/Home/Home' 


// Component Layout bảo vệ cho các trang yêu cầu đăng nhập
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user')  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}

export default App