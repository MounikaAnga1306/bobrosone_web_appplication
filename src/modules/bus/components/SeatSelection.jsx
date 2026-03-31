import SeatLegend from "./SeatLegend";
import SelectedSeatSummary from "./SelectedSeatSummary";
import { useState } from "react";
// Seat Images
import availableSeat from "../../../assets/seats/a-s.png";
import availableSleeper from "../../../assets/seats/a-slp.png";
import ladiesSeat from "../../../assets/seats/l-s.png";
import ladiesSleeper from "../../../assets/seats/l-slp.png";
import selectedSeat from "../../../assets/seats/s-s.png";
import selectedSleeper from "../../../assets/seats/s-slp.png";
import bookedSeat from "../../../assets/seats/b-s.png";
import bookedSleeper from "../../../assets/seats/b-slp.png";
import verticalAvailableSleeper from "../../../assets/seats/av-slp.png";
import verticalBookedSleeper from "../../../assets/seats/bk-slp.png";
import verticalSelectedSleeper from "../../../assets/seats/sl-slp.png";
import steeringIcon from "../../../assets/seats/steering.png";


const SeatSelection = ({
  tripDetails,
  selectedSeats,
  setSelectedSeats,
  onNext,
}) => {
  const [showPopup, setShowPopup] = useState(false);

  if (!tripDetails?.seats) return null;

  const seats = tripDetails.seats.map((seat) => ({
    ...seat,
    available:
      seat.available === true || seat.available === "true",
    ladiesSeat:
      seat.ladiesSeat === true || seat.ladiesSeat === "true",
    zIndex: Number(seat.zIndex ?? 0),
    row: Number(seat.row ?? 0),
    column: Number(seat.column ?? 0),
    length: Number(seat.length ?? 1),
    width: Number(seat.width ?? 1),
  }));

  console.log("Full Seat API Response:", tripDetails.seats);
  const upperDeck = seats.filter((seat) => seat.zIndex === 1);
  const lowerDeck = seats.filter((seat) => seat.zIndex === 0);

  const hasUpperDeck = upperDeck.length > 0;
  const hasLowerDeck = lowerDeck.length > 0;

  // ✅ Seat select toggle with max 6 limit
  const toggleSeat = (seat) => {
    console.table(seat);
    console.log("Clicked Seat Data:", seat);

    if (!seat.available) return;

    const exists = selectedSeats.some((s) => s.id === seat.id);

    if (exists) {
      console.log("Seat Unselected:", seat.name);
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      // ✅ Check max 6 seats limit
      if (selectedSeats.length >= 6) {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000); // Auto hide after 3 seconds
        return;
      }
      console.log("Seat Selected:", seat.name);
      setSelectedSeats([...selectedSeats, seat]);
    }
    console.log("Current Selected Seats:", selectedSeats);
  };

  const getSeatImage = (seat) => {
    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    const isVerticalSleeper = seat.length === 1 && seat.width === 2;
    const isHorizontalSleeper = seat.length === 2 && seat.width === 1;

    if (isVerticalSleeper) {
      if (!seat.available) return verticalBookedSleeper;
      if (isSelected) return verticalSelectedSleeper;
      return verticalAvailableSleeper;
    }
    if (isHorizontalSleeper) {
      if (!seat.available) return bookedSleeper;
      if (isSelected) return selectedSleeper;
      if (seat.ladiesSeat) return ladiesSleeper;
      return availableSleeper;
    }
    if (!seat.available) return bookedSeat;
    if (isSelected) return selectedSeat;
    if (seat.ladiesSeat) return ladiesSeat;
    return availableSeat;
  };

  const renderGrid = (deckSeats) => {
    if (!deckSeats.length) return null;

    const maxCol = Math.max(...deckSeats.map((s) => s.column));

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${maxCol + 1}, max-content)`,
          gridAutoColumns: "max-content",
          gridAutoRows: "25px",
          columnGap: "2px",
          rowGap: "18px",
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
            className="cursor-pointer relative flex items-center justify-center group"
          >
            <img
              src={getSeatImage(seat)}
              alt={seat.name}
              className={`object-contain ${
                seat.length === 1 && seat.width === 2
                  ? "h-[75px] w-[45px]"
                  : seat.length === 2 && seat.width === 1
                  ? "h-[70px] w-[85px]"
                  : "h-[45px] w-[40px]"
              }`}
            />
            <span className="absolute text-[10px] font-semibold text-gray-800">
              {seat.name}
            </span>
            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50">
              <div className="bg-white text-black text-sm font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap">
                Fare: ₹{seat.totalFare}
              </div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDeck = (deckSeats, title, showSteering) => {
    if (!deckSeats.length) return null;

    return (
      <div className="mb-8 flex border border-gray-200 rounded-xl overflow-visible">
        <div className="w-14 bg-gray-200 rounded-l-xl flex items-center justify-center relative border-r border-gray-300">
          <span className="rotate-[-90deg] font-semibold text-gray-600 tracking-wide">
            {title}
          </span>
          {showSteering && (
            <img
              src={steeringIcon}
              alt="Steering"
              className="absolute top-4 left-4 w-7 h-7"
            />
          )}
        </div>
        <div className={`flex-1 rounded-r-xl bg-white ${showSteering ? "pt-8 pb-4 px-4" : "px-4 pb-4"}`}>
          {renderGrid(deckSeats)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-10">

      {/* ✅ Max Seats Popup */}
      {showPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] animate-bounce-in">
          <div className="flex items-center gap-3 bg-[#fd561e] text-white px-6 py-3 rounded-xl shadow-2xl">
            {/* Warning Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <span className="font-semibold text-sm">
              You cannot select more than 6 seats!
            </span>
            {/* Close Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="ml-2 text-white cursor-pointer hover:text-red-200 font-bold text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="w-fit bg-white rounded-lg p-6 ml-20">
        <h3 className="font-semibold mb-6 text-lg">Select Seats</h3>

        {hasUpperDeck && renderDeck(upperDeck, "UPPER", false)}
        {hasLowerDeck && renderDeck(lowerDeck, "LOWER", true)}
        {!hasUpperDeck && !hasLowerDeck && renderGrid(seats)}
      </div>

      <SeatLegend />

      <SelectedSeatSummary
        selectedSeats={selectedSeats}
        onProceed={onNext}
      />
    </div>
  );
};

export default SeatSelection;