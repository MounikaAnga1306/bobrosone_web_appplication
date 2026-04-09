// src/modules/flights/components/sheet/MultiCitySheet.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseSheet from './BaseSheet';
import { formatTime, formatDate, formatDuration, formatPrice } from '../../utils/formatters';
import { FaPlane, FaClock, FaCalendarAlt, FaSuitcase, FaTag, FaSpinner, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getFlightPricing, buildMultiCityPricingRequest } from '../../services/pricingService';
import { usePricingBooking } from '../../contexts/PricingBookingContext';

const MultiCitySheet = ({ isOpen, onClose, legs = [], passengerCounts }) => {
  const navigate = useNavigate();
  const [activeLegIndex, setActiveLegIndex] = useState(0);
  const [selectedFares, setSelectedFares] = useState({});
  const [isConfirming, setIsConfirming] = useState(false);
  const [pricingError, setPricingError] = useState(null);
  
  // Get context functions
  const { setRawPricingResponse } = usePricingBooking();

  // Calculate total price
  const totalPrice = useMemo(() => {
    return Object.values(selectedFares).reduce((sum, fare) => sum + (fare?.totalPrice || 0), 0);
  }, [selectedFares]);

  const isReadyToConfirm = legs.length === Object.keys(selectedFares).length;

  const handleFareSelect = (legIndex, fare) => {
    setSelectedFares(prev => ({ ...prev, [legIndex]: fare }));
    setPricingError(null);
  };

  const handleConfirm = async () => {
    if (!isReadyToConfirm) {
      toast.error('Please select a fare for all flight legs');
      return;
    }

    setIsConfirming(true);
    setPricingError(null);
    
    const loadingToast = toast.loading('Getting fare details...');

    try {
      // Build pricing request with all selected fares
      const pricingRequest = buildMultiCityPricingRequest(legs, selectedFares, passengerCounts);
      
      const result = await getFlightPricing(pricingRequest);
      
      toast.dismiss(loadingToast);

      if (result.success && result.rawResponse) {
        // Store raw response in Context
        if (setRawPricingResponse) {
          setRawPricingResponse(result.rawResponse);
          console.log('✅ Raw pricing response stored in context');
        }
        
        toast.success('Fares confirmed! Proceed with booking.');
        navigate('/flights/booking/review');
        onClose();
      } else {
        throw new Error(result.error || 'Failed to get pricing');
      }
    } catch (error) {
      console.error('Pricing failed:', error);
      toast.error(error.message || 'Failed to get pricing. Please try again.');
      setPricingError(error.message);
    } finally {
      setIsConfirming(false);
    }
  };

  if (!legs.length) return null;

  const currentLeg = legs[activeLegIndex];
  const currentFares = currentLeg?.fares || [];
  const currentSelectedFare = selectedFares[activeLegIndex];

  // Fare Option Card Component
  const FareOptionCard = ({ fare, isSelected, onSelect, isLowest }) => (
    <div
      onClick={() => onSelect(fare)}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-purple-500 bg-purple-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold">{fare.brand?.name || 'Economy'}</h4>
          <p className="text-xs text-gray-500 mt-1">{fare.fareBasis}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-purple-600">{formatPrice(fare.totalPrice)}</div>
          <div className="text-xs text-gray-400">per adult</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <FaSuitcase size={12} />
          <span>{fare.baggage?.checked?.weight || 15}kg</span>
        </div>
        {fare.refundable && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Refundable</span>
        )}
      </div>
      {isLowest && !isSelected && (
        <div className="mt-2 text-xs text-green-600">Best Price</div>
      )}
    </div>
  );

  const FlightDetails = ({ flight, legIndex }) => (
    <div className="space-y-6">
      {/* Flight Info Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold">{flight.airline}</div>
            <div className="text-gray-600 mt-1">{flight.flightNumber}</div>
          </div>
          {currentSelectedFare && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {currentSelectedFare.brand?.name || 'Selected'}
            </span>
          )}
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

      {/* Fare Options */}
      {currentFares.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaTag className="text-purple-500" />
            Available Fares ({currentFares.length})
          </h3>
          <div className="space-y-3">
            {currentFares.map((fare, idx) => (
              <FareOptionCard
                key={fare.id || idx}
                fare={fare}
                isSelected={currentSelectedFare?.id === fare.id}
                onSelect={(f) => handleFareSelect(legIndex, f)}
                isLowest={idx === 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <BaseSheet isOpen={isOpen} onClose={onClose} title="Multi-City Flight Details">
      {/* Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {legs.map((leg, index) => (
          <button
            key={index}
            onClick={() => setActiveLegIndex(index)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeLegIndex === index
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Leg {index + 1}: {leg.origin} → {leg.destination}
            {selectedFares[index] && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <FlightDetails flight={legs[activeLegIndex]} legIndex={activeLegIndex} />

      {/* Footer with Price Summary */}
      <div className="sticky bottom-0 bg-white border-t mt-6 pt-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Total for {passengerCounts?.ADT || 1} passenger(s)</p>
            <p className="text-2xl font-bold text-purple-600">{formatPrice(totalPrice)}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isReadyToConfirm || isConfirming}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
                isReadyToConfirm && !isConfirming
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isConfirming ? (
                <><FaSpinner className="animate-spin" /> Processing...</>
              ) : (
                <>Continue <FaArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>
        {pricingError && (
          <p className="text-sm text-red-500 mt-2">{pricingError}</p>
        )}
      </div>
    </BaseSheet>
  );
};

export default MultiCitySheet;