import { useState } from "react";

const sortOptions = [
  "Best",
  "Rating",
  "Departure",
  "Arrival",
  "Fastest",
  "Cheapest",
];

const SortBar = ({ busCount }) => {
  const [active, setActive] = useState("Best");

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 px-4 py-3 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* LEFT SIDE */}
        <h2 className="text-sm font-medium text-gray-700">
          Showing <span className="font-bold text-[#fd561e]">{busCount}</span>{" "}
          bus
        </h2>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Sort by:</span>

          <div className="flex items-center gap-1">
            {sortOptions.map((option) => (
              <button
                key={option}
                onClick={() => setActive(option)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  active === option
                    ? "bg-[#fd561e] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortBar;
