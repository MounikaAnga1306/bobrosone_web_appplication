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

  const [state, setState] = useState(() => {
    if (locationState) return locationState;
    const saved = localStorage.getItem("booking_success_state");
    return saved ? JSON.parse(saved) : null;
  });
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { if (state) localStorage.setItem("booking_success_state", JSON.stringify(state)); }, [state]);
  useEffect(() => { if (!state) navigate("/", { replace: true }); }, [state, navigate]);
  useEffect(() => {
    const h = () => { if (stateRef.current) localStorage.setItem("booking_success_state", JSON.stringify(stateRef.current)); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, []);
  const clearStoredBooking = useCallback(() => { localStorage.removeItem("booking_success_state"); }, []);

  // Back button
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  useEffect(() => {
    window.history.pushState({ bookingState: true }, "", window.location.href);
    const h = () => { window.history.pushState({ bookingState: true }, "", window.location.href); setShowBackConfirm(true); };
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, []);
  const handleBackConfirm = () => {
    setShowBackConfirm(false); clearStoredBooking();
    const saved = JSON.parse(localStorage.getItem("bookingNavState") || "{}");
    navigate(
      `/results?source=${saved?.source||""}&destination=${saved?.destination||""}&doj=${saved?.date||""}&fromName=${encodeURIComponent(saved?.fromCity||"")}&toName=${encodeURIComponent(saved?.toCity||"")}`,
      { state: { sourceName: saved?.fromCity, destinationName: saved?.toCity, reopenSeat: true, tripId: saved?.tripId } }
    );
  };
  const handleBackCancel = () => setShowBackConfirm(false);

  // Timer
  const BLOCK_DURATION = 480;
  const [timeLeft, setTimeLeft] = useState(BLOCK_DURATION);
  useEffect(() => {
    let startTime = localStorage.getItem("blockStartTime");
    if (!startTime) { startTime = Date.now(); localStorage.setItem("blockStartTime", startTime); }
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - Number(startTime)) / 1000);
      const remaining = BLOCK_DURATION - elapsed;
      if (remaining <= 0) { clearInterval(timer); localStorage.removeItem("blockStartTime"); clearStoredBooking(); navigate("/"); }
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate, clearStoredBooking]);
  const timerStr = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (state?.source) {
      localStorage.setItem("bookingNavState", JSON.stringify({
        source: state.source, destination: state.destination, date: state.date,
        fromCity: state.fromCity, toCity: state.toCity, tripId: state.tripId,
      }));
    }
  }, [state]);

  // Data
  const user = getUserDetails();
  const isGuest = !user?.uid || user?.uid === "Not Applicable";
  const totalFare = state?.totalFare || 0;
  const baseFareTotal = parseFloat(state?.baseFareTotal) || totalFare;
  const gstTotal = parseFloat(state?.gstTotal) || 0;
  const uid = user?.uid || state?.uid;
  const rewardpoint = parseFloat(state?.rewardpoint) || 0;
  const availableRewardPoint = parseFloat(state?.availableRewardPoint) || 0;
  const passengers = state?.passengers || [];

  // Promo
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  const discountedFare = promoApplied ? totalFare - promoDiscount : totalFare;
  const canPayFullWithRewards = availableRewardPoint >= discountedFare;
  const remainingAfterRewards = Math.max(0, discountedFare - availableRewardPoint).toFixed(2);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) { setPromoError("Please enter a promo code."); return; }
    try {
      const res = await axios.post("/offer/apply", {
        pmobile: String(user?.umob || user?.mobile || user?.pmobile || ""),
        uid: String(uid || ""), pemail: user?.uemail || user?.email || user?.pemail || "",
        blk_ticket: state?.ticketId || "", divTotal: Number(totalFare),
        offerCode: promoCode.trim().toUpperCase(),
      });
      if (res.data?.success) {
        const discount = parseFloat(res.data.discount || 0);
        setPromoDiscount(discount); setPromoApplied(true); setPromoError("");
      } else { setPromoError(res.data?.message || "Invalid promo code."); }
    } catch (err) { setPromoError(err.response?.data?.message || "Failed to apply promo code."); }
  };
  const handleRemovePromo = () => { setPromoCode(""); setPromoApplied(false); setPromoDiscount(0); setPromoError(""); };

  // Payment flow
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [proceedError, setProceedError] = useState("");
  const [showRewardConfirm, setShowRewardConfirm] = useState(false);
  const [pendingGateway, setPendingGateway] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleGatewayClick = (gw) => { setSelectedGateway(gw); setProceedError(""); };

  const handleProceedToPay = () => {
    if (!selectedGateway) { setProceedError("Please select a payment method to continue."); return; }
    setProceedError(""); setPendingGateway(selectedGateway);
    if (!isGuest && availableRewardPoint > 0) setShowRewardConfirm(true);
    else executePayment(selectedGateway, false);
  };

  const handleRewardConfirmProceed = () => { setShowRewardConfirm(false); executePayment(pendingGateway, true); };

  const executePayment = async (gateway, useRewards) => {
    if (useRewards && availableRewardPoint > 0) {
      if (canPayFullWithRewards) {
        try {
          const res = await axios.post("/bookticket/rp", {
            blockedTicketId: state?.ticketId, payeeid: String(uid),
            name: passengers[0]?.name || "Guest", email: passengers[0]?.email || "",
            fare: discountedFare, paymentfor: "Bus Ticket RP"
          });
          if (res.data?.success) {
            setShowSuccessPopup(true);
            setTimeout(() => {
              clearStoredBooking();
              navigate("/payment-status", { state: { status: "success", paymentData: res.data, passengers, seats: state?.seats, fromCity: state?.fromCity, toCity: state?.toCity, date: state?.date, totalFare: discountedFare, ticketId: state?.ticketId } });
            }, 2000);
            return;
          }
        } catch (err) { console.error("Full reward error:", err); }
      } else {
        try {
          await axios.post("/bookticket/rp", { blockedTicketId: state?.ticketId, payeeid: String(uid), name: passengers[0]?.name || "Guest", email: passengers[0]?.email || "", fare: discountedFare, paymentfor: "Bus Ticket RP" });
        } catch (err) { console.error("Partial reward error:", err); }
        const f = parseFloat(remainingAfterRewards);
        if (gateway === "razorpay") await handleRazorPayClick(f); else await handleBillDeskClick(f);
        return;
      }
    }
    if (gateway === "razorpay") await handleRazorPayClick(discountedFare); else await handleBillDeskClick(discountedFare);
  };

  const handleRazorPayClick = async (fareToCharge) => {
    const fare = fareToCharge ?? discountedFare;
    try {
      const orderResponse = await createRazorpayOrder({ fare, uid: uid || "Not Applicable", name: passengers[0]?.name || "Guest", ticketId: state?.ticketId, email: passengers[0]?.email || "Not Applicable" });
      if (!orderResponse) { alert("Failed to create Razorpay order"); return; }
      const order = orderResponse.order;
      const options = {
        key: "rzp_live_wyxyLDS9NPZCPy", amount: order.amount, currency: order.currency, order_id: order.id,
        name: "Bus Ticket Booking", description: "Ticket Payment",
        prefill: { name: passengers[0]?.name, email: passengers[0]?.email, contact: String(uid) },
        theme: { color: "#fd561e" },
        handler: async (response) => {
          const verifyData = await verifyRazorpayPayment({ razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature });
          if (!verifyData) { clearStoredBooking(); navigate("/payment-status", { state: { status: "failed", payment: { code: "VERIFY_FAILED", description: "Payment verification failed" } } }); return; }
          const isSuccess = verifyData?.success === true || verifyData?.status === "success";
          clearStoredBooking();
          navigate("/payment-status", { state: { status: isSuccess ? "success" : "failed", paymentData: verifyData, passengers, seats: state?.seats, fromCity: state?.fromCity, toCity: state?.toCity, date: state?.date, totalFare: fare, ticketId: state?.ticketId } });
        },
        modal: { ondismiss: () => { clearStoredBooking(); navigate("/payment-status", { state: { status: "cancelled" } }); } }
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => { clearStoredBooking(); navigate("/payment-status", { state: { status: "failed", payment: { code: "PAYMENT_ERROR", reason: r.error.message } } }); });
      rzp.open();
    } catch (error) { clearStoredBooking(); navigate("/payment-status", { state: { status: "failed", payment: { code: "PAYMENT_ERROR", reason: error.message } } }); }
  };

  const handleBillDeskClick = async (fareToCharge) => {
    const fare = fareToCharge ?? discountedFare;
    try {
      localStorage.setItem("lastBookingPassengers", JSON.stringify(passengers));
      localStorage.setItem("lastBookingSeats", JSON.stringify(state?.seats));
      localStorage.setItem("lastBookingFrom", state?.fromCity);
      localStorage.setItem("lastBookingTo", state?.toCity);
      localStorage.setItem("lastBookingDate", state?.date);
      localStorage.setItem("lastBookingFare", fare);
      localStorage.setItem("lastBookingTicketId", state?.ticketId);
      const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;
      const response = await createBillDeskOrder({ fare, uid: uid || "NA", pname: passengers[0]?.name || "Guest", tickid: state?.ticketId, redirect_url: `${APP_URL}/payment-status` });
      if (!response || !response.success || !response.authToken) { alert("BillDesk order creation failed"); return; }
      window.location.href = `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=HYDBOBROS&bdorderid=${response.bdorderid}&authToken=${encodeURIComponent(response.authToken)}`;
    } catch (error) { clearStoredBooking(); navigate("/payment-status", { state: { status: "failed", payment: { description: "BillDesk payment error", reason: error.message } } }); }
  };

  if (!state) return null;

  const finalPayDisplay = !isGuest && availableRewardPoint > 0
    ? remainingAfterRewards
    : (typeof discountedFare === "number" ? discountedFare.toFixed(2) : String(discountedFare));

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0ee", fontFamily: "'Segoe UI', sans-serif", paddingTop: "100px" }}>
      <style>{`
        .bs-main-grid { display: grid; grid-template-columns: 1fr 400px; gap: 22px; align-items: start; }
        .bs-card { background: #fff; border-radius: 16px; border: 1px solid #ebebeb; padding: 22px; margin-bottom: 16px; }
        /* Coupon card — peach bg */
        .bs-card-promo { background: #fff8f5; border-radius: 16px; border: 1px solid #fde0d0; padding: 22px; margin-bottom: 16px; }
        /* Reward card — very light green */
        .bs-card-reward { background: #f7fef9; border-radius: 16px; border: 1px solid #d1fae5; padding: 22px; margin-bottom: 16px; }

        .bs-promo-row { display: flex; gap: 10px; margin-top: 14px; }
        .bs-promo-row input { flex: 1; border: 1.5px solid #e5e5e5; border-radius: 10px; padding: 11px 16px; font-size: 14px; outline: none; background: #fff; transition: border-color 0.2s; color: #333; }
        .bs-promo-row input:focus { border-color: #fd561e; }
        .bs-promo-row button { background: #fd561e; color: white; border: none; border-radius: 10px; padding: 11px 28px; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; }

        .bs-gw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .bs-gw-card { border: 1.5px solid #e8e8e8; border-radius: 14px; padding: 20px 14px 16px; cursor: pointer; transition: all 0.18s; background: #fff; display: flex; flex-direction: column; align-items: center; gap: 10px; position: relative; text-align: center; }
        .bs-gw-card:hover { border-color: #fd561e; background: #fff9f7; }
        .bs-gw-card.gw-sel { border-color: #fd561e; background: #fff5f1; box-shadow: 0 0 0 3px rgba(253,86,30,0.12); }
        .bs-gw-badge { position: absolute; top: -10px; right: -10px; width: 24px; height: 24px; border-radius: 50%; background: #fd561e; display: flex; align-items: center; justify-content: center; border: 2.5px solid #fff; box-shadow: 0 2px 8px rgba(253,86,30,0.4); }

        .bs-trust { display: flex; border: 1px solid #efefef; border-radius: 12px; overflow: hidden; margin-top: 14px; background: #fff; }
        .bs-trust-i { flex: 1; display: flex; align-items: center; gap: 7px; padding: 10px 10px; font-size: 11px; color: #555; border-right: 1px solid #efefef; }
        .bs-trust-i:last-child { border-right: none; }

        .bs-pay-btn { width: 100%; background: linear-gradient(135deg, #fd561e 0%, #ff7d45 100%); color: white; border: none; border-radius: 14px; padding: 16px; font-size: 17px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 6px 20px rgba(253,86,30,0.35); transition: all 0.2s; margin-top: 14px; }
        .bs-pay-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 26px rgba(253,86,30,0.45); }

        .bs-fare-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; color: #555; }
        .bs-fare-row:last-of-type { border-bottom: none; }

        @media (max-width: 900px) { .bs-main-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) {
          .bs-card, .bs-card-promo, .bs-card-reward { padding: 16px !important; }
          .bs-promo-row { flex-direction: column; }
          .bs-trust { flex-direction: column; }
          .bs-trust-i { border-right: none !important; border-bottom: 1px solid #efefef; }
          .bs-trust-i:last-child { border-bottom: none; }
        }
      `}</style>

      <div style={{ maxWidth: "1120px", margin: "0 auto 50px", padding: "0 16px" }}>
        <div className="bs-main-grid">

          {/* ════ LEFT ════ */}
          <div>

            {/* COUPON — logged-in only */}
            {!isGuest && (
              <div className="bs-card-promo">
                {/* If promo applied → green banner at top like image 3 */}
                {promoApplied && (
                  <div style={{ background: "#fd561e", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "white" }}>
                        {promoCode.toUpperCase()} applied · <span style={{ textDecoration: "line-through", opacity: 0.75 }}>₹{promoDiscount}</span> ₹{promoDiscount} Saved
                      </span>
                    </div>
                    <button onClick={handleRemovePromo} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Remove</button>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: promoApplied ? "0" : "0" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fd561e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e" }}>Have a coupon code?</span>
                </div>

                {!promoApplied && (
                  <>
                    <div className="bs-promo-row">
                      <input type="text" value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoError(""); }} placeholder="Enter promo code"/>
                      <button onClick={handleApplyPromo}>Apply</button>
                    </div>
                    {promoError && <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "8px" }}>{promoError}</div>}
                  </>
                )}

                {/* Congrats line — green, shown only when applied, like image 3 */}
                {promoApplied && (
                  <div style={{ marginTop: "10px", fontSize: "13px", color: "#16a34a", fontWeight: "500" }}>
                    🎉 Congrats! You have availed a discount of ₹{promoDiscount}.
                  </div>
                )}
              </div>
            )}

            {/* REWARD POINTS — logged-in only, very light green */}
            {!isGuest && (
              <div className="bs-card-reward">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fd561e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12"/>
                    <rect x="2" y="7" width="20" height="5"/>
                    <line x1="12" y1="22" x2="12" y2="7"/>
                    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
                    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
                  </svg>
                  <span style={{ fontSize: "17px", fontWeight: "800", color: "#1a1a2e" }}>Your Reward Points</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
                  <span style={{ fontSize: "14px", color: "#555" }}>Available Balance</span>
                  <span style={{ fontSize: "20px", fontWeight: "800", color: "#1a1a2e" }}>₹{availableRewardPoint.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px dashed #d1fae5" }}>
                  <span style={{ fontSize: "14px", color: "#555" }}>Reward for this booking</span>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#16a34a" }}>+ ₹{rewardpoint.toFixed(2)}</span>
                </div>
                {/* Hint — one line center, fd561e orange tick, black text, coupon bg color */}
                {availableRewardPoint > 0 && (
                  <div style={{ marginTop: "14px", background: "#fff8f5", border: "1px solid #fde0d0", borderRadius: "10px", padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    {/* fd561e orange circle tick */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="11" fill="#fff0e8"/>
                      <circle cx="12" cy="12" r="11" stroke="#fd561e" strokeWidth="1.5" fill="none"/>
                      <polyline points="7 12 10 15 17 9" stroke="#fd561e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: "13px", color: "#1a1a2e", fontWeight: "500" }}>
                      {canPayFullWithRewards
                        ? <strong style={{ color: "#16a34a" }}>Your reward balance covers the full fare!</strong>
                        : <>₹{availableRewardPoint} will be deducted automatically. You'll pay <strong style={{ color: "#fd561e" }}>₹{remainingAfterRewards}</strong> via gateway.</>
                      }
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENT METHOD */}
            <div className="bs-card">
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#1a1a2e", marginBottom: "16px" }}>Select Payment Method</div>
              <div className="bs-gw-grid">
                {/* RazorPay */}
                <div className={`bs-gw-card${selectedGateway === "razorpay" ? " gw-sel" : ""}`} onClick={() => handleGatewayClick("razorpay")}>
                  {selectedGateway === "razorpay" && (
                    <div className="bs-gw-badge">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                  {/* RazorPay logo — user will replace with /assets/razorpay.png */}
                  <div style={{ width: "70px", height: "70px", borderRadius: "12px",  display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <img src="/assets/razorpay_logo.jpg" alt="RazorPay"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      onError={e => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "block";
                      }}
                    />
                    <svg style={{ display: "none" }} width="32" height="32" viewBox="0 0 48 48" fill="none">
                      <path d="M13 35L22 13L38 35H29L22 21L15 35H13Z" fill="#3395FF"/>
                      <path d="M22 13L29 35H38L22 13Z" fill="#1565C0" opacity="0.6"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: "#1a1a2e" }}>RazorPay</div>
                    <div style={{ fontSize: "11px", color: "#888", marginTop: "4px", lineHeight: "1.5" }}>UPI · Cards<br/>Net Banking</div>
                  </div>
                </div>

                {/* BillDesk */}
                <div className={`bs-gw-card${selectedGateway === "billdesk" ? " gw-sel" : ""}`} onClick={() => handleGatewayClick("billdesk")}>
                  {selectedGateway === "billdesk" && (
                    <div className="bs-gw-badge">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                  {/* BillDesk logo — user will replace with /assets/billdesk.png */}
                  <div style={{ width: "70px", height: "70px", borderRadius: "12px",  display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <img src="/assets/billdesk_logo.jpg" alt="BillDesk"
                      style={{ width: "100%", height: "100%", objectFit: "contain",borderRadius:"12px" }}
                      onError={e => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "block";
                      }}
                    />
                    <svg style={{ display: "none" }} width="100%" height="100%" viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet">
                      <rect x="2" y="8" width="44" height="28" rx="6" fill="#7C3AED"/>
                      <rect x="2" y="14" width="44" height="10" fill="#5B21B6"/>
                      <rect x="6" y="28" width="14" height="4" rx="2" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: "#1a1a2e" }}>BillDesk</div>
                    <div style={{ fontSize: "11px", color: "#888", marginTop: "4px", lineHeight: "1.5" }}>Net Banking<br/>Debit Cards</div>
                  </div>
                </div>
              </div>

              {/* Trust strip — image 2 style: lock, lightning bolt, shield check */}
              <div className="bs-trust">
                <div className="bs-trust-i">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <div><div style={{ fontWeight: "600", fontSize: "11px" }}>Secure Payment</div><div style={{ color: "#999", fontSize: "10px" }}>256-bit SSL Encryption</div></div>
                </div>
                <div className="bs-trust-i">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fd561e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  <div><div style={{ fontWeight: "600", fontSize: "11px" }}>Fast Confirmation</div><div style={{ color: "#999", fontSize: "10px" }}>Instant ticket booking</div></div>
                </div>
                <div className="bs-trust-i">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2553b4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                  <div><div style={{ fontWeight: "600", fontSize: "11px" }}>Trusted Booking</div><div style={{ color: "#999", fontSize: "10px" }}>10M+ customers</div></div>
                </div>
              </div>

              {proceedError && (
                <div style={{ marginTop: "10px", color: "#dc2626", fontSize: "13px", fontWeight: "600", textAlign: "center" }}>⚠️ {proceedError}</div>
              )}
              <button className="bs-pay-btn" onClick={handleProceedToPay}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Proceed to Pay ₹{finalPayDisplay}
              </button>
              <div style={{ textAlign: "center", marginTop: "10px", fontSize: "12px", color: "#aaa" }}>🔒 100% Secure Payment</div>
            </div>

            {/* GUEST */}
            {isGuest && (
              <div className="bs-card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "#1a1a2e", marginBottom: "8px" }}>Booking as a guest?</div>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "20px", lineHeight: "1.6" }}>Sign up to earn reward points, get discounts, and manage bookings easily.</div>
                <button onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: "signup" }))}
                  style={{ background: "#fd561e", color: "white", border: "none", borderRadius: "40px", padding: "13px 36px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 16px rgba(253,86,30,0.32)" }}>
                  Sign Up for Free
                </button>
                <div style={{ marginTop: "14px", fontSize: "13px", color: "#444" }}>
                  Already have an account?{" "}
                  <span onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: "signin" }))} style={{ color: "#fd561e", fontWeight: "700", cursor: "pointer" }}>Sign In</span>
                </div>
              </div>
            )}
          </div>

          {/* ════ RIGHT — peach outer card ════ */}
          <div>
            <div style={{ background: "linear-gradient(135deg, #fff4ee 0%, #fde8d8 100%)", borderRadius: "20px", border: "1px solid #fdd0b0", padding: "20px" }}>

              {/* TRIP SUMMARY */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <span style={{ fontSize: "17px", fontWeight: "800", color: "#1a1a2e" }}>Trip Summary</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#fd561e", fontWeight: "700", fontSize: "14px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fd561e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {timerStr}
                  </div>
                </div>

                {/* Bus image — /assets/trip_bus.png */}
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <img
                    src="/assets/trip_bus.png"
                    alt="BOBROS Bus"
                    style={{ width: "100%", maxWidth: "280px", height: "auto", objectFit: "contain", display: "inline-block" }}
                  />
                </div>

                {/* Route */}
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#1a1a2e", marginBottom: "10px" }}>
                  {state?.fromCity} <span style={{ color: "#fd561e" }}>→</span> {state?.toCity}
                </div>

                {/* Date + Ref */}
                <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", fontSize: "13px", color: "#444", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{state?.date}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M2 9a3 3 0 110 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 110-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z"/>
                    </svg>
                    <span>Booking Ref: <strong>{state?.ticketId}</strong></span>
                  </div>
                </div>
              </div>

              {/* FARE BREAKUP — white card */}
              <div style={{ background: "#fff", borderRadius: "14px", padding: "18px", marginBottom: "12px" }}>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "#1a1a2e", marginBottom: "8px" }}>Fare Breakup</div>
                <div className="bs-fare-row">
                  <span>Base Fare ({passengers.length} seat{passengers.length > 1 ? "s" : ""})</span>
                  <span style={{ fontWeight: "600", color: "#1a1a2e" }}>₹{baseFareTotal.toFixed(2)}</span>
                </div>
                <div className="bs-fare-row">
                  <span>GST</span>
                  <span style={{ fontWeight: "600", color: "#1a1a2e" }}>+ ₹{gstTotal.toFixed(2)}</span>
                </div>
                {/* Offer discount — fd561e color, GST kindhaa, only if promo applied */}
                {promoApplied && (
                  <div className="bs-fare-row" style={{ color: "#fd561e" }}>
                    <span>Offer Discount ({promoCode.toUpperCase()})</span>
                    <span style={{ fontWeight: "700" }}>− ₹{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                {/* Reward balance used — green, only if logged in & has rewards */}
                {!isGuest && availableRewardPoint > 0 && (
                  <div className="bs-fare-row" style={{ color: "#16a34a" }}>
                    <span>{promoApplied ? "Reward Balance Used" : "Reward Balance Used"}</span>
                    <span style={{ fontWeight: "600" }}>− ₹{Math.min(availableRewardPoint, discountedFare).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "12px", borderTop: "2px solid #f0f0f0" }}>
                  <span style={{ fontSize: "17px", fontWeight: "800", color: "#1a1a2e" }}>Total to Pay</span>
                  <span style={{ fontSize: "22px", fontWeight: "900", color: "#fd561e" }}>₹{finalPayDisplay}</span>
                </div>
              </div>

              {/* BOOKING CONFIRMATION — white card */}
              <div style={{ background: "#fff", borderRadius: "14px", padding: "18px" }}>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#1a1a2e", marginBottom: "14px" }}>Booking Confirmation</div>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "14px", marginBottom: "14px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#15803d" }}>Your booking will be confirmed instantly.</div>
                    <div style={{ fontSize: "12px", color: "#555", marginTop: "3px" }}>We will send the ticket and trip details to your contact.</div>
                  </div>
                </div>
                {(passengers[0]?.mobile || state?.mobile) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#333", marginBottom: "12px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fd561e" stroke="none" style={{ flexShrink: 0 }}>
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 .01h3a2 2 0 012 1.72c.13 1 .37 1.97.72 2.9a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.17-1.18a2 2 0 012.11-.45c.93.35 1.9.59 2.9.72A2 2 0 0122 14.92z"/>
                    </svg>
                    +91 {passengers[0]?.mobile || state?.mobile}
                  </div>
                )}
                {(passengers[0]?.email || state?.email || user?.uemail) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#333", wordBreak: "break-word" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fd561e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {passengers[0]?.email || state?.email || user?.uemail}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* REWARD POPUP */}
      {showRewardConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", width: "100%", maxWidth: "380px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <div style={{ fontSize: "38px", marginBottom: "6px" }}>💰</div>
              <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#1a1a2e", margin: 0 }}>Reward Points Summary</h2>
            </div>
            <div style={{ background: "#f8f9ff", borderRadius: "12px", padding: "16px", marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", color: "#666" }}>Your Reward Balance</span>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#fd561e" }}>₹{availableRewardPoint}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", color: "#666" }}>Total Fare</span>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#1a1a2e" }}>₹{discountedFare}</span>
              </div>
              <div style={{ borderTop: "1px solid #e8eaf6", paddingTop: "12px" }}>
                {canPayFullWithRewards ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a" }}>✅ Full fare covered by rewards!</div>
                    <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>No extra payment needed.</div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", color: "#666" }}>Rewards Deducted</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a" }}>− ₹{availableRewardPoint}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", background: "#fff5f2", borderRadius: "8px", padding: "10px 12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#666" }}>Pay via {pendingGateway === "razorpay" ? "RazorPay" : "BillDesk"}</span>
                      <span style={{ fontSize: "16px", fontWeight: "800", color: "#fd561e" }}>₹{remainingAfterRewards}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "#555", textAlign: "center", marginBottom: "18px", lineHeight: "1.6" }}>
              {canPayFullWithRewards ? "Tap Confirm to complete your booking using reward points only." : `₹${availableRewardPoint} deducted from rewards. Remaining ₹${remainingAfterRewards} via ${pendingGateway === "razorpay" ? "RazorPay" : "BillDesk"}.`}
            </p>
            <button onClick={handleRewardConfirmProceed} style={{ width: "100%", background: "linear-gradient(135deg, #fd561e, #ff8c42)", color: "white", border: "none", borderRadius: "12px", padding: "13px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "10px" }}>
              {canPayFullWithRewards ? "✅ Confirm & Book" : `Proceed → Pay ₹${remainingAfterRewards}`}
            </button>
            <button onClick={() => setShowRewardConfirm(false)} style={{ width: "100%", background: "none", border: "none", color: "#555", fontSize: "14px", cursor: "pointer", padding: "6px" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "30px 24px", width: "100%", maxWidth: "300px", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "30px" }}>✅</div>
            <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#1a1a2e", marginBottom: "8px" }}>Booking Successful!</h2>
            <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>Your ticket has been booked using reward points.</p>
            <p style={{ fontSize: "12px", color: "#aaa", marginTop: "12px" }}>Redirecting...</p>
          </div>
        </div>
      )}

      {/* BACK CONFIRM */}
      {showBackConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "16px" }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "16px", width: "100%", maxWidth: "300px", textAlign: "center" }}>
            <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "10px" }}>⚠️ Go Back?</h3>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px", lineHeight: "1.5" }}>If you go back, your selected seats may be released.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleBackCancel} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1.5px solid #ddd", cursor: "pointer", fontSize: "13px", fontWeight: "600", background: "white" }}>Stay</button>
              <button onClick={handleBackConfirm} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "#fd561e", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>Go Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSuccess;