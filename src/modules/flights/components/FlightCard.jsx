// src/modules/flights/components/FlightCard.jsx

import React, { useState } from 'react';
import { 
  FaClock, 
  FaSuitcase, 
  FaMapMarkerAlt, 
  FaPlane,
  FaChevronDown,
  FaChevronUp,
  FaUtensils,
  FaChair,
  FaExchangeAlt,
  FaShieldAlt,
  FaCrown,
  FaTag,
  FaTimes,
  FaCheckCircle,
  FaArrowRight,
  FaBolt
} from 'react-icons/fa';

const FlightCard = ({ flight,  onFlightSelect }) => {
  const [showAllFares, setShowAllFares] = useState(false);
  
  if (!flight) return null;

  // ============ DATA EXTRACTION ============
  
  // Basic flight info
  const airlineCode = flight.airlineCode || 'Unknown';
  const airlineName = flight.airline || airlineCode;
  const flightNumber = flight.flightNumber || '';
  const from = flight.from || flight.origin || '';
  const to = flight.to || flight.destination || '';
  
  // Times (already formatted by parent)
  const departureTime = flight.displayDepartureTime || '--:--';
  const arrivalTime = flight.displayArrivalTime || '--:--';
  const duration = flight.displayDuration || '0h 0m';
  
  // Stops
  const stops = flight.stops || 0;
  const stopText = stops === 0 ? 'Non-stop' : stops === 1 ? '1 Stop' : `${stops} Stops`;
  
  // All fares for this flight
  const allFares = flight.fares || [];
  
  // Get lowest price from fares
  const lowestPrice = allFares.length > 0 ? Math.min(...allFares.map(f => f.price)) : 0;
  const lowestFare = allFares.find(f => f.price === lowestPrice) || allFares[0] || {};

  // ============ HELPER FUNCTIONS ============

  // Get color based on brand
 

  // Get icon based on brand
  

  // Get brand badge style
  const getBrandBadge = (brandName) => {
    const name = brandName?.toLowerCase() || '';
    if (name.includes('flexi')) return { bg: 'bg-purple-50', text: 'text-purple-700', icon: <FaBolt className="text-purple-500" /> };
    if (name.includes('upfront')) return { bg: 'bg-blue-50', text: 'text-blue-700', icon: <FaCrown className="text-blue-500" /> };
    if (name.includes('stretch')) return { bg: 'bg-amber-50', text: 'text-amber-700', icon: <FaChair className="text-amber-500" /> };
    if (name.includes('sale')) return { bg: 'bg-green-50', text: 'text-green-700', icon: <FaTag className="text-green-500" /> };
    return { bg: 'bg-gray-50', text: 'text-gray-700', icon: <FaTag className="text-gray-500" /> };
  };

  // Format currency
  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Get feature icon
  const getFeatureIcon = (included) => {
    if (included) {
      return <FaCheckCircle className="text-green-500" size={14} />;
    }
    return <FaTimes className="text-gray-300" size={14} />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Main Flight Card - Always Visible */}
      <div className="p-6">
        {/* Top Row: Airline + Flight Number + Price */}
        <div className="flex flex-wrap items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Airline Logo Placeholder */}
            <div className="w-10 h-10 bg-gradient-to-br from-[#FD561E] to-[#ff7b4a] rounded-full flex items-center justify-center text-white font-bold">
              {airlineCode}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900">{airlineName}</h3>
                <span className="text-xs text-gray-500">{flightNumber}</span>
                {allFares.length > 1 && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    {allFares.length} Fares
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span>{from} → {to}</span>
                <span>•</span>
                <span>{stopText}</span>
              </div>
            </div>
          </div>
          
          {/* Price */}
          <div className="text-right">
            <div className="text-2xl font-bold text-[#FD561E]">
              {formatPrice(lowestPrice)}
            </div>
            <div className="text-xs text-gray-500">
              per adult
            </div>
          </div>
        </div>

        {/* Middle Row: Flight Timeline */}
        <div className="flex items-center justify-between mb-6 px-2">
          {/* Departure */}
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-gray-900">{departureTime}</div>
            <div className="text-sm text-gray-600 mt-1">{from}</div>
          </div>

          {/* Duration Line */}
          <div className="flex-2 px-4 text-center">
            <div className="text-xs text-gray-500 mb-1 flex items-center justify-center">
              <FaClock className="mr-1 text-gray-400" size={12} />
              {duration}
            </div>
            <div className="relative w-32 mx-auto">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-[#FD561E] rounded-full"></div>
                <div className="flex-1 h-0.5 bg-gray-300"></div>
                <div className="w-2 h-2 bg-[#FD561E] rounded-full"></div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{stopText}</div>
          </div>

          {/* Arrival */}
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-gray-900">{arrivalTime}</div>
            <div className="text-sm text-gray-600 mt-1">{to}</div>
          </div>
        </div>

        {/* Bottom Row: Quick Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
          {/* Left: Baggage Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FaSuitcase className="text-[#FD561E]" size={14} />
              <span>{lowestFare?.baggage?.weight || '15'}{lowestFare?.baggage?.unit || 'kg'}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FaClock className="text-[#FD561E]" size={14} />
              <span>{flight.seatsAvailable || 0} seats left</span>
            </div>
          </div>

          {/* Right: View Fares Button */}
          <button
            onClick={() => setShowAllFares(!showAllFares)}
            className="flex items-center gap-1 text-[#FD561E] hover:text-[#e04e1b] font-medium text-sm transition-colors"
          >
            <span>{showAllFares ? 'Hide Fares' : 'View Fares'}</span>
            {showAllFares ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Fare Families Section - Expandable */}
      {showAllFares && allFares.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <FaTag className="mr-2 text-[#FD561E]" />
            Select Your Fare Type
          </h4>
          
          <div className="space-y-3">
            {allFares.map((fare, index) => {
              const brandName = fare.brand?.name || 'Economy';
              const brandBadge = getBrandBadge(brandName);
              const isLowest = index === 0;
              
              return (
                <div 
                  key={fare.id || `fare-${index}`}
                  className={`bg-white rounded-lg border ${isLowest ? 'border-[#FD561E]' : 'border-gray-200'} overflow-hidden hover:shadow-sm transition-shadow`}
                >
                  {/* Fare Header */}
                  <div className={`p-3 ${brandBadge.bg} border-b border-gray-100`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {brandBadge.icon}
                        <span className={`font-semibold ${brandBadge.text}`}>
                          {brandName}
                        </span>
                        {isLowest && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            Best Price
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#FD561E]">
                          {formatPrice(fare.price)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">/adult</span>
                      </div>
                    </div>
                    
                    {/* Upsell Message */}
                    {fare.brand?.upsell && (
                      <p className="text-xs text-gray-600 mt-1">{fare.brand.upsell}</p>
                    )}
                  </div>

                  {/* Fare Features Grid */}
                  <div className="p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Baggage */}
                      <div className="flex items-center gap-2 text-xs">
                        {getFeatureIcon(true)}
                        <span className="text-gray-600">
                          {fare.baggage?.weight || '15'}{fare.baggage?.unit || 'kg'} Check-in
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {getFeatureIcon(true)}
                        <span className="text-gray-600">7kg Cabin</span>
                      </div>

                      {/* Meals */}
                      <div className="flex items-center gap-2 text-xs">
                        {getFeatureIcon(fare.amenities?.meals)}
                        <span className={fare.amenities?.meals ? 'text-gray-600' : 'text-gray-400'}>
                          Meals {fare.amenities?.meals ? 'Included' : 'Not Included'}
                        </span>
                      </div>

                      {/* Seat Selection */}
                      <div className="flex items-center gap-2 text-xs">
                        {getFeatureIcon(fare.amenities?.seatSelection)}
                        <span className={fare.amenities?.seatSelection ? 'text-gray-600' : 'text-gray-400'}>
                          Seat Selection
                        </span>
                      </div>

                      {/* Changes */}
                      <div className="flex items-center gap-2 text-xs">
                        {getFeatureIcon(fare.amenities?.changes)}
                        <span className={fare.amenities?.changes ? 'text-gray-600' : 'text-gray-400'}>
                          {fare.amenities?.changes ? 'Free Changes' : 'No Changes'}
                        </span>
                      </div>

                      {/* Cancellation */}
                      <div className="flex items-center gap-2 text-xs">
                        {getFeatureIcon(fare.refundable)}
                        <span className={fare.refundable ? 'text-gray-600' : 'text-gray-400'}>
                          {fare.refundable ? 'Refundable' : 'Non-refundable'}
                        </span>
                      </div>
                    </div>

                    {/* Fare Description (if available) */}
                    {fare.brand?.description && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 italic">
                          {fare.brand.description.substring(0, 100)}
                          {fare.brand.description.length > 100 && '...'}
                        </p>
                      </div>
                    )}

                    {/* Select Button */}
                    <button
                      className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isLowest 
                          ? 'bg-[#FD561E] text-white hover:bg-[#e04e1b]' 
                          : 'border border-[#FD561E] text-[#FD561E] hover:bg-orange-50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onFlightSelect?.(flight, fare);
                      }}
                    >
                      Select {brandName}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View Details Link */}
          <button
            onClick={() => onFlightSelect?.(flight, allFares[0])}
            className="mt-3 w-full text-center text-sm text-[#FD561E] hover:text-[#e04e1b] font-medium py-2 transition-colors"
          >
            View complete flight details <FaArrowRight className="inline ml-1" size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FlightCard;