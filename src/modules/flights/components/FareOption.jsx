// src/components/flights/FareOption.jsx

import React from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSuitcase,
  FaUtensils,
  FaChair,
  FaExchangeAlt,
  FaShieldAlt,
  FaInfoCircle,
  FaCrown
} from 'react-icons/fa';

const FareOption = ({ 
  fare, 
  isLowest, 
  isSelected, 
  passengerCounts,
  onSelect, 
  onViewRules 
}) => {
  
  if (!fare) return null;

  // Format price with commas
  const formatPrice = (price) => {
    return price.toLocaleString('en-IN');
  };

  // Calculate per adult price (approximate)
  const perAdultPrice = fare.price / (passengerCounts?.adults || 1);

  // Get amenity icon and status
  const getAmenityIcon = (type) => {
    switch(type) {
      case 'baggage': return <FaSuitcase className="text-gray-500" />;
      case 'meals': return <FaUtensils className="text-gray-500" />;
      case 'seat': return <FaChair className="text-gray-500" />;
      case 'changes': return <FaExchangeAlt className="text-gray-500" />;
      case 'refund': return <FaShieldAlt className="text-gray-500" />;
      default: return null;
    }
  };

  return (
    <div 
      className={`relative border rounded-xl transition-all duration-200 ${
        isSelected 
          ? 'border-[#FD561E] border-2 bg-orange-50/50 shadow-md' 
          : 'border-gray-200 hover:border-[#FD561E] hover:shadow-md bg-white'
      }`}
    >
      {/* Best Deal Badge */}
      {isLowest && (
        <div className="absolute -top-3 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center">
          <FaCrown className="mr-1 text-xs" />
          BEST DEAL
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Left Side - Fare Info */}
          <div className="flex-1">
            {/* Fare Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {fare.brand?.name || 'Economy'}
                </h3>
                {fare.brand?.description && (
                  <p className="text-sm text-gray-500 mt-1">{fare.brand.description}</p>
                )}
              </div>
              
              {/* Mobile Price */}
              <div className="lg:hidden text-right">
                <div className="text-2xl font-bold text-[#FD561E]">
                  ₹{formatPrice(fare.price)}
                </div>
                <div className="text-xs text-gray-500">
                  Total for {passengerCounts?.adults || 1} Adult
                  {passengerCounts?.children > 0 && ` + ${passengerCounts.children} Child`}
                  {passengerCounts?.infants > 0 && ` + ${passengerCounts.infants} Infant`}
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Baggage */}
              <div className="flex items-center text-sm">
                {fare.baggage ? (
                  <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                ) : (
                  <FaTimesCircle className="text-gray-300 mr-2 flex-shrink-0" />
                )}
                <span className="text-gray-600">
                  {fare.baggage ? `${fare.baggage.weight}kg Check-in` : 'No Check-in'}
                </span>
              </div>

              {/* Cabin Baggage - Default 7kg */}
              <div className="flex items-center text-sm">
                <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-600">7kg Cabin</span>
              </div>

              {/* Meals */}
              <div className="flex items-center text-sm">
                {fare.amenities?.meals ? (
                  <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                ) : (
                  <FaTimesCircle className="text-gray-300 mr-2 flex-shrink-0" />
                )}
                <span className="text-gray-600">Meals</span>
              </div>

              {/* Seat Selection */}
              <div className="flex items-center text-sm">
                {fare.amenities?.seatSelection ? (
                  <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                ) : (
                  <FaTimesCircle className="text-gray-300 mr-2 flex-shrink-0" />
                )}
                <span className="text-gray-600">Seat Selection</span>
              </div>

              {/* Changes */}
              <div className="flex items-center text-sm">
                {fare.amenities?.changes ? (
                  <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                ) : (
                  <FaTimesCircle className="text-gray-300 mr-2 flex-shrink-0" />
                )}
                <span className="text-gray-600">Free Changes</span>
              </div>

              {/* Refundable */}
              <div className="flex items-center text-sm">
                {fare.refundable ? (
                  <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                ) : (
                  <FaTimesCircle className="text-gray-300 mr-2 flex-shrink-0" />
                )}
                <span className="text-gray-600">
                  {fare.refundable ? 'Refundable' : 'Non-refundable'}
                </span>
              </div>
            </div>

            {/* View Rules Link */}
            <button
              onClick={onViewRules}
              className="text-sm text-[#FD561E] hover:text-[#e04e1b] font-medium flex items-center transition-colors"
            >
              <FaInfoCircle className="mr-1" />
              View fare rules & details
            </button>
          </div>

          {/* Right Side - Price & Select (Desktop) */}
          <div className="hidden lg:block lg:w-64 text-right">
            <div className="text-sm text-gray-500 mb-1">Total for</div>
            <div className="text-xs text-gray-500 mb-2">
              {passengerCounts?.adults || 1} Adult
              {passengerCounts?.children > 0 && `, ${passengerCounts.children} Child`}
              {passengerCounts?.infants > 0 && `, ${passengerCounts.infants} Infant`}
            </div>
            <div className="text-3xl font-bold text-[#FD561E] mb-1">
              ₹{formatPrice(fare.price)}
            </div>
            <div className="text-xs text-gray-500 mb-4">
              ~₹{formatPrice(Math.round(perAdultPrice))} per adult
            </div>
            
            <button
              onClick={onSelect}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                isSelected
                  ? 'bg-[#FD561E] text-white shadow-md hover:bg-[#e04e1b]'
                  : 'border-2 border-[#FD561E] text-[#FD561E] hover:bg-[#FD561E] hover:text-white'
              }`}
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
          </div>
        </div>

        {/* Mobile Action Bar */}
        <div className="lg:hidden flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div>
            <div className="text-2xl font-bold text-[#FD561E]">
              ₹{formatPrice(fare.price)}
            </div>
            <div className="text-xs text-gray-500">
              Total for {passengerCounts?.adults || 1} Adult
              {passengerCounts?.children > 0 && ` + ${passengerCounts.children} Child`}
              {passengerCounts?.infants > 0 && ` + ${passengerCounts.infants} Infant`}
            </div>
          </div>
          
          <button
            onClick={onSelect}
            className={`py-2 px-6 rounded-lg font-semibold transition-all duration-200 ${
              isSelected
                ? 'bg-[#FD561E] text-white'
                : 'border-2 border-[#FD561E] text-[#FD561E]'
            }`}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FareOption;