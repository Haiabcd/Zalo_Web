import React from 'react'
import ReactDOM from 'react-dom/client' //Dùng để hiển thị giao diện trên trình duyệt
import App from './App.jsx'
import './services/api/axios.interceptor'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render( //Tạo một root mới và render App vào root đó
  <React.StrictMode> 
    <App />
  </React.StrictMode>,
)