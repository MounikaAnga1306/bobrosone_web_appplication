import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { User, Mail, Phone, Lock, Eye, EyeOff, X, ArrowLeft } from "lucide-react";
import { createPortal } from "react-dom";
import { Turnstile } from "@marsidev/react-turnstile";

const API = "https://api.bobros.co.in";

// ─────────────────────────────────────────────────────────────
// SUCCESS TOAST (progress bar now fills left → right)
// ─────────────────────────────────────────────────────────────
const SuccessToast = ({ message, subtitle, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "32px 40px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          minWidth: "280px",
          maxWidth: "340px",
          animation: "toastPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
            animation: "checkBounce 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 700, fontSize: "18px", color: "#111827", margin: 0 }}>{message}</p>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "6px 0 0 0" }}>{subtitle}</p>
        </div>
        <div
          style={{
            width: "100%",
            height: "3px",
            background: "#f3f4f6",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "0%",
              background: "linear-gradient(90deg, #FD561E, #ff8a5b)",
              borderRadius: "999px",
              animation: "expand 2.8s linear forwards",
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes toastPop { 0%{opacity:0;transform:scale(0.6) translateY(30px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes checkBounce { 0%{transform:scale(0);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes expand { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>,
    document.body
  );
};

// ─────────────────────────────────────────────────────────────
// LEFT PANEL (unchanged)
// ─────────────────────────────────────────────────────────────
const LeftImagePanel = () => (
  <div
    className="hidden md:flex flex-col items-center justify-center rounded-l-2xl overflow-hidden flex-shrink-0"
    style={{ alignSelf: "stretch", width: "380px", backgroundColor: "#fff8f5" }}
  >
    <img
      src="/assets/travel_image.png"
      alt="Tour & Travel"
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────
// 4-BOX OTP INPUT (unchanged)
// ─────────────────────────────────────────────────────────────
const OtpBoxes = ({ value, onChange }) => {
  const inputs = useRef([]);
  const digits = (value + "    ").slice(0, 4).split("");

  const handleKey = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      const next = (value.slice(0, idx) + value.slice(idx + 1)).slice(0, 4);
      onChange(next);
      if (idx > 0) inputs.current[idx - 1]?.focus();
      return;
    }
    const chars = val.slice(0, 4 - idx);
    const next = (value.slice(0, idx) + chars + value.slice(idx + chars.length)).slice(0, 4);
    onChange(next);
    const focusIdx = Math.min(idx + chars.length, 3);
    inputs.current[focusIdx]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, 3)]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center mb-4">
      {[0, 1, 2, 3].map((idx) => (
        <input
          key={idx}
          ref={(el) => (inputs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx]?.trim() || ""}
          onChange={(e) => handleKey(e, idx)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all"
          style={{
            borderColor: digits[idx]?.trim() ? "#FD561E" : "#d1d5db",
            background: digits[idx]?.trim() ? "#fff5f2" : "#f9fafb",
            cursor: "text",
          }}
        />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// OTP VERIFY CARD (unchanged logic, uses /signup/register)
// ─────────────────────────────────────────────────────────────
const OtpVerifyCard = ({ formData, onVerified, onBack, onResendOtp }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const displayMobile = formData.mobile
    ? `+91 ${formData.mobile.slice(0, 5)} ${formData.mobile.slice(5)}`
    : "";

  const handleVerify = async () => {
    if (otp.trim().length < 4) {
      setMessage("Please enter all 4 digits.");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      await axios.post(`${API}/signup/register`, {
        user: formData.user,
        email: formData.email,
        mobile: Number(formData.mobile),
        password: formData.password,
        otp: otp.trim(),
      });
      onVerified();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "";
      setIsSuccess(false);
      setMessage(msg || "OTP verification failed. Please try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsSuccess(false);
      setMessage("");
      setOtp("");
      await onResendOtp();
      setTimer(30);
      setIsSuccess(true);
      setMessage("OTP resent to your mobile.");
      setTimeout(() => {
        setIsSuccess(false);
        setMessage("");
      }, 3000);
    } catch {
      setIsSuccess(false);
      setMessage("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full justify-center">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm transition-colors w-fit"
        style={{ cursor: "pointer" }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-1">
        Verify your <span className="text-[#fd561e]">Mobile</span>
      </h2>

      <p className="text-center text-gray-500 text-xs sm:text-sm mb-6">
        OTP sent to <span className="font-bold text-gray-800">{displayMobile}</span>
      </p>

      {message && (
        <p
          className={`text-xs mb-4 text-center p-2 rounded-lg ${
            isSuccess ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"
          }`}
        >
          {message}
        </p>
      )}

      <OtpBoxes value={otp} onChange={setOtp} />

      <p className="text-center text-xs text-gray-500 mb-5">
        {timer > 0 ? (
          `Resend OTP in ${timer}s`
        ) : (
          <span
            onClick={handleResend}
            className="text-[#FD561E] font-bold hover:underline"
            style={{ cursor: "pointer" }}
          >
            Resend OTP
          </span>
        )}
      </p>

      <button
        onClick={handleVerify}
        disabled={loading || otp.trim().length < 4}
        className="w-full bg-[#FD561E] text-white py-3 rounded-xl font-bold hover:bg-[#e64d19] transition shadow-lg disabled:opacity-50 text-sm sm:text-base"
        style={{ cursor: loading || otp.trim().length < 4 ? "not-allowed" : "pointer" }}
      >
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Account Deletion Card (unchanged)
// ─────────────────────────────────────────────────────────────
const AccountDeletionCard = ({ onBack, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ mobile: "", email: "" });

  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  const handleSendOTP = async () => {
    if (!form.mobile || !form.email) { setMessage("Please fill all fields."); return; }
    if (form.mobile.length !== 10) { setMessage("Mobile number must be exactly 10 digits."); return; }
    try {
      setLoading(true); setMessage("");
      await axios.post(`${API}/deleteaccount`, { mobile: form.mobile, email: form.email });
      setStep(2); setTimer(30); setOtp("");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.replace(/\D/g, "").trim();
    if (otpValue.length < 4) { setMessage("Please enter the complete OTP."); return; }
    try {
      setLoading(true); setMessage("");
      await axios.post(`${API}/deleteaccount`, { mobile: form.mobile, email: form.email, otp: otpValue });
      setShowSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.error || "OTP verification failed.");
      setOtp("");
    } finally { setLoading(false); }
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
        <button onClick={onClose} style={{ cursor: "pointer" }}
          className="w-full bg-[#F05A28] text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all shadow-md text-sm sm:text-base">
          ✓ OK
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <button onClick={onBack} style={{ cursor: "pointer" }}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={14} />
        </button>
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Request Account Deletion</h3>
      </div>
      {message && <p className="text-red-500 text-xs mb-3 sm:mb-4 bg-red-50 p-2 rounded-lg text-center">{message}</p>}
      {step === 1 ? (
        <div className="space-y-3 sm:space-y-4">
          <input type="tel" placeholder="Mobile Number (10 digits)" value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:border-orange-500 transition-all"
            style={{ cursor: "text" }}
          />
          <input type="email" placeholder="Email Address" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:border-orange-500 transition-all"
            style={{ cursor: "text" }}
          />
          <button onClick={handleSendOTP} disabled={loading} style={{ cursor: loading ? "not-allowed" : "pointer" }}
            className="w-full bg-[#fd561e] text-white font-bold py-2.5 sm:py-3.5 rounded-xl shadow-lg disabled:opacity-50 text-sm sm:text-base transition-all">
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-gray-50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs border border-gray-100">
            <div className="flex justify-between mb-1"><span>Mobile:</span><span className="font-bold">XXXXXX{form.mobile.slice(-4)}</span></div>
            <div className="flex justify-between"><span>Email:</span><span className="font-bold">{maskedEmail}</span></div>
          </div>
          <OtpBoxes value={otp} onChange={setOtp} />
          <p className="text-center text-xs text-gray-500">
            {timer > 0 ? `Resend OTP in ${timer}s` :
              <span onClick={() => { setStep(1); setTimer(30); }} className="text-[#FD561E] font-bold" style={{ cursor: "pointer" }}>Resend OTP</span>
            }
          </p>
          <button onClick={handleVerifyOTP} disabled={loading} style={{ cursor: loading ? "not-allowed" : "pointer" }}
            className="w-full bg-red-600 text-white font-bold py-2.5 sm:py-3.5 rounded-xl shadow-lg text-sm sm:text-base transition-all disabled:opacity-50">
            Confirm Deletion
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// InputField (unchanged)
// ─────────────────────────────────────────────────────────────
const InputField = ({ icon: Icon, ...props }) => (
  <div className="flex items-center border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 mb-3 sm:mb-4 focus-within:border-[#FD561E] focus-within:ring-1 focus-within:ring-[#FD561E] transition-all">
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0" />
    <input {...props} className="w-full outline-none text-xs sm:text-sm bg-transparent" style={{ cursor: "text" }} />
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN SIGNUP FORM (unchanged except the toast animation)
// ─────────────────────────────────────────────────────────────
const SignUpForm = ({ closeModal, openSignin }) => {
  const location = useLocation();
  const [view, setView] = useState("signup");
  const [showDeletion, setShowDeletion] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    user: "", email: "", mobile: "", password: "", confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const turnstileRef = useRef(null);

  useEffect(() => {
    if (location.state) {
      setFormData((prev) => ({
        ...prev,
        user: location.state.name || "",
        email: location.state.email || "",
      }));
    }
  }, [location.state]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const mobileDigits = formData.mobile.replace(/\D/g, "");
    if (mobileDigits.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!captchaToken) {
      setError("Please complete the captcha verification.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API}/signup/form`, {
        user: formData.user,
        email: formData.email,
        mobile: Number(mobileDigits),
        password: formData.password,
        captchaToken,
      });
      setView("otp");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "";
      const status = err.response?.status;
      const isDuplicate = status === 409 ||
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("exists") ||
        msg.toLowerCase().includes("registered") ||
        msg.toLowerCase().includes("duplicate") ||
        msg.toLowerCase().includes("used");

      if (isDuplicate) {
        setError("An account with this email or mobile already exists. Please sign in.");
      } else if (msg.toLowerCase().includes("captcha") || msg.toLowerCase().includes("turnstile")) {
        setError("Captcha verification failed. Please try again.");
        if (turnstileRef.current) turnstileRef.current.reset();
        setCaptchaToken("");
      } else {
        setError(msg || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const mobileDigits = formData.mobile.replace(/\D/g, "");
    await axios.post(`${API}/signup/form`, {
      user: formData.user,
      email: formData.email,
      mobile: Number(mobileDigits),
      password: formData.password,
    });
  };

  const handleOtpVerified = () => setShowSuccessToast(true);

  return (
    <>
      {showSuccessToast && (
        <SuccessToast
          message="Successfully Registered!"
          subtitle="Welcome to BOBROS! Please sign in."
          onDone={() => {
            setShowSuccessToast(false);
            openSignin();
          }}
        />
      )}

      <div className="flex items-center justify-center p-3 sm:p-4 min-h-screen md:min-h-0">
        <div
          className="relative bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch overflow-hidden w-full max-w-[95%] sm:max-w-[500px] md:max-w-[900px] mx-auto"
          style={{ maxHeight: "90vh" }}
        >
          <LeftImagePanel />

          <div
            className="flex-1 p-5 sm:p-6 md:p-8 lg:p-10 overflow-y-auto bg-white"
            style={{ maxHeight: "90vh" }}
          >
            <button
              onClick={closeModal}
              style={{ cursor: "pointer" }}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 text-gray-400 hover:text-black z-10 bg-white rounded-full p-1"
            >
              <X size={18} className="sm:w-5 -mt-2 -mr-1 sm:h-5 md:w-6 md:h-6" />
            </button>

            {showDeletion ? (
              <AccountDeletionCard onBack={() => setShowDeletion(false)} onClose={closeModal} />
            ) : view === "otp" ? (
              <OtpVerifyCard
                formData={formData}
                onVerified={handleOtpVerified}
                onBack={() => {
                  setView("signup");
                  setError("");
                }}
                onResendOtp={handleResendOtp}
              />
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
                    placeholder="Mobile Number (10 digits)"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })
                    }
                    required
                  />

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
                        style={{ cursor: "pointer" }}
                        className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff size={14} className="sm:w-4 -mt-3 sm:h-4" />
                        ) : (
                          <Eye size={14} className="sm:w-4 -mt-3 sm:h-4" />
                        )}
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
                        style={{ cursor: "pointer" }}
                        className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={14} className="sm:w-4 -mt-3 sm:h-4" />
                        ) : (
                          <Eye size={14} className="sm:w-4 -mt-3 sm:h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Cloudflare Turnstile Captcha */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Verification
                    </label>
                    <div className="flex justify-center my-4 overflow-x-auto">
                      <div className="transform scale-90 sm:scale-100 origin-center">
                        <Turnstile
                          ref={turnstileRef}
                          siteKey="0x4AAAAAABvRHvXzt4EuTFLs"
                          onSuccess={(token) => setCaptchaToken(token)}
                          options={{
                            theme: "light",
                            size: "flexible",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ cursor: loading ? "not-allowed" : "pointer" }}
                    className="w-full bg-[#FD561E] text-white py-2.5 sm:py-3.5 rounded-xl font-bold hover:bg-[#e64d19] transition shadow-lg mt-2 text-sm sm:text-base disabled:opacity-60"
                  >
                    {loading ? "Please wait..." : "Sign Up"}
                  </button>
                </form>

                <p className="text-center text-xs sm:text-sm mt-4 sm:mt-6">
                  Already Registered?{" "}
                  <span
                    onClick={openSignin}
                    style={{ cursor: "pointer" }}
                    className="text-[#FD561E] font-bold hover:underline"
                  >
                    Sign in
                  </span>
                </p>

                <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-100 text-center">
                  <p className="text-[10px] sm:text-xs text-gray-400">No longer wish to use BOBROS Account?</p>
                  <p
                    onClick={() => setShowDeletion(true)}
                    style={{ cursor: "pointer" }}
                    className="text-xs sm:text-sm text-[#FD561E] font-bold mt-1 hover:underline"
                  >
                    Request for Deletion
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpForm;