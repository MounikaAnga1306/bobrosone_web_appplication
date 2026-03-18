import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ─────────────────────────────────────────────────────────────
// Helper: parse cancellationCharges / fares from API response
// Handles both array and single-object entry shapes
// ─────────────────────────────────────────────────────────────
const parseEntries = (obj) => {
  if (!obj) return {};
  const entries = Array.isArray(obj.entry)
    ? obj.entry
    : obj.entry
    ? [obj.entry]
    : [];
  return entries.reduce((acc, e) => {
    acc[String(e.key)] = e.value;
    return acc;
  }, {});
};

const CancelTicketPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;

  const { ticket, mobile, email, fullResponse = {} } = location.state || {};

  // ── Parse API response ────────────────────────────────────────
  const cancellationData    = fullResponse?.cancellationData || fullResponse?.data || {};
  const bookingInfo         = fullResponse?.booking || fullResponse?.bookingInfo || {};
  const cancellable         = cancellationData?.cancellable !== "false";
  const partiallyCancellable = cancellationData?.partiallyCancellable !== "false";
  const serviceCharge       = Number(cancellationData?.serviceCharge ?? 0);
  const rtoCancellationFee  = Number(cancellationData?.rtoCancellationFee ?? 0);

  const cancelChargesMap = useMemo(() => parseEntries(cancellationData?.cancellationCharges), [cancellationData]);
  const faresMap         = useMemo(() => parseEntries(cancellationData?.fares), [cancellationData]);
  const allSeats         = useMemo(() => Object.keys(faresMap), [faresMap]);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [message, setMessage]             = useState({ type: "", text: "" });
  const [cancelled, setCancelled]         = useState(false);

  const toggleSeat = (seatKey) => {
    if (!partiallyCancellable && selectedSeats.length > 0 && !selectedSeats.includes(seatKey)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatKey) ? prev.filter((s) => s !== seatKey) : [...prev, seatKey]
    );
  };

  const refundSummary = useMemo(() => {
    const totalFare = selectedSeats.reduce((sum, k) => sum + Number(faresMap[k] ?? 0), 0);
    const totalCancelCharge = selectedSeats.reduce((sum, k) => sum + Number(cancelChargesMap[k] ?? 0), 0);
    const serviceTaxOnCancel = Math.round(totalCancelCharge * 0.18);
    const svcCharge = selectedSeats.length > 0 ? serviceCharge : 0;
    const refund = Math.max(totalFare - totalCancelCharge - serviceTaxOnCancel - svcCharge, 0);
    return { totalFare, totalCancelCharge, serviceTaxOnCancel, svcCharge, refund };
  }, [selectedSeats, faresMap, cancelChargesMap, serviceCharge]);

  const handleCancel = async () => {
    if (selectedSeats.length === 0) {
      setMessage({ type: "error", text: "Please select at least one seat to cancel." });
      return;
    }
    const confirmed = window.confirm(
      `Cancel seat(s) ${selectedSeats.join(", ")}?\nRefund of ₹${refundSummary.refund} will be processed.`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const res = await axios.post(`${API}/cancel/ticket`, {
        tin: ticket,
        seatsToCancel: selectedSeats,
      });
      setMessage({
        type: "success",
        text: res.data?.message || "Seats cancelled successfully. Refund in 5–7 business days.",
      });
      setCancelled(true);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Cancellation failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No booking details found.</p>
          <button onClick={() => navigate("/")} className="bg-red-600 text-white px-6 py-2 rounded-lg">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Totals for initial display (no seats selected)
  const totalFareAll = Object.values(faresMap).reduce((s, v) => s + Number(v), 0);
  const totalCancelAll = Object.values(cancelChargesMap).reduce((s, v) => s + Number(v), 0);

  return (
    // ✅ No fixed positioning anywhere — pure normal document flow
    <div className="min-h-screen bg-white mt-20 flex flex-col">

      {/* ── Orange Header ─────────────────────────────────────── */}
      <div className="bg-[#F05A28] px-4 py-4 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="text-white text-xl leading-none">←</button>
        <h1 className="text-white text-lg font-semibold">Cancel Ticket</h1>
      </div>

      {/* ── Scrollable content area ───────────────────────────── */}
      <div className="flex-1 px-4 py-5 space-y-5 max-w-xl mx-auto w-full">

        {/* Passenger Trip Details */}
        <section>
          <h2 className="text-[#F05A28] font-bold text-base mb-2">Passenger Trip Details</h2>
          <div className="border-t border-gray-200 pt-3 space-y-3">
            {(bookingInfo?.source || bookingInfo?.from || bookingInfo?.sourceCity) && (
              <Row
                label="Source and Destination.:"
                value={`${bookingInfo?.source || bookingInfo?.from || bookingInfo?.sourceCity}, ${bookingInfo?.destination || bookingInfo?.to || bookingInfo?.destinationCity || ""}`}
              />
            )}
            <Row label="Booking Id:" value={ticket} />
            <Row label="Booking Date:" value={bookingInfo?.bookingDate || bookingInfo?.bookedOn || "N/A"} />
            <Row label="Journey Date:" value={bookingInfo?.journeyDate || bookingInfo?.doj || bookingInfo?.travelDate || "N/A"} />
          </div>
        </section>

        {/* Seats & Fare Details */}
        <section>
          <h2 className="text-[#F05A28] font-bold text-base mb-2">Seats & Fare Details</h2>
          <div className="border-t border-gray-200 pt-3 space-y-3">
            <Row label="Seat Numbers:" value={allSeats.join(", ") || "N/A"} />
            <Row label="Fare:" value={totalFareAll.toFixed(2)} />
            <Row label="Cancellation Charges:" value={totalCancelAll.toFixed(2)} />
          </div>
        </section>

        {/* Refund Summary */}
        <section>
          <h2 className="text-[#F05A28] font-bold text-base mb-2">Refund Summary</h2>
          <div className="border-t border-gray-200 pt-3 space-y-3">
            {selectedSeats.length > 0 ? (
              <>
                <Row label="Cancellation Charge:" value={`₹${refundSummary.totalCancelCharge.toFixed(2)}`} />
                <Row label="Service Tax On Cancellation Charge:" value={`₹${refundSummary.serviceTaxOnCancel.toFixed(2)}`} />
                <Row label="Service Charge:" value={`₹${refundSummary.svcCharge}`} />
                {rtoCancellationFee > 0 && (
                  <Row label="RTO Cancellation Fee:" value={`₹${rtoCancellationFee}`} />
                )}
                <Row label="Refund Amount:" value={`₹${refundSummary.refund.toFixed(2)}`} valueClass="text-green-600 font-bold text-base text-right" />
              </>
            ) : (
              <>
                <Row label="Cancellation Charge:" value={`₹${totalCancelAll.toFixed(2)}`} />
                <Row label="Service Tax On Cancellation Charge:" value="₹0.00" />
                <Row label="Service Charge:" value={`₹${serviceCharge}`} />
                {rtoCancellationFee > 0 && (
                  <Row label="RTO Cancellation Fee:" value={`₹${rtoCancellationFee}`} />
                )}
                <Row label="Refund Amount:" value={`₹${totalFareAll.toFixed(2)}`} valueClass="text-green-600 font-bold text-base text-right" />
              </>
            )}
          </div>
        </section>

        {/* Select Seats to Cancel */}
        {!cancelled && (
          <section>
            <h2 className="text-[#F05A28] font-bold text-base mb-2">Select Seats to Cancel</h2>
            <div className="border-t border-gray-200 pt-3">
              {!cancellable ? (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                  ⚠️ This ticket is not cancellable.
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    Please select the seat numbers you wish to cancel.
                  </p>
                  {!partiallyCancellable && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                      ⚠️ Partial cancellation is not allowed. All seats will be cancelled together.
                    </p>
                  )}
                  <div className="space-y-3">
                    {allSeats.map((seatKey) => {
                      const cancelCharge = Number(cancelChargesMap[seatKey] ?? 0);
                      const isSelected   = selectedSeats.includes(seatKey);
                      return (
                        <label
                          key={seatKey}
                          className="flex items-center gap-3 cursor-pointer select-none"
                          onClick={() => cancellable && toggleSeat(seatKey)}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected ? "bg-[#F05A28] border-[#F05A28]" : "border-gray-400 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none">
                                <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm text-gray-700">
                            Seat: {seatKey} | Charge: ₹{cancelCharge.toFixed(2)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Status message */}
        {message.text && (
          <div
            className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            <span>{message.type === "success" ? "✅" : "⚠️"}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* ✅ Cancel button — inline in normal flow, NOT fixed */}
        <div className="pt-2 pb-6">
          {!cancelled ? (
            <button
              onClick={handleCancel}
              disabled={loading || !cancellable || selectedSeats.length === 0}
              className="w-full text-white font-bold py-4 rounded-2xl transition-all text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #F05A28, #fb923c)" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Processing…
                </>
              ) : (
                <>
                  <span className="text-base">✕</span>
                  {selectedSeats.length === 0
                    ? "Cancel Ticket"
                    : `Cancel Ticket · Refund ₹${refundSummary.refund.toFixed(2)}`}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 rounded-2xl text-sm"
            >
              Back to Home
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

// Reusable row
const Row = ({ label, value, valueClass = "text-gray-800 font-medium text-right" }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-gray-500 text-sm flex-shrink-0">{label}</span>
    <span className={`text-sm ${valueClass}`}>{value}</span>
  </div>
);

export default CancelTicketPage;