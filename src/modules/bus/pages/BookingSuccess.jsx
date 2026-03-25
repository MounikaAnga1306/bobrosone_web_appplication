// src/modules/bus/pages/BookingSuccess.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { createRazorpayOrder, verifyRazorpayPayment } from "../services/razorpayService";
import { createBillDeskOrder } from "../services/billdeskService";
import { useEffect, useState } from "react";
import { getUserDetails } from "../../../utils/authHelper";
import axios from "axios";

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const [promoCode, setPromoCode]         = useState("");
  const [promoApplied, setPromoApplied]   = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError]       = useState("");
  const [promoPopup, setPromoPopup]       = useState(null);

  const [showGatewayPopup, setShowGatewayPopup]   = useState(false);
  const [showRewardConfirm, setShowRewardConfirm] = useState(false);
  const [pendingGateway, setPendingGateway]       = useState(null);
  const [showSuccessPopup, setShowSuccessPopup]   = useState(false);

  const [timeLeft, setTimeLeft] = useState(480);
  const BLOCK_DURATION = 480;

  const user    = getUserDetails();
  const isGuest = !user?.uid || user?.uid === "Not Applicable";

  useEffect(() => {
    if (!state) navigate("/", { replace: true });
  }, [state]);

  const totalFare            = state?.totalFare || 0;
  const uid                  = user?.uid || state?.uid;
  const rewardpoint          = parseFloat(state?.rewardpoint) || 0;
  const availableRewardPoint = parseFloat(state?.availableRewardPoint) || 0;
  const passengers           = state?.passengers || [];

  const discountedFare       = promoApplied ? totalFare - promoDiscount : totalFare;
  const canPayFullWithRewards = availableRewardPoint >= discountedFare;
  const remainingAfterRewards = Math.max(0, discountedFare - availableRewardPoint).toFixed(2);

  console.log("BookingSuccess state:", { totalFare, rewardpoint, availableRewardPoint, uid, isGuest, discountedFare, canPayFullWithRewards });

  // Timer
  useEffect(() => {
    let startTime = localStorage.getItem("blockStartTime");
    if (!startTime) { startTime = Date.now(); localStorage.setItem("blockStartTime", startTime); }
    const timer = setInterval(() => {
      const elapsed   = Math.floor((Date.now() - startTime) / 1000);
      const remaining = BLOCK_DURATION - elapsed;
      if (remaining <= 0) { clearInterval(timer); localStorage.removeItem("blockStartTime"); navigate("/"); }
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Intercept back button
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => { setShowBackConfirm(true); window.history.pushState(null, "", window.location.href); };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const timerStr = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`;

  const handleBackConfirm = () => {
    setShowBackConfirm(false);
    navigate(-1);
    setTimeout(() => window.dispatchEvent(new CustomEvent("reopenSeatLayout", { detail: { tripId: state?.tripId } })), 100);
  };
  const handleBackCancel = () => setShowBackConfirm(false);

  // Apply Promo
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) { setPromoError("Please enter a promo code."); return; }
    const offerBody = {
      pmobile: String(user?.umob || user?.mobile || user?.pmobile || ""),
      uid: String(uid || ""),
      pemail: user?.uemail || user?.email || user?.pemail || "",
      blk_ticket: state?.ticketId || "",
      divTotal: Number(totalFare),
      offerCode: promoCode.trim().toUpperCase(),
    };
    console.log("Offer API body:", offerBody);
    try {
      const res = await axios.post("/offer/apply", offerBody);
      console.log("Offer API response:", res.data);
      if (res.data?.success) {
        const discount = parseFloat(res.data.discount || 0);
        setPromoDiscount(discount); setPromoApplied(true); setPromoError("");
        setPromoPopup({ discount, newTotal: res.data.newTotal || (totalFare - discount) });
      } else { setPromoError(res.data?.message || "Invalid promo code."); }
    } catch (err) {
      console.error("Offer API error:", err.response?.data || err.message);
      setPromoError(err.response?.data?.message || err.response?.data?.error || "Failed to apply promo code.");
    }
  };
  const handleRemovePromo = () => { setPromoCode(""); setPromoApplied(false); setPromoDiscount(0); setPromoError(""); };

  const handleChoosePayment = () => setShowGatewayPopup(true);

  const handleGatewaySelect = (gateway) => {
    setShowGatewayPopup(false); setPendingGateway(gateway);
    if (!isGuest && availableRewardPoint > 0) setShowRewardConfirm(true);
    else executePayment(gateway, false);
  };

  const handleRewardConfirmProceed = () => { setShowRewardConfirm(false); executePayment(pendingGateway, true); };

  const executePayment = async (gateway, useRewards) => {
    if (useRewards && availableRewardPoint > 0) {
      if (canPayFullWithRewards) {
        try {
          const res = await axios.post("/bookticket/rp", { blockedTicketId: state?.ticketId, payeeid: String(uid), name: passengers[0]?.name || "Guest", email: passengers[0]?.email || "", fare: discountedFare, paymentfor: "Bus Ticket RP" });
          if (res.data?.success) {
            setShowSuccessPopup(true);
            setTimeout(() => navigate("/payment-status", { state: { status: "success", paymentData: res.data, passengers, seats: state?.seats, fromCity: state?.fromCity, toCity: state?.toCity, date: state?.date, totalFare: discountedFare, ticketId: state?.ticketId } }), 2000);
            return;
          }
        } catch (err) { console.error("Full reward error:", err); }
      } else {
        try { await axios.post("/bookticket/rp", { blockedTicketId: state?.ticketId, payeeid: String(uid), name: passengers[0]?.name || "Guest", email: passengers[0]?.email || "", fare: discountedFare, paymentfor: "Bus Ticket RP" }); }
        catch (err) { console.error("Partial reward error:", err); }
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
      const orderResponse = await createRazorpayOrder({ fare, uid: uid || "Not Applicable", name: passengers[0]?.name || "Guest", ticketId: state?.ticketId, email: passengers[0]?.email || "Not Applicable" });
      if (!orderResponse) { alert("Failed to create Razorpay order"); return; }
      const order = orderResponse.order;
      const options = {
        key: "rzp_live_wyxyLDS9NPZCPy", amount: order.amount, currency: order.currency, order_id: order.id,
        name: "Bus Ticket Booking", description: "Ticket Payment",
        prefill: { name: passengers[0]?.name, email: passengers[0]?.email, contact: String(uid) },
        theme: { color: "#fd561e" },
        handler: async function (response) {
          const verifyData = await verifyRazorpayPayment({ razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature });
          if (!verifyData) { navigate("/payment-status", { state: { status: "failed", payment: { code: "VERIFY_FAILED", description: "Payment verification failed", reason: "Server verification error" } } }); return; }
          const isSuccess = verifyData?.success === true || verifyData?.status === "success";
          navigate("/payment-status", { state: { status: isSuccess ? "success" : "failed", paymentData: verifyData, payment: verifyData, passengers, seats: state?.seats, fromCity: state?.fromCity, toCity: state?.toCity, date: state?.date, totalFare: fare, ticketId: state?.ticketId } });
        },
        modal: { ondismiss: function () { navigate("/payment-status", { state: { status: "cancelled" } }); } }
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (r) { navigate("/payment-status", { state: { status: "failed", payment: { code: "PAYMENT_ERROR", description: "Something went wrong", reason: r.error.message } } }); });
      rzp.open();
    } catch (error) { navigate("/payment-status", { state: { status: "failed", payment: { code: "PAYMENT_ERROR", description: "Something went wrong", reason: error.message } } }); }
  };

  const handleBillDeskClick = async (fareToCharge) => {
    const fare = fareToCharge ?? discountedFare;
    try {
      const response = await createBillDeskOrder({ fare, uid: uid || "NA", pname: passengers[0]?.name || "Guest", tickid: state?.ticketId });
      if (!response || !response.success) { alert("BillDesk order creation failed"); return; }
      if (!response.authToken) { alert("Auth Token missing"); return; }
      window.location.href = `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=HYDBOBROS&bdorderid=${response.bdorderid}&authToken=${encodeURIComponent(response.authToken)}`;
    } catch (error) { navigate("/payment-status", { state: { status: "failed", payment: { description: "BillDesk payment error", reason: error.message } } }); }
  };

  return (
    <div style={{ minHeight: "100vh",  background: "#f4f6f9", fontFamily: "'Segoe UI', sans-serif",marginTop: "100px" }}>

      {/* TOP STICKY HEADER */}
      <div style={{  top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 17, fontWeight: "700", color: "#1a1a2e" }}>
          Pay <span style={{ color: "#fd561e" }}>₹{typeof discountedFare === "number" ? discountedFare.toFixed(2) : discountedFare}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#fd561e", fontWeight: "700", fontSize: 15 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fd561e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {timerStr}
        </div>
      </div>

      {/* TRUST BADGES */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "10px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 32, alignItems: "center" }}>
          {[["🔒", "Secure Payment"], ["⚡", "Fast Confirmation"], ["✅", "Trusted Booking"]].map(([icon, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666" }}>
              <span style={{ fontSize: 14 }}>{icon}</span>{label}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

        {/* ── LEFT COLUMN: Payment / Guest UI ── */}
        <div>

          {/* Promo Code (logged in only) */}
          {!isGuest && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", padding: "16px 20px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span>🏷️</span> Have a coupon code?
              </div>
              {promoApplied ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "12px 16px" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700", fontSize: 14 }}>"{promoCode}" — ₹{promoDiscount} off applied!</span>
                  <button onClick={handleRemovePromo} style={{ background: "none", border: "none", color: "#dc2626", fontWeight: "700", fontSize: 13, cursor: "pointer" }}>Remove</button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input type="text" value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoError(""); }} placeholder="Enter promo code"
                      style={{ flex: 1, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "11px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = "#fd561e"} onBlur={e => e.target.style.borderColor = "#e0e0e0"} />
                    <button onClick={handleApplyPromo} style={{ background: "#fd561e", color: "white", border: "none", borderRadius: 8, padding: "11px 22px", fontSize: 14, fontWeight: "700", cursor: "pointer" }}>Apply</button>
                  </div>
                  {promoError && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{promoError}</div>}
                </>
              )}
            </div>
          )}

          {/* Reward Points info (logged in only) */}
          {!isGuest && rewardpoint > 0 && !promoApplied && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "14px 18px", marginBottom: 16, fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
              🎉 You'll earn <strong>{rewardpoint} Reward Points</strong> on this booking.
              {availableRewardPoint > 0 && (
                <div style={{ marginTop: 6, color: canPayFullWithRewards ? "#16a34a" : "#555", fontWeight: "600" }}>
                  {canPayFullWithRewards
                    ? `✅ Your ₹${availableRewardPoint} reward balance covers the full fare!`
                    : `₹${availableRewardPoint} reward balance will be deducted. Remaining ₹${remainingAfterRewards} via gateway.`}
                </div>
              )}
            </div>
          )}

          {/* Payment Method Selection */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", padding: "20px", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: "700", color: "#1a1a2e", marginBottom: 16 }}>Payment Method</div>

            {/* Razorpay option */}
            <div onClick={() => handleGatewaySelect("razorpay")} style={{ border: "1.5px solid #e8e8e8", borderRadius: 10, padding: "16px 18px", marginBottom: 12, cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#fd561e"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e8e8e8"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: 14, color: "#1a1a2e", marginBottom: 3 }}>💳 RazorPay</div>
                  <div style={{ fontSize: 12, color: "#888" }}>UPI · Cards · Net Banking · Wallets</div>
                </div>
                <span style={{ color: "#aaa", fontSize: 18 }}>›</span>
              </div>
            </div>

            {/* BillDesk option */}
            <div onClick={() => handleGatewaySelect("billdesk")} style={{ border: "1.5px solid #e8e8e8", borderRadius: 10, padding: "16px 18px", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#fd561e"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e8e8e8"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: 14, color: "#1a1a2e", marginBottom: 3 }}>🏦 BillDesk</div>
                  <div style={{ fontSize: 12, color: "#888" }}>Net Banking · Debit Cards</div>
                </div>
                <span style={{ color: "#aaa", fontSize: 18 }}>›</span>
              </div>
            </div>
          </div>

          {/* Guest UI */}
          {isGuest && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: "700", color: "#1a1a2e", marginBottom: 6 }}>You are booking as a guest.</div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 16, lineHeight: 1.6 }}>Sign up with BOBROS to avail great discounts and earn reward points.</div>
              <button onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: "signup" }))}
                style={{ background: "#fd561e", color: "white", border: "none", borderRadius: 8, padding: "11px 32px", fontSize: 14, fontWeight: "700", cursor: "pointer", marginRight: 10, boxShadow: "0 3px 10px rgba(253,86,30,0.3)" }}>
                Sign Up
              </button>
              <span style={{ fontSize: 13, color: "#666" }}>
                Already registered?{" "}
                <span onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: "signin" }))} style={{ color: "#2563eb", fontWeight: "700", cursor: "pointer" }}>Sign In</span>
              </span>
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN: Trip Summary ── */}
        <div style={{ position: "sticky", top: 80 }}>

          {/* Fare Breakup */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", padding: "20px", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: "700", color: "#1a1a2e", marginBottom: 14 }}>Fare Breakup</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: "#555" }}>
              <span>Base Fare ({passengers.length} seat{passengers.length > 1 ? "s" : ""})</span>
              <span style={{ fontWeight: "600", color: "#1a1a2e" }}>₹{totalFare}</span>
            </div>
            {promoApplied && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: "#16a34a" }}>
                <span>Promo Discount ({promoCode})</span>
                <span style={{ fontWeight: "600" }}>− ₹{promoDiscount}</span>
              </div>
            )}
            {!isGuest && availableRewardPoint > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: "#16a34a" }}>
                <span>Reward Balance</span>
                <span style={{ fontWeight: "600" }}>− ₹{Math.min(availableRewardPoint, discountedFare).toFixed(2)}</span>
              </div>
            )}
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: "800", color: "#1a1a2e" }}>
              <span>Total</span>
              <span style={{ color: "#fd561e" }}>
                ₹{!isGuest && availableRewardPoint > 0 ? remainingAfterRewards : (typeof discountedFare === "number" ? discountedFare.toFixed(2) : discountedFare)}
              </span>
            </div>
          </div>

          {/* Trip Info */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", padding: "20px", marginBottom: 16 }}>
            <div style={{ fontSize: 17, fontWeight: "800", color: "#1a1a2e", marginBottom: 4 }}>
              {state?.fromCity} <span style={{ color: "#fd561e" }}>→</span> {state?.toCity}
            </div>
            {state?.operator && <div style={{ fontSize: 13, color: "#888", marginBottom: 2 }}>{state.operator}</div>}
            {state?.busType && <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>{state.busType}</div>}
            <div style={{ fontSize: 13, color: "#555", marginBottom: 2 }}>📅 {state?.date}</div>
            <div style={{ fontSize: 13, color: "#555" }}>🎫 Ref: <strong>{state?.ticketId}</strong></div>
          </div>

          {/* Passenger Details */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", padding: "20px" }}>
            <div style={{ fontSize: 14, fontWeight: "700", color: "#1a1a2e", marginBottom: 12 }}>Passengers</div>
            {passengers.map((p, i) => (
              <div key={i} style={{ marginBottom: i < passengers.length - 1 ? 12 : 0, paddingBottom: i < passengers.length - 1 ? 12 : 0, borderBottom: i < passengers.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[["Name", p.name], ["Seat", p.seatName || p.seat], ["Age", p.age], ["Gender", p.gender]].map(([lbl, v]) => (
                    <div key={lbl}>
                      <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", fontWeight: "700", marginBottom: 2 }}>{lbl}</div>
                      <div style={{ fontSize: 13, fontWeight: "700", color: lbl === "Seat" ? "#fd561e" : "#1a1a2e" }}>{v || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* Contact info */}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f5f5f5" }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>Booking details will be sent to:</div>
              {(passengers[0]?.mobile || state?.mobile) && (
                <div style={{ fontSize: 13, color: "#444", marginBottom: 3 }}>📞 +91 {passengers[0]?.mobile || state?.mobile}</div>
              )}
              {(passengers[0]?.email || state?.email || user?.uemail) && (
                <div style={{ fontSize: 13, color: "#444" }}>✉️ {passengers[0]?.email || state?.email || user?.uemail}</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* REWARD CONFIRMATION POPUP */}
      {showRewardConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 16 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "26px 22px", width: "100%", maxWidth: 380 }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>💰</div>
              <h2 style={{ fontSize: 17, fontWeight: "800", color: "#1a1a2e", margin: 0 }}>Reward Points Summary</h2>
            </div>
            <div style={{ background: "#f8f9ff", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
              {[["Your Reward Balance", `₹${availableRewardPoint}`, "#fd561e"], ["Total Fare", `₹${discountedFare}`, "#1a1a2e"]].map(([lbl, v, c]) => (
                <div key={lbl} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#666" }}>{lbl}</span>
                  <span style={{ fontSize: 14, fontWeight: "800", color: c }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #e8eaf6", paddingTop: 10, marginTop: 4 }}>
                {canPayFullWithRewards ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: "700", color: "#16a34a" }}>✅ Full fare covered by rewards!</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 3 }}>No extra payment needed.</div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#666" }}>Rewards Deducted</span>
                      <span style={{ fontSize: 13, fontWeight: "700", color: "#16a34a" }}>− ₹{availableRewardPoint}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", background: "#fff5f2", borderRadius: 8, padding: "8px 10px" }}>
                      <span style={{ fontSize: 13, fontWeight: "600", color: "#666" }}>Pay via {pendingGateway === "razorpay" ? "RazorPay" : "BillDesk"}</span>
                      <span style={{ fontSize: 16, fontWeight: "800", color: "#fd561e" }}>₹{remainingAfterRewards}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", marginBottom: 16, lineHeight: 1.5 }}>
              {canPayFullWithRewards ? "Tap Confirm to complete your booking using reward points only." : `₹${availableRewardPoint} deducted from rewards. Remaining ₹${remainingAfterRewards} via ${pendingGateway === "razorpay" ? "RazorPay" : "BillDesk"}.`}
            </p>
            <button onClick={handleRewardConfirmProceed} style={{ width: "100%", background: "linear-gradient(135deg, #fd561e, #ff8c42)", color: "white", border: "none", borderRadius: 12, padding: 15, fontSize: 15, fontWeight: "700", cursor: "pointer", marginBottom: 10, boxShadow: "0 4px 12px rgba(253,86,30,0.3)" }}>
              {canPayFullWithRewards ? "✅ Confirm & Book" : `Proceed → Pay ₹${remainingAfterRewards}`}
            </button>
            <button onClick={() => setShowRewardConfirm(false)} style={{ width: "100%", background: "none", border: "none", color: "#aaa", fontSize: 14, cursor: "pointer", padding: 6 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* PROMO POPUP */}
      {promoPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 24 }}>
          <div style={{ background: "white", borderRadius: 16, padding: "28px 24px 20px", width: "100%", maxWidth: 320, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontSize: 20, fontWeight: "700", color: "#1a1a2e", marginBottom: 12 }}>Promo Applied</h3>
            <p style={{ fontSize: 15, color: "#444", lineHeight: 1.6, marginBottom: 24 }}>Offer applied successfully! ₹{promoPopup.discount} discount has been applied.</p>
            <div style={{ textAlign: "right" }}>
              <button onClick={() => setPromoPopup(null)} style={{ background: "none", border: "none", color: "#6366f1", fontWeight: "700", fontSize: 15, cursor: "pointer" }}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "36px 28px", width: 300, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: "800", color: "#1a1a2e", marginBottom: 8 }}>Booking Successful!</h2>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>Your ticket has been booked using reward points.</p>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>Redirecting...</p>
          </div>
        </div>
      )}

      {/* BACK CONFIRM POPUP */}
      {showBackConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "16px", width: "320px", textAlign: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "10px" }}>⚠️ Go Back?</h3>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>If you go back, your selected seats may be lost.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleBackCancel} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", cursor: "pointer" }}>Stay</button>
              <button onClick={handleBackConfirm} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "#fd561e", color: "white", border: "none", cursor: "pointer" }}>Go Back</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingSuccess;