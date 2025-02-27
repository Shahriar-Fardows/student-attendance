import { useState } from "react";
import PropTypes from "prop-types";
import useAuthContext from "../Context/useAuthContext";
import { Contexts } from "../Context/Context";
import Swal from "sweetalert2";

export default function ForgotPassword({ onNavigate }) {
  const { forgotPassword } = useAuthContext(Contexts);
  
  // State hooks for email, error, and success
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    // Check if user exists
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const user = teachers.find((t) => t.email === trimmedEmail);

    if (!user) {
      setError("No account found with this email address");
      return;
    }

    forgotPassword(trimmedEmail)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Password reset instructions have been sent to your email.",
        });
        setSuccess(true);
        setError("");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  ForgotPassword.propTypes = {
    onNavigate: PropTypes.func.isRequired,
  };

  return (
    <div className="lg:bg-white lg:rounded-lg lg:shadow-lg lg:p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>
      
      {success ? (
        <div className="text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p>Password reset instructions have been sent to your email.</p>
          </div>
          <button
            onClick={() => onNavigate("login")}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-gray-600 mb-4">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Send Reset Instructions
          </button>
          
          <div className="text-center">
            <button
              onClick={() => onNavigate("login")}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Back to Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
