// src/modules/flights/components/shared/OneWayFlightCard.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaSuitcase, 
  FaChair, 
  FaUtensils,
  FaClock,
  FaPlane,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaCreditCard,
  FaTimesCircle,
  FaShieldAlt,
  FaArrowRight,
  FaCalendarCheck,
  FaUsers,
  FaExclamationTriangle
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

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
};

const calculateTotalTaxes = (fare) => {
  if (!fare?.taxes) return 0;
  
  if (Array.isArray(fare.taxes)) {
    return fare.taxes.reduce((sum, tax) => sum + (tax.amount || 0), 0);
  }
  
  if (typeof fare.taxes === 'object') {
    return fare.taxes.amount || 0;
  }
  
  if (typeof fare.taxes === 'number') {
    return fare.taxes;
  }
  
  return 0;
};

// Helper function to get seat availability status
const getSeatAvailabilityStatus = (bookingCount) => {
  const count = parseInt(bookingCount);
  if (isNaN(count)) return { text: 'Check Availability', color: 'text-gray-600', bg: 'bg-gray-50', icon: '❓' };
  if (count >= 9) return { text: 'High Availability', color: 'text-green-600', bg: 'bg-green-50', icon: '✅' };
  if (count >= 5) return { text: 'Limited Seats', color: 'text-amber-600', bg: 'bg-amber-50', icon: '⚠️' };
  if (count >= 1) return { text: 'Last Few Seats!', color: 'text-red-600', bg: 'bg-red-50', icon: '🔴' };
  return { text: 'Check Availability', color: 'text-gray-600', bg: 'bg-gray-50', icon: '❓' };
};

// Helper function to get meal info
const getMealInfo = (fare) => {
  // Check for meal info in amenities
  if (fare?.amenities?.meals === true) {
    const mealType = fare?.amenities?.mealType || fare?.amenities?.meal_type;
    if (mealType) {
      return { text: `${mealType} meal included`, icon: '🍽️', color: 'text-green-600' };
    }
    return { text: 'Complimentary meal included', icon: '🍽️', color: 'text-green-600' };
  }
  if (fare?.amenities?.mealType) {
    return { text: `${fare.amenities.mealType} meal available`, icon: '🍱', color: 'text-blue-600' };
  }
  if (fare?.amenities?.meal_type) {
    return { text: `${fare.amenities.meal_type} meal available`, icon: '🍱', color: 'text-blue-600' };
  }
  return { text: 'Meals available for purchase', icon: '💰', color: 'text-gray-500' };
};

// Helper function to get cancellation policy text
// Helper function to get cancellation policy text with DEBUG logs
const getCancellationPolicy = (fare) => {
  console.log('🔍 [CANCELLATION POLICY DEBUG]', {
    hasFare: !!fare,
    hasPenalties: !!fare?.penalties,
    hasCancel: !!fare?.penalties?.cancel,
    cancelAmount: fare?.penalties?.cancel?.amount,
    cancelAmountType: typeof fare?.penalties?.cancel?.amount,
    cancelPercentage: fare?.penalties?.cancel?.percentage,
    refundable: fare?.refundable,
    fullPenalties: fare?.penalties
  });
  
  // Check for amount first (most specific)
  if (fare?.penalties?.cancel?.amount) {
    const amount = fare.penalties.cancel.amount;
    console.log('✅ [CANCELLATION] Found amount:', amount, 'Type:', typeof amount);
    
    if (amount > 0) {
      console.log('✅ [CANCELLATION] Amount > 0, showing fixed fee');
      return {
        text: `₹${amount.toLocaleString()} cancellation fee`,
        amount: amount,
        type: 'fixed'
      };
    } else if (amount === 0) {
      console.log('✅ [CANCELLATION] Amount = 0, showing free cancellation');
      return {
        text: 'Free cancellation',
        type: 'free',
        isFree: true
      };
    }
  }
  
  // Check for percentage
  if (fare?.penalties?.cancel?.percentage) {
    const percentageValue = parseFloat(fare.penalties.cancel.percentage);
    console.log('✅ [CANCELLATION] Found percentage:', fare.penalties.cancel.percentage, 'Parsed:', percentageValue);
    
    if (percentageValue > 0) {
      console.log('✅ [CANCELLATION] Percentage > 0, showing percentage fee');
      return {
        text: `${percentageValue}% cancellation fee`,
        percentage: percentageValue,
        type: 'percentage'
      };
    } else if (percentageValue === 0) {
      console.log('✅ [CANCELLATION] Percentage = 0, showing free cancellation');
      return {
        text: 'Free cancellation',
        type: 'free',
        isFree: true
      };
    }
  }
  
  // Check refundable flag
  if (fare?.refundable === true) {
    console.log('✅ [CANCELLATION] Refundable = true, showing refundable with fees');
    return {
      text: 'Refundable with applicable fees',
      type: 'refundable'
    };
  }
  
  // Default fallback
  console.log('❌ [CANCELLATION] No penalty data found, showing non-refundable');
  return {
    text: 'Non-refundable',
    type: 'non-refundable'
  };
};

// Helper function to get change policy text with DEBUG logs
const getChangePolicy = (fare) => {
  console.log('🔍 [CHANGE POLICY DEBUG]', {
    hasFare: !!fare,
    hasPenalties: !!fare?.penalties,
    hasChange: !!fare?.penalties?.change,
    changeAmount: fare?.penalties?.change?.amount,
    changeAmountType: typeof fare?.penalties?.change?.amount,
    changePercentage: fare?.penalties?.change?.percentage,
    refundable: fare?.refundable,
    fullPenalties: fare?.penalties
  });
  
  // Check for amount first
  if (fare?.penalties?.change?.amount) {
    const amount = fare.penalties.change.amount;
    console.log('✅ [CHANGE] Found amount:', amount, 'Type:', typeof amount);
    
    if (amount > 0) {
      console.log('✅ [CHANGE] Amount > 0, showing fixed fee');
      return {
        text: `₹${amount.toLocaleString()} + fare difference`,
        amount: amount,
        type: 'fixed'
      };
    } else if (amount === 0) {
      console.log('✅ [CHANGE] Amount = 0, showing free changes');
      return {
        text: 'Free date changes',
        type: 'free',
        isFree: true
      };
    }
  }
  
  // Check for percentage
  if (fare?.penalties?.change?.percentage) {
    const percentageValue = parseFloat(fare.penalties.change.percentage);
    console.log('✅ [CHANGE] Found percentage:', fare.penalties.change.percentage, 'Parsed:', percentageValue);
    
    if (percentageValue > 0) {
      console.log('✅ [CHANGE] Percentage > 0, showing percentage fee');
      return {
        text: `${percentageValue}% + fare difference`,
        percentage: percentageValue,
        type: 'percentage'
      };
    } else if (percentageValue === 0) {
      console.log('✅ [CHANGE] Percentage = 0, showing free changes');
      return {
        text: 'Free date changes',
        type: 'free',
        isFree: true
      };
    }
  }
  
  // Check refundable flag
  if (fare?.refundable === true) {
    console.log('✅ [CHANGE] Refundable = true, showing changes allowed');
    return {
      text: 'Changes allowed with applicable fees',
      type: 'allowed'
    };
  }
  
  // Default fallback
  console.log('❌ [CHANGE] No penalty data found, showing changes not allowed');
  return {
    text: 'Changes not allowed',
    type: 'not-allowed'
  };
};

// Helper function to get change policy text
// const getChangePolicy = (fare) => {
//   // Check for amount first
//   if (fare.penalties?.change?.amount && fare.penalties.change.amount > 0) {
//     return {
//       text: `₹${fare.penalties.change.amount.toLocaleString()} + fare difference`,
//       amount: fare.penalties.change.amount,
//       type: 'fixed'
//     };
//   }
  
//   // Check for percentage - only if > 0
//   if (fare.penalties?.change?.percentage) {
//     const percentageValue = parseFloat(fare.penalties.change.percentage);
//     if (percentageValue > 0) {
//       return {
//         text: `${percentageValue}% + fare difference`,
//         percentage: percentageValue,
//         type: 'percentage'
//       };
//     }
//   }
  
//   // Check for free changes
//   if (fare.penalties?.change?.amount === 0 || 
//       (fare.penalties?.change?.percentage && parseFloat(fare.penalties.change.percentage) === 0)) {
//     return {
//       text: 'Free date changes',
//       type: 'free',
//       isFree: true
//     };
//   }
  
//   // Check refundable flag
//   if (fare.refundable === true) {
//     return {
//       text: 'Changes allowed with applicable fees',
//       type: 'allowed'
//     };
//   }
  
//   return {
//     text: 'Changes not allowed',
//     type: 'not-allowed'
//   };
// };

// Helper function to get baggage info
const getBaggageInfo = (fare) => {
  // Check baggage.checked structure
  if (fare?.baggage?.checked) {
    const checked = fare.baggage.checked;
    const weight = checked.weight || 15;
    const unit = checked.unit || 'kg';
    const pieces = checked.pieces || 1;
    
    return {
      checkIn: `${weight} ${unit}`,
      pieces: pieces,
      cabin: '7 kg (1 piece)',
      hasExtra: fare.baggage?.extra_available || false
    };
  }
  // Fallback to simple baggage weight
  const weight = fare?.baggage?.weight || 15;
  const unit = fare?.baggage?.unit || 'kg';
  
  return {
    checkIn: `${weight} ${unit}`,
    pieces: 1,
    cabin: '7 kg (1 piece)',
    hasExtra: false
  };
};

