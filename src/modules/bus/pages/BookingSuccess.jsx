// src/modules/bus/pages/BookingSuccess.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { createRazorpayOrder, verifyRazorpayPayment } from "../services/razorpayService";
import { createBillDeskOrder } from "../services/billdeskService";
import { useEffect, useState, useRef, useCallback } from "react";
import { getUserDetails } from "../../../utils/authHelper";
import axios from "axios";

const BookingSuccess = () => {
  const { state: locationState } = useLocation();
  const navigate = useNavigate();
  
  // ---------- PERSIST STATE ACROSS REFRESH ----------
  const [state, setState] = useState(() => {
    if (locationState) return locationState;
    const saved = localStorage.getItem("booking_success_state");
    return saved ? JSON.parse(saved) : null;
  });
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    if (state) localStorage.setItem("booking_success_state", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state) navigate("/", { replace: true });
  }, [state, navigate]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (stateRef.current) localStorage.setItem("booking_success_state", JSON.stringify(stateRef.current));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const clearStoredBooking = useCallback(() => {
    localStorage.removeItem("booking_success_state");
  }, []);

  // ---------- BACK BUTTON CONFIRMATION POPUP (WORKS EVERY TIME) ----------
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  useEffect(() => {
    window.history.pushState({ bookingState: true }, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState({ bookingState: true }, "", window.location.href);
      setShowBackConfirm(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleBackConfirm = () => {
    setShowBackConfirm(false);
    clearStoredBooking();
    const saved = JSON.parse(localStorage.getItem("bookingNavState") || "{}");
    navigate(
      `/results?source=${saved?.source || ""}&destination=${saved?.destination || ""}&doj=${saved?.date || ""}&fromName=${encodeURIComponent(saved?.fromCity || "")}&toName=${encodeURIComponent(saved?.toCity || "")}`,
      {
        state: {
          sourceName: saved?.fromCity,
          destinationName: saved?.toCity,
          reopenSeat: true,
          tripId: saved?.tripId,
        },
      }
    );
  };

  const handleBackCancel = () => {
    setShowBackConfirm(false);
  };

  // ---------- TIMER ----------
  const BLOCK_DURATION = 480;
  const [timeLeft, setTimeLeft] = useState(BLOCK_DURATION);
  useEffect(() => {
    let startTime = localStorage.getItem("blockStartTime");
    if (!startTime) {
      startTime = Date.now();
      localStorage.setItem("blockStartTime", startTime);
    }
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = BLOCK_DURATION - elapsed;
      if (remaining <= 0) {
        clearInterval(timer);
        localStorage.removeItem("blockStartTime");
        clearStoredBooking();
        navigate("/");
      }
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate, clearStoredBooking]);

  const timerStr = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`;

  // Save navigation state for results page
  useEffect(() => {
    if (state && state.source) {
      localStorage.setItem("bookingNavState", JSON.stringify({
        source: state.source,
        destination: state.destination,
        date: state.date,
        fromCity: state.fromCity,
        toCity: state.toCity,
        tripId: state.tripId,
      }));
    }
  }, [state]);

  // ---------- DATA FROM STATE ----------
  const user = getUserDetails();
  const isGuest = !user?.uid || user?.uid === "Not Applicable";
  const totalFare = state?.totalFare || 0;
  const uid = user?.uid || state?.uid;
  const rewardpoint = parseFloat(state?.rewardpoint) || 0;
  const availableRewardPoint = parseFloat(state?.availableRewardPoint) || 0;
  const passengers = state?.passengers || [];

  // ---------- PROMO CODE ----------
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoPopup, setPromoPopup] = useState(null);

  const discountedFare = promoApplied ? totalFare - promoDiscount : totalFare;
  const canPayFullWithRewards = availableRewardPoint >= discountedFare;
  const remainingAfterRewards = Math.max(0, discountedFare - availableRewardPoint).toFixed(2);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code.");
      return;
    }
    const offerBody = {
      pmobile: String(user?.umob || user?.mobile || user?.pmobile || ""),
      uid: String(uid || ""),
      pemail: user?.uemail || user?.email || user?.pemail || "",
      blk_ticket: state?.ticketId || "",
      divTotal: Number(totalFare),
      offerCode: promoCode.trim().toUpperCase(),
    };
    try {
      const res = await axios.post("/offer/apply", offerBody);
      if (res.data?.success) {
        const discount = parseFloat(res.data.discount || 0);
        setPromoDiscount(discount);
        setPromoApplied(true);
        setPromoError("");
        setPromoPopup({ discount, newTotal: res.data.newTotal || (totalFare - discount) });
      } else {
        setPromoError(res.data?.message || "Invalid promo code.");
      }
    } catch (err) {
      setPromoError(err.response?.data?.message || "Failed to apply promo code.");
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoError("");
  };

  // ---------- PAYMENT GATEWAY & REWARD POINTS ----------
  const [showRewardConfirm, setShowRewardConfirm] = useState(false);
  const [pendingGateway, setPendingGateway] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleGatewaySelect = (gateway) => {
    setPendingGateway(gateway);
    if (!isGuest && availableRewardPoint > 0) {
      setShowRewardConfirm(true);
    } else {
      executePayment(gateway, false);
    }
  };

  const handleRewardConfirmProceed = () => {
    setShowRewardConfirm(false);
    executePayment(pendingGateway, true);
  };

  const executePayment = async (gateway, useRewards) => {
    if (useRewards && availableRewardPoint > 0) {
      if (canPayFullWithRewards) {
        try {
          const res = await axios.post("/bookticket/rp", {
            blockedTicketId: state?.ticketId,
            payeeid: String(uid),
            name: passengers[0]?.name || "Guest",
            email: passengers[0]?.email || "",
            fare: discountedFare,
            paymentfor: "Bus Ticket RP"
          });
          if (res.data?.success) {
            setShowSuccessPopup(true);
            setTimeout(() => {
              clearStoredBooking();
              navigate("/payment-status", {
                state: {
                  status: "success",
                  paymentData: res.data,
                  passengers,
                  seats: state?.seats,
                  fromCity: state?.fromCity,
                  toCity: state?.toCity,
                  date: state?.date,
                  totalFare: discountedFare,
                  ticketId: state?.ticketId
                }
              });
            }, 2000);
            return;
          }
        } catch (err) {
          console.error("Full reward error:", err);
        }
      } else {
        try {
          await axios.post("/bookticket/rp", {
            blockedTicketId: state?.ticketId,
            payeeid: String(uid),
            name: passengers[0]?.name || "Guest",
            email: passengers[0]?.email || "",
            fare: discountedFare,
            paymentfor: "Bus Ticket RP"
          });
        } catch (err) {
          console.error("Partial reward error:", err);
        }
        const fareToCharge = parseFloat(remainingAfterRewards);
        if (gateway === "razorpay") await handleRazorPayClick(fareToCharge);
        else await handleBillDeskClick(fareToCharge);
        return;
      }
    }
    if (gateway === "razorpay") await handleRazorPayClick(discountedFare);
    else await handleBillDeskClick(discountedFare);
  };

  const handleRazorPayClick = async (fareToCharge) => {
    const fare = fareToCharge ?? discountedFare;
    try {
      const orderResponse = await createRazorpayOrder({
        fare,
        uid: uid || "Not Applicable",
        name: passengers[0]?.name || "Guest",
        ticketId: state?.ticketId,
        email: passengers[0]?.email || "Not Applicable"
      });
      if (!orderResponse) { alert("Failed to create Razorpay order"); return; }
      const order = orderResponse.order;
      const options = {
        key: "rzp_live_wyxyLDS9NPZCPy",
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Bus Ticket Booking",
        description: "Ticket Payment",
        prefill: { name: passengers[0]?.name, email: passengers[0]?.email, contact: String(uid) },
        theme: { color: "#fd561e" },
        handler: async function (response) {
          const verifyData = await verifyRazorpayPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
          if (!verifyData) {
            clearStoredBooking();
            navigate("/payment-status", { state: { status: "failed", payment: { code: "VERIFY_FAILED", description: "Payment verification failed" } } });
            return;
          }
          const isSuccess = verifyData?.success === true || verifyData?.status === "success";
          clearStoredBooking();
          navigate("/payment-status", {
            state: {
              status: isSuccess ? "success" : "failed",
              paymentData: verifyData,
              passengers,
              seats: state?.seats,
              fromCity: state?.fromCity,
              toCity: state?.toCity,
              date: state?.date,
              totalFare: fare,
              ticketId: state?.ticketId
            }
          });
        },
        modal: { ondismiss: function () { 
          clearStoredBooking();
          navigate("/payment-status", { state: { status: "cancelled" } }); 
        } }
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (r) {
        clearStoredBooking();
        navigate("/payment-status", { state: { status: "failed", payment: { code: "PAYMENT_ERROR", reason: r.error.message } } });
      });
      rzp.open();
    } catch (error) {
      clearStoredBooking();
      navigate("/payment-status", { state: { status: "failed", payment: { code: "PAYMENT_ERROR", reason: error.message } } });
    }
  };

  const handleBillDeskClick = async (fareToCharge) => {
  const fare = fareToCharge ?? discountedFare;
  try {
    // ✅ Store booking details in localStorage for PaymentStatus page to read
    localStorage.setItem("lastBookingPassengers", JSON.stringify(passengers));
    localStorage.setItem("lastBookingSeats", JSON.stringify(state?.seats));
    localStorage.setItem("lastBookingFrom", state?.fromCity);
    localStorage.setItem("lastBookingTo", state?.toCity);
    localStorage.setItem("lastBookingDate", state?.date);
    localStorage.setItem("lastBookingFare", fare);
    localStorage.setItem("lastBookingTicketId", state?.ticketId);

    const response = await createBillDeskOrder({
      fare,
      uid: uid || "NA",
      pname: passengers[0]?.name || "Guest",
      tickid: state?.ticketId,
      // redirect_url will be added by billdeskService now
    });
    if (!response || !response.success || !response.authToken) {
      alert("BillDesk order creation failed");
      return;
    }
    window.location.href = `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=HYDBOBROS&bdorderid=${response.bdorderid}&authToken=${encodeURIComponent(response.authToken)}`;
  } catch (error) {
    clearStoredBooking();
    navigate("/payment-status", { state: { status: "failed", payment: { description: "BillDesk payment error", reason: error.message } } });
  }
};

  if (!state) return null;

  return (
    <div className="booking-success-container" style={{ minHeight: "100vh", background: "#f4f6f9", fontFamily: "'Segoe UI', sans-serif", paddingTop: "90px" }}>
      <style>{`
        /* Mobile & Tablet Responsiveness */
        @media (max-width: 768px) {
          .booking-success-container {
            padding-top: 70px !important;
          }
          .booking-success-header {
            flex-direction: column !important;
            text-align: center !important;
            gap: 8px !important;
          }
          .booking-success-main-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .booking-success-card {
            padding: 16px !important;
          }
          .booking-success-timer {
            font-size: 12px !important;
          }
          .booking-success-pay-amount {
            font-size: 14px !important;
          }
          .booking-success-promo-input {
            flex-direction: column !important;
          }
          .booking-success-promo-input input,
          .booking-success-promo-input button {
            width: 100% !important;
          }
          .booking-success-passenger-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .booking-success-popup {
            width: 90% !important;
            max-width: 320px !important;
            padding: 16px !important;
          }
          .booking-success-trip-rating {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .booking-success-main-grid {
            gap: 20px !important;
          }
          .booking-success-card {
            padding: 18px !important;
          }
        }
      `}</style>

      {/* TOP STICKY HEADER */}
      <div className="booking-success-header" style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="booking-success-pay-amount" style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a2e" }}>
          Pay <span style={{ color: "#fd561e" }}>₹{typeof discountedFare === "number" ? discountedFare.toFixed(2) : discountedFare}</span>
        </div>
        <div className="booking-success-timer" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fd561e", fontWeight: "700", fontSize: "14px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fd561e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          {timerStr}
        </div>
      </div>

      {/* TRUST BADGES */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "10px 16px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", gap: "16px", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
          {[["🔒", "Secure Payment"], ["⚡", "Fast Confirmation"], ["✅", "Trusted Booking"]].map(([icon, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#666" }}>
              <span style={{ fontSize: "13px" }}>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: "1100px", margin: "20px auto 40px", padding: "0 16px" }}>
        <div className="booking-success-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>

          {/* LEFT COLUMN */}
          <div>
            {/* Promo Code */}
            {!isGuest && (
              <div className="booking-success-card" style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e8e8e8", padding: "20px", marginBottom: "20px" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a2e", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🏷️</span> Have a coupon code?
                </div>
                {promoApplied ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "12px", padding: "12px 14px" }}>
                    <span style={{ color: "#16a34a", fontWeight: "700", fontSize: "13px" }}>"{promoCode}" — ₹{promoDiscount} off applied!</span>
                    <button onClick={handleRemovePromo} style={{ background: "none", border: "none", color: "#dc2626", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>Remove</button>
                  </div>
                ) : (
                  <div className="booking-success-promo-input" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value); setPromoError(""); }}
                      placeholder="Enter promo code"
                      style={{ flex: "1", minWidth: "160px", border: "1.5px solid #e0e0e0", borderRadius: "12px", padding: "12px 14px", fontSize: "14px", outline: "none" }}
                      onFocus={e => e.target.style.borderColor = "#fd561e"}
                      onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                    />
                    <button onClick={handleApplyPromo} style={{ background: "#fd561e", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "14px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}>Apply</button>
                  </div>
                )}
                {promoError && <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "8px" }}>{promoError}</div>}
              </div>
            )}

            {/* REWARD POINTS SUMMARY */}
            {!isGuest && (
              <div className="booking-success-card" style={{ background: "linear-gradient(135deg, #fff9f5, #fff2ec)", borderRadius: "16px", border: "1px solid #ffe0d0", padding: "20px", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "22px" }}>⭐</span>
                  <span style={{ fontSize: "15px", fontWeight: "800", color: "#1a1a2e" }}>Your Reward Points</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", color: "#555" }}>Available Balance</span>
                  <span style={{ fontSize: "22px", fontWeight: "800", color: "#fd561e" }}>₹{availableRewardPoint.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px dashed #ffe0d0" }}>
                  <span style={{ fontSize: "12.5px", color: "#555" }}>Earn on this booking</span>
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#16a34a" }}>+ ₹{rewardpoint.toFixed(2)}</span>
                </div>
                {availableRewardPoint > 0 && (
                  <div style={{ marginTop: "14px", background: "#fff", borderRadius: "12px", padding: "12px", fontSize: "12px", color: canPayFullWithRewards ? "#16a34a" : "#92400e", fontWeight: "500", textAlign: "center" }}>
                    {canPayFullWithRewards
                      ? "✅ Your reward balance can cover the full fare!"
                      : `💡 ₹${availableRewardPoint} will be deducted automatically. You'll pay ₹${remainingAfterRewards} via gateway.`}
                  </div>
                )}
              </div>
            )}

            {/* Payment Methods */}
            <div className="booking-success-card" style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e8e8e8", padding: "20px", marginBottom: "20px" }}>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#1a1a2e", marginBottom: "18px" }}>Select Payment Method</div>
              <div onClick={() => handleGatewaySelect("razorpay")} style={{ border: "1.5px solid #e8e8e8", borderRadius: "14px", padding: "16px", marginBottom: "12px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#fd561e"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e8e8e8"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a1a2e" }}>💳 RazorPay</div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>UPI · Cards · Net Banking · Wallets</div>
                  </div>
                  <span style={{ color: "#aaa", fontSize: "20px" }}>›</span>
                </div>
              </div>
              <div onClick={() => handleGatewaySelect("billdesk")} style={{ border: "1.5px solid #e8e8e8", borderRadius: "14px", padding: "16px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#fd561e"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e8e8e8"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a1a2e" }}>🏦 BillDesk</div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Net Banking · Debit Cards</div>
                  </div>
                  <span style={{ color: "#aaa", fontSize: "20px" }}>›</span>
                </div>
              </div>
            </div>

            {/* Guest Message */}
            {isGuest && (
              <div className="booking-success-card" style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e8e8e8", padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#1a1a2e", marginBottom: "8px" }}>Booking as a guest?</div>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "20px", lineHeight: "1.5" }}>Sign up to get discounts, earn reward points, and manage bookings easily.</div>
                <button onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: "signup" }))}
                  style={{ background: "#fd561e", color: "white", border: "none", borderRadius: "40px", padding: "12px 32px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(253,86,30,0.3)" }}>
                  Sign Up for Free
                </button>
                <div style={{ marginTop: "16px", fontSize: "13px", color: "#666" }}>
                  Already have an account?{" "}
                  <span onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: "signin" }))} style={{ color: "#2563eb", fontWeight: "700", cursor: "pointer" }}>Sign In</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Fare Breakup */}
            <div className="booking-success-card" style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e8e8e8", padding: "20px", marginBottom: "20px" }}>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#1a1a2e", marginBottom: "18px" }}>Fare Breakup</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#555" }}>
                <span>Base Fare ({passengers.length} seat{passengers.length > 1 ? "s" : ""})</span>
                <span style={{ fontWeight: "600", color: "#1a1a2e" }}>₹{totalFare.toFixed(2)}</span>
              </div>
              {promoApplied && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#16a34a" }}>
                  <span>Promo Discount ({promoCode})</span>
                  <span style={{ fontWeight: "600" }}>− ₹{promoDiscount.toFixed(2)}</span>
                </div>
              )}
              {!isGuest && availableRewardPoint > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#16a34a" }}>
                  <span>Reward Balance Used</span>
                  <span style={{ fontWeight: "600" }}>− ₹{Math.min(availableRewardPoint, discountedFare).toFixed(2)}</span>
                </div>
              )}
              <div style={{ borderTop: "1.5px solid #f0f0f0", paddingTop: "14px", marginTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "17px", fontWeight: "800", color: "#1a1a2e" }}>
                <span>Total to Pay</span>
                <span style={{ color: "#fd561e" }}>
                  ₹{!isGuest && availableRewardPoint > 0 ? remainingAfterRewards : (typeof discountedFare === "number" ? discountedFare.toFixed(2) : discountedFare)}
                </span>
              </div>
            </div>

            {/* Trip Info + Rating */}
            <div className="booking-success-card" style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e8e8e8", padding: "20px", marginBottom: "20px" }}>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#1a1a2e", marginBottom: "6px" }}>
                {state?.fromCity} <span style={{ color: "#fd561e" }}>→</span> {state?.toCity}
              </div>
              <div className="booking-success-trip-rating" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                <div>
                  {state?.operator && <div style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>{state.operator}</div>}
                  {state?.busType && <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{state.busType}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "#fff5f0", padding: "4px 10px", borderRadius: "40px" }}>
                  <span style={{ fontSize: "14px" }}>⭐</span>
                  <span style={{ fontWeight: "800", color: "#1a1a2e" }}>4.8</span>
                  <span style={{ fontSize: "11px", color: "#666" }}>(2.1k ratings)</span>
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "#555", marginTop: "8px" }}>📅 {state?.date}</div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>🎫 Booking Ref: <strong>{state?.ticketId}</strong></div>
            </div>

            {/* Passenger Details */}
            <div className="booking-success-card" style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e8e8e8", padding: "20px" }}>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#1a1a2e", marginBottom: "18px" }}>Passenger Details</div>
              {passengers.map((p, i) => (
                <div key={i} style={{ marginBottom: i < passengers.length - 1 ? "20px" : "0", paddingBottom: i < passengers.length - 1 ? "16px" : "0", borderBottom: i < passengers.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <div className="booking-success-passenger-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>Name</div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>{p.name || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>Seat</div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#fd561e" }}>{p.seatName || p.seat || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>Age</div>
                      <div style={{ fontSize: "13px", fontWeight: "500", color: "#1a1a2e" }}>{p.age || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>Gender</div>
                      <div style={{ fontSize: "13px", fontWeight: "500", color: "#1a1a2e" }}>{p.gender || "—"}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "8px" }}>Booking confirmation will be sent to:</div>
                {(passengers[0]?.mobile || state?.mobile) && (
                  <div style={{ fontSize: "13px", color: "#333", marginBottom: "4px" }}>📞 +91 {passengers[0]?.mobile || state?.mobile}</div>
                )}
                {(passengers[0]?.email || state?.email || user?.uemail) && (
                  <div style={{ fontSize: "13px", color: "#333", wordBreak: "break-word" }}>✉️ {passengers[0]?.email || state?.email || user?.uemail}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REWARD CONFIRMATION POPUP */}
      {showRewardConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}>
          <div className="booking-success-popup" style={{ background: "white", borderRadius: "20px", padding: "20px", width: "100%", maxWidth: "380px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "36px", marginBottom: "6px" }}>💰</div>
              <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#1a1a2e", margin: 0 }}>Reward Points Summary</h2>
            </div>
            <div style={{ background: "#f8f9ff", borderRadius: "12px", padding: "14px", marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", color: "#666" }}>Your Reward Balance</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#fd561e" }}>₹{availableRewardPoint}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", color: "#666" }}>Total Fare</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#1a1a2e" }}>₹{discountedFare}</span>
              </div>
              <div style={{ borderTop: "1px solid #e8eaf6", paddingTop: "10px", marginTop: "2px" }}>
                {canPayFullWithRewards ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a" }}>✅ Full fare covered by rewards!</div>
                    <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>No extra payment needed.</div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: "#666" }}>Rewards Deducted</span>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>− ₹{availableRewardPoint}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", background: "#fff5f2", borderRadius: "8px", padding: "8px 10px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#666" }}>Pay via {pendingGateway === "razorpay" ? "RazorPay" : "BillDesk"}</span>
                      <span style={{ fontSize: "15px", fontWeight: "800", color: "#fd561e" }}>₹{remainingAfterRewards}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "#282424", textAlign: "center", marginBottom: "16px", lineHeight: "1.5" }}>
              {canPayFullWithRewards
                ? "Tap Confirm to complete your booking using reward points only."
                : `₹${availableRewardPoint} deducted from rewards. Remaining ₹${remainingAfterRewards} via ${pendingGateway === "razorpay" ? "RazorPay" : "BillDesk"}.`}
            </p>
            <button onClick={handleRewardConfirmProceed} style={{ width: "100%", background: "linear-gradient(135deg, #fd561e, #ff8c42)", color: "white", border: "none", borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "10px" }}>
              {canPayFullWithRewards ? "✅ Confirm & Book" : `Proceed → Pay ₹${remainingAfterRewards}`}
            </button>
            <button onClick={() => setShowRewardConfirm(false)} style={{ width: "100%", background: "none", border: "none", color: "#252323", fontSize: "15px", cursor: "pointer", padding: "6px" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* PROMO POPUP */}
      {promoPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}>
          <div className="booking-success-popup" style={{ background: "white", borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "300px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#1a1a2e", marginBottom: "10px" }}>Promo Applied 🎉</h3>
            <p style={{ fontSize: "13px", color: "#444", lineHeight: "1.5", marginBottom: "16px" }}>
              Offer applied successfully! ₹{promoPopup.discount} discount has been applied.
            </p>
            <div style={{ textAlign: "right" }}>
              <button onClick={() => setPromoPopup(null)} style={{ background: "none", border: "none", color: "#6366f1", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: "16px" }}>
          <div className="booking-success-popup" style={{ background: "white", borderRadius: "20px", padding: "28px 20px", width: "100%", maxWidth: "300px", textAlign: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "28px" }}>✅</div>
            <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#1a1a2e", marginBottom: "6px" }}>Booking Successful!</h2>
            <p style={{ fontSize: "12px", color: "#666", lineHeight: "1.4" }}>Your ticket has been booked using reward points.</p>
            <p style={{ fontSize: "11px", color: "#aaa", marginTop: "10px" }}>Redirecting...</p>
          </div>
        </div>
      )}

      {/* BACK BUTTON CONFIRMATION POPUP */}
      {showBackConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "16px" }}>
          <div className="booking-success-popup" style={{ background: "white", padding: "20px", borderRadius: "16px", width: "100%", maxWidth: "300px", textAlign: "center" }}>
            <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "10px" }}>⚠️ Go Back?</h3>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "16px", lineHeight: "1.4" }}>If you go back, your selected seats may be lost.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleBackCancel} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #ccc", cursor: "pointer", fontSize: "13px", background: "white" }}>Stay</button>
              <button onClick={handleBackConfirm} style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "#fd561e", color: "white", border: "none", cursor: "pointer", fontSize: "13px" }}>Go Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSuccess;