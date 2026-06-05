// src/modules/flights/components/shared/RoundTripFlightCard.jsx

//
// DATA CONTRACT — flight comes from lowFareTransformer resolveOffering()
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
//   segments [{ carrier, number, flightCode, equipment, duration,
//               from: { airport, time, dateFormatted, terminal },
//               to:   { airport, time, dateFormatted, terminal } }],
//   brandOptions [{ brandName, tier, price: { totalPrice, currency }, ... }],
//   cheapestPrice, cheapestBrand, currency
// }

import React, { useState, useMemo } from 'react';
import {
  FaPlane, FaCheckCircle, FaClock, FaMapMarkerAlt,
  FaChevronDown, FaChevronUp, FaSuitcase, FaUtensils,
  FaChair, FaCheck, FaExclamationCircle, FaTimesCircle,
  FaStar, FaCrown, FaGem, FaTag, FaArrowRight
} from 'react-icons/fa';

// ── Tier icon ─────────────────────────────────────────────────────
const TierIcon = ({ tier }) => {
  if (tier >= 6) return <FaGem   className="text-purple-400" size={11} />;
  if (tier >= 5) return <FaCrown className="text-yellow-400" size={11} />;
  if (tier >= 4) return <FaStar  className="text-blue-400"   size={11} />;
  return              <FaTag  className="text-gray-400"   size={11} />;
};

// ── Inclusion chip ────────────────────────────────────────────────
const INCLUSION = {
  'Included':    { color: 'text-green-600',  icon: <FaCheck           size={9} className="text-green-600"  /> },
  'Chargeable':  { color: 'text-orange-500', icon: <FaExclamationCircle size={9} className="text-orange-500" /> },
  'Not Offered': { color: 'text-gray-400',   icon: <FaTimesCircle     size={9} className="text-gray-400"   /> },
};

const InclusionPill = ({ value }) => {
  const s = INCLUSION[value] || INCLUSION['Not Offered'];
  return (
    <span className={`flex items-center gap-1 text-xs ${s.color}`}>
      {s.icon} {value || '—'}



import React, { useState, useMemo } from 'react';
import { 
  FaPlane,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRegClock,
  FaChevronDown,
  FaChevronUp,
  FaSuitcase,
  FaChair,
  FaUtensils,
  FaInfoCircle,
  FaCreditCard,
  FaTimesCircle,
  FaShieldAlt,
  FaArrowRight,
  FaCalendarCheck
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch { return '--:--'; }
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
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch { return ''; }
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return ''; }
};

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const match = price.toString().match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
};

const calculateTotalTaxes = (fare) => {
  if (!fare?.taxes) return 0;
  if (Array.isArray(fare.taxes)) return fare.taxes.reduce((sum, tax) => sum + (tax.amount || 0), 0);
  if (typeof fare.taxes === 'object') return fare.taxes.amount || 0;
  if (typeof fare.taxes === 'number') return fare.taxes;
  return 0;
};

const StopBadge = ({ stops }) => {
  if (stops === 0) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
      <FaPlane size={10} className="rotate-45" />Direct
    </span>
  );
  if (stops === 1) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
      <FaMapMarkerAlt size={10} />1 Stop
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
      <FaMapMarkerAlt size={10} />{stops} Stops

    </span>
  );
};


