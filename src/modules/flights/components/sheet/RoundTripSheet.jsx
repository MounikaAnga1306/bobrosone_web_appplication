// src/modules/flights/components/sheet/RoundTripSheet.jsx
//
// DATA CONTRACT — outboundFlight and returnFlight both come from
// lowFareTransformer resolveOffering() — same shape as OneWaySheet flight prop.
// See OneWaySheet.jsx DATA CONTRACT comment for full field list.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseSheet from './BaseSheet';
import React, { useState, useMemo, useEffect } from 'react';
import { fetchAirlines } from '../../services/airlineService';
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
import useStore from '../../store/useStore';
import {
  FaPlane, FaClock, FaSuitcase, FaUserFriends,
  FaInfoCircle, FaChair,
  FaCheckCircle, FaTimesCircle, FaArrowRight, FaStar,
  FaCrown, FaGem, FaTag, FaCheck, FaExclamationCircle, FaCalendarCheck,
  FaBriefcase, FaSpinner, FaExclamationTriangle,
} from 'react-icons/fa';

// ── Helpers ───────────────────────────────────────────────────────

const TIER_ICON = (tier) => {
  if (tier >= 6) return <FaGem    className="text-purple-400" size={13} />;
  if (tier >= 5) return <FaCrown  className="text-yellow-400" size={13} />;
  if (tier >= 4) return <FaStar   className="text-blue-400"   size={13} />;
  return              <FaTag    className="text-gray-400"   size={13} />;
};

const INCLUSION_STYLE = {
  'Included':    { color: 'text-green-600',  bg: 'bg-green-50',  icon: <FaCheck            size={9} className="text-green-600"  /> },
  'Chargeable':  { color: 'text-orange-500', bg: 'bg-orange-50', icon: <FaExclamationCircle size={9} className="text-orange-500" /> },
  'Not Offered': { color: 'text-gray-400',   bg: 'bg-gray-50',   icon: <FaTimesCircle      size={9} className="text-gray-400"   /> },
};

