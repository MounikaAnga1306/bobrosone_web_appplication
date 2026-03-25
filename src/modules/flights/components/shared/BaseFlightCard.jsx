// src/modules/flights/components/flight/BaseFlightCard.jsx

import React, { useState } from 'react';
import BrandBadge from '../shared/BrandBadge';

// Utility functions
const formatTime = (iso) => {
  if (!iso) return '--:--';
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) {
      if (typeof iso === 'string' && iso.match(/^\d{2}:\d{2}$/)) {
        return iso;
      }
      return '--:--';
    }
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } catch {
    return '--:--';
  }
};

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  } catch {
    return '';
  }
};

const formatDuration = (mins) => {
  if (!mins) return '0h 0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

const getAirlineLogo = (airlineCode) => {
  return `https://logo.clearbit.com/${airlineCode?.toLowerCase()}.com` 
    || `/airlines/${airlineCode}.png`;
};

const BaseFlightCard = ({ 
  flight, 
  isSelected, 
  onViewDetails,
  onSelect,
  children,
  showViewDetails = true,
  className = '',
  legIndex,
  type = 'one-way'
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Handle different flight data structures
  const airline = flight.airline || flight.airlineCode || 'Unknown';
  const airlineCode = flight.airlineCode || airline.substring(0, 2).toUpperCase();
  const flightNumber = flight.flightNumber || flight.flightNum || '';
  
  // Prefer ISO strings for formatting
  const departureTime = flight.departureISO || flight.departureTime;
  const arrivalTime = flight.arrivalISO || flight.arrivalTime;
  
  const origin = flight.origin || flight.from;
  const destination = flight.destination || flight.to;
  const duration = flight.duration || 0;
  const stops = flight.stops || 0;
  const price = flight.lowestPrice || flight.price || 0;
  
  // Get terminal information
  const originTerminal = flight.originTerminal || flight.terminal;
  const destinationTerminal = flight.destinationTerminal;
  
  // Get aircraft info
  const aircraft = flight.aircraft || flight.equipment;
  
  // CRITICAL: Get brand from flight or first fare
  const primaryBrand = flight.brand || 
                      (flight.fares && flight.fares[0]?.brand) || 
                      { name: 'Economy', description: '' };
  
  // Check if multiple fare options exist
  const hasMultipleFares = flight.fares && flight.fares.length > 1;
  const fareCount = flight.fares?.length || 1;

  const handleCardClick = (e) => {
    // Prevent click when interacting with buttons
    if (e.target.closest('button') || e.target.closest('.fare-option')) {
      return;
    }
    onSelect?.(flight);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`
        relative bg-white rounded-xl shadow-sm hover:shadow-md 
        transition-all duration-200 border-2 cursor-pointer overflow-hidden
        ${isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200' 
          : 'border-transparent hover:border-gray-200'
        }
        ${className}
      `}
    >
      {/* Selected indicator bar */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
      )}

      {/* Multiple fare indicator badge */}
      {hasMultipleFares && (
        <div className="absolute top-3 right-3 bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full z-10">
          {fareCount} fare options
        </div>
      )}

      <div className="p-5">
        {/* Header: Airline + Flight Number + Brand Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            {/* Airline Logo with fallback */}
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
              {!imageError ? (
                <img 
                  src={getAirlineLogo(airlineCode)}
                  alt={airline}
                  className="w-8 h-8 object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{airlineCode}</span>
                </div>
              )}
            </div>
            
            <div>
              <div className="font-semibold text-gray-900">{airline}</div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{flightNumber}</span>
                {aircraft && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{aircraft}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <BrandBadge brand={primaryBrand} size="md" />
        </div>

        {/* Times & Route Visualization */}
        <div className="flex items-center justify-between mb-4">
          {/* Departure */}
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-gray-900">
              {formatTime(departureTime)}
            </div>
            <div className="text-sm font-medium text-gray-700">{origin}</div>
            <div className="text-xs text-gray-400">
              {formatDate(departureTime)}
            </div>
            {originTerminal && (
              <div className="text-[10px] font-medium text-blue-600 mt-1">
                T{originTerminal}
              </div>
            )}
          </div>

          {/* Duration & Stops Visualization */}
          <div className="flex-1 px-6">
            <div className="text-xs text-gray-500 text-center mb-1 font-medium">
              {formatDuration(duration)}
            </div>
            
            <div className="relative py-2">
              {/* Flight path line */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2"></div>
              
              {/* Origin dot */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
              
              {/* Destination dot */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
              
              {/* Stop indicators */}
              {stops > 0 && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-[8px] font-bold text-gray-600">{stops}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-600 text-center font-medium">
              {stops === 0 ? (
                <span className="text-green-600">Nonstop</span>
              ) : (
                <span>{stops} stop{stops > 1 ? 's' : ''}</span>
              )}
            </div>
          </div>

          {/* Arrival */}
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-gray-900">
              {formatTime(arrivalTime)}
            </div>
            <div className="text-sm font-medium text-gray-700">{destination}</div>
            <div className="text-xs text-gray-400">
              {formatDate(arrivalTime)}
            </div>
            {destinationTerminal && (
              <div className="text-[10px] font-medium text-blue-600 mt-1">
                T{destinationTerminal}
              </div>
            )}
          </div>
        </div>

        {/* Trip Type Indicators */}
        {(type === 'multi-city' || type === 'round-trip') && legIndex !== undefined && (
          <div className="mb-3">
            <span className={`
              inline-block px-2 py-1 text-xs font-medium rounded-full
              ${type === 'round-trip' && legIndex === 0 ? 'bg-blue-100 text-blue-700' : ''}
              ${type === 'round-trip' && legIndex === 1 ? 'bg-green-100 text-green-700' : ''}
              ${type === 'multi-city' ? 'bg-purple-100 text-purple-700' : ''}
            `}>
              {type === 'round-trip' 
                ? (legIndex === 0 ? '✈️ Outbound' : '🔄 Return')
                : `Leg ${legIndex + 1} of ${type === 'multi-city' ? flight.totalLegs || 3 : ''}`
              }
            </span>
          </div>
        )}

        {/* Layover Information (if any) */}
        {flight.layovers && flight.layovers.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {flight.layovers.map((layover, idx) => (
              <div key={idx} className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {layover.airport}: {layover.formattedDuration}
              </div>
            ))}
          </div>
        )}

        {/* Custom Selection UI (for fare options, etc.) */}
        {children}

        {/* Footer: View Details + Price Summary */}
        <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            {showViewDetails && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(flight);
                }}
                className="group flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span>View details</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Fare Count Indicator */}
            {hasMultipleFares && (
              <div className="flex items-center text-xs text-purple-600">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {fareCount} fare types
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="flex items-baseline">
              <span className="text-xs text-gray-500 mr-1">from</span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{price.toLocaleString()}
              </span>
            </div>
            {hasMultipleFares && (
              <div className="text-xs text-gray-500">
                {flight.fares?.length} options • Best price shown
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 
        hover:opacity-5 pointer-events-none transition-opacity duration-300
      `}></div>
    </div>
  );
};

export default BaseFlightCard;