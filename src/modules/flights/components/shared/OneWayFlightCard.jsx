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
  FaEye,
  FaCalendarCheck
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

const OneWayFlightCard = ({ 
  flight, 
  onViewDetails,
  passengerCounts = { ADT: 1, CNN: 0, INF: 0 } 
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('flight');
  const [loading, setLoading] = useState(false);
  
  const bestFare = useMemo(() => {
    if (!flight.fares || flight.fares.length === 0) return null;
    const sortedFares = [...flight.fares].sort((a, b) => a.totalPrice - b.totalPrice);
    return sortedFares[0];
  }, [flight.fares]);
  
  const airlineLogo = `https://logo.clearbit.com/${flight.airlineCode?.toLowerCase()}.com` 
    || `/airlines/${flight.airlineCode}.png`;

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

  if (!bestFare) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 mb-4 overflow-hidden">
      {/* Main Card Content */}
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Airline Info */}
          <div className="flex items-center gap-3 min-w-[180px]">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
              <img 
                src={airlineLogo}
                alt={flight.airline}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${flight.airlineCode}&background=666&color=fff&size=32`;
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-gray-800">{flight.airline}</div>
              <div className="text-xs text-gray-400">{flight.flightNumber}</div>
            </div>
          </div>

          {/* Flight Timeline */}
          <div className="flex-1 flex items-center justify-center gap-6 md:gap-8">
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
                {flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}
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

          {/* Price and Action */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xl font-bold text-gray-800">
                ₹{bestFare.totalPrice?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">per adult</div>
            </div>
            
            {/* Single Button - Flight Details */}
            <button
              onClick={handleFlightDetails}
              className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all duration-200 flex items-center gap-2 text-sm font-medium border border-gray-200"
            >
              <FaEye className="text-sm" />
              Details
            </button>
          </div>
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
                {/* Route */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">Departure</div>
                      <div className="font-medium text-gray-800">{flight.origin}</div>
                      <div className="text-xs text-gray-400">{formatDateTime(flight.departureTime)}</div>
                      {flight.originTerminal && (
                        <div className="text-xs text-gray-500 mt-1">Terminal {flight.originTerminal}</div>
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
                      {flight.destinationTerminal && (
                        <div className="text-xs text-gray-500 mt-1">Terminal {flight.destinationTerminal}</div>
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
                    <p className="text-sm font-medium text-gray-800">{flight.aircraft || 'Not specified'}</p>
                    <p className="text-xs text-gray-400 mt-1">{bestFare.cabinClass || 'Economy'} Class</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FaSuitcase className="text-gray-400" size={12} />
                      <span className="text-xs text-gray-500">BAGGAGE</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{bestFare.baggage?.weight || 15} kg</p>
                    <p className="text-xs text-gray-400">Check-in baggage</p>
                  </div>
                </div>

                {/* Meals */}
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <FaUtensils className="text-gray-400" size={12} />
                    <span className="text-xs text-gray-500">MEALS</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {bestFare.amenities?.meals ? 'Complimentary meal included' : 'Meals available for purchase'}
                  </p>
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
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <FaTimesCircle className="text-gray-400" size={14} />
                    <span className="text-sm font-medium text-gray-700">Cancellation</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {bestFare.penalties?.cancel?.amount 
                      ? `Cancellation fee: ₹${bestFare.penalties.cancel.amount.toLocaleString()}`
                      : bestFare.penalties?.cancel?.percentage
                      ? `Cancellation fee: ${bestFare.penalties.cancel.percentage}% of fare`
                      : bestFare.refundable 
                        ? 'Refundable with applicable fees'
                        : 'Non-refundable'}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCalendarCheck className="text-gray-400" size={14} />
                    <span className="text-sm font-medium text-gray-700">Date Change</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {bestFare.penalties?.change?.amount 
                      ? `Change fee: ₹${bestFare.penalties.change.amount.toLocaleString()} + fare difference`
                      : bestFare.penalties?.change?.percentage
                      ? `Change fee: ${bestFare.penalties.change.percentage}% of fare + fare difference`
                      : bestFare.refundable
                      ? 'Changes allowed with applicable fees'
                      : 'Changes not allowed'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Book Now Button */}
          <button
            onClick={handleBookNow}
            disabled={loading}
            className="w-full mt-5 bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <FaArrowRight size={14} />
                Book Now at ₹{bestFare.totalPrice?.toLocaleString()}
              </>
            )}
          </button>
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