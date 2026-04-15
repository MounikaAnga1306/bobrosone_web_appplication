// src/modules/flights/components/shared/BottomBar.jsx
import React, { useEffect, useState } from 'react';

const BottomBar = ({ 
  selectedFlights = [], 
  totalPrice = 0,
  onContinue,
  onViewDetails,
  isValid = true,
  currency = 'INR',
  type = 'one-way', // 'one-way', 'round-trip', 'multi-city'
  passengerCount = 1
}) => {
  const selectedCount = selectedFlights.filter(Boolean).length;
  const totalLegs = selectedFlights.length;
  const allSelected = selectedCount === totalLegs && totalLegs > 0;

  // ── Smooth slide-up animation ─────────────────────────────────────────────
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (selectedCount > 0) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [selectedCount]);

  if (!mounted) return null;

  // Format flight summary for display
  const getFlightSummary = (flight, index) => {
    if (!flight) return null;
    return {
      leg: index + 1,
      fromCode: flight.origin || flight.from || flight.departureAirport || '???',
      toCode: flight.destination || flight.to || flight.arrivalAirport || '???',
      airline: flight.airlineCode || flight.airline?.substring(0, 2) || '??',
      flightNum: flight.flightNum || flight.flightNumber?.split('-')[1] || '',
      time: flight.departureTime ? new Date(flight.departureTime).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : '--:--',
      price: flight.lowestPrice || flight.price || 0
    };
  };

  const summaries = selectedFlights.map((f, i) => getFlightSummary(f, i)).filter(Boolean);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* Subtle gradient line instead of harsh black border-t */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div
        className="bg-white"
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.08), 0 -1px 4px rgba(0,0,0,0.04)' }}
      >
        {/* Progress Bar (for multi-city) */}
        {type === 'multi-city' && totalLegs > 0 && (
          <div className="w-full bg-gray-200 h-1">
            <div 
              className="bg-[#FD561E] h-1 transition-all duration-300"
              style={{ width: `${(selectedCount / totalLegs) * 100}%` }}
            />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-3">

          {/* ════════════════════════════════════════════
              DESKTOP & TABLET (md+)
          ════════════════════════════════════════════ */}
          <div className="hidden md:flex md:items-center md:justify-between gap-4">

            {/* Left: badge + price */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                ${allSelected ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-[#FD561E]'}
              `}>
                {selectedCount}/{totalLegs || 1}
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {allSelected ? 'Total Price' : `${selectedCount} of ${totalLegs || 1} selected`}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{totalPrice.toLocaleString()}
                </div>
                {passengerCount > 1 && (
                  <div className="text-xs text-gray-400">for {passengerCount} travellers</div>
                )}
              </div>
            </div>

            {/* Center: flight leg cards */}
            {summaries.length > 0 && (
              <div className="flex items-center gap-2 flex-1 overflow-x-auto py-2">
                {summaries.map((summary, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <div className="text-gray-300 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-shrink-0 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                        {type === 'round-trip' 
                          ? (idx === 0 ? 'Outbound' : 'Return')
                          : `Leg ${summary.leg}`}
                      </div>
                      <div className="font-bold text-gray-800 text-sm">
                        {summary.fromCode} <span className="text-[#FD561E]">→</span> {summary.toCode}
                      </div>
                      <div className="text-gray-500 mt-0.5">
                        {summary.airline}{summary.flightNum ? ` ${summary.flightNum}` : ''} · {summary.time} · ₹{summary.price.toLocaleString()}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Right: action buttons */}
            <div className="flex gap-3 flex-shrink-0">
              {allSelected && onViewDetails && (
                <button
                  onClick={onViewDetails}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
                >
                  View Details
                </button>
              )}
              <button
                onClick={onContinue}
                disabled={!allSelected || !isValid}
                className={`
                  px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 min-w-[160px] text-center
                  ${allSelected && isValid
                    ? 'bg-[#FD561E] text-white hover:bg-[#e04e1b] shadow-md hover:shadow-lg active:scale-95 cursor-pointer'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {!allSelected 
                  ? `Select ${type === 'one-way' ? 'flight' : 'all flights'}`
                  : 'Continue →'}
              </button>
            </div>
          </div>

          {/* ════════════════════════════════════════════
              MOBILE (below md)
          ════════════════════════════════════════════ */}
          <div className="md:hidden">

            {/* Row 1: price (left) + flight chips (right) */}
            <div className="flex items-center justify-between gap-2">

              {/* Left: badge + price */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0
                  ${allSelected ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-[#FD561E]'}
                `}>
                  {selectedCount}/{totalLegs || 1}
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 leading-none mb-0.5">
                    {allSelected ? 'Total Price' : `${selectedCount} of ${totalLegs || 1} selected`}
                  </div>
                  <div className="text-lg font-bold text-gray-900 leading-none">
                    ₹{totalPrice.toLocaleString()}
                  </div>
                  {passengerCount > 1 && (
                    <div className="text-[10px] text-gray-400 mt-0.5">for {passengerCount} travellers</div>
                  )}
                </div>
              </div>

              {/* Right: flight chips */}
              {summaries.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {summaries.map((summary, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && (
                        <div className="self-center text-gray-300 flex-shrink-0">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-shrink-0 bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1.5 text-right">
                        <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
                          {type === 'round-trip'
                            ? (idx === 0 ? 'Outbound' : 'Return')
                            : `Leg ${summary.leg}`}
                        </div>
                        <div className="text-xs font-bold text-gray-800 leading-none">
                          {summary.fromCode} <span className="text-[#FD561E]">→</span> {summary.toCode}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {summary.airline}{summary.flightNum ? ` ${summary.flightNum}` : ''} · {summary.time}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Row 2: continue button full width below */}
            <div className="mt-2.5 flex gap-2">
              {allSelected && onViewDetails && (
                <button
                  onClick={onViewDetails}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold text-xs hover:bg-gray-50 transition"
                >
                  Details
                </button>
              )}
              <button
                onClick={onContinue}
                disabled={!allSelected || !isValid}
                className={`
                  flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 text-center
                  ${allSelected && isValid
                    ? 'bg-[#FD561E] text-white hover:bg-[#e04e1b] shadow-md active:scale-95 cursor-pointer'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {!allSelected
                  ? `Select ${type === 'one-way' ? 'flight' : 'flights'}`
                  : 'Continue →'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomBar;