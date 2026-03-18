// src/modules/flights/components/flight/BaseFlightCard.jsx
import React from 'react';
import BrandBadge from '../shared/BrandBadge';

// Utility functions (can be moved to utils later)
const formatTime = (iso) => {
  if (!iso) return '--:--';
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } catch {
    return '--:--';
  }
};

const formatDuration = (mins) => {
  if (!mins) return '0h 0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    });
  } catch {
    return '';
  }
};

const BaseFlightCard = ({ 
  flight, 
  isSelected, 
  onViewDetails,
  children, // For custom selection UI (radio/checkbox)
  showViewDetails = true,
  className = '',
  legIndex,
  type = 'one-way'
}) => {
  // Handle different flight data structures
  const airline = flight.airline || flight.airlineCode || 'Unknown';
  const airlineCode = flight.airlineCode || airline.substring(0, 2);
  const flightNumber = flight.flightNumber || flight.flightNum || '';
  const departureTime = flight.departureTime || flight.departureISO;
  const arrivalTime = flight.arrivalTime || flight.arrivalISO;
  const origin = flight.origin || flight.from;
  const destination = flight.destination || flight.to;
  const duration = flight.duration || 0;
  const stops = flight.stops || 0;
  const price = flight.lowestPrice || flight.price || 0;
  
  // Get primary brand (first fare or flight brand)
  const primaryBrand = flight.brand || flight.fares?.[0]?.brand || { name: 'Economy' };
  
  // Check if multiple fare options exist
  const hasMultipleFares = flight.fares && flight.fares.length > 1;

  return (
    <div 
      className={`
        border rounded-lg p-4 transition-all mb-3
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200'
        }
        ${className}
      `}
    >
      {/* Header: Airline + Flight Number + Badge */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          {/* Airline Logo Placeholder */}
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
            <span className="text-xs font-bold">{airlineCode}</span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{airline}</div>
            <div className="text-xs text-gray-500">{flightNumber}</div>
          </div>
        </div>
        
        <BrandBadge brand={primaryBrand} size="sm" />
      </div>

      {/* Times & Duration */}
      <div className="flex items-center justify-between mb-3">
        {/* Departure */}
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-gray-900">
            {formatTime(departureTime)}
          </div>
          <div className="text-xs text-gray-500">{origin}</div>
          {type === 'multi-city' && legIndex !== undefined && (
            <div className="text-[10px] text-gray-400 mt-1">Leg {legIndex + 1}</div>
          )}
        </div>

        {/* Duration & Stops */}
        <div className="flex-1 px-4">
          <div className="text-xs text-gray-400 text-center mb-1">
            {formatDuration(duration)}
          </div>
          <div className="relative">
            <div className="border-t border-gray-300 absolute w-full top-1/2"></div>
            <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-gray-400"></div>
            <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-gray-400"></div>
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">
            {stops === 0 ? 'Non-stop' : stops === 1 ? '1 stop' : `${stops} stops`}
          </div>
        </div>

        {/* Arrival */}
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-gray-900">
            {formatTime(arrivalTime)}
          </div>
          <div className="text-xs text-gray-500">{destination}</div>
          {type === 'round-trip' && legIndex !== undefined && (
            <div className="text-[10px] text-gray-400 mt-1">
              {legIndex === 0 ? 'Outbound' : 'Return'}
            </div>
          )}
        </div>
      </div>

      {/* Custom Selection UI (Radio/Checkbox) */}
      {children}

      {/* Footer: Price + View Details */}
      <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
        {showViewDetails ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(flight);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details →
          </button>
        ) : <div />}

        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            ₹{price.toLocaleString()}
          </div>
          {hasMultipleFares && (
            <div className="text-xs text-gray-500">
              +{flight.fares.length - 1} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseFlightCard;