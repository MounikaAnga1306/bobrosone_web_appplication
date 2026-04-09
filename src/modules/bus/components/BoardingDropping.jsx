const minutesToTime = (minutes) => {
  const totalMinutes = Number(minutes);

  const hrs24 = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;

  const period = hrs24 >= 12 ? "PM" : "AM";

  const hrs12 = hrs24 % 12 || 12;

  return `${hrs12}:${String(mins).padStart(2, "0")} ${period}`;
};

const BoardingDropping = ({
  tripDetails,
  boardingPoint,
  setBoardingPoint,
  droppingPoint,
  setDroppingPoint,
  onNext,
}) => {
 
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      {/* Mobile view - single column, Desktop - two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        
        {/* ================= BOARDING ================= */}
        <div className="border border-gray-300 rounded-xl p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-base sm:text-lg mb-3">Boarding Points</h3>

          <div className="text-xs sm:text-sm pb-2 px-2 sm:px-3 text-gray-500 mb-3 border-b border-gray-300 -mt-1 -mx-4 sm:-mx-5">
            {boardingPoint
              ? `${boardingPoint.bpName} - ${minutesToTime(boardingPoint.time)}`
              : "Select Boarding Point"}
          </div>

          <div className="space-y-2">
            {tripDetails?.boardingTimes?.map((bp, i) => (
              <label
                key={i}
                className={`flex items-center justify-between p-2 sm:p-3 border rounded-lg cursor-pointer transition
                ${
                  boardingPoint === bp
                    ? "border-[#fd561e] bg-orange-50"
                    : "border-gray-200 hover:border-[#fd561e]"
                }`}
              >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-2 sm:gap-4 flex-1">
                  {/* Departure Time */}
                  <div className="font-semibold text-xs sm:text-sm text-gray-700 min-w-[60px] sm:min-w-[70px]">
                    {minutesToTime(bp.time)}
                  </div>

                  {/* Location */}
                  <div className="flex-1">
                    <div className="font-semibold text-xs sm:text-sm break-words">
                      {bp.bpName}
                    </div>

                    {bp.location && (
                      <div className="text-[10px] sm:text-xs text-gray-500 break-words">
                        {bp.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE RADIO */}
                <input
                  type="radio"
                  name="boarding"
                  checked={boardingPoint === bp}
                  onChange={() => {
                    setBoardingPoint(bp);
                  }}
                  className="accent-[#fd561e] w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2 flex-shrink-0"
                />
              </label>
            ))}
          </div>
        </div>

        {/* ================= DROPPING ================= */}
        <div className="border border-gray-300 rounded-xl p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-base sm:text-lg mb-3">Dropping Points</h3>

          <div className="text-xs sm:text-sm pb-2 px-2 sm:px-3 text-gray-500 mb-3 border-b border-gray-300 -mt-1 -mx-4 sm:-mx-5">
            {droppingPoint
              ? `${droppingPoint.bpName} - ${minutesToTime(droppingPoint.time)}`
              : "Select Dropping Point"}
          </div>

          <div className="space-y-2">
            {tripDetails?.droppingTimes?.map((dp, i) => (
              <label
                key={i}
                className={`flex items-center justify-between p-2 sm:p-3 border rounded-lg cursor-pointer transition
                ${
                  droppingPoint === dp
                    ? "border-[#fd561e] bg-orange-50"
                    : "border-gray-200 hover:border-[#fd561e]"
                }`}
              >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-2 sm:gap-4 flex-1">
                  {/* Arrival Time */}
                  <div className="font-semibold text-xs sm:text-sm text-gray-700 min-w-[60px] sm:min-w-[70px]">
                    {minutesToTime(dp.time)}
                  </div>

                  {/* Location */}
                  <div className="flex-1">
                    <div className="font-semibold text-xs sm:text-sm break-words">
                      {dp.bpName}
                    </div>

                    {dp.location && (
                      <div className="text-[10px] sm:text-xs text-gray-500 break-words">
                        {dp.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE RADIO */}
                <input
                  type="radio"
                  name="dropping"
                  checked={droppingPoint === dp}
                  onChange={() => {
                    setDroppingPoint(dp);
                  }}
                  className="accent-[#fd561e] w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2 flex-shrink-0"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ================= BUTTON ================= */}
      {/* BOTTOM CONTINUE BAR */}
      {boardingPoint && droppingPoint && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-center sm:justify-end z-50 animate-slideUp">
          <button
            onClick={onNext}
            className="bg-[#fd561e] text-white cursor-pointer px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:opacity-90 text-sm sm:text-base w-full sm:w-auto max-w-[200px] sm:max-w-none"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default BoardingDropping;