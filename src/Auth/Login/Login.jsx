import { useState } from "react";
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import PropTypes from "prop-types";
import useAuthContext from "../Context/useAuthContext";
import { Contexts } from "../Context/Context";
import Swal from 'sweetalert2'; // Import SweetAlert
import { useNavigate } from 'react-router-dom'; // Import useNavigate for route redirection

export default function LoginForm({ onNavigate }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const { loginUser } = useAuthContext(Contexts);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors = { email: "", password: "" };

    if (!credentials.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!credentials.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password; // Return false if there are any errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = credentials.email.trim();
    const password = credentials.password.trim();

    if (!validate()) {
      return; // Prevent login attempt if validation fails
    }

    // Login user
    loginUser(email, password)
      .then((user) => {
        // Show SweetAlert on successful login
        Swal.fire({
          title: 'Welcome!',
          text: `You have successfully logged in, ${user.name}.`,
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          // Redirect to the home route after login
          navigate('/');
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  LoginForm.propTypes = {
    onNavigate: PropTypes.func.isRequired,
  };

  return (
    <div className="lg:bg-white lg:rounded-lg lg:shadow-lg lg:p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Teacher Login
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Login
        </button>
      </form>

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
