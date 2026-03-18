import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { User, Mail, Phone, Lock, Eye, EyeOff, X, Trash2, ArrowLeft } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Account Deletion Card — shown instead of signup when user
// clicks "Request for Deletion"
// Steps: 1 → enter email + mobile → send OTP
//        2 → enter OTP → verify → success popup
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

  // Timer countdown on step 2
  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  // ── Step 1: Send OTP ─────────────────────────────────────────
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

  // ── Resend OTP ───────────────────────────────────────────────
  const handleResend = async () => {
    try {
      setLoading(true);
      setMessage("");
      await axios.post(`${API}/deleteaccount`, {
        mobile: form.mobile,
        email: form.email,
      });
      setTimer(30);
      setOtp("");
    } catch (err) {
      setMessage("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────
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
      setMessage(err.response?.data?.error || "OTP verification failed. Please try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = form.email
    ? form.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "";

  // ── Success Popup ────────────────────────────────────────────
  if (showSuccess) {
    return (
      <div className="flex flex-col items-center text-center px-2 py-4 gap-5">
        {/* Check icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
            animation: "scalePop 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both",
          }}
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Message card */}
        <div
          className="w-full rounded-2xl border border-gray-100 px-5 py-5 text-left space-y-2"
          style={{ background: "#fafafa" }}
        >
          <p className="text-sm font-bold text-gray-800">BOBROS Account Deletion</p>
          <p className="text-sm text-gray-600 leading-relaxed">Dear customer,</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your request for <span className="font-semibold text-gray-800">BOBROS account deletion</span> has been successfully submitted.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Our team will review your request and process it shortly.
          </p>
          <p className="text-sm text-red-500 leading-relaxed">
            If you did not initiate this request, please contact customer support immediately.
          </p>
          <p className="text-sm text-gray-500 pt-1">
            Thanks & Regards,<br />
            <span className="font-semibold text-gray-700">Team BOBROS</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full text-white font-bold py-3 rounded-xl text-sm transition-all"
          style={{ background: "linear-gradient(135deg, #F05A28, #fb923c)", boxShadow: "0 6px 18px rgba(240,90,40,0.3)" }}
        >
          ✓ OK
        </button>

        <style>{`
          @keyframes scalePop {
            0%   { transform: scale(0); opacity: 0; }
            70%  { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all flex-shrink-0"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h3 className="text-base font-bold text-gray-900">Request Account Deletion</h3>
          <p className="text-xs text-gray-400">
            {step === 1 ? "Enter your registered mobile & email" : "Enter the OTP sent to your mobile"}
          </p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
        <span className="text-red-500 mt-0.5 flex-shrink-0">⚠️</span>
        <p className="text-xs text-red-600 leading-relaxed">
          This action is <strong>permanent</strong>. Your account and all associated data will be deleted and cannot be restored.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-5">
        <div className="flex items-center gap-1.5">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: step >= 1 ? "linear-gradient(135deg, #f43f5e, #fb923c)" : "#e5e7eb" }}
          >
            {step > 1 ? "✓" : "1"}
          </div>
          <span className={`text-xs font-semibold ${step === 1 ? "text-orange-500" : "text-gray-400"}`}>
            Verify
          </span>
        </div>
        <div className="flex-1 mx-2 h-0.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: step > 1 ? "100%" : "0%",
              background: "linear-gradient(90deg, #f43f5e, #fb923c)",
            }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "text-white" : "bg-gray-100 text-gray-400"}`}
            style={step === 2 ? { background: "linear-gradient(135deg, #f43f5e, #fb923c)" } : {}}
          >
            2
          </div>
          <span className={`text-xs font-semibold ${step === 2 ? "text-orange-500" : "text-gray-400"}`}>
            Confirm
          </span>
        </div>
      </div>

      {/* Error */}
      {message && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-xl mb-4 text-xs">
          <span>⚠️</span><span>{message}</span>
        </div>
      )}

      {/* ── Step 1 ── */}
      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Mobile Number</label>
            <div
              className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:bg-white transition-all"
              onFocusCapture={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(251,146,60,0.2)"; e.currentTarget.style.borderColor = "#fb923c"; }}
              onBlurCapture={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
            >
              <span className="flex items-center px-3 text-gray-500 text-sm font-semibold border-r border-gray-200 bg-gray-100">+91</span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-gray-50 focus:bg-white transition-all"
              onFocus={(e) => { e.target.style.boxShadow = "0 0 0 3px rgba(251,146,60,0.2)"; e.target.style.borderColor = "#fb923c"; }}
              onBlur={(e) => { e.target.style.boxShadow = "none"; e.target.style.borderColor = "#e5e7eb"; }}
            />
          </div>

          <button
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full text-white font-bold py-3.5 rounded-xl transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
            style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)", boxShadow: "0 6px 18px rgba(244,63,94,0.28)" }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Sending OTP…
              </>
            ) : "Send OTP →"}
          </button>
        </div>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs space-y-1.5 border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-400">Mobile</span>
              <span className="font-semibold text-gray-700">+91 XXXXXX{form.mobile.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="font-semibold text-gray-700">{maskedEmail}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Enter OTP
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={4}
              value={otp}
              placeholder="• • • •"
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-center text-3xl font-bold tracking-[1em] focus:outline-none bg-gray-50 focus:bg-white transition-all"
              onFocus={(e) => { e.target.style.boxShadow = "0 0 0 3px rgba(251,146,60,0.2)"; e.target.style.borderColor = "#fb923c"; }}
              onBlur={(e) => { e.target.style.boxShadow = "none"; e.target.style.borderColor = "#e5e7eb"; }}
            />
          </div>

          <div className="text-center text-xs">
            {timer > 0 ? (
              <span className="text-gray-400">
                Resend in <span className="font-bold text-red-500">{timer}s</span>
              </span>
            ) : (
              <span className="text-gray-500">
                Didn't receive?{" "}
                <button onClick={handleResend} disabled={loading} className="font-bold text-orange-500 hover:underline">
                  Resend OTP
                </button>
              </span>
            )}
          </div>

          <button
            onClick={handleVerifyOTP}
            disabled={loading}
            className="w-full text-white font-bold py-3.5 rounded-xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)", boxShadow: "0 6px 18px rgba(244,63,94,0.28)" }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Verifying…
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Confirm Deletion
              </>
            )}
          </button>

          <button
            onClick={() => { setStep(1); setMessage(""); setOtp(""); }}
            className="w-full text-gray-400 hover:text-gray-600 text-xs py-1 transition-all"
          >
            ← Change details
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main SignupForm — unchanged logic, only "Request for Deletion"
// now swaps the card view to AccountDeletionCard
// ─────────────────────────────────────────────────────────────
const SignupForm = ({ closeModal, openSignin, openVerifyOtp }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showDeletion, setShowDeletion] = useState(false); // ← toggle deletion view

  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    user: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (location.state) {
      setFormData((prev) => ({
        ...prev,
        user: location.state.name || "",
        email: location.state.email || "",
      }));
    }
  }, [location.state]);

  const validateEmail    = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pw) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(pw);

  const [emailError, setEmailError]                   = useState("");
  const [passwordError, setPasswordError]             = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError]                             = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setEmailError(validateEmail(value) ? "" : "Please enter a valid email address (example@gmail.com)");
    }
    if (name === "password") {
      setPasswordError(
        validatePassword(value)
          ? ""
          : "Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character (! @ # $ % ^ & *)."
      );
    }
    if (name === "confirmPassword") {
      setConfirmPasswordError(value !== formData.password ? "Passwords do not match" : "");
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
      if (err.response?.status === 409) {
        setError("Email or Mobile already registered");
      } else if (err.response) {
        setError("Signup failed. Please try again later.");
      } else {
        setError("Network error. Please check your connection.");
      }
    }
  };

  const InputField = ({ icon: Icon, ...props }) => (
    <div className="flex items-center border border-gray-400 rounded-lg px-3 py-2 mb-4 focus-within:border-[#FD561E] focus-within:shadow-[0_0_6px_rgba(253,86,30,0.35)] transition-all duration-200">
      <Icon className="w-5 h-5 text-black mr-2" />
      <input {...props} className="w-full outline-none" />
    </div>
  );

  // ── Render deletion card if requested ────────────────────────
  if (showDeletion) {
    return (
      <div className="flex items-center justify-center">
        <div className="relative bg-white p-8 rounded-2xl shadow-xl w-[420px]">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
          >
            <X size={22} />
          </button>
          <AccountDeletionCard
            onBack={() => setShowDeletion(false)}
            onClose={closeModal}
          />
        </div>
      </div>
    );
  }

  // ── Normal signup form ────────────────────────────────────────
  return (
    <div className="flex items-center justify-center">
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

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSignup}>
          <InputField icon={User} type="text" name="user" placeholder="Username" value={formData.user} onChange={handleChange} required />

          <InputField icon={Mail} type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} disabled={location.state?.email} required />
          {emailError && <p className="text-red-500 text-xs -mt-3 mb-3">{emailError}</p>}

          <InputField icon={Phone} type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required />

          <div className="relative">
            <InputField icon={Lock} type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-black">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <p className="text-xs text-gray-500 -mt-2 mb-2">
              Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character (! @ # $ % ^ & *).
            </p>
            {passwordError && <p className="text-red-500 text-xs mb-2">{passwordError}</p>}
          </div>

          <div className="relative">
            <InputField icon={Lock} type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-black">
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {confirmPasswordError && <p className="text-red-500 text-xs -mt-2 mb-2">{confirmPasswordError}</p>}
          </div>

          <button type="submit" className="w-full bg-[#FD561E] text-white py-2 rounded-lg font-semibold cursor-pointer hover:bg-[#e64d19] transition">
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already Registered?{" "}
          <span onClick={openSignin} className="text-[#FD561E] font-semibold cursor-pointer hover:underline">
            Sign in
          </span>
        </p>

        <p className="text-center text-xs mt-6 text-gray-500">
          No longer wish to use BOBROS Account?
        </p>

        {/* ✅ Clicking this opens deletion card */}
        <p
          onClick={() => setShowDeletion(true)}
          className="text-center text-sm text-[#FD561E] cursor-pointer hover:underline mt-1"
        >
          Request for Deletion
        </p>
      </div>
    </div>
  );
};

export default SignupForm;