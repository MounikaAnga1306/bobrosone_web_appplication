import SeatLegend from "./SeatLegend";
import SelectedSeatSummary from "./SelectedSeatSummary";
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
  if (!tripDetails?.seats) return null;

  // ✅ Convert API values correctly
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

  // ✅ Seat select toggle
  const toggleSeat = (seat) => {
    console.table(seat);
    console.log("Clicked Seat Data:", seat);

    if (!seat.available) return;

    const exists = selectedSeats.some((s) => s.id === seat.id);

    if (exists) {
      console.log("Seat Unselected:", seat.name);

      setSelectedSeats(
        selectedSeats.filter((s) => s.id !== seat.id)
      );
    } else {
      console.log("Seat Selected:", seat.name);
      setSelectedSeats([...selectedSeats, seat]);
    }
    console.log("Current Selected Seats:", selectedSeats);
  };

  // ✅ Correct Image Mapping
  const getSeatImage = (seat) => {

  const isSelected = selectedSeats.some(
    (s) => s.id === seat.id
  );

  const isVerticalSleeper = seat.length === 1 && seat.width === 2;
  const isHorizontalSleeper = seat.length === 2 && seat.width === 1;

  // ✅ Vertical Sleeper
  if (isVerticalSleeper) {

    if (!seat.available) return verticalBookedSleeper;

    if (isSelected) return verticalSelectedSleeper;

    return verticalAvailableSleeper;
  }
  // Horizontal Sleeper
  if (isHorizontalSleeper) {

    if (!seat.available) return bookedSleeper;

    if (isSelected) return selectedSleeper;

    if (seat.ladiesSeat) return ladiesSleeper;

    return availableSleeper;
  }

  // Normal Seat
  if (!seat.available) return bookedSeat;

  if (isSelected) return selectedSeat;

  if (seat.ladiesSeat) return ladiesSeat;

  return availableSeat;
};

  // ✅ Grid Renderer
  const renderGrid = (deckSeats) => {
  if (!deckSeats.length) return null;

  const maxRow = Math.max(...deckSeats.map((s) => s.row));
  const maxCol = Math.max(...deckSeats.map((s) => s.column));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${maxCol + 1}, max-content)`,
        gridAutoColumns: "max-content",
        gridAutoRows: "25px",
        columnGap: "2px",
        rowGap: "18px"
      }}
    >
      {deckSeats.map((seat) => {

        // ✅ console log here
        //console.log("Seat Object:", seat);

        return (
          <div
  key={seat.id}
  onClick={() => toggleSeat(seat)}
  style={{
    gridColumn: seat.column + 1,
    gridRow: seat.row + 1
  }}
  className="cursor-pointer relative flex items-center justify-center relative  group"
>

  {/* Seat Image */}
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

  {/* Seat Name */}
  <span className="absolute text-[10px] font-semibold text-gray-800">
    {seat.name}
  </span>

  {/* Hover Tooltip */}
  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50">

    {/* Tooltip Box */}
    <div className="bg-white text-black text-sm font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap">
      Fare: ₹{seat.totalFare}
    </div>

    {/* Arrow */}
       <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
 
       </div>

      </div>
        );
      })}
    </div>
  );
};

  // ✅ Deck Renderer (Upper First)
 const renderDeck = (deckSeats, title, showSteering) => {
  if (!deckSeats.length) return null;

  return (
    <div className="mb-8 flex border border-gray-200 rounded-xl overflow-visible ">

      {/* LEFT SIDE TITLE */}
      <div className="w-14 bg-gray-200 rounded-l-xl flex items-center justify-center relative border-r border-gray-300">
        <span className="rotate-[-90deg] font-semibold text-gray-600 tracking-wide">
          {title}
        </span>

        {/* Steering for Lower */}
        {showSteering && (
          <img
            src={steeringIcon}
            alt="Steering"
            className="absolute top-4 left-4 w-7 h-7"
          />
        )}
      </div>

      {/* RIGHT SIDE SEATS */}
      <div className={`flex-1 rounded-r-xl bg-white ${showSteering ? "pt-8 pb-4 px-4" : "px-4 pb-4 "}`}>
        {renderGrid(deckSeats)}
      </div>
    </div>
  );
};

  return (
    <div className="flex gap-10 ">
      <div className="w-fit bg-white  rounded-lg p-6 ml-20">
        <h3 className="font-semibold mb-6 text-lg">
          Select Seats
        </h3>

        {/* ✅ Upper First */}
        {hasUpperDeck &&
          renderDeck(upperDeck, "UPPER", false)}

        {/* ✅ Lower with Steering */}
        {hasLowerDeck &&
          renderDeck(lowerDeck, "LOWER", true)}

        {/* Single deck fallback */}
        {!hasUpperDeck &&
          !hasLowerDeck &&
          renderGrid(seats)}
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