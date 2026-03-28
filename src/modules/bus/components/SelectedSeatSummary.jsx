import { useState, useEffect } from "react";

const SelectedSeatSummary = ({ selectedSeats, onProceed }) => {

  const [visible, setVisible] = useState(false);
  const [seatCount, setSeatCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showBreakup, setShowBreakup] = useState(false);

  useEffect(() => {

    const count = selectedSeats.length;

    const price = selectedSeats.reduce(
      (sum, seat) => sum + Number(seat.totalFare || 0),
      0
    );

    if (count > 0) {
      setVisible(true);
      setSeatCount(count);
      setTotalPrice(price);
    } else {
      setSeatCount(0);
      setTotalPrice(0);

      setTimeout(() => {
        setVisible(false);
      }, 300);
    }

  }, [selectedSeats]);

  if (!visible) return null;

  return (
    <>
      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-xl border-t border-gray-400 z-50">

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-center gap-8">

          {/* Seat Count */}
          <div className="text-black font-semibold text-lg">
            {seatCount} {seatCount === 1 ? "Seat" : "Seats"}
          </div>

          {/* Price Section */}
          <div className="flex flex-col items-start">

            {/* Price */}
            <span className="text-xl font-bold ml-2 text-[#fd561e]">
              ₹{totalPrice}
            </span>

            {/* ✅ Fare Details (NEW) */}
            <span
              onClick={() => setShowBreakup(true)}
              className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 transition"
            >
              Fare Details
            </span>

          </div>

          {/* Proceed */}
          <button
            onClick={onProceed}
            disabled={seatCount === 0}
            className={`px-6 py-2 rounded-lg  cursor-pointer font-medium transition
              ${seatCount === 0 
                ? "bg-gray-400 cursor-not-allowed text-white" 
                : "bg-[#fd561e] text-white hover:opacity-90"
              }`}
          >
            Proceed
          </button>

        </div>
      </div>

      {/* 🔥 PRICE BREAKUP MODAL */}
      {showBreakup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-[350px] rounded-lg shadow-lg p-5">

            {/* Header */}
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-semibold">Price Breakup</h2>

              {/* Close */}
              <button
                onClick={() => setShowBreakup(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer transition hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-2">Taxes included</p>

            {/* Seat List */}
            <div className="space-y-2">
              {selectedSeats.map((seat, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between px-2 py-2 rounded-md transition
                    ${idx !== 0 ? "border-t border-gray-200 pt-2" : ""}
                  `}
                >
                  <span className="text-gray-700">
                    Seat {seat.name || seat.seatName}
                  </span>
                  <span className="font-medium text-gray-800">
                    ₹{seat.totalFare}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-3 border-t border-gray-300">

              <div className="text-gray-800 font-semibold mb-2">
                Total Fare
              </div>

              <div className="flex justify-between text-gray-700">
                <span>
                  {seatCount} {seatCount === 1 ? "Seat" : "Seats"}
                </span>
                <span className="font-semibold">
                  ₹{totalPrice}
                </span>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default SelectedSeatSummary;