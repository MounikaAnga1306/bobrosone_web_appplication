import SeatLegend from "./SeatLegend";

// Seat Images (replace later)
import availableSeat from "../../../assets/seats/a-s.png";
import availableSleeper from "../../../assets/seats/a-slp.png";
import ladiesSeat from "../../../assets/seats/l-s.png";
import ladiesSleeper from "../../../assets/seats/l-slp.png";
import selectedSeat from "../../../assets/seats/s-s.png";
import selectedSleeper from "../../../assets/seats/s-slp.png";
import bookedSeat from "../../../assets/seats/b-s.png";
import bookedSleeper from "../../../assets/seats/b-slp.png";

const SeatSelection = ({
  tripDetails,
  selectedSeats,
  setSelectedSeats,
  onNext,
}) => {
  if (!tripDetails?.seats) return null;

  // Convert values properly
  const seats = tripDetails.seats.map((seat) => ({
    ...seat,
    zIndex: Number(seat.zIndex),
    row: Number(seat.row),
    column: Number(seat.column),
    length: Number(seat.length),
  }));

  // Separate decks
  const lower = seats.filter((seat) => seat.zIndex === 0);
  const upper = seats.filter((seat) => seat.zIndex === 1);

  const toggleSeat = (seat) => {
    if (!seat.available) return;

    const exists = selectedSeats.find((s) => s.id === seat.id);

    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const getSeatImage = (seat) => {
    const isSelected = selectedSeats.find((s) => s.id === seat.id);
    const isSleeper = seat.length === 2;

    if (!seat.available) return isSleeper ? bookedSleeper : bookedSeat;
    if (isSelected) return isSleeper ? selectedSleeper : selectedSeat;
    if (seat.ladiesSeat) return isSleeper ? ladiesSleeper : ladiesSeat;

    return isSleeper ? availableSleeper : availableSeat;
  };

  const renderDeck = (deckSeats, title) => {
    if (!deckSeats.length) return null;

    const maxRow = Math.max(...deckSeats.map((s) => s.row));
    const maxCol = Math.max(...deckSeats.map((s) => s.column));

    return (
      <div className="mb-10">
        <div className="flex">
          {/* Side Label */}
          <div className="bg-gray-200 w-16 flex items-center justify-center rounded-l-xl">
            <span className="rotate-[-90deg] font-semibold text-gray-600">
              {title}
            </span>
          </div>

          {/* Grid */}
          <div
            className="border rounded-r-xl p-6 bg-gray-50"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${maxCol + 1}, 60px)`,
              gridAutoRows: "60px",
              gap: "12px",
            }}
          >
            {deckSeats.map((seat) => (
              <div
                key={seat.id}
                onClick={() => toggleSeat(seat)}
                style={{
                  gridColumn: seat.column + 1,
                  gridRow: seat.row + 1,
                }}
                className="cursor-pointer flex items-center justify-center"
              >
                <img
                  src={getSeatImage(seat)}
                  alt={seat.name}
                  className={`object-contain ${
                    seat.length === 2
                      ? "h-[80px] w-[40px]"
                      : "h-[40px] w-[40px]"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-10">
      <div className="w-2/3 bg-white border rounded-xl p-6">
        <h3 className="font-semibold mb-6">Select Seats</h3>
        {renderDeck(lower, "LOWER")}
        {renderDeck(upper, "UPPER")}
      </div>

      <SeatLegend />

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