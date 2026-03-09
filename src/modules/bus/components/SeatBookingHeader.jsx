const SeatBookingHeader = ({ step, handleStepClick, onClose, fromCity, toCity,date }) => {
  return (
    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="text-lg text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition"
        >
          ✕
        </button>

        {/* DYNAMIC ROUTE */}
        <div>
          <h2 className="font-semibold text-lg">
            {fromCity} → {toCity} | {date}
          </h2>
        </div>

      </div>

      {/* STEP NAVIGATION */}
      <div className="flex gap-10 text-sm mr-70 font-medium justify-center flex-1">
        
        <div
          onClick={() => handleStepClick(1)}
          className={`cursor-pointer ${
            step === 1
              ? "text-[#fd561e] border-b-2 border-[#fd561e] pb-1"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
        
          1. Select seats
         
        </div>

        <div
          onClick={() => handleStepClick(2)}
          className={`cursor-pointer ${
            step === 2
              ? "text-[#fd561e] border-b-2 border-[#fd561e] pb-1"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          2. Boarding & Drop
          
        </div>

        <div
          onClick={() => handleStepClick(3)}
          className={`cursor-pointer ${
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