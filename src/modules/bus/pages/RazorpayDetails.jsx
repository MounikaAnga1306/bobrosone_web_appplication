import { useLocation, useNavigate } from "react-router-dom";

const RazorpayDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.orderData;

  if (!order) return <p className="text-center mt-10">No order data found!</p>;

  const handlePayment = () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded!");
      return;
    }

    const options = {
      key: "rzp_live_wyxyLDS9NPZCPy",
      amount: order.order.amount,
      currency: order.order.currency || "INR",
      name: "Bus Ticket Booking",
      description: "Payment for Bus Ticket",
      order_id: order.order.id,

      prefill: {
        name: order.order.notes?.name || "",
        email: order.order.notes?.email || "",
        contact: order.order.notes?.mobileno || "",
      },

      theme: {
        color: "#fd561e",
      },

      // SUCCESS CASE
      handler: function (response) {
        console.log("Payment Successful:", response);

        navigate("/payment-status", {
          state: {
            status: "success",
            paymentData: response,
          },
        });
      },

      // CANCEL CASE
      modal: {
        ondismiss: function () {
          console.log("Payment popup closed");

          navigate("/payment-status", {
            state: {
              status: "cancelled",
            },
          });
        },
      },
    };

    const rzp = new window.Razorpay(options);

    // FAILED CASE
    rzp.on("payment.failed", function (response) {
      console.log("Payment Failed:", response.error);

      navigate("/payment-status", {
        state: {
          status: "failed",
          paymentData: response.error,
        },
      });
    });

    rzp.open();
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-6">
      <div className="bg-white w-[650px] rounded-xl shadow-md p-8">

        <h1 className="text-3xl text-center font-semibold text-[#fd561e] mb-6">
          Razorpay Order Details
        </h1>

        <p className="mb-3 text-lg">
          <span className="font-semibold">Order ID:</span> {order.order?.id}
        </p>

        <p className="mb-3 text-lg">
          <span className="font-semibold">Amount:</span> ₹{order.order?.amount / 100}
        </p>

        <p className="mb-3 text-lg">
          <span className="font-semibold">Currency:</span> {order.order?.currency}
        </p>

        <button
          onClick={handlePayment}
          className="mt-6 bg-[#fd561e] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90"
        >
          Pay Now
        </button>

      </div>
    </div>
  );
};

export default RazorpayDetails;