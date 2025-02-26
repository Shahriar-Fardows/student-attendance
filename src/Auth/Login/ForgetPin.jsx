// forgot-pin.jsx
import  { useState } from "react";
import PropTypes from "prop-types";

export default function ForgotPin({ onNavigate }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    newPin: "",
    confirmPin: "",
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For PIN fields, only allow numbers and max 6 digits
    if (name === "newPin" || name === "confirmPin") {
      if (!/^\d*$/.test(value) || value.length > 6) return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.newPin) {
      newErrors.newPin = "New PIN is required";
    } else if (formData.newPin.length !== 6) {
      newErrors.newPin = "PIN must be exactly 6 digits";
    }
    
    if (formData.newPin !== formData.confirmPin) {
      newErrors.confirmPin = "PINs do not match";
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
    const userIndex = teachers.findIndex(
      (t) => t.email === formData.email && t.password === formData.password
    );
    
    if (userIndex === -1) {
      setErrors({ auth: "Invalid email or password" });
      return;
    }
    
    setStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    const newErrors = validateStep2();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Update PIN
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const userIndex = teachers.findIndex(
      (t) => t.email === formData.email && t.password === formData.password
    );
    
    if (userIndex !== -1) {
      teachers[userIndex].pin = formData.newPin;
      localStorage.setItem("teachers", JSON.stringify(teachers));
      setSuccess(true);
    }
  };


  ForgotPin.propTypes = {
    onNavigate: PropTypes.func.isRequired,
  };

  return (
    <div className="lg:bg-white lg:rounded-lg lg:shadow-lg lg:p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset PIN</h2>
      
      {success ? (
        <div className="text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p>Your PIN has been successfully reset.</p>
          </div>
          <button
            onClick={() => onNavigate("login")}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Return to Login
          </button>
        </div>
      ) : step === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <p className="text-gray-600 mb-4">
            To reset your PIN, please verify your identity first.
          </p>
          
          {errors.auth && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errors.auth}</span>
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
              value={formData.email}
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
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Continue
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
      ) : (
        <form onSubmit={handleStep2Submit} className="space-y-4">
          <p className="text-gray-600 mb-4">
            Create a new 6-digit PIN.
          </p>
          
          <div>
            <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 mb-1">
              New PIN
            </label>
            <input
              type="password"
              id="newPin"
              name="newPin"
              value={formData.newPin}
              onChange={handleChange}
              maxLength={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.newPin ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter new 6-digit PIN"
            />
            {errors.newPin && <p className="mt-1 text-sm text-red-500">{errors.newPin}</p>}
          </div>
          
          <div>
            <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm PIN
            </label>
            <input
              type="password"
              id="confirmPin"
              name="confirmPin"
              value={formData.confirmPin}
              onChange={handleChange}
              maxLength={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPin ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Confirm new 6-digit PIN"
            />
            {errors.confirmPin && <p className="mt-1 text-sm text-red-500">{errors.confirmPin}</p>}
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
              Reset PIN
            </button>
          </div>
        </form>
      )}
    </div>
  );
}