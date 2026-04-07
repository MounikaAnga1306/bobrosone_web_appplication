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

/* ─────────────────────────────────────────────────────────────────────────────
   SEAT TYPE DEFINITIONS (from real API data)
   ─────────────────────────────────────────────────────────────────────────────
   Seater        : length=1, width=1  →  small chair icon
   Horiz sleeper : length=2, width=1  →  wide berth, spans 2 rows × 1 col
   Vert sleeper  : length=1, width=2  →  tall berth, spans 1 row  × 2 cols

   API FIELD NOTES
   ─────────────────────────────────────────────────────────────────────────────
   • Some buses send `fare` instead of `totalFare` — we handle both
   • `available` comes as string "true"/"false" or boolean
   • `row`, `column`, `length`, `width`, `zIndex` come as strings → cast to Number
   • zIndex=0 → lower deck,  zIndex=1 → upper deck

   GRID LAYOUT ALGORITHM
   ─────────────────────────────────────────────────────────────────────────────
   Step 1 – Collect every API row that has at least one seat (skip empty gaps).
   Step 2 – Remap those API rows to CSS grid rows 1,2,3,… (no blank rows).
   Step 3 – Decide the CSS row height for each mapped row:
              • Any vert-sleeper  on that row  → 75 px
              • Any seater        on that row  → 45 px   (wins over horiz-half)
              • Only horiz-sleeper spans row   → 39 px   (half of 70px image)
                 two rows × 39 + 8px gap = 86 px ≈ image height ✓
   Step 4 – Place every seat using remapped gridRow + correct span.
   Step 5 – columnGap = rowGap = 8 px, columns are max-content.
   ───────────────────────────────────────────────────────────────────────────── */

