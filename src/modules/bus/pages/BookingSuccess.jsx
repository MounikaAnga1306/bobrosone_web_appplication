import { useLocation } from "react-router-dom";

const BookingSuccess = () => {

  const { state } = useLocation();

  return (
    <div className="flex flex-col items-center justify-center h-screen">

      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Booking Successful 🎉
      </h1>

      <p className="text-lg mb-2">
        Ticket ID: <b>{state?.ticketId}</b>
      </p>

      <p>
        {state?.fromCity} → {state?.toCity}
      </p>

      <p>Date: {state?.date}</p>

      <p>
        Seats: {state?.seats?.map((s) => s.name).join(", ")}
      </p>

    </div>
  );
};

export default BookingSuccess;