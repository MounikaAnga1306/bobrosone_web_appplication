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
      if (selectedSeats.length >= 6) {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
        return;
      }
      console.log("Seat Selected:", seat.name);
      setSelectedSeats([...selectedSeats, seat]);
    }
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

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const isSeater = (seat) => seat.length === 1 && seat.width === 1;
  const isSleeper = (seat) =>
    (seat.length === 2 && seat.width === 1) ||
    (seat.length === 1 && seat.width === 2);

  /**
   * Decide whether a deck has ONLY seaters, ONLY sleepers, or MIXED.
   */
  const getDeckType = (deckSeats) => {
    const hasSeater = deckSeats.some(isSeater);
    const hasSleeper = deckSeats.some(isSleeper);
    if (hasSeater && hasSleeper) return "mixed";
    if (hasSleeper) return "sleeper";
    return "seater";
  };

  // ─── Seat cell renderer ───────────────────────────────────────────────────
  const renderSeatCell = (seat) => {
    const isVerticalSleeper = seat.length === 1 && seat.width === 2;
    const isHorizontalSleeper = seat.length === 2 && seat.width === 1;

    return (
      <div
        key={seat.id}
        onClick={() => toggleSeat(seat)}
        className="cursor-pointer relative flex items-center justify-center group"
      >
        <img
          src={getSeatImage(seat)}
          alt={seat.name}
          className={`object-contain ${
            isVerticalSleeper
              ? "h-[55px] md:h-[65px] lg:h-[75px] w-[35px] md:w-[40px] lg:w-[45px]"
              : isHorizontalSleeper
              ? "h-[50px] md:h-[60px] lg:h-[70px] w-[70px] md:w-[80px] lg:w-[85px]"
              : "h-[32px] md:h-[38px] lg:h-[45px] w-[28px] md:w-[34px] lg:w-[40px]"
          }`}
        />
        <span className="absolute text-[8px] md:text-[9px] lg:text-[10px] font-semibold text-gray-800">
          {seat.name}
        </span>
        {/* Fare tooltip */}
        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50">
          <div className="bg-white text-black text-xs md:text-sm font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap border border-gray-200">
            Fare: ₹{seat.totalFare}
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white" />
        </div>
      </div>
    );
  };

  // ─── Pure-seater grid (original logic) ────────────────────────────────────
  const renderSeaterOnlyGrid = (deckSeats) => {
    if (!deckSeats.length) return null;
    const maxCol = Math.max(...deckSeats.map((s) => s.column));
    const minCol = Math.min(...deckSeats.map((s) => s.column));
    const minRow = Math.min(...deckSeats.map((s) => s.row));

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${maxCol - minCol + 1}, max-content)`,
          gridAutoRows: "auto",
          columnGap: "2px",
          rowGap: "12px",
          justifyContent: "start",
        }}
      >
        {deckSeats.map((seat) => (
          <div
            key={seat.id}
            style={{
              gridColumn: `${seat.column - minCol + 1} / span ${seat.width}`,
              gridRow: `${seat.row - minRow + 1} / span ${seat.length}`,
            }}
          >
            {renderSeatCell(seat)}
          </div>
        ))}
      </div>
    );
  };

  // ─── Pure-sleeper grid ─────────────────────────────────────────────────────
  const renderSleeperOnlyGrid = (deckSeats) => {
    if (!deckSeats.length) return null;
    const maxCol = Math.max(...deckSeats.map((s) => s.column));
    const minCol = Math.min(...deckSeats.map((s) => s.column));
    const minRow = Math.min(...deckSeats.map((s) => s.row));

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${maxCol - minCol + 1}, max-content)`,
          gridAutoRows: "auto",
          columnGap: "8px",
          rowGap: "8px",
          justifyContent: "start",
        }}
      >
        {deckSeats.map((seat) => (
          <div
            key={seat.id}
            style={{
              gridColumn: `${seat.column - minCol + 1} / span ${seat.width}`,
              gridRow: `${seat.row - minRow + 1} / span ${seat.length}`,
            }}
          >
            {renderSeatCell(seat)}
          </div>
        ))}
      </div>
    );
  };

  // ─── MIXED grid: seaters on top rows, sleepers on separate rows below ──────
  /**
   * Problem: When seaters (1×1) and sleepers (2×1 or 1×2) share the same CSS
   * grid, the row/column spans collide and cause seats to overlap or get
   * clipped. Fix: split them into two independent grids stacked vertically
   * inside the deck panel, so each group gets its own coordinate system.
   */
  const renderMixedGrid = (deckSeats) => {
    const seaters = deckSeats.filter(isSeater);
    const sleepers = deckSeats.filter(isSleeper);

    return (
      <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
        {seaters.length > 0 && renderSeaterOnlyGrid(seaters)}
        {sleepers.length > 0 && (
          <>
            {/* thin divider between the two sections */}
            <div className="border-t border-dashed border-gray-200" />
            {renderSleeperOnlyGrid(sleepers)}
          </>
        )}
      </div>
    );
  };

  // ─── Choose correct renderer for a deck ────────────────────────────────────
  const renderGrid = (deckSeats) => {
    if (!deckSeats.length) return null;
    const type = getDeckType(deckSeats);
    if (type === "mixed") return renderMixedGrid(deckSeats);
    if (type === "sleeper") return renderSleeperOnlyGrid(deckSeats);
    return renderSeaterOnlyGrid(deckSeats);
  };

  // ─── Deck wrapper ──────────────────────────────────────────────────────────
  const renderDeck = (deckSeats, title, showSteering) => {
    if (!deckSeats.length) return null;

    return (
      <div className="mb-4 md:mb-6 lg:mb-8 flex border border-gray-200 rounded-xl overflow-hidden">
        {/* Side label */}
        <div className="w-10 md:w-12 lg:w-14 bg-gray-200 flex items-center justify-center relative border-r border-gray-300 flex-shrink-0">
          <span className="rotate-[-90deg] font-semibold text-[10px] md:text-xs lg:text-sm text-gray-600 tracking-wide whitespace-nowrap">
            {title}
          </span>
          {showSteering && (
            <img
              src={steeringIcon}
              alt="Steering"
              className="absolute top-1 md:top-2 lg:top-4 left-1 md:left-2 lg:left-4 w-4 md:w-5 lg:w-7 h-4 md:h-5 lg:h-7"
            />
          )}
        </div>

        {/* Seat area — allow horizontal scroll on very small screens */}
        <div
          className={`flex-1 bg-white overflow-x-auto ${
            showSteering
              ? "pt-4 md:pt-6 lg:pt-8 pb-2 md:pb-3 lg:pb-4 px-2 md:px-3 lg:px-4"
              : "px-2 md:px-3 lg:px-4 pb-2 md:pb-3 lg:pb-4"
          }`}
        >
          {renderGrid(deckSeats)}
        </div>
      </div>
    );
  };

  // ─── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-10 p-3 md:p-4 lg:p-0">
      {/* Max Seats Popup */}
      {showPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] animate-bounce-in">
          <div className="flex items-center gap-3 bg-[#fd561e] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 md:h-6 w-5 md:w-6 flex-shrink-0"
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
            <span className="font-semibold text-xs md:text-sm">
              You cannot select more than 6 seats!
            </span>
            <button
              onClick={() => setShowPopup(false)}
              className="ml-2 text-white cursor-pointer hover:text-red-200 font-bold text-base md:text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Seat Layout Container */}
      <div className="w-full lg:w-fit bg-white rounded-lg p-3 md:p-4 lg:p-6 lg:ml-20 overflow-x-auto">
        <h3 className="font-semibold mb-3 md:mb-4 lg:mb-6 text-base md:text-lg">
          Select Seats
        </h3>

        {/*
          ✅ Render order matches Image 2:
             - Upper deck first (shown at top)
             - Lower deck below (with steering)
          Adjust order here if your API sends them differently.
        */}
        {hasUpperDeck && renderDeck(upperDeck, "UPPER", false)}
        {hasLowerDeck && renderDeck(lowerDeck, "LOWER", true)}
        {!hasUpperDeck && !hasLowerDeck && renderGrid(seats)}
      </div>

      {/* Legend + Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4 md:gap-6 w-full lg:w-auto">
        <SeatLegend />
        <SelectedSeatSummary
          selectedSeats={selectedSeats}
          onProceed={onNext}
        />
      </div>
    </div>
  );
};

export default SeatSelection;