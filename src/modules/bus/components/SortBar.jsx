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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <h2 className="text-sm font-bold text-gray-800">
        Showing <span className="text-orange-500">{busCount}</span> buses
      </h2>

      <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
        {sortOptions.map((option) => (
          <button
            key={option}
            onClick={() => setActive(option)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
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
  );
};

export default SortBar;
