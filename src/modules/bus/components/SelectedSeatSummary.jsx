import { useState, useEffect } from "react";

const SelectedSeatSummary = ({ selectedSeats, onProceed }) => {

  const [visible, setVisible] = useState(false);
  const [seatCount, setSeatCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

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
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-xl border-t border-gray-400 z-50 animate-slideUp-price">

      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-center gap-8">

        {/* Seat Count */}
        <div className="text-black font-semibold text-lg">
          {seatCount} {seatCount === 1 ? "Seat" : "Seats"}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">

          <span className="text-xl font-bold text-[#fd561e]">
            ₹{totalPrice}
          </span>

          {/* Gray Box Plus */}
          <div className="w-6 h-6 border  border-gray-500 flex items-center justify-center  rounded-md text-gray-700 font-bold cursor-pointer hover:bg-gray-300 transition">
            <p className="mb-1  text-gray-500">+</p>
          </div>

        </div>

        {/* Proceed Button beside price */}
        <button
          onClick={onProceed}
          disabled={seatCount === 0}
className={`px-6 py-2 rounded-lg font-medium transition
  ${seatCount === 0 
    ? "bg-gray-400 cursor-not-allowed text-white" 
    : "bg-[#fd561e] text-white hover:opacity-90"
  }`}        >
          Proceed
        </button>

      </div>

    </div>
  );
};

export default SelectedSeatSummary;