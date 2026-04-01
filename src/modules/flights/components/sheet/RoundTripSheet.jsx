// src/modules/flights/components/sheet/RoundTripSheet.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTimes, 
  FaPlane, 
  FaSuitcase, 
  FaChair, 
  FaUtensils, 
  FaExchangeAlt, 
  FaUndo, 
  FaTag, 
  FaArrowRight, 
  FaCheckCircle, 
  FaStar, 
  FaCrown, 
  FaGem, 
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';

import { getFlightPricing, buildRoundTripPricingRequest } from '../../services/pricingService';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const match = price.toString().match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
};

const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch {
    return '--:--';
  }
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatBaggage = (baggage) => {
  if (!baggage?.checked) return '15kg';
  if (baggage.checked.weight_kg) {
    return `${baggage.checked.weight_kg}${baggage.checked.unit?.toLowerCase() === 'kilograms' ? 'kg' : baggage.checked.unit || 'kg'}`;
  }
  if (baggage.checked.pieces) {
    return `${baggage.checked.pieces} piece${baggage.checked.pieces > 1 ? 's' : ''}`;
  }
  return '15kg';
};

// ============================================================================
// STYLING HELPERS
// ============================================================================

const getFareBadgeStyle = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  if (name.includes('flex')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (name.includes('super')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (name.includes('plus') || name.includes('stretch')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (name.includes('business') || name.includes('first')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (name.includes('upfront')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (name.includes('regular')) return 'bg-gray-50 text-gray-700 border-gray-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const getFareIcon = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  if (name.includes('business') || name.includes('first')) return <FaCrown className="text-amber-600" size={18} />;
  if (name.includes('super') || name.includes('plus')) return <FaStar className="text-purple-600" size={18} />;
  if (name.includes('flex')) return <FaGem className="text-blue-600" size={18} />;
  if (name.includes('upfront')) return <FaStar className="text-indigo-600" size={18} />;
  return <FaTag className="text-gray-600" size={16} />;
};

// ============================================================================
// FLIGHT SUMMARY COMPONENT
// ============================================================================

const FlightSummary = ({ flight, legType }) => {
  if (!flight) return null;
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className={`px-5 py-3 ${legType === 'outbound' ? 'bg-blue-50 border-b border-blue-100' : 'bg-emerald-50 border-b border-emerald-100'}`}>
        <div className="flex items-center gap-2">
          <FaPlane className={`${legType === 'outbound' ? 'rotate-45 text-blue-600' : '-rotate-45 text-emerald-600'}`} size={14} />
          <span className="font-semibold text-gray-700">{legType === 'outbound' ? 'Outbound Flight' : 'Return Flight'}</span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="font-bold text-gray-700 text-sm">{flight.airlineCode || flight.airline?.substring(0, 2)}</span>
            </div>
            <div>
              <div className="font-bold text-gray-800">{flight.airline}</div>
              <div className="text-xs text-gray-500">{flight.flightNumber}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">{formatDate(flight.departureTime)}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between py-4">
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-gray-800">{formatTime(flight.departureTime)}</div>
            <div className="text-sm font-medium text-gray-600 mt-1">{flight.origin}</div>
            <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1">
              <FaCalendarAlt size={10} />
              {formatDate(flight.departureTime)}
            </div>
          </div>
          
          <div className="flex-1 px-4">
            <div className="relative flex items-center justify-center">
              <div className="w-full h-px bg-gray-200"></div>
              <div className="absolute bg-white px-3 py-1 rounded-full text-xs text-gray-500 border border-gray-200 shadow-sm">
                {formatDuration(flight.duration)}
              </div>
            </div>
            <div className="text-center text-xs text-gray-400 mt-2">
              {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
            </div>
          </div>
          
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-gray-800">{formatTime(flight.arrivalTime)}</div>
            <div className="text-sm font-medium text-gray-600 mt-1">{flight.destination}</div>
            <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1">
              <FaCalendarAlt size={10} />
              {formatDate(flight.arrivalTime)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FARE OPTION CARD
// ============================================================================

const FareOptionCard = ({ fare, isSelected, onSelect, isLowest }) => {
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  const price = parsePrice(fare.totalPrice);
  const brandName = fare.brand?.name || fare.brandName || 'Economy';
  
  return (
    <div
      onClick={() => onSelect(fare)}
      className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-[#FD561E] bg-gradient-to-r from-orange-50 to-white shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {isLowest && !isSelected && (
        <div className="absolute -top-2 -left-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
          <FaStar size={8} /> BEST VALUE
        </div>
      )}
      
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-[#FD561E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 z-10">
          <FaCheckCircle size={8} /> SELECTED
        </div>
      )}
      
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getFareBadgeStyle(brandName)}`}>
          {getFareIcon(brandName)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-lg text-gray-900">{brandName}</span>
            {fare.refundable && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Refundable</span>
            )}
          </div>
          {fare.fareBasis && (
            <p className="text-xs text-gray-500 mt-1">Fare basis: {fare.fareBasis}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#FD561E]">
            ₹{price.toLocaleString('en-IN')}
          </div>
          {fare.formattedPrice && parsePrice(fare.formattedPrice) !== price && (
            <div className="text-xs text-gray-400 line-through">
              {fare.formattedPrice}
            </div>
          )}
        </div>
      </div>
      
      {/* Benefits Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
          <FaSuitcase size={14} className="text-[#FD561E]" />
          <span>{formatBaggage(fare.baggage)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
          <FaChair size={14} className="text-[#FD561E]" />
          <span>{fare.cabinClass || 'Economy'}</span>
        </div>
        {fare.amenities?.mealType && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
            <FaUtensils size={14} className="text-[#FD561E]" />
            <span>{fare.amenities.mealType}</span>
          </div>
        )}
        {fare.amenities?.seatSelection && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
            <FaChair size={14} className="text-[#FD561E]" />
            <span>Free Seat Selection</span>
          </div>
        )}
      </div>
      
      {/* Change/Cancel Policy */}
      <div className="flex flex-wrap gap-2 mb-3">
        {fare.penalties?.change?.amount === 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
            <FaExchangeAlt size={10} /> Free changes
          </span>
        ) : fare.penalties?.change?.amount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
            <FaExchangeAlt size={10} /> Change fee: ₹{fare.penalties.change.amount}
          </span>
        )}
        {fare.penalties?.cancel?.amount === 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
            <FaUndo size={10} /> Free cancellation
          </span>
        ) : fare.penalties?.cancel?.amount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
            <FaUndo size={10} /> Cancel fee: ₹{fare.penalties.cancel.amount}
          </span>
        )}
      </div>
      
      {/* Tax Breakdown (Collapsible) */}
      {fare.taxBreakdown && fare.taxBreakdown.length > 0 && (
        <div className="mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTaxBreakdown(!showTaxBreakdown);
            }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showTaxBreakdown ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
            Tax breakdown
          </button>
          {showTaxBreakdown && (
            <div className="mt-2 pl-3 border-l-2 border-gray-200 space-y-1">
              {fare.taxBreakdown.map((tax, idx) => (
                <div key={idx} className="flex justify-between text-xs text-gray-500">
                  <span>{tax.description}</span>
                  <span>₹{tax.amount}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-medium text-gray-700 pt-1 mt-1 border-t border-gray-100">
                <span>Total taxes</span>
                <span>₹{fare.taxes || fare.taxBreakdown.reduce((sum, t) => sum + t.amount, 0)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// FARE OPTIONS LIST
// ============================================================================

const FareOptionsList = ({ fares, selectedFare, onFareSelect }) => {
  const sortedFares = useMemo(() => {
    return [...fares].sort((a, b) => parsePrice(a.totalPrice) - parsePrice(b.totalPrice));
  }, [fares]);

  if (!sortedFares.length) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
        <FaInfoCircle className="mx-auto mb-3 text-gray-300" size={40} />
        <p className="text-sm">No fare options available for this flight</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedFares.map((fare, index) => (
        <FareOptionCard
          key={fare.id || fare.fareKey || index}
          fare={fare}
          isSelected={selectedFare?.fareKey === fare.fareKey || selectedFare?.id === fare.id}
          onSelect={onFareSelect}
          isLowest={index === 0}
        />
      ))}
    </div>
  );
};

// ============================================================================
// TAB BUTTON
// ============================================================================

const TabButton = ({ active, onClick, children, count }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3.5 text-center font-semibold transition-all duration-200 border-b-2 flex items-center justify-center gap-2 ${
        active 
          ? 'border-[#FD561E] text-[#FD561E] bg-orange-50/30' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          active ? 'bg-[#FD561E]/10 text-[#FD561E]' : 'bg-gray-100 text-gray-500'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RoundTripSheet = ({ 
  isOpen, 
  onClose, 
  outboundFlight, 
  returnFlight, 
  passengerCounts,
  onFaresSelected 
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('outbound');
  const [selectedOutboundFare, setSelectedOutboundFare] = useState(null);
  const [selectedReturnFare, setSelectedReturnFare] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pricingError, setPricingError] = useState(null);

  // Calculate total price
  const totalPrice = useMemo(() => {
    const outboundPrice = parsePrice(selectedOutboundFare?.totalPrice || 0);
    const returnPrice = parsePrice(selectedReturnFare?.totalPrice || 0);
    return outboundPrice + returnPrice;
  }, [selectedOutboundFare, selectedReturnFare]);

  // Check if both legs have selected fares
  const isReadyToConfirm = selectedOutboundFare && selectedReturnFare;

  // ============ DEBUG: LOG FARE STRUCTURE WHEN SELECTED ============
  const handleFareSelect = (fare) => {
    console.log('\n🔍 [handleFareSelect] Fare selected:');
    console.log('  - leg:', activeTab);
    console.log('  - fare.brand.name:', fare.brand?.name);
    console.log('  - fare.fareBasis:', fare.fareBasis);
    console.log('  - fare.bookingCode:', fare.bookingCode);
    console.log('  - fare.hostToken:', fare.hostToken?.substring(0, 60) + '...');
    console.log('  - fare.hostTokenRef:', fare.hostTokenRef);
    console.log('  - fare.segments count:', fare.segments?.length);
    console.log('  - fare.hostTokenMap size:', fare.hostTokenMap ? Object.keys(fare.hostTokenMap).length : 0);
    console.log('  - fare.hostTokenRefMap size:', fare.hostTokenRefMap ? Object.keys(fare.hostTokenRefMap).length : 0);
    console.log('  - fare.segmentHostTokens count:', fare.segmentHostTokens?.length);
    
    if (fare.segments && fare.segments.length > 0) {
      console.log('  - Segment details:');
      fare.segments.forEach((seg, idx) => {
        console.log(`    Segment ${idx + 1}:`, {
          segmentKey: seg.segmentKey,
          hasHostToken: !!seg.hostToken,
          hasHostTokenRef: !!seg.hostTokenRef,
          hostTokenRef: seg.hostTokenRef,
          bookingCode: seg.bookingCode
        });
      });
    }
    
    if (fare.segmentHostTokens && fare.segmentHostTokens.length > 0) {
      console.log('  - segmentHostTokens:');
      fare.segmentHostTokens.forEach((token, idx) => {
        console.log(`    ${idx + 1}:`, {
          segmentKey: token.segmentKey,
          hasHostToken: !!token.hostToken,
          hasHostTokenRef: !!token.hostTokenRef,
          hostTokenRef: token.hostTokenRef
        });
      });
    }
    
    if (activeTab === 'outbound') {
      setSelectedOutboundFare(fare);
    } else {
      setSelectedReturnFare(fare);
    }
    setPricingError(null);
  };

  // ============ PRICING API INTEGRATION WITH DEBUG ============
  const handleConfirm = async () => {
    console.log('\n' + '='.repeat(70));
    console.log('🔵 [handleConfirm] FUNCTION STARTED');
    console.log('='.repeat(70));
    
    console.log('\n📊 [Step 0] Initial state check:');
    console.log('  - isReadyToConfirm:', isReadyToConfirm);
    console.log('  - selectedOutboundFare exists:', !!selectedOutboundFare);
    console.log('  - selectedReturnFare exists:', !!selectedReturnFare);
    console.log('  - outboundFlight exists:', !!outboundFlight);
    console.log('  - returnFlight exists:', !!returnFlight);
    console.log('  - passengerCounts:', passengerCounts);
    
    if (!isReadyToConfirm) {
      console.log('\n❌ [Step 0] EXITING - isReadyToConfirm is false');
      console.log('='.repeat(70) + '\n');
      return;
    }
    
    console.log('\n✅ [Step 0] All checks passed - proceeding');
    
    // ============ CRITICAL DEBUG: LOG SELECTED FARE STRUCTURE ============
    console.log('\n📦 [Step 1] Selected Fares Details with HOSTTOKEN:');
    console.log('  - Outbound Fare:');
    console.log('      brand:', selectedOutboundFare?.brand?.name);
    console.log('      fareBasis:', selectedOutboundFare?.fareBasis);
    console.log('      bookingCode:', selectedOutboundFare?.bookingCode);
    console.log('      hostToken:', selectedOutboundFare?.hostToken?.substring(0, 50) + '...');
    console.log('      hostTokenRef:', selectedOutboundFare?.hostTokenRef);
    console.log('      hasSegments:', !!selectedOutboundFare?.segments);
    console.log('      segmentsCount:', selectedOutboundFare?.segments?.length);
    console.log('      hasHostTokenMap:', !!selectedOutboundFare?.hostTokenMap);
    console.log('      hasHostTokenRefMap:', !!selectedOutboundFare?.hostTokenRefMap);
    
    if (selectedOutboundFare?.segments) {
      console.log('      Outbound Segments:');
      selectedOutboundFare.segments.forEach((seg, idx) => {
        console.log(`        Segment ${idx + 1}:`, {
          segmentKey: seg.segmentKey?.substring(0, 20) + '...',
          hasHostToken: !!seg.hostToken,
          hasHostTokenRef: !!seg.hostTokenRef,
          hostTokenRef: seg.hostTokenRef
        });
      });
    }
    
    console.log('  - Return Fare:');
    console.log('      brand:', selectedReturnFare?.brand?.name);
    console.log('      fareBasis:', selectedReturnFare?.fareBasis);
    console.log('      bookingCode:', selectedReturnFare?.bookingCode);
    console.log('      hostToken:', selectedReturnFare?.hostToken?.substring(0, 50) + '...');
    console.log('      hostTokenRef:', selectedReturnFare?.hostTokenRef);
    console.log('      hasSegments:', !!selectedReturnFare?.segments);
    console.log('      segmentsCount:', selectedReturnFare?.segments?.length);
    
    if (selectedReturnFare?.segments) {
      console.log('      Return Segments:');
      selectedReturnFare.segments.forEach((seg, idx) => {
        console.log(`        Segment ${idx + 1}:`, {
          segmentKey: seg.segmentKey?.substring(0, 20) + '...',
          hasHostToken: !!seg.hostToken,
          hasHostTokenRef: !!seg.hostTokenRef,
          hostTokenRef: seg.hostTokenRef
        });
      });
    }
    
    setIsConfirming(true);
    setPricingError(null);
    
    const loadingToast = toast.loading('Getting fare details...');
    
    try {
      console.log('\n🔨 [Step 4] Building round-trip pricing request...');
      
      const pricingRequest = buildRoundTripPricingRequest(
        outboundFlight,
        selectedOutboundFare,
        returnFlight,
        selectedReturnFare,
        passengerCounts
      );
      
      console.log('✅ [Step 4] Pricing request built successfully');
      console.log('  - Request structure:', {
        hasTraceId: !!pricingRequest.traceId,
        segmentsCount: pricingRequest.segments?.length,
        passengersCount: pricingRequest.passengers?.length,
        bookingRequirementsCount: pricingRequest.bookingRequirements?.length
      });
      
      // ============ CRITICAL: LOG BOOKING REQUIREMENTS ============
      console.log('\n📋 [BOOKING REQUIREMENTS] Checking for hostTokenRef:');
      pricingRequest.bookingRequirements.forEach((req, idx) => {
        console.log(`  Req ${idx + 1}:`, {
          segmentKey: req.segmentKey?.substring(0, 20) + '...',
          hasHostToken: !!req.hostToken,
          hasHostTokenRef: !!req.hostTokenRef,
          hostTokenRef: req.hostTokenRef
        });
      });
      
      console.log('\n📡 [Step 5] Calling getFlightPricing API...');
      const startTime = Date.now();
      const result = await getFlightPricing(pricingRequest);
      const endTime = Date.now();
      console.log(`  - API call completed in ${endTime - startTime}ms`);
      
      console.log('\n📥 [Step 6] API Result received:');
      console.log('  - result.success:', result.success);
      console.log('  - result has data:', !!result.data);
      console.log('  - result has error:', !!result.error);
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        console.log('\n🎉 [Step 8] Pricing SUCCESS!');
        toast.success('Fares confirmed! Proceed with booking.');
        
        const navigatePath = '/flights/booking/review';
        const navigationState = { 
          pricingResult: result.data,
          selectedOutboundFare: selectedOutboundFare,
          selectedReturnFare: selectedReturnFare,
          outboundFlight: outboundFlight,
          returnFlight: returnFlight,
          passengerCounts: passengerCounts,
          tripType: 'round-trip',
          totalPrice: totalPrice
        };
        
        navigate(navigatePath, { state: navigationState });
        onClose();
        
      } else {
        console.log('\n❌ [Step 8] Pricing FAILED');
        console.log('  - Error:', result.error);
        toast.error(result.userMessage || result.error || 'Failed to get pricing. Please try again.');
        setPricingError(result.userMessage || result.error || 'Pricing failed');
      }
      
    } catch (error) {
      console.error('\n💥 [ERROR CATCH] Unexpected error in handleConfirm:');
      console.error('  - Error message:', error.message);
      toast.dismiss(loadingToast);
      toast.error('An unexpected error occurred. Please try again.');
      setPricingError(error.message || 'Network error');
      
    } finally {
      setIsConfirming(false);
      console.log('\n🔚 [handleConfirm] Completed');
      console.log('='.repeat(70) + '\n');
    }
  };
  
  const currentFlight = activeTab === 'outbound' ? outboundFlight : returnFlight;
  const currentSelectedFare = activeTab === 'outbound' ? selectedOutboundFare : selectedReturnFare;
  const currentFares = currentFlight?.fares || [];
  const currentFareCount = currentFares.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaTag className="text-[#FD561E]" size={20} />
              Select Your Fares
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {passengerCounts?.ADT || 1} Adult{passengerCounts?.ADT > 1 ? 's' : ''}
              {passengerCounts?.CNN > 0 && ` • ${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`}
              {passengerCounts?.INF > 0 && ` • ${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs with fare counts */}
        <div className="flex border-b bg-white sticky top-[85px] z-10">
          <TabButton 
            active={activeTab === 'outbound'} 
            onClick={() => setActiveTab('outbound')}
            count={outboundFlight?.fares?.length}
          >
            <FaPlane className="rotate-45" size={14} />
            Outbound
          </TabButton>
          <TabButton 
            active={activeTab === 'return'} 
            onClick={() => setActiveTab('return')}
            count={returnFlight?.fares?.length}
          >
            <FaPlane className="-rotate-45" size={14} />
            Return
          </TabButton>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {currentFlight ? (
            <>
              <FlightSummary flight={currentFlight} legType={activeTab} />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 text-lg">Available Fares</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {currentFareCount} {currentFareCount === 1 ? 'option' : 'options'}
                  </span>
                </div>
                <FareOptionsList
                  fares={currentFares}
                  selectedFare={currentSelectedFare}
                  onFareSelect={handleFareSelect}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FaPlane className="mx-auto mb-3 text-gray-300" size={48} />
              <p className="text-sm">No flight data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Outbound:</span>
                {selectedOutboundFare ? (
                  <span className="font-medium text-gray-800">{selectedOutboundFare.brand?.name || 'Selected'}</span>
                ) : (
                  <span className="text-amber-600">Not selected</span>
                )}
              </div>
              <FaArrowRight className="text-gray-300" size={12} />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-gray-600">Return:</span>
                {selectedReturnFare ? (
                  <span className="font-medium text-gray-800">{selectedReturnFare.brand?.name || 'Selected'}</span>
                ) : (
                  <span className="text-amber-600">Not selected</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Total Price</div>
              <div className="text-2xl font-bold text-[#FD561E]">
                ₹{totalPrice.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          
          {pricingError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <FaInfoCircle className="text-red-500 flex-shrink-0" size={14} />
              <p className="text-sm text-red-700">{pricingError}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={!isReadyToConfirm || isConfirming}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isReadyToConfirm && !isConfirming
                  ? 'bg-gradient-to-r from-[#FD561E] to-[#e04e1b] text-white shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isConfirming ? (
                <>
                  <FaSpinner className="animate-spin" size={16} />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Booking
                  <FaArrowRight size={14} />
                </>
              )}
            </button>
          </div>
          
          {!isReadyToConfirm && (
            <div className="mt-3 text-xs text-amber-600 flex items-center justify-center gap-1 bg-amber-50 p-2 rounded-lg">
              <FaInfoCircle size={12} />
              {!selectedOutboundFare && !selectedReturnFare 
                ? 'Please select a fare for both outbound and return flights'
                : !selectedOutboundFare 
                  ? 'Please select a fare for the outbound flight'
                  : 'Please select a fare for the return flight'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundTripSheet;