// src/modules/flights/components/sheet/OneWaySheet.jsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseSheet from './BaseSheet';
import { formatTime, formatDate, formatDuration } from '../../utils/formatters';
import { buildOneWayPricingRequest, getFlightPricing } from '../../services/pricingService';
import toast from 'react-hot-toast';
import { 
  FaPlane, 
  FaClock, 
  FaSuitcase, 
  FaUserFriends,
  FaTag,
  FaInfoCircle,
  FaShieldAlt,
  FaUtensils,
  FaChair,
  FaWifi,
  FaTv,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaStar,
  FaCrown,
  FaGem,
  FaMapMarkerAlt,
  FaClock as FaClockRegular,
  FaSpinner,
  FaEye,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const OneWaySheet = ({ isOpen, onClose, flight, passengerCounts }) => {
  const navigate = useNavigate();
  const [selectedFareId, setSelectedFareId] = useState(null);
  const [loadingFareId, setLoadingFareId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFareForDetails, setSelectedFareForDetails] = useState(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const scrollContainerRef = useRef(null);
  
  if (!flight) return null;

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
    
    const fareMap = new Map();
    flight.fares.forEach(fare => {
      const key = `${fare.brand?.name}-${fare.totalPrice}-${fare.baggage?.weight}`;
      if (!fareMap.has(key)) {
        fareMap.set(key, fare);
      }
    });
    
    return Array.from(fareMap.values()).sort((a, b) => a.totalPrice - b.totalPrice);
  }, [flight]);

  // Check if we need horizontal scroll (more than 3 fares)
  const needsHorizontalScroll = allFares.length > 3;

  // Check scroll position to show/hide buttons
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current && needsHorizontalScroll) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const canScrollLeft = scrollLeft > 0;
        const canScrollRight = scrollLeft + clientWidth < scrollWidth - 10;
        setShowScrollButtons(canScrollLeft || canScrollRight);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && needsHorizontalScroll) {
      scrollContainer.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => scrollContainer.removeEventListener('scroll', checkScroll);
    }
  }, [needsHorizontalScroll]);

  // Check if it's a connecting flight
  const isConnecting = flight.segments?.length > 1 || flight.stops > 0;
  const segments = flight.segments || (flight.segments ? flight.segments : [flight]);

  // Get fare icon based on brand
  const getFareIcon = (brandName) => {
    const name = brandName?.toLowerCase() || '';
    if (name.includes('business') || name.includes('stretch')) return <FaCrown className="text-[#FD561E]" size={18} />;
    if (name.includes('first')) return <FaGem className="text-[#FD561E]" size={18} />;
    if (name.includes('flex') || name.includes('plus')) return <FaStar className="text-[#FD561E]" size={18} />;
    return <FaTag className="text-[#FD561E]" size={18} />;
  };

  // Get feature icon
  const getFeatureIcon = (featureName) => {
    const name = featureName?.toLowerCase() || '';
    if (name.includes('meal')) return <FaUtensils size={11} />;
    if (name.includes('seat')) return <FaChair size={11} />;
    if (name.includes('wifi')) return <FaWifi size={11} />;
    if (name.includes('priority')) return <FaClockRegular size={11} />;
    return <FaCheckCircle size={11} />;
  };

  const handleSelectFare = async (fare, e) => {
    e.stopPropagation();
    
    if (loadingFareId) return;
    
    setLoadingFareId(fare.id);
    
    try {
      const loadingToast = toast.loading('Getting fare details...');
      
      const pricingRequest = buildOneWayPricingRequest(flight, fare, passengerCounts);
      const result = await getFlightPricing(pricingRequest);
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        const transformedData = result.data;
        const rawResponse = result.rawResponse;
        
        toast.success('Fare confirmed! Proceed with booking.');
        onClose();
        
        navigate('/flights/booking/review', { 
          state: { 
            pricingResult: transformedData,
            rawPricingResponse: rawResponse,
            selectedFare: fare,
            flight: flight,
            passengerCounts: passengerCounts,
            tripType: 'one-way',
            totalPrice: fare.totalPrice
          } 
        });
      } else {
        toast.error(result.error || 'Failed to get pricing. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoadingFareId(null);
    }
  };

  const handleViewDetails = (fare) => {
    setSelectedFareForDetails(fare);
    setShowDetailsModal(true);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const calculateTaxes = (fare) => {
    if (fare.taxes) {
      if (Array.isArray(fare.taxes)) {
        return fare.taxes.reduce((sum, t) => sum + (t.amount || 0), 0);
      }
      return fare.taxes.amount || 0;
    }
    return Math.round(fare.totalPrice * 0.15);
  };

  return (
    <>
      <BaseSheet isOpen={isOpen} onClose={onClose} title="Select Your Fare">
        <div className="space-y-6 pb-6">
          
          {/* ============ FLIGHT HEADER - Minimal ============ */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-[#FD561E] font-bold text-xl">{flight.airlineCode}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{flight.airline}</div>
                  <div className="text-gray-400 text-sm">{flight.flightNumber}</div>
                </div>
              </div>
              {isConnecting && (
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                  Connecting Flight
                </div>
              )}
            </div>

            {/* Route Summary */}
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-xl font-semibold text-gray-800">
                  {formatTime(flight.departureTime)}
                </div>
                <div className="text-gray-500 text-sm mt-1">{flight.origin}</div>
                <div className="text-gray-400 text-xs mt-0.5">{formatDate(flight.departureTime)}</div>
                {flight.originTerminal && (
                  <div className="text-gray-400 text-xs mt-1">Terminal {flight.originTerminal}</div>
                )}
              </div>

              <div className="flex-1 px-4">
                <div className="text-gray-500 text-xs text-center mb-1 flex items-center justify-center gap-1">
                  <FaClock size={10} />
                  {formatDuration(flight.duration)}
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="w-full h-px bg-gray-200"></div>
                  <FaPlane className="absolute text-gray-400 transform rotate-90 bg-gray-50 px-1" size={12} />
                </div>
                <div className="text-gray-400 text-xs text-center mt-1">
                  {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
                </div>
              </div>

              <div className="text-center flex-1">
                <div className="text-xl font-semibold text-gray-800">
                  {formatTime(flight.arrivalTime)}
                </div>
                <div className="text-gray-500 text-sm mt-1">{flight.destination}</div>
                <div className="text-gray-400 text-xs mt-0.5">{formatDate(flight.arrivalTime)}</div>
                {flight.destinationTerminal && (
                  <div className="text-gray-400 text-xs mt-1">Terminal {flight.destinationTerminal}</div>
                )}
              </div>
            </div>
          </div>

          {/* ============ CONNECTING FLIGHT DETAILS ============ */}
          {isConnecting && flight.layovers && flight.layovers.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="font-medium text-gray-700 flex items-center gap-2 mb-3 text-sm">
                <FaClockRegular className="text-[#FD561E]" size={12} />
                Flight Details
              </h3>
              
              {segments.map((segment, idx) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <FaPlane className="text-[#FD561E] text-xs" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">{segment.airline || flight.airline}</span>
                        <span className="text-xs text-gray-400">{segment.flightNumber || flight.flightNumber}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div>
                          <span className="font-semibold text-gray-800">{formatTime(segment.departureTime)}</span>
                          <span className="text-gray-500 ml-1">{segment.origin || flight.origin}</span>
                          {segment.originTerminal && (
                            <span className="text-xs text-gray-400 ml-2">T{segment.originTerminal}</span>
                          )}
                        </div>
                        <FaArrowRight className="text-gray-400 text-xs" />
                        <div>
                          <span className="font-semibold text-gray-800">{formatTime(segment.arrivalTime)}</span>
                          <span className="text-gray-500 ml-1">{segment.destination || flight.destination}</span>
                          {segment.destinationTerminal && (
                            <span className="text-xs text-gray-400 ml-2">T{segment.destinationTerminal}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {idx < flight.layovers.length && (
                    <div className="ml-11 mt-2">
                      <div className="bg-gray-100 rounded-lg p-2 text-xs">
                        <span className="font-medium text-gray-600">Layover at {flight.layovers[idx].airport}</span>
                        <span className="text-gray-500 ml-2">{flight.layovers[idx].formattedDuration}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ============ FARE OPTIONS - CONDITIONAL LAYOUT ============ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">
                Select Fare Type
              </h3>
              <div className="flex items-center gap-2">
                {needsHorizontalScroll && (
                  <>
                    <button
                      onClick={scrollLeft}
                      className={`p-1.5 rounded-full transition-all ${
                        showScrollButtons 
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                          : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <FaChevronLeft size={14} />
                    </button>
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      {allFares.length} options
                    </span>
                    <button
                      onClick={scrollRight}
                      className={`p-1.5 rounded-full transition-all ${
                        showScrollButtons 
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                          : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </>
                )}
                {!needsHorizontalScroll && (
                  <span className="text-sm text-gray-500">{allFares.length} options</span>
                )}
              </div>
            </div>

            {/* Conditional Layout: Horizontal Scroll OR Grid */}
            {needsHorizontalScroll ? (
              // Horizontal Scroll Layout (when > 3 fares)
              <div className="relative">
                <div 
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
                  style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}
                >
                  {allFares.map((fare, index) => {
                    const isLoading = loadingFareId === fare.id;
                    const isLowest = index === 0;
                    const fareBrand = fare.brand || { name: 'Economy', features: [] };
                    const baggage = fare.baggage || { weight: 15, unit: 'kg' };
                    
                    return (
                      <div 
                        key={fare.id || index}
                        className={`
                          flex-shrink-0 w-[280px]
                          bg-white rounded-xl border transition-all duration-200
                          ${selectedFareId === fare.id 
                            ? 'border-[#FD561E] shadow-sm' 
                            : 'border-gray-200 hover:border-[#FD561E] hover:shadow-sm'
                          }
                          ${isLoading ? 'opacity-70' : ''}
                        `}
                      >
                        {/* Card Header */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getFareIcon(fareBrand.name)}
                              <span className="font-semibold text-gray-800">{fareBrand.name}</span>
                            </div>
                            {isLowest && (
                              <span className="text-xs bg-[#FD561E] text-white px-2 py-0.5 rounded-full font-medium">
                                Best Price
                              </span>
                            )}
                          </div>
                          <div className="mt-2">
                            <div className="text-2xl font-bold text-gray-900">
                              ₹{fare.totalPrice?.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">per adult</div>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              <FaSuitcase className="text-[#FD561E]" size={12} />
                              <span className="text-gray-600">{baggage.weight}{baggage.unit} checked</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FaChair className="text-[#FD561E]" size={12} />
                              <span className="text-gray-600">{fare.cabinClass || 'Economy'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {fare.refundable ? (
                                <>
                                  <FaCheckCircle className="text-green-500" size={12} />
                                  <span className="text-gray-600">Refundable</span>
                                </>
                              ) : (
                                <>
                                  <FaTimesCircle className="text-red-400" size={12} />
                                  <span className="text-gray-600">Non-refund</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FaUtensils className="text-[#FD561E]" size={12} />
                              <span className="text-gray-600">{fare.amenities?.meals ? 'Meal incl.' : 'No meal'}</span>
                            </div>
                          </div>

                          {fareBrand.features && fareBrand.features.length > 0 && (
                            <div className="pt-2 border-t border-gray-100">
                              <div className="space-y-1.5">
                                {fareBrand.features.slice(0, 2).map((feature, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                                    {getFeatureIcon(feature)}
                                    <span className="text-gray-500 truncate">{feature}</span>
                                  </div>
                                ))}
                                {fareBrand.features.length > 2 && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    +{fareBrand.features.length - 2} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="p-4 pt-0 flex gap-2">
                          <button
                            onClick={() => handleViewDetails(fare)}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                          >
                            <FaEye size={12} />
                            Details
                          </button>
                          <button
                            onClick={(e) => handleSelectFare(fare, e)}
                            disabled={isLoading}
                            className="flex-1 px-3 py-2 rounded-lg bg-[#FD561E] hover:bg-[#e04e1b] text-white text-sm font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                          >
                            {isLoading ? (
                              <FaSpinner className="animate-spin" size={12} />
                            ) : (
                              <>
                                Select
                                <FaArrowRight size={10} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Swipe Indicator (only when horizontal scroll is active) */}
                <div className="flex justify-center mt-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FD561E]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 ml-2">Swipe to see more</span>
                </div>
              </div>
            ) : (
              // Grid Layout (when <= 3 fares)
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allFares.map((fare, index) => {
                  const isLoading = loadingFareId === fare.id;
                  const isLowest = index === 0;
                  const fareBrand = fare.brand || { name: 'Economy', features: [] };
                  const baggage = fare.baggage || { weight: 15, unit: 'kg' };
                  
                  return (
                    <div 
                      key={fare.id || index}
                      className={`
                        bg-white rounded-xl border transition-all duration-200
                        ${selectedFareId === fare.id 
                          ? 'border-[#FD561E] shadow-sm' 
                          : 'border-gray-200 hover:border-[#FD561E] hover:shadow-sm'
                        }
                        ${isLoading ? 'opacity-70' : ''}
                      `}
                    >
                      {/* Card Header */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getFareIcon(fareBrand.name)}
                            <span className="font-semibold text-gray-800">{fareBrand.name}</span>
                          </div>
                          {isLowest && (
                            <span className="text-xs bg-[#FD561E] text-white px-2 py-0.5 rounded-full font-medium">
                              Best Price
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-2xl font-bold text-gray-900">
                            ₹{fare.totalPrice?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">per adult</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <FaSuitcase className="text-[#FD561E]" size={12} />
                            <span className="text-gray-600">{baggage.weight}{baggage.unit} checked</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FaChair className="text-[#FD561E]" size={12} />
                            <span className="text-gray-600">{fare.cabinClass || 'Economy'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {fare.refundable ? (
                              <>
                                <FaCheckCircle className="text-green-500" size={12} />
                                <span className="text-gray-600">Refundable</span>
                              </>
                            ) : (
                              <>
                                <FaTimesCircle className="text-red-400" size={12} />
                                <span className="text-gray-600">Non-refund</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FaUtensils className="text-[#FD561E]" size={12} />
                            <span className="text-gray-600">{fare.amenities?.meals ? 'Meal incl.' : 'No meal'}</span>
                          </div>
                        </div>

                        {fareBrand.features && fareBrand.features.length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="space-y-1.5">
                              {fareBrand.features.slice(0, 2).map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs">
                                  {getFeatureIcon(feature)}
                                  <span className="text-gray-500 truncate">{feature}</span>
                                </div>
                              ))}
                              {fareBrand.features.length > 2 && (
                                <div className="text-xs text-gray-400 mt-1">
                                  +{fareBrand.features.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="p-4 pt-0 flex gap-2">
                        <button
                          onClick={() => handleViewDetails(fare)}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                        >
                          <FaEye size={12} />
                          Details
                        </button>
                        <button
                          onClick={(e) => handleSelectFare(fare, e)}
                          disabled={isLoading}
                          className="flex-1 px-3 py-2 rounded-lg bg-[#FD561E] hover:bg-[#e04e1b] text-white text-sm font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          {isLoading ? (
                            <FaSpinner className="animate-spin" size={12} />
                          ) : (
                            <>
                              Select
                              <FaArrowRight size={10} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ============ PASSENGER INFO ============ */}
          {passengerCounts && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FaUserFriends className="text-[#FD561E]" />
                </div>
                <div>
                  <span className="text-xs text-gray-500">Passengers</span>
                  <p className="font-medium text-gray-800 text-sm">
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

      {/* ============ DETAILS MODAL ============ */}
      {showDetailsModal && selectedFareForDetails && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  {selectedFareForDetails.brand?.name || 'Economy'} Fare Details
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {flight.airline} {flight.flightNumber}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimesCircle className="text-gray-400" size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-700 mb-3 text-sm">Price Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base Fare</span>
                    <span className="text-gray-700">
                      ₹{(selectedFareForDetails.basePrice || Math.round(selectedFareForDetails.totalPrice * 0.85)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxes & Fees</span>
                    <span className="text-gray-700">₹{calculateTaxes(selectedFareForDetails).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-800">Total</span>
                      <span className="text-[#FD561E]">₹{selectedFareForDetails.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Features */}
              {selectedFareForDetails.brand?.features && selectedFareForDetails.brand.features.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-700 mb-3 text-sm">Included Features</h4>
                  <div className="space-y-2">
                    {selectedFareForDetails.brand.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <FaCheckCircle className="text-[#FD561E] mt-0.5 flex-shrink-0" size={14} />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Baggage Details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-700 mb-3 text-sm">Baggage Allowance</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Cabin Baggage</p>
                    <p className="font-medium text-gray-800">7 kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Checked Baggage</p>
                    <p className="font-medium text-gray-800">
                      {selectedFareForDetails.baggage?.weight || 15} kg
                    </p>
                  </div>
                </div>
              </div>

              {/* Policies */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-700 mb-3 text-sm">Cancellation & Changes</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cancellation Fee</p>
                    <p className="text-sm text-gray-700">
                      {selectedFareForDetails.penalties?.cancel?.amount 
                        ? `₹${selectedFareForDetails.penalties.cancel.amount.toLocaleString()}`
                        : selectedFareForDetails.penalties?.cancel?.percentage
                        ? `${selectedFareForDetails.penalties.cancel.percentage}% of fare`
                        : selectedFareForDetails.refundable 
                          ? 'Refundable with applicable fees'
                          : 'Non-refundable'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date Change Fee</p>
                    <p className="text-sm text-gray-700">
                      {selectedFareForDetails.penalties?.change?.amount 
                        ? `₹${selectedFareForDetails.penalties.change.amount.toLocaleString()} + fare difference`
                        : selectedFareForDetails.penalties?.change?.percentage
                        ? `${selectedFareForDetails.penalties.change.percentage}% of fare + fare difference`
                        : selectedFareForDetails.refundable
                        ? 'Changes allowed with applicable fees'
                        : 'Changes not allowed'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Select Button */}
              <button
                onClick={(e) => handleSelectFare(selectedFareForDetails, e)}
                disabled={loadingFareId === selectedFareForDetails.id}
                className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 rounded-xl transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {loadingFareId === selectedFareForDetails.id ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Select This Fare
                    <FaArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OneWaySheet;