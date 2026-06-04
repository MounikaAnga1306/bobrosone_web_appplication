// src/modules/flights/components/shared/OneWayFlightCard.jsx
//
// DATA CONTRACT — fields come from lowFareTransformer resolveOffering()
//
// flight = {
//   offeringId, optionIndex, sequence,
//   from, to,
//   departureTime,   "HH:MM"
//   arrivalTime,     "HH:MM"
//   departureDate,   "YYYY-MM-DD"
//   arrivalDate,     "YYYY-MM-DD"
//   departureDateFormatted,  "04 Oct 2026"
//   arrivalDateFormatted,
//   totalDuration,   "6h 0m"
//   stops,           0 | 1 | 2 ...
//   connectingAirports: ["DEL"]
//   connections: [{ airport, connectionDuration }]
//   segments: [{
//     carrier, number, flightCode,
//     equipment, duration,
//     from: { airport, date, time, terminal },
//     to:   { airport, date, time, terminal }
//   }]
//   brandOptions: [{
//     brandRef, brandName, brandCode, tier,
//     cabin, classOfService, fareBasisCode, fareType,
//     seatsLeft,
//     combinabilityCode,
//     price: { currency, base, totalTaxes, totalFees, totalPrice, breakdown[] }
//     brandAttributes: { rebooking, refund, meals, seatAssignment, checkedBag, upgrade }
//     baggage: {
//       ADT: { checked: { weight, unit }, carryOn: { weight, unit } },
//       INF: { ... },
//       CNN: { ... }
//     }
//     penalties: {
//       change: { allowed, amount, currency, appliesTo },
//       cancel: { allowed, amount, currency, appliesTo }
//     }
//     validatingAirline, paymentTimeLimit,
//     passengerFareInfo: [{ passengerType, cabin, classOfService, fareBasisCode, fareType, ticketDesignator }]
//   }]
//   cheapestPrice,   number
//   cheapestBrand,   string
//   currency,        "INR"
// }

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaChevronDown, FaChevronUp,
  FaSuitcase, FaChair, FaUtensils,
  FaClock, FaPlane, FaInfoCircle,
  FaCreditCard, FaTimesCircle, FaShieldAlt,
  FaArrowRight, FaCalendarCheck, FaCheck,
  FaExclamationCircle
} from 'react-icons/fa';
import { buildOneWayPricingRequest, getFlightPricing } from '../../services/pricingService';
import toast from 'react-hot-toast';

// ── inclusion display helpers ─────────────────────────────────────
const INCLUSION_COLOR = {
  'Included':    'text-green-600',
  'Chargeable':  'text-orange-500',
  'Not Offered': 'text-gray-400',
};

const INCLUSION_ICON = {
  'Included':    <FaCheck size={10} className="text-green-600" />,
  'Chargeable':  <FaExclamationCircle size={10} className="text-orange-500" />,
  'Not Offered': <FaTimesCircle size={10} className="text-gray-400" />,
};

const InclusionBadge = ({ value }) => (
  <span className={`flex items-center gap-1 text-xs ${INCLUSION_COLOR[value] || 'text-gray-400'}`}>
    {INCLUSION_ICON[value] || null}
    {value || '—'}
  </span>
);

// ── price breakdown helper ────────────────────────────────────────
// Returns per-pax total for a given passengerType from breakdown[]
const getPaxTotal = (breakdown, type) =>
  breakdown?.find(b => b.passengerType === type)?.total ?? null;

