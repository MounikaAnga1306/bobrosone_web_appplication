// src/modules/flights/components/sheet/OneWaySheet.jsx
//
// DATA CONTRACT — flight object comes from lowFareTransformer resolveOffering()
//
// flight = {
//   offeringId, optionIndex, sequence,
//   from, to,
//   departureTime "HH:MM", arrivalTime "HH:MM",
//   departureDate "YYYY-MM-DD", arrivalDate "YYYY-MM-DD",
//   departureDateFormatted "04 Oct 2026", arrivalDateFormatted,
//   totalDuration "6h 0m", totalDurationRaw,
//   stops 0|1|2,
//   connectingAirports ["DEL"],
//   connections [{ airport, connectionDuration }],
//   segments [{
//     carrier, number, flightCode, equipment, duration, durationRaw,
//     from: { airport, date, dateFormatted, time, terminal },
//     to:   { airport, date, dateFormatted, time, terminal }
//   }],
//   brandOptions [{
//     brandRef, brandName, brandCode, tier,
//     cabin, classOfService, fareBasisCode, fareType,
//     seatsLeft,
//     combinabilityCode, combinabilityCodes,
//     price: { currency, base, totalTaxes, totalFees, totalPrice, breakdown[] }
//     brandAttributes: { rebooking, refund, meals, seatAssignment, checkedBag, upgrade }
//     baggage: {
//       ADT: { checked: { weight, unit }, carryOn: { weight, unit } },
//       INF: { checked, carryOn },
//       CNN: { checked, carryOn }
//     }
//     penalties: {
//       change: { allowed, amount, currency, appliesTo, types[] },
//       cancel: { allowed, amount, currency, appliesTo, types[] }
//     }
//     validatingAirline, paymentTimeLimit,
//     passengerFareInfo: [{ passengerType, cabin, classOfService, fareBasisCode, ticketDesignator }]
//   }],
//   cheapestPrice, cheapestBrand, currency
// }

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseSheet from './BaseSheet';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';
import {
  FaPlane, FaClock, FaSuitcase, FaUserFriends,
  FaInfoCircle, FaShieldAlt, FaUtensils, FaChair,
  FaCheckCircle, FaTimesCircle, FaArrowRight, FaStar,
  FaCrown, FaGem, FaTag, FaChevronLeft, FaChevronRight,
  FaCheck, FaExclamationCircle, FaCalendarCheck,
  FaBriefcase, FaSpinner
} from 'react-icons/fa';

// ── Helpers ──────────────────────────────────────────────────────

const TIER_ICON = (tier) => {
  if (tier >= 6) return <FaGem    className="text-purple-500" size={14} />;
  if (tier >= 5) return <FaCrown  className="text-yellow-500" size={14} />;
  if (tier >= 4) return <FaStar   className="text-blue-500"   size={14} />;
  return              <FaTag    className="text-[#FD561E]"  size={14} />;
};

const INCLUSION_STYLE = {
  'Included':    { color: 'text-green-600',  bg: 'bg-green-50',  icon: <FaCheck         size={9} className="text-green-600"  /> },
  'Chargeable':  { color: 'text-orange-500', bg: 'bg-orange-50', icon: <FaExclamationCircle size={9} className="text-orange-500" /> },
  'Not Offered': { color: 'text-gray-400',   bg: 'bg-gray-50',   icon: <FaTimesCircle   size={9} className="text-gray-400"   /> },
};

