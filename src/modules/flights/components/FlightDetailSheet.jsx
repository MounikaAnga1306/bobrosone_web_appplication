// src/components/flights/FlightDetailSheet.jsx

import React from 'react';
import { FaTimes, FaClock, FaMapMarkerAlt, FaCalendarAlt, FaSuitcase, FaUserFriends } from 'react-icons/fa';
import BrandDetails from './BrandDetails';

const FlightDetailSheet = ({ flight, fare, onClose, passengerCounts }) => {
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

  // Format date for display
  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '';
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
  const departureDate = formatDate(flight.departureTime);
  const duration = formatDuration(flight.duration);
  const airlineName = getAirlineName(flight.airline);

  return (
    <>
      {/* Backdrop - dims the background */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet - slides from right */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">Flight Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Airline & Flight Number */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{airlineName}</span>
              <span className="text-sm text-gray-500">({flight.airline})</span>
            </div>
            <p className="text-lg text-gray-600 mt-1">{flight.flightNumber}</p>
          </div>

          {/* Route Visualization */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              {/* Departure */}
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-gray-900">{departureTime}</div>
                <div className="text-sm text-gray-600 mt-1 flex items-center justify-center">
                  <FaMapMarkerAlt className="mr-1 text-[#FD561E]" />
                  {flight.from}
                </div>
              </div>

              {/* Duration Line */}
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
                  {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-gray-900">{arrivalTime}</div>
                <div className="text-sm text-gray-600 mt-1 flex items-center justify-center">
                  <FaMapMarkerAlt className="mr-1 text-[#FD561E]" />
                  {flight.to}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2">
              <FaCalendarAlt className="text-[#FD561E]" />
              <span className="text-gray-700">{departureDate}</span>
            </div>
          </div>

          {/* Passenger Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <FaUserFriends className="mr-2 text-blue-500" />
              Passenger Details
            </h3>
            <p className="text-gray-600">
              {passengerCounts?.adults || 1} Adult
              {passengerCounts?.children > 0 && `, ${passengerCounts.children} Child${passengerCounts.children > 1 ? 'ren' : ''}`}
              {passengerCounts?.infants > 0 && `, ${passengerCounts.infants} Infant${passengerCounts.infants > 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Fare Details - Using BrandDetails Component */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Fare Details</h3>
            <BrandDetails 
              brand={flight.brand || { name: 'Economy' }} 
              fare={fare || flight} 
              passengerCounts={passengerCounts}
            />
          </div>

          {/* Seats Available */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="text-gray-700 flex items-center">
                <FaSuitcase className="mr-2 text-[#FD561E]" />
                Seats Available
              </span>
              <span className="font-bold text-[#FD561E]">{flight.seatsAvailable} seats</span>
            </div>
          </div>

          {/* Book Button */}
          <button
            className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
            onClick={() => {
              alert('Booking flow to be implemented');
              onClose();
            }}
          >
            Continue to Book
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .fixed.inset-y-0.right-0 {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default FlightDetailSheet;