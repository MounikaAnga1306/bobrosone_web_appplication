import availableSeat from "../../../assets/seats/a-s.png";
import availableSleeper from "../../../assets/seats/a-slp.png";
import ladiesSeat from "../../../assets/seats/l-s.png";
import ladiesSleeper from "../../../assets/seats/l-slp.png";
import selectedSeat from "../../../assets/seats/s-s.png";
import selectedSleeper from "../../../assets/seats/s-slp.png";
import bookedSeat from "../../../assets/seats/b-s.png";
import bookedSleeper from "../../../assets/seats/b-slp.png";

const SeatLegend = () => {
  const items = [
    [availableSeat, "Available Seat"],
    [availableSleeper, "Available Sleeper"],
    [ladiesSeat, "Ladies Seat"],
    [ladiesSleeper, "Ladies Sleeper"],
    [selectedSeat, "Selected Seat"],
    [selectedSleeper, "Selected Sleeper"],
    [bookedSeat, "Booked Seat"],
    [bookedSleeper, "Booked Sleeper"],
  ];

  return (
    <div className="bg-white border rounded-xl p-6 w-1/3">
      <h3 className="font-semibold mb-6">Know Your Seat Types</h3>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3 mb-4">
          <img src={item[0]} alt="" className="w-8 h-8 object-contain" />
          <span className="text-sm">{item[1]}</span>
        </div>
      ))}
    </div>
  );
};

export default SeatLegend;