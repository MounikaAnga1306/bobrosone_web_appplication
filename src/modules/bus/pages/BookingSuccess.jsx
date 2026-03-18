import { useLocation, useNavigate } from "react-router-dom";
import { createRazorpayOrder, verifyRazorpayPayment } from "../services/razorpayService";
import { createBillDeskOrder } from "../services/billdeskService";
import { useEffect, useState } from "react";
import { getUserDetails } from "../../../utils/authHelper";
import axios from "axios";

const BookingSuccess = () => {

  const { state } = useLocation();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [timeLeft, setTimeLeft] = useState(480);
  const BLOCK_DURATION = 480;

  const user = getUserDetails();

  if (!state) {
    navigate("/");
    return null;
  }

  const totalFare = state?.totalFare || 0;
  const uid = user?.uid || state?.uid;

 
  const rewardpoint = parseFloat(state?.rewardpoint) || 0;          
  const availableRewardPoint = parseFloat(state?.availableRewardPoint) || 0; 

  const discountedFare = promoApplied ? totalFare - promoDiscount : totalFare;
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Reward points logic
  const canPayFullWithRewards = availableRewardPoint >= discountedFare;
  const remainingAfterRewards = Math.max(0, discountedFare - availableRewardPoint).toFixed(2);

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

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code.");
      return;
    }
    // TODO: API integrate later
    setPromoError("Invalid promo code. Please try again.");
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoError("");
  };

  const handlePaymentClick = (gateway) => {
    setSelectedGateway(gateway);
    setShowPaymentPopup(true);
  };

  const handlePopupConfirm = async (useRewards) => {
    setShowPaymentPopup(false);
    if (useRewards && canPayFullWithRewards) {
  try {
    const body = {
      blockedTicketId: state?.ticketId,
      payeeid: String(uid),
      name: state?.passengers?.[0]?.name || "Guest",
      email: state?.passengers?.[0]?.email || "",
      fare: discountedFare,
      paymentfor: "Bus Ticket RP"
    };

    console.log("Full Reward Payment Body:", body);

    const res = await axios.post("/bookticket/rp", body);

    if (res.data?.success) {
       setShowSuccessPopup(true);
       setTimeout(() =>{
      navigate("/payment-status", {
        state: {
          status: "success",
          paymentData: res.data,
          passengers: state?.passengers,
          seats: state?.seats,
          fromCity: state?.fromCity,
          toCity: state?.toCity,
          date: state?.date,
          totalFare: discountedFare,
          ticketId: state?.ticketId
        }
      });
    },2000);
      return; // 🟢 STOP HERE — gateway ki vellakudadhu
    }

  } catch (err) {
    console.error("Full reward payment error:", err);
  }
}

    if (useRewards && availableRewardPoint > 0 && !canPayFullWithRewards) {
      try {
        const body = {
          blockedTicketId: state?.ticketId,
          payeeid: String(uid),
          name: state?.passengers?.[0]?.name || "Guest",
          email: state?.passengers?.[0]?.email || "",
          fare: discountedFare,
          paymentfor: "Bus Ticket RP"
        };
        console.log("Reward Points Payment Body:", body);
        const res = await axios.post("/bookticket/rp", body);

        if (res.data?.success) {
          navigate("/payment-status", {
            state: {
              status: "success",
              paymentData: res.data,
              passengers: state?.passengers,
              seats: state?.seats,
              fromCity: state?.fromCity,
              toCity: state?.toCity,
              date: state?.date,
              totalFare: discountedFare,
              ticketId: state?.ticketId
            }
          });
          return;
        }

        // Insufficient balance — fall through to gateway with remaining amount
        if (res.data?.message?.includes("Insufficient")) {
          alert(`Insufficient reward balance. Proceeding with ₹${remainingAfterRewards} via ${selectedGateway === "razorpay" ? "RazorPay" : "BillDesk"}.`);
        }
      } catch (err) {
        console.error("Reward payment error:", err);
      }
    }

    // Normal gateway payment — with remaining fare after rewards cut
    const fareToCharge = useRewards && availableRewardPoint > 0
      ? parseFloat(remainingAfterRewards)
      : discountedFare;

    if (selectedGateway === "razorpay") {
      await handleRazorPayClick(fareToCharge);
    } else {
      await handleBillDeskClick(fareToCharge);
    }
  };

  const handleRazorPayClick = async (fareToCharge) => {
    const fare = fareToCharge ?? discountedFare;
    try {
      const orderResponse = await createRazorpayOrder({
        fare: fare,
        uid: uid || "Not Applicable",
        name: state?.passengers?.[0]?.name || "Guest",
        ticketId: state?.ticketId,
        email: state?.passengers?.[0]?.email || "Not Applicable",
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
        prefill: {
          name: state?.passengers?.[0]?.name,
          email: state?.passengers?.[0]?.email,
          contact: String(uid),
        },
        theme: { color: "#fd561e" },
        handler: async function (response) {
          const verifyData = await verifyRazorpayPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
          if (!verifyData) {
            navigate("/payment-status", { state: { status: "failed", payment: { code: "VERIFY_FAILED", description: "Payment verification failed", reason: "Server verification error" } } });
            return;
          }
          const isSuccess = verifyData?.success === true || verifyData?.status === "success";
          navigate("/payment-status", {
            state: {
              status: isSuccess ? "success" : "failed",
              paymentData: verifyData,
              payment: verifyData,
              passengers: state?.passengers,
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
      rzp.on("payment.failed", function (response) {
        navigate("/payment-status", { state: { status: "failed", payment: { code: "PAYMENT_ERROR", description: "Something went wrong", reason: response.error.message } } });
      });
      rzp.open();
    } catch (error) {
      navigate("/payment-status", { state: { status: "failed", payment: { code: "PAYMENT_ERROR", description: "Something went wrong", reason: error.message } } });
    }
  };

  const handleBillDeskClick = async (fareToCharge) => {
    const fare = fareToCharge ?? discountedFare;
    try {
      const response = await createBillDeskOrder({
        fare: fare,
        uid: uid || "NA",
        pname: state?.passengers?.[0]?.name || "Guest",
        tickid: state?.ticketId,
      });
      if (!response || !response.success) { alert("BillDesk order creation failed"); return; }
      const merchantId = "HYDBOBROS";
      const bdOrderId = response.bdorderid;
      const authToken = response.authToken;
      if (!authToken) { alert("Auth Token missing"); return; }
      window.location.href = `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=${merchantId}&bdorderid=${bdOrderId}&authToken=${encodeURIComponent(authToken)}`;
    } catch (error) {
      navigate("/payment-status", { state: { status: "failed", payment: { description: "BillDesk payment error", reason: error.message } } });
    }
  };

  return (
    <div className="min-h-screen mt-20 bg-gray-200 flex justify-center p-6">
      <div className="w-[700px]">
        <div className="bg-white rounded-xl shadow-md p-8">

         {/* ── HEADER ROW ── */}
<div className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-semibold text-[#fd561e] flex-1 text-center">
    Ticket Payment Confirmation
  </h1>

  {/* ← Timer right side కి */}
  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
    <span className="text-red-600 font-bold text-sm">
      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
    </span>
  </div>
</div>

          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded mb-4">
            Ticket is tentatively Blocked for you, please complete your payment within next <b>8 Minutes</b>.
          </div>


          <p className="mb-4 text-lg">
            <span className="font-semibold">Temporary Booking Reference:</span> {state?.ticketId}
          </p>

          {/* ── PROMO CODE ── */}
          <div className="border rounded-lg p-4 mb-4 bg-gray-50">
            <p className="font-semibold mb-2">Promo Code</p>
            {promoApplied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded px-3 py-2">
                <span className="text-green-700 font-medium">
                  "{promoCode}" applied — ₹{promoDiscount} off
                </span>
                <button onClick={handleRemovePromo} className="text-red-500 text-sm underline cursor-pointer ml-4">
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); }}
                    placeholder="Enter promo code"
                    className="flex-1 border rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-[#fd561e] text-white px-4 py-2 rounded text-sm cursor-pointer hover:bg-[#e14d1a]"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-red-500 text-sm mt-1">{promoError}</p>}
                <p className="text-xs text-gray-400 mt-1">Note: Promo codes disable reward point earnings for that booking.</p>
              </>
            )}
          </div>

          {/* ── FARE BREAKDOWN ── */}
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between text-lg mb-1">
              <span>Total Fare</span>
              <span>₹{totalFare}</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-green-600 mb-1">
                <span>Promo Discount</span>
                <span>- ₹{promoDiscount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-1">
              <span>After Promo Discount</span>
              <span>₹{discountedFare}</span>
            </div>
          </div>

          {/* ── REWARD EARNINGS THIS BOOKING ── */}
          {!promoApplied && rewardpoint > 0 && (
            <div className="bg-green-50 border-l-4 border-[#fd561e] p-4 rounded mb-4">
              <p className="font-semibold text-gray-800 mb-1">
                🎉 Congratulations! You are eligible for earning{" "}
                <span className="text-[#fd561e]">₹{rewardpoint} Reward Points (4%)</span> on this Booking.
              </p>
              <p className="text-sm text-gray-600">
                You can use this Reward Balance for future bookings.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Note: Promo codes disable reward point earnings for that booking.
              </p>
            </div>
          )}

          {/* ── WALLET BALANCE (availableRewardPoint) ── */}
          {availableRewardPoint > 0 && (
            <div className="border rounded-lg p-4 mb-6 bg-blue-50">
              <p className="font-semibold text-gray-700 mb-1">Your Reward Balance Eligible to Use</p>
              <p className="text-2xl font-bold text-[#fd561e]">₹{availableRewardPoint}</p>
              <p className="text-sm text-gray-500 mt-1">
                {canPayFullWithRewards
                  ? "✅ Your reward balance covers the full fare! No extra charge."
                  : `₹${availableRewardPoint} will be deducted from rewards. Remaining ₹${remainingAfterRewards} via payment gateway.`}
              </p>
            </div>
          )}

          {/* ── PAYMENT BUTTONS ── */}
          <div className="flex justify-center gap-6">
            <button
              onClick={() => handlePaymentClick("razorpay")}
              className="bg-[#fd561e] text-white px-6 py-3 cursor-pointer rounded-full font-semibold hover:opacity-90"
            >
              Proceed with RazorPay
            </button>
            <button
              onClick={() => handlePaymentClick("billdesk")}
              className="bg-[#fd561e] text-white px-6 py-3 rounded-full cursor-pointer font-semibold hover:opacity-90"
            >
              Proceed with BillDesk
            </button>
          </div>

        </div>
      </div>

      {/* ── PAYMENT POPUP ── */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[440px] mx-4">

            {availableRewardPoint > 0 ? (
              <>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Use Reward Points?</h2>

                <div className="bg-blue-50 rounded-lg p-4 mb-4 text-sm text-gray-700 space-y-2">
                  <p>💰 <span className="font-semibold">Your Reward Balance:</span> ₹{availableRewardPoint}</p>
                  <p>🎟️ <span className="font-semibold">Fare to Pay:</span> ₹{discountedFare}</p>

                  {canPayFullWithRewards ? (
                    <>
                      <p className="text-green-700 font-semibold mt-2">
                        ✅ Your reward points (₹{availableRewardPoint}) cover the full fare of ₹{discountedFare}.
                      </p>
                      <p>No extra charge will be applied to your card/bank.</p>
                      <p>Clicking <b>Confirm with Rewards</b> will complete your booking using reward points only.</p>
                    </>
                  ) : (
                    <>
                      <p>Your reward points worth <b>₹{availableRewardPoint}</b> will be deducted first.</p>
                      <p>
                        The remaining amount of <b>₹{remainingAfterRewards}</b> will be charged via{" "}
                        <b>{selectedGateway === "razorpay" ? "RazorPay" : "BillDesk"}</b>.
                      </p>
                      <p className="text-orange-600 text-xs mt-1 font-medium">
                        ⚠️ Reward points will only be applied if the gateway payment is successful.
                      </p>
                    </>
                  )}
                </div>

                <div className="flex gap-3 justify-end flex-wrap">
                  <button
                    onClick={() => setShowPaymentPopup(false)}
                    className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePopupConfirm(false)}
                    className="px-4 py-2 rounded border border-[#fd561e] text-[#fd561e] hover:bg-orange-50 cursor-pointer text-sm"
                  >
                    Skip Rewards, Pay ₹{discountedFare}
                  </button>
                  <button
                    onClick={() => handlePopupConfirm(true)}
                    className="px-4 py-2 rounded bg-[#fd561e] text-white hover:bg-[#e14d1a] cursor-pointer"
                  >
                    {canPayFullWithRewards ? "Confirm with Rewards" : `Pay ₹${remainingAfterRewards} + Rewards`}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Payment</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-700 space-y-2">
                  <p>🎟️ <span className="font-semibold">Fare to Pay:</span> ₹{discountedFare}</p>
                  <p>💳 <span className="font-semibold">Payment via:</span>{" "}
                    {selectedGateway === "razorpay" ? "RazorPay" : "BillDesk"}
                  </p>
                  <p className="text-gray-400 text-xs">You have no reward balance to apply.</p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowPaymentPopup(false)}
                    className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePopupConfirm(false)}
                    className="px-4 py-2 rounded bg-[#fd561e] text-white hover:bg-[#e14d1a] cursor-pointer"
                  >
                    Confirm & Pay ₹{discountedFare}
                  </button>
                </div>
              </>
            )}
            {showSuccessPopup && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-[350px] text-center shadow-xl">
      
      <div className="text-green-600 text-4xl mb-3">✅</div>

      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Booking Successful!
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        Your ticket has been booked successfully.
      </p>

      <p className="text-xs text-gray-400">
        Redirecting to details...
      </p>
    </div>
  </div>
)}

          </div>
        </div>
      )}

    </div>
  );
};

export default BookingSuccess;