const InclusionChip = ({ label, value }) => {
  const style = INCLUSION_STYLE[value] || INCLUSION_STYLE['Not Offered'];
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${style.bg}`}>
      {style.icon}
      <span className={`text-xs font-medium ${style.color}`}>{label}</span>
    </div>
  );
};

const BaggageRow = ({ paxLabel, checked, carryOn }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-500 w-16">{paxLabel}</span>
    <div className="flex gap-4">
      <div className="text-center">
        <div className="text-xs font-medium text-gray-700">
          {checked?.weight != null ? `${checked.weight} kg` : '—'}
        </div>
        <div className="text-[10px] text-gray-400">Check-in</div>
      </div>
      <div className="text-center">
        <div className="text-xs font-medium text-gray-700">
          {carryOn?.weight != null ? `${carryOn.weight} kg` : '—'}
        </div>
        <div className="text-[10px] text-gray-400">Carry-on</div>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────

const OneWaySheet = ({ isOpen, onClose, flight, passengerCounts }) => {
  const navigate = useNavigate();
  const { setSelectedOutbound } = useStore();

  const [selectedBrandIndex, setSelectedBrandIndex] = useState(0);
  const [activeTab, setActiveTab]                   = useState('overview');
  const [showDetailsModal, setShowDetailsModal]     = useState(false);
  const [detailBrandIndex, setDetailBrandIndex]     = useState(0);
  const [isBooking, setIsBooking]                   = useState(false);

  const brandScrollRef = useRef(null);

  if (!flight) return null;

  const brandOptions  = flight.brandOptions || [];
  const activeBrand   = brandOptions[selectedBrandIndex];
  const detailBrand   = brandOptions[detailBrandIndex];
  const isConnecting  = flight.stops > 0;
  const firstSegment  = flight.segments?.[0];
  const carrierCode   = firstSegment?.carrier ?? '';

  // Reset to first brand when flight changes
  useEffect(() => {
    setSelectedBrandIndex(0);
    setActiveTab('overview');
  }, [flight?.offeringId]);

  // ── Brand tab scroll helper ───────────────────────────────────
  const scrollBrands = (dir) => {
    if (brandScrollRef.current) {
      brandScrollRef.current.scrollBy({ left: dir * 180, behavior: 'smooth' });
    }
  };

  // ── Select + navigate ─────────────────────────────────────────
  const handleSelectBrand = async (brand) => {
    if (isBooking) return;
    setIsBooking(true);

    try {
      // Save selected flight + brand to store (needed by booking page)
      setSelectedOutbound({
        offeringId:         flight.offeringId,
        flightRefs:         flight.flightRefs,
        segments:           flight.segments,
        totalDuration:      flight.totalDuration,
        stops:              flight.stops,
        connectingAirports: flight.connectingAirports,
        connections:        flight.connections,
        from:               flight.from,
        to:                 flight.to,
        departureTime:      flight.departureTime,
        arrivalTime:        flight.arrivalTime,
        departureDate:      flight.departureDate,
        departureDateFormatted: flight.departureDateFormatted,
        selectedBrand:      brand,
      });

      toast.success('Fare selected! Proceeding to booking...');
      onClose();

      navigate('/flights/booking/review', {
        state: {
          selectedOutbound: {
            ...flight,
            selectedBrand: brand,
          },
          passengerCounts,
          tripType:   'one-way',
          totalPrice: brand.price.totalPrice,
        },
      });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  // ── passengerText ─────────────────────────────────────────────
  const passengerText = [
    passengerCounts?.ADT > 0 && `${passengerCounts.ADT} Adult${passengerCounts.ADT > 1 ? 's' : ''}`,
    passengerCounts?.CNN > 0 && `${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`,
    passengerCounts?.INF > 0 && `${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`,
  ].filter(Boolean).join(' · ');

  if (!activeBrand) return null;

  return (
    <>
      <BaseSheet isOpen={isOpen} onClose={onClose} title="Select Your Fare">
        <div className="space-y-5 pb-8">

          {/* ── FLIGHT HEADER ───────────────────────────────── */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            {/* Airline row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                  <img
                    src={`/airlines/${carrierCode.toLowerCase()}.png`}
                    alt={carrierCode}
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${carrierCode}&background=FD561E&color=fff&size=28`;
                    }}
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">
                    {flight.segments.map(s => s.flightCode).join(' + ')}
                  </div>
                  <div className="text-xs text-gray-400">{activeBrand.validatingAirline || carrierCode}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isConnecting && (
                  <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full font-medium">
                    {flight.stops} Stop{flight.stops > 1 ? 's' : ''}
                  </span>
                )}
                {!isConnecting && (
                  <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full font-medium">
                    Direct
                  </span>
                )}
                {activeBrand.seatsLeft != null && activeBrand.seatsLeft <= 6 && (
                  <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2.5 py-1 rounded-full font-medium">
                    {activeBrand.seatsLeft} seats left
                  </span>
                )}
              </div>
            </div>

            {/* Route timeline */}
            <div className="flex items-center justify-between">
              {/* Departure */}
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-gray-900">{flight.departureTime}</div>
                <div className="text-sm font-semibold text-gray-700 mt-0.5">{flight.from}</div>
                <div className="text-xs text-gray-400">{flight.departureDateFormatted}</div>
                {firstSegment?.from?.terminal && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    Terminal {firstSegment.from.terminal}
                  </div>
                )}
              </div>

              {/* Duration line */}
              <div className="flex-1 px-4">
                <div className="text-xs text-gray-400 text-center mb-1.5 flex items-center justify-center gap-1">
                  <FaClock size={10} /> {flight.totalDuration}
                </div>
                <div className="relative flex items-center">
                  <div className="w-full h-px bg-gray-200" />
                  <FaPlane className="absolute left-1/2 -translate-x-1/2 text-[#FD561E] bg-gray-50 rotate-90" size={13} />
                </div>
                {flight.connectingAirports?.length > 0 && (
                  <div className="text-[10px] text-orange-500 text-center mt-1.5">
                    via {flight.connectingAirports.join(' · ')}
                  </div>
                )}
              </div>

              {/* Arrival */}
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-gray-900">{flight.arrivalTime}</div>
                <div className="text-sm font-semibold text-gray-700 mt-0.5">{flight.to}</div>
                <div className="text-xs text-gray-400">{flight.arrivalDateFormatted}</div>
                {flight.segments[flight.segments.length - 1]?.to?.terminal && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    Terminal {flight.segments[flight.segments.length - 1].to.terminal}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── SEGMENT DETAIL (connecting flights) ─────────── */}
          {isConnecting && (
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <FaPlane className="text-[#FD561E]" size={11} />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Flight Segments
                </span>
              </div>

              {flight.segments.map((seg, idx) => (
                <div key={seg.flightCode + idx}>
                  <div className="px-4 py-4 bg-white">
                    <div className="flex items-start gap-3">
                      {/* Segment timeline dot */}
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FD561E]" />
                        {idx < flight.segments.length - 1 && (
                          <div className="w-px h-12 bg-gray-200 my-1" />
                        )}
                      </div>

                      <div className="flex-1">
                        {/* Segment header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-700">{seg.flightCode}</span>
                            <span className="text-xs text-gray-400">{seg.equipment}</span>
                          </div>
                          <span className="text-xs text-gray-400">{seg.duration}</span>
                        </div>

                        {/* From → To */}
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-base font-bold text-gray-800">{seg.from.time}</div>
                            <div className="text-xs font-medium text-gray-600">{seg.from.airport}</div>
                            {seg.from.terminal && (
                              <div className="text-[10px] text-gray-400">T{seg.from.terminal}</div>
                            )}
                          </div>
                          <FaArrowRight size={11} className="text-gray-300 flex-shrink-0" />
                          <div>
                            <div className="text-base font-bold text-gray-800">{seg.to.time}</div>
                            <div className="text-xs font-medium text-gray-600">{seg.to.airport}</div>
                            {seg.to.terminal && (
                              <div className="text-[10px] text-gray-400">T{seg.to.terminal}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Layover bar between segments */}
                  {idx < flight.segments.length - 1 && flight.connections?.[idx] && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 border-y border-orange-100">
                      <FaClock size={11} className="text-orange-400 flex-shrink-0" />
                      <span className="text-xs text-orange-700 font-medium">
                        {flight.connections[idx].connectionDuration} layover at{' '}
                        {flight.connections[idx].airport}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── BRAND SELECTOR ──────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">
                Select Fare · <span className="text-[#FD561E]">{brandOptions.length} options</span>
              </h3>
              {brandOptions.length > 3 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => scrollBrands(-1)} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <FaChevronLeft size={11} className="text-gray-600" />
                  </button>
                  <button onClick={() => scrollBrands(1)} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <FaChevronRight size={11} className="text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Brand pills for quick switch */}
            <div
              ref={brandScrollRef}
              className="flex gap-2 overflow-x-auto pb-2 scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              {brandOptions.map((brand, idx) => {
                const isActive = selectedBrandIndex === idx;
                const isCheapest = brand.price.totalPrice === Math.min(...brandOptions.map(b => b.price.totalPrice));
                return (
                  <button
                    key={`${brand.brandRef}-${idx}`}
                    onClick={() => setSelectedBrandIndex(idx)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl border transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-[#FD561E] border-[#FD561E] text-white shadow-md shadow-orange-100'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-[#FD561E] hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}>
                        {brand.brandName}
                      </span>
                      {isCheapest && (
                        <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-[#FD561E] text-white'}`}>
                          BEST
                        </span>
                      )}
                    </div>
                    <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-[#FD561E]'}`}>
                      ₹{brand.price.totalPrice.toLocaleString('en-IN')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── ACTIVE BRAND DETAIL CARD ─────────────────────── */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

            {/* Brand header */}
            <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {TIER_ICON(activeBrand.tier)}
                <div>
                  <div className="font-semibold text-gray-800">{activeBrand.brandName}</div>
                  <div className="text-xs text-gray-400">{activeBrand.cabin} · Class {activeBrand.classOfService}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  ₹{activeBrand.price.totalPrice.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-gray-400">all passengers</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-white">
              {[
                { id: 'overview',  label: 'Overview'  },
                { id: 'price',     label: 'Fare Split' },
                { id: 'baggage',   label: 'Baggage'   },
                { id: 'policies',  label: 'Policies'  },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'text-[#FD561E] border-[#FD561E]'
                      : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 bg-white">

              {/* ── OVERVIEW TAB ──────────────────────────── */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Inclusion grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Seat Selection', key: 'seatAssignment' },
                      { label: 'Checked Bag',    key: 'checkedBag'     },
                      { label: 'Rebooking',       key: 'rebooking'      },
                      { label: 'Refund',          key: 'refund'         },
                      { label: 'Meals',           key: 'meals'          },
                      { label: 'Upgrade',         key: 'upgrade'        },
                    ].map(({ label, key }) => (
                      <InclusionChip key={key} label={label} value={activeBrand.brandAttributes?.[key]} />
                    ))}
                  </div>

                  {/* Quick baggage summary */}
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FaBriefcase className="text-gray-400" size={13} />
                      <div>
                        <div className="text-xs text-gray-500">Carry-on</div>
                        <div className="text-xs font-semibold text-gray-700">
                          {activeBrand.baggage?.ADT?.carryOn?.weight != null
                            ? `${activeBrand.baggage.ADT.carryOn.weight} kg`
                            : '—'}
                        </div>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex items-center gap-2">
                      <FaSuitcase className="text-gray-400" size={13} />
                      <div>
                        <div className="text-xs text-gray-500">Check-in</div>
                        <div className="text-xs font-semibold text-gray-700">
                          {activeBrand.baggage?.ADT?.checked?.weight != null
                            ? `${activeBrand.baggage.ADT.checked.weight} kg`
                            : '—'}
                        </div>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex items-center gap-2">
                      <FaChair className="text-gray-400" size={13} />
                      <div>
                        <div className="text-xs text-gray-500">Cabin</div>
                        <div className="text-xs font-semibold text-gray-700">{activeBrand.cabin}</div>
                      </div>
                    </div>
                  </div>

                  {/* Fare basis */}
                  <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                    <span>Fare basis: <span className="text-gray-600 font-mono">{activeBrand.fareBasisCode}</span></span>
                    <span>{activeBrand.fareType}</span>
                  </div>
                </div>
              )}

              {/* ── FARE SPLIT TAB ────────────────────────── */}
              {activeTab === 'price' && (
                <div className="space-y-3">
                  {activeBrand.price.breakdown.map((b) => (
                    <div key={b.passengerType} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase">
                          {b.passengerType === 'ADT' ? 'Adult' : b.passengerType === 'CNN' ? 'Child' : 'Infant'}
                          {' '}×{b.quantity}
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          ₹{b.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Base fare</span>
                          <span>₹{b.base.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Taxes</span>
                          <span>₹{b.taxes.toLocaleString('en-IN')}</span>
                        </div>
                        {b.fees > 0 && (
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Fees</span>
                            <span>₹{b.fees.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Grand total */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 px-1">
                    <span className="font-semibold text-gray-800">Total ({activeBrand.price.currency})</span>
                    <span className="text-lg font-bold text-[#FD561E]">
                      ₹{activeBrand.price.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Meta info */}
                  <div className="space-y-1 px-1">
                    {activeBrand.validatingAirline && (
                      <p className="text-xs text-gray-400">
                        Validating airline:{' '}
                        <span className="text-gray-600 font-medium">{activeBrand.validatingAirline}</span>
                      </p>
                    )}
                    {activeBrand.paymentTimeLimit && (
                      <p className="text-xs text-gray-400">
                        Pay by:{' '}
                        <span className="text-red-500 font-medium">
                          {new Date(activeBrand.paymentTimeLimit).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                    <FaInfoCircle size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500">
                      All taxes and fees are included. Final amount confirmed at booking.
                    </p>
                  </div>
                </div>
              )}

              {/* ── BAGGAGE TAB ───────────────────────────── */}
              {activeTab === 'baggage' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      <span>Passenger</span>
                      <div className="flex gap-8">
                        <span>Check-in</span>
                        <span>Carry-on</span>
                      </div>
                    </div>
                    <div className="px-4">
                      <BaggageRow
                        paxLabel="Adult"
                        checked={activeBrand.baggage?.ADT?.checked}
                        carryOn={activeBrand.baggage?.ADT?.carryOn}
                      />
                      {passengerCounts?.CNN > 0 && (
                        <BaggageRow
                          paxLabel="Child"
                          checked={activeBrand.baggage?.CNN?.checked}
                          carryOn={activeBrand.baggage?.CNN?.carryOn}
                        />
                      )}
                      {passengerCounts?.INF > 0 && (
                        <BaggageRow
                          paxLabel="Infant"
                          checked={activeBrand.baggage?.INF?.checked}
                          carryOn={activeBrand.baggage?.INF?.carryOn}
                        />
                      )}
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-3 flex items-start gap-2">
                    <FaInfoCircle size={12} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500">
                      Extra baggage charges may apply if allowance is exceeded.
                    </p>
                  </div>
                </div>
              )}

              {/* ── POLICIES TAB ──────────────────────────── */}
              {activeTab === 'policies' && (
                <div className="space-y-3">

                  {/* Cancellation */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaTimesCircle className="text-gray-400" size={13} />
                      <span className="text-sm font-medium text-gray-700">Cancellation</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {activeBrand.penalties?.cancel?.amount != null
                        ? `₹${activeBrand.penalties.cancel.amount.toLocaleString('en-IN')} per ticket`
                        : 'Non-refundable'}
                    </div>
                    {activeBrand.penalties?.cancel?.types?.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {activeBrand.penalties.cancel.types.join(' · ')}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">
                      {activeBrand.brandAttributes?.refund === 'Included'
                        ? '✓ Refundable'
                        : activeBrand.brandAttributes?.refund === 'Chargeable'
                        ? 'Refund with fee'
                        : 'Non-refundable'}
                    </div>
                  </div>

                  {/* Date Change */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCalendarCheck className="text-gray-400" size={13} />
                      <span className="text-sm font-medium text-gray-700">Date Change</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {activeBrand.penalties?.change?.amount != null
                        ? `₹${activeBrand.penalties.change.amount.toLocaleString('en-IN')} per ticket + fare difference`
                        : 'Changes not permitted'}
                    </div>
                    {activeBrand.penalties?.change?.types?.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {activeBrand.penalties.change.types.join(' · ')}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">
                      {activeBrand.brandAttributes?.rebooking === 'Included'
                        ? '✓ Free rebooking'
                        : activeBrand.brandAttributes?.rebooking === 'Chargeable'
                        ? 'Rebooking with fee'
                        : 'Rebooking not allowed'}
                    </div>
                  </div>

                  {/* Seat */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaChair className="text-gray-400" size={13} />
                      <span className="text-sm font-medium text-gray-700">Seat Assignment</span>
                    </div>
                    <InclusionChip label={activeBrand.brandAttributes?.seatAssignment || '—'} value={activeBrand.brandAttributes?.seatAssignment} />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                    <FaInfoCircle size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500">
                      Policies apply per passenger per ticket. Infant policies may differ.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── PASSENGER SUMMARY ───────────────────────────── */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <FaUserFriends className="text-[#FD561E]" size={16} />
            <div>
              <div className="text-xs text-gray-400">Passengers</div>
              <div className="text-sm font-medium text-gray-700">{passengerText}</div>
            </div>
          </div>

          {/* ── BOOK BUTTON ─────────────────────────────────── */}
          <button
            onClick={() => handleSelectBrand(activeBrand)}
            disabled={isBooking}
            className="w-full py-4 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-orange-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isBooking ? (
              <>
                <FaSpinner className="animate-spin" size={16} />
                Processing...
              </>
            ) : (
              <>
                Book · ₹{activeBrand.price.totalPrice.toLocaleString('en-IN')}
                <FaArrowRight size={14} />
              </>
            )}
          </button>

          {/* Compare note */}
          {brandOptions.length > 1 && (
            <p className="text-xs text-center text-gray-400">
              Tap a fare above to compare options before booking
            </p>
          )}
        </div>
      </BaseSheet>
    </>
  );
};

export default OneWaySheet;