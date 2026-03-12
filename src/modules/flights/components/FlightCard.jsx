// src/components/flights/FlightCard.jsx

import React from 'react';
import { FaClock, FaSuitcase, FaMapMarkerAlt, FaPlane } from 'react-icons/fa';

const FlightCard = ({ flight, passengerCounts, onClick }) => {
  if (!flight) return null;

  // Format time from ISO to HH:MM
  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '--:--';
    }
  };

  // Format duration from minutes to "Xh Ym"
  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m';
    const mins = parseInt(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  // Get airline name from code
  const getAirlineName = (code) => {
    const airlines = {
      'AI': 'Air India',
      '6E': 'IndiGo',
      'SG': 'SpiceJet',
      'UK': 'Vistara',
      'G8': 'GoAir',
      'I5': 'AirAsia India',
      '9W': 'Jet Airways',
      'S2': 'Air India Express',
      'QP': 'Akasa Air'
    };
    return airlines[code] || code;
  };

  const departureTime = formatTime(flight.departureTime);
  const arrivalTime = formatTime(flight.arrivalTime);
  const duration = formatDuration(flight.duration);
  const airlineName = getAirlineName(flight.airline);
  
  // Calculate per adult price if needed
  const adults = passengerCounts?.adults || 1;
  const perAdultPrice = Math.round(flight.price / adults);

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-[#FD561E] hover:border-2"
      onClick={() => onClick?.(flight)}
    >
      {/* Airline & Flight Number */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">{airlineName}</span>
            <span className="text-sm text-gray-500">({flight.airline})</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{flight.flightNumber}</p>
        </div>
        
        {/* Price */}
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Total for {adults} Adult{adults > 1 ? 's' : ''}</div>
          <div className="text-2xl font-bold text-[#FD561E]">
            ₹{flight.price.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ₹{perAdultPrice.toLocaleString()} per adult
          </div>
        </div>
      </div>

      {/* Route Visualization */}
      <div className="flex items-center justify-between mb-4 px-4">
        {/* Departure */}
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-gray-900">{departureTime}</div>
          <div className="text-sm text-gray-600 mt-1 flex items-center justify-center">
            <FaMapMarkerAlt className="mr-1 text-[#FD561E] text-xs" />
            {flight.from}
          </div>
        </div>

        {/* Duration & Line */}
        <div className="flex-2 px-8 text-center">
          <div className="text-sm text-gray-600 mb-2 flex items-center justify-center">
            <FaClock className="mr-1 text-gray-400" />
            {duration}
          </div>
          <div className="relative">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#FD561E] rounded-full"></div>
              <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
              <div className="w-2 h-2 bg-[#FD561E] rounded-full"></div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
          </div>
        </div>

        {/* Arrival */}
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-gray-900">{arrivalTime}</div>
          <div className="text-sm text-gray-600 mt-1 flex items-center justify-center">
            <FaMapMarkerAlt className="mr-1 text-[#FD561E] text-xs" />
            {flight.to}
          </div>
        </div>
      </div>

      {/* Baggage Info */}
      {flight.baggage && (
        <div className="flex items-center gap-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaSuitcase className="text-[#FD561E]" />
            <span>Check-in: {flight.baggage.weight}{flight.baggage.unit}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaSuitcase className="text-[#FD561E]" />
            <span>Cabin: 7kg</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              {flight.seatsAvailable} seats left
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
        <button 
          className="text-sm text-[#FD561E] hover:text-[#e04e1b] font-medium flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(flight);
          }}
        >
          View Details →
        </button>
        
        {flight.brand && (
          <span className="text-xs bg-orange-100 text-[#FD561E] px-2 py-1 rounded">
            {flight.brand}
          </span>
        )}
      </div>
    </div>
  );
};

export default FlightCard;