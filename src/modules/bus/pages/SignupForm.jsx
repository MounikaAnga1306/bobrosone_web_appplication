import React, { useState, useEffect } from "react";
import { useNavigate,useLocation} from "react-router-dom";
import axios from "axios";
import { User, Mail, Phone, Lock, Eye, EyeOff,X } from "lucide-react";

const SignupForm = ({ closeModal,openSignin,openVerifyOtp}) => {
  const navigate = useNavigate();
  const location = useLocation();
  

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    user: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  // ⭐ Auto fill Google name & email if coming from Google login
  useEffect(() => {
    if (location.state) {
      setFormData((prev) => ({
        ...prev,
        user: location.state.name || "",
        email: location.state.email || "",
      }));
    }
  }, [location.state]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // safer React update
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Email validation
    if (name === "email") {
      if (!validateEmail(value)) {
        setEmailError("Please enter a valid email address (example@gmail.com)");
      } else {
        setEmailError("");
      }
    }

    // Password validation
    if (name === "password") {
      if (!validatePassword(value)) {
        setPasswordError(
          "Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character (! @ # $ % ^ & *)."
        );
      } else {
        setPasswordError("");
      }
    }

    // Confirm password validation
    if (name === "confirmPassword") {
      if (value !== formData.password) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post("https://api.bobros.co.in/signup/form", {
        user: formData.user,
        email: formData.email,
        mobile: Number(formData.mobile),
        password: formData.password,
      });

      openVerifyOtp(formData);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) {
          setError("Email or Mobile already registered");
        } else {
          setError("Signup failed. Please try again later.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    }
  };

  const InputField = ({ icon: Icon, ...props }) => (
    <div
      className="flex items-center border border-gray-400 rounded-lg px-3 py-2 mb-4
focus-within:border-[#FD561E]
focus-within:shadow-[0_0_6px_rgba(253, 86, 30, 0.35)]
transition-all duration-200"
    >
      <Icon className="w-5 h-5 text-black mr-2" />
      <input {...props} className="w-full outline-none" />
    </div>
  );

  return (
    <div className=" flex items-center justify-center ">
      <div className="relative bg-white p-8 rounded-2xl shadow-xl w-[420px]">
        <button
  onClick={closeModal}
  className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
>
  <X size={22} />
</button>
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Sign up with <span className="text-[#fd561e]">BOBROS</span>
        </h2>

        <p className="text-center text-gray-500 text-sm mb-4">
          Avail Great Discounts and Earn Reward Points
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSignup}>
          <InputField
            icon={User}
            type="text"
            name="user"
            placeholder="Username"
            value={formData.user}
            onChange={handleChange}
            required
          />

          <InputField
            icon={Mail}
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            disabled={location.state?.email}
            required
          />

          {emailError && (
            <p className="text-red-500 text-xs -mt-3 mb-3">{emailError}</p>
          )}

          <InputField
            icon={Phone}
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
          />

          <div className="relative">
            <InputField
              icon={Lock}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-black"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            <p className="text-xs text-gray-500 -mt-2 mb-2">
              Password must be at least 8 characters long and contain one
              uppercase letter, one lowercase letter, one number, and one
              special character (! @ # $ % ^ & *).
            </p>

            {passwordError && (
              <p className="text-red-500 text-xs mb-2">{passwordError}</p>
            )}
          </div>

          <div className="relative">
            <InputField
              icon={Lock}
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-3 text-black"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

            {confirmPasswordError && (
              <p className="text-red-500 text-xs -mt-2 mb-2">
                {confirmPasswordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#FD561E] text-white py-2 rounded-lg font-semibold cursor-pointer hover:bg-[#e64d19] transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already Registered?{" "}
          <span
            onClick={ openSignin  }
            className="text-[#FD561E] font-semibold cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </p>

        <p className="text-center text-xs mt-6 text-gray-500">
          No longer wish to use BOBROS Account?
        </p>

        <p className="text-center text-sm text-[#FD561E] cursor-pointer hover:underline">
          Request for Deletion
        </p>
      </div>
    </div>
  );
};

export default SignupForm;