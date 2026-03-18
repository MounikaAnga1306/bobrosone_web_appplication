// src/modules/flights/components/sheet/RoundTripSheet.jsx
import React, { useState } from 'react';
import BaseSheet from './BaseSheet';
import { formatTime, formatDate, formatDuration, formatPrice } from '../../utils/formatters';
import { FaPlane, FaClock, FaCalendarAlt, FaSuitcase, FaUserFriends } from 'react-icons/fa';

const RoundTripSheet = ({ isOpen, onClose, outboundFlight, returnFlight, passengerCounts }) => {
  const [activeTab, setActiveTab] = useState('outbound');

  if (!outboundFlight || !returnFlight) return null;

  const FlightDetails = ({ flight, type }) => (
    <div className="space-y-6">
      {/* Airline & Flight Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold">{flight.airline}</div>
            <div className="text-gray-600 mt-1">{flight.flightNumber}</div>
          </div>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
            {flight.brand?.name || 'Economy'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
          <div className="flex items-center text-gray-600">
            <FaPlane className="mr-2 text-indigo-500" />
            <span>Aircraft: {flight.aircraft || flight.equipment || 'Unknown'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span>Terminal: {flight.terminal || flight.originTerminal || 'Unknown'}</span>
          </div>
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
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
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
          <FaCalendarAlt className="text-indigo-500" />
          <span className="text-gray-700 font-medium">{formatDate(flight.departureTime)}</span>
        </div>
      </div>

      {/* Baggage & Fare Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaSuitcase className="text-green-600" />
            <h3 className="font-semibold">Baggage</h3>
          </div>
          <p className="text-2xl font-bold">{flight.baggage?.weight}{flight.baggage?.unit}</p>
          <p className="text-sm text-gray-600">Check-in baggage</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="font-semibold mb-2">Fare</h3>
          <p className="text-2xl font-bold text-blue-600">{formatPrice(flight.price)}</p>
          <p className="text-sm text-gray-600">{flight.brand?.name}</p>
        </div>
      </div>

      {/* Fare Details from Brand */}
      {flight.brand?.description && (
        <div className="border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Fare Details</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">{flight.brand.description}</p>
        </div>
      )}
    </div>
  );

  return (
    <BaseSheet isOpen={isOpen} onClose={onClose} title="Round Trip Details">
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('outbound')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'outbound'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Outbound
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'return'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Return
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'outbound' ? (
        <FlightDetails flight={outboundFlight} type="outbound" />
      ) : (
        <FlightDetails flight={returnFlight} type="return" />
      )}

      {/* Passenger Info */}
      {passengerCounts && (
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-2 text-gray-600">
            <FaUserFriends />
            <span>
              {passengerCounts.adults} Adult{passengerCounts.adults > 1 ? 's' : ''}
              {passengerCounts.children > 0 && `, ${passengerCounts.children} Child${passengerCounts.children > 1 ? 'ren' : ''}`}
              {passengerCounts.infants > 0 && `, ${passengerCounts.infants} Infant${passengerCounts.infants > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      )}
    </BaseSheet>
  );
};

export default RoundTripSheet;