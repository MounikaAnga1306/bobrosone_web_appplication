

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
    <div className="max-w-4xl  mx-auto grid grid-cols-2 gap-8">
      {/* ================= BOARDING ================= */}
      <div className="border border-gray-300 rounded-xl p-5 shadow-sm">

        <h3 className="font-bold -mt-2  -ml-2 text-lg">Boarding Points</h3>

      <div className="text-sm pb-2 px-3 text-gray-500 mt-1 mb-3 border-b  border-gray-300 -mt-5 -mx-5 ">
  {boardingPoint
    ? `${boardingPoint.bpName} - ${minutesToTime(boardingPoint.time)}`
    : "Select Boarding Point"}
</div>

        {tripDetails?.boardingTimes?.map((bp, i) => (
          <label
            key={i}
            className={`flex items-center justify-between p-3 border-b border-gray-300 -mt-3 -mx-5 mb-3 cursor-pointer transition
            ${
              boardingPoint === bp
                ? "border-[#fd561e] bg-orange-50"
                : "hover:border-[#fd561e]"
            }`}
          >
            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">

              {/* Departure Time */}
              <div className="font-semibold text-sm text-gray-700">
              {minutesToTime(bp.time)}
              </div>

              {/* Location */}
              <div>
                <div className="font-semibold text-sm">
                  {bp.bpName}
                </div>

                {bp.location && (
                  <div className="text-xs text-gray-500">
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
  console.log("Selected Boarding Point ID:", bp.bpId);
  setBoardingPoint(bp);
}}
              className="accent-[#fd561e] w-4 h-4"
            />

          </label>
        ))}
      </div>


      {/* ================= DROPPING ================= */}
      <div className="border border-gray-300 rounded-xl p-5 shadow-sm">

        <h3 className="font-bold -mt-2  -ml-2 text-lg">Dropping Points</h3>

        {/* Selected Dropping */}
        <div className="text-sm pb-2 px-3 text-gray-500 mt-1 mb-3 border-b  border-gray-300 -mt-5 -mx-5 ">
  {droppingPoint
    ? `${droppingPoint.bpName} - ${minutesToTime(droppingPoint.time)}`
    : "Select Dropping Point"}
</div>

        {tripDetails?.droppingTimes?.map((dp, i) => (
          <label
            key={i}
            className={`flex items-center justify-between p-3 border-b border-gray-300 -mt-3 -mx-5 mb-3 cursor-pointer transition
            ${
              droppingPoint === dp
                ?  "border-[#fd561e] bg-orange-50"
                : "hover:border-[#fd561e]"
            }`}
          >
            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">

              {/* Arrival Time */}
              <div className="font-semibold text-sm text-gray-700">
               {minutesToTime(dp.time)}
              </div>

              {/* Location */}
              <div>
                <div className="font-semibold text-sm">
                  {dp.bpName}
                </div>

                {dp.location && (
                  <div className="text-xs text-gray-500">
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
  console.log("Selected Dropping Point ID:", dp.bpId);
  setDroppingPoint(dp);
}}
              className="accent-[#fd561e] w-4 h-4"
            />

          </label>
        ))}
      </div>


      {/* ================= BUTTON ================= */}
      {/* BOTTOM CONTINUE BAR */}
{boardingPoint && droppingPoint && (
  <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] px-8 py-4 flex items-center justify-end animate-slideUp">
    
    <button
      onClick={onNext}
      className="bg-[#fd561e] text-white cursor-pointer px-8 py-3 rounded-lg font-semibold hover:opacity-90"
    >
      Continue
    </button>

  </div>
)}

    </div>
  );
};

export default BoardingDropping;