const OneWayFlightCard = ({ 
  flight, 
  onViewDetails,
  passengerCounts = { ADT: 1, CNN: 0, INF: 0 },
  airlineData,
  airlinesLoading
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('flight');
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const bestFare = useMemo(() => {
    if (!flight.fares || flight.fares.length === 0) return null;
    const sortedFares = [...flight.fares].sort((a, b) => a.totalPrice - b.totalPrice);
    return sortedFares[0];
  }, [flight.fares]);

  const airlineLogo = useMemo(() => {
    if (airlineData?.logo_url) return airlineData.logo_url;
    const localLogo = `/airlines/${flight.airlineCode?.toLowerCase()}.png`;
    const clearbitLogo = `https://logo.clearbit.com/${flight.airlineCode?.toLowerCase()}.com`;
    return localLogo || clearbitLogo;
  }, [airlineData, flight.airlineCode]);

  const airlineName = airlineData?.name || flight.airline || flight.airlineCode;

  // ✅ FIXED: Dynamic values from API - using correct field names
  const seatAvailability = getSeatAvailabilityStatus(bestFare?.seatsAvailable || flight.seatsAvailable || bestFare?.bookingCount);
  const mealInfo = getMealInfo(bestFare);
  const cancellationPolicy = getCancellationPolicy(bestFare);
  const changePolicy = getChangePolicy(bestFare);
  const baggageInfo = getBaggageInfo(bestFare);
  
  // ✅ FIXED: Terminal information - using flight level fields
  const hasTerminalInfo = flight.originTerminal || flight.destinationTerminal;
  const originTerminal = flight.originTerminal;
  const destinationTerminal = flight.destinationTerminal;
  
  // ✅ FIXED: Aircraft info
  const aircraft = flight.equipment || flight.aircraft || 'Not specified';
  
  // ✅ FIXED: Cabin class
  const cabinClass = bestFare?.cabinClass || flight.cabinClass || 'Economy';
  
  // ✅ FIXED: Fare basis and booking code
  const fareBasis = bestFare?.fareBasis;
  const bookingCode = bestFare?.bookingCode;

  // Show loading skeleton while airline data is being fetched
  if (airlinesLoading && !airlineData) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 mb-4 overflow-hidden animate-pulse">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
            <div className="text-right">
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bestFare) {
    return null;
  }

  const handleViewFareRules = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setActiveTab('flight');
    }
  };

  const handleFlightDetails = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(flight);
    }
  };

  const handleBookNow = async (e) => {
    e.stopPropagation();
    
    if (!bestFare) return;
    if (loading) return;
    
    setLoading(true);
    
    try {
      const loadingToast = toast.loading('Getting fare details...');
      
      const pricingRequest = buildOneWayPricingRequest(flight, bestFare, passengerCounts);
      const result = await getFlightPricing(pricingRequest);
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        const transformedData = result.data;
        const rawResponse = result.rawResponse;
        
        toast.success('Fare confirmed! Proceed with booking.');
        
        navigate('/flights/booking/review', { 
          state: { 
            pricingResult: transformedData,
            rawPricingResponse: rawResponse,
            selectedFare: bestFare,
            flight: flight,
            passengerCounts: passengerCounts,
            tripType: 'one-way',
            totalPrice: bestFare.totalPrice
          } 
        });
      } else {
        toast.error(result.userMessage || result.error || 'Failed to get pricing. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 mb-4 overflow-hidden">
      {/* Main Card Content */}
      <div className="p-5">
        {/* Responsive layout: On mobile, airline and price are on row 1, timeline below */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Airline Info - order 1 on mobile */}
          <div className="flex items-center gap-3 min-w-[180px] order-1">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden relative">
              <img 
                src={airlineLogo}
                alt={airlineName}
                className={`w-8 h-8 object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  setImageLoaded(true);
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${flight.airlineCode}&background=666&color=fff&size=32`;
                }}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{airlineName}</div>
              <div className="text-xs text-gray-400">{flight.flightNumber}</div>
            </div>
          </div>

          {/* Flight Timeline - order 2 on mobile, takes full width */}
          <div className="flex-1 flex items-center justify-center gap-6 md:gap-8 order-2 w-full md:w-auto">
            {/* Departure */}
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-800">
                {formatTime(flight.departureTime)}
              </div>
              <div className="text-sm text-gray-500">{flight.origin}</div>
              <div className="text-xs text-gray-400">
                {formatDate(flight.departureTime)}
              </div>
            </div>

            {/* Duration */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-1">{formatDuration(flight.duration)}</div>
              <div className="relative w-20">
                <div className="border-t border-gray-200"></div>
                <FaPlane className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-gray-300 text-xs rotate-90 bg-white px-1" />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-800">
                {formatTime(flight.arrivalTime)}
              </div>
              <div className="text-sm text-gray-500">{flight.destination}</div>
              <div className="text-xs text-gray-400">
                {formatDate(flight.arrivalTime)}
              </div>
            </div>
          </div>

          {/* Price and Action - order 3 on mobile, pushed to the right */}
          <div className="flex items-center gap-4 order-3 ml-auto md:ml-0">
            <div className="text-right">
              <div className="text-xl font-bold text-gray-800">
                ₹{bestFare.totalPrice?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">per adult</div>
            </div>
            
            <button
              onClick={handleFlightDetails}
              className="px-4 py-2 rounded-lg cursor-pointer bg-[#FD561E] hover:bg-[#e44a18] text-white transition-all duration-200 text-sm font-medium whitespace-nowrap"
            >
              View Details
            </button>
          </div>
        </div>

        {/* ✅ FIXED: Dynamic Badges Row - Using correct data */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex flex-wrap gap-2">
          {/* Seat Availability Badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${seatAvailability.bg} ${seatAvailability.color}`}>
            <FaUsers size={10} />
            {seatAvailability.text}
          </div>
          
          {/* Meals Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
            <span>{mealInfo.icon}</span>
            {mealInfo.text}
          </div>
          
          {/* Terminal Info Badge (only if available) */}
          {hasTerminalInfo && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
              <FaMapMarkerAlt size={10} />
              {originTerminal && `T${originTerminal}`}
              {originTerminal && destinationTerminal && ' → '}
              {destinationTerminal && `T${destinationTerminal}`}
            </div>
          )}
        </div>

        {/* Layover Info */}
        {flight.layovers?.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-50">
            <div className="flex flex-wrap gap-2">
              {flight.layovers.map((layover, idx) => (
                <div key={idx} className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <FaClock size={10} className="text-gray-400" />
                  {layover.airport}: {layover.formattedDuration}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fare Rules Toggle */}
        <div className="mt-4 pt-3 border-t border-gray-50">
          <button
            onClick={handleViewFareRules}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <FaChevronUp size={10} />
                Hide fare details
              </>
            ) : (
              <>
                <FaChevronDown size={10} />
                View fare details
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/30 px-5 py-4 animate-slideDown">
          {/* Tab Headers */}
          <div className="flex gap-4 border-b border-gray-200 mb-4">
            {[
              { id: 'flight', label: 'Flight Details', icon: FaPlane },
              { id: 'fare', label: 'Fare Summary', icon: FaCreditCard },
              { id: 'cancellation', label: 'Policies', icon: FaShieldAlt }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-gray-800 border-b-2 border-gray-800'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <tab.icon size={12} />
                  {tab.label}
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {/* Flight Details Tab */}
            {activeTab === 'flight' && (
              <>
                {/* Route with Terminal Info */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">Departure</div>
                      <div className="font-medium text-gray-800">{flight.origin}</div>
                      <div className="text-xs text-gray-400">{formatDateTime(flight.departureTime)}</div>
                      {originTerminal && (
                        <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                          <FaMapMarkerAlt size={10} />
                          Terminal {originTerminal}
                        </div>
                      )}
                    </div>
                    <div className="text-center px-2">
                      <div className="text-xs text-gray-400">{formatDuration(flight.duration)}</div>
                      <FaArrowRight className="text-gray-300 my-1" size={12} />
                      <div className="text-xs text-gray-400">{flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}</div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-sm text-gray-500">Arrival</div>
                      <div className="font-medium text-gray-800">{flight.destination}</div>
                      <div className="text-xs text-gray-400">{formatDateTime(flight.arrivalTime)}</div>
                      {destinationTerminal && (
                        <div className="text-xs text-purple-600 mt-1 flex items-center justify-end gap-1">
                          Terminal {destinationTerminal}
                          <FaMapMarkerAlt size={10} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aircraft & Baggage */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FaChair className="text-gray-400" size={12} />
                      <span className="text-xs text-gray-500">AIRCRAFT</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{aircraft}</p>
                    <p className="text-xs text-gray-400 mt-1">{cabinClass} Class</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FaSuitcase className="text-gray-400" size={12} />
                      <span className="text-xs text-gray-500">BAGGAGE</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{baggageInfo.checkIn}</p>
                    <p className="text-xs text-gray-400">
                      Check-in ({baggageInfo.pieces} piece{baggageInfo.pieces > 1 ? 's' : ''})
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Cabin: {baggageInfo.cabin}</p>
                    {baggageInfo.hasExtra && (
                      <p className="text-xs text-green-600 mt-1">Extra baggage available</p>
                    )}
                  </div>
                </div>

                {/* Meals Info */}
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <FaUtensils className="text-gray-400" size={12} />
                    <span className="text-xs text-gray-500">MEALS</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                    <span>{mealInfo.icon}</span>
                    {mealInfo.text}
                  </p>
                  {bestFare?.amenities?.mealType && (
                    <p className="text-xs text-gray-500 mt-1">Type: {bestFare.amenities.mealType}</p>
                  )}
                </div>

                {/* Seat Availability */}
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-gray-400" size={12} />
                    <span className="text-xs text-gray-500">SEAT AVAILABILITY</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-medium ${seatAvailability.color}`}>
                      {seatAvailability.text}
                    </span>
                    {(bestFare?.seatsAvailable || flight.seatsAvailable) && (
                      <span className="text-xs text-gray-400">
                        ({bestFare?.seatsAvailable || flight.seatsAvailable} seats available in this class)
                      </span>
                    )}
                  </div>
                  {seatAvailability.text === 'Last Few Seats!' && (
                    <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                      <FaExclamationTriangle size={10} />
                      Book soon! Limited inventory
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Fare Summary Tab */}
            {activeTab === 'fare' && (
              <>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Base Fare</span>
                      <span className="text-gray-700">₹{bestFare.basePrice?.toLocaleString() || Math.round(bestFare.totalPrice * 0.85).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Taxes & Fees</span>
                      <span className="text-gray-700">₹{(calculateTotalTaxes(bestFare) || Math.round(bestFare.totalPrice * 0.15)).toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-800">Total</span>
                        <span className="text-gray-900">₹{bestFare.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fare Basis Info */}
                {(fareBasis || bookingCode) && (
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400 text-center">
                      {fareBasis && `Fare Basis: ${fareBasis}`}
                      {fareBasis && bookingCode && ' | '}
                      {bookingCode && `Booking Class: ${bookingCode}`}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 flex items-start gap-2">
                    <FaInfoCircle size={12} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>Includes all applicable taxes. Final price may vary.</span>
                  </p>
                </div>
              </>
            )}

            {/* Policies Tab */}
            {activeTab === 'cancellation' && (
              <>
                {/* Cancellation Policy */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <FaTimesCircle className={`text-gray-400 ${
                      cancellationPolicy.type === 'non-refundable' ? 'text-red-500' : ''
                    }`} size={14} />
                    <span className="text-sm font-medium text-gray-700">Cancellation</span>
                  </div>
                  <p className={`text-sm ${
                    cancellationPolicy.type === 'non-refundable' ? 'text-red-600 font-medium' : 'text-gray-600'
                  }`}>
                    {cancellationPolicy.text}
                  </p>
                  {cancellationPolicy.type === 'percentage' && (
                    <div className="mt-2 p-2 bg-amber-50 rounded">
                      <p className="text-xs text-amber-700">
                        {cancellationPolicy.percentage}% of the total fare will be charged as cancellation fee
                      </p>
                    </div>
                  )}
                  {cancellationPolicy.type === 'fixed' && cancellationPolicy.amount > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 rounded">
                      <p className="text-xs text-amber-700">
                        Fixed cancellation fee of ₹{cancellationPolicy.amount.toLocaleString()} applies
                      </p>
                    </div>
                  )}
                  {cancellationPolicy.type === 'refundable' && (
                    <div className="mt-2 p-2 bg-green-50 rounded">
                      <p className="text-xs text-green-700">
                        Full refund minus applicable service fees
                      </p>
                    </div>
                  )}
                </div>

                {/* Date Change Policy */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCalendarCheck className="text-gray-400" size={14} />
                    <span className="text-sm font-medium text-gray-700">Date Change</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {changePolicy.text}
                  </p>
                  {changePolicy.type === 'percentage' && (
                    <div className="mt-2 p-2 bg-amber-50 rounded">
                      <p className="text-xs text-amber-700">
                        {changePolicy.percentage}% of fare + fare difference for date changes
                      </p>
                    </div>
                  )}
                  {changePolicy.type === 'fixed' && changePolicy.amount > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 rounded">
                      <p className="text-xs text-amber-700">
                        Change fee of ₹{changePolicy.amount.toLocaleString()} + fare difference
                      </p>
                    </div>
                  )}
                  {changePolicy.type === 'allowed' && (
                    <div className="mt-2 p-2 bg-green-50 rounded">
                      <p className="text-xs text-green-700">
                        Changes permitted with applicable fare difference and service fees
                      </p>
                    </div>
                  )}
                  {changePolicy.type === 'not-allowed' && (
                    <div className="mt-2 p-2 bg-red-50 rounded">
                      <p className="text-xs text-red-700">
                        Date changes are not permitted for this fare
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 flex items-start gap-2">
                    <FaShieldAlt size={12} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>Terms and conditions apply. Please review before booking.</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OneWayFlightCard;