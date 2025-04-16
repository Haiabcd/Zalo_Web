import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import ZaloPasswordRecovery from "./components/PasswordRecovery";
import ContactSidebar from "./components/ContactSidebar";
import AccountInformation from "./components/AccountInformation";

// Pages
import LoginForm from "./pages/Login/LoginForm";
import Home from "./pages/Home/Home";

// Component Layout bảo vệ cho các trang yêu cầu đăng nhập
const ProtectedRoute = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  const isAuthenticated = storedUser ? JSON.parse(storedUser) : null;

  if (!isAuthenticated) {
    console.log("🚫 Chưa đăng nhập, chuyển hướng về trang login");
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
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
            path="/documents"
            element={
              <ProtectedRoute>
                <ContactSidebar />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ZaloPasswordRecovery />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/account-information" element={<AccountInformation />} />
        </Routes>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          closeOnClick
          pauseOnHover={false}
          draggable={false}
          theme="dark"
        />
      </div>
    </Router>
  );
}
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
export default App;
