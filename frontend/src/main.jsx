import React from 'react'
import ReactDOM from 'react-dom/client' //Dùng để hiển thị giao diện trên trình duyệt
import App from './App.jsx'
import './styles/global.css'
import './services/api/axios.interceptor'

ReactDOM.createRoot(document.getElementById('root')).render( //Tạo một root mới và render App vào root đó
  <React.StrictMode> 
    <App />
  </React.StrictMode>,
)