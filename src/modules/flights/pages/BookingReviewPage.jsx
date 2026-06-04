// src/modules/flights/pages/BookingReviewPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaArrowLeft, FaPlane, FaSpinner, FaInfoCircle, FaCheckCircle,
  FaChevronDown, FaChevronUp, FaUser, FaEnvelope, FaPhone,
  FaSuitcase, FaChair, FaTimesCircle, FaCalendarCheck,
  FaTag, FaCrown, FaGem, FaStar, FaCheck, FaExclamationCircle,
  FaArrowRight, FaClock, FaTicketAlt, FaBuilding,
  FaPlaneDeparture, FaPlaneArrival, FaBabyCarriage,
  FaReceipt, FaFileInvoice, FaShieldAlt, FaBriefcase, FaExchangeAlt,
} from 'react-icons/fa';

// ── Stores ──────────────────────────────────────────────────────
import useStore   from '../store/useStore';
import usePnrStore from '../store/usePnrStore';

// ── Services ────────────────────────────────────────────────────
import { executePricing }      from '../services/pricingService';
import { buildPnrRequestBody } from '../services/pnrService';

// ── FORMATTERS ──────────────────────────────────────────────────
const fmt = {
  time: (iso) => {
    if (!iso) return '--:--';
    try { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }); }
    catch { return '--:--'; }
  },
  date: (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  },
  dateShort: (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  },
  dur: (mins) => {
    if (!mins) return '—';
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  },
  money: (n) => `₹${(n || 0).toLocaleString('en-IN')}`,
};

