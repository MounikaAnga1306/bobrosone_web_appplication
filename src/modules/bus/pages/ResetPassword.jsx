import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Phone, Lock, X, Eye, EyeOff, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";

// ─── Custom Alert Popup ───────────────────────────────────────────────────────
const AlertPopup = ({ icon, title, text, onClose }) => {
  const configs = {
    success: { bg: "bg-green-100",  ring: "ring-green-400",  Icon: CheckCircle,   iconCls: "text-green-500"  },
    error:   { bg: "bg-red-100",    ring: "ring-red-400",    Icon: AlertCircle,   iconCls: "text-red-500"    },
    warning: { bg: "bg-orange-100", ring: "ring-orange-400", Icon: AlertTriangle, iconCls: "text-orange-500" },
  };
  const { bg, ring, Icon, iconCls } = configs[icon] || configs.error;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[290px] p-6 text-center"
        onClick={(e) => e.stopPropagation()}>
        <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center mx-auto mb-3 ring-2 ${ring}`}>
          <Icon className={`w-7 h-7 ${iconCls}`} strokeWidth={2} />
        </div>
        <h3 className="text-[15px] font-bold text-gray-800 mb-1.5">{title}</h3>
        <p className="text-[12.5px] text-gray-500 leading-snug mb-5">{text}</p>
        <button
          onClick={onClose}
          className="bg-[#FD561E] text-white text-[13px] font-semibold px-7 py-2 rounded-xl hover:bg-[#e64d19] cursor-pointer transition-all"
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
};

// ─── useAlert hook ────────────────────────────────────────────────────────────
const useAlert = () => {
  const [alert, setAlert] = useState(null);
  const fire = ({ icon, title, text }) =>
    new Promise((resolve) => {
      setAlert({ icon, title, text, onClose: () => { setAlert(null); resolve(); } });
    });
  const node = alert ? <AlertPopup {...alert} /> : null;
  return { fire, node };
};

// ─── Extract error message ────────────────────────────────────────────────────
const extractErrorMessage = (err) => {
  const data = err.response?.data;
  const raw =
    data?.msg || data?.message || data?.error || data?.detail ||
    (typeof data === "string" ? data : "") || err.message || "";

  if (!raw) return "Something went wrong. Please try again.";
  const lower = raw.toLowerCase();

  if (lower.includes("expired"))
    return "Your OTP has expired. Please resend and try again.";
  if (lower.includes("invalid otp") || lower.includes("incorrect otp") || lower.includes("wrong otp"))
    return "The OTP you entered is incorrect. Please check and try again.";
  if (lower.includes("last three") || lower.includes("last 3") || lower.includes("reuse") || lower.includes("already used"))
    return "You cannot reuse your last 3 passwords. Please choose a different password.";
  if (lower.includes("not found") || lower.includes("no user") || lower.includes("no account"))
    return "No account found with this mobile number.";
  if (lower.includes("invalid") || lower.includes("incorrect"))
    return "The OTP you entered is incorrect. Please try again.";

  return raw;
};

// ─── Input field ──────────────────────────────────────────────────────────────
const InputField = ({ icon: Icon, ...props }) => (
  <div className="flex items-center border border-gray-400 rounded-lg px-3 py-2 mb-4
    focus-within:border-[#FD561E]
    focus-within:shadow-[0_0_6px_rgba(253,86,30,0.25)]
    transition-all duration-200">
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-black mr-2 flex-shrink-0" />
    <input {...props} className="w-full outline-none text-sm sm:text-base" />
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ResetPassword = ({ resetData, closeModal, openSignin }) => {
  const state = resetData;

  const [otp,                 setOtp]                 = useState("");
  const [newPassword,         setNewPassword]         = useState("");
  const [confirmPassword,     setConfirmPassword]     = useState("");
  const [showNewPassword,     setShowNewPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Resend OTP state ──────────────────────────────────────────────────────
  const [resendTimer,  setResendTimer]  = useState(30); // component mount అవగానే timer start
  const [resending,    setResending]    = useState(false);
  const timerRef = useRef(null);

  const { fire, node: alertNode } = useAlert();

  // ── Auto-start timer when component mounts ────────────────────────────────
  useEffect(() => {
    startResendTimer(30);
    return () => clearInterval(timerRef.current);
  }, []);

  const startResendTimer = (seconds = 30) => {
    setResendTimer(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Resend OTP API call ───────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;

    try {
      setResending(true);
      await axios.post("https://api.bobros.co.in/forgotpassword/changerequest", {
        email:  state.email,
        mobile: state.mobile,
      });

      startResendTimer(30);

      await fire({
        icon:  "success",
        title: "OTP Resent!",
        text:  "A new OTP has been sent to your registered mobile number.",
      });
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        err.response?.data?.error || "";

      await fire({
        icon:  "error",
        title: "Resend Failed",
        text:  msg || "Unable to resend OTP. Please try again.",
      });
    } finally {
      setResending(false);
    }
  };

  // ── Reset Password submit ─────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (otp.length !== 4) {
      await fire({ icon: "warning", title: "Invalid OTP", text: "OTP must be 4 digits." });
      return;
    }
    if (newPassword !== confirmPassword) {
      await fire({ icon: "warning", title: "Oops!!", text: "New Password and Confirm Password do not match." });
      return;
    }

    try {
      await axios.post("https://api.bobros.co.in/forgotpassword/changepassword", {
        mobile:          state.mobile,
        otp:             otp,
        newPassword:     newPassword,
        confirmPassword: confirmPassword,
      });

      await fire({ icon: "success", title: "Success!", text: "Your password has been reset successfully." });
      openSignin();
    } catch (err) {
      await fire({ icon: "error", title: "Reset Password Failed", text: extractErrorMessage(err) });
    }
  };

  return (
    <>
      {alertNode}
      <div className="flex items-center justify-center min-h-screen px-4 py-6 sm:px-6 md:px-8">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[420px] mx-auto p-5 sm:p-6 md:p-8">

          {/* Close */}
          <button onClick={closeModal}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-black cursor-pointer z-10">
            <X size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>

          {/* Header */}
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800">Reset Password</h2>
          <p className="text-center text-[#fd561e] text-base sm:text-lg mt-2">Secure your BOBROS Account</p>
          <p className="text-center text-gray-500 text-xs sm:text-sm mt-2 mb-4 sm:mb-6">
            Enter the OTP sent to your mobile and create a new password
          </p>

          <form onSubmit={handleResetPassword}>

            {/* MOBILE — read only */}
            <InputField icon={Phone} type="text" value={state.mobile} readOnly />

            {/* OTP */}
            <InputField
              icon={Lock}
              type="text"
              inputMode="numeric"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              required
            />

            {/* ── Resend OTP row — OTP field కింద ── */}
            <div className="flex items-center justify-end -mt-2 mb-4 text-xs sm:text-sm">
              {resendTimer > 0 ? (
                <span className="text-gray-400">
                  Resend OTP in{" "}
                  <span className="text-[#FD561E] font-semibold">{resendTimer}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-[#FD561E] font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {resending ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </div>

            {/* NEW PASSWORD */}
            <div className="relative mb-4">
              <div className="flex items-center border border-gray-400 rounded-lg px-3 py-2
                focus-within:border-[#FD561E] focus-within:shadow-[0_0_6px_rgba(253,86,30,0.25)] transition-all duration-200">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-black mr-2 flex-shrink-0" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full outline-none text-sm sm:text-base pr-7"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                  className="flex-shrink-0 text-black cursor-pointer focus:outline-none ml-1">
                  {showNewPassword
                    ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" />
                    : <Eye    size={16} className="sm:w-[18px] sm:h-[18px]" />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative mb-4">
              <div className="flex items-center border border-gray-400 rounded-lg px-3 py-2
                focus-within:border-[#FD561E] focus-within:shadow-[0_0_6px_rgba(253,86,30,0.25)] transition-all duration-200">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-black mr-2 flex-shrink-0" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full outline-none text-sm sm:text-base pr-7"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="flex-shrink-0 text-black cursor-pointer focus:outline-none ml-1">
                  {showConfirmPassword
                    ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" />
                    : <Eye    size={16} className="sm:w-[18px] sm:h-[18px]" />}
                </button>
              </div>
            </div>

            <button type="submit"
              className="w-full bg-[#FD561E] text-white cursor-pointer py-2.5 sm:py-2 rounded-lg font-semibold hover:bg-[#e64d19] transition text-sm sm:text-base">
              Reset Password
            </button>
          </form>

        </div>
      </div>
    </>
  );
};

export default ResetPassword;