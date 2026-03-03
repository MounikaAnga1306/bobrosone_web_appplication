import SeatLegend from "./SeatLegend";

const SeatSelection = ({
  tripDetails,
  selectedSeats,
  setSelectedSeats,
  onNext,
}) => {
  const toggleSeat = (seat) => {
    if (!seat.available) return;

    const exists = selectedSeats.find((s) => s.id === seat.id);

    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  return (
    <div className="flex gap-10">
      {/* Seat Layout */}
      <div className="bg-white border rounded-xl p-6 w-2/3">
        <h3 className="font-semibold mb-4">Select Seats</h3>

        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${tripDetails.columns || 4},1fr)`,
          }}
        >
          {tripDetails.seats.map((seat, index) => {
            const isSelected = selectedSeats.find((s) => s.id === seat.id);

            return (
              <div
                key={index}
                onClick={() => toggleSeat(seat)}
                className={`h-10 flex items-center justify-center text-xs rounded cursor-pointer
                  ${
                    !seat.available
                      ? "bg-gray-300"
                      : isSelected
                        ? "bg-red-500 text-white"
                        : seat.ladiesSeat
                          ? "bg-pink-200"
                          : "bg-green-100"
                  }`}
              >
                {seat.name}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <SeatLegend />

      {/* Bottom Button */}
      <div className="fixed bottom-6 right-10">
        <button
          disabled={selectedSeats.length === 0}
          onClick={onNext}
          className="bg-red-500 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
