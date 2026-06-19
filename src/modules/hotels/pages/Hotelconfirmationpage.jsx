// src/modules/hotels/pages/HotelConfirmationPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCheckCircle, FaMapMarkerAlt, FaUser,
  FaPhone, FaEnvelope, FaBed, FaPrint, FaHome,
  FaCopy,
} from "react-icons/fa";
import { Building2 } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("en-IN").format(Math.round(n ?? 0));

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

const nights = (cin, cout) => {
  const d = (new Date(cout) - new Date(cin)) / 86400000;
  return d > 0 ? d : 1;
};

/* ─── copy to clipboard helper ───────────────────────────────────────────── */
const CopyBtn = ({ value }) => {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={copy}
      className="text-gray-400 hover:text-[#FD561E] transition-colors ml-1"
      title="Copy">
      {copied ? "✓" : <FaCopy className="w-3 h-3 inline" />}
    </button>
  );
};

const HotelConfirmationPage = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();

  if (!state?.reservation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <Building2 className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 text-center">No confirmation data found.</p>
        <button onClick={() => navigate("/hotels")}
          className="px-5 py-2.5 bg-[#FD561E] text-white rounded-xl font-bold text-sm hover:bg-[#e54d1a]">
          Back to Search
        </button>
      </div>
    );
  }

  const { reservation, hotel, rate, checkinDate, checkoutDate, guests, traveler } = state;

  /* ── parse reservation response ── */
  const res      = reservation?.ReservationResponse?.Reservation || reservation?.Reservation || {};
  const receipts = res?.Receipt || [];
  const offer    = res?.Offer?.[0] || {};
  const price    = offer?.Price   || {};

  const supplierR = receipts.find(r => r?.Confirmation?.Locator?.sourceContext === "Supplier");
  const tvptR     = receipts.find(r => r?.Confirmation?.Locator?.locatorType   === "PNR Locator");
  const agencyR   = receipts.find(r => r?.Confirmation?.Locator?.sourceContext  === "Agency");

  const confirmNo = supplierR?.Confirmation?.Locator?.value || "—";
  const pnrNo     = tvptR?.Confirmation?.Locator?.value     || "—";
  const agencyNo  = agencyR?.Confirmation?.Locator?.value   || "—";
  const status    = supplierR?.Confirmation?.OfferStatus?.Status || "Confirmed";

  // terms blocks
  const txtBlks   = offer?.TermsAndConditionsFull?.[0]?.TextBlock || [];
  const getBlock  = (t) =>
    txtBlks.find(b => b.title?.toLowerCase() === t.toLowerCase())
           ?.TextFormatted?.[0]?.value || "";
  const cancelPolicy = getBlock("Cancellation");

  const total  = price?.TotalPrice   || rate?.totalPrice?.amount || 0;
  const base   = price?.Base         || 0;
  const taxes  = price?.TotalTaxes   || 0;
  const n      = nights(checkinDate, checkoutDate);
  const p      = hotel?.propertyInfo;
  const image  = p?.imageURLs?.[0]?.url;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-xl mx-auto">

        {/* ── Success banner ── */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <FaCheckCircle className="w-9 h-9 text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Booking Confirmed!</h1>
          <p className="text-sm text-gray-500 mt-1">
            Confirmation sent to <strong>{traveler?.email}</strong>
          </p>
        </div>

        {/* ── Reference numbers ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Booking Reference
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { label: "Hotel Conf.",   value: confirmNo, bg: "bg-[#FD561E]/5",  color: "text-[#FD561E]" },
              { label: "PNR / TVPT",    value: pnrNo,     bg: "bg-blue-50",      color: "text-blue-600" },
              { label: "Agency Ref.",   value: agencyNo,  bg: "bg-gray-50",      color: "text-gray-700" },
            ].map(({ label, value, bg, color }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</div>
                <div className={`text-base font-black ${color} break-all`}>
                  {value}
                  {value !== "—" && <CopyBtn value={value} />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-center">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              ✓ {status}
            </span>
          </div>
        </div>

        {/* ── Hotel card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          {image && (
            <div className="h-32 sm:h-40 overflow-hidden">
              <img src={image} alt={hotel?.name} className="w-full h-full object-cover"
                onError={e => { e.target.style.display = "none"; }} />
            </div>
          )}
          <div className="p-4">
            <h2 className="font-black text-gray-900 text-base mb-1">{hotel?.name}</h2>
            {p?.address && (
              <div className="flex items-start gap-1 text-xs text-gray-500 mb-4">
                <FaMapMarkerAlt className="text-[#FD561E] w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>{[p.address.street, p.address.city, p.address.postalCode].filter(Boolean).join(", ")}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {[
                { label: "Check-in",  val: checkinDate,  sub: "3:00 PM" },
                { label: "Check-out", val: checkoutDate, sub: "12:00 PM" },
              ].map(({ label, val, sub }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-2.5">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase mb-0.5">{label}</div>
                  <div className="text-xs font-bold text-gray-800">{fmtDate(val)}</div>
                  <div className="text-[10px] text-gray-400">{sub}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span><FaBed className="inline text-[#FD561E] mr-1" />{guests?.rooms} Room{guests?.rooms > 1 ? "s" : ""}</span>
              <span><FaUser className="inline text-[#FD561E] mr-1" />{guests?.adults} Adult{guests?.adults > 1 ? "s" : ""}</span>
              <span>{n} Night{n > 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        {/* ── Guest info ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Guest</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <FaUser className="text-[#FD561E] w-3.5 h-3.5 flex-shrink-0" />
              {traveler?.prefix} {traveler?.given} {traveler?.surname}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaEnvelope className="text-gray-400 w-3.5 h-3.5 flex-shrink-0" />
              {traveler?.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaPhone className="text-gray-400 w-3.5 h-3.5 flex-shrink-0" />
              +91 {traveler?.phone}
            </div>
          </div>
        </div>

        {/* ── Price summary ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Price Summary</h2>
          <div className="space-y-2">
            {base > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Base Rate</span><span>₹{fmt(base)}</span>
              </div>
            )}
            {taxes > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Taxes & Fees</span><span>₹{fmt(taxes)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-100 pt-2">
              <span>Total Paid</span>
              <span className="text-[#FD561E]">₹{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* ── Cancellation ── */}
        {cancelPolicy && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4 text-xs text-amber-700">
            <p className="font-semibold mb-1">⚠ Cancellation Policy</p>
            <p className="leading-relaxed">{cancelPolicy}</p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm">
            <FaPrint className="w-3.5 h-3.5" /> Print
          </button>
          <button onClick={() => navigate("/hotels")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all">
            <FaHome className="w-3.5 h-3.5" /> Book Another
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelConfirmationPage;