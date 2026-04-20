// src/modules/flights/components/sheet/RoundTripSheet.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { fetchAirlines } from '../../services/airlineService';
import { useNavigate } from 'react-router-dom';
import { 
  FaTimes, FaPlane, FaSuitcase, FaChair, FaUtensils, FaExchangeAlt,
  FaUndo, FaTag, FaArrowRight, FaCheckCircle, FaStar, FaCrown, FaGem,
  FaInfoCircle, FaChevronDown, FaChevronUp, FaClock, FaCalendarAlt,
  FaMapMarkerAlt, FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';

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
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch { return '--:--'; }
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
};

const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const formatBaggage = (baggage) => {
  if (!baggage?.checked) return '15kg';
  if (baggage.checked.weight_kg)
    return `${baggage.checked.weight_kg}${baggage.checked.unit?.toLowerCase() === 'kilograms' ? 'kg' : baggage.checked.unit || 'kg'}`;
  if (baggage.checked.pieces)
    return `${baggage.checked.pieces} piece${baggage.checked.pieces > 1 ? 's' : ''}`;
  return '15kg';
};

// ============================================================================
// STYLING HELPERS
// ============================================================================

const getFareBadgeStyle = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  if (name.includes('flex'))   return 'bg-blue-50 text-blue-700 border-blue-200';
  if (name.includes('super'))  return 'bg-purple-50 text-purple-700 border-purple-200';
  if (name.includes('plus') || name.includes('stretch')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (name.includes('business') || name.includes('first')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (name.includes('upfront')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const getFareIcon = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  if (name.includes('business') || name.includes('first')) return <FaCrown className="text-amber-600" size={18} />;
  if (name.includes('super') || name.includes('plus'))     return <FaStar  className="text-purple-600" size={18} />;
  if (name.includes('flex'))    return <FaGem className="text-blue-600"   size={18} />;
  if (name.includes('upfront')) return <FaStar className="text-indigo-600" size={18} />;
  return <FaTag className="text-gray-600" size={16} />;
};

// ============================================================================
// FLIGHT SUMMARY COMPONENT
// ============================================================================

const FlightSummary = ({ flight, legType, airlineLogo }) => {
  if (!flight) return null;
  const depDate = flight.departureTime
    ? new Date(flight.departureTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })
    : '';
  const depTime = formatTime(flight.departureTime);
  const arrTime = formatTime(flight.arrivalTime);

  return (
    <div className="flex items-center gap-2 py-1 flex-wrap">
      <span className="text-sm font-medium text-gray-700">
        {flight.originCity || flight.origin} → {flight.destinationCity || flight.destination}
      </span>
      {airlineLogo ? (
        <img src={airlineLogo} alt={flight.airline} className="w-5 h-5 object-contain rounded" onError={e => e.target.style.display='none'} />
      ) : (
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{flight.airlineCode}</span>
      )}
      <span className="text-sm text-gray-600">{flight.airline}</span>
      {depDate && <><span className="text-gray-300">•</span><span className="text-sm text-gray-500">{depDate}</span></>}
      <span className="text-gray-300">•</span>
      <span className="text-sm text-gray-500">Departure at {depTime} - Arrival at {arrTime}</span>
    </div>
  );
};

// ============================================================================
// FARE OPTION CARD
// ============================================================================

const FareOptionCard = ({ fare, isSelected, onSelect, isLowest }) => {
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  const price     = parsePrice(fare.totalPrice);
  const brandName = fare.brand?.name || fare.brandName || 'Economy';

  const cabinBag = fare.baggage?.cabin?.weight_kg
    ? `${fare.baggage.cabin.weight_kg}kg`
    : fare.baggage?.cabin?.pieces
      ? `${fare.baggage.cabin.pieces} piece`
      : '7kg';

  const checkedBag = formatBaggage(fare.baggage);

  const cancelFee = fare.penalties?.cancel?.amount === 0
    ? 'Free cancellation'
    : fare.penalties?.cancel?.amount > 0
      ? `Cancellation fee starts at ₹${fare.penalties.cancel.amount.toLocaleString('en-IN')}`
      : fare.penalties?.cancel?.percentage
        ? `Cancellation fee ${fare.penalties.cancel.percentage}% of fare`
        : null;

  const changeFee = fare.penalties?.change?.amount === 0
    ? 'Free date change'
    : fare.penalties?.change?.amount > 0
      ? `Date change fee starts at ₹${fare.penalties.change.amount.toLocaleString('en-IN')}`
      : fare.penalties?.change?.percentage
        ? `Date change fee ${fare.penalties.change.percentage}% of fare`
        : null;

  const isFree = (val) => val?.toLowerCase().startsWith('free');

  return (
    <div
      onClick={() => onSelect(fare)}
      className={`relative rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden flex-shrink-0 ${
        isSelected ? 'border-[#FD561E] shadow-md' : 'border-gray-200 hover:border-gray-300'
      }`}
      style={{ width: 'calc(85vw - 40px)', maxWidth: '280px', minWidth: '240px' }}
    >
      {/* Top bar */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isSelected ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
        <div className="flex items-center gap-2 min-w-0">
          {isSelected ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#FD561E] flex items-center justify-center flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FD561E]" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
          )}
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-gray-900 leading-none">₹{price.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-gray-400">per adult</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wide truncate max-w-[70px]">{brandName}</span>
          {fare.refundable && (
            <span className="text-[10px] bg-green-100 text-green-700 px-1 py-0.5 rounded-full whitespace-nowrap">✓ Ref</span>
          )}
          {isSelected && <FaCheckCircle size={12} className="text-[#FD561E]" />}
        </div>
      </div>

      {/* Best value badge */}
      {isLowest && (
        <div className="bg-green-50 border-b border-green-100 px-4 py-1">
          <span className="text-[10px] font-bold text-green-700">★ BEST VALUE</span>
        </div>
      )}

      {/* Body */}
      <div className="px-4 py-3 space-y-3 bg-white">

        {/* Baggage */}
        <div>
          <p className="text-xs font-bold text-gray-700 mb-1.5">Baggage</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaCheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
              <span>{cabinBag} Cabin Baggage</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaCheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
              <span>{checkedBag} Check-in Baggage</span>
            </div>
          </div>
        </div>

        {/* Flexibility */}
        {(cancelFee || changeFee) && (
          <>
            <div className="border-t border-gray-100" />
            <div>
              <p className="text-xs font-bold text-gray-700 mb-1.5">Flexibility</p>
              <div className="space-y-1">
                {cancelFee && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className={`mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${isFree(cancelFee) ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-700'}`}>
                      {isFree(cancelFee) ? '✓' : '–'}
                    </span>
                    <span>{cancelFee}</span>
                  </div>
                )}
                {changeFee && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className={`mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${isFree(changeFee) ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-700'}`}>
                      {isFree(changeFee) ? '✓' : '–'}
                    </span>
                    <span>{changeFee}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Seats & Meals */}
        <>
          <div className="border-t border-gray-100" />
          <div>
            <p className="text-xs font-bold text-gray-700 mb-1.5">Seats, Meals & More</p>
            <div className="space-y-1">
              {fare.amenities?.seatSelection ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] font-bold">✓</span>
                  <span className="text-emerald-600 font-medium">Free</span><span className="ml-1">Seats</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-bold">–</span>
                  <span>Chargeable Seats</span>
                </div>
              )}
              {fare.amenities?.mealType ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] font-bold">✓</span>
                  <span className="text-emerald-600 font-medium">Complimentary</span><span className="ml-1">Meals</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-bold">–</span>
                  <span>Chargeable Meals</span>
                </div>
              )}
            </div>
          </div>
        </>

        {/* Fare basis */}
        {fare.fareBasis && (
          <p className="text-[11px] text-gray-400 pt-1 border-t border-gray-100">Fare basis: {fare.fareBasis}</p>
        )}

        {/* Tax Breakdown */}
        {fare.taxBreakdown && fare.taxBreakdown.length > 0 && (
          <div className="pt-1 border-t border-gray-100">
            <button
              onClick={(e) => { e.stopPropagation(); setShowTaxBreakdown(!showTaxBreakdown); }}
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
    <div>
      {/* px-1 ensures first card left border is never clipped */}
      <div
        className="flex gap-4 overflow-x-auto pb-3 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
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
      {sortedFares.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-2">
          <div className="flex gap-1.5">
            {sortedFares.map((fare, i) => {
              const isSel = selectedFare?.fareKey === fare.fareKey || selectedFare?.id === fare.id;
              return (
                <div key={i} className={`rounded-full transition-all duration-200 ${isSel ? 'w-4 h-1.5 bg-[#FD561E]' : 'w-1.5 h-1.5 bg-gray-300'}`} />
              );
            })}
          </div>
          <span className="text-[10px] text-gray-400">Swipe to see all fares</span>
        </div>
      )}
    </div>
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
  const [activeTab, setActiveTab]               = useState('outbound');
  const [isConfirming,  setIsConfirming]  = useState(false);
  const [pricingError,  setPricingError]  = useState(null);
  const [airlinesMap,   setAirlinesMap]   = useState({});

  // Auto-select first fare of each leg when sheet opens
  const getFirstFare = (flight) => {
    const fares = flight?.fares || [];
    if (!fares.length) return null;
    return [...fares].sort((a, b) => parsePrice(a.totalPrice) - parsePrice(b.totalPrice))[0];
  };

  const [selectedOutboundFare, setSelectedOutboundFare] = useState(() => getFirstFare(outboundFlight));
  const [selectedReturnFare,   setSelectedReturnFare]   = useState(() => getFirstFare(returnFlight));

  useEffect(() => {
    fetchAirlines().then(airlines => {
      const map = {};
      airlines.forEach(a => { map[a.code] = a; });
      setAirlinesMap(map);
    }).catch(() => {});
  }, []);

  // Re-sync if flights change
  useEffect(() => {
    if (!selectedOutboundFare && outboundFlight) {
      setSelectedOutboundFare(getFirstFare(outboundFlight));
    }
    if (!selectedReturnFare && returnFlight) {
      setSelectedReturnFare(getFirstFare(returnFlight));
    }
  }, [outboundFlight, returnFlight]);

  const getAirlineLogo = (code) => airlinesMap[code]?.logo_url || null;

  const totalPrice = useMemo(() => {
    return parsePrice(selectedOutboundFare?.totalPrice || 0) + parsePrice(selectedReturnFare?.totalPrice || 0);
  }, [selectedOutboundFare, selectedReturnFare]);

  const isReadyToConfirm = selectedOutboundFare && selectedReturnFare;

  const handleFareSelect = (fare) => {
    if (activeTab === 'outbound') setSelectedOutboundFare(fare);
    else setSelectedReturnFare(fare);
    setPricingError(null);
  };

  // ✅ MODIFIED: Open review page in a new tab using localStorage
  const handleConfirm = () => {
    // If on outbound tab, switch to return tab first
    if (activeTab === 'outbound') {
      setActiveTab('return');
      return;
    }
    // On return tab — proceed to booking in a new tab
    if (!isReadyToConfirm) return;
    setIsConfirming(true);
    try {
      // Prepare data to pass to review page
      const bookingState = {
        selectedOutboundFare,
        selectedReturnFare,
        outboundFlight,
        returnFlight,
        passengerCounts,
        tripType: 'round-trip',
        totalPrice
      };
      // Store in localStorage (will be read by BookingReviewPage)
      localStorage.setItem('bookingReviewState', JSON.stringify(bookingState));
      toast.success('Opening booking page in a new tab...');
      // Open in new tab
      window.open('/flights/booking/review', '_blank');
      onClose();
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      setPricingError(error.message || 'Navigation error');
      // ✅ Reset on error so user can try again
      setIsConfirming(false);
      hasNavigated.current = false;
    }
  };

  const currentFlight       = activeTab === 'outbound' ? outboundFlight : returnFlight;
  const currentSelectedFare = activeTab === 'outbound' ? selectedOutboundFare : selectedReturnFare;
  const currentFares        = currentFlight?.fares || [];
  const currentFareCount    = currentFares.length;

  // ✅ Reset navigation ref when sheet closes
  const handleClose = () => {
    hasNavigated.current = false;
    setIsConfirming(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl">

        {/* ── Header ── */}
        <div className="px-5 pt-4 pb-3 flex justify-between items-start border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Flight Details and Fare Options available for you!
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {passengerCounts?.ADT || 1} Adult{passengerCounts?.ADT > 1 ? 's' : ''}
              {passengerCounts?.CNN > 0 && ` • ${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`}
              {passengerCounts?.INF > 0 && ` • ${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-3">
            <FaTimes size={20} className="text-gray-500" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('outbound')}
              className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'outbound'
                  ? 'border-[#FD561E] text-[#FD561E]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Depart: {outboundFlight?.origin || ''} – {outboundFlight?.destination || ''}
            </button>
            <button
              onClick={() => setActiveTab('return')}
              className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'return'
                  ? 'border-[#FD561E] text-[#FD561E]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Return: {returnFlight?.origin || ''} – {returnFlight?.destination || ''}
            </button>
          </div>
          {currentFlight && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <FlightSummary
                flight={currentFlight}
                legType={activeTab}
                airlineLogo={getAirlineLogo(currentFlight?.airlineCode)}
              />
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-5">
          {currentFlight ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 text-base">Available Fares</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {currentFareCount} {currentFareCount === 1 ? 'option' : 'options'}
                </span>
              </div>
              <FareOptionsList fares={currentFares} selectedFare={currentSelectedFare} onFareSelect={handleFareSelect} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FaPlane className="mx-auto mb-3 text-gray-300" size={48} />
              <p className="text-sm">No flight data available</p>
            </div>
          )}
        </div>

        {/* ── Footer — compact ── */}
        <div className="bg-white border-t border-gray-100 px-5 py-3 shadow-lg">

          {/* selected summary + total */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#FD561E] flex-shrink-0"></div>
                <span className="text-gray-400">Out:</span>
                {selectedOutboundFare
                  ? <span className="font-semibold text-gray-800">{selectedOutboundFare.brand?.name || 'Selected'}</span>
                  : <span className="text-amber-500 font-medium">Not selected</span>
                }
              </div>
              <FaArrowRight className="text-gray-300 flex-shrink-0" size={9} />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                <span className="text-gray-400">Ret:</span>
                {selectedReturnFare
                  ? <span className="font-semibold text-gray-800">{selectedReturnFare.brand?.name || 'Selected'}</span>
                  : <span className="text-amber-500 font-medium">Not selected</span>
                }
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-[10px] text-gray-400 leading-none">Total</div>
              <div className="text-xl font-bold text-[#FD561E] leading-tight">₹{totalPrice.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {pricingError && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <FaInfoCircle className="text-red-500 flex-shrink-0" size={13} />
              <p className="text-xs text-red-700">{pricingError}</p>
            </div>
          )}

          {/* Button row - fixed alignment: Cancel left, Continue right */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={(activeTab === 'return' && !isReadyToConfirm) || isConfirming}
              className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-1.5 text-sm ${
                (activeTab === 'outbound' || isReadyToConfirm) && !isConfirming
                  ? 'bg-[#FD561E] text-white shadow-md hover:bg-[#e04e1b] active:scale-95 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isConfirming
                ? <><FaSpinner className="animate-spin" size={14} />Processing...</>
                : activeTab === 'outbound'
                  ? <>Continue to Booking <FaArrowRight size={12} /></>
                  : <>Continue to Booking <FaArrowRight size={12} /></>
              }
            </button>
          </div>

          {!isReadyToConfirm && (
            <p className="mt-2 text-[11px] text-amber-500 text-center">
              {!selectedOutboundFare && !selectedReturnFare
                ? 'Select a fare for both outbound and return flights'
                : !selectedOutboundFare
                  ? 'Select a fare for the outbound flight'
                  : 'Select a fare for the return flight'}
            </p>
          )}

        </div>
      </div>
    </div>
  );
};

export default RoundTripSheet;