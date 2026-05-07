import React, { useState } from "react";
import axios from "axios";
import { Mail, Phone, X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";

// ─── Custom Alert Popup — no Swal, no icon bugs ───────────────────────────────
const AlertPopup = ({ icon, title, text, onClose }) => {
  const cfg = {
    success: { bg: "bg-green-100",  ring: "ring-green-400",  Icon: CheckCircle,    iconCls: "text-green-500"  },
    error:   { bg: "bg-red-100",    ring: "ring-red-400",    Icon: AlertCircle,    iconCls: "text-red-500"    },
    warning: { bg: "bg-orange-100", ring: "ring-orange-400", Icon: AlertTriangle,  iconCls: "text-orange-500" },
  }[icon] || cfg.error;

  const { bg, ring, Icon, iconCls } = cfg;

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
const ForgotPassword = ({ closeModal, openSignin, openResetPassword }) => {
  const [email,   setEmail]   = useState("");
  const [mobile,  setMobile]  = useState("");
  const [loading, setLoading] = useState(false);
  const { fire, node: alertNode } = useAlert();

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      await fire({ icon: "warning", title: "Invalid Mobile", text: "Please enter a valid 10-digit mobile number." });
      return;
    }

    try {
      setLoading(true);
      await axios.post("https://api.bobros.co.in/forgotpassword/changerequest", {
        email,
        mobile,
      });

      await fire({
        icon:  "success",
        title: "OTP Sent!",
        text:  "OTP has been sent to your registered mobile number.",
      });

      openResetPassword({ email, mobile });
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        "";

      await fire({
        icon:  "error",
        title: "Oops!!",
        text:  msg || "Unable to send the OTP. Please make sure your Mobile Number and Email are correct.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {alertNode}
      <div className="flex items-center justify-center min-h-screen px-4 py-6 sm:px-6 md:px-8">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[420px] mx-auto p-5 sm:p-6 md:p-8">

          {/* Close */}
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-black cursor-pointer z-10"
          >
            <X size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>

          {/* Header */}
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
            Forgot Password
          </h2>
          <p className="text-center text-[#fd561e] text-base sm:text-lg mt-2">
            Retrieve your login Credentials
          </p>
          <p className="text-center text-gray-500 text-xs sm:text-sm mt-2 mb-4 sm:mb-6">
            Please enter your registered Email and Mobile number
          </p>

          <form onSubmit={handleSendOtp}>
            {/* EMAIL */}
            <InputField
              icon={Mail}
              type="email"
              placeholder="Enter Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* MOBILE */}
            <InputField
              icon={Phone}
              type="tel"
              inputMode="numeric"
              placeholder="Enter Mobile Number"
              value={mobile}
              maxLength={10}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
            />

            {/* SEND OTP */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FD561E] text-white py-2.5 sm:py-2 rounded-lg font-semibold hover:bg-[#e64d19] transition text-sm sm:text-base disabled:opacity-60"
              style={{ cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          {/* Back to login */}
          <p className="text-center text-xs sm:text-sm mt-5 sm:mt-6">
            Remember your password?{" "}
            <span
              onClick={openSignin}
              className="text-[#FD561E] font-semibold cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;