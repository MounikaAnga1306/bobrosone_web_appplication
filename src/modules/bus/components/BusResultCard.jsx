
import Button from "../components/ui/Button";


const BusResultCard = ({
  id,
  operator,
  type,
  departure,
  departureCity,
  arrival,
  arrivalCity,
  duration,
  price,
  seatsLeft,
  onSelectSeat,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Left – Operator info */}
        <div className="flex items-start gap-3 md:w-[220px] shrink-0">
          {/* <img
            src="/placeholder.svg"
            alt={operator}
            className="h-10 w-10 rounded-lg bg-gray-100 object-contain p-1"
          /> */}

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {operator}
            </h3>

            <p className="text-xs text-gray-500 truncate">{type}</p>
          </div>
        </div>

        {/* Middle – Time info */}
        <div className="flex-1 flex items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{departure}</p>
            <p className="text-[11px] text-gray-500">{departureCity}</p>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-medium">
              {duration}
            </span>

            <div className="w-full h-px bg-gray-300 my-1 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{arrival}</p>
            <p className="text-[11px] text-gray-500">{arrivalCity}</p>
          </div>
        </div>

        {/* Right – Price & CTA */}
        <div className="flex flex-col items-end gap-2 md:w-[140px] shrink-0">
          <p className="text-xl font-extrabold text-gray-900">
            ₹{price?.toLocaleString("en-IN")}
          </p>

          {seatsLeft <= 10 && (
            <span className="text-[10px] font-semibold text-red-500">
              {seatsLeft} seats left
            </span>
          )}

          <Button
            size="sm"
            className="w-full font-bold"
            onClick={() => onSelectSeat(id)}
          >
            Select Seat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BusResultCard;
