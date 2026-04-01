// src/modules/flights/components/flight/OneWayFlightCard.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseFlightCard from './BaseFlightCard';
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaSuitcase, 
  FaChair, 
  FaUtensils, 
  FaWifi, 
  FaTv,
  FaCheckCircle,
  FaTimesCircle,
  FaTag,
  FaShieldAlt,
  FaExchangeAlt,
  FaClock,
  FaArrowRight,
  FaSpinner
} from 'react-icons/fa';
import { buildOneWayPricingRequest, getFlightPricing } from '../../services/pricingService';
import toast from 'react-hot-toast';

// Helper functions
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

const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

// Helper function to safely calculate taxes
const calculateTotalTaxes = (fare) => {
  if (!fare?.taxes) return 0;
  
  // If taxes is an array
  if (Array.isArray(fare.taxes)) {
    return fare.taxes.reduce((sum, tax) => sum + (tax.amount || 0), 0);
  }
  
  // If taxes is a single tax object
  if (typeof fare.taxes === 'object') {
    return fare.taxes.amount || 0;
  }
  
  // If taxes is a number
  if (typeof fare.taxes === 'number') {
    return fare.taxes;
  }
  
  return 0;
};

// Brand color utility
const brandColor = '#FD561E';

const OneWayFlightCard = ({ 
  flight, 
  isSelected, 
  onSelect, 
  onViewDetails,
  passengerCounts = { ADT: 1, CNN: 0, INF: 0 } // Default passenger counts
}) => {
  const navigate = useNavigate();
  const [expandedFareId, setExpandedFareId] = useState(null);
  const [showFareComparison, setShowFareComparison] = useState(false);
  const [loadingFareId, setLoadingFareId] = useState(null);
  
  // Deduplicate fares
  const uniqueFares = useMemo(() => {
    if (!flight.fares || flight.fares.length === 0) return [];
    
    const fareMap = new Map();
    
    flight.fares.forEach(fare => {
      const key = `${fare.brand?.name}-${fare.totalPrice}-${fare.baggage?.weight}-${fare.cabinClass}-${fare.refundable}`;
      
      if (!fareMap.has(key)) {
        fareMap.set(key, fare);
      }
    });
    
    const uniqueFaresArray = Array.from(fareMap.values());
    uniqueFaresArray.sort((a, b) => a.totalPrice - b.totalPrice);
    
    if (uniqueFaresArray.length > 0) {
      uniqueFaresArray[0].isLowest = true;
    }
    
    return uniqueFaresArray;
  }, [flight.fares]);
  
  const hasMultipleFares = uniqueFares.length > 1;
  
  // Get airline logo
  const airlineLogo = `https://logo.clearbit.com/${flight.airlineCode?.toLowerCase()}.com` 
    || `/airlines/${flight.airlineCode}.png`;
  
  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('.fare-card') || e.target.closest('.fare-select-btn')) {
      return;
    }
    onSelect?.(flight);
  };

  const toggleFareExpand = (fareId, e) => {
    e.stopPropagation();
    setExpandedFareId(expandedFareId === fareId ? null : fareId);
  };

  // ============ NEW: Handle fare selection with pricing API ============
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
        // Show specific error message from the API
        toast.error(result.userMessage || result.error || 'Failed to get pricing. Please try again.');
        console.error('Pricing failed:', result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Fare selection error:', error);
    } finally {
      setLoadingFareId(null);
    }
  };

  // Get badge color based on fare type
  const getFareBadgeStyle = (fareName) => {
    const name = fareName?.toLowerCase() || '';
    if (name.includes('flex')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (name.includes('super')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (name.includes('plus') || name.includes('stretch')) return 'bg-green-50 text-green-700 border-green-200';
    if (name.includes('business')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (uniqueFares.length === 0) {
    return null;
  }

  return (
    <div 
      onClick={handleCardClick}
      className={`
        relative bg-white rounded-2xl shadow-sm hover:shadow-md 
        transition-all duration-300 border cursor-pointer mb-6
        ${isSelected 
          ? 'border-[#FD561E] ring-2 ring-[#FD561E] ring-opacity-20' 
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      {/* Best Price Badge */}
      {uniqueFares[0] && (
        <div className="absolute -top-3 -right-3 bg-[#FD561E] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg z-10">
          Best Price ₹{uniqueFares[0].totalPrice?.toLocaleString()}
        </div>
      )}

      {/* Main Flight Info */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Airline & Flight Info */}
          <div className="flex items-center space-x-4 min-w-[200px]">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
              <img 
                src={airlineLogo}
                alt={flight.airline}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${flight.airlineCode}&background=FD561E&color=fff&size=40`;
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-lg">{flight.airline}</div>
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <span>{flight.flightNumber}</span>
                {flight.aircraft && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{flight.aircraft}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Flight Timeline */}
          <div className="flex-1 flex items-center justify-between max-w-2xl">
            {/* Departure */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(flight.departureTime)}
              </div>
              <div className="text-sm font-medium text-gray-700">{flight.origin}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {formatDate(flight.departureTime)}
              </div>
              {flight.originTerminal && (
                <div className="text-xs font-medium text-[#FD561E] mt-1">
                  T{flight.originTerminal}
                </div>
              )}
            </div>

            {/* Duration & Stops */}
            <div className="flex-1 mx-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative bg-white px-3">
                  <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    <FaClock className="inline mr-1 text-[#FD561E]" size={10} />
                    {formatDuration(flight.duration)}
                  </div>
                </div>
              </div>
              <div className="text-center text-sm mt-2">
                {flight.stops === 0 ? (
                  <span className="text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">Direct</span>
                ) : (
                  <span className="text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full">
                    {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(flight.arrivalTime)}
              </div>
              <div className="text-sm font-medium text-gray-700">{flight.destination}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {formatDate(flight.arrivalTime)}
              </div>
              {flight.destinationTerminal && (
                <div className="text-xs font-medium text-[#FD561E] mt-1">
                  T{flight.destinationTerminal}
                </div>
              )}
            </div>
          </div>

          {/* Fare Count Badge */}
          {hasMultipleFares && (
            <div className="bg-[#FD561E] bg-opacity-10 px-4 py-2 rounded-xl text-center min-w-[120px]">
              <div className="text-xs text-gray-500">Starting from</div>
              <div className="text-xl font-bold text-[#FD561E]">
                ₹{uniqueFares[0].totalPrice?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {uniqueFares.length} fare options
              </div>
            </div>
          )}
        </div>

        {/* Layover Information (if any) */}
        {flight.layovers?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {flight.layovers.map((layover, idx) => (
              <div key={idx} className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full flex items-center">
                <FaClock className="mr-1 text-amber-500" size={10} />
                {layover.airport}: {layover.formattedDuration}
              </div>
            ))}
          </div>
        )}

        {/* ============ FARE OPTIONS SECTION ============ */}
        {hasMultipleFares && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <FaTag className="text-[#FD561E] mr-2" />
                Select Fare Type ({uniqueFares.length} options)
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFareComparison(true);
                }}
                className="text-sm text-[#FD561E] hover:text-[#e04e1b] font-medium flex items-center"
              >
                Compare Fares
                <FaArrowRight className="ml-1 text-xs" />
              </button>
            </div>

            {/* Fare Cards - Vertical Stack */}
            <div className="space-y-3">
              {uniqueFares.map((fare, index) => {
                const isExpanded = expandedFareId === fare.id;
                const isLoading = loadingFareId === fare.id;
                const fareBrand = fare.brand || { name: 'Economy', features: [] };
                const baggage = fare.baggage || { weight: 15, unit: 'kg' };
                
                return (
                  <div 
                    key={fare.id || index}
                    className="fare-card border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-[#FD561E] hover:shadow-md transition-all"
                  >
                    {/* Fare Header - Always Visible */}
                    <div 
                      onClick={(e) => toggleFareExpand(fare.id, e)}
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {/* Fare Type Badge */}
                          <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getFareBadgeStyle(fareBrand.name)}`}>
                            {fareBrand.name}
                          </div>
                          
                          {/* Fare Features Summary */}
                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1 text-gray-600">
                              <FaSuitcase className="text-[#FD561E]" size={12} />
                              <span>{baggage.pieces ? `${baggage.pieces}pc` : `${baggage.weight}${baggage.unit}`}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <FaChair className="text-[#FD561E]" size={12} />
                              <span>{fare.cabinClass || 'Economy'}</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-xs font-medium
                              ${fare.refundable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {fare.refundable ? 'Refundable' : 'Non-refundable'}
                            </div>
                          </div>

                          {index === 0 && (
                            <span className="bg-[#FD561E] text-white text-xs px-2 py-0.5 rounded-full">
                              Best Price
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xl font-bold text-[#FD561E]">
                              ₹{fare.totalPrice?.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">per passenger</div>
                          </div>
                          <div className="text-gray-400">
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Fare Details */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-5 space-y-4">
                        
                        {/* Price Breakdown */}
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Details</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Base Fare:</span>
                              <span className="font-medium">₹{fare.basePrice?.toLocaleString() || Math.round(fare.totalPrice * 0.85).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Taxes & Fees:</span>
                              <span className="font-medium">
                                ₹{(calculateTotalTaxes(fare) || Math.round(fare.totalPrice * 0.15)).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold text-[#FD561E] pt-2 border-t mt-2">
                              <span>Total:</span>
                              <span>₹{fare.totalPrice?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {/* Baggage */}
                          <div className="bg-white rounded-xl p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-[#FD561E] bg-opacity-10 rounded-lg flex items-center justify-center">
                                <FaSuitcase className="text-[#FD561E]" size={12} />
                              </div>
                              <span className="text-xs font-medium text-gray-500">BAGGAGE</span>
                            </div>
                            <p className="text-sm font-semibold">
                              {baggage.pieces ? `${baggage.pieces} piece(s)` : `${baggage.weight}${baggage.unit}`}
                            </p>
                          </div>

                          {/* Cabin */}
                          <div className="bg-white rounded-xl p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-[#FD561E] bg-opacity-10 rounded-lg flex items-center justify-center">
                                <FaChair className="text-[#FD561E]" size={12} />
                              </div>
                              <span className="text-xs font-medium text-gray-500">CABIN</span>
                            </div>
                            <p className="text-sm font-semibold">{fare.cabinClass || 'Economy'}</p>
                          </div>

                          {/* Meals */}
                          <div className="bg-white rounded-xl p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-[#FD561E] bg-opacity-10 rounded-lg flex items-center justify-center">
                                <FaUtensils className="text-[#FD561E]" size={12} />
                              </div>
                              <span className="text-xs font-medium text-gray-500">MEALS</span>
                            </div>
                            <p className="text-sm font-semibold">
                              {fare.amenities?.meals ? 'Included' : 'Not included'}
                            </p>
                          </div>
                        </div>

                        {/* Fare Features List */}
                        {fareBrand.features && fareBrand.features.length > 0 && (
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Fare Features</h4>
                            <ul className="space-y-2">
                              {fareBrand.features.slice(0, 4).map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <FaCheckCircle className="text-[#FD561E] mt-0.5 flex-shrink-0" size={14} />
                                  <span className="text-gray-600">{feature}</span>
                                </li>
                              ))}
                              {fareBrand.features.length > 4 && (
                                <li className="text-sm text-[#FD561E] font-medium">
                                  +{fareBrand.features.length - 4} more features
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Cancellation Policy */}
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Cancellation Policy</h4>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
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

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails?.(flight);
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            disabled={isLoading}
                          >
                            View Details
                          </button>
                          <button
                            onClick={(e) => handleSelectFare(fare, e)}
                            disabled={isLoading}
                            className="fare-select-btn flex-1 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <FaSpinner className="animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Select Fare'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Single Fare Option */}
        {!hasMultipleFares && uniqueFares[0] && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-[#FD561E]">
                  ₹{uniqueFares[0].totalPrice?.toLocaleString()}
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <FaSuitcase className="text-[#FD561E]" size={14} />
                    <span>{uniqueFares[0].baggage?.weight || 15}{uniqueFares[0].baggage?.unit || 'kg'}</span>
                  </div>
                  <div className={`text-sm px-3 py-1 rounded-full ${
                    uniqueFares[0].refundable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {uniqueFares[0].refundable ? 'Refundable' : 'Non-refundable'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails?.(flight);
                  }}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={(e) => handleSelectFare(uniqueFares[0], e)}
                  disabled={loadingFareId === uniqueFares[0].id}
                  className="fare-select-btn px-6 py-2.5 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-medium rounded-xl transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingFareId === uniqueFares[0].id ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Book Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fare Comparison Modal */}
      {showFareComparison && (
        <FareComparisonModal
          flight={flight}
          fares={uniqueFares}
          onClose={() => setShowFareComparison(false)}
          onSelect={(fare) => {
            const index = uniqueFares.findIndex(f => f.id === fare.id);
            if (index !== -1) {
              setExpandedFareId(fare.id);
            }
            setShowFareComparison(false);
          }}
        />
      )}
    </div>
  );
};

// Fare Comparison Modal Component
const FareComparisonModal = ({ flight, fares, onClose, onSelect }) => {
  const [selectedFareIndex, setSelectedFareIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSelect = () => {
    setLoading(true);
    // Simulate a small delay for better UX
    setTimeout(() => {
      onSelect(fares[selectedFareIndex]);
      setLoading(false);
    }, 300);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Compare Fare Options</h2>
            <p className="text-sm text-gray-500 mt-1">{flight.airline} {flight.flightNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimesCircle className="w-6 h-6 text-gray-400 hover:text-[#FD561E]" />
          </button>
        </div>
        
        <div className="p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600 rounded-l-xl">Features</th>
                {fares.map((fare, idx) => (
                  <th key={idx} className="p-4 text-center border-l first:border-l-0">
                    <div className="font-bold text-gray-900 text-lg">{fare.brand?.name || 'Economy'}</div>
                    <div className="text-2xl font-bold text-[#FD561E] mt-1">₹{fare.totalPrice?.toLocaleString()}</div>
                    {idx === 0 && (
                      <span className="inline-block mt-2 text-xs bg-[#FD561E] text-white px-3 py-1 rounded-full">
                        Best Price
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4 font-medium text-gray-700">Baggage</td>
                {fares.map((fare, idx) => (
                  <td key={idx} className="p-4 text-center border-l">
                    {fare.baggage?.pieces 
                      ? `${fare.baggage.pieces} piece(s)` 
                      : `${fare.baggage?.weight || 15}${fare.baggage?.unit || 'kg'}`}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium text-gray-700">Cabin Class</td>
                {fares.map((fare, idx) => (
                  <td key={idx} className="p-4 text-center border-l">{fare.cabinClass || 'Economy'}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium text-gray-700">Refundable</td>
                {fares.map((fare, idx) => (
                  <td key={idx} className="p-4 text-center border-l">
                    {fare.refundable ? (
                      <span className="text-green-600">✓ Yes</span>
                    ) : (
                      <span className="text-red-600">✗ No</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium text-gray-700">Meals</td>
                {fares.map((fare, idx) => (
                  <td key={idx} className="p-4 text-center border-l">
                    {fare.amenities?.meals ? '✓ Included' : '✗ Not included'}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium text-gray-700">Seat Selection</td>
                {fares.map((fare, idx) => (
                  <td key={idx} className="p-4 text-center border-l">
                    {fare.amenities?.seatSelection ? '✓ Free' : '✗ Paid'}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium text-gray-700">Wi-Fi</td>
                {fares.map((fare, idx) => (
                  <td key={idx} className="p-4 text-center border-l">
                    {fare.amenities?.wifi ? '✓ Available' : '✗ Not available'}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium text-gray-700">Change Fee</td>
                {fares.map((fare, idx) => (
                  <td key={idx} className="p-4 text-center border-l">
                    {fare.penalties?.change?.amount 
                      ? `₹${fare.penalties.change.amount}`
                      : fare.penalties?.change?.percentage
                      ? `${fare.penalties.change.percentage}%`
                      : 'Not allowed'}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium text-gray-700">Cancellation Fee</td>
                {fares.map((fare, idx) => (
                  <td key={idx} className="p-4 text-center border-l">
                    {fare.penalties?.cancel?.amount 
                      ? `₹${fare.penalties.cancel.amount}`
                      : fare.penalties?.cancel?.percentage
                      ? `${fare.penalties.cancel.percentage}%`
                      : 'Not allowed'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSelect}
              disabled={loading}
              className="px-6 py-3 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-medium rounded-xl transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : (
                `Continue with ${fares[selectedFareIndex]?.brand?.name || 'Selected'} Fare`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneWayFlightCard;