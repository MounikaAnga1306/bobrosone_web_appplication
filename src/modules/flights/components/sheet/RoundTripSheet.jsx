// src/modules/flights/components/sheet/RoundTripSheet.jsx

import React, { useState, useMemo } from 'react';
import BaseSheet from './BaseSheet';
import { formatTime, formatDate, formatDuration, formatPrice } from '../../utils/formatters';
import { 
  FaPlane, 
  FaClock, 
  FaCalendarAlt, 
  FaSuitcase, 
  FaUserFriends,
  FaTag,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaShieldAlt,
  FaExchangeAlt,
  FaUtensils,
  FaChair,
  FaWifi,
  FaTv,
  FaStar,
  FaCrown,
  FaGem,
  FaLongArrowAltRight,
  FaInfoCircle,
  FaClock as FaClockRegular
} from 'react-icons/fa';

const brandColor = '#FD561E';

// Helper for fare badges
const getFareBadgeStyle = (fareName) => {
  const name = fareName?.toLowerCase() || '';
  if (name.includes('flex')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (name.includes('super')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (name.includes('plus') || name.includes('stretch')) return 'bg-green-50 text-green-700 border-green-200';
  if (name.includes('business')) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const getFareIcon = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  if (name.includes('business')) return <FaCrown className="text-[#FD561E]" size={16} />;
  if (name.includes('super')) return <FaStar className="text-[#FD561E]" size={16} />;
  return <FaTag className="text-[#FD561E]" size={14} />;
};

// ============ CONNECTING FLIGHTS COMPONENT ============
const ConnectingFlightDetails = ({ segments, layovers }) => {
  if (!segments || segments.length <= 1) return null;

  return (
    <div className="bg-blue-50 rounded-xl p-4 mb-4">
      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
        <FaInfoCircle className="text-[#FD561E]" />
        Connecting Flight Details
      </h4>
      
      {segments.map((segment, idx) => (
        <div key={idx}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <FaPlane className="text-[#FD561E] text-xs" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{segment.airline || 'Unknown'}</span>
                <span className="text-xs text-gray-500">{segment.flightNumber}</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <span className="font-bold">{formatTime(segment.departureTime)}</span>
                  <span className="text-gray-500 ml-1">{segment.origin}</span>
                  {segment.originTerminal && (
                    <span className="text-xs text-[#FD561E] ml-2">T{segment.originTerminal}</span>
                  )}
                </div>
                <FaLongArrowAltRight className="text-[#FD561E] text-xs" />
                <div>
                  <span className="font-bold">{formatTime(segment.arrivalTime)}</span>
                  <span className="text-gray-500 ml-1">{segment.destination}</span>
                  {segment.destinationTerminal && (
                    <span className="text-xs text-[#FD561E] ml-2">T{segment.destinationTerminal}</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Duration: {formatDuration(segment.duration)}
              </div>
            </div>
          </div>
          
          {/* Layover (except after last segment) */}
          {idx < segments.length - 1 && layovers?.[idx] && (
            <div className="ml-11 mt-3 mb-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FaClockRegular className="text-yellow-600" size={12} />
                  <span className="text-sm font-medium text-yellow-700">
                    Layover at {layovers[idx].airport}
                  </span>
                  <span className="text-sm text-gray-600">
                    {layovers[idx].formattedDuration}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ============ FARE OPTION CARD (like OneWay) ============
const FareOptionCard = ({ fare, isSelected, onSelect, isLowest }) => {
  const [expanded, setExpanded] = useState(false);
  const fareBrand = fare.brand || { name: 'Economy', features: [] };
  const baggage = fare.baggage || { weight: 15, unit: 'kg' };

  return (
    <div className={`border rounded-xl overflow-hidden bg-white transition-all ${
      isSelected ? 'ring-2 ring-[#FD561E] border-transparent' : 'border-gray-200 hover:border-[#FD561E]'
    }`}>
      {/* Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-4 cursor-pointer hover:bg-gray-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getFareBadgeStyle(fareBrand.name)}`}>
              {getFareIcon(fareBrand.name)}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{fareBrand.name}</span>
                {isLowest && (
                  <span className="text-xs bg-[#FD561E] text-white px-2 py-0.5 rounded-full">
                    Best Price
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-1 text-xs">
                <div className="flex items-center gap-1 text-gray-600">
                  <FaSuitcase size={10} className="text-[#FD561E]" />
                  <span>{baggage.weight}{baggage.unit}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <FaChair size={10} className="text-[#FD561E]" />
                  <span>{fare.cabinClass || 'Economy'}</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  fare.refundable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {fare.refundable ? 'Refundable' : 'Non-refundable'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xl font-bold text-[#FD561E]">
                ₹{fare.totalPrice?.toLocaleString()}
              </div>
            </div>
            {expanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t bg-gray-50 p-4 space-y-4">
          {/* Price Breakdown */}
          <div className="bg-white rounded-xl p-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Price Breakdown</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fare:</span>
                <span className="font-medium">₹{fare.basePrice?.toLocaleString() || Math.round(fare.totalPrice * 0.85).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes & Fees:</span>
                <span className="font-medium">
                  ₹{fare.taxes?.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString() || Math.round(fare.totalPrice * 0.15).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-bold text-[#FD561E] pt-2 border-t mt-2">
                <span>Total:</span>
                <span>₹{fare.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Fare Features */}
          {fareBrand.features?.length > 0 && (
            <div className="bg-white rounded-xl p-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Fare Features</h4>
              <ul className="space-y-2">
                {fareBrand.features.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <FaCheckCircle className="text-[#FD561E] mt-0.5 flex-shrink-0" size={14} />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Amenities */}
          <div className="bg-white rounded-xl p-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Amenities</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  fare.amenities?.meals ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <FaUtensils className={fare.amenities?.meals ? 'text-green-600' : 'text-gray-400'} size={12} />
                </div>
                <span className="text-xs text-gray-600">Meals</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  fare.amenities?.seatSelection ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <FaChair className={fare.amenities?.seatSelection ? 'text-green-600' : 'text-gray-400'} size={12} />
                </div>
                <span className="text-xs text-gray-600">Seat Selection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  fare.amenities?.wifi ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <FaWifi className={fare.amenities?.wifi ? 'text-green-600' : 'text-gray-400'} size={12} />
                </div>
                <span className="text-xs text-gray-600">Wi-Fi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                  <FaTv className="text-green-600" size={12} />
                </div>
                <span className="text-xs text-gray-600">Entertainment</span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-white rounded-xl p-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Cancellation Policy</h4>
            <div className="flex items-start gap-2">
              <FaShieldAlt className="text-red-500 mt-1 flex-shrink-0" size={14} />
              <p className="text-sm text-gray-600">
                {fare.penalties?.cancel?.amount 
                  ? `₹${fare.penalties.cancel.amount.toLocaleString()} cancellation fee`
                  : fare.penalties?.cancel?.percentage
                  ? `${fare.penalties.cancel.percentage}% cancellation fee`
                  : fare.refundable 
                    ? 'Refundable with applicable fees'
                    : 'Non-refundable'}
              </p>
            </div>
          </div>

          {/* Select Button */}
          <button
            onClick={() => onSelect(fare)}
            className="w-full py-3 bg-[#FD561E] text-white rounded-lg font-medium hover:bg-[#e04e1b] transition-colors"
          >
            Select This Fare
          </button>
        </div>
      )}
    </div>
  );
};

// ============ FLIGHT SECTION (Tab Content) ============
const FlightSection = ({ flight, type, selectedFare, onFareSelect }) => {
  // Get unique fares for this flight (multiple options)
  const uniqueFares = useMemo(() => {
    if (!flight.fares || flight.fares.length === 0) {
      // If no fares array, create one from flight data
      return [{
        ...flight,
        id: flight.id,
        brand: flight.brand || { name: 'Economy', features: [] },
        totalPrice: flight.lowestPrice || flight.price || 0,
        baggage: flight.baggage || { weight: 15, unit: 'kg' }
      }];
    }
    
    // Deduplicate fares by brand name + price + baggage
    const fareMap = new Map();
    flight.fares.forEach(fare => {
      const key = `${fare.brand?.name}-${fare.totalPrice}-${fare.baggage?.weight}`;
      if (!fareMap.has(key)) {
        fareMap.set(key, fare);
      }
    });
    
    return Array.from(fareMap.values()).sort((a, b) => a.totalPrice - b.totalPrice);
  }, [flight]);

  // Check if this is a connecting flight
  const isConnecting = flight.segments?.length > 1 || flight.stops > 0;
  const segments = flight.segments || (flight.segments ? flight.segments : [flight]);
  const layovers = flight.layovers || [];

  return (
    <div className="space-y-4">
      {/* Flight Summary Header */}
      <div className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          {type === 'outbound' ? <FaPlane className="rotate-45" /> : <FaPlane className="-rotate-45" />}
          <span className="font-medium">{type === 'outbound' ? 'Outbound Flight' : 'Return Flight'}</span>
          {isConnecting && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              Connecting
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{flight.airline}</div>
            <div className="text-white/80 text-sm">{flight.flightNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/80">{formatDate(flight.departureTime)}</div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="text-center">
            <div className="text-xl font-bold">{formatTime(flight.departureTime)}</div>
            <div className="text-white/80 text-xs">{flight.origin}</div>
            {flight.originTerminal && (
              <div className="text-white/60 text-xs">T{flight.originTerminal}</div>
            )}
          </div>
          <div className="flex-1 px-4">
            <div className="text-white/80 text-xs text-center mb-1">
              {formatDuration(flight.duration)}
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-full h-0.5 bg-white/30"></div>
              <FaPlane className="absolute text-white transform rotate-90" size={12} />
            </div>
            <div className="text-white/80 text-xs text-center mt-1">
              {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{formatTime(flight.arrivalTime)}</div>
            <div className="text-white/80 text-xs">{flight.destination}</div>
            {flight.destinationTerminal && (
              <div className="text-white/60 text-xs">T{flight.destinationTerminal}</div>
            )}
          </div>
        </div>
      </div>

      {/* Connecting Flight Details */}
      {isConnecting && <ConnectingFlightDetails segments={segments} layovers={layovers} />}

      {/* Fare Options - Multiple as in OneWay */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <FaTag className="text-[#FD561E]" />
          Select Fare Type ({uniqueFares.length} options)
        </h3>
        
        {uniqueFares.map((fare, index) => (
          <FareOptionCard
            key={fare.id || index}
            fare={fare}
            isSelected={selectedFare?.id === fare.id}
            onSelect={() => onFareSelect(fare)}
            isLowest={index === 0}
          />
        ))}
      </div>
    </div>
  );
};

// ============ MAIN SHEET COMPONENT ============
const RoundTripSheet = ({ isOpen, onClose, outboundFlight, returnFlight, passengerCounts, onFaresSelected }) => {
  const [activeTab, setActiveTab] = useState('outbound');
  const [selectedFares, setSelectedFares] = useState({
    outbound: null,
    return: null
  });

  if (!outboundFlight || !returnFlight) return null;

  const handleFareSelect = (type, fare) => {
    setSelectedFares(prev => ({
      ...prev,
      [type]: fare
    }));
  };

  const totalPrice = (selectedFares.outbound?.totalPrice || outboundFlight.lowestPrice || 0) + 
                     (selectedFares.return?.totalPrice || returnFlight.lowestPrice || 0);

  const isSelectionComplete = selectedFares.outbound && selectedFares.return;

  const handleContinue = () => {
    if (isSelectionComplete && onFaresSelected) {
      onFaresSelected(selectedFares.outbound, selectedFares.return);
    }
    onClose();
  };

  return (
    <BaseSheet isOpen={isOpen} onClose={onClose} title="Select Your Fare">
      {/* Tabs */}
      <div className="flex border-b mb-6 sticky top-0 bg-white z-10">
        <button
          onClick={() => setActiveTab('outbound')}
          className={`flex-1 py-4 text-center font-medium transition-colors relative ${
            activeTab === 'outbound'
              ? 'text-[#FD561E] border-b-2 border-[#FD561E]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Outbound
          {selectedFares.outbound && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={`flex-1 py-4 text-center font-medium transition-colors relative ${
            activeTab === 'return'
              ? 'text-[#FD561E] border-b-2 border-[#FD561E]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Return
          {selectedFares.return && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'outbound' ? (
        <FlightSection
          flight={outboundFlight}
          type="outbound"
          selectedFare={selectedFares.outbound}
          onFareSelect={(fare) => handleFareSelect('outbound', fare)}
        />
      ) : (
        <FlightSection
          flight={returnFlight}
          type="return"
          selectedFare={selectedFares.return}
          onFareSelect={(fare) => handleFareSelect('return', fare)}
        />
      )}

      {/* Selection Summary - Sticky Bottom */}
      {(selectedFares.outbound || selectedFares.return) && (
        <div className="sticky bottom-0 mt-6 p-4 bg-white border-t shadow-lg">
          <h4 className="font-medium text-gray-700 mb-3">Your Selection</h4>
          <div className="space-y-2 mb-4">
            {selectedFares.outbound && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Outbound:</span>
                <span className="font-medium text-[#FD561E]">₹{selectedFares.outbound.totalPrice?.toLocaleString()}</span>
              </div>
            )}
            {selectedFares.return && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Return:</span>
                <span className="font-medium text-[#FD561E]">₹{selectedFares.return.totalPrice?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-[#FD561E]">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100"
            >
              Close
            </button>
            <button
              onClick={handleContinue}
              disabled={!isSelectionComplete}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                isSelectionComplete
                  ? 'bg-[#FD561E] text-white hover:bg-[#e04e1b]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Passenger Info */}
      {passengerCounts && (
        <div className="mt-4 pt-4 border-t text-sm text-gray-500 flex items-center gap-2">
          <FaUserFriends className="text-[#FD561E]" />
          <span>
            {passengerCounts.ADT > 0 && `${passengerCounts.ADT} Adult${passengerCounts.ADT > 1 ? 's' : ''}`}
            {passengerCounts.CNN > 0 && `, ${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`}
            {passengerCounts.INF > 0 && `, ${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`}
          </span>
        </div>
      )}
    </BaseSheet>
  );
};

export default RoundTripSheet;