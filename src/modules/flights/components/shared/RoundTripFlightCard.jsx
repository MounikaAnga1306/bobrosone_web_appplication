// src/modules/flights/components/flight/RoundTripFlightCard.jsx
import React from 'react';
import BaseFlightCard from './BaseFlightCard';

const formatTimeForDisplay = (isoString) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:--';
    
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } catch {
    return '--:--';
  }
};

const RoundTripFlightCard = ({ 
  flight, 
  isSelected, 
  onSelect, 
  onViewDetails,
  legIndex 
}) => {
  console.log('🎫 RoundTripFlightCard received flight:', flight.id);
  console.log('🎫 onViewDetails prop:', !!onViewDetails);

  // Ensure we have valid time for the sheet with fallbacks
  const flightWithValidTime = {
    ...flight,
    departureTime: flight.departureTime || flight.departureISO || flight.departure,
    arrivalTime: flight.arrivalTime || flight.arrivalISO || flight.arrival,
    departureISO: flight.departureISO || flight.departureTime || flight.departure,
    arrivalISO: flight.arrivalISO || flight.arrivalTime || flight.arrival,
  };

  const handleViewDetails = (e) => {
    console.log('👆 View Details clicked in RoundTripFlightCard for flight:', flight.id);
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    // Call the parent's onViewDetails with the flight
    if (onViewDetails) {
      onViewDetails(flightWithValidTime);
    } else {
      console.error('❌ onViewDetails is not defined!');
    }
  };

  const handleSelect = (e) => {
    console.log('👆 Select clicked for flight:', flight.id);
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (onSelect) {
      onSelect(flightWithValidTime);
    }
  };

  return (
    <div className="relative pl-8">
      {/* Radio Button */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <div 
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
            isSelected 
              ? 'border-[#FD561E]' 
              : 'border-gray-300 hover:border-[#FD561E]'
          }`}
          onClick={handleSelect}
          role="radio"
          aria-checked={isSelected}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelect(e);
            }
          }}
        >
          {isSelected && (
            <div className="w-3 h-3 rounded-full bg-[#FD561E]"></div>
          )}
        </div>
      </div>
      
      {/* Clickable area for card - only handles selection */}
      <div 
        className="cursor-pointer"
        onClick={handleSelect}
      >
        <BaseFlightCard
          flight={flightWithValidTime}
          isSelected={isSelected}
          onViewDetails={handleViewDetails}  // This passes our handler
          type="round-trip"
          legIndex={legIndex}
        />
      </div>
    </div>
  );
};

export default RoundTripFlightCard;