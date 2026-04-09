const API_BASE = import.meta.env.VITE_API_BASE_URL || "";


// =============================
// CREATE RAZORPAY ORDER
// =============================
export const createRazorpayOrder = async ({ fare, uid, name, ticketId, email }) => {
  try {
    const res = await fetch(`${API_BASE}/razorpayment/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fare, uid, name, ticketId, email }),
    });

    if (!res.ok) throw new Error(`Order creation failed: HTTP ${res.status}`);

    const data = await res.json();
    return data;

  } catch (error) {
    console.error("❌ Razorpay Order Error:", error);
    return null;
  }
};
// =============================
// VERIFY RAZORPAY PAYMENT
// =============================
export const verifyRazorpayPayment = async ({
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature
}) => {

  try {

    const res = await fetch(`${API_BASE}/verifyPayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        gateway: "razorpay"
      })
    });

    if (!res.ok) throw new Error(`Verification failed: HTTP ${res.status}`);

    const data = await res.json();

    return data;

  } catch (error) {

    console.error("❌ Razorpay Verify Error:", error);
    return null;

  }

};