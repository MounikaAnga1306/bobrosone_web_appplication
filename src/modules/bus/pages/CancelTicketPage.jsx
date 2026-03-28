import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ─────────────────────────────────────────────────────────────
// Helper: parse cancellationCharges / fares from API response
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

// ─────────────────────────────────────────────────────────────
// Helper: build seat → passenger name map from ALL known shapes
// ─────────────────────────────────────────────────────────────
const buildSeatPassengerMap = (fullResponse, cancellationData) => {
  const map = {};

  // Shape 1: cancellationData.inventoryItems
  const inv = cancellationData?.inventoryItems;
  if (inv) {
    const items = Array.isArray(inv) ? inv : [inv];
    items.forEach((item) => {
      const seat = String(item.seatName || item.seat || item.seatno || "").trim();
      const pax = item.passenger || item;
      const name = pax?.name || pax?.pname || "";
      if (seat && name) map[seat] = name;
    });
  }

  // Shape 2: fullResponse.booking / bookingInfo passengers
  const bk = fullResponse?.booking || fullResponse?.bookingInfo || {};
  const paxArr = bk?.passengers || bk?.inventoryItems || fullResponse?.passengers || [];
  if (Array.isArray(paxArr)) {
    paxArr.forEach((p) => {
      const seat = String(p.seatName || p.seat || p.seatno || "").trim();
      const name = p.name || p.pname || p.passenger?.name || "";
      if (seat && name) map[seat] = name;
    });
  }

  return map;
};

// ─────────────────────────────────────────────────────────────
// Helper: extract date
// ─────────────────────────────────────────────────────────────
const extractDate = (obj, ...keys) => {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k];
    if (v && v !== "N/A" && v !== "null" && v !== "undefined") return v;
  }
  return null;
};

const formatDisplayDate = (val) => {
  if (!val) return "N/A";
  if (isNaN(Date.parse(val)) === false) {
    try {
      return new Date(val).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      });
    } catch { return val; }
  }
  return val;
};

