// src/modules/flights/components/sheet/OneWaySheet.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseSheet from './BaseSheet';
import BrandBadge from '../shared/BrandBadge';
import { formatTime, formatDate, formatDuration, formatPrice } from '../../utils/formatters';
import { buildOneWayPricingRequest, getFlightPricing } from '../../services/pricingService';
import toast from 'react-hot-toast';
import { 
  FaPlane, 
  FaClock, 
  FaCalendarAlt, 
  FaSuitcase, 
  FaUserFriends,
  FaTag,
  FaInfoCircle,
  FaShieldAlt,
  FaExchangeAlt,
  FaUtensils,
  FaChair,
  FaWifi,
  FaTv,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight,
  FaStar,
  FaCrown,
  FaGem,
  FaMapMarkerAlt,
  FaArrowCircleRight,
  FaClock as FaClockRegular,
  FaCoffee,
  FaBatteryFull,
  FaSpinner
} from 'react-icons/fa';

const OneWaySheet = ({ isOpen, onClose, flight, passengerCounts }) => {
  const navigate = useNavigate();
  const [expandedFare, setExpandedFare] = useState(null);
  const [loadingFareId, setLoadingFareId] = useState(null);
  
  if (!flight) return null;

  // Debug log
  console.log('📄 OneWaySheet received:', {
    id: flight.id,
    faresCount: flight.fares?.length || 0,
    segments: flight.segments?.length || 0
  });

  // Get all fares (deduplicated)
  const allFares = useMemo(() => {
    if (!flight.fares || flight.fares.length === 0) {
      return [{
        ...flight,
        id: flight.id,
        brand: flight.brand || { name: 'Economy', description: '' },
        totalPrice: flight.lowestPrice || flight.price || 0,
        baggage: flight.baggage || { weight: 15, unit: 'kg' }
      }];
    }
    
    // Deduplicate fares
    const fareMap = new Map();
    flight.fares.forEach(fare => {
      const key = `${fare.brand?.name}-${fare.totalPrice}-${fare.baggage?.weight}`;
      if (!fareMap.has(key)) {
        fareMap.set(key, fare);
      }
    });
    
    return Array.from(fareMap.values()).sort((a, b) => a.totalPrice - b.totalPrice);
  }, [flight]);

  // ============ NEW: Handle fare selection with pricing API ============
  // In OneWaySheet.jsx - Update the handleSelectFare function

const handleSelectFare = async (fare, e) => {
  e.stopPropagation();
  
  // Prevent multiple clicks
  if (loadingFareId) return;
  
  setLoadingFareId(fare.id);
  
  try {
    // Show loading toast
    const loadingToast = toast.loading('Getting fare details...');
    
    // Build pricing request
    const pricingRequest = buildOneWayPricingRequest(flight, fare, passengerCounts);
    
    // Call pricing API
    const result = await getFlightPricing(pricingRequest);
    
    // Dismiss loading toast
    toast.dismiss(loadingToast);
    
    if (result.success) {
      // ✅ Store both transformed data and raw response
      const transformedData = result.data;      // For UI display
      const rawResponse = result.rawResponse;   // Raw SOAP response for booking
      
      // Success toast
      toast.success('Fare confirmed! Proceed with booking.');
      
      // Close the sheet
      onClose();
      
      // ✅ Navigate to booking review with BOTH transformed data and raw response
      navigate('/flights/booking/review', { 
        state: { 
          pricingResult: transformedData,           // Transformed data for UI display
          rawPricingResponse: rawResponse,          // Raw response for building booking request
          selectedFare: fare,                      // Selected fare option
          flight: flight,                          // Flight details
          passengerCounts: passengerCounts,        // Passenger counts
          tripType: 'one-way',                     // Trip type
          totalPrice: fare.totalPrice              // Total price
        } 
      });
    } else {
      // Error toast
      toast.error(result.error || 'Failed to get pricing. Please try again.');
      console.error('Pricing failed:', result.error);
    }
  } catch (error) {
    toast.error('An unexpected error occurred. Please try again.');
    console.error('Fare selection error:', error);
  } finally {
    setLoadingFareId(null);
  }
};

  // Check if it's a connecting flight
  const isConnecting = flight.segments?.length > 1 || flight.stops > 0;
  const segments = flight.segments || (flight.segments ? flight.segments : [flight]);

  // Get fare badge color based on brand
  const getFareBadgeColor = (brandName) => {
    const name = brandName?.toLowerCase() || '';
    if (name.includes('super') || name.includes('premium')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (name.includes('flex')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (name.includes('stretch') || name.includes('plus')) return 'bg-green-100 text-green-700 border-green-200';
    if (name.includes('business')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (name.includes('first')) return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get fare icon based on brand
  const getFareIcon = (brandName) => {
    const name = brandName?.toLowerCase() || '';
    if (name.includes('business')) return <FaCrown className="text-[#FD561E]" />;
    if (name.includes('first')) return <FaGem className="text-[#FD561E]" />;
    if (name.includes('super')) return <FaStar className="text-[#FD561E]" />;
    return <FaTag className="text-[#FD561E]" />;
  };

  return (
    <BaseSheet isOpen={isOpen} onClose={onClose} title="Select Your Fare">
      <div className="space-y-6 pb-6">
        
        {/* ============ FLIGHT HEADER with Brand Color ============ */}
        <div className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <span className="text-[#FD561E] font-bold text-xl">{flight.airlineCode}</span>
              </div>
              <div>
                <div className="font-bold text-lg">{flight.airline}</div>
                <div className="text-white/80 text-sm">{flight.flightNumber}</div>
              </div>
            </div>
            {isConnecting && (
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                Connecting Flight
              </div>
            )}
          </div>

          {/* Route Summary */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-center flex-1">
              <div className="text-2xl font-bold">{formatTime(flight.departureTime)}</div>
              <div className="text-white/90 text-sm mt-1">{flight.origin}</div>
              <div className="text-white/70 text-xs mt-1">{formatDate(flight.departureTime)}</div>
              {flight.originTerminal && (
                <div className="text-white/60 text-xs mt-1">Terminal {flight.originTerminal}</div>
              )}
            </div>

            <div className="flex-1 px-4">
              <div className="text-white/80 text-xs text-center mb-1 flex items-center justify-center">
                <FaClock className="mr-1" size={10} />
                {formatDuration(flight.duration)}
              </div>
              <div className="relative flex items-center justify-center">
                <div className="w-full h-0.5 bg-white/30"></div>
                <FaPlane className="absolute text-white transform rotate-90" size={14} />
              </div>
              <div className="text-white/80 text-xs text-center mt-1">
                {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
              </div>
            </div>

            <div className="text-center flex-1">
              <div className="text-2xl font-bold">{formatTime(flight.arrivalTime)}</div>
              <div className="text-white/90 text-sm mt-1">{flight.destination}</div>
              <div className="text-white/70 text-xs mt-1">{formatDate(flight.arrivalTime)}</div>
              {flight.destinationTerminal && (
                <div className="text-white/60 text-xs mt-1">Terminal {flight.destinationTerminal}</div>
              )}
            </div>
          </div>
        </div>

        {/* ============ CONNECTING FLIGHT DETAILS ============ */}
        {isConnecting && flight.layovers && flight.layovers.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-[#FD561E]">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <FaClockRegular className="text-[#FD561E]" />
              Flight Details
            </h3>
            
            {segments.map((segment, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <FaPlane className="text-[#FD561E] text-xs" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{segment.airline || flight.airline}</span>
                      <span className="text-xs text-gray-500">{segment.flightNumber || flight.flightNumber}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div>
                        <span className="font-bold">{formatTime(segment.departureTime)}</span>
                        <span className="text-gray-500 ml-1">{segment.origin || flight.origin}</span>
                        {segment.originTerminal && (
                          <span className="text-xs text-gray-400 ml-2">T{segment.originTerminal}</span>
                        )}
                      </div>
                      <FaArrowRight className="text-[#FD561E] text-xs" />
                      <div>
                        <span className="font-bold">{formatTime(segment.arrivalTime)}</span>
                        <span className="text-gray-500 ml-1">{segment.destination || flight.destination}</span>
                        {segment.destinationTerminal && (
                          <span className="text-xs text-gray-400 ml-2">T{segment.destinationTerminal}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Layover info (except after last segment) */}
                {idx < flight.layovers.length && (
                  <div className="ml-11 mt-2 mb-2">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs">
                      <span className="font-medium text-yellow-700">Layover at {flight.layovers[idx].airport}</span>
                      <span className="text-gray-500 ml-2">{flight.layovers[idx].formattedDuration}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ============ FARE OPTIONS SECTION ============ */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <FaTag className="text-[#FD561E]" />
            Select Fare Type ({allFares.length} options)
          </h3>

          {allFares.map((fare, index) => {
            const isExpanded = expandedFare === fare.id;
            const isLoading = loadingFareId === fare.id;
            const isLowest = index === 0;
            const fareBrand = fare.brand || { name: 'Economy', features: [] };
            const baggage = fare.baggage || { weight: 15, unit: 'kg' };
            
            return (
              <div 
                key={fare.id || index}
                className={`border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all
                  ${isExpanded ? 'ring-2 ring-[#FD561E] ring-opacity-50' : ''}
                  ${isLoading ? 'opacity-70' : ''}`}
              >
                {/* Fare Header */}
                <div 
                  onClick={() => !isLoading && setExpandedFare(isExpanded ? null : fare.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isLoading ? 'cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Fare Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getFareBadgeColor(fareBrand.name)}`}>
                        {getFareIcon(fareBrand.name)}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{fareBrand.name}</span>
                          {isLowest && (
                            <span className="text-xs bg-[#FD561E] text-white px-2 py-0.5 rounded-full font-medium">
                              Best Price
                            </span>
                          )}
                        </div>
                        
                        {/* Quick summary */}
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <FaSuitcase className="text-[#FD561E]" size={10} />
                            <span>{baggage.pieces ? `${baggage.pieces} pc` : `${baggage.weight}${baggage.unit}`}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <FaChair className="text-[#FD561E]" size={10} />
                            <span>{fare.cabinClass || 'Economy'}</span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium
                            ${fare.refundable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {fare.refundable ? 'Refundable' : 'Non-refundable'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#FD561E]">
                        ₹{fare.totalPrice?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-1">
                        {isExpanded ? 'Show less' : 'View details'}
                        {!isLoading && (isExpanded ? <FaChevronUp /> : <FaChevronDown />)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Fare Details */}
                {isExpanded && !isLoading && (
                  <div className="border-t bg-gray-50 p-4 space-y-4">
                    
                    {/* Price Breakdown */}
                    <div className="bg-white rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Base Fare:</span>
                          <span className="font-medium">₹{fare.basePrice?.toLocaleString() || Math.round(fare.totalPrice * 0.85).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
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
                    {fareBrand.features && fareBrand.features.length > 0 && (
                      <div className="bg-white rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Fare Features</h4>
                        <ul className="space-y-2">
                          {fareBrand.features.slice(0, 5).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <FaCheckCircle className="text-[#FD561E] mt-0.5 flex-shrink-0" size={14} />
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Amenities Grid */}
                    <div className="bg-white rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Amenities</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                            ${fare.amenities?.meals ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <FaUtensils className={fare.amenities?.meals ? 'text-green-600' : 'text-gray-400'} size={14} />
                          </div>
                          <span className="text-sm text-gray-600">Meals</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                            ${fare.amenities?.seatSelection ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <FaChair className={fare.amenities?.seatSelection ? 'text-green-600' : 'text-gray-400'} size={14} />
                          </div>
                          <span className="text-sm text-gray-600">Seat Selection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                            ${fare.amenities?.wifi ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <FaWifi className={fare.amenities?.wifi ? 'text-green-600' : 'text-gray-400'} size={14} />
                          </div>
                          <span className="text-sm text-gray-600">Wi-Fi</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <FaTv className="text-green-600" size={14} />
                          </div>
                          <span className="text-sm text-gray-600">Entertainment</span>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div className="bg-white rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Cancellation Policy</h4>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <FaShieldAlt className="text-red-500" size={14} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            {fare.penalties?.cancel?.amount 
                              ? `₹${fare.penalties.cancel.amount.toLocaleString()} cancellation fee`
                              : fare.penalties?.cancel?.percentage
                              ? `${fare.penalties.cancel.percentage}% cancellation fee`
                              : fare.refundable 
                                ? 'Refundable with applicable fees'
                                : 'Non-refundable'}
                          </p>
                          {fare.penalties?.cancel?.noShow && (
                            <p className="text-xs text-red-500 mt-1">No-show charges apply</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Select Button */}
                    <button
                      onClick={(e) => handleSelectFare(fare, e)}
                      disabled={isLoading}
                      className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-4 px-4 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Select This Fare
                          <FaArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Loading overlay for collapsed state */}
                {isLoading && !isExpanded && (
                  <div className="border-t bg-gray-50 p-4 flex items-center justify-center">
                    <FaSpinner className="animate-spin text-[#FD561E]" size={24} />
                    <span className="ml-2 text-gray-600">Processing...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ============ PASSENGER INFO with Brand Color ============ */}
        {passengerCounts && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FD561E] bg-opacity-10 rounded-lg flex items-center justify-center">
                <FaUserFriends className="text-[#FD561E]" />
              </div>
              <div>
                <span className="text-sm text-gray-500">Passengers</span>
                <p className="font-medium text-gray-800">
                  {passengerCounts.ADT > 0 && `${passengerCounts.ADT} Adult${passengerCounts.ADT > 1 ? 's' : ''}`}
                  {passengerCounts.CNN > 0 && `, ${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`}
                  {passengerCounts.INF > 0 && `, ${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseSheet>
  );
};

export default OneWaySheet;