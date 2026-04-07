// src/modules/bus/pages/BookingSuccess.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { createRazorpayOrder, verifyRazorpayPayment } from "../services/razorpayService";
import { createBillDeskOrder } from "../services/billdeskService";
import { useEffect, useState, useRef } from "react";
import { getUserDetails } from "../../../utils/authHelper";
import axios from "axios";

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const savedState = useRef(state);

  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoPopup, setPromoPopup] = useState(null);
  const [showRewardConfirm, setShowRewardConfirm] = useState(false);
  const [pendingGateway, setPendingGateway] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(480);

  const BLOCK_DURATION = 480;
  const user = getUserDetails();
  const isGuest = !user?.uid || user?.uid === "Not Applicable";

  useEffect(() => {
    if (!state) navigate("/", { replace: true });
  }, []);

  const totalFare = state?.totalFare || 0;
  const uid = user?.uid || state?.uid;
  const rewardpoint = parseFloat(state?.rewardpoint) || 0;
  const availableRewardPoint = parseFloat(state?.availableRewardPoint) || 0;
  const passengers = state?.passengers || [];
  const discountedFare = promoApplied ? totalFare - promoDiscount : totalFare;
  const canPayFullWithRewards = availableRewardPoint >= discountedFare;
  const remainingAfterRewards = Math.max(0, discountedFare - availableRewardPoint).toFixed(2);

  // Timer
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
        navigate("/");
      }
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Intercept back button
  useEffect(() => {
    window.history.pushState({ bookingState: true }, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState({ bookingState: true }, "", window.location.href);
      setShowBackConfirm(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const timerStr = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`;

  // Save navigation state
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

  const handleBackConfirm = () => {
    setShowBackConfirm(false);
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

  const handleBackCancel = () => setShowBackConfirm(false);

  // Apply Promo
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
            navigate("/payment-status", { state: { status: "failed", payment: { code: "VERIFY_FAILED", description: "Payment verification failed" } } });
            return;
          }
          const isSuccess = verifyData?.success === true || verifyData?.status === "success";
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
        modal: { ondismiss: function () { navigate("/payment-status", { state: { status: "cancelled" } }); } }
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (r) {
        navigate("/payment-status", { state: { status: "failed", payment: { code: "PAYMENT_ERROR", reason: r.error.message } } });
      });
      rzp.open();
    } catch (error) {
      navigate("/payment-status", { state: { status: "failed", payment: { code: "PAYMENT_ERROR", reason: error.message } } });
    }
  };

  const handleBillDeskClick = async (fareToCharge) => {
    const fare = fareToCharge ?? discountedFare;
    try {
      const response = await createBillDeskOrder({
        fare,
        uid: uid || "NA",
        pname: passengers[0]?.name || "Guest",
        tickid: state?.ticketId
      });
      if (!response || !response.success || !response.authToken) { alert("BillDesk order creation failed"); return; }
      window.location.href = `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=HYDBOBROS&bdorderid=${response.bdorderid}&authToken=${encodeURIComponent(response.authToken)}`;
    } catch (error) {
      navigate("/payment-status", { state: { status: "failed", payment: { description: "BillDesk payment error", reason: error.message } } });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", fontFamily: "'Segoe UI', sans-serif", paddingTop: "90px" }}>

      {/* TOP STICKY HEADER */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a2e" }}>
          Pay <span style={{ color: "#fd561e" }}>₹{typeof discountedFare === "number" ? discountedFare.toFixed(2) : discountedFare}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fd561e", fontWeight: "700", fontSize: "14px" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", alignItems: "start" }} className="md:grid-cols-[1fr_380px]">

          {/* LEFT COLUMN */}
          <div>
            {/* Promo Code */}
            {!isGuest && (
              <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", padding: "16px", marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🏷️</span> Have a coupon code?
                </div>
                {promoApplied ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "10px 12px" }}>
                    <span style={{ color: "#16a34a", fontWeight: "700", fontSize: "13px" }}>"{promoCode}" — ₹{promoDiscount} off applied!</span>
                    <button onClick={handleRemovePromo} style={{ background: "none", border: "none", color: "#dc2626", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>Remove</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value); setPromoError(""); }}
                      placeholder="Enter promo code"
                      style={{ flex: "1", minWidth: "160px", border: "1.5px solid #e0e0e0", borderRadius: "8px", padding: "11px 12px", fontSize: "13.5px", outline: "none" }}
                      onFocus={e => e.target.style.borderColor = "#fd561e"}
                      onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                    />
                    <button onClick={handleApplyPromo} style={{ background: "#fd561e", color: "white", border: "none", borderRadius: "8px", padding: "11px 24px", fontSize: "13.5px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}>Apply</button>
                  </div>
                )}
                {promoError && <div style={{ color: "#dc2626", fontSize: "11.5px", marginTop: "6px" }}>{promoError}</div>}
              </div>
            )}

            {/* Reward Points Info */}
            {!isGuest && rewardpoint > 0 && !promoApplied && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "14px", marginBottom: "16px", fontSize: "12.5px", color: "#92400e", lineHeight: "1.5" }}>
                🎉 You'll earn <strong>{rewardpoint} Reward Points</strong> on this booking.
                {availableRewardPoint > 0 && (
                  <div style={{ marginTop: "8px", color: canPayFullWithRewards ? "#16a34a" : "#555", fontWeight: "600", fontSize: "12px" }}>
                    {canPayFullWithRewards
                      ? `✅ Your ₹${availableRewardPoint} reward balance covers the full fare!`
                      : `₹${availableRewardPoint} reward balance will be deducted. Remaining ₹${remainingAfterRewards} via gateway.`}
                  </div>
                )}
              </div>
            )}

            {/* Payment Methods */}
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", padding: "16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "14.5px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" }}>Payment Method</div>
              <div onClick={() => handleGatewaySelect("razorpay")} style={{ border: "1.5px solid #e8e8e8", borderRadius: "10px", padding: "14px", marginBottom: "10px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#fd561e"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e8e8e8"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "13.5px", color: "#1a1a2e" }}>💳 RazorPay</div>
                    <div style={{ fontSize: "11.5px", color: "#666", marginTop: "2px" }}>UPI · Cards · Net Banking · Wallets</div>
                  </div>
                  <span style={{ color: "#aaa", fontSize: "18px" }}>›</span>
                </div>
              </div>
              <div onClick={() => handleGatewaySelect("billdesk")} style={{ border: "1.5px solid #e8e8e8", borderRadius: "10px", padding: "14px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#fd561e"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e8e8e8"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "13.5px", color: "#1a1a2e" }}>🏦 BillDesk</div>
                    <div style={{ fontSize: "11.5px", color: "#666", marginTop: "2px" }}>Net Banking · Debit Cards</div>
                  </div>
                  <span style={{ color: "#aaa", fontSize: "18px" }}>›</span>
                </div>
              </div>
            </div>

            {/* Guest Message */}
            {isGuest && (
              <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "14.5px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" }}>You are booking as a guest.</div>
                <div style={{ fontSize: "12.5px", color: "#666", marginBottom: "16px", lineHeight: "1.5" }}>Sign up with BOBROS to avail great discounts and earn reward points.</div>
                <button onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: "signup" }))}
                  style={{ background: "#fd561e", color: "white", border: "none", borderRadius: "8px", padding: "11px 32px", fontSize: "13.5px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(253,86,30,0.3)" }}>
                  Sign Up
                </button>
                <div style={{ marginTop: "12px", fontSize: "12.5px", color: "#666" }}>
                  Already registered?{" "}
                  <span onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: "signin" }))} style={{ color: "#2563eb", fontWeight: "700", cursor: "pointer" }}>Sign In</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Fare Breakup */}
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", padding: "18px", marginBottom: "16px" }}>
              <div style={{ fontSize: "14.5px", fontWeight: "700", color: "#1a1a2e", marginBottom: "14px" }}>Fare Breakup</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13.5px", color: "#555" }}>
                <span>Base Fare ({passengers.length} seat{passengers.length > 1 ? "s" : ""})</span>
                <span style={{ fontWeight: "600", color: "#1a1a2e" }}>₹{totalFare}</span>
              </div>
              {promoApplied && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13.5px", color: "#16a34a" }}>
                  <span>Promo Discount ({promoCode})</span>
                  <span style={{ fontWeight: "600" }}>− ₹{promoDiscount}</span>
                </div>
              )}
              {!isGuest && availableRewardPoint > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13.5px", color: "#16a34a" }}>
                  <span>Reward Balance</span>
                  <span style={{ fontWeight: "600" }}>− ₹{Math.min(availableRewardPoint, discountedFare).toFixed(2)}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "12px", marginTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "15.5px", fontWeight: "800", color: "#1a1a2e" }}>
                <span>Total</span>
                <span style={{ color: "#fd561e" }}>
                  ₹{!isGuest && availableRewardPoint > 0 ? remainingAfterRewards : (typeof discountedFare === "number" ? discountedFare.toFixed(2) : discountedFare)}
                </span>
              </div>
            </div>

            {/* Trip Info */}
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", padding: "18px", marginBottom: "16px" }}>
              <div style={{ fontSize: "15.5px", fontWeight: "800", color: "#1a1a2e", marginBottom: "6px" }}>
                {state?.fromCity} <span style={{ color: "#fd561e" }}>→</span> {state?.toCity}
              </div>
              {state?.operator && <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>{state.operator}</div>}
              {state?.busType && <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>{state.busType}</div>}
              <div style={{ fontSize: "12.5px", color: "#555" }}>📅 {state?.date}</div>
              <div style={{ fontSize: "12.5px", color: "#555", marginTop: "4px" }}>🎫 Ref: <strong>{state?.ticketId}</strong></div>
            </div>

            {/* Passengers */}
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", padding: "18px" }}>
              <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#1a1a2e", marginBottom: "14px" }}>Passengers</div>
              {passengers.map((p, i) => (
                <div key={i} style={{ marginBottom: i < passengers.length - 1 ? "14px" : "0", paddingBottom: i < passengers.length - 1 ? "14px" : "0", borderBottom: i < passengers.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                    {[["Name", p.name], ["Seat", p.seatName || p.seat], ["Age", p.age], ["Gender", p.gender]].map(([label, value]) => (
                      <div key={label}>
                        <div style={{ fontSize: "9.5px", color: "#999", textTransform: "uppercase", fontWeight: "700", marginBottom: "3px" }}>{label}</div>
                        <div style={{ fontSize: "12.5px", fontWeight: "700", color: label === "Seat" ? "#fd561e" : "#1a1a2e", wordBreak: "break-word" }}>{value || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: "10.5px", color: "#888", marginBottom: "6px" }}>Booking details will be sent to:</div>
                {(passengers[0]?.mobile || state?.mobile) && (
                  <div style={{ fontSize: "12.5px", color: "#333", marginBottom: "3px" }}>📞 +91 {passengers[0]?.mobile || state?.mobile}</div>
                )}
                {(passengers[0]?.email || state?.email || user?.uemail) && (
                  <div style={{ fontSize: "12.5px", color: "#333", wordBreak: "break-word" }}>✉️ {passengers[0]?.email || state?.email || user?.uemail}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REWARD CONFIRMATION POPUP */}
      {showRewardConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "20px", width: "100%", maxWidth: "380px", maxHeight: "90vh", overflowY: "auto" }}>
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
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "300px" }}>
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
          <div style={{ background: "white", borderRadius: "20px", padding: "28px 20px", width: "100%", maxWidth: "300px", textAlign: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "28px" }}>✅</div>
            <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#1a1a2e", marginBottom: "6px" }}>Booking Successful!</h2>
            <p style={{ fontSize: "12px", color: "#666", lineHeight: "1.4" }}>Your ticket has been booked using reward points.</p>
            <p style={{ fontSize: "11px", color: "#aaa", marginTop: "10px" }}>Redirecting...</p>
          </div>
        </div>
      )}

      {/* BACK CONFIRM POPUP */}
      {showBackConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "16px" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "16px", width: "100%", maxWidth: "300px", textAlign: "center" }}>
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