const SeatBookingHeader = ({ step, setStep, onClose }) => {
  return (
    <div className="border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onClose} className="text-lg">
          ✕
        </button>
        <div>
          <h2 className="font-semibold text-lg">Kukatpally → Bangalore</h2>
        </div>
      </div>

      <div className="flex gap-10 text-sm font-medium">
        <div
          onClick={() => setStep(1)}
          className={`cursor-pointer ${step === 1 ? "text-red-500 border-b-2 border-red-500 pb-1" : "text-gray-500"}`}
        >
          1. Select seats
        </div>

        <div
          onClick={() => setStep(2)}
          className={`cursor-pointer ${step === 2 ? "text-red-500 border-b-2 border-red-500 pb-1" : "text-gray-500"}`}
        >
          2. Boarding & Drop
        </div>

        <div
          onClick={() => setStep(3)}
          className={`cursor-pointer ${step === 3 ? "text-red-500 border-b-2 border-red-500 pb-1" : "text-gray-500"}`}
        >
          3. Passenger Info
        </div>
      </div>
    </div>
  );
};

export default SeatBookingHeader;