// ── Stop badge ────────────────────────────────────────────────────
const StopBadge = ({ stops, airports }) => {
  if (stops === 0)
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium"><FaPlane size={9} className="rotate-45" /> Direct</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
      <FaMapMarkerAlt size={9} />
      {stops} Stop{stops > 1 ? 's' : ''}
      {airports?.length ? ` · ${airports.join(', ')}` : ''}
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────
const RoundTripFlightCard = ({
  flight,
  isSelected,
  onSelect,
  legIndex = 0,            // 0 = outbound (blue), 1 = inbound (green)
  airlineData,             // from parent airlinesMap[carrier]
  airlinesLoading,
}) => {
  const [isExpanded, setIsExpanded]             = useState(false);
  const [selectedBrandIndex, setSelectedBrandIndex] = useState(0);
  const [imgLoaded, setImgLoaded]               = useState(false);

  if (!flight) return null;

  const firstSeg    = flight.segments?.[0];
  const lastSeg     = flight.segments?.[flight.segments.length - 1];
  const carrierCode = firstSeg?.carrier ?? '';
  const airlineName = airlineData?.name || carrierCode;
  const logoSrc     = airlineData?.logo_url || `/airlines/${carrierCode.toLowerCase()}.png`;

  // ── Cheapest brand for card summary ──────────────────────────
  const cheapestBrand = useMemo(() => {
    if (!flight.brandOptions?.length) return null;
    return flight.brandOptions.reduce((min, b) =>
      b.price.totalPrice < min.price.totalPrice ? b : min
    , flight.brandOptions[0]);
  }, [flight.brandOptions]);

  const activeBrand = flight.brandOptions?.[selectedBrandIndex] ?? cheapestBrand;

  // ── Leg colour theme ──────────────────────────────────────────
  const theme = legIndex === 0
    ? { border: 'border-blue-500',  ring: 'ring-blue-200',  header: 'bg-blue-50',  accent: 'text-blue-700',  dot: 'bg-blue-500'  }
    : { border: 'border-green-500', ring: 'ring-green-200', header: 'bg-green-50', accent: 'text-green-700', dot: 'bg-green-500' };

  // Skeleton
  if (airlinesLoading && !airlineData) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 mb-3 overflow-hidden animate-pulse">
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-28 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-20" />


const RoundTripFlightCard = ({ 
  flight, 
  isSelected, 
  onSelect,
  legIndex = 0,
  passengerCounts = { ADT: 1, CNN: 0, INF: 0 },
  airlineData,
  airlinesLoading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('flight');
  const [imageLoaded, setImageLoaded] = useState(false);

  const bestFare = useMemo(() => {
    if (!flight.fares || flight.fares.length === 0) return null;
    const sortedFares = [...flight.fares].sort((a, b) => a.totalPrice - b.totalPrice);
    return sortedFares[0];
  }, [flight.fares]);

  const airlineLogo = useMemo(() => {
    if (airlineData?.logo_url) return airlineData.logo_url;
    const airlineCode = flight.airlineCode || flight.airline?.substring(0, 2);
    return `https://logo.clearbit.com/${airlineCode?.toLowerCase()}.com`;
  }, [airlineData, flight.airlineCode, flight.airline]);

  const airlineName = airlineData?.name || flight.airline || flight.airlineCode;
  const legColor = legIndex === 0 ? 'blue' : 'emerald';
  const stops = flight.stops || 0;
  const duration = flight.duration || 0;
  const lowestPrice = flight.lowestPrice || flight.price || parsePrice(bestFare?.totalPrice) || 0;

  if (airlinesLoading && !airlineData) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 mb-3 overflow-hidden animate-pulse">
        <div className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gray-200"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="text-right"><div className="h-5 bg-gray-200 rounded w-20"></div></div>
          </div>

        </div>
      </div>
    );
  }


  return (
    <div
      onClick={() => onSelect?.()}
      className={`
        bg-white rounded-2xl border-2 transition-all duration-200 cursor-pointer mb-3
        shadow-sm hover:shadow-md
        ${isSelected
          ? `${theme.border} ring-2 ${theme.ring} ring-offset-1`
          : 'border-gray-200 hover:border-gray-300'}
      `}
    >
      {/* ── SELECTED BANNER ──────────────────────────────── */}
      {isSelected && (
        <div className={`${theme.header} px-4 py-1.5 flex items-center gap-1.5 border-b border-gray-100`}>
          <FaCheckCircle className={theme.accent} size={11} />
          <span className={`text-xs font-semibold ${theme.accent}`}>
            {legIndex === 0 ? 'Outbound selected' : 'Return selected'}
          </span>
        </div>
      )}

      <div className="p-4">
        {/* ── ROW 1: Airline + price ────────────────────── */}
        <div className="flex items-center justify-between mb-3">
          {/* Airline */}
          <div className="flex items-center gap-2.5">
            {/* Radio dot */}
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-[#FD561E] bg-[#FD561E]' : 'border-gray-300'}`}>
              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>

            {/* Logo */}
            <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden relative flex-shrink-0">
              <img src={logoSrc} alt={airlineName}
                className={`w-6 h-6 object-contain transition-opacity ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImgLoaded(true)}
                onError={(e) => { e.target.onerror = null; setImgLoaded(true); e.target.src = `https://ui-avatars.com/api/?name=${carrierCode}&background=FD561E&color=fff&size=24`; }}
              />
              {!imgLoaded && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" /></div>}
            </div>

            {/* Name + flight codes */}
            <div>
              <div className="font-semibold text-gray-800 text-sm leading-tight">{airlineName}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {flight.segments.map(s => s.flightCode).join(' · ')}



  if (!bestFare && !lowestPrice) return null;

  const handleSelect = () => { if (onSelect) onSelect(flight); };

  const handleViewFareRules = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    if (!isExpanded) setActiveTab('flight');
  };

  const selectedStyles = isSelected 
    ? `border-${legColor}-500 ring-2 ring-${legColor}-200 ring-offset-2`
    : 'border-gray-200 hover:border-gray-300 hover:shadow-md';

  return (
    <div className="relative mb-3">
      <div className={`bg-white rounded-xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${selectedStyles} ${isExpanded ? 'rounded-b-none' : ''}`}>

        {/* Main Content */}
        <div className="p-3" onClick={handleSelect}>
          <div className="flex items-center gap-3">

            {/* Radio Button */}
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'border-[#FD561E] bg-[#FD561E]' : 'border-gray-300 bg-white'}`}>
              {isSelected && <FaCheckCircle className="text-white" size={10} />}
            </div>

            {/* Airline Logo */}
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden relative flex-shrink-0">
              <img
                src={airlineLogo}
                alt={airlineName}
                className={`w-8 h-8 object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => { setImageLoaded(true); e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${flight.airlineCode || airlineName?.substring(0, 2)}&background=666&color=fff&size=24`; }}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Flight Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 text-sm">{airlineName}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{flight.flightNumber}</div>

              {/* Route */}
              <div className="flex items-center gap-2 mt-1">

                {/* Departure */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-gray-800">{formatTime(flight.departureTime)}</div>
                  <div className="text-xs text-gray-500">{flight.origin}</div>
                </div>

                {/* ── Middle: line + plane (right-facing) on top, duration below center ── */}
                <div className="flex-1 flex flex-col items-center gap-0.5 px-1">

                  {/* Line with plane in center, right-facing (FaPlane default = right) */}
                  <div className="flex items-center w-full">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <FaPlane size={10} className="text-gray-400 mx-0.5 flex-shrink-0" />
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  {/* Duration — below the line, center */}
                  <span className="text-[10px] text-gray-400 leading-none">
                    {formatDuration(duration)}
                  </span>

                </div>

                {/* Arrival */}
                <div className="text-left flex-shrink-0">
                  <div className="text-sm font-semibold text-gray-800">{formatTime(flight.arrivalTime)}</div>
                  <div className="text-xs text-gray-500">{flight.destination}</div>
                </div>

              </div>
            </div>

            {/* Price & Stop Badge — right side, unchanged */}
            <div className="text-right">
              <div className="mb-1 flex justify-end">
                <StopBadge stops={stops} />

              </div>
              <div className="text-lg font-bold text-[#FD561E]">
                ₹{lowestPrice.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-gray-400">per adult</div>
            </div>

          </div>


          {/* Price */}
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-0.5">from</div>
            <div className="text-lg font-bold text-[#FD561E]">
              ₹{flight.cheapestPrice?.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-gray-400">{flight.currency}</div>
          </div>
        </div>

        {/* ── ROW 2: Flight timeline ────────────────────── */}
        <div className="flex items-center gap-3 mb-3">
          {/* Departure */}
          <div className="text-center w-16 flex-shrink-0">
            <div className="text-lg font-bold text-gray-900 leading-none">{flight.departureTime}</div>
            <div className="text-xs font-medium text-gray-600 mt-0.5">{flight.from}</div>
            <div className="text-[10px] text-gray-400">{flight.departureDateFormatted}</div>
            {firstSeg?.from?.terminal && (
              <div className="text-[10px] text-gray-400">T{firstSeg.from.terminal}</div>
            )}
          </div>

          {/* Middle: duration + stops */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FaClock size={9} /> {flight.totalDuration}
            </div>
            <div className="relative w-full flex items-center">
              {/* Line */}
              <div className="w-full h-px bg-gray-200" />
              {/* Dot per stop */}
              {flight.stops > 0 && flight.connectingAirports?.map((airport, i) => (
                <div key={i} className={`absolute ${i === 0 ? 'left-1/2' : 'left-3/4'} -translate-x-1/2 w-2 h-2 rounded-full ${theme.dot} border-2 border-white shadow-sm`} title={airport} />
              ))}
              {/* Plane icon */}
              <FaPlane className="absolute left-1/2 -translate-x-1/2 text-gray-300 -translate-y-3" size={12} />
            </div>
            <StopBadge stops={flight.stops} airports={flight.connectingAirports} />
          </div>

          {/* Arrival */}
          <div className="text-center w-16 flex-shrink-0">
            <div className="text-lg font-bold text-gray-900 leading-none">{flight.arrivalTime}</div>
            <div className="text-xs font-medium text-gray-600 mt-0.5">{flight.to}</div>
            <div className="text-[10px] text-gray-400">{flight.arrivalDateFormatted}</div>
            {lastSeg?.to?.terminal && (
              <div className="text-[10px] text-gray-400">T{lastSeg.to.terminal}</div>
            )}
          </div>
        </div>

        {/* ── ROW 3: Brand pill + seats left ───────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {cheapestBrand && (
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                <TierIcon tier={cheapestBrand.tier} />
                <span className="text-xs text-gray-600 font-medium">{cheapestBrand.brandName}</span>
              </div>
            )}
            {cheapestBrand?.seatsLeft != null && cheapestBrand.seatsLeft <= 6 && (
              <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                {cheapestBrand.seatsLeft} left
              </span>
            )}
          </div>

          {/* Expand toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(p => !p); }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? <><FaChevronUp size={10} /> Less</> : <><FaChevronDown size={10} /> Details</>}
          </button>
        </div>
      </div>

      {/* ── EXPANDED: brand comparison + segment detail ── */}
      {isExpanded && (
        <div
          className="border-t border-gray-100 px-4 py-3 bg-gray-50/50"
          onClick={e => e.stopPropagation()}
        >
          {/* Brand selector */}
          {flight.brandOptions?.length > 1 && (
            <div className="mb-3">
              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-2">Choose Fare</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {flight.brandOptions.map((brand, idx) => {
                  const isActive = selectedBrandIndex === idx;
                  const isCheapest = brand.price.totalPrice === flight.cheapestPrice;
                  return (
                    <button
                      key={`${brand.brandRef}-${idx}`}
                      onClick={() => setSelectedBrandIndex(idx)}
                      className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'bg-[#FD561E] border-[#FD561E] text-white shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold">{brand.brandName}</span>
                        {isCheapest && <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-[#FD561E] text-white'}`}>BEST</span>}
                      </div>
                      <div className={`text-xs font-bold mt-0.5 ${isActive ? 'text-white' : 'text-[#FD561E]'}`}>
                        ₹{brand.price.totalPrice.toLocaleString('en-IN')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active brand quick summary */}
          {activeBrand && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {/* Baggage */}
              <div className="bg-white rounded-xl p-2 border border-gray-100 text-center">
                <FaSuitcase className="text-gray-400 mx-auto mb-1" size={12} />
                <div className="text-xs font-semibold text-gray-700">
                  {activeBrand.baggage?.ADT?.checked?.weight != null
                    ? `${activeBrand.baggage.ADT.checked.weight}kg`
                    : '—'}
                </div>
                <div className="text-[10px] text-gray-400">Check-in</div>
              </div>
              {/* Meal */}
              <div className="bg-white rounded-xl p-2 border border-gray-100 text-center">
                <FaUtensils className="text-gray-400 mx-auto mb-1" size={12} />
                <div className="text-xs font-semibold text-gray-700">
                  {activeBrand.brandAttributes?.meals === 'Included' ? 'Incl.' : 'Chargeable'}
                </div>
                <div className="text-[10px] text-gray-400">Meal</div>
              </div>
              {/* Seat */}
              <div className="bg-white rounded-xl p-2 border border-gray-100 text-center">
                <FaChair className="text-gray-400 mx-auto mb-1" size={12} />
                <div className="text-xs font-semibold text-gray-700">
                  {activeBrand.brandAttributes?.seatAssignment === 'Included' ? 'Free' : 'Paid'}
                </div>
                <div className="text-[10px] text-gray-400">Seat</div>
              </div>
            </div>
          )}

          {/* Segment detail */}
          {flight.segments.map((seg, idx) => (
            <div key={seg.flightCode + idx}>
              <div className="flex items-center gap-2 bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <FaPlane className="text-gray-400" size={9} />
                </div>
                <div className="flex-1 flex items-center gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-gray-800">{seg.from.time}</div>
                    <div className="text-gray-500">{seg.from.airport}</div>
                    {seg.from.terminal && <div className="text-gray-400">T{seg.from.terminal}</div>}
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-gray-400">{seg.duration}</div>
                    <div className="h-px bg-gray-200 my-1 relative">
                      <FaArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300" size={8} />
                    </div>
                    <div className="text-gray-400">{seg.flightCode}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-800">{seg.to.time}</div>
                    <div className="text-gray-500">{seg.to.airport}</div>
                    {seg.to.terminal && <div className="text-gray-400">T{seg.to.terminal}</div>}
                  </div>
                </div>
              </div>
              {/* Layover */}
              {idx < flight.segments.length - 1 && flight.connections?.[idx] && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg my-1 mx-1">
                  <FaClock size={10} className="text-amber-500" />
                  <span className="text-xs text-amber-700">{flight.connections[idx].connectionDuration} layover · {flight.connections[idx].airport}</span>
                </div>
              )}
            </div>
          ))}

          {/* Penalties quick view */}
          {activeBrand?.penalties && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="text-[10px] text-gray-400 mb-1">Cancellation</div>
                <div className="text-xs font-semibold text-gray-700">
                  {activeBrand.penalties.cancel?.amount != null
                    ? `₹${activeBrand.penalties.cancel.amount.toLocaleString('en-IN')}`
                    : 'Non-refundable'}
                </div>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="text-[10px] text-gray-400 mb-1">Date Change</div>
                <div className="text-xs font-semibold text-gray-700">
                  {activeBrand.penalties.change?.amount != null
                    ? `₹${activeBrand.penalties.change.amount.toLocaleString('en-IN')}`
                    : 'Not allowed'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CARD FOOTER ──────────────────────────────────── */}
      <div className={`px-4 py-2 border-t border-gray-50 ${isSelected ? theme.header : 'bg-gray-50/30'}`}>
        <p className={`text-xs text-center font-medium ${isSelected ? theme.accent : 'text-gray-400'}`}>
          {isSelected ? `✓ ${legIndex === 0 ? 'Outbound' : 'Return'} selected` : 'Tap to select this flight'}
        </p>
      </div>


          {/* Bottom row: date where duration used to be + Details toggle */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {/* ✅ Date now where duration was in original code */}
              <span className="flex items-center gap-1">
                <FaCalendarAlt size={10} />
                {formatDate(flight.departureTime)}
              </span>
            </div>

            {bestFare && (
              <button
                onClick={handleViewFareRules}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? (
                  <><FaChevronUp size={8} /><span>Less</span></>
                ) : (
                  <><FaChevronDown size={8} /><span>Details</span></>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className={`h-0.5 bg-gradient-to-r from-${legColor}-500 to-${legColor}-300`}></div>
        )}
      </div>

      {/* Expanded Section */}
      {isExpanded && bestFare && (
        <div className="border-x border-b border-gray-200 bg-gray-50/50 px-4 py-3 rounded-b-xl animate-slideDown">
          <div className="flex gap-3 border-b border-gray-200 mb-3">
            {[
              { id: 'flight', label: 'Flight', icon: FaPlane },
              { id: 'fare', label: 'Fare', icon: FaCreditCard },
              { id: 'cancellation', label: 'Policy', icon: FaShieldAlt }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }}
                className={`pb-1.5 text-xs font-medium transition-colors ${activeTab === tab.id ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="flex items-center gap-1"><tab.icon size={10} />{tab.label}</div>
              </button>
            ))}
          </div>

          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            {activeTab === 'flight' && (
              <>
                <div className="bg-white rounded-lg p-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Departure</span>
                    <span className="font-medium">{flight.origin}</span>
                    <span className="text-gray-400">{formatDateTime(flight.departureTime)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-500">Arrival</span>
                    <span className="font-medium">{flight.destination}</span>
                    <span className="text-gray-400">{formatDateTime(flight.arrivalTime)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-50">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium">{formatDuration(duration)}</span>
                    <span className="text-gray-500">{stops === 0 ? 'Direct' : `${stops} stop`}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <FaChair className="text-gray-400" size={10} />
                      <span className="text-xs text-gray-500">Aircraft</span>
                    </div>
                    <p className="text-xs font-medium">{flight.aircraft || 'Not specified'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <FaSuitcase className="text-gray-400" size={10} />
                      <span className="text-xs text-gray-500">Baggage</span>
                    </div>
                    <p className="text-xs font-medium">{bestFare.baggage?.weight || 15} kg</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'fare' && (
              <div className="bg-white rounded-lg p-2">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base Fare</span>
                    <span>₹{bestFare.basePrice?.toLocaleString() || Math.round(bestFare.totalPrice * 0.85).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Taxes & Fees</span>
                    <span>₹{(calculateTotalTaxes(bestFare) || Math.round(bestFare.totalPrice * 0.15)).toLocaleString()}</span>
                  </div>
                  <div className="pt-1 border-t border-gray-100 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-[#FD561E]">₹{bestFare.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cancellation' && (
              <div className="bg-white rounded-lg p-2 text-xs space-y-2">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <FaTimesCircle size={10} className="text-gray-400" />
                    <span className="font-medium">Cancellation</span>
                  </div>
                  <p className="text-gray-600">
                    {bestFare.penalties?.cancel?.amount ? `₹${bestFare.penalties.cancel.amount.toLocaleString()} fee` : bestFare.penalties?.cancel?.percentage ? `${bestFare.penalties.cancel.percentage}% fee` : bestFare.refundable ? 'Refundable' : 'Non-refundable'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <FaCalendarCheck size={10} className="text-gray-400" />
                    <span className="font-medium">Date Change</span>
                  </div>
                  <p className="text-gray-600">
                    {bestFare.penalties?.change?.amount ? `₹${bestFare.penalties.change.amount.toLocaleString()} + diff` : bestFare.penalties?.change?.percentage ? `${bestFare.penalties.change.percentage}% + diff` : bestFare.refundable ? 'Allowed with fee' : 'Not allowed'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
      `}</style>

    </div>
  );
};

export default RoundTripFlightCard;