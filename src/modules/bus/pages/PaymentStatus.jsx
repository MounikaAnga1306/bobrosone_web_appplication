import { useLocation } from "react-router-dom";

const PaymentStatus = () => {

  const { state } = useLocation();

  if (!state) {
    return <p className="text-center mt-10">No payment information found</p>;
  }

  const {
    status,
    paymentData,
    passengers,
    seats,
    fromCity,
    toCity,
    date,
    totalFare,
    ticketId,
    payment
  } = state;

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-6">

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-3xl">

        {/* SUCCESS */}
        {status === "success" && (
          <>

            <h1 className="text-3xl font-bold text-[#fd561e] mb-4 text-center">
              Payment Successful 🎉
            </h1>

            <h2 className="text-xl font-semibold mb-4 text-center">
              Booking Confirmed
            </h2>

            <div className="space-y-2 text-lg">

              <p>
                <b>Booking ID:</b>{" "}
                {paymentData?.bookedTicketId ?? ticketId}
              </p>

              <p>
                <b>Journey:</b> From {fromCity} → To {toCity}
              </p>

              <p>
                <b>Date of Journey:</b> {date}
              </p>

              <p>
                <b>Total Fare:</b> ₹{totalFare}
              </p>

              <p>
                <b>Seat Number:</b> {seats?.map(s => s.name).join(", ")}
              </p>

            </div>

            {/* Passenger Table */}
            <h3 className="mt-6 font-semibold text-lg">
              Passenger Details
            </h3>

            <div className="border-t border-b mt-3">

              <table className="w-full text-left mt-2">

                <thead>
                  <tr className="border-b font-semibold">
                    <th className="py-2">Name</th>
                    <th>Gender</th>
                    <th>Age</th>
                    <th>Seat</th>
                  </tr>
                </thead>

                <tbody>

                  {passengers?.map((p, i) => (

                    <tr key={i} className="border-b">

                      <td className="py-2">
                        {p.title} {p.name}
                      </td>

                      <td>{p.gender}</td>

                      <td>{p.age}</td>

                      <td>{p.seatName}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </>
        )}

        {/* FAILED */}
        {status === "failed" && (
          <>

            <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">
              Payment Failed
            </h1>

            <p className="mb-3">
              <strong>Error Code:</strong> {payment?.code}
            </p>

            <p className="mb-3">
              <strong>Description:</strong> {payment?.description}
            </p>

            <p className="mb-3">
              <strong>Reason:</strong> {payment?.reason}
            </p>

          </>
        )}

        {/* CANCELLED */}
        {status === "cancelled" && (
          <>

            <h1 className="text-3xl font-bold text-yellow-600 mb-6 text-center">
              Payment Cancelled
            </h1>

            <p className="text-center">
              The payment was cancelled by the user.
            </p>

          </>
        )}

      </div>

    </div>

  );

};

export default PaymentStatus;