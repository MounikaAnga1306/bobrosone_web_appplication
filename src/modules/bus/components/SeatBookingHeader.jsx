const SeatBookingHeader = ({ step, handleStepClick, onClose, fromCity, toCity, date }) => {
  return (
    <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
      
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto md:mr-8 lg:mr-0">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="text-lg text-gray-600 cursor-pointer hover:text-gray-800 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition flex-shrink-0"
        >
          ✕
        </button>

        {/* DYNAMIC ROUTE */}
        <div className="flex-1 md:flex-initial">
          <h2 className="font-semibold text-sm md:text-base lg:text-lg">
            {fromCity} → {toCity} <span className="hidden md:inline">|</span>
            <br className="md:hidden" />
            <span className="text-xs md:text-sm lg:text-base"> {date}</span>
          </h2>
        </div>

      </div>

      {/* STEP NAVIGATION */}
      <div className="flex gap-4 md:gap-6  lg:gap-10 lg:-ml-58 text-xs md:text-sm font-medium justify-start md:justify-center w-full md:w-auto md:flex-1 overflow-x-auto pb-1 md:pb-0">
        
        <div
          onClick={() => handleStepClick(1)}
          className={`cursor-pointer whitespace-nowrap ${
            step === 1
              ? "text-[#fd561e] border-b-2 border-[#fd561e] pb-1"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          1. Select seats
        </div>

        <div
          onClick={() => handleStepClick(2)}
          className={`cursor-pointer whitespace-nowrap ${
            step === 2
              ? "text-[#fd561e] border-b-2 border-[#fd561e] pb-1"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          2. Boarding & Drop
        </div>

        <div
          onClick={() => handleStepClick(3)}
          className={`cursor-pointer whitespace-nowrap ${
            step === 3
              ? "text-[#fd561e] border-b-2 border-[#fd561e] pb-1"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          3. Passenger Info
        </div>

      </div>
    </div>
  );
};

export default SeatBookingHeader;