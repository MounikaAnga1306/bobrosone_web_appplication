const BoardingDropping = ({
  tripDetails,
  boardingPoint,
  setBoardingPoint,
  droppingPoint,
  setDroppingPoint,
  onNext,
}) => {
  return (
    <div className="grid grid-cols-2 gap-10">
      <div>
        <h3 className="font-semibold mb-4">Boarding Points</h3>

        {tripDetails?.boardingTimes?.map((bp, i) => (
          <div
            key={i}
            onClick={() => setBoardingPoint(bp)}
            className={`p-3 border rounded mb-2 cursor-pointer
              ${boardingPoint === bp ? "border-red-500 bg-red-50" : ""}
            `}
          >
            {bp.bpName || bp.location}
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-4">Dropping Points</h3>

        {tripDetails?.droppingTimes?.map((dp, i) => (
          <div
            key={i}
            onClick={() => setDroppingPoint(dp)}
            className={`p-3 border rounded mb-2 cursor-pointer
              ${droppingPoint === dp ? "border-red-500 bg-red-50" : ""}
            `}
          >
            {dp.bpName || dp.location}
          </div>
        ))}
      </div>

      <div className="col-span-2 text-right">
        <button
          onClick={onNext}
          disabled={!boardingPoint || !droppingPoint}
          className="bg-red-500 text-white px-6 py-3 rounded disabled:bg-gray-400"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default BoardingDropping;
