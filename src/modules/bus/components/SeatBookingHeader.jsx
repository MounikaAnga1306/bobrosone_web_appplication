import { Armchair, Bus, User } from "lucide-react";

const SeatBookingHeader = ({ step, handleStepClick, onClose, fromCity, toCity, date, operator }) => {

  const steps = [
    { number: 1, label: "Select seats",    icon: <Armchair size={15} /> },
    { number: 2, label: "Boarding & Drop", icon: <Bus      size={15} /> },
    { number: 3, label: "Passenger Info",  icon: <User     size={15} /> },
  ];

  return (
    <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">

      {/* LEFT: Close + Route */}
      <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
        <button
          onClick={onClose}
          className="text-lg text-gray-600 cursor-pointer hover:text-gray-800 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition flex-shrink-0"
        >
          ✕
        </button>

        <div className="flex-1 md:flex-initial">
          <h2 className="font-semibold text-sm md:text-base lg:text-lg">
            {fromCity} → {toCity}
            <span className="hidden md:inline"> | </span>
            <br className="md:hidden" />
            <span className="text-xs md:text-sm lg:text-base">{date}</span>
          </h2>
          {operator && (
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{operator}</p>
          )}
        </div>
      </div>

      {/* CENTER: Step indicators */}
      <div className="flex items-center text-xs md:text-sm font-medium justify-start md:justify-center w-full md:w-auto md:flex-1 overflow-x-auto pb-1 md:pb-0 lg:-ml-32">

        {steps.map((s, i) => {
          const isActive    = step === s.number;
          const isCompleted = step > s.number;

          return (
            <div key={s.number} className="flex items-center">

              {/* Step */}
              <div
                onClick={() => handleStepClick(s.number)}
                className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {/* Icon circle — dashed border when inactive, solid orange when active/done */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive
                    ? "border-2 border-[#fd561e] bg-[#fd561e]/10 text-[#fd561e]"
                    : isCompleted
                    ? "border-2 border-[#fd561e] bg-[#fd561e]/10 text-[#fd561e]"
                    : "border-2 border-dashed border-orange-300 bg-white text-orange-300"
                }`}>
                  {s.icon}
                </div>

                {/* Label */}
                <span className={`transition-colors ${
                  isActive    ? "text-[#fd561e] font-semibold" :
                  isCompleted ? "text-[#fd561e]"               :
                                "text-gray-400"
                }`}>
                  {s.number}. {s.label}
                </span>
              </div>

              {/* Dashed line connector */}
              {i < steps.length - 1 && (
                <div className="mx-3 flex items-center">
                  <div className={`w-16 md:w-24 border-t-2 border-dashed ${
                    step > s.number ? "border-[#fd561e]" : "border-gray-300"
                  }`} />
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeatBookingHeader;