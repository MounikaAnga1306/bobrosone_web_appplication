// src/modules/flights/components/sheet/OneWaySheet.jsx

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseSheet from './BaseSheet';
import { formatTime, formatDate, formatDuration } from '../../utils/formatters';
import toast from 'react-hot-toast';
import {
  FaPlane,
  FaClock,
  FaSuitcase,
  FaUserFriends,
  FaTag,
  FaUtensils,
  FaChair,
  FaWifi,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaStar,
  FaCrown,
  FaGem,
  FaClock as FaClockRegular,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

// ─── Helpers (defined OUTSIDE component so they never change reference) ───────

const getFareIcon = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  if (name.includes('business') || name.includes('stretch'))
    return <FaCrown className="text-[#FD561E]" size={18} />;
  if (name.includes('first')) return <FaGem className="text-[#FD561E]" size={18} />;
  if (name.includes('flex') || name.includes('plus'))
    return <FaStar className="text-[#FD561E]" size={18} />;
  return <FaTag className="text-[#FD561E]" size={18} />;
};

const getFeatureIcon = (featureName) => {
  const name = featureName?.toLowerCase() || '';
  if (name.includes('meal')) return <FaUtensils size={11} />;
  if (name.includes('seat')) return <FaChair size={11} />;
  if (name.includes('wifi')) return <FaWifi size={11} />;
  if (name.includes('priority')) return <FaClockRegular size={11} />;
  return <FaCheckCircle size={11} />;
};

const calculateTaxes = (fare) => {
  if (fare.taxes) {
    if (Array.isArray(fare.taxes)) return fare.taxes.reduce((s, t) => s + (t.amount || 0), 0);
    return fare.taxes.amount || 0;
  }
  return Math.round(fare.totalPrice * 0.15);
};

// ─── FareCard (defined OUTSIDE OneWaySheet) ───────────────────────────────────

const FareCard = ({ fare, index, loadingFareId, selectedFareId, onSelect }) => {
  const fareBrand = fare.brand || { name: 'Economy', features: [] };
  const baggage = fare.baggage || { weight: 15, unit: 'kg' };
  const taxes = calculateTaxes(fare);
  const basePrice = fare.basePrice || Math.round(fare.totalPrice * 0.85);
  const isLoading = loadingFareId === fare.id;
  const isLowest = index === 0;

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 flex flex-col
        ${selectedFareId === fare.id
          ? 'border-[#FD561E] shadow-sm'
          : 'border-gray-200 hover:border-[#FD561E] hover:shadow-sm'}
        ${isLoading ? 'opacity-70' : ''}`}
    >
      {/* Header */}
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

      {/* Details */}
      <div className="flex-1 p-4 space-y-4">
        {/* Price Breakdown */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Price Breakdown
          </h4>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base Fare</span>
              <span className="text-gray-700">₹{basePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxes & Fees</span>
              <span className="text-gray-700">₹{taxes.toLocaleString()}</span>
            </div>
            <div className="pt-1.5 border-t border-gray-200 flex justify-between font-semibold text-sm">
              <span className="text-gray-800">Total</span>
              <span className="text-[#FD561E]">₹{fare.totalPrice?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Baggage */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Baggage Allowance
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Cabin Baggage</p>
              <p className="font-medium text-gray-800 text-sm">7 kg</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Checked Baggage</p>
              <p className="font-medium text-gray-800 text-sm">
                {baggage.weight} {baggage.unit}
              </p>
            </div>
          </div>
        </div>

        {/* Amenities row */}
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
            <span className="text-gray-600">
              {fare.amenities?.meals ? 'Meal incl.' : 'No meal'}
            </span>
          </div>
        </div>

        {/* Features */}
        {fareBrand.features?.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Included Features
            </h4>
            <div className="space-y-1.5">
              {fareBrand.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <FaCheckCircle className="text-[#FD561E] mt-0.5 flex-shrink-0" size={12} />
                  <span className="text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policies */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Cancellation & Changes
          </h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Cancellation Fee</p>
              <p className="text-sm text-gray-700">
                {fare.penalties?.cancel?.amount
                  ? `₹${fare.penalties.cancel.amount.toLocaleString()}`
                  : fare.penalties?.cancel?.percentage
                  ? `${fare.penalties.cancel.percentage}% of fare`
                  : fare.refundable
                  ? 'Refundable with applicable fees'
                  : 'Non-refundable'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Date Change Fee</p>
              <p className="text-sm text-gray-700">
                {fare.penalties?.change?.amount
                  ? `₹${fare.penalties.change.amount.toLocaleString()} + fare difference`
                  : fare.penalties?.change?.percentage
                  ? `${fare.penalties.change.percentage}% of fare + fare difference`
                  : fare.refundable
                  ? 'Changes allowed with applicable fees'
                  : 'Changes not allowed'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Select Button */}
      <div className="p-4">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(fare);
          }}
          disabled={isLoading}
          className="w-full  cursor-pointer px-4 py-2.5 rounded-lg bg-[#FD561E] hover:bg-[#e04e1b] text-white text-sm font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" size={14} />
              Processing...
            </>
          ) : (
            <>
              Select This Fare
              <FaArrowRight size={12} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Main OneWaySheet ─────────────────────────────────────────────────────────

const OneWaySheet = ({ isOpen, onClose, flight, passengerCounts, airlineData, airlinesLoading }) => {
  const navigate = useNavigate();
  const [selectedFareId, setSelectedFareId] = useState(null);
  const [loadingFareId, setLoadingFareId] = useState(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const scrollContainerRef = useRef(null);

  if (!flight) return null;

  // Deduplicated fares
  const allFares = useMemo(() => {
    if (!flight.fares || flight.fares.length === 0) {
      return [
        {
          ...flight,
          id: flight.id,
          brand: flight.brand || { name: 'Economy', description: '' },
          totalPrice: flight.lowestPrice || flight.price || 0,
          baggage: flight.baggage || { weight: 15, unit: 'kg' },
        },
      ];
    }
    const fareMap = new Map();
    flight.fares.forEach((fare) => {
      const key = `${fare.brand?.name}-${fare.totalPrice}-${fare.baggage?.weight}`;
      if (!fareMap.has(key)) fareMap.set(key, fare);
    });
    return Array.from(fareMap.values()).sort((a, b) => a.totalPrice - b.totalPrice);
  }, [flight]);

  const needsHorizontalScroll = allFares.length > 3;

  // Scroll indicator
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current && needsHorizontalScroll) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollButtons(scrollLeft > 0 || scrollLeft + clientWidth < scrollWidth - 10);
      }
    };
    const el = scrollContainerRef.current;
    if (el && needsHorizontalScroll) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [needsHorizontalScroll]);

  // ✅ KEY FIX: handleSelectFare uses useCallback, no stopPropagation issues
  const handleSelectFare = useCallback(
    (fare) => {
      if (loadingFareId) return;

      setSelectedFareId(fare.id);
      setLoadingFareId(fare.id);

      // Small delay so user sees the loading state before sheet closes
      setTimeout(() => {
        setLoadingFareId(null);
        toast.success('Fare selected! Proceeding to booking...');
        onClose();
        navigate('/flights/booking/review', {
          state: {
            selectedOutboundFare: fare,
            outboundFlight: flight,
            passengerCounts,
            tripType: 'one-way',
            totalPrice: fare.totalPrice,
          },
        });
      }, 300);
    },
    [loadingFareId, onClose, navigate, flight, passengerCounts]
  );

  const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

  const isConnecting = flight.segments?.length > 1 || flight.stops > 0;
  const segments = flight.segments || [flight];

  return (
    <BaseSheet isOpen={isOpen} onClose={onClose} title="Select Your Fare">
      <div className="space-y-6 pb-6">

        {/* ── Flight Header ─────────────────────────────── */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                {airlinesLoading && !airlineData ? (
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                ) : airlineData?.logo_url ? (
                  <img
                    src={airlineData.logo_url}
                    alt={airlineData.name || flight.airline}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${flight.airlineCode}&background=FD561E&color=fff&size=32`;
                    }}
                  />
                ) : (
                  <span className="text-[#FD561E] font-bold text-xl">{flight.airlineCode}</span>
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{airlineData?.name || flight.airline}</div>
                <div className="text-gray-400 text-sm">{flight.flightNumber}</div>
              </div>
            </div>
            {isConnecting && (
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                Connecting Flight
              </div>
            )}
          </div>

          {/* Route */}
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-xl font-semibold text-gray-800">{formatTime(flight.departureTime)}</div>
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
                <div className="w-full h-px bg-gray-200" />
                <FaPlane className="absolute text-gray-400 rotate-90 bg-gray-50 px-1" size={12} />
              </div>
              <div className="text-gray-400 text-xs text-center mt-1">
                {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
              </div>
            </div>
            <div className="text-center flex-1">
              <div className="text-xl font-semibold text-gray-800">{formatTime(flight.arrivalTime)}</div>
              <div className="text-gray-500 text-sm mt-1">{flight.destination}</div>
              <div className="text-gray-400 text-xs mt-0.5">{formatDate(flight.arrivalTime)}</div>
              {flight.destinationTerminal && (
                <div className="text-gray-400 text-xs mt-1">Terminal {flight.destinationTerminal}</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Connecting Flight Details ──────────────────── */}
        {isConnecting && flight.layovers?.length > 0 && (
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
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
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
                      <span className="font-medium text-gray-600">
                        Layover at {flight.layovers[idx].airport}
                      </span>
                      <span className="text-gray-500 ml-2">{flight.layovers[idx].formattedDuration}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Fare Options ───────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-lg">Select Fare Type</h3>
            <div className="flex items-center gap-2">
              {needsHorizontalScroll && (
                <>
                  <button
                    type="button"
                    onClick={scrollLeft}
                    className={`p-1.5 rounded-full transition-all ${showScrollButtons ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'opacity-0 pointer-events-none'}`}
                  >
                    <FaChevronLeft size={14} />
                  </button>
                  <span className="text-xs text-gray-400 hidden sm:inline">{allFares.length} options</span>
                  <button
                    type="button"
                    onClick={scrollRight}
                    className={`p-1.5 rounded-full transition-all ${showScrollButtons ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'opacity-0 pointer-events-none'}`}
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

          {/* ── Layout based on fare count ── */}
          {needsHorizontalScroll ? (
            // 4+ fares → horizontal scroll, cards fill sheet width properly
            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-auto pb-3 scroll-smooth"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {allFares.map((fare, index) => (
                  <div
                    key={fare.id || index}
                    className="flex-shrink-0"
                    style={{ width: 'calc(90% - 12px)', maxWidth: '320px', minWidth: '260px' }}
                  >
                    <FareCard
                      fare={fare}
                      index={index}
                      loadingFareId={loadingFareId}
                      selectedFareId={selectedFareId}
                      onSelect={handleSelectFare}
                    />
                  </div>
                ))}
              </div>
              {/* Swipe indicator — centered */}
              <div className="flex justify-center items-center gap-1.5 mt-3">
                {allFares.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all ${i === 0 ? 'w-4 h-1.5 bg-[#FD561E]' : 'w-1.5 h-1.5 bg-gray-300'}`}
                  />
                ))}
                <span className="text-[10px] text-gray-400 ml-2">Swipe to see more</span>
              </div>
            </div>
          ) : allFares.length === 1 ? (
            // 1 fare → centered, max width
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <FareCard
                  fare={allFares[0]}
                  index={0}
                  loadingFareId={loadingFareId}
                  selectedFareId={selectedFareId}
                  onSelect={handleSelectFare}
                />
              </div>
            </div>
          ) : allFares.length === 2 ? (
            // 2 fares → side by side on tablet+, stacked on mobile
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allFares.map((fare, index) => (
                <FareCard
                  key={fare.id || index}
                  fare={fare}
                  index={index}
                  loadingFareId={loadingFareId}
                  selectedFareId={selectedFareId}
                  onSelect={handleSelectFare}
                />
              ))}
            </div>
          ) : (
            // 3 fares → 3 col on laptop, 2 on tablet, 1 on mobile
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allFares.map((fare, index) => (
                <FareCard
                  key={fare.id || index}
                  fare={fare}
                  index={index}
                  loadingFareId={loadingFareId}
                  selectedFareId={selectedFareId}
                  onSelect={handleSelectFare}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Passenger Info ─────────────────────────────── */}
        {passengerCounts && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaUserFriends className="text-[#FD561E]" />
              </div>
              <div>
                <span className="text-xs text-gray-500">Passengers</span>
                <p className="font-medium text-gray-800 text-sm">
                  {passengerCounts.ADT > 0 &&
                    `${passengerCounts.ADT} Adult${passengerCounts.ADT > 1 ? 's' : ''}`}
                  {passengerCounts.CNN > 0 &&
                    `, ${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`}
                  {passengerCounts.INF > 0 &&
                    `, ${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`}
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