import { useState } from "react";

const SortBar = ({ busCount, onSortChange }) => {
  const [active, setActive] = useState(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const handleSort = (value) => {
    setActive(value);
    onSortChange(value);
    setIsSortOpen(false);
  };
  
  const sortOptions = [
    { label: "Early Departure", value: "Early Departure" },
    { label: "Late Departure", value: "Late Departure" },
    { label: "Price: High to Low", value: "High to Low" },
    { label: "Price: Low to High", value: "Low to High" },
  ];

  const activeLabel = sortOptions.find(option => option.value === active)?.label || "Sort by";

  return (
    <>
      {/* Mobile View (below md - 768px) */}
      <div className="md:hidden bg-white rounded-lg border border-gray-200 px-3 py-2 mb-3">
        {/* Showing buses text on top */}
        <div className="text-center mb-2">
          <h2 className="text-xs font-medium text-gray-700">
            Showing <span className="font-bold text-[#fd561e]">{busCount}</span>{" "}
            bus{busCount !== 1 ? "es" : ""}
          </h2>
        </div>
        
        {/* Sort dropdown only (Filters button is separate in parent) */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <svg 
                className="w-3.5 h-3.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" 
                />
              </svg>
              <span>Sort by: </span>
              <span className="font-medium text-[#fd561e]">{activeLabel}</span>
            </span>
            <svg 
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isSortOpen && (
            <>
              <div 
                className="fixed inset-0 z-10 bg-black/20" 
                onClick={() => setIsSortOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                      active === option.value
                        ? "bg-[#fd561e] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    } ${option.value === sortOptions[0].value ? "rounded-t-lg" : ""} ${
                      option.value === sortOptions[sortOptions.length - 1].value ? "rounded-b-lg" : ""
                    }`}
                  >
                    {option.label}
                    {active === option.value && (
                      <svg className="inline-block w-3.5 h-3.5 ml-2 float-right" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* iPad View (md to lg - 768px to 1024px) - Showing buses left, sort dropdown right */}
      <div className="hidden md:flex lg:hidden items-center justify-between w-full bg-white rounded-lg border border-gray-200 px-4 py-3 mb-4">
        {/* Left side - Showing buses */}
        <h2 className="text-sm font-medium text-gray-700">
          Showing <span className="font-bold text-[#fd561e]">{busCount}</span>{" "}
          bus{busCount !== 1 ? "es" : ""}
        </h2>

        {/* Right side - Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center justify-between gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors min-w-[180px]"
          >
            <span className="flex items-center gap-2">
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" 
                />
              </svg>
              <span>Sort by: </span>
              <span className="font-medium text-[#fd561e]">{activeLabel}</span>
            </span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isSortOpen && (
            <>
              <div 
                className="fixed inset-0 z-10 bg-black/20" 
                onClick={() => setIsSortOpen(false)}
              />
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      active === option.value
                        ? "bg-[#fd561e] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    } ${option.value === sortOptions[0].value ? "rounded-t-lg" : ""} ${
                      option.value === sortOptions[sortOptions.length - 1].value ? "rounded-b-lg" : ""
                    }`}
                  >
                    {option.label}
                    {active === option.value && (
                      <svg className="inline-block w-4 h-4 ml-2 float-right" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Laptop View (lg and above) - Original design with showing buses left and sort buttons */}
      <div className="hidden lg:flex lg:items-center lg:justify-between w-full bg-white rounded-lg border border-gray-200 px-4 py-3 mb-4">
        {/* Left side - Showing buses */}
        <h2 className="text-sm font-medium text-gray-700">
          Showing <span className="font-bold text-[#fd561e]">{busCount}</span>{" "}
          bus{busCount !== 1 ? "es" : ""}
        </h2>

        {/* Right side - Sort buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Sort by:</span>
          <div className="flex items-center gap-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSort(option.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  active === option.value
                    ? "bg-[#fd561e] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SortBar;