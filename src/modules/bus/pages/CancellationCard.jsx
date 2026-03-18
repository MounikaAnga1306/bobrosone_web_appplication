import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CancellationCard = ({ onClose }) => {
  const API = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const overlayRef = useRef(null);

  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [timer, setTimer]         = useState(30);
  const [message, setMessage]     = useState("");
  const [otp, setOtp]             = useState("");
  const [showSuccess, setShowSuccess] = useState(false); // ✅ success popup state
  const [pendingNav, setPendingNav]   = useState(null);  // holds navigate data

  const [form, setForm] = useState({ ticket: "", mobile: "", email: "" });

  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  // ── Auto-navigate after success popup ────────────────────────
  useEffect(() => {
    if (!showSuccess || !pendingNav) return;
    const id = setTimeout(() => {
      navigate("/cancel-ticket", pendingNav);
      onClose();
    }, 2000); // 2 seconds popup then navigate
    return () => clearTimeout(id);
  }, [showSuccess, pendingNav]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleVerify = async () => {
    if (!form.ticket || !form.mobile || !form.email) {
      setMessage("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      await axios.post(`${API}/cancel/verify`, {
        ticket: form.ticket,
        mobile: form.mobile,
        email: form.email,
      });
      setStep(2);
      setTimer(30);
      setOtp("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      setMessage("");
      await axios.post(`${API}/cancel/verify`, {
        ticket: form.ticket,
        mobile: form.mobile,
        email: form.email,
      });
      setTimer(30);
      setOtp("");
    } catch (err) {
      setMessage("Failed to resend OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    const otpValue = otp.replace(/\D/g, "").trim();
    if (otpValue.length < 4) {
      setMessage("Please enter the complete 4-digit OTP");
      return;
    }
    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(`${API}/cancel/data`, {
        mobile: form.mobile,
        ticketId: form.ticket,
        otp: otpValue,
      });

      console.log("Cancel Data Full Response:", JSON.stringify(res.data, null, 2));

      // Store nav data and show success popup
      setPendingNav({
        state: {
          ticket: form.ticket,
          mobile: form.mobile,
          email: form.email,
          fullResponse: res.data,
        },
      });
      setShowSuccess(true); // ✅ show popup

    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid OTP. Please try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const maskedMobile = form.mobile ? `+91 XXXXXX${form.mobile.slice(-4)}` : "";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleOverlayClick}
    >

      {/* ══════════════ SUCCESS POPUP ══════════════ */}
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center z-60">
          <div
            className="bg-white rounded-3xl shadow-2xl px-10 py-10 flex flex-col items-center gap-4 mx-4"
            style={{
              animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
              maxWidth: "320px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated check circle */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                animation: "scalePop 0.5s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: "drawCheck 0.4s 0.4s ease both" }}
                />
              </svg>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-1">OTP Verified!</h3>
              <p className="text-sm text-gray-400">Taking you to cancellation page…</p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #22c55e, #16a34a)",
                  animation: "progressBar 2s linear both",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MAIN CARD ══════════════ */}
      <div
        className={`relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          showSuccess ? "opacity-30 scale-95 pointer-events-none" : "opacity-100 scale-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl leading-none z-10"
        >
          ✕
        </button>

        <div className="px-7 pt-8 pb-7">

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                <path d="M20 12c0-1.1.9-2 2-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4c-1.1 0-2-.9-2-2z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Cancel Ticket</h2>
          <p className="text-sm text-center text-gray-400 mb-6">
            {step === 1 ? "Enter your details to find your booking" : "We sent an OTP to your mobile & email"}
          </p>

          {/* Step indicator */}
          <div className="flex items-center mb-6">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <span className={`text-sm font-semibold ${step === 1 ? "text-orange-500" : "text-gray-400"}`}>
                Details
              </span>
            </div>
            <div className="flex-1 mx-3 h-0.5 rounded-full overflow-hidden bg-gray-200">
              <div
                className="h-full transition-all duration-500"
                style={{ width: step > 1 ? "100%" : "0%", background: "linear-gradient(90deg, #f43f5e, #fb923c)" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? "text-white" : "bg-gray-200 text-gray-500"}`}
                style={step === 2 ? { background: "linear-gradient(135deg, #f43f5e, #fb923c)" } : {}}
              >
                2
              </div>
              <span className={`text-sm font-semibold ${step === 2 ? "text-orange-500" : "text-gray-400"}`}>
                Verify OTP
              </span>
            </div>
          </div>

          {/* Error */}
          {message && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-lg mb-4 text-sm flex items-start gap-2">
              <span>⚠️</span><span>{message}</span>
            </div>
          )}

          {/* ════ STEP 1 ════ */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Booking ID</label>
                <input
                  type="text"
                  placeholder="e.g. TKT123456"
                  value={form.ticket}
                  onChange={(e) => setForm({ ...form, ticket: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                  onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #fb923c55")}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="abc@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                  onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #fb923c55")}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                <div
                  className="flex border border-gray-200 rounded-xl overflow-hidden"
                  onFocusCapture={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #fb923c55")}
                  onBlurCapture={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <span className="flex items-center px-4 bg-gray-50 text-gray-500 text-sm font-semibold border-r border-gray-200">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile"
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
                    className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-white"
                  />
                </div>
              </div>
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full text-white font-bold py-3.5 rounded-xl mt-1 transition-all text-sm tracking-wide disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending OTP…
                  </span>
                ) : "Send OTP →"}
              </button>
            </div>
          )}

          {/* ════ STEP 2 ════ */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-400">Booking ID</span>
                  <span className="font-semibold text-gray-800">{form.ticket}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mobile</span>
                  <span className="font-semibold text-gray-800">{maskedMobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="font-semibold text-gray-800 truncate max-w-[180px]">{form.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Enter OTP <span className="text-gray-400 font-normal">(4-digit)</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="one-time-code"
                  autoComplete="one-time-code"
                  maxLength={4}
                  value={otp}
                  placeholder="• • • •"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.8em] focus:outline-none transition-all"
                  onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #fb923c55")}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>

              <div className="text-center text-sm">
                {timer > 0 ? (
                  <span className="text-gray-400">
                    Resend OTP in <span className="font-bold" style={{ color: "#f43f5e" }}>{timer}s</span>
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Didn't receive OTP?{" "}
                    <button onClick={handleResend} disabled={loading} className="font-bold hover:underline" style={{ color: "#fb923c" }}>
                      Resend OTP
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={handleOTPVerify}
                disabled={loading}
                className="w-full text-white font-bold py-3.5 rounded-xl transition-all text-sm tracking-wide disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying…
                  </span>
                ) : "Verify & Proceed →"}
              </button>

              <button
                onClick={() => { setStep(1); setMessage(""); setOtp(""); }}
                className="w-full text-gray-400 hover:text-gray-600 text-xs py-1"
              >
                ← Change booking details
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Keyframe animations via style tag ── */}
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes scalePop {
          0%   { transform: scale(0); }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes drawCheck {
          0%   { stroke-dasharray: 0 30; }
          100% { stroke-dasharray: 30 0; }
        }
        @keyframes progressBar {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default CancellationCard;