const INCLUSION = {
  'Included':    { bg: 'bg-green-50 border-green-200',  text: 'text-green-700',  icon: <FaCheck size={9} className="text-green-600" /> },
  'Chargeable':  { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', icon: <FaExclamationCircle size={9} className="text-orange-500" /> },
  'Not Offered': { bg: 'bg-gray-50 border-gray-200',    text: 'text-gray-500',   icon: <FaTimesCircle size={9} className="text-gray-400" /> },
};

const InclusionBadge = ({ label, value }) => {
  const s = INCLUSION[value] || INCLUSION['Not Offered'];
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${s.bg} ${s.text}`}>
      {s.icon} {label}
    </div>
  );
};

const TIER_ICON = (tier) => {
  if (tier >= 6) return <FaGem   className="text-purple-500" size={14} />;
  if (tier >= 5) return <FaCrown className="text-yellow-500" size={14} />;
  if (tier >= 4) return <FaStar  className="text-blue-500"   size={14} />;
  return              <FaTag   className="text-[#FD561E]"  size={14} />;
};

const SCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>{children}</div>
);

const STitle = ({ icon: Icon, iconBg, title, subtitle, sectionKey, expanded, onToggle, badge }) => (
  <button onClick={() => onToggle(sectionKey)}
    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="text-[#FD561E]" size={17} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
          {badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FD561E] text-white">{badge}</span>}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {expanded ? <FaChevronUp className="text-gray-400 flex-shrink-0" size={13} /> : <FaChevronDown className="text-gray-400 flex-shrink-0" size={13} />}
  </button>
);

const paxLabel = (type) => type === 'ADT' ? 'Adult' : type === 'CNN' ? 'Child' : 'Infant';

const calcAge = (dob) => {
  if (!dob) return 0;
  const today = new Date(), birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() - birth.getMonth() < 0 || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
};

const makePassengerList = (counts) => {
  const list = [];
  for (let i = 0; i < (counts?.ADT || 1); i++)  list.push({ id: `adt-${i}`, type: 'ADT', label: 'Adult',  firstName: '', lastName: '', dob: '', gender: '', nationality: 'IN' });
  for (let i = 0; i < (counts?.CNN || 0); i++)   list.push({ id: `cnn-${i}`, type: 'CNN', label: 'Child',  firstName: '', lastName: '', dob: '', gender: '' });
  for (let i = 0; i < (counts?.INF || 0); i++)   list.push({ id: `inf-${i}`, type: 'INF', label: 'Infant', firstName: '', lastName: '', dob: '', gender: '' });
  return list;
};

// ── FLIGHT LEG ──────────────────────────────────────────────────
const FlightLeg = ({ segments, legLabel, isReturn = false }) => {
  if (!segments?.length) return null;
  const first = segments[0], last = segments[segments.length - 1];
  const totalMins = segments.reduce((s, seg) => s + (seg.flightTime || 0), 0);
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isReturn ? 'bg-green-100' : 'bg-blue-100'}`}>
          {isReturn ? <FaPlaneArrival className="text-green-600" size={12} /> : <FaPlaneDeparture className="text-blue-600" size={12} />}
        </div>
        <span className={`text-xs font-bold uppercase tracking-wide ${isReturn ? 'text-green-700' : 'text-blue-700'}`}>{legLabel}</span>
        {segments.length === 1
          ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Non-stop</span>
          : <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{segments.length - 1} stop{segments.length > 2 ? 's' : ''}</span>
        }
      </div>
      <div className="flex items-center justify-between mb-5 px-2">
        <div className="text-center flex-1">
          <div className="text-3xl font-black text-gray-900 tracking-tight">{fmt.time(first.departureTime)}</div>
          <div className="text-lg font-bold text-gray-700">{first.origin}</div>
          <div className="text-xs text-gray-400 mt-0.5">{fmt.date(first.departureTime)}</div>
        </div>
        <div className="flex-1 px-3 text-center">
          <div className="text-xs text-gray-500 font-semibold mb-2">{fmt.dur(totalMins)}</div>
          <div className="relative flex items-center justify-center">
            <div className="w-full h-px bg-gray-300" />
            <FaPlane className="absolute text-[#FD561E] rotate-90 bg-white px-0.5" size={14} />
          </div>
          {segments.length > 1 && (
            <div className="text-[10px] text-amber-600 font-semibold mt-1.5">via {segments.slice(1).map(s => s.origin).join(', ')}</div>
          )}
        </div>
        <div className="text-center flex-1">
          <div className="text-3xl font-black text-gray-900 tracking-tight">{fmt.time(last.arrivalTime)}</div>
          <div className="text-lg font-bold text-gray-700">{last.destination}</div>
          <div className="text-xs text-gray-400 mt-0.5">{fmt.date(last.arrivalTime)}</div>
        </div>
      </div>
      {segments.map((seg, idx) => (
        <div key={seg.key || idx}>
          {idx > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mb-3">
              <FaClock className="text-amber-500 flex-shrink-0" size={11} />
              <span className="text-xs text-amber-700 font-medium">Layover at {seg.origin}</span>
            </div>
          )}
          <div className={`rounded-xl border border-gray-100 bg-gray-50 p-4 ${idx < segments.length - 1 ? 'mb-3' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                  <FaPlane className="text-[#FD561E] rotate-90" size={12} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">{seg.carrier}{seg.flightNumber}</div>
                  <div className="text-[11px] text-gray-400">{seg.equipment || '—'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-700">{fmt.dur(seg.flightTime)}</div>
                <div className="text-[11px] text-gray-400">flight time</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-base font-bold text-gray-800">{seg.origin}</div>
                <div className="text-sm font-semibold text-gray-600">{fmt.time(seg.departureTime)}</div>
                <div className="text-[11px] text-gray-400">{fmt.dateShort(seg.departureTime)}</div>
              </div>
              <FaArrowRight className="text-gray-300" size={10} />
              <div className="flex-1 text-right">
                <div className="text-base font-bold text-gray-800">{seg.destination}</div>
                <div className="text-sm font-semibold text-gray-600">{fmt.time(seg.arrivalTime)}</div>
                <div className="text-[11px] text-gray-400">{fmt.dateShort(seg.arrivalTime)}</div>
              </div>
            </div>
            {seg.classOfService && (
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[11px] font-semibold bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">
                  Class {seg.classOfService}
                </span>
                <span className="text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <FaCheck size={8} /> Confirmed
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── FARE CARD ────────────────────────────────────────────────────
const FareCard = ({ fare, idx, isSelected, cheapestIdx, onSelect }) => {
  const [baggageOpen, setBaggageOpen] = useState(false);
  const isCheapest = idx === cheapestIdx;
  return (
    <div onClick={() => onSelect(idx)}
      className={`rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
        isSelected ? 'border-[#FD561E] shadow-xl shadow-orange-100 bg-white' : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-md'
      }`}
    >
      <div className={`px-5 py-4 ${isSelected ? 'bg-gradient-to-r from-[#FD561E]/8 to-orange-50/50' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {TIER_ICON(fare.brandTier ?? 1)}
              <span className="font-black text-gray-800">{fare.brandName}</span>
              {isCheapest && <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">BEST VALUE</span>}
              {isSelected && (
                <span className="text-[9px] font-black bg-[#FD561E] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FaCheck size={7} /> SELECTED
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {fare.cabin && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg font-semibold">{fare.cabin}</span>}
              {fare.validatingAirline && <span className="text-xs text-gray-400">Operated by {fare.validatingAirline}</span>}
              {fare.fareBasisCode && <span className="text-[11px] text-gray-400 font-mono">{fare.fareBasisCode}</span>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-black text-[#FD561E] leading-none">{fmt.money(fare.grandTotal)}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">total · all passengers</div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Fare Inclusions</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {[
            { label: 'Seat',    key: 'seatAssignment' },
            { label: 'Bag',     key: 'checkedBag'     },
            { label: 'Meals',   key: 'meals'          },
            { label: 'Rebook',  key: 'rebooking'      },
            { label: 'Refund',  key: 'refund'         },
            { label: 'Upgrade', key: 'upgrade'        },
          ].map(({ label, key }) => <InclusionBadge key={key} label={label} value={fare.brandAttributes?.[key]} />)}
        </div>
      </div>

      <div className="mx-5 mb-4 rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-4 text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 px-4 py-2.5 border-b border-gray-200">
          <span>Passenger</span>
          <span className="text-right">Base Fare</span>
          <span className="text-right">Taxes</span>
          <span className="text-right">Total</span>
        </div>
        {fare.passengerBreakdown?.map((pb) => (
          <div key={pb.passengerType} className="grid grid-cols-4 px-4 py-2.5 text-xs border-b border-gray-50 last:border-0 hover:bg-gray-50">
            <span className="font-semibold text-gray-700">{paxLabel(pb.passengerType)} ×{pb.quantity}</span>
            <span className="text-right text-gray-600">{fmt.money(pb.baseFare)}</span>
            <span className="text-right text-gray-600">{fmt.money(pb.taxes)}</span>
            <span className="text-right font-bold text-gray-800">{fmt.money(pb.totalFare)}</span>
          </div>
        ))}
        <div className="grid grid-cols-4 px-4 py-3 bg-[#FD561E]/6 border-t border-[#FD561E]/15">
          <span className="col-span-3 font-black text-gray-800 text-sm">Grand Total</span>
          <span className="text-right font-black text-[#FD561E] text-sm">{fmt.money(fare.grandTotal)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-5 pb-4">
        <div className="flex items-start gap-3 bg-red-50 rounded-xl p-3 border border-red-100">
          <FaTimesCircle className="text-red-400 mt-0.5 flex-shrink-0" size={13} />
          <div>
            <div className="text-[10px] font-black text-red-600 uppercase tracking-wide">Cancellation</div>
            <div className="text-xs font-bold text-gray-700 mt-0.5">
              {fare.penalties?.cancel?.amount != null ? `${fmt.money(fare.penalties.cancel.amount)} / ticket` : 'Non-refundable'}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
          <FaCalendarCheck className="text-blue-400 mt-0.5 flex-shrink-0" size={13} />
          <div>
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-wide">Date Change</div>
            <div className="text-xs font-bold text-gray-700 mt-0.5">
              {fare.penalties?.change?.amount != null ? `${fmt.money(fare.penalties.change.amount)} + fare diff` : 'Not allowed'}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4" onClick={(e) => { e.stopPropagation(); setBaggageOpen(p => !p); }}>
        <button className="flex items-center gap-1.5 text-xs text-[#FD561E] font-bold hover:underline">
          <FaBriefcase size={11} />
          {baggageOpen ? 'Hide' : 'Show'} baggage allowance
          {baggageOpen ? <FaChevronUp size={9} /> : <FaChevronDown size={9} />}
        </button>
        {baggageOpen && (
          <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 px-4 py-2 border-b border-gray-100">
              <span>Passenger</span><span className="text-center">Check-in</span><span className="text-center">Carry-on</span>
            </div>
            {['ADT', 'CNN', 'INF'].map((code) => {
              const bag = fare.baggage?.[code];
              if (!bag) return null;
              return (
                <div key={code} className="grid grid-cols-3 px-4 py-2.5 text-xs border-b border-gray-50 last:border-0">
                  <span className="font-semibold text-gray-700">{paxLabel(code)}</span>
                  <span className="text-center font-bold text-gray-800">{bag.checked?.weight != null ? `${bag.checked.weight} kg` : '—'}</span>
                  <span className="text-center font-bold text-gray-800">{bag.carryOn?.weight != null ? `${bag.carryOn.weight} kg` : '—'}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {fare.paymentTimeLimit && (
        <div className="mx-5 mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <FaClock className="text-amber-500 flex-shrink-0" size={11} />
          <span className="text-[11px] text-amber-700 font-semibold">Book by: {fmt.date(fare.paymentTimeLimit)}</span>
        </div>
      )}
    </div>
  );
};

// ── PRICE SIDEBAR ────────────────────────────────────────────────
const PriceSidebar = ({ selectedFare, isRoundTrip, outbound, inbound, onConfirm, loading, disabled }) => {
  if (!selectedFare) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#FD561E] to-orange-400 px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <FaReceipt className="text-white" size={15} />
          <span className="text-white font-black">Price Summary</span>
        </div>
        <div className="text-white/80 text-xs">{selectedFare.brandName} · {selectedFare.cabin}</div>
      </div>
      <div className="p-5 space-y-4">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700">{outbound?.from} → {outbound?.to}</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
              {isRoundTrip ? 'Round Trip' : 'One Way'}
            </span>
          </div>
          {isRoundTrip && inbound && (
            <div className="flex items-center gap-1 text-gray-500">
              <FaExchangeAlt size={9} className="text-green-500" />
              <span>Return: {inbound.from} → {inbound.to}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Fare Breakdown</div>
          {selectedFare.passengerBreakdown?.map((pb) => (
            <div key={pb.passengerType} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">{paxLabel(pb.passengerType)} × {pb.quantity}</span>
                <span className="text-sm font-black text-gray-800">{fmt.money(pb.totalFare * pb.quantity)}</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Base fare × {pb.quantity}</span><span>{fmt.money(pb.baseFare * pb.quantity)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Taxes × {pb.quantity}</span><span>{fmt.money(pb.taxes * pb.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 border-t border-gray-100 pt-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total Base Fare</span><span className="font-semibold">{fmt.money(selectedFare.totalBaseFare)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Taxes &amp; Fees</span><span className="font-semibold">{fmt.money(selectedFare.totalTaxes + (selectedFare.totalFees || 0))}</span>
          </div>
        </div>
        <div className="flex items-center justify-between bg-[#FD561E]/8 rounded-2xl px-4 py-4 border border-[#FD561E]/20">
          <div>
            <div className="text-xs text-gray-500 font-medium">Grand Total</div>
            <div className="text-[10px] text-gray-400">incl. all taxes</div>
          </div>
          <div className="text-3xl font-black text-[#FD561E]">{fmt.money(selectedFare.grandTotal)}</div>
        </div>
        <button onClick={onConfirm} disabled={disabled || loading}
          className="w-full py-4 bg-[#FD561E] hover:bg-[#e04e1b] active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
          {loading
            ? <><FaSpinner className="animate-spin" size={16} /> Confirming...</>
            : <>Confirm &amp; Proceed {fmt.money(selectedFare.grandTotal)} <FaArrowRight size={14} /></>}
        </button>
        <p className="text-[10px] text-center text-gray-400">By confirming you agree to the fare rules.</p>
      </div>
    </div>
  );
};

// ── LOADING / ERROR ──────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center max-w-xs w-full">
      <div className="w-16 h-16 border-4 border-[#FD561E] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
      <h2 className="font-black text-gray-800 text-lg mb-1">Fetching Fare Options</h2>
      <p className="text-sm text-gray-400">Getting the best prices for you...</p>
    </div>
  </div>
);

const ErrorScreen = ({ message, onBack }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-sm w-full">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <FaTimesCircle className="text-red-500" size={28} />
      </div>
      <h2 className="font-black text-gray-800 text-lg mb-2">Unable to Load Fares</h2>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <button onClick={onBack} className="w-full bg-[#FD561E] text-white py-3.5 rounded-2xl font-black hover:bg-[#e04e1b] transition-colors">
        ← Go Back
      </button>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════
const BookingReviewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // ── Data passed from OneWaySheet / RoundTripSheet via navigate state ──
  const selectedOutbound = state?.selectedOutbound ?? null;
  const selectedInbound  = state?.selectedInbound  ?? null;
  const passengerCounts  = state?.passengerCounts  ?? { ADT: 1, CNN: 0, INF: 0 };
  const tripType         = state?.tripType         ?? 'one-way';
  const isRoundTrip      = tripType === 'round-trip';

  // ── Read from useStore — everything executePricing() saves here ──
  // Each field selected independently to avoid reference-equality re-render loops.
  const pricingResult      = useStore((s) => s.pricingResult);
  const rawPricingResponse = useStore((s) => s.rawPricingResponse);
  const pricingLoading     = useStore((s) => s.pricingLoading);
  const pricingError       = useStore((s) => s.pricingError);
  const storeTraceId       = useStore((s) => s.traceId);

  // PNR loading state from usePnrStore (used while building + navigating)
  const pnrLoading = usePnrStore((s) => s.isLoading);

  // ── Local state ──────────────────────────────────────────────────
  const [selectedFareIndex, setSelectedFareIndex] = useState(0);
  const [passengers,  setPassengers]  = useState(() => makePassengerList(passengerCounts));
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: { countryCode: '91', number: '' },
    address: { street: '', city: '', state: '', postalCode: '', countryCode: 'IN' },
  });
  const [gstData,  setGstData]  = useState({ gstn: '', gsta: '', gstp: '', gste: '' });
  const [showGst,  setShowGst]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [expanded, setExpanded] = useState({ fares: true, outbound: true, inbound: true, passengers: true, contact: true });

  const toggleSection = useCallback((key) => setExpanded((p) => ({ ...p, [key]: !p[key] })), []);

  // ── Call executePricing on mount ─────────────────────────────────
  // executePricing() reads everything from store:
  //   store.traceId        → "BOBROS-xxx"
  //   store.travelerRefs   → { ADT: "base64==" }
  //   store.selectedOutbound / selectedInbound
  //   store.searchParams   → passenger counts
  // Saves result to store.pricingResult and store.rawPricingResponse
  useEffect(() => {
    if (!selectedOutbound) return;

    // If pricing already loaded for this session, don't re-fetch
    if (pricingResult) {
      setSelectedFareIndex(pricingResult.cheapestFareIndex ?? 0);
      return;
    }

    executePricing().then((result) => {
      if (result.success) {
        const cheapest = useStore.getState().pricingResult?.cheapestFareIndex ?? 0;
        setSelectedFareIndex(cheapest);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived data from pricingResult ─────────────────────────────
  const fareOptions  = pricingResult?.fareOptions ?? [];
  const segments     = pricingResult?.segments    ?? [];
  const selectedFare = fareOptions[selectedFareIndex] ?? null;

  const outboundSegs = useMemo(
    () => isRoundTrip ? segments.filter(s => s.group === 0) : segments,
    [segments, isRoundTrip]
  );
  const inboundSegs = useMemo(
    () => isRoundTrip ? segments.filter(s => s.group === 1) : [],
    [segments, isRoundTrip]
  );

  // ── Form helpers ─────────────────────────────────────────────────
  const updateContact = useCallback((path, value) => {
    setContactInfo((prev) => {
      const clone  = { ...prev };
      const parts  = path.split('.');
      if (parts.length === 1) clone[parts[0]] = value;
      else clone[parts[0]] = { ...clone[parts[0]], [parts[1]]: value };
      return clone;
    });
  }, []);

  const updatePassenger = useCallback((idx, field, value) =>
    setPassengers((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p)), []);

  const validate = useCallback(() => {
    const errs = {};
    passengers.forEach((p, i) => {
      if (!p.firstName.trim()) errs[`p${i}_fn`]     = 'Required';
      if (!p.lastName.trim())  errs[`p${i}_ln`]     = 'Required';
      if (!p.dob)              errs[`p${i}_dob`]    = 'Required';
      else {
        const age = calcAge(p.dob);
        if (p.type === 'ADT' && age < 12)              errs[`p${i}_dob`] = 'Adult must be 12+';
        if (p.type === 'CNN' && (age < 2 || age > 11)) errs[`p${i}_dob`] = 'Child age 2–11';
        if (p.type === 'INF' && age > 2)               errs[`p${i}_dob`] = 'Infant under 2';
      }
      if (!p.gender)           errs[`p${i}_gender`] = 'Required';
    });
    if (!contactInfo.email.trim())                                 errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) errs.email = 'Invalid email';
    if (!contactInfo.phone.number.trim())                          errs.phone = 'Required';
    else if (!/^\d{10}$/.test(contactInfo.phone.number))           errs.phone = 'Must be 10 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [passengers, contactInfo]);

  const isFormValid = useCallback(() => {
    const paxOk = passengers.every(p => p.firstName && p.lastName && p.dob && p.gender);
    const ctOk  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email) && /^\d{10}$/.test(contactInfo.phone.number);
    return paxOk && ctOk;
  }, [passengers, contactInfo]);

  // ── Confirm handler ───────────────────────────────────────────────
  // Does NOT call PNR API here.
  // Builds PNR request body and navigates to PassengerDetailsReviewPage.
  // PassengerDetailsReviewPage calls PNR API on mount.
  const handleConfirm = async () => {
    if (!validate()) { toast.error('Please fill all required fields'); return; }
    if (!rawPricingResponse?.data) { toast.error('Pricing data missing — go back and retry'); return; }

    const passengerKeys = rawPricingResponse?.passengerKeys ?? [];

    // Build PNR request body using pnrService builder
    const pnrRequestBody = buildPnrRequestBody({
      traceId:          rawPricingResponse.traceId ?? storeTraceId,
      selectedFareIndex,
      passengers,
      passengerKeys,
      rawPricingData:   rawPricingResponse.data,   // full SOAP envelope
      contactInfo,
      gstData:          showGst ? gstData : null,
    });

    console.log('📦 PNR request body built:', JSON.stringify(pnrRequestBody, null, 2));

    // Navigate to PassengerDetailsReviewPage
    // PNR API is called there on mount
    navigate('/flights/passenger-review', {
      state: {
        pnrRequestBody,               // ready to POST
        selectedOutbound,             // for display header
        selectedInbound,
        passengerCounts,
        tripType,
        selectedFare,                 // for fare summary display
      },
    });
  };

  // ── Guards ────────────────────────────────────────────────────────
  if (pricingLoading) return <LoadingScreen />;
  if (pricingError)   return <ErrorScreen message={pricingError} onBack={() => navigate(-1)} />;
  if (!selectedOutbound) return <ErrorScreen message="No booking data found." onBack={() => navigate('/flights')} />;

  const paxSummary = [
    passengerCounts.ADT > 0 && `${passengerCounts.ADT} Adult${passengerCounts.ADT > 1 ? 's' : ''}`,
    passengerCounts.CNN > 0 && `${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`,
    passengerCounts.INF > 0 && `${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`,
  ].filter(Boolean).join(' · ');

  const PAX_COLORS = {
    ADT: 'bg-blue-50 text-blue-700 border-blue-200',
    CNN: 'bg-green-50 text-green-700 border-green-200',
    INF: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 py-3.5">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0">
              <FaArrowLeft size={14} className="text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-gray-900 text-base leading-tight">Review &amp; Book</h1>
              <p className="text-xs text-gray-400 truncate">
                {selectedOutbound.from} → {isRoundTrip ? (selectedInbound?.to ?? selectedOutbound.to) : selectedOutbound.to} · {isRoundTrip ? 'Round Trip' : 'One Way'} · {paxSummary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto max-w-6xl px-4 py-5">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* LEFT */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Outbound segments */}
            {outboundSegs.length > 0 && (
              <SCard>
                <STitle icon={FaPlaneDeparture} iconBg="bg-blue-50" title="Outbound Flight"
                  subtitle={`${selectedOutbound.from} → ${selectedOutbound.to}`}
                  sectionKey="outbound" expanded={expanded.outbound} onToggle={toggleSection} />
                {expanded.outbound && (
                  <div className="border-t border-gray-100 p-5">
                    <FlightLeg segments={outboundSegs} legLabel={`${selectedOutbound.from} → ${selectedOutbound.to}`} />
                  </div>
                )}
              </SCard>
            )}

            {/* Inbound segments */}
            {isRoundTrip && inboundSegs.length > 0 && (
              <SCard>
                <STitle icon={FaPlaneArrival} iconBg="bg-green-50" title="Return Flight"
                  subtitle={`${selectedInbound?.from ?? ''} → ${selectedInbound?.to ?? ''}`}
                  sectionKey="inbound" expanded={expanded.inbound} onToggle={toggleSection} />
                {expanded.inbound && (
                  <div className="border-t border-gray-100 p-5">
                    <FlightLeg segments={inboundSegs} legLabel={`${selectedInbound?.from ?? ''} → ${selectedInbound?.to ?? ''}`} isReturn />
                  </div>
                )}
              </SCard>
            )}

            {/* Fare options */}
            {fareOptions.length > 0 && (
              <SCard>
                <STitle icon={FaTag} iconBg="bg-purple-50" title="Select Your Fare"
                  subtitle="Tap a fare to select it · All prices include taxes"
                  sectionKey="fares" expanded={expanded.fares} onToggle={toggleSection}
                  badge={`${fareOptions.length} options`} />
                {expanded.fares && (
                  <div className="border-t border-gray-100 p-5 space-y-4">
                    {fareOptions.map((fare, idx) => (
                      <FareCard key={idx} fare={fare} idx={idx}
                        isSelected={idx === selectedFareIndex}
                        cheapestIdx={pricingResult?.cheapestFareIndex ?? 0}
                        onSelect={(i) => { setSelectedFareIndex(i); toast.success(`${fareOptions[i].brandName} selected`); }}
                      />
                    ))}
                  </div>
                )}
              </SCard>
            )}

            {/* Passengers */}
            <SCard>
              <STitle icon={FaUser} iconBg="bg-blue-50" title="Passenger Details"
                subtitle={`${passengers.length} passenger${passengers.length > 1 ? 's' : ''} · Fill as per government ID`}
                sectionKey="passengers" expanded={expanded.passengers} onToggle={toggleSection} />
              {expanded.passengers && (
                <div className="border-t border-gray-100">
                  {passengers.map((pax, idx) => {
                    const clr  = PAX_COLORS[pax.type] || PAX_COLORS.ADT;
                    const done = pax.firstName && pax.lastName && pax.dob && pax.gender;
                    return (
                      <div key={pax.id} className={idx < passengers.length - 1 ? 'border-b border-gray-100' : ''}>
                        <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100 bg-gray-50">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${clr}`}>{pax.label} {idx + 1}</span>
                            {pax.type !== 'ADT' && <span className="text-[11px] text-gray-400">{pax.type === 'CNN' ? '(Age 2–11)' : '(Under 2 yrs)'}</span>}
                          </div>
                          {done ? <FaCheckCircle className="text-green-500" size={15} /> : <span className="text-[10px] text-amber-500 font-semibold">Incomplete</span>}
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* First Name */}
                          <div>
                            <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">First Name *</label>
                            <input type="text" value={pax.firstName}
                              onChange={(e) => updatePassenger(idx, 'firstName', e.target.value.toUpperCase())}
                              placeholder="As on passport / ID"
                              className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all font-semibold uppercase ${errors[`p${idx}_fn`] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`} />
                            {errors[`p${idx}_fn`] && <p className="text-xs text-red-500 mt-1">{errors[`p${idx}_fn`]}</p>}
                          </div>
                          {/* Last Name */}
                          <div>
                            <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Last Name *</label>
                            <input type="text" value={pax.lastName}
                              onChange={(e) => updatePassenger(idx, 'lastName', e.target.value.toUpperCase())}
                              placeholder="As on passport / ID"
                              className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all font-semibold uppercase ${errors[`p${idx}_ln`] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`} />
                            {errors[`p${idx}_ln`] && <p className="text-xs text-red-500 mt-1">{errors[`p${idx}_ln`]}</p>}
                          </div>
                          {/* DOB */}
                          <div>
                            <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Date of Birth *</label>
                            <input type="date" value={pax.dob}
                              onChange={(e) => updatePassenger(idx, 'dob', e.target.value)}
                              max={new Date().toISOString().split('T')[0]}
                              className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all ${errors[`p${idx}_dob`] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`} />
                            {errors[`p${idx}_dob`] && <p className="text-xs text-red-500 mt-1">{errors[`p${idx}_dob`]}</p>}
                          </div>
                          {/* Gender */}
                          <div>
                            <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Gender *</label>
                            <div className="flex gap-2">
                              {[['M','Male'],['F','Female']].map(([val, label]) => (
                                <button key={val} type="button" onClick={() => updatePassenger(idx, 'gender', val)}
                                  className={`flex-1 py-3 text-sm rounded-xl border font-black transition-all ${pax.gender === val ? 'bg-[#FD561E] border-[#FD561E] text-white shadow-md' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                                  {label}
                                </button>
                              ))}
                            </div>
                            {errors[`p${idx}_gender`] && <p className="text-xs text-red-500 mt-1">{errors[`p${idx}_gender`]}</p>}
                          </div>
                          {/* Nationality (ADT only) */}
                          {pax.type === 'ADT' && (
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Nationality</label>
                              <select value={pax.nationality} onChange={(e) => updatePassenger(idx, 'nationality', e.target.value)}
                                className="w-full px-4 py-3 text-sm border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E]">
                                {[['IN','India (IN)'],['US','United States (US)'],['GB','United Kingdom (GB)'],['AE','UAE (AE)'],['SG','Singapore (SG)'],['CA','Canada (CA)'],['AU','Australia (AU)']].map(([v,l]) => (
                                  <option key={v} value={v}>{l}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SCard>

            {/* Contact */}
            <SCard>
              <STitle icon={FaPhone} iconBg="bg-emerald-50" title="Contact Information"
                subtitle="Booking confirmation sent here"
                sectionKey="contact" expanded={expanded.contact} onToggle={toggleSection} />
              {expanded.contact && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Email Address *</label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                        <input type="email" value={contactInfo.email} onChange={(e) => updateContact('email', e.target.value)}
                          placeholder="name@email.com"
                          className={`w-full pl-11 pr-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`} />
                      </div>
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number *</label>
                      <div className="flex gap-2">
                        <select value={contactInfo.phone.countryCode} onChange={(e) => updateContact('phone.countryCode', e.target.value)}
                          className="w-24 px-2 py-3 text-sm border border-gray-200 bg-white rounded-xl focus:outline-none">
                          {[['+91','91'],['+1','1'],['+44','44'],['+971','971']].map(([l,v]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                        <div className="flex-1 relative">
                          <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                          <input type="tel" value={contactInfo.phone.number}
                            onChange={(e) => updateContact('phone.number', e.target.value.replace(/\D/g,''))}
                            placeholder="9876543210" maxLength={10}
                            className={`w-full pl-11 pr-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`} />
                        </div>
                      </div>
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    {[{k:'street',l:'Street Address',p:'123 Main Street',c:2},{k:'city',l:'City',p:'Mumbai',c:1},{k:'state',l:'State',p:'Maharashtra',c:1},{k:'postalCode',l:'Postal Code',p:'400001',c:1}].map(({k,l,p,c}) => (
                      <div key={k} className={c===2?'sm:col-span-2':''}>
                        <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">{l}</label>
                        <input type="text" value={contactInfo.address[k]} onChange={(e) => updateContact(`address.${k}`, e.target.value)}
                          placeholder={p} className="w-full px-4 py-3 text-sm border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SCard>

            {/* GST */}
            <SCard>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <FaFileInvoice className="text-indigo-500" size={17} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">GST Details</div>
                    <div className="text-xs text-gray-400">Optional · For business travellers</div>
                  </div>
                </div>
                <button onClick={() => setShowGst(p => !p)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${showGst ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}>
                  {showGst ? 'Remove' : '+ Add GST'}
                </button>
              </div>
              {showGst && (
                <div className="border-t border-gray-100 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{k:'gstn',l:'GSTIN *',p:'36AACCH5485M1Z2',c:2},{k:'gsta',l:'Company Name',p:'Acme Pvt Ltd',c:2},{k:'gstp',l:'GST Phone',p:'9999999999',c:1},{k:'gste',l:'GST Email',p:'gst@company.com',c:1}].map(({k,l,p,c}) => (
                    <div key={k} className={c===2?'sm:col-span-2':''}>
                      <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">{l}</label>
                      <input type="text" value={gstData[k]} onChange={(e) => setGstData(prev => ({...prev, [k]: e.target.value}))}
                        placeholder={p} className="w-full px-4 py-3 text-sm border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </SCard>

            {/* Mobile CTA */}
            <div className="lg:hidden space-y-3">
              {selectedFare && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-gray-500">{selectedFare.brandName} · {selectedFare.cabin}</div>
                      <div className="text-[10px] text-gray-400">{paxSummary}</div>
                    </div>
                    <div className="text-3xl font-black text-[#FD561E]">{fmt.money(selectedFare.grandTotal)}</div>
                  </div>
                </div>
              )}
              <button onClick={handleConfirm} disabled={pnrLoading || !selectedFare || !isFormValid()}
                className="w-full py-4 bg-[#FD561E] hover:bg-[#e04e1b] active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                {pnrLoading
                  ? <><FaSpinner className="animate-spin" size={16} /> Processing...</>
                  : <>Confirm &amp; Proceed {selectedFare ? fmt.money(selectedFare.grandTotal) : ''} <FaArrowRight size={14} /></>}
              </button>
            </div>

          </div>{/* end left col */}

          {/* RIGHT */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              <PriceSidebar
                selectedFare={selectedFare} isRoundTrip={isRoundTrip}
                outbound={selectedOutbound} inbound={selectedInbound}
                onConfirm={handleConfirm} loading={pnrLoading}
                disabled={!selectedFare || !isFormValid()}
              />
              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                {[
                  { icon: FaShieldAlt,   text: 'Secure 256-bit SSL encryption',    color: 'text-green-500',  bg: 'bg-green-50'  },
                  { icon: FaCheckCircle, text: 'Instant booking confirmation',      color: 'text-blue-500',   bg: 'bg-blue-50'   },
                  { icon: FaTicketAlt,   text: 'E-ticket sent to your email',       color: 'text-purple-500', bg: 'bg-purple-50' },
                  { icon: FaInfoCircle,  text: 'IATA certified travel platform',    color: 'text-orange-500', bg: 'bg-orange-50' },
                ].map(({ icon: Icon, text, color, bg }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}><Icon className={color} size={13} /></div>
                    <span className="text-xs text-gray-500 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingReviewPage;