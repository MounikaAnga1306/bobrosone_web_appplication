import { useLocation, useNavigate } from "react-router-dom";
import { createRazorpayOrder, verifyRazorpayPayment } from "../services/razorpayService";
import { createBillDeskOrder } from "../services/billdeskService";

const BookingSuccess = () => {

  const { state } = useLocation();
  const navigate = useNavigate();
  if (!state) {
  navigate("/");
  return null;
}

  const totalFare = state?.totalFare || 0;

  const handleRazorPayClick = async () => {

    try {

      const orderResponse = await createRazorpayOrder({
        fare: totalFare,
        uid: state?.uid || "Not Applicable",
        name: state?.passengers?.[0]?.name || "Guest",
        ticketId: state?.ticketId,
        email: state?.passengers?.[0]?.email || "Not Applicable",
      });

      if (!orderResponse) {
        alert("Failed to create Razorpay order");
        return;
      }

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
          contact: state?.uid,
        },

        theme: { color: "#fd561e" },

        handler: async function (response) {

  console.log("Payment Success:", response);

  const verifyData = await verifyRazorpayPayment({
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_signature: response.razorpay_signature
  });

  console.log("VERIFY RESPONSE:", verifyData);
  /* ✅ ADD THIS BLOCK HERE */
if (!verifyData) {
  navigate("/payment-status", {
    state: {
      status: "failed",
      payment: {
        code: "VERIFY_FAILED",
        description: "Payment verification failed",
        reason: "Server verification error"
      }
    }
  });
  return;
}

  const isSuccess =
    verifyData?.success === true ||
    verifyData?.status === "success";

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
      totalFare,
      ticketId: state?.ticketId
    }
  });

},

        modal: {
          ondismiss: function () {

            navigate("/payment-status", {
              state: {
                status: "cancelled"
              }
            });

          }
        }

      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
         console.log(response);
         const error = response.error;

        navigate("/payment-status", {
          state: {
            status: "failed",
            payment: {
        code: "PAYMENT_ERROR",
        description: "Something went wrong",
        reason: error.message
      }
          }
        });

      });

      rzp.open();

    } catch (error) {

      console.error("Razorpay Error:", error);

      navigate("/payment-status", {
        state: {
          status: "failed",
          payment: {
            code: "PAYMENT_ERROR",
            description: "Something went wrong",
            reason: error.message
          }
        }
      });

    }

  };


  /* ✅ ONLY BILLDESK MODIFIED */
  const handleBillDeskClick = async () => {

    try {

      const response = await createBillDeskOrder({
        fare: totalFare,
        uid: state?.uid || "NA",
        pname: state?.passengers?.[0]?.name || "Guest",
        tickid: state?.ticketId,
      });

      if (!response || !response.success) {
        alert("BillDesk order creation failed");
        return;
      }

      const merchantId = "HYDBOBROS";
      const bdOrderId = response.bdorderid;
      const authToken = response.authToken;

      if (!authToken) {
        alert("Auth Token missing");
        return;
      }

      const checkoutUrl =
        `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=${merchantId}&bdorderid=${bdOrderId}&authToken=${encodeURIComponent(authToken)}`;

      /* ✅ DIRECT REDIRECT TO BILLDESK */
      window.location.href = checkoutUrl;

    } catch (error) {

      console.error("BillDesk Error:", error);

      navigate("/payment-status", {
        state: {
          status: "failed",
          payment: {
            description: "BillDesk payment error",
            reason: error.message
          }
        }
      });

    }

  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-6">

      <div className="bg-white w-[650px] rounded-xl shadow-md p-8">

        <h1 className="text-3xl text-center font-semibold text-[#fd561e] mb-6">
          Ticket Payment Confirmation
        </h1>

        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded mb-6">
          <p>
          Ticket is tentatively Blocked for you, please complete your payment
            within next <b>5 Minutes</b> to get your ticket confirmed.
          </p>
        </div>

        <p className="mb-3 text-lg">
          <span className="font-semibold">Temporary Booking Reference:</span>{" "}
          {state?.ticketId}
        </p>

        <p className="mb-6 text-lg">
          <span className="font-semibold">Total fare to be paid:</span> ₹{totalFare}
        </p>

        <p className="mb-2 text-lg">
          <span className="font-semibold">UID:</span> {state?.uid}
        </p>

        <div className="mb-3 text-lg">
          <span className="font-semibold">Passengers:</span>
          <ul className="list-disc ml-5 mt-1">
            {state?.passengers?.map((p, idx) => (
              <li key={idx}>
                {p.name} - {p.email}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-green-100 border-l-4 border-[#fd561e] p-4 rounded mb-6">
          <p>
           Congratulations! You are eligible for earning{" "}
            <b>{(totalFare * 0.04).toFixed(3)} Reward Points</b> on this Booking.
          </p>
        </div>

        <div className="flex justify-center gap-6">

          <button
            onClick={handleRazorPayClick}
            className="bg-[#fd561e] text-white px-6 py-3 cursor-pointer rounded-full font-semibold hover:opacity-90"
          >
            Proceed to Payment with RazorPay
          </button>

          <button
            onClick={handleBillDeskClick}
            className="bg-[#fd561e] text-white px-6 py-3 rounded-full cursor-pointer font-semibold hover:opacity-90"
          >
            Proceed to Payment with BillDesk
          </button>

        </div>

      </div>
    </div>
  );
};

export default BookingSuccess;