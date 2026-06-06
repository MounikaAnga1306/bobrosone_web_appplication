// src/modules/flights/components/sheet/RoundTripSheet.jsx
//
// DATA CONTRACT — outboundFlight and returnFlight both come from
// lowFareTransformer resolveOffering() — same shape as OneWaySheet flight prop.
// See OneWaySheet.jsx DATA CONTRACT comment for full field list.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseSheet from './BaseSheet';
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
                {' · '}{brand.fareType}
              </div>
            </div>
          )}

          {tab === 'price' && (
            <div className="space-y-2">
              {brand.price.breakdown.map((b) => (
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
          selectedOutbound:  { ...outboundFlight, selectedBrand: activOutBrand },
          selectedInbound:   { ...returnFlight,   selectedBrand: activInBrand  },
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