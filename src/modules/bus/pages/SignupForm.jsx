import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { User, Mail, Phone, Lock, Eye, EyeOff, X, Trash2, ArrowLeft } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// LEFT PANEL — Responsive image
// ─────────────────────────────────────────────────────────────
const LeftImagePanel = () => (
  <div
    className="hidden md:flex flex-col items-center justify-center rounded-l-2xl overflow-hidden flex-shrink-0"
    style={{
      alignSelf: "stretch", 
      width: "380px",
      backgroundColor: "#fff8f5"
    }}
  >
    <img
      src="/assets/travel_image.png"
      alt="Tour & Travel"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover", 
        display: "block",
      }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────
// Account Deletion Card — Mobile Responsive
// ─────────────────────────────────────────────────────────────
const AccountDeletionCard = ({ onBack, onClose }) => {
  const API = "https://api.bobros.co.in";

  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState("");
  const [otp, setOtp]                 = useState("");
  const [timer, setTimer]             = useState(30);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ mobile: "", email: "" });

  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  const handleSendOTP = async () => {
    if (!form.mobile || !form.email) {
      setMessage("Please fill all fields.");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      await axios.post(`${API}/deleteaccount`, {
        mobile: form.mobile,
        email: form.email,
      });
      setStep(2);
      setTimer(30);
      setOtp("");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.replace(/\D/g, "").trim();
    if (otpValue.length < 4) {
      setMessage("Please enter the complete OTP.");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      await axios.post(`${API}/deleteaccount`, {
        mobile: form.mobile,
        email: form.email,
        otp: otpValue,
      });
      setShowSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.error || "OTP verification failed.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = form.email ? form.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "";

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center text-center px-2 py-4 gap-5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-green-500 shadow-lg">
          <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="w-full rounded-2xl border border-gray-100 px-4 sm:px-5 py-4 sm:py-5 text-left space-y-2 bg-gray-50">
          <p className="text-xs sm:text-sm font-bold text-gray-800">BOBROS Account Deletion</p>
          <p className="text-xs sm:text-sm text-gray-600">Dear customer,</p>
          <p className="text-xs sm:text-sm text-gray-600">Your request for <b>BOBROS account deletion</b> has been successfully submitted.</p>
          <p className="text-xs sm:text-sm text-gray-500 pt-1">Thanks & Regards,<br /><span className="font-semibold">Team BOBROS</span></p>
        </div>
        <button onClick={onClose} className="w-full bg-[#F05A28] text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all shadow-md text-sm sm:text-base">✓ OK</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <button onClick={onBack} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
        </button>
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Request Account Deletion</h3>
      </div>

      {message && (
        <p className="text-red-500 text-xs mb-3 sm:mb-4 bg-red-50 p-2 rounded-lg text-center">
          {message}
        </p>
      )}

      {step === 1 ? (
        <div className="space-y-3 sm:space-y-4">
          <input 
            type="tel" 
            placeholder="Mobile Number" 
            value={form.mobile} 
            onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} 
            className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:border-orange-500 transition-all"
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:border-orange-500 transition-all"
          />
          <button 
            onClick={handleSendOTP} 
            disabled={loading} 
            className="w-full bg-red-500 text-white cursor-pointer font-bold py-2.5 sm:py-3.5 rounded-xl shadow-lg disabled:opacity-50 text-sm sm:text-base transition-all"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-gray-50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs border border-gray-100">
            <div className="flex justify-between mb-1"><span>Mobile:</span><span className="font-bold">XXXXXX{form.mobile.slice(-4)}</span></div>
            <div className="flex justify-between"><span>Email:</span><span className="font-bold">{maskedEmail}</span></div>
          </div>
          <input 
            type="text" 
            maxLength={6} 
            value={otp} 
            placeholder="••••••" 
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} 
            className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 text-center text-xl sm:text-3xl font-bold tracking-widest outline-none focus:border-orange-500 transition-all"
          />
          <p className="text-center text-xs text-gray-500">
            {timer > 0 ? `Resend OTP in ${timer}s` : 
              <span onClick={() => { setStep(1); setTimer(30); }} className="text-[#FD561E] cursor-pointer font-bold">Resend OTP</span>
            }
          </p>
          <button 
            onClick={handleVerifyOTP} 
            disabled={loading} 
            className="w-full bg-red-600 text-white font-bold py-2.5 sm:py-3.5 rounded-xl shadow-lg text-sm sm:text-base transition-all"
          >
            Confirm Deletion
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main SignUpForm — Mobile Responsive
// ─────────────────────────────────────────────────────────────
const SignUpForm = ({ closeModal, openSignin, openVerifyOtp }) => {
  const location = useLocation();
  const [showDeletion, setShowDeletion] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ user: "", email: "", mobile: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state) {
      setFormData(prev => ({ ...prev, user: location.state.name || "", email: location.state.email || "" }));
    }
  }, [location.state]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    try {
      await axios.post("https://api.bobros.co.in/signup/form", { 
        user: formData.user, 
        email: formData.email, 
        mobile: Number(formData.mobile), 
        password: formData.password 
      });
      openVerifyOtp(formData);
    } catch (err) { 
      setError(err.response?.data?.message || "Signup failed. User may already exist."); 
    }
  };

  const InputField = ({ icon: Icon, ...props }) => (
    <div className="flex items-center border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 mb-3 sm:mb-4 focus-within:border-[#FD561E] focus-within:ring-1 focus-within:ring-[#FD561E] transition-all">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0" />
      <input {...props} className="w-full outline-none text-xs sm:text-sm bg-transparent" />
    </div>
  );

  return (
    <div className="flex items-center justify-center p-3 sm:p-4 min-h-screen md:min-h-0">
      {/* Container - Responsive width */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch overflow-hidden w-full max-w-[95%] sm:max-w-[500px] md:max-w-[900px] mx-auto"
        style={{ maxHeight: "90vh", minHeight: "auto" }}
      >
        <LeftImagePanel />

        <div className="flex-1 p-5 sm:p-6 md:p-8 lg:p-10 overflow-y-auto bg-white" style={{ maxHeight: "90vh" }}>
          <button 
            onClick={closeModal} 
            className="absolute top-3 right-3 sm:top-5 sm:right-5 text-gray-400 hover:text-black z-10 bg-white rounded-full p-1"
          >
            <X size={18} className="sm:w-5 -mt-2 -mr-1 sm:h-5 md:w-6 md:h-6" />
          </button>

          {showDeletion ? (
            <AccountDeletionCard onBack={() => setShowDeletion(false)} onClose={closeModal} />
          ) : (
            <div className="flex flex-col h-full justify-center">
              <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-1">
                Sign up with <span className="text-[#fd561e]">BOBROS</span>
              </h2>
              <p className="text-center text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 md:mb-8">
                Avail Great Discounts and Earn Reward Points
              </p>
              
              {error && (
                <p className="text-red-500 text-xs mb-3 sm:mb-4 text-center bg-red-50 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <form onSubmit={handleSignup}>
                {/* Username and Email - Responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-4">
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
                    required 
                  />
                </div>
                
                <InputField 
                  icon={Phone} 
                  type="tel" 
                  name="mobile" 
                  placeholder="Mobile Number" 
                  value={formData.mobile} 
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} 
                  required 
                />

                {/* Password fields - Responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-4">
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
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={14} className="sm:w-4 -mt-3 sm:h-4" /> : <Eye size={14} className="sm:w-4 -mt-3 sm:h-4" />}
                    </button>
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={14} className="sm:w-4 -mt-3 sm:h-4" /> : <Eye size={14} className="sm:w-4 -mt-3 sm:h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#FD561E] text-white py-2.5 sm:py-3.5 rounded-xl font-bold hover:bg-[#e64d19] transition shadow-lg mt-2 text-sm sm:text-base"
                >
                  Sign Up
                </button>
              </form>

              <p className="text-center text-xs sm:text-sm mt-4 sm:mt-6">
                Already Registered?{" "}
                <span onClick={openSignin} className="text-[#FD561E] font-bold cursor-pointer hover:underline">
                  Sign in
                </span>
              </p>

              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-100 text-center">
                <p className="text-[10px] sm:text-xs text-gray-400">No longer wish to use BOBROS Account?</p>
                <p 
                  onClick={() => setShowDeletion(true)} 
                  className="text-xs sm:text-sm text-[#FD561E] cursor-pointer font-bold mt-1 hover:underline"
                >
                  Request for Deletion
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;