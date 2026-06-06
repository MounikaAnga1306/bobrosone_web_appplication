// src/modules/flights/pages/PassengerDetailsReviewPage.jsx
//
// Flow:
//   1. Receives pnrRequestBody from BookingReviewPage via navigate state
//   2. On mount → calls callPnrAPI(pnrRequestBody)
//   3. Saves response to usePnrStore via setPnrResponse()
//   4. Reads usePnrStore.transformedPnr for display
//   5. "Proceed to Payment" → BillDesk

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import usePnrStore from '../store/usePnrStore';
import { callPnrAPI } from '../services/pnrService';
import { savePnrToStorage } from '../services/paymentConfirmationService';
import { createBillDeskOrder } from '../services/paymentGatewayservices';
import {
  FaArrowLeft, FaPlane, FaSpinner, FaCheckCircle, FaTimesCircle,
  FaExclamationTriangle, FaCopy, FaPrint, FaDownload, FaShare,
  FaUser, FaEnvelope, FaPhone, FaClock,
  FaArrowRight, FaShieldAlt, FaTag, FaReceipt, FaInfoCircle,
  FaPlaneDeparture, FaSuitcase, FaCheck,
} from 'react-icons/fa';

// ── Formatters ────────────────────────────────────────────────────
const fmt = {
  money: (str) => {
    if (!str) return '₹0';
    const num = parseFloat(String(str).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? str : `₹${Math.round(num).toLocaleString('en-IN')}`;
  },
  dateTime: (iso) => {
    if (!iso) return 'N/A';
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch { return iso; }
  },
  date: (iso) => {
    if (!iso) return 'N/A';
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch { return iso; }
  },
  time: (iso) => {
    if (!iso) return '--:--';
    try {
      return new Date(iso).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch { return '--:--'; }
  },
  dur: (mins) => {
    if (!mins) return '—';
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  },
};

const paxLabel = (type) =>
  type === 'ADT' ? 'Adult' : type === 'CNN' ? 'Child' : 'Infant';

// ── Loading screen ────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center max-w-xs w-full">
      <div className="w-16 h-16 border-4 border-[#FD561E] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
      <h2 className="font-black text-gray-800 text-lg mb-1">Creating Your Booking</h2>
      <p className="text-sm text-gray-400">Connecting to airline system...</p>
      <div className="mt-4 space-y-1.5">
        {['Reserving seats...', 'Confirming fare...', 'Generating PNR...'].map((t) => (
          <div key={t} className="flex items-center gap-2 text-xs text-gray-400 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FD561E] animate-pulse" />
            {t}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Error screen ──────────────────────────────────────────────────
const ErrorScreen = ({ message, onBack }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-sm w-full">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <FaTimesCircle className="text-red-500" size={28} />
      </div>
      <h2 className="font-black text-gray-800 text-lg mb-2">Booking Failed</h2>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <button
        onClick={onBack}
        className="w-full bg-[#FD561E] text-white py-3.5 rounded-2xl font-black hover:bg-[#e04e1b] transition-colors"
      >
        ← Go Back
      </button>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────
const PassengerDetailsReviewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Data from BookingReviewPage
  const pnrRequestBody   = state?.pnrRequestBody   ?? null;
  const selectedOutbound = state?.selectedOutbound  ?? null;
  const passengerCounts  = state?.passengerCounts   ?? { ADT: 1, CNN: 0, INF: 0 };
  const selectedFare     = state?.selectedFare      ?? null;
  const tripType         = state?.tripType          ?? 'one-way';

  // PNR store
  const transformedPnr = usePnrStore((s) => s.transformedPnr);
  const rawPnrResponse = usePnrStore((s) => s.rawPnrResponse);
  const isLoading      = usePnrStore((s) => s.isLoading);
  const error          = usePnrStore((s) => s.error);
  const setPnrResponse = usePnrStore((s) => s.setPnrResponse);
  const setLoading     = usePnrStore((s) => s.setLoading);
  const setError       = usePnrStore((s) => s.setError);

  const [snackbar,     setSnackbar]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Call PNR API on mount ─────────────────────────────────────
  useEffect(() => {
    if (transformedPnr) return; // already loaded — don't re-call

    if (!pnrRequestBody) {
      setError('No booking data found. Please go back and try again.');
      return;
    }

    const callPnr = async () => {
      setLoading(true);
      const raw = await callPnrAPI(pnrRequestBody);
      if (raw?.success) {
        setPnrResponse(raw, pnrRequestBody);
        // Save to localStorage BEFORE BillDesk redirect —
        // Zustand store is wiped on page reload.
        savePnrToStorage(raw);
      } else {
        setError(raw?.error ?? 'Booking failed. Please try again.');
      }
    };

    callPnr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ───────────────────────────────────────────────────
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setSnackbar(`${label} copied!`);
    setTimeout(() => setSnackbar(''), 2500);
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const data = JSON.stringify({ transformedPnr, rawPnrResponse }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `booking_${transformedPnr?.universalLocatorCode ?? 'confirmation'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar('Downloaded!');
    setTimeout(() => setSnackbar(''), 2500);
  };

  const handleShare = () => {
    const pnr = transformedPnr?.universalLocatorCode;
    if (navigator.share && pnr) {
      navigator.share({ title: 'Flight Booking', text: `PNR: ${pnr}`, url: window.location.href });
    } else if (pnr) {
      handleCopy(pnr, 'PNR');
    }
  };

  // ── Proceed to Payment (BillDesk) ─────────────────────────────
  const handleProceedToPayment = async () => {
    setIsSubmitting(true);
    try {
      const bookingPayload = {
        contactInfo:   pnrRequestBody?.contactInfo,
        selectedFare,
        paymentMethod: 'Cash',
      };

      const response = await createBillDeskOrder(bookingPayload, {
        pnrNumber:     transformedPnr?.universalLocatorCode,
        totalPrice:    selectedFare?.grandTotal,
        bookingId:     rawPnrResponse?.bookingId,
        bookingStatus: transformedPnr?.status,
      });

      if (!response?.success) throw new Error(response?.message ?? 'Order creation failed');

      const bdorderid       = response.data?.bdorderid;
      const authToken       = response.data?.authToken;
      const transaction_ID  = response.data?.transaction_id;
      const merchantId      = 'HYDBOBROS';

      if (!bdorderid) throw new Error('Order ID missing from response');
      if (!authToken) throw new Error('Auth Token missing from response');

      localStorage.setItem('flight_bd_orderid', transaction_ID);

      sessionStorage.setItem('paymentInitiated', 'true');
      sessionStorage.setItem('pnrNumber', transformedPnr?.universalLocatorCode ?? '');

      const billdeskUrl =
        `https://uat.bobros.co.in/billdesk_flight_checkout.php` +
        `?merchantId=${merchantId}` +
        `&bdorderid=${bdorderid}` +
        `&authToken=${encodeURIComponent(authToken)}`;

      window.location.href = billdeskUrl;
    } catch (err) {
      console.error('Payment initiation failed:', err);
      setSnackbar(`❌ Payment failed: ${err.message}`);
      setTimeout(() => setSnackbar(''), 4000);
      setIsSubmitting(false);
    }
  };

  // ── Guards ────────────────────────────────────────────────────
  if (isLoading) return <LoadingScreen />;
  if (error)     return <ErrorScreen message={error} onBack={() => navigate(-1)} />;
  if (!transformedPnr) return <ErrorScreen message="No booking data found." onBack={() => navigate('/flights')} />;

  const pnr            = transformedPnr.universalLocatorCode;
  const airlineLocator = transformedPnr.providerLocatorCode;
  const { travelers, segments, warnings, status, bookingId } = transformedPnr;
  const isConfirmed = status === 'Active';

  const paxSummary = [
    passengerCounts.ADT > 0 && `${passengerCounts.ADT} Adult${passengerCounts.ADT > 1 ? 's' : ''}`,
    passengerCounts.CNN > 0 && `${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`,
    passengerCounts.INF > 0 && `${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`,
  ].filter(Boolean).join(' · ');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex items-center gap-3 py-3.5">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaArrowLeft size={14} className="text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-gray-900 text-base">Booking Confirmation</h1>
              <p className="text-xs text-gray-400 truncate">
                {selectedOutbound?.from} → {selectedOutbound?.to} · {paxSummary}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                <FaPrint size={13} className="text-gray-600" />
              </button>
              <button onClick={handleDownload} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                <FaDownload size={13} className="text-gray-600" />
              </button>
              <button onClick={handleShare} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                <FaShare size={13} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-5 space-y-4">

        {/* SUCCESS BANNER */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FaCheckCircle size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-xl mb-0.5">Booking Confirmed! 🎉</h2>
              <p className="text-green-100 text-sm">
                Your flight has been successfully booked. A confirmation email has been sent.
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-black ${
              isConfirmed ? 'bg-white/20 text-white' : 'bg-amber-400/20 text-amber-100'
            }`}>
              {isConfirmed ? 'CONFIRMED' : 'PENDING'}
            </div>
          </div>
        </div>

        {/* WARNINGS */}
        {warnings?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaExclamationTriangle className="text-amber-500" size={14} />
              <span className="font-bold text-amber-700 text-sm">Booking Warnings</span>
            </div>
            <div className="space-y-1">
              {warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700">{w.message}</p>
              ))}
            </div>
          </div>
        )}

        {/* BOOKING REFERENCE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaTag className="text-[#FD561E]" size={14} />
            <span className="font-black text-gray-800">Booking Reference</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* PNR */}
            <div className="bg-gradient-to-br from-[#FD561E]/5 to-orange-50 rounded-xl p-4 border border-[#FD561E]/15">
              <div className="text-xs text-gray-400 font-semibold mb-1">PNR / Booking Ref</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-900 tracking-widest font-mono">{pnr ?? 'N/A'}</span>
                {pnr && (
                  <button
                    onClick={() => handleCopy(pnr, 'PNR')}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <FaCopy size={11} className="text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            {/* Airline Locator */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold mb-1">Airline Locator (GDS)</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-700 tracking-widest font-mono">{airlineLocator ?? 'N/A'}</span>
                {airlineLocator && (
                  <button
                    onClick={() => handleCopy(airlineLocator, 'Locator')}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <FaCopy size={11} className="text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            {/* Booking ID */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold mb-1">Internal Booking ID</div>
              <span className="text-2xl font-black text-gray-700 font-mono">{bookingId ?? 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* FLIGHT SEGMENTS */}
        {segments?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaPlaneDeparture className="text-[#FD561E]" size={14} />
              <span className="font-black text-gray-800">Flight Itinerary</span>
            </div>
            <div className="space-y-3">
              {segments.map((seg, idx) => (
                <div key={seg.key || idx} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                        <FaPlane className="text-[#FD561E] rotate-90" size={12} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{seg.carrier}{seg.flightNumber}</div>
                        <div className="text-[11px] text-gray-400">{seg.equipment || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {seg.status && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          seg.status === 'HK' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {seg.status === 'HK' ? '✓ Confirmed' : seg.status}
                        </span>
                      )}
                      {seg.classOfService && (
                        <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          Class {seg.classOfService}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-xl font-black text-gray-900">{seg.origin}</div>
                      <div className="text-sm font-bold text-gray-600">{fmt.time(seg.departureTime)}</div>
                      <div className="text-[11px] text-gray-400">{fmt.date(seg.departureTime)}</div>
                    </div>
                    <div className="flex flex-col items-center px-2">
                      <div className="text-[10px] text-gray-400 font-semibold mb-1">{fmt.dur(seg.flightTime)}</div>
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-px bg-gray-300" />
                        <FaArrowRight className="text-[#FD561E]" size={10} />
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-1">Non-stop</div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-xl font-black text-gray-900">{seg.destination}</div>
                      <div className="text-sm font-bold text-gray-600">{fmt.time(seg.arrivalTime)}</div>
                      <div className="text-[11px] text-gray-400">{fmt.date(seg.arrivalTime)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSENGERS */}
        {travelers?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaUser className="text-[#FD561E]" size={14} />
              <span className="font-black text-gray-800">Passengers</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {travelers.map((t, idx) => (
                <div key={t.key || idx} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-gray-800">{t.firstName} {t.lastName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{paxLabel(t.type)}</div>
                    </div>
                    <div className="w-10 h-10 bg-[#FD561E]/10 rounded-xl flex items-center justify-center">
                      <FaUser className="text-[#FD561E]" size={14} />
                    </div>
                  </div>
                  {t.dob && <div className="text-[11px] text-gray-400">DOB: {fmt.date(t.dob)}</div>}
                  {t.gender && <div className="text-[11px] text-gray-400">Gender: {t.gender === 'M' ? 'Male' : 'Female'}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FARE SUMMARY */}
        {selectedFare && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaReceipt className="text-[#FD561E]" size={14} />
              <span className="font-black text-gray-800">Fare Summary</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-400 font-semibold mb-1">Fare</div>
                <div className="font-bold text-gray-800">{selectedFare.brandName}</div>
                <div className="text-xs text-gray-500">{selectedFare.cabin}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 font-semibold mb-1">Validating Airline</div>
                <div className="font-bold text-gray-800">{selectedFare.validatingAirline || 'AI'}</div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-4 text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                <span>Passenger</span>
                <span className="text-right">Base Fare</span>
                <span className="text-right">Taxes</span>
                <span className="text-right">Total</span>
              </div>
              {selectedFare.passengerBreakdown?.map((pb) => (
                <div key={pb.passengerType} className="grid grid-cols-4 px-4 py-2.5 text-xs border-b border-gray-50 last:border-0">
                  <span className="font-semibold text-gray-700">{paxLabel(pb.passengerType)} ×{pb.quantity}</span>
                  <span className="text-right text-gray-600">₹{(pb.baseFare || 0).toLocaleString('en-IN')}</span>
                  <span className="text-right text-gray-600">₹{(pb.taxes || 0).toLocaleString('en-IN')}</span>
                  <span className="text-right font-bold text-gray-800">₹{(pb.totalFare || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="grid grid-cols-4 px-4 py-3 bg-orange-50 border-t border-[#FD561E]/15">
                <span className="col-span-3 font-black text-gray-800">Grand Total</span>
                <span className="text-right font-black text-[#FD561E]">
                  ₹{(selectedFare.grandTotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Penalties */}
            {(selectedFare.penalties?.cancel || selectedFare.penalties?.change) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {selectedFare.penalties?.cancel && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                    <div className="text-[10px] font-black text-red-600 uppercase tracking-wide mb-1">Cancellation Fee</div>
                    <div className="text-sm font-bold text-gray-800">
                      {selectedFare.penalties.cancel.amount != null
                        ? `₹${selectedFare.penalties.cancel.amount.toLocaleString('en-IN')} / ticket`
                        : 'Non-refundable'}
                    </div>
                  </div>
                )}
                {selectedFare.penalties?.change && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-wide mb-1">Change Fee</div>
                    <div className="text-sm font-bold text-gray-800">
                      {selectedFare.penalties.change.amount != null
                        ? `₹${selectedFare.penalties.change.amount.toLocaleString('en-IN')} + fare diff`
                        : 'Not allowed'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Baggage */}
            <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <FaSuitcase className="text-gray-400" size={12} />
                <span className="text-xs font-bold text-gray-600">Baggage Allowance (Adult)</span>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <div className="text-[10px] text-gray-400">Check-in</div>
                  <div className="font-bold text-gray-800">
                    {selectedFare.baggage?.ADT?.checked?.weight != null
                      ? `${selectedFare.baggage.ADT.checked.weight} kg`
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">Carry-on</div>
                  <div className="font-bold text-gray-800">
                    {selectedFare.baggage?.ADT?.carryOn?.weight != null
                      ? `${selectedFare.baggage.ADT.carryOn.weight} kg`
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT INFO */}
        {pnrRequestBody?.contactInfo && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaPhone className="text-[#FD561E]" size={14} />
              <span className="font-black text-gray-800">Contact Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <FaEnvelope className="text-gray-400 flex-shrink-0" size={13} />
                <div>
                  <div className="text-[10px] text-gray-400">Email</div>
                  <div className="text-sm font-semibold text-gray-800">{pnrRequestBody.contactInfo.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <FaPhone className="text-gray-400 flex-shrink-0" size={13} />
                <div>
                  <div className="text-[10px] text-gray-400">Phone</div>
                  <div className="text-sm font-semibold text-gray-800">
                    +{pnrRequestBody.contactInfo.phone?.countryCode} {pnrRequestBody.contactInfo.phone?.number}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRUST BADGES */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: FaShieldAlt,   text: 'Secure Booking',      color: 'text-green-500',  bg: 'bg-green-50'  },
              { icon: FaCheckCircle, text: 'Instant Confirmation', color: 'text-blue-500',   bg: 'bg-blue-50'   },
              { icon: FaTag,         text: 'Best Fare Guaranteed', color: 'text-purple-500', bg: 'bg-purple-50' },
              { icon: FaInfoCircle,  text: 'IATA Certified',       color: 'text-orange-500', bg: 'bg-orange-50' },
            ].map(({ icon: Icon, text, color, bg }) => (
              <div key={text} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={color} size={13} />
                </div>
                <span className="text-xs text-gray-500 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 font-black rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <FaArrowLeft size={13} /> Back
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 font-black rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <FaPrint size={13} /> Print
          </button>
          <button
            onClick={handleProceedToPayment}
            disabled={isSubmitting}
            className="flex-[2] py-3.5 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-black rounded-2xl shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <><FaSpinner className="animate-spin" size={16} /> Redirecting to Payment...</>
            ) : (
              <>Proceed to Payment · ₹{(selectedFare?.grandTotal || 0).toLocaleString('en-IN')} <FaArrowRight size={14} /></>
            )}
          </button>
        </div>

      </div>

      {/* SNACKBAR */}
      {snackbar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2">
          <FaCheck size={12} className="text-green-400" />
          {snackbar}
        </div>
      )}
    </div>
  );
};

export default PassengerDetailsReviewPage;