const OneWayFlightCard = ({
  flight,
  onViewDetails,
  passengerCounts = { ADT: 1, CNN: 0, INF: 0 },
  airlineData,       // from parent airlinesMap[carrier]
  airlinesLoading,
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded]               = useState(false);
  const [activeTab, setActiveTab]                 = useState('flight');
  const [selectedBrandIndex, setSelectedBrandIndex] = useState(0);
  const [loading, setLoading]                     = useState(false);
  const [imageLoaded, setImageLoaded]             = useState(false);

  // ── cheapest brand is shown on card by default ────────────────
  // user can switch brands in expanded section
  const cheapestBrandIndex = useMemo(() => {
    if (!flight.brandOptions?.length) return 0;
    let idx = 0;
    flight.brandOptions.forEach((b, i) => {
      if (b.price.totalPrice < flight.brandOptions[idx].price.totalPrice) idx = i;
    });
    return idx;
  }, [flight.brandOptions]);

  // active brand — starts at cheapest, user can change
  const activeBrand = flight.brandOptions?.[selectedBrandIndex] ?? null;

  // ── airline display ───────────────────────────────────────────
  const firstSegment   = flight.segments?.[0];
  const carrierCode    = firstSegment?.carrier ?? '';
  const airlineName    = airlineData?.name || carrierCode;
  const airlineLogo    = airlineData?.logo_url
    || `/airlines/${carrierCode.toLowerCase()}.png`;

  // ── skeleton while airline data is loading ────────────────────
  if (airlinesLoading && !airlineData) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 mb-4 overflow-hidden animate-pulse">
        <div className="p-5 flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="h-4 bg-gray-200 rounded w-40" />
          </div>
          <div className="text-right">
            <div className="h-6 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (!activeBrand) return null;

  const { price, brandAttributes, baggage, penalties } = activeBrand;

  // ── handlers ─────────────────────────────────────────────────
  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
    if (!isExpanded) setActiveTab('flight');
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (onViewDetails) onViewDetails(flight);
  };

  const handleBookNow = async (e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const loadingToast = toast.loading('Getting fare details...');
      const pricingRequest = buildOneWayPricingRequest(flight, activeBrand, passengerCounts);
      const result = await getFlightPricing(pricingRequest);
      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success('Fare confirmed! Proceed with booking.');
        navigate('/flights/booking/review', {
          state: {
            pricingResult:      result.data,
            rawPricingResponse: result.rawResponse,
            selectedBrand:      activeBrand,
            flight,
            passengerCounts,
            tripType:           'one-way',
            totalPrice:         price.totalPrice,
          },
        });
      } else {
        toast.error(result.userMessage || result.error || 'Failed to get pricing. Please try again.');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 mb-4 overflow-hidden">

      {/* ── MAIN CARD ROW ─────────────────────────────────────── */}
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* Airline */}
          <div className="flex items-center gap-3 min-w-[180px]">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden relative">
              <img
                src={airlineLogo}
                alt={airlineName}
                className={`w-8 h-8 object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  setImageLoaded(true);
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${carrierCode}&background=666&color=fff&size=32`;
                }}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{airlineName}</div>
              {/* show all flight numbers if connecting */}
              <div className="text-xs text-gray-400">
                {flight.segments.map(s => s.flightCode).join(' · ')}
              </div>
              {/* brand badge */}
              <div className="text-xs text-blue-600 font-medium mt-0.5">{activeBrand.brandName}</div>
            </div>
          </div>

          {/* Flight Timeline */}
          <div className="flex-1 flex items-center justify-center gap-6 md:gap-8">
            {/* Departure */}
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-800">{flight.departureTime}</div>
              <div className="text-sm text-gray-500">{flight.from}</div>
              <div className="text-xs text-gray-400">{flight.departureDateFormatted}</div>
            </div>

            {/* Duration + stops */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-1">{flight.totalDuration}</div>
              <div className="relative w-20">
                <div className="border-t border-gray-200" />
                <FaPlane className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-gray-300 text-xs rotate-90 bg-white px-1" />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {flight.stops === 0
                  ? 'Direct'
                  : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </div>
              {/* connecting airports */}
              {flight.connectingAirports?.length > 0 && (
                <div className="text-xs text-orange-500 mt-0.5">
                  via {flight.connectingAirports.join(', ')}
                </div>
              )}
            </div>

            {/* Arrival */}
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-800">{flight.arrivalTime}</div>
              <div className="text-sm text-gray-500">{flight.to}</div>
              <div className="text-xs text-gray-400">{flight.arrivalDateFormatted}</div>
            </div>
          </div>

          {/* Price + Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xl font-bold text-gray-800">
                ₹{price.totalPrice?.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-gray-400">
                {flight.currency} · all pax
              </div>
              {activeBrand.seatsLeft != null && activeBrand.seatsLeft <= 6 && (
                <div className="text-xs text-red-500 font-medium mt-0.5">
                  {activeBrand.seatsLeft} seats left
                </div>
              )}
            </div>

            <button
              onClick={handleViewDetails}
              className="px-4 py-2 rounded-lg bg-[#FD561E] hover:bg-[#e44a18] text-white transition-all duration-200 text-sm font-medium"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Connection layover pills */}
        {flight.connections?.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-50 flex flex-wrap gap-2">
            {flight.connections.map((conn, idx) => (
              <div key={idx} className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full flex items-center gap-1">
                <FaClock size={10} className="text-gray-400" />
                {conn.airport}: {conn.connectionDuration} layover
              </div>
            ))}
          </div>
        )}

        {/* Expand toggle */}
        <div className="mt-4 pt-3 border-t border-gray-50">
          <button
            onClick={handleToggleExpand}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
            {isExpanded ? 'Hide fare details' : 'View fare details'}
          </button>
        </div>
      </div>

      {/* ── EXPANDED SECTION ──────────────────────────────────── */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/30 px-5 py-4 animate-slideDown">

          {/* Brand Selector — show all brandOptions as tabs */}
          {flight.brandOptions?.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {flight.brandOptions.map((brand, idx) => (
                <button
                  key={brand.brandRef}
                  onClick={() => setSelectedBrandIndex(idx)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedBrandIndex === idx
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {brand.brandName}
                  <span className="ml-1 opacity-70">
                    ₹{brand.price.totalPrice.toLocaleString('en-IN')}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Tab Headers */}
          <div className="flex gap-4 border-b border-gray-200 mb-4">
            {[
              { id: 'flight',       label: 'Flight Details', icon: FaPlane       },
              { id: 'fare',         label: 'Fare Summary',   icon: FaCreditCard  },
              { id: 'cancellation', label: 'Policies',       icon: FaShieldAlt   },
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

          {/* ── TAB: FLIGHT DETAILS ─────────────────────────── */}
          {activeTab === 'flight' && (
            <div className="space-y-4">

              {/* Each segment */}
              {flight.segments.map((seg, idx) => (
                <div key={seg.flightCode + idx}>
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                      {/* Departure end */}
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 mb-0.5">Departure</div>
                        <div className="font-semibold text-gray-800">{seg.from.airport}</div>
                        <div className="text-sm text-gray-600">{seg.from.time}</div>
                        <div className="text-xs text-gray-400">{seg.from.dateFormatted}</div>
                        {seg.from.terminal && (
                          <div className="text-xs text-gray-500 mt-0.5">Terminal {seg.from.terminal}</div>
                        )}
                      </div>

                      {/* Middle: duration + flight info */}
                      <div className="text-center px-2">
                        <div className="text-xs text-gray-400">{seg.duration}</div>
                        <FaArrowRight className="text-gray-300 my-1 mx-auto" size={12} />
                        <div className="text-xs text-gray-500">{seg.flightCode}</div>
                        <div className="text-xs text-gray-400">{seg.equipment}</div>
                      </div>

                      {/* Arrival end */}
                      <div className="flex-1 text-right">
                        <div className="text-xs text-gray-400 mb-0.5">Arrival</div>
                        <div className="font-semibold text-gray-800">{seg.to.airport}</div>
                        <div className="text-sm text-gray-600">{seg.to.time}</div>
                        <div className="text-xs text-gray-400">{seg.to.dateFormatted}</div>
                        {seg.to.terminal && (
                          <div className="text-xs text-gray-500 mt-0.5">Terminal {seg.to.terminal}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Connection layover between segments */}
                  {idx < flight.segments.length - 1 && flight.connections[idx] && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg my-2">
                      <FaClock size={12} className="text-orange-400" />
                      <span className="text-xs text-orange-700">
                        {flight.connections[idx].connectionDuration} layover at {flight.connections[idx].airport}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Cabin + Baggage summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FaChair className="text-gray-400" size={12} />
                    <span className="text-xs text-gray-500">CABIN</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{activeBrand.cabin}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Class {activeBrand.classOfService}</p>
                  <p className="text-xs text-gray-400">{activeBrand.fareBasisCode}</p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FaSuitcase className="text-gray-400" size={12} />
                    <span className="text-xs text-gray-500">BAGGAGE (ADT)</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {baggage?.ADT?.checked?.weight != null
                      ? `${baggage.ADT.checked.weight} ${baggage.ADT.checked.unit?.replace('Kilograms','kg') || 'kg'} check-in`
                      : 'See airline policy'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Carry-on: {baggage?.ADT?.carryOn?.weight != null
                      ? `${baggage.ADT.carryOn.weight} ${baggage.ADT.carryOn.unit?.replace('Kilograms','kg') || 'kg'}`
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Per-pax baggage if CNN or INF travelled */}
              {(passengerCounts.CNN > 0 || passengerCounts.INF > 0) && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FaSuitcase className="text-gray-400" size={12} />
                    <span className="text-xs text-gray-500">BAGGAGE — OTHER PASSENGERS</span>
                  </div>
                  <div className="space-y-1">
                    {passengerCounts.CNN > 0 && baggage?.CNN && (
                      <p className="text-xs text-gray-600">
                        Child (CNN): {baggage.CNN.checked?.weight ?? '—'} kg check-in
                        · {baggage.CNN.carryOn?.weight != null ? `${baggage.CNN.carryOn.weight} kg carry-on` : 'no carry-on included'}
                      </p>
                    )}
                    {passengerCounts.INF > 0 && baggage?.INF && (
                      <p className="text-xs text-gray-600">
                        Infant (INF): {baggage.INF.checked?.weight ?? '—'} kg check-in
                        · {baggage.INF.carryOn?.weight != null ? `${baggage.INF.carryOn.weight} kg carry-on` : 'no carry-on included'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Meal */}
              <div className="bg-white rounded-lg p-3 border border-gray-100 flex items-center gap-3">
                <FaUtensils className="text-gray-400" size={12} />
                <div>
                  <span className="text-xs text-gray-500">MEALS</span>
                  <p className="text-sm text-gray-700 mt-0.5">
                    {brandAttributes?.meals === 'Included'
                      ? 'Complimentary meal included'
                      : brandAttributes?.meals === 'Chargeable'
                      ? 'Meals available for purchase'
                      : 'Meals not offered'}
                  </p>
                </div>
              </div>

              {/* Brand attributes summary */}
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-2">FARE INCLUSIONS — {activeBrand.brandName}</p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {[
                    { label: 'Seat Assignment', key: 'seatAssignment' },
                    { label: 'Checked Bag',     key: 'checkedBag'     },
                    { label: 'Rebooking',        key: 'rebooking'      },
                    { label: 'Refund',           key: 'refund'         },
                    { label: 'Upgrade',          key: 'upgrade'        },
                    { label: 'Meals',            key: 'meals'          },
                  ].map(({ label, key }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{label}</span>
                      <InclusionBadge value={brandAttributes?.[key]} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: FARE SUMMARY ───────────────────────────── */}
          {activeTab === 'fare' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-100">

                {/* Per-pax breakdown */}
                <div className="space-y-3 mb-3">
                  {price.breakdown.map((b) => (
                    <div key={b.passengerType} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{b.passengerType} × {b.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm pl-2">
                        <span className="text-gray-500">Base fare</span>
                        <span className="text-gray-700">₹{b.base.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm pl-2">
                        <span className="text-gray-500">Taxes</span>
                        <span className="text-gray-700">₹{b.taxes.toLocaleString('en-IN')}</span>
                      </div>
                      {b.fees > 0 && (
                        <div className="flex justify-between text-sm pl-2">
                          <span className="text-gray-500">Fees</span>
                          <span className="text-gray-700">₹{b.fees.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm pl-2 font-medium">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-800">₹{b.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grand total */}
                <div className="pt-3 border-t border-gray-100 flex justify-between font-semibold">
                  <span className="text-gray-800">Total ({price.currency})</span>
                  <span className="text-gray-900 text-base">₹{price.totalPrice.toLocaleString('en-IN')}</span>
                </div>

                {/* Validating airline + payment deadline */}
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                  {activeBrand.validatingAirline && (
                    <p className="text-xs text-gray-500">
                      Validating airline: <span className="font-medium text-gray-700">{activeBrand.validatingAirline}</span>
                    </p>
                  )}
                  {activeBrand.paymentTimeLimit && (
                    <p className="text-xs text-gray-500">
                      Payment deadline:{' '}
                      <span className="font-medium text-red-500">
                        {new Date(activeBrand.paymentTimeLimit).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </p>
                  )}
                  {activeBrand.fareType && (
                    <p className="text-xs text-gray-500">
                      Fare type: <span className="font-medium text-gray-700">{activeBrand.fareType}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50/30 rounded-lg p-3">
                <p className="text-xs text-gray-500 flex items-start gap-2">
                  <FaInfoCircle size={12} className="mt-0.5 flex-shrink-0 text-gray-400" />
                  All taxes and fees included. Final price confirmed at booking.
                </p>
              </div>

              {/* Book Now button in fare tab */}
              <button
                onClick={handleBookNow}
                disabled={loading}
                className="w-full py-3 bg-[#FD561E] hover:bg-[#e44a18] text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Getting fare...' : `Book Now · ₹${price.totalPrice.toLocaleString('en-IN')}`}
              </button>
            </div>
          )}

          {/* ── TAB: POLICIES ───────────────────────────────── */}
          {activeTab === 'cancellation' && (
            <div className="space-y-3">

              {/* Cancellation */}
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <FaTimesCircle className="text-gray-400" size={14} />
                  <span className="text-sm font-medium text-gray-700">Cancellation</span>
                </div>
                <p className="text-sm text-gray-600">
                  {penalties?.cancel?.amount != null
                    ? `₹${penalties.cancel.amount.toLocaleString('en-IN')} per ticket`
                    : 'Non-refundable'}
                </p>
                {penalties?.cancel?.types?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{penalties.cancel.types.join(', ')}</p>
                )}
              </div>

              {/* Date Change */}
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarCheck className="text-gray-400" size={14} />
                  <span className="text-sm font-medium text-gray-700">Date Change</span>
                </div>
                <p className="text-sm text-gray-600">
                  {penalties?.change?.amount != null
                    ? `₹${penalties.change.amount.toLocaleString('en-IN')} per ticket + fare difference`
                    : 'Changes not allowed'}
                </p>
                {penalties?.change?.types?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{penalties.change.types.join(', ')}</p>
                )}
              </div>

              {/* Seat assignment */}
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <FaChair className="text-gray-400" size={14} />
                  <span className="text-sm font-medium text-gray-700">Seat Assignment</span>
                </div>
                <InclusionBadge value={brandAttributes?.seatAssignment} />
              </div>

              {/* Per-pax fare rules note */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 flex items-start gap-2">
                  <FaInfoCircle size={12} className="mt-0.5 flex-shrink-0 text-gray-400" />
                  Penalties apply per ticket per passenger. Infant (INF) penalties may differ.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default OneWayFlightCard;