// src/components/FlightCard.jsx
import React from 'react';

const FlightCard = ({ flight }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{flight.airline}</h3>
          <p className="text-sm text-gray-500 mt-1">{flight.flightNumber}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">₹{flight.price.toLocaleString()}</div>
          <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
            Book
          </button>
        </div>
      </div>

      {/* Flight Details */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-gray-900">{flight.departureTime}</div>
          <div className="text-sm text-gray-600 mt-1">{flight.from}</div>
        </div>

        <div className="flex-2 px-8 text-center">
          <div className="text-sm text-gray-600 mb-2">{flight.duration}</div>
          <div className="relative">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
          </div>
        </div>

        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-gray-900">{flight.arrivalTime}</div>
          <div className="text-sm text-gray-600 mt-1">{flight.to}</div>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-wrap gap-3 mb-4 py-4 border-t border-b border-gray-200">
        {flight.features.map((feature, index) => (
          <span 
            key={index}
            className="bg-gray-50 text-gray-700 px-3 py-1 rounded-full text-sm"
          >
            {feature}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
          Flight Details <span className="ml-1">&gt;</span>
        </button>
        
        {flight.lockPrice && (
          <div className="flex items-center text-green-600 font-medium">
            <span className="mr-2">🔒</span>
            Lock Price @₹{flight.lockPrice}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightCard;