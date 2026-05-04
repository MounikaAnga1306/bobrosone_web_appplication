import SeatLegend from "./SeatLegend";
import SelectedSeatSummary from "./SelectedSeatSummary";
import { useState } from "react";

import availableSeat          from "../../../assets/seats/a-s.png";
import availableSleeper       from "../../../assets/seats/a-slp.png";
import ladiesSeat             from "../../../assets/seats/l-s.png";
import ladiesSleeper          from "../../../assets/seats/l-slp.png";
import selectedSeat           from "../../../assets/seats/s-s.png";
import selectedSleeper        from "../../../assets/seats/s-slp.png";
import bookedSeat             from "../../../assets/seats/b-s.png";
import bookedSleeper          from "../../../assets/seats/b-slp.png";
import verticalAvailableSleeper from "../../../assets/seats/av-slp.png";
import verticalBookedSleeper    from "../../../assets/seats/bk-slp.png";
import verticalSelectedSleeper  from "../../../assets/seats/sl-slp.png";
import steeringIcon           from "../../../assets/seats/steering.png";

const SeatSelection = ({
  tripDetails,
  selectedSeats,
  setSelectedSeats,
  onNext,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  if (!tripDetails?.seats) return null;

  const seats = tripDetails.seats.map((s) => ({
    ...s,
    available:  s.available  === true || s.available  === "true",
    ladiesSeat: s.ladiesSeat === true || s.ladiesSeat === "true",
    zIndex:    Number(s.zIndex  ?? 0),
    row:       Number(s.row     ?? 0),
    column:    Number(s.column  ?? 0),
    length:    Number(s.length  ?? 1),
    width:     Number(s.width   ?? 1),
    totalFare: Number(s.totalFare ?? s.fare ?? 0),
  }));

  const upperDeck = seats.filter((s) => s.zIndex === 1);
  const lowerDeck = seats.filter((s) => s.zIndex === 0);
  const hasUpper  = upperDeck.length > 0;
  const hasLower  = lowerDeck.length > 0;

  const isSeater   = (s) => s.length === 1 && s.width === 1;
  const isHorizSlp = (s) => s.length === 2 && s.width === 1;
  const isVertSlp  = (s) => s.length === 1 && s.width === 2;

  const toggleSeat = (seat) => {
    if (!seat.available) return;
    const exists = selectedSeats.some((s) => s.id === seat.id);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const getSeatImage = (seat) => {
    const sel = selectedSeats.some((s) => s.id === seat.id);

    if (isVertSlp(seat)) {
      if (!seat.available) return verticalBookedSleeper;
      if (sel)             return verticalSelectedSleeper;
      return verticalAvailableSleeper;
    }
    if (isHorizSlp(seat)) {
      if (!seat.available) return bookedSleeper;
      if (sel)             return selectedSleeper;
      if (seat.ladiesSeat) return ladiesSleeper;
      return availableSleeper;
    }
    if (!seat.available) return bookedSeat;
    if (sel)             return selectedSeat;
    if (seat.ladiesSeat) return ladiesSeat;
    return availableSeat;
  };

  const renderSeatCell = (seat) => (
    <div
      key={seat.id}
      onClick={() => toggleSeat(seat)}
      onMouseEnter={(e) =>
        setTooltip({ seatId: seat.id, fare: seat.totalFare, x: e.clientX, y: e.clientY })
      }
      onMouseMove={(e) =>
        setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
      }
      onMouseLeave={() => setTooltip(null)}
      className="cursor-pointer relative flex items-center justify-center"
      style={{ width: "100%", height: "100%" }}
    >
      <img
        src={getSeatImage(seat)}
        alt={seat.name}
        className="object-contain"
        style={
          isVertSlp(seat)
            ? { height: 75, width: 45 }
            : isHorizSlp(seat)
            ? { height: 70, width: 85 }
            : { height: 45, width: 40 }
        }
      />
      <span
        className="absolute font-semibold text-gray-800"
        style={{
          fontSize: 10,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {seat.name}
      </span>
    </div>
  );

  const renderUnifiedGrid = (deckSeats) => {
    if (!deckSeats.length) return null;

    const GAP          = 6;
    const SEATER_H     = 48;
    const SEATER_W     = 44;
    const VERT_H       = 80;
    const VERT_W       = 50;
    const HORIZ_HALF_H = 44;
    const HORIZ_W      = 90;

    const minCol = Math.min(...deckSeats.map((s) => s.column));
    const maxCol = Math.max(...deckSeats.map((s) => s.column + s.width - 1));
    const totalCols = maxCol - minCol + 1;

    const occupiedSet = new Set();
    deckSeats.forEach((s) => {
      for (let r = s.row; r < s.row + s.length; r++) occupiedSet.add(r);
    });
    const sortedRows = [...occupiedSet].sort((a, b) => a - b);

    const rowToGrid = {};
    sortedRows.forEach((apiRow, idx) => { rowToGrid[apiRow] = idx + 1; });

    // Row heights: only seats STARTING at this row define its height
    const gridRowHeights = sortedRows.map((apiRow) => {
      let h = 0;
      deckSeats.forEach((s) => {
        if (s.row !== apiRow) return;
        if (isVertSlp(s))  { h = Math.max(h, VERT_H);       return; }
        if (isHorizSlp(s)) { h = Math.max(h, HORIZ_HALF_H); return; }
        h = Math.max(h, SEATER_H);
      });
      return `${h || SEATER_H}px`;
    });

    // KEY FIX: per-column widths
    // Single-width seats set their column's width directly.
    // Multi-width (spanning) seats share width proportionally as fallback.
    // This prevents sleeper columns from inflating seater column widths.
    const colWidths = Array.from({ length: totalCols }, (_, ci) => {
      const gridCol = ci + 1;
      let w = 0;

      // Pass 1: single-width seats get priority
      deckSeats.forEach((s) => {
        if (s.width !== 1) return;
        const colStart = s.column - minCol + 1;
        if (colStart !== gridCol) return;
        if (isVertSlp(s))  { w = Math.max(w, VERT_W);  return; }
        if (isHorizSlp(s)) { w = Math.max(w, HORIZ_W); return; }
        w = Math.max(w, SEATER_W);
      });

      // Pass 2: if no single-width seat occupies this col, share from spanning seat
      if (w === 0) {
        deckSeats.forEach((s) => {
          if (s.width <= 1) return;
          const colStart = s.column - minCol + 1;
          const colEnd   = colStart + s.width - 1;
          if (gridCol < colStart || gridCol > colEnd) return;
          if (isVertSlp(s))  w = Math.max(w, Math.floor(VERT_W  / s.width));
          if (isHorizSlp(s)) w = Math.max(w, Math.floor(HORIZ_W / s.width));
        });
      }

      return `${w || SEATER_W}px`;
    });

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: colWidths.join(" "),
          gridTemplateRows: gridRowHeights.join(" "),
          columnGap: `${GAP}px`,
          rowGap:    `${GAP}px`,
          justifyContent: "start",
          width: "fit-content",
        }}
      >
        {deckSeats.map((seat) => {
          const gridStart = rowToGrid[seat.row];
          const gridEnd   = rowToGrid[seat.row + seat.length - 1];
          const spanRows  = gridEnd - gridStart + 1;

          return (
            <div
              key={seat.id}
              style={{
                gridColumn: `${seat.column - minCol + 1} / span ${seat.width}`,
                gridRow:    `${gridStart} / span ${spanRows}`,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}
            >
              {renderSeatCell(seat)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDeck = (deckSeats, title, showSteering) => {
    if (!deckSeats.length) return null;
    return (
      <div className="mb-4 md:mb-6 lg:mb-8 flex border border-gray-200 rounded-xl overflow-hidden w-fit max-w-full">
        <div className="w-8 sm:w-10 md:w-12 lg:w-14 bg-gray-200 flex items-center justify-center relative border-r border-gray-300 flex-shrink-0">
          <span className="rotate-[-90deg] font-semibold text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600 tracking-wide whitespace-nowrap">
            {title}
          </span>
          {showSteering && (
            <img
              src={steeringIcon}
              alt="Steering"
              className="absolute top-0.5 sm:top-1 md:top-2 lg:top-4 left-0.5 sm:left-1 md:left-2 lg:left-4 w-3 sm:w-4 md:w-5 lg:w-7 h-3 sm:h-4 md:h-5 lg:h-7"
            />
          )}
        </div>

        <div
          className={`flex-1 bg-white overflow-x-auto ${
            showSteering
              ? "pt-2 sm:pt-3 md:pt-4 lg:pt-6 pb-1 sm:pb-2 md:pb-3 lg:pb-4 px-1 sm:px-2 md:px-3 lg:px-4"
              : "px-1 sm:px-2 md:px-3 lg:px-4 pb-1 sm:pb-2 md:pb-3 lg:pb-4"
          }`}
        >
          {renderUnifiedGrid(deckSeats)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 lg:gap-10 p-2 sm:p-3 md:p-4 lg:p-0 w-full min-w-0">

      {showPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] animate-bounce-in">
          <div className="flex items-center gap-2 sm:gap-3 bg-[#fd561e] text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span className="font-semibold text-xs sm:text-sm">
              You cannot select more than 6 seats!
            </span>
            <button
              onClick={() => setShowPopup(false)}
              className="ml-1 sm:ml-2 text-white cursor-pointer hover:text-red-200 font-bold text-base sm:text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {tooltip && (
        <div
          className="fixed z-[99999] pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}
        >
          <div className="bg-white text-black text-xs md:text-sm font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap border border-gray-200">
            Fare: ₹{tooltip.fare}
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white mx-auto" />
        </div>
      )}

      <div className="w-full lg:w-fit bg-white rounded-lg p-2 sm:p-3 md:p-4 lg:p-6 lg:ml-20 overflow-x-auto max-w-full">
        <h3 className="font-semibold mb-2 sm:mb-3 md:mb-4 lg:mb-6 text-sm sm:text-base md:text-lg">
          Select Seats
        </h3>

        {hasUpper && renderDeck(upperDeck, "UPPER", false)}
        {hasLower && renderDeck(lowerDeck, "LOWER", true)}
        {!hasUpper && !hasLower && renderUnifiedGrid(seats)}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-center lg:flex-col lg:items-stretch gap-3 sm:gap-4 md:gap-6 w-full lg:w-auto">
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