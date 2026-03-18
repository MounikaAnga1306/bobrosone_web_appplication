// src/modules/flights/components/shared/BottomBar.jsx
import React from 'react';

const BottomBar = ({ 
  selectedFlights = [], 
  totalPrice = 0,
  onContinue,
  onViewDetails,
  isValid = true,
  currency = 'INR',
  type = 'one-way' // 'one-way', 'round-trip', 'multi-city'
}) => {
  const selectedCount = selectedFlights.filter(Boolean).length;
  const totalLegs = selectedFlights.length;
  const allSelected = selectedCount === totalLegs && totalLegs > 0;

  // Format flight summary for display
  const getFlightSummary = (flight, index) => {
    if (!flight) return null;
    return {
      leg: index + 1,
      airline: flight.airlineCode || flight.airline?.substring(0, 2) || '??',
      flightNum: flight.flightNum || flight.flightNumber?.split('-')[1] || '',
      time: flight.departureTime ? new Date(flight.departureTime).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : '--:--',
      price: flight.price || 0
    };
  };

  const summaries = selectedFlights.map((f, i) => getFlightSummary(f, i)).filter(Boolean);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
      {/* Progress Bar (for multi-city) */}
      {type === 'multi-city' && totalLegs > 0 && (
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-blue-600 h-1 transition-all duration-300"
            style={{ width: `${(selectedCount / totalLegs) * 100}%` }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Left Section - Selection Status & Price */}
          <div className="flex items-center gap-4">
            {/* Selection Badge */}
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold
              ${allSelected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
              }
            `}>
              {selectedCount}/{totalLegs || 1}
            </div>
            
            {/* Price */}
            <div>
              <div className="text-sm text-gray-600">
                {allSelected ? 'Total Price' : `${selectedCount} of ${totalLegs || 1} selected`}
              </div>
              <div className="text-2xl font-bold text-blue-600">
                ₹{totalPrice.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Center Section - Flight Summary (Desktop) */}
          {summaries.length > 0 && (
            <div className="hidden lg:flex items-center gap-2 flex-1 overflow-x-auto py-2">
              {summaries.map((summary, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <div className="text-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-shrink-0 bg-gray-50 rounded-lg px-3 py-2 text-xs">
                    <div className="text-gray-500">
                      {type === 'round-trip' 
                        ? (idx === 0 ? 'Outbound' : 'Return')
                        : `Leg ${summary.leg}`
                      }
                    </div>
                    <div className="font-medium">
                      {summary.airline} {summary.flightNum}
                    </div>
                    <div className="text-gray-600">
                      {summary.time} · ₹{summary.price.toLocaleString()}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Right Section - Action Buttons */}
          <div className="flex gap-3">
            {/* View Details Button (when all selected) */}
            {allSelected && onViewDetails && (
              <button
                onClick={onViewDetails}
                className="px-6 py-3 border border-blue-300 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                View Details
              </button>
            )}

            {/* Continue Button */}
            <button
              onClick={onContinue}
              disabled={!allSelected || !isValid}
              className={`
                px-8 py-3 rounded-lg font-semibold transition min-w-[160px]
                ${allSelected && isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {!allSelected 
                ? `Select ${type === 'one-way' ? 'flight' : 'all flights'}`
                : 'Continue'
              }
            </button>
          </div>
        </div>

        {/* Mobile Flight Summary */}
        {summaries.length > 0 && (
          <div className="lg:hidden mt-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {summaries.map((summary, idx) => (
                <div key={idx} className="flex-shrink-0 bg-gray-50 rounded-lg px-3 py-2 text-xs">
                  <div className="text-gray-500">
                    {type === 'round-trip' 
                      ? (idx === 0 ? 'Outbound' : 'Return')
                      : `Leg ${summary.leg}`
                    }
                  </div>
                  <div className="font-medium">
                    {summary.airline} {summary.flightNum}
                  </div>
                  <div className="text-gray-600">
                    {summary.time} · ₹{summary.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomBar;