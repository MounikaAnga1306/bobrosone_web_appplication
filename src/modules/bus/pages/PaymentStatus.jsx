import { useLocation, useSearchParams, useNavigate } from "react-router-dom";

const PaymentStatus = () => {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  let finalState = state;

  // ── BillDesk redirect గా వచ్చినప్పుడు query params నుండి build చేయి ──
  if (!finalState) {
    const bdStatus      = searchParams.get("status")        || "";
    const authStatus    = searchParams.get("authStatus")    || "";
    const bdOrderId     = searchParams.get("bdorderid")     || "";
    const transactionId = searchParams.get("transactionid") || "";

    // ✅ cancelled check ముందు చేయి
    const isCancelled = ["cancelled", "cancel", "user_cancelled"]
      .includes(bdStatus.toLowerCase());

    const isSuccess = !isCancelled && (
      bdStatus.toLowerCase() === "success" ||
      authStatus === "0300" ||
      searchParams.get("success") === "true"
    );

    const isFailed = !isCancelled && !isSuccess && (
      bdStatus !== "" || authStatus !== "" || bdOrderId !== ""
    );

    if (isCancelled || isSuccess || isFailed) {
      finalState = {
        status:      isCancelled ? "cancelled" : isSuccess ? "success" : "failed",
        paymentData: {
          bookedTicketId: searchParams.get("ticketId") || bdOrderId || transactionId,
        },
        payment: {
          code:        authStatus || bdStatus || "—",
          description: searchParams.get("statusMessage") || "",
          reason:      searchParams.get("error") || "",
        },
        passengers:  JSON.parse(localStorage.getItem("lastBookingPassengers") || "[]"),
        seats:       JSON.parse(localStorage.getItem("lastBookingSeats")      || "[]"),
        fromCity:    localStorage.getItem("lastBookingFrom")     || "",
        toCity:      localStorage.getItem("lastBookingTo")       || "",
        date:        localStorage.getItem("lastBookingDate")     || "",
        totalFare:   localStorage.getItem("lastBookingFare")     || "0",
        ticketId:    searchParams.get("ticketId") || bdOrderId   || transactionId,
      };
    }
  }

  if (!finalState) {
    return <p className="text-center mt-10">No payment information found</p>;
  }

  const { status, paymentData, passengers, seats, fromCity, toCity, date, totalFare, ticketId, payment } = finalState;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-3xl">

        {/* ── SUCCESS ── */}
        {status === "success" && (
          <>
            <h1 className="text-3xl font-bold text-[#fd561e] mb-4 text-center">Payment Successful 🎉</h1>
            <h2 className="text-xl font-semibold mb-4 text-center">Booking Confirmed</h2>
            <div className="space-y-2 text-lg">
              <p><b>Booking ID:</b> {paymentData?.bookedTicketId ?? ticketId}</p>
              <p><b>Journey:</b> {fromCity} → {toCity}</p>
              <p><b>Date:</b> {date}</p>
              <p><b>Total Fare:</b> ₹{totalFare}</p>
              <p><b>Seats:</b> {seats?.map(s => s.name).join(", ")}</p>
            </div>
            <h3 className="mt-6 font-semibold text-lg">Passenger Details</h3>
            <div className="border-t border-b mt-3">
              <table className="w-full text-left mt-2">
                <thead>
                  <tr className="border-b font-semibold">
                    <th className="py-2">Name</th><th>Gender</th><th>Age</th><th>Seat</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers?.map((p, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2">{p.title} {p.name}</td>
                      <td>{p.gender}</td>
                      <td>{p.age}</td>
                      <td>{p.seatName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                className="bg-[#fd561e] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#e14d1a] transition"
              >
                Back to Home
              </button>
            </div>
          </>
        )}

        {/* ── FAILED ── */}
        {status === "failed" && (
          <>
            <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">Payment Failed ❌</h1>
            <p className="mb-3 text-center text-gray-600">Something went wrong with your payment.</p>
            {payment?.code        && <p className="mb-2"><strong>Error Code:</strong> {payment.code}</p>}
            {payment?.description && <p className="mb-2"><strong>Description:</strong> {payment.description}</p>}
            {payment?.reason      && <p className="mb-2"><strong>Reason:</strong> {payment.reason}</p>}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                className="bg-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-600 transition"
              >
                Try Again
              </button>
            </div>
          </>
        )}

        {/* ── CANCELLED ── */}
        {status === "cancelled" && (
          <>
            <h1 className="text-3xl font-bold text-yellow-600 mb-6 text-center">Payment Cancelled ⚠️</h1>
            <p className="text-center text-gray-500 mb-6">
              You cancelled the payment. Your seats may have been released.
            </p>
            <div className="text-center">
              <button
                onClick={() => navigate("/")}
                className="bg-[#fd561e] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#e14d1a] transition"
              >
                Back to Home
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default PaymentStatus;