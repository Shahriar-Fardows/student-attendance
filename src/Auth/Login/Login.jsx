// login-form.jsx
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import PropTypes from "prop-types";

export default function LoginForm({ onNavigate }) {
  const [step, setStep] = useState(1); // Step 1: Email/Password, Step 2: PIN
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    pin: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For PIN field, only allow numbers and max 6 digits
    if (name === "pin") {
      if (!/^\d*$/.test(value) || value.length > 6) return;
    }
    
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!credentials.email.trim()) {
      newErrors.email = "Email is required";
    }
    
    if (!credentials.password) {
      newErrors.password = "Password is required";
    }
    
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!credentials.pin) {
      newErrors.pin = "PIN is required";
    } else if (credentials.pin.length !== 6) {
      newErrors.pin = "PIN must be exactly 6 digits";
    } else if (credentials.pin !== userData.pin) {
      newErrors.pin = "Incorrect PIN";
    }
    
    return newErrors;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const newErrors = validateStep1();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Check if user exists
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const user = teachers.find(
      (t) => t.email === credentials.email && t.password === credentials.password
    );
    
    if (!user) {
      setErrors({ login: "Invalid email or password" });
      return;
    }
    
    setUserData(user);
    setStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    const newErrors = validateStep2();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Login successful
    alert(`Welcome, ${userData.name}! You have successfully logged in.`);
    // Here you would typically set user session or redirect to dashboard
  };

  LoginForm.propTypes = {
    onNavigate: PropTypes.func.isRequired,
  };

  return (
    <div className="lg:bg-white lg:rounded-lg lg:shadow-lg lg:p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Teacher Login
      </h2>
      
      {step === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          {errors.login && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errors.login}</span>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => onNavigate("forgotPassword")}
              className="text-sm text-blue-600 hover:underline focus:outline-none"
            >
              Forgot Password?
            </button>
            <button
              type="button"
              onClick={() => onNavigate("forgotPin")}
              className="text-sm text-blue-600 hover:underline focus:outline-none"
            >
              Forgot PIN?
            </button>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={handleStep2Submit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your 6-Digit PIN
            </label>
            <input
              type="password"
              id="pin"
              name="pin"
              value={credentials.pin}
              onChange={handleChange}
              maxLength={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.pin ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your 6-digit PIN"
            />
            {errors.pin && <p className="mt-1 text-sm text-red-500">{errors.pin}</p>}
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/2 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-1/2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => onNavigate("register")}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}