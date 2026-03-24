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
  const [showDetails, setShowDetails]             = useState(false);

  const [timeLeft, setTimeLeft] = useState(480);
  const BLOCK_DURATION = 480;

  const user    = getUserDetails();
  const isGuest = !user?.uid || user?.uid === "Not Applicable";

  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
    }
  }, [state]);

  const totalFare            = state?.totalFare || 0;
  const uid                  = user?.uid || state?.uid;
  const rewardpoint          = parseFloat(state?.rewardpoint) || 0;
  const availableRewardPoint = parseFloat(state?.availableRewardPoint) || 0;
  const passengers           = state?.passengers || [];

  const discountedFare        = promoApplied ? totalFare - promoDiscount : totalFare;
  const canPayFullWithRewards  = availableRewardPoint >= discountedFare;
  const remainingAfterRewards  = Math.max(0, discountedFare - availableRewardPoint).toFixed(2);

  console.log("BookingSuccess state:", {
    totalFare, rewardpoint, availableRewardPoint, uid,
    isGuest, discountedFare, canPayFullWithRewards
  });

  // ── Timer ──
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

  // ── Intercept browser back button ──
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      setShowBackConfirm(true);
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const timerStr = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`;

  // ── FIXED: Go Back → navigate to results page with reopenLayout signal ──
  const handleBackConfirm = () => {
    setShowBackConfirm(false);
    // Navigate to results page — BusResultsPage will see reopenLayout:true and open SeatBookingLayout step 1
    navigate(-1);
    // Fire event so BusResultsPage reopens SeatBookingLayout
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("reopenSeatLayout", {
        detail: { tripId: state?.tripId }
      }));
    }, 100);
  };

  const handleBackCancel = () => setShowBackConfirm(false);

  // ── Apply Promo ──
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) { setPromoError("Please enter a promo code."); return; }
    const offerBody = {
      pmobile:    String(user?.umob || user?.mobile || user?.pmobile || ""),
      uid:        String(uid || ""),
      pemail:     user?.uemail || user?.email || user?.pemail || "",
      blk_ticket: state?.ticketId || "",
      divTotal:   Number(totalFare),
      offerCode:  promoCode.trim().toUpperCase(),
    };
    console.log("Offer API body:", offerBody);
    try {
      const res = await axios.post("/offer/apply", offerBody);
      console.log("Offer API response:", res.data);
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
      console.error("Offer API error:", err.response?.data || err.message);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to apply promo code.";
      setPromoError(msg);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode(""); setPromoApplied(false); setPromoDiscount(0); setPromoError("");
  };

  const handleChoosePayment = () => setShowGatewayPopup(true);

  const handleGatewaySelect = (gateway) => {
    setShowGatewayPopup(false);
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
            blockedTicketId: state?.ticketId, payeeid: String(uid),
            name: passengers[0]?.name || "Guest", email: passengers[0]?.email || "",
            fare: discountedFare, paymentfor: "Bus Ticket RP"
          });
          if (res.data?.success) {
            setShowSuccessPopup(true);
            setTimeout(() => navigate("/payment-status", {
              state: { status: "success", paymentData: res.data, passengers, seats: state?.seats, fromCity: state?.fromCity, toCity: state?.toCity, date: state?.date, totalFare: discountedFare, ticketId: state?.ticketId }
            }), 2000);
            return;
          }
        } catch (err) { console.error("Full reward error:", err); }
      } else {
        try {
          await axios.post("/bookticket/rp", {
            blockedTicketId: state?.ticketId, payeeid: String(uid),
            name: passengers[0]?.name || "Guest", email: passengers[0]?.email || "",
            fare: discountedFare, paymentfor: "Bus Ticket RP"
          });
        } catch (err) { console.error("Partial reward error:", err); }
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
    } catch (error) {
      navigate("/payment-status", { state: { status: "failed", payment: { code: "PAYMENT_ERROR", description: "Something went wrong", reason: error.message } } });
    }
  };

  const handleBillDeskClick = async (fareToCharge) => {
    const fare = fareToCharge ?? discountedFare;
    try {
      const response = await createBillDeskOrder({ fare, uid: uid || "NA", pname: passengers[0]?.name || "Guest", tickid: state?.ticketId });
      if (!response || !response.success) { alert("BillDesk order creation failed"); return; }
      if (!response.authToken) { alert("Auth Token missing"); return; }
      window.location.href = `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=HYDBOBROS&bdorderid=${response.bdorderid}&authToken=${encodeURIComponent(response.authToken)}`;
    } catch (error) {
      navigate("/payment-status", { state: { status: "failed", payment: { description: "BillDesk payment error", reason: error.message } } });
    }
  };

  const ValueBox = ({ value }) => (
    <div style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: 8, padding: "12px 16px", fontSize: 15, color: "#1a1a2e", fontWeight: "600" }}>
      {value}
    </div>
  );

  const OrangeCard = ({ children, bg = "#f5f5f5" }) => (
    <div style={{ borderLeft: "4px solid #fd561e", background: bg, borderRadius: "0 10px 10px 0", padding: "14px 16px", marginBottom: 14 }}>
      {children}
    </div>
  );

  const Divider = () => <div style={{ borderTop: "1px solid #f0f0f0", margin: "14px 0" }} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', sans-serif", paddingTop: 80 }}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "16px 14px 40px" }}>
        <div style={{ background: "white", borderRadius: 18, boxShadow: "0 4px 20px rgba(0,0,0,0.09)", overflow: "hidden" }}>

          {/* ORANGE HEADER */}
          <div style={{ background: "linear-gradient(135deg, #fd561e 0%, #ff8c42 100%)", padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h1 style={{ color: "white", fontSize: 18, fontWeight: "800", margin: 0 }}>Payment Details</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "5px 12px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span style={{ color: "white", fontWeight: "800", fontSize: 14 }}>{timerStr}</span>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
              Ticket blocked. Complete payment within <strong style={{ color: "white" }}>8 minutes</strong>.
            </div>
          </div>

          {/* TRIP INFO */}
          <div style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 20, fontWeight: "800", color: "#1a1a2e", marginBottom: 10 }}>
              {state?.fromCity} <span style={{ color: "#fd561e" }}>→</span> {state?.toCity}
            </div>
            {state?.busType  && <div style={{ fontSize: 14, color: "#555", marginBottom: 3 }}>Bus Type: {state.busType}</div>}
            {state?.operator && <div style={{ fontSize: 14, color: "#555", marginBottom: 3 }}>Operator: {state.operator}</div>}
            <div style={{ fontSize: 14, color: "#555", marginBottom: 3 }}>DOJ: {state?.date}</div>
            <div style={{ fontSize: 14, color: "#555", marginBottom: 10 }}>
              Booking Ref: <strong style={{ color: "#1a1a2e" }}>{state?.ticketId}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
              <div style={{ fontSize: 16, fontWeight: "800", color: "#1a1a2e" }}>
                Total Fare: <span style={{ color: "#fd561e" }}>₹{totalFare}</span>
              </div>
              <button onClick={() => setShowDetails(!showDetails)} style={{ background: "none", border: "none", color: "#2563eb", fontSize: 14, fontWeight: "600", cursor: "pointer" }}>
                Details {showDetails ? "▲" : "›"}
              </button>
            </div>
          </div>

          {/* Collapsible passenger details */}
          {showDetails && (
            <div style={{ borderTop: "1px solid #f5f5f5", padding: "14px 20px", background: "#fafafa" }}>
              <div style={{ fontSize: 11, fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>Passenger Details</div>
              {passengers.map((p, i) => (
                <div key={i} style={{ background: "white", borderRadius: 10, padding: "11px 14px", marginBottom: 8, border: "1px solid #f0f0f0" }}>
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
              <div style={{ background: "#fff8f5", border: "1px solid #ffe4d6", borderRadius: 10, padding: "11px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: "600", color: "#888", marginBottom: 8 }}>Booking details will be sent to:</div>
                {(passengers[0]?.mobile || state?.mobile) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span>📞</span><span style={{ fontSize: 13, fontWeight: "600" }}>+91 {passengers[0]?.mobile || state?.mobile}</span>
                  </div>
                )}
                {(passengers[0]?.email || state?.email || user?.uemail) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>✉️</span><span style={{ fontSize: 13, fontWeight: "600" }}>{passengers[0]?.email || state?.email || user?.uemail}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GUEST UI */}
          {isGuest && (
            <>
              <Divider />
              <div style={{ padding: "16px 20px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: "700", color: "#1a1a2e", marginBottom: 6 }}><strong>You are booking as a guest.</strong></div>
                <div style={{ fontSize: 14, color: "#555", marginBottom: 20, lineHeight: 1.6 }}>Sign up with BOBROS to avail great discounts and earn reward points.</div>
                <button onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: "signup" }))} style={{ background: "#fd561e", color: "white", border: "none", borderRadius: 12, padding: "13px 0", fontSize: 15, fontWeight: "700", cursor: "pointer", width: "65%", display: "block", margin: "0 auto 12px", boxShadow: "0 4px 12px rgba(253,86,30,0.3)" }}>Sign Up</button>
                <div style={{ fontSize: 14, color: "#555" }}>Already registered?{" "}<span onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: "signin" }))} style={{ color: "#2563eb", fontWeight: "700", cursor: "pointer" }}>Sign In</span></div>
              </div>
            </>
          )}

          {/* LOGGED IN UI */}
          {!isGuest && (
            <div style={{ padding: "0 20px 20px" }}>
              {rewardpoint > 0 && !promoApplied && (
                <div style={{ borderLeft: "4px solid #fd561e", background: "#f0fdf4", borderRadius: "0 10px 10px 0", padding: "12px 14px", marginBottom: 14, fontSize: 14, color: "#333", lineHeight: 1.65 }}>
                  Congratulations! You are eligible for earning <strong>{rewardpoint} Reward Points</strong> on this Booking. You can use this Reward Balance for future bookings. <strong>Note: Promo codes disable reward point earnings for that booking.</strong>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginBottom: promoError ? 6 : 14 }}>
                {promoApplied ? (
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: "13px 16px" }}>
                    <span style={{ color: "#16a34a", fontWeight: "700", fontSize: 14 }}>🏷️ "{promoCode}" — ₹{promoDiscount} off</span>
                    <button onClick={handleRemovePromo} style={{ background: "none", border: "none", color: "#dc2626", fontWeight: "700", fontSize: 13, cursor: "pointer" }}>Remove</button>
                  </div>
                ) : (
                  <>
                    <input type="text" value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoError(""); }} placeholder="Add Promo Code"
                      style={{ flex: 1, border: "1.5px solid #e0e0e0", borderRadius: 12, padding: "14px 16px", fontSize: 15, outline: "none", background: "white", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = "#fd561e"} onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                    />
                    <button onClick={handleApplyPromo} style={{ background: "#fd561e", color: "white", border: "none", borderRadius: 30, padding: "14px 24px", fontSize: 15, fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(253,86,30,0.3)", whiteSpace: "nowrap" }}>Apply</button>
                  </>
                )}
              </div>
              {promoError && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 14, paddingLeft: 4 }}>{promoError}</div>}

              <div style={{ borderLeft: "4px solid #fd561e", background: "#f5f5f5", borderRadius: "0 10px 10px 0", padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2.5px solid #2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563eb" }} />
                  </div>
                  <span style={{ fontSize: 14, color: "#333", fontWeight: "500" }}>Pay from your User Account (Rewards + Online Payment)</span>
                </div>
              </div>

              <div style={{ borderLeft: "4px solid #fd561e", background: "#e8f0fe", borderRadius: "0 10px 10px 0", padding: "14px 16px", marginBottom: 14 }}>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 6 }}>Total Fare to be Paid (after promo discount if any):</div>
                  <ValueBox value={typeof discountedFare === "number" ? discountedFare.toFixed(2) : String(discountedFare)} />
                </div>
                <div style={{ marginBottom: availableRewardPoint > 0 ? 14 : 0 }}>
                  <div style={{ fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 6 }}>Reward Earnings for Current Booking</div>
                  <ValueBox value={promoApplied ? "0.00" : (typeof rewardpoint === "number" ? rewardpoint.toFixed(2) : String(rewardpoint || 0))} />
                  {promoApplied && <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>Promo codes disable reward point earnings.</div>}
                </div>
                {availableRewardPoint > 0 && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 6 }}>Your Reward Balance Eligible to use</div>
                    <ValueBox value={String(availableRewardPoint)} />
                    <div style={{ fontSize: 12, color: canPayFullWithRewards ? "#16a34a" : "#555", marginTop: 6, fontWeight: "500" }}>
                      {canPayFullWithRewards ? "✅ Your reward balance covers the full fare! No extra charge." : `₹${availableRewardPoint} will be deducted. Remaining ₹${remainingAfterRewards} via gateway.`}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleChoosePayment} style={{ width: "100%", background: "#fd561e", color: "white", border: "none", borderRadius: 30, padding: "16px", fontSize: 16, fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(253,86,30,0.35)" }}>
                Choose Payment Method
              </button>
            </div>
          )}

          {isGuest && (
            <div style={{ padding: "0 20px 20px" }}>
              <button onClick={handleChoosePayment} style={{ width: "100%", background: "#fd561e", color: "white", border: "none", borderRadius: 30, padding: "16px", fontSize: 16, fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(253,86,30,0.35)" }}>
                Choose Payment Method
              </button>
            </div>
          )}

        </div>
      </div>

      {/* GATEWAY PICKER POPUP */}
      {showGatewayPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 16 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "26px 22px", width: "100%", maxWidth: 360 }}>
            <h2 style={{ fontSize: 17, fontWeight: "800", color: "#1a1a2e", textAlign: "center", marginBottom: 6 }}>Choose Payment Method</h2>
            <p style={{ fontSize: 13, color: "#888", textAlign: "center", marginBottom: 20 }}>
              Amount to pay: <strong style={{ color: "#fd561e" }}>
                {!isGuest && canPayFullWithRewards ? "₹0 (Full Rewards)" : `₹${!isGuest && availableRewardPoint > 0 ? remainingAfterRewards : (typeof discountedFare === "number" ? discountedFare.toFixed(2) : discountedFare)}`}
              </strong>
            </p>
            <button onClick={() => handleGatewaySelect("razorpay")}
              onMouseEnter={e => { e.currentTarget.style.background = "#fd561e"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#fd561e"; }}
              style={{ width: "100%", marginBottom: 12, background: "white", color: "#fd561e", border: "2px solid #fd561e", borderRadius: 14, padding: "16px 18px", fontSize: 15, fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "background 0.2s, color 0.2s" }}>
              <span style={{ fontSize: 24 }}>💳</span>
              <div style={{ textAlign: "left" }}><div>RazorPay</div><div style={{ fontSize: 11, fontWeight: "400", opacity: 0.7 }}>Cards · UPI · Net Banking · Wallets</div></div>
              <span style={{ marginLeft: "auto", fontSize: 18, opacity: 0.7 }}>›</span>
            </button>
            <button onClick={() => handleGatewaySelect("billdesk")}
              onMouseEnter={e => { e.currentTarget.style.background = "#fd561e"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#fd561e"; }}
              style={{ width: "100%", marginBottom: 16, background: "white", color: "#fd561e", border: "2px solid #fd561e", borderRadius: 14, padding: "16px 18px", fontSize: 15, fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "background 0.2s, color 0.2s" }}>
              <span style={{ fontSize: 24 }}>🏦</span>
              <div style={{ textAlign: "left" }}><div>BillDesk</div><div style={{ fontSize: 11, fontWeight: "400", opacity: 0.7 }}>Net Banking · Debit Cards</div></div>
              <span style={{ marginLeft: "auto", fontSize: 18, opacity: 0.4 }}>›</span>
            </button>
            <button onClick={() => setShowGatewayPopup(false)} style={{ width: "100%", background: "none", border: "none", color: "#aaa", fontSize: 14, cursor: "pointer", padding: 6 }}>Cancel</button>
          </div>
        </div>
      )}

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
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
              If you go back, your selected seats may be lost.
            </p>
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