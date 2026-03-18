// src/modules/flights/components/sheet/MultiCitySheet.jsx
import React, { useState } from 'react';
import BaseSheet from './BaseSheet';
import { formatTime, formatDate, formatDuration, formatPrice } from '../../utils/formatters';
import { FaPlane, FaClock, FaCalendarAlt, FaSuitcase } from 'react-icons/fa';

const MultiCitySheet = ({ isOpen, onClose, legs = [], passengerCounts }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!legs.length) return null;

  const FlightDetails = ({ flight, legIndex }) => (
    <div className="space-y-6">
      {/* Airline & Flight Info */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold">{flight.airline}</div>
            <div className="text-gray-600 mt-1">{flight.flightNumber}</div>
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            {flight.brand?.name || 'Economy'}
          </span>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Leg {legIndex + 1}: {flight.origin} → {flight.destination}
        </div>
      </div>

      {/* Route Summary */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-3xl font-bold">{formatTime(flight.departureTime)}</div>
            <div className="text-sm text-gray-600 mt-1">{flight.origin}</div>
          </div>

          <div className="flex-2 px-8 text-center">
            <div className="text-sm text-gray-600 mb-2 flex items-center justify-center">
              <FaClock className="mr-1" />
              {formatDuration(flight.duration)}
            </div>
            <div className="relative">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
            </div>
          </div>

          <div className="text-center flex-1">
            <div className="text-3xl font-bold">{formatTime(flight.arrivalTime)}</div>
            <div className="text-sm text-gray-600 mt-1">{flight.destination}</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-center gap-2">
          <FaCalendarAlt className="text-purple-500" />
          <span className="text-gray-700 font-medium">{formatDate(flight.departureTime)}</span>
        </div>
      </div>

      {/* Baggage & Fare Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <h3 className="font-semibold mb-2">Baggage</h3>
          <p className="text-2xl font-bold">{flight.baggage?.weight}{flight.baggage?.unit}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <h3 className="font-semibold mb-2">Fare</h3>
          <p className="text-2xl font-bold text-purple-600">{formatPrice(flight.price)}</p>
        </div>
      </div>
    </div>
  );

  return (
    <BaseSheet isOpen={isOpen} onClose={onClose} title="Multi-City Flight Details">
      {/* Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {legs.map((leg, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === index
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Leg {index + 1}: {leg.origin} → {leg.destination}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <FlightDetails flight={legs[activeTab]} legIndex={activeTab} />
    </BaseSheet>
  );
};

export default MultiCitySheet;