const CancelTicketPage = () => {
  const location = useLocation();
  const { ticket, fullResponse = {} } = location.state || {};
  const navigate = useNavigate();
  const [printData, setPrintData] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  
  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        const res = await axios.get(`/printTicket?tin=${ticket}`);
        if (res.data?.success) {
          setPrintData(res.data?.data || res.data);
        }
      } catch (err) {
        console.error("Print API failed", err);
      }
    };

    if (ticket) {
      fetchPrintData();
    }
  }, [ticket]);
  
  const API = import.meta.env.VITE_API_BASE_URL;

  // ── Parse API response ────────────────────────────────────
  const cancellationData     = fullResponse?.cancellationData || fullResponse?.data || {};
  const bookingInfo          = fullResponse?.booking || fullResponse?.bookingInfo || fullResponse?.data || {};
  const cancellable          = cancellationData?.cancellable !== "false";
  const partiallyCancellable = cancellationData?.partiallyCancellable !== "false";
  const serviceCharge        = Number(cancellationData?.serviceCharge ?? 0);
  const rtoCancellationFee   = Number(cancellationData?.rtoCancellationFee ?? 0);

  const cancelChargesMap = useMemo(() => parseEntries(cancellationData?.cancellationCharges), [cancellationData]);
  const faresMap         = useMemo(() => parseEntries(cancellationData?.fares), [cancellationData]);
  const allSeats         = useMemo(() => Object.keys(faresMap), [faresMap]);

  const seatPassengerMap = useMemo(
    () => buildSeatPassengerMap(fullResponse, cancellationData),
    [fullResponse, cancellationData]
  );

  const bookingDate = formatDisplayDate(
    extractDate(bookingInfo, "bookingDate", "bookedOn", "bookingTime", "createdAt", "booking_date", "dateOfIssue") ||
    extractDate(fullResponse, "bookingDate", "bookedOn", "booking_date", "dateOfIssue") ||
    extractDate(printData, "bookingDate", "bookedOn","dateOfIssue")
  );

  const journeyDate = formatDisplayDate(
    extractDate(bookingInfo, "journeyDate", "doj", "travelDate", "travel_date", "journey_date", "dateOfJourney") ||
    extractDate(fullResponse, "journeyDate", "doj", "travelDate", "dateOfJourney") ||
    extractDate(printData, "doj","journeyDate", "travelDate")
  );

  const source = extractDate(bookingInfo, "source", "from", "sourceCity", "origin", "fromCity") ||
    extractDate(fullResponse, "source", "from", "sourceCity", "fromCity");

  const destination = extractDate(bookingInfo, "destination", "to", "destinationCity", "toCity") ||
    extractDate(fullResponse, "destination", "to", "destinationCity", "toCity");

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
    const totalFare         = selectedSeats.reduce((sum, k) => sum + Number(faresMap[k] ?? 0), 0);
    const totalCancelCharge = selectedSeats.reduce((sum, k) => sum + Number(cancelChargesMap[k] ?? 0), 0);
    const serviceTaxOnCancel = Math.round(totalCancelCharge * 0.18);
    const svcCharge = selectedSeats.length > 0 ? serviceCharge : 0;
    const refund    = Math.max(totalFare - totalCancelCharge - serviceTaxOnCancel - svcCharge, 0);
    return { totalFare, totalCancelCharge, serviceTaxOnCancel, svcCharge, refund };
  }, [selectedSeats, faresMap, cancelChargesMap, serviceCharge]);

  const handleCancel = () => {
    if (selectedSeats.length === 0) {
      setMessage({ type: "error", text: "Please select at least one seat to cancel." });
      return;
    }
    setConfirmModal(true);
  };
  
  const confirmCancellation = async () => {
    try {
      setLoading(true);
      setConfirmModal(false);

      const res = await axios.post(`${API}/cancel/ticket`, {
        tin: ticket,
        seatsToCancel: selectedSeats,
      });

      setMessage({
        type: "success",
        text: res.data?.message || "Seats cancelled successfully. Refund will be processed in 5–7 business days.",
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

  const totalFareAll   = Object.values(faresMap).reduce((s, v) => s + Number(v), 0);
  const totalCancelAll = Object.values(cancelChargesMap).reduce((s, v) => s + Number(v), 0);

  return (
    <>
      {/* Main Content */}
      <div className={`min-h-screen bg-white mt-20 flex flex-col transition-all duration-300 ${confirmModal ? 'blur-sm' : ''}`}>
        {/* Orange Header */}
        <div className="bg-[#F05A28] px-4 py-4 flex items-center gap-3 flex-shrink-0">
          {/* <button onClick={() => navigate(-1)} className="text-white text-xl leading-none">←</button> */}
          <h1 className="text-white text-2xl font-semibold text-center tracking-tight ml-168">Cancel Ticket</h1>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 px-4 py-5 space-y-5 max-w-xl mx-auto w-full">

          {/* Passenger Trip Details */}
          <section>
            <h2 className="text-[#F05A28] font-bold text-base mb-2">Passenger Trip Details</h2>
            <div className="border-t border-gray-200 pt-3 space-y-3">
              {(source || destination) && (
                <Row label="Source and Destination:" value={`${source || "—"} → ${destination || "—"}`} />
              )}
              <Row label="Booking ID:" value={ticket} />
              <Row label="Booking Date:" value={bookingDate} />
              <Row label="Journey Date:" value={journeyDate} />
            </div>
          </section>

          {/* Seats & Fare Details */}
          <section>
            <h2 className="text-[#F05A28] font-bold text-base mb-2">Seats &amp; Fare Details</h2>
            <div className="border-t border-gray-200 pt-3 space-y-3">
              <Row label="Seat Numbers:" value={allSeats.join(", ") || "N/A"} />
              <Row label="Fare:" value={`₹${totalFareAll.toFixed(2)}`} />
              <Row label="Cancellation Charges:" value={`₹${totalCancelAll.toFixed(2)}`} />
            </div>
          </section>

          {/* Refund Summary */}
          <section>
            <h2 className="text-[#F05A28] font-bold text-base mb-2">Refund Summary</h2>
            <div className="border-t border-gray-200 pt-3 space-y-3">
              {selectedSeats.length > 0 ? (
                <>
                  <Row label="Selected Seats:" value={selectedSeats.map(s => seatPassengerMap[s] ? `${s} (${seatPassengerMap[s]})` : s).join(", ")} />
                  <Row label="Fare for Selected Seats:" value={`₹${refundSummary.totalFare.toFixed(2)}`} />
                  <Row label="Cancellation Charge:" value={`₹${refundSummary.totalCancelCharge.toFixed(2)}`} />
                  <Row label="Service Tax on Cancellation:" value={`₹${refundSummary.serviceTaxOnCancel.toFixed(2)}`} />
                  <Row label="Service Charge:" value={`₹${refundSummary.svcCharge}`} />
                  {rtoCancellationFee > 0 && (
                    <Row label="RTO Cancellation Fee:" value={`₹${rtoCancellationFee}`} />
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <Row label="Refund Amount:" value={`₹${refundSummary.refund.toFixed(2)}`} valueClass="text-green-600 font-bold text-base text-right" />
                  </div>
                </>
              ) : (
                <>
                  <Row label="Cancellation Charge:" value={`₹${totalCancelAll.toFixed(2)}`} />
                  <Row label="Service Tax on Cancellation:" value="₹0.00" />
                  <Row label="Service Charge:" value={`₹${serviceCharge}`} />
                  {rtoCancellationFee > 0 && (
                    <Row label="RTO Cancellation Fee:" value={`₹${rtoCancellationFee}`} />
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <Row label="Refund Amount:" value={`₹${totalFareAll.toFixed(2)}`} valueClass="text-green-600 font-bold text-base text-right" />
                  </div>
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
                    <p className="text-sm text-gray-500 mb-4">Select the seat(s) you wish to cancel.</p>
                    {!partiallyCancellable && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                        ⚠️ Partial cancellation is not allowed. All seats will be cancelled together.
                      </p>
                    )}
                    <div className="space-y-3">
                      {allSeats.map((seatKey) => {
                        const cancelCharge   = Number(cancelChargesMap[seatKey] ?? 0);
                        const fare           = Number(faresMap[seatKey] ?? 0);
                        const passengerName  = seatPassengerMap[seatKey] || "";
                        const isSelected     = selectedSeats.includes(seatKey);

                        return (
                          <label
                            key={seatKey}
                            onClick={() => cancellable && toggleSeat(seatKey)}
                            className={`flex items-center gap-3 cursor-pointer select-none rounded-xl border-2 px-4 py-3 transition-all ${
                              isSelected
                                ? "border-[#F05A28] bg-orange-50"
                                : "border-gray-200 bg-white hover:border-orange-300"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected ? "bg-[#F05A28] border-[#F05A28]" : "border-gray-400 bg-white"
                            }`}>
                              {isSelected && (
                                <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none">
                                  <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-gray-800 text-sm">Seat {seatKey}</span>
                                {passengerName && (
                                  <span className="text-xs bg-orange-100 text-[#F05A28] font-semibold px-2 py-0.5 rounded-full">
                                    👤 {passengerName}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                <span>Fare: <strong className="text-gray-700">₹{fare.toFixed(2)}</strong></span>
                                <span>Cancel Charge: <strong className="text-red-500">₹{cancelCharge.toFixed(2)}</strong></span>
                                <span>Refund: <strong className="text-green-600">₹{Math.max(fare - cancelCharge, 0).toFixed(2)}</strong></span>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="text-xs text-[#F05A28] font-bold flex-shrink-0">Selected</span>
                            )}
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
            <div className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2 ${
              message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"
            }`}>
              <span>{message.type === "success" ? "✅" : "⚠️"}</span>
              <span>{message.text}</span>
            </div>
          )}

          {/* Cancel button */}
          <div className="pt-2 pb-6">
            {!cancelled ? (
              <button
                onClick={handleCancel}
                disabled={loading || !cancellable || selectedSeats.length === 0}
                className="w-full text-white font-bold cursor-pointer py-4 rounded-2xl transition-all text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #F05A28, #fb923c)" }}
              >
                {loading ? (
                  <>Processing…</>
                ) : (
                  <>
                    <span className="text-base">✕</span>
                    {selectedSeats.length === 0
                      ? "Select Seats to Cancel"
                      : `Cancel ${selectedSeats.length} Seat${selectedSeats.length > 1 ? "s" : ""} · Refund ₹${refundSummary.refund.toFixed(2)}`}
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

      {/* ==================== CONFIRMATION MODAL (Only Background Changed) ==================== */}
      {confirmModal && (
        <>
          {/* Changed Background - Light Dark Overlay (No heavy blur) */}
          <div className="fixed inset-0 bg-black/50 z-40" />
          
          {/* Your Existing Modal - Unchanged */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl">
              
              {/* Modal Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Confirm Cancellation</h3>
              </div>
              
              {/* Modal Body - Your original content */}
              <div className="px-6 py-4">
                <div className="mb-4">
                  <p className="text-gray-600 mb-3">
                    Are you sure you want to cancel the following seat(s)?
                  </p>
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <p className="font-semibold text-gray-800 mb-2">Selected Seats:</p>
                    <div className="space-y-2">
                      {selectedSeats.map(seat => (
                        <div key={seat} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-700">Seat {seat}</span>
                          {seatPassengerMap[seat] && (
                            <span className="text-xs bg-white px-2 py-1 rounded-full text-[#F05A28]">
                              {seatPassengerMap[seat]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="font-semibold text-gray-800 mb-2">Refund Summary:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fare:</span>
                      <span className="font-medium">₹{refundSummary.totalFare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cancellation Charge:</span>
                      <span className="font-medium text-red-600">- ₹{refundSummary.totalCancelCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Tax:</span>
                      <span className="font-medium text-red-600">- ₹{refundSummary.serviceTaxOnCancel.toFixed(2)}</span>
                    </div>
                    {refundSummary.svcCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Charge:</span>
                        <span className="font-medium text-red-600">- ₹{refundSummary.svcCharge}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Refund Amount:</span>
                        <span className="text-green-600">₹{refundSummary.refund.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  ⚠️ Once cancelled, this action cannot be undone. Refund will be processed in 5-7 business days.
                </p>
              </div>
              
              {/* Modal Footer - Your original buttons */}
              <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
                <button
                  onClick={() => setConfirmModal(false)}
                  className="flex-1 px-4 py-2 border cursor-pointer border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  No, Go Back
                </button>
                <button
                  onClick={confirmCancellation}
                  className="flex-1 px-4 py-2 bg-[#fd561e] cursor-pointer text-white rounded-lg transition-colors font-medium"
                >
                  Yes, Cancel {selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
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