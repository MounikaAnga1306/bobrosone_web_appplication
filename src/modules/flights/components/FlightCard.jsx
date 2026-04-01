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
<<<<<<< Updated upstream
  FaTimes,
  FaCheckCircle,
  FaArrowRight,
  FaBolt,
  FaUserFriends
} from 'react-icons/fa';

const FlightCard = ({ flight, passengerCounts = { adults: 1, children: 0, infants: 0 }, onFlightSelect }) => {
=======
  FaInfoCircle,
  FaTimes,
  FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa';

const FlightCard = ({ flight, passengerCounts, onClick }) => {
>>>>>>> Stashed changes
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
  
<<<<<<< Updated upstream
  // All fares for this flight
  const allFares = flight.fares || [];
  
  // Get lowest price from fares
  const lowestPrice = allFares.length > 0 ? Math.min(...allFares.map(f => f.price)) : 0;
  const lowestFare = allFares.find(f => f.price === lowestPrice) || allFares[0] || {};

  // ============ PASSENGER INFO ============
  const adultCount = passengerCounts?.adults || 1;
  const childCount = passengerCounts?.children || 0;
  const infantCount = passengerCounts?.infants || 0;
  const totalPassengers = adultCount + childCount + infantCount;

  // Calculate per adult price (total price / number of adults)
  const calculatePerAdultPrice = (totalPrice) => {
    return Math.round(totalPrice / adultCount);
  };
=======
  // Price - get lowest fare
  const lowestFare = flight.fares?.[0] || { price: flight.price || 0 };
  const lowestPrice = lowestFare.price || 0;
  
  // All fares for this flight
  const allFares = flight.fares || [];
  
  // Check if premium fare exists
  const hasPremiumFares = allFares.some(f => 
    f.brand?.name?.toLowerCase().includes('flexi') || 
    f.brand?.name?.toLowerCase().includes('plus') ||
    f.brand?.name?.toLowerCase().includes('upfront')
  );
>>>>>>> Stashed changes

  // ============ HELPER FUNCTIONS ============

  // Get color based on brand
<<<<<<< Updated upstream
 

  // Get brand badge style
  const getBrandBadge = (brandName) => {
    const name = brandName?.toLowerCase() || '';
    if (name.includes('flexi')) return { bg: 'bg-purple-50', text: 'text-purple-700', icon: <FaBolt className="text-purple-500" /> };
    if (name.includes('upfront')) return { bg: 'bg-blue-50', text: 'text-blue-700', icon: <FaCrown className="text-blue-500" /> };
    if (name.includes('stretch')) return { bg: 'bg-amber-50', text: 'text-amber-700', icon: <FaChair className="text-amber-500" /> };
    if (name.includes('sale')) return { bg: 'bg-green-50', text: 'text-green-700', icon: <FaTag className="text-green-500" /> };
    return { bg: 'bg-gray-50', text: 'text-gray-700', icon: <FaTag className="text-gray-500" /> };
=======
  const getBrandColor = (brandName) => {
    const name = brandName?.toLowerCase() || '';
    if (name.includes('flexi')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (name.includes('upfront')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (name.includes('stretch')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (name.includes('sale')) return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get icon based on brand
  const getBrandIcon = (brandName) => {
    const name = brandName?.toLowerCase() || '';
    if (name.includes('flexi')) return <FaExchangeAlt className="text-purple-600" />;
    if (name.includes('upfront')) return <FaCrown className="text-blue-600" />;
    if (name.includes('stretch')) return <FaChair className="text-amber-600" />;
    if (name.includes('sale')) return <FaTag className="text-green-600" />;
    return <FaTag className="text-gray-600" />;
>>>>>>> Stashed changes
  };

  // Format currency
  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };
<<<<<<< Updated upstream

  // Get feature icon
  const getFeatureIcon = (included) => {
    if (included) {
      return <FaCheckCircle className="text-green-500" size={14} />;
    }
    return <FaTimes className="text-gray-300" size={14} />;
  };
=======
>>>>>>> Stashed changes

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Main Flight Card - Always Visible */}
      <div className="p-6">
<<<<<<< Updated upstream
        {/* Top Row: Airline + Flight Number + Price + Passenger Info */}
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
=======
        {/* Top Row: Airline + Flight Number + Price */}
        <div className="flex flex-wrap items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Airline Logo Placeholder - You can add actual logos later */}
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="font-bold text-[#FD561E]">{airlineCode}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{airlineName}</h3>
                <span className="text-xs text-gray-500">{flightNumber}</span>
                {hasPremiumFares && (
                  <span className="text-xs bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2 py-0.5 rounded-full">
                    Premium
>>>>>>> Stashed changes
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
          
<<<<<<< Updated upstream
          {/* Price with passenger count */}
=======
          {/* Price */}
>>>>>>> Stashed changes
          <div className="text-right">
            <div className="text-2xl font-bold text-[#FD561E]">
              {formatPrice(lowestPrice)}
            </div>
<<<<<<< Updated upstream
            <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
              <FaUserFriends size={12} />
              <span>for {totalPassengers} {totalPassengers === 1 ? 'passenger' : 'passengers'}</span>
            </div>
            <div className="text-xs text-gray-400">
              (₹{formatPrice(calculatePerAdultPrice(lowestPrice))}/adult)
=======
            <div className="text-xs text-gray-500">
              per adult
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          {/* Left: Baggage & Seats Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FaSuitcase className="text-[#FD561E]" size={14} />
              <span>{lowestFare?.baggage?.weight || '15'}{lowestFare?.baggage?.unit || 'kg'}</span>
=======
          {/* Left: Baggage Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FaSuitcase className="text-[#FD561E]" size={14} />
              <span>{flight.baggage?.weight || '15'}{flight.baggage?.unit || 'kg'}</span>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            <span>{showAllFares ? 'Hide Fares' : 'View Fares'}</span>
=======
            <span>View Fares</span>
>>>>>>> Stashed changes
            {showAllFares ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Fare Families Section - Expandable */}
      {showAllFares && allFares.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <FaTag className="mr-2 text-[#FD561E]" />
<<<<<<< Updated upstream
            Select Your Fare Type
=======
            Select Your Fare
>>>>>>> Stashed changes
          </h4>
          
          <div className="space-y-3">
            {allFares.map((fare, index) => {
              const brandName = fare.brand?.name || 'Economy';
<<<<<<< Updated upstream
              const brandBadge = getBrandBadge(brandName);
              const isLowest = index === 0;
              const perAdultPrice = calculatePerAdultPrice(fare.price);
              
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
                        <span className="text-xs text-gray-500 ml-1">total</span>
                        <div className="text-xs text-gray-500">
                          ₹{formatPrice(perAdultPrice)}/adult
                        </div>
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
=======
              const brandColor = getBrandColor(brandName);
              const brandIcon = getBrandIcon(brandName);
              const isLowest = index === 0;
              
              return (
                <div 
                  key={fare.id || index}
                  className={`bg-white rounded-lg border ${isLowest ? 'border-[#FD561E]' : 'border-gray-200'} p-4 hover:shadow-sm transition-shadow cursor-pointer`}
                  onClick={() => onClick?.(flight, fare)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    {/* Left: Fare Info */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${brandColor}`}>
                          <span className="flex items-center gap-1">
                            {brandIcon}
                            {brandName}
                          </span>
                        </span>
                        {isLowest && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            Best Value
                          </span>
                        )}
                      </div>
                      
                      {/* Fare Features */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <FaSuitcase className="text-green-500" size={12} />
                          <span>{fare.baggage?.weight || '15'}{fare.baggage?.unit || 'kg'} Check-in</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <FaSuitcase className="text-green-500" size={12} />
                          <span>7kg Cabin</span>
                        </div>
                        
                        {fare.amenities?.meals && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <FaUtensils className="text-green-500" size={12} />
                            <span>Meals</span>
                          </div>
                        )}
                        
                        {fare.amenities?.seatSelection && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <FaChair className="text-green-500" size={12} />
                            <span>Seat Selection</span>
                          </div>
                        )}
                        
                        {fare.amenities?.changes ? (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <FaExchangeAlt className="text-green-500" size={12} />
                            <span>Free Changes</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <FaTimes className="text-gray-400" size={12} />
                            <span>No Changes</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Price & Select */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#FD561E]">
                        {formatPrice(fare.price)}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        per adult
                      </div>
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isLowest 
                            ? 'bg-[#FD561E] text-white hover:bg-[#e04e1b]' 
                            : 'border border-[#FD561E] text-[#FD561E] hover:bg-orange-50'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClick?.(flight, fare);
                        }}
                      >
                        Select
                      </button>
                    </div>
                  </div>

                  {/* Fare Rules Summary */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaShieldAlt className="text-gray-400" size={12} />
                        Cancellation: {fare.refundable ? 'Refundable' : 'Non-refundable'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaExchangeAlt className="text-gray-400" size={12} />
                        Changes: {fare.amenities?.changes ? 'Free' : 'Not allowed'}
                      </span>
                    </div>
>>>>>>> Stashed changes
                  </div>
                </div>
              );
            })}
          </div>

          {/* View Details Link */}
          <button
<<<<<<< Updated upstream
            onClick={() => onFlightSelect?.(flight, allFares[0])}
=======
            onClick={() => onClick?.(flight, allFares[0])}
>>>>>>> Stashed changes
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