// src/modules/flights/components/flight/RoundTripFlightCard.jsx

import React, { useState, useMemo } from 'react';
import BaseFlightCard from './BaseFlightCard';
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaSuitcase, 
  FaChair, 
  FaTag,
  FaClock,
  FaPlane,
  FaArrowLeft,
  FaStar,
  FaCrown,
  FaGem
} from 'react-icons/fa';

// Helper functions
const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch {
    return '--:--';
  }
};

const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

// Brand color
const brandColor = '#FD561E';

// Get badge color based on fare type
const getFareBadgeStyle = (fareName) => {
  const name = fareName?.toLowerCase() || '';
  if (name.includes('flex')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (name.includes('super')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (name.includes('plus') || name.includes('stretch')) return 'bg-green-50 text-green-700 border-green-200';
  if (name.includes('business')) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

// Get fare icon based on brand
const getFareIcon = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  if (name.includes('business')) return <FaCrown className="text-[#FD561E]" size={14} />;
  if (name.includes('super')) return <FaStar className="text-[#FD561E]" size={14} />;
  return <FaTag className="text-[#FD561E]" size={12} />;
};

const RoundTripFlightCard = ({ 
  flight, 
  isSelected, 
  onSelect, 
  onViewDetails,
  legIndex 
}) => {
  const [showFareSummary, setShowFareSummary] = useState(false);
  
  // Ensure we have valid time
  const flightWithValidTime = {
    ...flight,
    departureTime: flight.departureTime || flight.departureISO || flight.departure,
    arrivalTime: flight.arrivalTime || flight.arrivalISO || flight.arrival,
    departureISO: flight.departureISO || flight.departureTime || flight.departure,
    arrivalISO: flight.arrivalISO || flight.arrivalTime || flight.arrival,
  };

  // Get unique fares
  const uniqueFares = useMemo(() => {
    if (!flight.fares || flight.fares.length === 0) return [];
    
    const fareMap = new Map();
    flight.fares.forEach(fare => {
      const key = `${fare.brand?.name}-${fare.totalPrice}-${fare.baggage?.weight}`;
      if (!fareMap.has(key)) {
        fareMap.set(key, fare);
      }
    });
    
    return Array.from(fareMap.values()).sort((a, b) => a.totalPrice - b.totalPrice);
  }, [flight.fares]);

  const lowestFare = uniqueFares[0];
  const hasMultipleFares = uniqueFares.length > 1;

  const handleSelect = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(flightWithValidTime);
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(flightWithValidTime);
    }
  };

  const toggleFareSummary = (e) => {
    e.stopPropagation();
    setShowFareSummary(!showFareSummary);
  };

  return (
    <div className="relative mb-4">
      {/* Radio Button */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <div 
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
            isSelected 
              ? 'border-[#FD561E]' 
              : 'border-gray-300 hover:border-[#FD561E]'
          }`}
          onClick={handleSelect}
          role="radio"
          aria-checked={isSelected}
        >
          {isSelected && (
            <div className="w-3 h-3 rounded-full bg-[#FD561E]"></div>
          )}
        </div>
      </div>
      
      {/* Main Card */}
      <div className="pl-8">
        {/* Leg Indicator */}
        <div className="mb-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
            ${legIndex === 0 ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
            {legIndex === 0 ? (
              <>
                <FaPlane className="rotate-45" size={10} />
                Outbound
              </>
            ) : (
              <>
                <FaArrowLeft className="rotate-45" size={10} />
                Return
              </>
            )}
          </span>
        </div>

        {/* Base Flight Card */}
        <div onClick={handleSelect}>
          <BaseFlightCard
            flight={flightWithValidTime}
            isSelected={isSelected}
            onViewDetails={handleViewDetails}
            type="round-trip"
            legIndex={legIndex}
            showViewDetails={false}
          />
        </div>

        {/* Fare Summary Section */}
        <div className="mt-2">
          {/* Price Summary Bar */}
          <div 
            onClick={toggleFareSummary}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <FaTag className="text-[#FD561E]" />
              <span className="font-medium text-gray-700">
                {hasMultipleFares ? `${uniqueFares.length} fares available` : 'Fare details'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {lowestFare && (
                <span className="text-sm font-medium text-[#FD561E]">
                  ₹{lowestFare.totalPrice?.toLocaleString()}+
                </span>
              )}
              {showFareSummary ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
            </div>
          </div>

          {/* Expanded Fare Options */}
          {showFareSummary && (
            <div className="mt-2 space-y-2 p-3 bg-white border border-gray-200 rounded-xl">
              {uniqueFares.map((fare, index) => (
                <div 
                  key={fare.id || index}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFareBadgeStyle(fare.brand?.name)}`}>
                      {getFareIcon(fare.brand?.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{fare.brand?.name || 'Economy'}</span>
                        {index === 0 && (
                          <span className="text-[10px] bg-[#FD561E] text-white px-2 py-0.5 rounded-full">
                            Best
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaSuitcase size={10} className="text-[#FD561E]" />
                          {fare.baggage?.weight || 15}{fare.baggage?.unit || 'kg'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaChair size={10} className="text-[#FD561E]" />
                          {fare.cabinClass || 'Economy'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#FD561E]">
                      ₹{fare.totalPrice?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleViewDetails}
                className="w-full mt-2 py-2.5 bg-[#FD561E] text-white rounded-lg font-medium hover:bg-[#e04e1b] transition-colors"
              >
                View All Fare Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundTripFlightCard;