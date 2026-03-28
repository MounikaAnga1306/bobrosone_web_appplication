// src/modules/flights/components/multicity/JourneySummaryBar.jsx

import React from 'react';
import { formatPrice, formatTime } from '../../utils/multiCityHelpers';

const JourneySummaryBar = ({
  legs = [],
  selectedFlights = [],
  totalPrice = 0,
  currency = 'INR',
  onContinue,
  isValidCombination = false,
  isEnabled = true
}) => {
  const legCount = legs.length;
  const selectedCount = selectedFlights.filter(Boolean).length;
  const allSelected = selectedCount === legCount;
  const progressPercentage = legCount > 0 ? (selectedCount / legCount) * 100 : 0;

  // Get flight summary for display
  const getFlightSummary = (flight, legIndex) => {
    if (!flight) return null;
    return {
      leg: legIndex + 1,
      airline: flight.airlineCode || flight.airline,
      flightNum: flight.flightNum || flight.flightNumber,
      time: formatTime(flight.departureTime),
      price: flight.price || 0
    };
  };

  const selectedSummaries = selectedFlights
    .map((flight, idx) => getFlightSummary(flight, idx))
    .filter(Boolean);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-blue-600 h-1 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Left Section - Progress & Price */}
          <div className="flex items-center gap-4">
            {/* Selection Progress */}
            <div className="flex items-center gap-2">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${allSelected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
                }
              `}>
                {selectedCount}/{legCount}
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  {allSelected ? 'All legs selected!' : `${selectedCount} of ${legCount} legs`}
                </div>
                <div className="text-xs text-gray-400">
                  {isValidCombination 
                    ? '✓ Valid combination' 
                    : allSelected 
                      ? '⚠️ Selected flights cannot be combined'
                      : 'Select flights to continue'
                  }
                </div>
              </div>
            </div>

            {/* Total Price */}
            <div className="border-l pl-4 ml-2">
              <div className="text-sm text-gray-600">Total Price</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(totalPrice, currency)}
              </div>
            </div>
          </div>

          {/* Center Section - Selected Flights Summary (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 flex-1 overflow-x-auto py-2">
            {selectedSummaries.length > 0 ? (
              selectedSummaries.map((summary, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <div className="text-gray-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-shrink-0 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-500">Leg {summary.leg}</div>
                    <div className="font-medium text-sm">
                      {summary.airline} {summary.flightNum}
                    </div>
                    <div className="text-xs text-gray-600">
                      {summary.time} • {formatPrice(summary.price, currency)}
                    </div>
                  </div>
                </React.Fragment>
              ))
            ) : (
              <div className="text-sm text-gray-400 italic">
                No flights selected yet
              </div>
            )}
          </div>

          {/* Right Section - Continue Button */}
          <div className="flex gap-3">
            {/* Mobile Flight Summary Trigger (optional) */}
            <button
              className="lg:hidden px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={() => {
                // You can implement a mobile summary modal here
                alert('Selected flights: ' + selectedSummaries.length);
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>

            {/* Continue Button */}
            <button
              onClick={onContinue}
              disabled={!allSelected || !isValidCombination || !isEnabled}
              className={`
                px-8 py-3 rounded-lg font-semibold transition min-w-[200px]
                ${allSelected && isValidCombination && isEnabled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {!allSelected 
                ? `Select all ${legCount} legs`
                : !isValidCombination
                  ? 'Combination unavailable'
                  : 'Continue to Book'
              }
            </button>
          </div>
        </div>

        {/* Mobile Flight Summary (Horizontal Scroll) */}
        <div className="lg:hidden mt-4 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {selectedSummaries.length > 0 ? (
              selectedSummaries.map((summary, idx) => (
                <div key={idx} className="flex-shrink-0 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-xs text-gray-500">Leg {summary.leg}</div>
                  <div className="font-medium text-sm">
                    {summary.airline} {summary.flightNum}
                  </div>
                  <div className="text-xs text-gray-600">
                    {summary.time} • {formatPrice(summary.price, currency)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 italic py-2">
                No flights selected yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneySummaryBar;