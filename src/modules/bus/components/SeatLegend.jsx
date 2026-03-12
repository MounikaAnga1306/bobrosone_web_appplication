import availableSeat from "../../../assets/seats/a-s.png";
import availableSleeper from "../../../assets/seats/a-slp.png";
import ladiesSeat from "../../../assets/seats/l-s.png";
import ladiesSleeper from "../../../assets/seats/l-slp.png";
import bookedSeat from "../../../assets/seats/b-s.png";
import bookedSleeper from "../../../assets/seats/b-slp.png";
import selectSeater from "../../../assets/seats/s-s.png";
import selectSleeper from "../../../assets/seats/s-slp.png";


const SeatLegend = () => {

  const rows = [
    {
      label: "Available",
      seater: availableSeat,
      sleeper: availableSleeper
    },
    {
      label: "Available only for female passenger",
      seater: ladiesSeat,
      sleeper: ladiesSleeper
    },
     {
      label: "Selected by you",
      seater: selectSeater,
      sleeper: selectSleeper
    },
    {
      label: "Already booked",
      seater: bookedSeat,
      sleeper: bookedSleeper
    }
  ];

  return (
    <div className="bg-white border mt-18 border-gray-200 rounded-xl h-[400px] w-[520px] overflow-hidden">

      {/* Title */}
      <h3 className="text-center font-semibold text-lg py-4">
        Know your seat types
      </h3>

      {/* Header */}
      <div className="grid grid-cols-3 bg-gray-100 text-sm font-semibold border-y border-gray-200">
        <div className="p-4">Seat Types</div>
        <div className="p-4 text-center">Seater</div>
        <div className="p-4 text-center">Sleeper</div>
      </div>

      {/* Rows */}
      {rows.map((row, index) => (
        <div
          key={index}
          className="grid grid-cols-3 items-center border-b border-gray-200"
        >
          <div className="p-6 text-sm">
            {row.label}
          </div>

          <div className="flex justify-center">
            <img
              src={row.seater}
              alt=""
              className="w-10 h-10 object-contain"
            />
          </div>

          <div className="flex justify-center">
            <img
              src={row.sleeper}
              alt=""
              className="w-12 h-16 object-contain"
            />
          </div>
        </div>
      ))}

    </div>
  );
};

export default SeatLegend;