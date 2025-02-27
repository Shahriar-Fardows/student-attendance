import { useState } from 'react';
import RegisterForm from '../../Auth/Login/SignUp';
import LoginForm from '../../Auth/Login/Login';
import ForgotPassword from '../../Auth/Login/ForgetPass';

const Register = () => {
    const [currentPage, setCurrentPage] = useState("login");

    const renderPage = () => {
      switch (currentPage) {
        case "register":
          return <RegisterForm onNavigate={setCurrentPage} />;
        case "login":
          return <LoginForm onNavigate={setCurrentPage} />;
        case "forgotPassword":
          return <ForgotPassword onNavigate={setCurrentPage} />;
        default:
          return <LoginForm onNavigate={setCurrentPage} />;
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {renderPage()}
        </div>
      </div>
    );
  }
export default Register;