const SeatSelection = ({
  tripDetails,
  selectedSeats,
  setSelectedSeats,
  onNext,
}) => {
  const [showPopup, setShowPopup] = useState(false);

  if (!tripDetails?.seats) return null;

  // ── 1. Normalise every seat from API ──────────────────────────────────────
  const seats = tripDetails.seats.map((s) => ({
    ...s,
    available:  s.available  === true || s.available  === "true",
    ladiesSeat: s.ladiesSeat === true || s.ladiesSeat === "true",
    zIndex:    Number(s.zIndex  ?? 0),
    row:       Number(s.row     ?? 0),
    column:    Number(s.column  ?? 0),
    length:    Number(s.length  ?? 1),   // vertical span (rows)
    width:     Number(s.width   ?? 1),   // horizontal span (cols)
    totalFare: Number(s.totalFare ?? s.fare ?? 0), // some APIs send `fare`
  }));

  // ── 2. Split decks ────────────────────────────────────────────────────────
  const upperDeck = seats.filter((s) => s.zIndex === 1);
  const lowerDeck = seats.filter((s) => s.zIndex === 0);
  const hasUpper  = upperDeck.length > 0;
  const hasLower  = lowerDeck.length > 0;

  // ── 3. Seat type predicates ───────────────────────────────────────────────
  const isSeater   = (s) => s.length === 1 && s.width === 1;
  const isHorizSlp = (s) => s.length === 2 && s.width === 1;
  const isVertSlp  = (s) => s.length === 1 && s.width === 2;

  // ── 4. Toggle selection (max 6) ───────────────────────────────────────────
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

  // ── 5. Seat image selector ────────────────────────────────────────────────
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
    // seater
    if (!seat.available) return bookedSeat;
    if (sel)             return selectedSeat;
    if (seat.ladiesSeat) return ladiesSeat;
    return availableSeat;
  };

  // ── 6. Seat cell renderer ─────────────────────────────────────────────────
  const renderSeatCell = (seat) => (
    <div
      key={seat.id}
      onClick={() => toggleSeat(seat)}
      className="cursor-pointer relative flex items-center justify-center group"
    >
      <img
        src={getSeatImage(seat)}
        alt={seat.name}
        className={`object-contain ${
          isVertSlp(seat)
            ? "h-[55px] md:h-[65px] lg:h-[75px] w-[35px] md:w-[40px] lg:w-[45px]"
            : isHorizSlp(seat)
            ? "h-[50px] md:h-[60px] lg:h-[70px] w-[70px] md:w-[80px] lg:w-[85px]"
            : "h-[32px] md:h-[38px] lg:h-[45px] w-[28px] md:w-[34px] lg:w-[40px]"
        }`}
      />
      <span className="absolute text-[8px] md:text-[9px] lg:text-[10px] font-semibold text-gray-800">
        {seat.name}
      </span>
      {/* Fare tooltip on hover */}
      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50">
        <div className="bg-white text-black text-xs md:text-sm font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap border border-gray-200">
          Fare: ₹{seat.totalFare}
        </div>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white" />
      </div>
    </div>
  );

  // ── 7. UNIFIED GRID ───────────────────────────────────────────────────────
  const renderUnifiedGrid = (deckSeats) => {
    if (!deckSeats.length) return null;

    const GAP         = 8;   // px — rowGap & columnGap
    const SEATER_H    = 45;  // px — seater row height
    const VERT_H      = 75;  // px — vert-sleeper row height
    const HORIZ_HALF  = Math.floor((70 + GAP) / 2); // 39px — half of horiz sleeper

    // Column bounds
    const minCol = Math.min(...deckSeats.map((s) => s.column));
    const maxCol = Math.max(...deckSeats.map((s) => s.column + s.width - 1));

    // Step A: collect occupied API rows (ignore empty gap rows)
    const occupiedSet = new Set();
    deckSeats.forEach((s) => {
      for (let r = s.row; r < s.row + s.length; r++) occupiedSet.add(r);
    });
    const sortedRows = [...occupiedSet].sort((a, b) => a - b);

    // Step B: API row → CSS grid row (1-based, contiguous)
    const rowToGrid = {};
    sortedRows.forEach((apiRow, idx) => { rowToGrid[apiRow] = idx + 1; });

    // Step C: height per CSS grid row
    // For each occupied API row, find the tallest seat that sits on it
    const gridRowHeights = sortedRows.map((apiRow) => {
      let h = 0;
      deckSeats.forEach((s) => {
        // Does seat s occupy this apiRow?
        if (s.row > apiRow || (s.row + s.length - 1) < apiRow) return;
        if (isVertSlp(s))  { h = Math.max(h, VERT_H);     return; }
        if (isSeater(s))   { h = Math.max(h, SEATER_H);   return; }
        if (isHorizSlp(s)) { h = Math.max(h, HORIZ_HALF);        }
      });
      return `${h || SEATER_H}px`;
    });

    // Step D: render
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${maxCol - minCol + 1}, max-content)`,
          gridTemplateRows: gridRowHeights.join(" "),
          columnGap: `${GAP}px`,
          rowGap:    `${GAP}px`,
          justifyContent: "start",
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

  // ── 8. Deck wrapper ───────────────────────────────────────────────────────
  const renderDeck = (deckSeats, title, showSteering) => {
    if (!deckSeats.length) return null;
    return (
      <div className="mb-4 md:mb-6 lg:mb-8 flex border border-gray-200 rounded-xl overflow-hidden">
        {/* Rotated side label */}
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

        {/* Seat grid — horizontal scroll on small screens */}
        <div
          className={`flex-1 bg-white overflow-x-auto ${
            showSteering
              ? "pt-4 md:pt-6 lg:pt-8 pb-2 md:pb-3 lg:pb-4 px-2 md:px-3 lg:px-4"
              : "px-2 md:px-3 lg:px-4 pb-2 md:pb-3 lg:pb-4"
          }`}
        >
          {renderUnifiedGrid(deckSeats)}
        </div>
      </div>
    );
  };

  // ── 9. Main render ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-10 p-3 md:p-4 lg:p-0">

      {/* Max-seats popup */}
      {showPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] animate-bounce-in">
          <div className="flex items-center gap-3 bg-[#fd561e] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 md:h-6 w-5 md:w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
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

      {/* Seat layout panel */}
      <div className="w-full lg:w-fit bg-white rounded-lg p-3 md:p-4 lg:p-6 lg:ml-20 overflow-x-auto">
        <h3 className="font-semibold mb-3 md:mb-4 lg:mb-6 text-base md:text-lg">
          Select Seats
        </h3>

        {/*
          Render order:
          • Upper deck first (no steering)
          • Lower deck below (with steering icon)
          This matches the real physical bus — driver is at the front of lower deck.
        */}
        {hasUpper && renderDeck(upperDeck, "UPPER", false)}
        {hasLower && renderDeck(lowerDeck, "LOWER", true)}
        {/* Single-deck buses (no zIndex split) */}
        {!hasUpper && !hasLower && renderUnifiedGrid(seats)}
      </div>

      {/*
        Legend + Summary
        ─────────────────────────────────────────────────────
        mobile  (< sm)  : stacked vertically below seat panel
        tablet  (sm–lg) : side-by-side below seat panel
        desktop (lg+)   : alongside seat panel (parent flex-row)
      */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-center lg:flex-col lg:items-stretch gap-4 md:gap-6 w-full lg:w-auto">
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