const InclusionChip = ({ label, value }) => {
  const s = INCLUSION_STYLE[value] || INCLUSION_STYLE['Not Offered'];
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${s.bg}`}>
      {s.icon}
      <span className={`text-xs font-medium ${s.color}`}>{label}</span>
    </div>
  );
};

const BaggageRow = ({ paxLabel, checked, carryOn }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-500 w-16">{paxLabel}</span>
    <div className="flex gap-6">
      <div className="text-center">
        <div className="text-xs font-medium text-gray-700">{checked?.weight != null ? `${checked.weight}kg` : '—'}</div>
        <div className="text-[10px] text-gray-400">Check-in</div>
      </div>
      <div className="text-center">
        <div className="text-xs font-medium text-gray-700">{carryOn?.weight != null ? `${carryOn.weight}kg` : '—'}</div>
        <div className="text-[10px] text-gray-400">Carry-on</div>
      </div>
    </div>
  </div>
);

// ── FlightSummaryStrip ────────────────────────────────────────────
const FlightSummaryStrip = ({ flight, brand, legLabel, color }) => {
  const firstSeg = flight.segments?.[0];

  return (
    <div className={`rounded-2xl p-4 border ${color === 'blue' ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaPlane className={`${color === 'blue' ? 'text-blue-500 rotate-45' : 'text-green-500 -rotate-45'}`} size={13} />
          <span className={`text-xs font-bold uppercase tracking-wide ${color === 'blue' ? 'text-blue-700' : 'text-green-700'}`}>
            {legLabel}
          </span>
        </div>
        <div>
          {flight.stops === 0
            ? <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">Direct</span>
            : <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-medium">{flight.stops} Stop{flight.stops > 1 ? 's' : ''}</span>
          }
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="text-xl font-bold text-gray-900">{flight.departureTime}</div>
          <div className="text-sm font-semibold text-gray-700">{flight.from}</div>
          <div className="text-xs text-gray-400">{flight.departureDateFormatted}</div>
          {firstSeg?.from?.terminal && <div className="text-xs text-gray-400">T{firstSeg.from.terminal}</div>}
        </div>
        <div className="flex-1 px-3">
          <div className="text-xs text-gray-400 text-center mb-1.5 flex items-center justify-center gap-1">
            <FaClock size={10} /> {flight.totalDuration}
          </div>
          <div className="relative flex items-center">
            <div className="w-full h-px bg-gray-300" />
            <FaPlane className={`absolute left-1/2 -translate-x-1/2 -translate-y-3 ${color === 'blue' ? 'text-blue-400' : 'text-green-400'} rotate-90`} size={12} />
          </div>
          {flight.connectingAirports?.length > 0 && (
            <div className="text-[10px] text-amber-500 text-center mt-1.5">via {flight.connectingAirports.join(' · ')}</div>
          )}
        </div>
        <div className="text-center flex-1">
          <div className="text-xl font-bold text-gray-900">{flight.arrivalTime}</div>
          <div className="text-sm font-semibold text-gray-700">{flight.to}</div>
          <div className="text-xs text-gray-400">{flight.arrivalDateFormatted}</div>
          {flight.segments[flight.segments.length - 1]?.to?.terminal && (
            <div className="text-xs text-gray-400">T{flight.segments[flight.segments.length - 1].to.terminal}</div>
          )}
        </div>
      </div>

      {brand && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {TIER_ICON(brand.tier)}
            <span className="text-xs font-medium text-gray-600">{brand.brandName}</span>
            <span className="text-xs text-gray-400">· {brand.cabin}</span>
          </div>
          <span className="text-sm font-bold text-[#FD561E]">₹{brand.price.totalPrice.toLocaleString('en-IN')}</span>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────

const RoundTripSheet = ({ isOpen, onClose, outboundFlight, returnFlight, passengerCounts }) => {
  const navigate = useNavigate();
  const { setSelectedOutbound, setSelectedInbound } = useStore();

  const [outboundBrandIdx, setOutboundBrandIdx] = useState(0);
  const [inboundBrandIdx,  setInboundBrandIdx]  = useState(0);
  const [activeTab, setActiveTab]               = useState('summary');
  const [isBooking, setIsBooking]               = useState(false);

  // Reset indices when flights change
  useEffect(() => {
    setOutboundBrandIdx(0);
    setInboundBrandIdx(0);
    setActiveTab('summary');
  }, [outboundFlight?.offeringId, returnFlight?.offeringId]);

  if (!outboundFlight || !returnFlight) return null;

  const outbrandOptions = outboundFlight.brandOptions || [];
  const inbrandOptions  = returnFlight.brandOptions   || [];

  const activOutBrand = outbrandOptions[outboundBrandIdx] ?? outbrandOptions[0];
  const activInBrand  = inbrandOptions[inboundBrandIdx]   ?? inbrandOptions[0];

  const totalPrice = (activOutBrand?.price?.totalPrice || 0) + (activInBrand?.price?.totalPrice || 0);

  const passengerText = [
    passengerCounts?.ADT > 0 && `${passengerCounts.ADT} Adult${passengerCounts.ADT > 1 ? 's' : ''}`,
    passengerCounts?.CNN > 0 && `${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`,
    passengerCounts?.INF > 0 && `${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`,
  ].filter(Boolean).join(' · ');

  // ── Brand selector panel ──────────────────────────────────────
  const BrandSelector = ({ options, activeIdx, setIdx, label, color }) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label} Fare</p>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {options.map((brand, idx) => {
          const isActive = activeIdx === idx;
          const isCheap  = brand.price.totalPrice === Math.min(...options.map((b) => b.price.totalPrice));
          return (
            <button
              key={`${brand.brandRef}-${idx}`}
              onClick={() => setIdx(idx)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl border transition-all text-left ${
                isActive
                  ? 'bg-[#FD561E] border-[#FD561E] text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs font-semibold">{brand.brandName}</span>
                {isCheap && (
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
  );

  // ── Brand detail panel ────────────────────────────────────────
  const BrandDetail = ({ brand, flight, passengerCounts: pc }) => {
    const [tab, setTab] = useState('overview');
    if (!brand) return null;

    return (
      <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm mt-3">
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {TIER_ICON(brand.tier)}
            <div>
              <div className="font-semibold text-gray-800 text-sm">{brand.brandName}</div>
              <div className="text-xs text-gray-400">{brand.cabin} · Class {brand.classOfService}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-gray-900">₹{brand.price.totalPrice.toLocaleString('en-IN')}</div>
            <div className="text-xs text-gray-400">this leg</div>
          </div>
        </div>

        <div className="flex border-b border-gray-100 bg-white">
          {['overview', 'price', 'baggage', 'policies'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-medium capitalize transition-colors border-b-2 ${
                tab === t ? 'text-[#FD561E] border-[#FD561E]' : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-3 bg-white">
          {tab === 'overview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Seat',    key: 'seatAssignment' },
                  { label: 'Bag',     key: 'checkedBag'     },
                  { label: 'Rebook',  key: 'rebooking'      },
                  { label: 'Refund',  key: 'refund'         },
                  { label: 'Meals',   key: 'meals'          },
                  { label: 'Upgrade', key: 'upgrade'        },
                ].map(({ label, key }) => (
                  <InclusionChip key={key} label={label} value={brand.brandAttributes?.[key]} />
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <FaBriefcase className="text-gray-400" size={12} />
                  <div>
                    <div className="text-[10px] text-gray-400">Carry-on</div>
                    <div className="text-xs font-semibold text-gray-700">
                      {brand.baggage?.ADT?.carryOn?.weight != null ? `${brand.baggage.ADT.carryOn.weight}kg` : '—'}
                    </div>
                  </div>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <FaSuitcase className="text-gray-400" size={12} />
                  <div>
                    <div className="text-[10px] text-gray-400">Check-in</div>
                    <div className="text-xs font-semibold text-gray-700">
                      {brand.baggage?.ADT?.checked?.weight != null ? `${brand.baggage.ADT.checked.weight}kg` : '—'}
                    </div>
                  </div>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <FaChair className="text-gray-400" size={12} />
                  <div>
                    <div className="text-[10px] text-gray-400">Cabin</div>
                    <div className="text-xs font-semibold text-gray-700">{brand.cabin}</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 px-1">
                Fare basis: <span className="font-mono text-gray-600">{brand.fareBasisCode}</span>
                {brand.fareType ? <>{' · '}{brand.fareType}</> : null}
              </div>
            </div>
          )}

          {tab === 'price' && (
            <div className="space-y-2">
              {(brand.price.breakdown || []).map((b) => (
                <div key={b.passengerType} className="bg-gray-50 rounded-xl p-2.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-600 uppercase">
                      {b.passengerType === 'ADT' ? 'Adult' : b.passengerType === 'CNN' ? 'Child' : 'Infant'} ×{b.quantity}
                    </span>
                    <span className="text-xs font-bold text-gray-800">₹{b.total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Base</span><span>₹{b.base.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Tax</span><span>₹{b.taxes.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-100 px-1">
                <span className="text-sm font-semibold text-gray-800">Leg Total</span>
                <span className="text-sm font-bold text-[#FD561E]">₹{brand.price.totalPrice.toLocaleString('en-IN')}</span>
              </div>
              {brand.paymentTimeLimit && (
                <p className="text-xs text-gray-400 px-1">
                  Pay by: <span className="text-red-500 font-medium">
                    {new Date(brand.paymentTimeLimit).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </p>
              )}
            </div>
          )}

          {tab === 'baggage' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex justify-between px-3 py-1.5 bg-gray-50 text-[10px] text-gray-400 font-semibold uppercase">
                  <span>Passenger</span>
                  <div className="flex gap-6"><span>Check-in</span><span>Carry-on</span></div>
                </div>
                <div className="px-3">
                  <BaggageRow paxLabel="Adult"  checked={brand.baggage?.ADT?.checked} carryOn={brand.baggage?.ADT?.carryOn} />
                  {pc?.CNN > 0 && <BaggageRow paxLabel="Child"  checked={brand.baggage?.CNN?.checked} carryOn={brand.baggage?.CNN?.carryOn} />}
                  {pc?.INF > 0 && <BaggageRow paxLabel="Infant" checked={brand.baggage?.INF?.checked} carryOn={brand.baggage?.INF?.carryOn} />}
                </div>
              </div>
            </div>
          )}

          {tab === 'policies' && (
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <FaTimesCircle className="text-gray-400" size={12} />
                  <span className="text-xs font-medium text-gray-700">Cancellation</span>
                </div>
                <p className="text-xs text-gray-600">
                  {brand.penalties?.cancel?.amount != null
                    ? `₹${brand.penalties.cancel.amount.toLocaleString('en-IN')} per ticket`
                    : 'Non-refundable'}
                </p>
                {brand.penalties?.cancel?.types?.length > 0 && (
                  <p className="text-[10px] text-gray-400 mt-0.5">{brand.penalties.cancel.types.join(' · ')}</p>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <FaCalendarCheck className="text-gray-400" size={12} />
                  <span className="text-xs font-medium text-gray-700">Date Change</span>
                </div>
                <p className="text-xs text-gray-600">
                  {brand.penalties?.change?.amount != null
                    ? `₹${brand.penalties.change.amount.toLocaleString('en-IN')} per ticket + fare diff.`
                    : 'Not allowed'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <FaChair className="text-gray-400" size={12} />
                  <span className="text-xs font-medium text-gray-700">Seat Assignment</span>
                </div>
                <InclusionChip
                  label={brand.brandAttributes?.seatAssignment || '—'}
                  value={brand.brandAttributes?.seatAssignment}
                />
              </div>
            </div>

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

  // Handle fare selection
  const handleFareSelect = (fare) => {
    if (activeTab === 'outbound') {
      setSelectedOutboundFare(fare);
    } else {
      setSelectedReturnFare(fare);
    }
    setPricingError(null);
  };

  // ============ CONFIRM AND NAVIGATE - NO API CALL ============
  const handleConfirm = () => {
    if (!isReadyToConfirm) {
      return;
    }
    
    setIsConfirming(true);
    
    try {
      toast.success('Fares selected! Proceeding to booking...');
      
      const navigatePath = '/flights/booking/review';
      const navigationState = { 
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
      
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('An error occurred. Please try again.');
      setPricingError(error.message || 'Navigation error');
    } finally {
      setIsConfirming(false);
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
    );
  };

  // ── Book handler ──────────────────────────────────────────────
  const handleBook = async () => {
    if (isBooking) return;

    setIsBooking(true);
    try {
      setSelectedOutbound({ ...outboundFlight, selectedBrand: activOutBrand });
      setSelectedInbound({  ...returnFlight,   selectedBrand: activInBrand  });

      toast.success('Fares confirmed! Proceeding to booking...');
      onClose();

      navigate('/flights/booking/review', {
        state: {
          selectedOutbound:  { ...outboundFlight, selectedBrand: activOutBrand, source: outboundFlight.source },
          selectedInbound:   { ...returnFlight,   selectedBrand: activInBrand,  source: returnFlight.source  },
          passengerCounts,
          tripType:          'round-trip',
          totalPrice,
        },
      });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <BaseSheet isOpen={isOpen} onClose={onClose} title="Review & Select Fares">
      <div className="space-y-5 pb-8">

        {/* ── TABS ─────────────────────────────────────────── */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[
            { id: 'summary',  label: 'Summary'  },
            { id: 'outbound', label: 'Outbound' },
            { id: 'inbound',  label: 'Return'   },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === t.id ? 'bg-white text-[#FD561E] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ SUMMARY TAB ════════════════════════════════════ */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <FlightSummaryStrip flight={outboundFlight} brand={activOutBrand} legLabel="Outbound" color="blue" />
            <FlightSummaryStrip flight={returnFlight}   brand={activInBrand}  legLabel="Return"   color="green" />

            {/* Grand total */}
            <div className="bg-gradient-to-r from-orange-50 to-white rounded-2xl border border-orange-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Total Price</span>
                <span className="text-2xl font-bold text-[#FD561E]">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FaPlane className="text-blue-400 rotate-45" size={10} /> Outbound ({activOutBrand?.brandName})
                  </span>
                  <span>₹{(activOutBrand?.price?.totalPrice || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FaPlane className="text-green-400 -rotate-45" size={10} /> Return ({activInBrand?.brandName})
                  </span>
                  <span>₹{(activInBrand?.price?.totalPrice || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {activOutBrand?.price?.breakdown?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-orange-100 space-y-1">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Outbound fare breakdown</p>
                  {activOutBrand.price.breakdown.map((b) => (
                    <div key={b.passengerType} className="flex justify-between text-xs text-gray-500">
                      <span>
                        {b.passengerType === 'ADT' ? 'Adult' : b.passengerType === 'CNN' ? 'Child' : 'Infant'} ×{b.quantity}
                      </span>
                      <span>₹{b.total.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Passengers */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <FaUserFriends className="text-[#FD561E]" size={15} />
              <div>
                <div className="text-xs text-gray-400">Passengers</div>
                <div className="text-sm font-medium text-gray-700">{passengerText}</div>
              </div>
            </div>
          </div>
        )}

        {/* ══ OUTBOUND TAB ═══════════════════════════════════ */}
        {activeTab === 'outbound' && (
          <div className="space-y-3">
            <FlightSummaryStrip flight={outboundFlight} brand={activOutBrand} legLabel="Outbound" color="blue" />

            {outboundFlight.stops > 0 && outboundFlight.segments.map((seg, idx) => (
              <div key={seg.flightCode + idx}>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FaPlane className="text-blue-500 rotate-45" size={10} />
                  </div>
                  <div className="flex-1 flex items-center gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-gray-800">{seg.from.time}</div>
                      <div className="text-gray-500">{seg.from.airport}</div>
                      {seg.from.terminal && <div className="text-gray-400">T{seg.from.terminal}</div>}
                    </div>
                    <div className="flex-1 text-center text-gray-400">
                      <div>{seg.duration}</div>
                      <div className="h-px bg-gray-200 my-1" />
                      <div>{seg.flightCode} · {seg.equipment}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-800">{seg.to.time}</div>
                      <div className="text-gray-500">{seg.to.airport}</div>
                      {seg.to.terminal && <div className="text-gray-400">T{seg.to.terminal}</div>}
                    </div>
                  </div>
                </div>
                {idx < outboundFlight.segments.length - 1 && outboundFlight.connections?.[idx] && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg my-1 mx-1 border border-amber-100">
                    <FaClock size={10} className="text-amber-500" />
                    <span className="text-xs text-amber-700">
                      {outboundFlight.connections[idx].connectionDuration} layover · {outboundFlight.connections[idx].airport}
                    </span>
                  </div>
                )}
              </div>
            ))}

            <BrandSelector options={outbrandOptions} activeIdx={outboundBrandIdx} setIdx={setOutboundBrandIdx} label="Outbound" color="blue" />
            <BrandDetail brand={activOutBrand} flight={outboundFlight} passengerCounts={passengerCounts} />
          </div>
        )}

        {/* ══ INBOUND TAB ════════════════════════════════════ */}
        {activeTab === 'inbound' && (
          <div className="space-y-3">
            <FlightSummaryStrip flight={returnFlight} brand={activInBrand} legLabel="Return" color="green" />

            {returnFlight.stops > 0 && returnFlight.segments.map((seg, idx) => (
              <div key={seg.flightCode + idx}>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <FaPlane className="text-green-500 -rotate-45" size={10} />
                  </div>
                  <div className="flex-1 flex items-center gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-gray-800">{seg.from.time}</div>
                      <div className="text-gray-500">{seg.from.airport}</div>
                      {seg.from.terminal && <div className="text-gray-400">T{seg.from.terminal}</div>}
                    </div>
                    <div className="flex-1 text-center text-gray-400">
                      <div>{seg.duration}</div>
                      <div className="h-px bg-gray-200 my-1" />
                      <div>{seg.flightCode} · {seg.equipment}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-800">{seg.to.time}</div>
                      <div className="text-gray-500">{seg.to.airport}</div>
                      {seg.to.terminal && <div className="text-gray-400">T{seg.to.terminal}</div>}
                    </div>
                  </div>
                </div>
                {idx < returnFlight.segments.length - 1 && returnFlight.connections?.[idx] && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg my-1 mx-1 border border-amber-100">
                    <FaClock size={10} className="text-amber-500" />
                    <span className="text-xs text-amber-700">
                      {returnFlight.connections[idx].connectionDuration} layover · {returnFlight.connections[idx].airport}
                    </span>
                  </div>
                )}
              </div>
            ))}

            <BrandSelector options={inbrandOptions} activeIdx={inboundBrandIdx} setIdx={setInboundBrandIdx} label="Return" color="green" />
            <BrandDetail brand={activInBrand} flight={returnFlight} passengerCounts={passengerCounts} />
          </div>
        )}

        {/* ── BOOK BUTTON ─────────────────────────────────── */}
        <button
          onClick={handleBook}
          disabled={isBooking}
          className="w-full py-4 font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 bg-[#FD561E] hover:bg-[#e04e1b] text-white shadow-lg shadow-orange-100 disabled:opacity-60"
        >
          {isBooking ? (
            <><FaSpinner className="animate-spin" size={16} /> Processing...</>
          ) : (
            <>Book Round Trip · ₹{totalPrice.toLocaleString('en-IN')} <FaArrowRight size={14} /></>
          )}
        </button>

        {outbrandOptions.length > 1 && (
          <p className="text-xs text-center text-gray-400">
            Switch between Outbound / Return tabs to compare and change fares
          </p>
        )}

      </div>
    </BaseSheet>
  );
};

export default RoundTripSheet;