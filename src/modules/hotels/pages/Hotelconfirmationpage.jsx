// src/modules/hotels/pages/HotelConfirmationPage.jsx
import React, { useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCheckCircle, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope,
  FaBed, FaHome, FaCopy, FaExclamationTriangle,
  FaCalendarAlt, FaMoon, FaCreditCard, FaShieldAlt, FaBan,
  FaBuilding, FaWifi, FaDownload, FaSpinner,
} from "react-icons/fa";
import { Building2 } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("en-IN").format(Math.round(n ?? 0));
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const fmtDateShort = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const nightsCount = (cin, cout) => { const d = (new Date(cout) - new Date(cin)) / 86400000; return d > 0 ? d : 1; };

const CopyBtn = ({ value }) => {
  const [copied, setCopied] = React.useState(false);
  return (
    <button onClick={() => navigator.clipboard?.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
      className="ml-1 text-gray-400 hover:text-[#FD561E] transition-colors align-middle" title="Copy">
      {copied ? <FaCheckCircle className="w-3 h-3 inline text-green-500" /> : <FaCopy className="w-3 h-3 inline" />}
    </button>
  );
};

/* ─── load html2pdf dynamically ─────────────────────────────────────────── */
const loadHtml2Pdf = () =>
  new Promise((resolve, reject) => {
    if (window.html2pdf) { resolve(window.html2pdf); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    s.onload  = () => resolve(window.html2pdf);
    s.onerror = reject;
    document.head.appendChild(s);
  });

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════ */
const HotelConfirmationPage = () => {
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const voucherRef   = useRef(null);
  const [dlLoading, setDlLoading] = React.useState(false);

  if (!state?.reservation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-4">
        <Building2 className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 text-center">No confirmation data found.</p>
        <button onClick={() => navigate("/hotels")} className="px-5 py-2.5 bg-[#FD561E] text-white rounded-xl font-bold text-sm">Back to Search</button>
      </div>
    );
  }

  const { reservation, hotel, rate, checkinDate, checkoutDate, guests, traveler } = state;

  const resRoot   = reservation?.ReservationResponse || reservation;
  const res       = resRoot?.Reservation || {};
  const receipts  = res?.Receipt || [];
  const offer     = res?.Offer?.[0] || {};
  const price     = offer?.Price || {};

  const supplierR = receipts.find(r => r?.Confirmation?.Locator?.sourceContext === "Supplier");
  const tvptR     = receipts.find(r => r?.Confirmation?.Locator?.locatorType === "PNR Locator" || r?.Confirmation?.Locator?.sourceContext === "Travelport");
  const agencyR   = receipts.find(r => r?.Confirmation?.Locator?.sourceContext === "Agency");

  const confirmNo = supplierR?.Confirmation?.Locator?.value || "—";
  const pnrNo     = tvptR?.Confirmation?.Locator?.value     || "—";
  const agencyNo  = agencyR?.Confirmation?.Locator?.value   || "—";
  const status    = supplierR?.Confirmation?.OfferStatus?.Status || tvptR?.Confirmation?.OfferStatus?.Status || "Confirmed";

  const txtBlks      = offer?.TermsAndConditionsFull?.[0]?.TextBlock || [];
  const getBlock     = (t) => txtBlks.find(b => b.title?.toLowerCase() === t.toLowerCase())?.TextFormatted?.[0]?.value || "";
  const cancelPolicy = getBlock("Cancellation");
  const checkInPolicy = offer?.TermsAndConditionsFull?.[0]?.CheckInOutPolicy || {};
  const warnings     = resRoot?.Result?.Warning || [];

  const total       = price?.TotalPrice || rate?.totalPrice?.amount || 0;
  const base        = price?.Base       || 0;
  const taxes       = price?.TotalTaxes || 0;
  const n           = nightsCount(checkinDate, checkoutDate);
  const p           = hotel?.propertyInfo;
  const image       = p?.imageURLs?.[0]?.url;
  const roomType    = offer?.Product?.[0]?.RoomType || {};
  const bedConfig   = roomType?.RoomCharacteristics?.BedConfiguration?.[0] || {};
  const hotelPhone  = offer?.Product?.[0]?.Telephone?.phoneNumber || p?.phone?.phoneNumber || "";
  const hotelEmail  = offer?.Product?.[0]?.Email?.value || p?.email || "";
  const hotelAddr   = offer?.Product?.[0]?.PropertyAddress?.AddressLine?.[0]
    || [p?.address?.street, p?.address?.city, p?.address?.postalCode].filter(Boolean).join(", ") || "";
  const wifiIncluded = roomType?.RoomCharacteristics?.wifiIncluded === "Yes" || rate?.wifiIncluded;
  const checkInTime  = checkInPolicy?.checkInTime  || "14:00";
  const checkOutTime = checkInPolicy?.checkOutTime || "12:00";
  const bookedOn     = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  /* ── Direct PDF download using html2pdf ── */
  const handleDownload = async () => {
    if (!voucherRef.current) return;
    setDlLoading(true);
    try {
      const html2pdf = await loadHtml2Pdf();

      // Clone the voucher node so we can inject inline styles for PDF
      const clone = voucherRef.current.cloneNode(true);

      // Inject PDF-specific styles into clone
      const styleEl = document.createElement("style");
      styleEl.textContent = `
        * { box-sizing: border-box; font-family: -apple-system, Arial, sans-serif; }
        .no-pdf { display: none !important; }
        body { margin: 0; padding: 0; }
      `;
      clone.insertBefore(styleEl, clone.firstChild);

      const opt = {
        margin:      [8, 8, 8, 8],
        filename:    `BOBROS-Hotel-${confirmNo}.pdf`,
        image:       { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false },
        jsPDF:       { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak:   { mode: ["avoid-all", "css"] },
      };

      await html2pdf().set(opt).from(voucherRef.current).save();
    } catch (err) {
      console.error("PDF error:", err);
      // Fallback: open print dialog
      window.print();
    } finally {
      setDlLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 space-y-4">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/hotels")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FD561E] transition-colors font-medium">
            <FaHome className="w-3.5 h-3.5" /> Back to Hotels
          </button>
          <button onClick={handleDownload} disabled={dlLoading}
            className="flex items-center gap-2 bg-[#FD561E] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#e04419] transition-colors shadow-sm disabled:opacity-60">
            {dlLoading
              ? <><FaSpinner className="w-3.5 h-3.5 animate-spin" /> Generating...</>
              : <><FaDownload className="w-3.5 h-3.5" /> Download PDF</>}
          </button>
        </div>

        {/* Warning */}
        {warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <FaExclamationTriangle className="text-amber-500 w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">{warnings[0]?.Message}</p>
          </div>
        )}

        {/* ════ VOUCHER (this div gets converted to PDF) ════ */}
        <div ref={voucherRef} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-5 sm:px-6 py-4 border-b-2 border-[#FD561E]">
            <div>
              <div className="text-xl font-black tracking-tight">
                <span className="text-[#FD561E]">BOBROS</span>
                <span className="text-gray-900"> Hotels</span>
              </div>
              <div className="text-xs text-gray-400">Hotel Booking Voucher</div>
            </div>
            <div className="sm:text-right text-xs text-gray-500 space-y-0.5">
              <div>Booking ID: <strong className="text-gray-800">{confirmNo}</strong></div>
              <div>PNR: <strong className="text-gray-800">{pnrNo}</strong></div>
              <div className="text-gray-400">Booked on {bookedOn}</div>
            </div>
          </div>

          {/* Confirmed banner */}
          <div className="bg-green-50 border-b border-green-100 px-5 sm:px-6 py-3 flex items-center gap-3">
            <FaCheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-green-800">Your Booking is Confirmed</span>
                <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>
              </div>
              <div className="text-xs text-green-700 mt-0.5">
                Confirmation sent to <strong>{traveler?.email}</strong>
              </div>
            </div>
          </div>

          {/* Booking References */}
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Hotel Conf. No.", value: confirmNo, border: "border-[#FD561E]", bg: "bg-orange-50", color: "text-[#FD561E]" },
                { label: "PNR / TVPT",      value: pnrNo,     border: "border-blue-200",  bg: "bg-blue-50",   color: "text-blue-700" },
                { label: "Agency Ref.",     value: agencyNo,  border: "border-gray-200",  bg: "bg-gray-50",   color: "text-gray-800" },
              ].map(({ label, value, border, bg, color }) => (
                <div key={label} className={`${bg} border ${border} rounded-xl p-2.5 text-center`}>
                  <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</div>
                  <div className={`text-xs sm:text-sm font-black ${color} break-all`}>
                    {value}
                    <span className="no-pdf"><CopyBtn value={value} /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hotel Details */}
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Hotel Details</div>
            <div className="flex gap-3">
              {image && (
                <img src={image} alt={hotel?.name} crossOrigin="anonymous"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                  onError={e => { e.target.style.display = "none"; }} />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-black text-gray-900 text-base">{hotel?.name}</div>
                {hotelAddr && (
                  <div className="flex items-start gap-1 text-xs text-gray-500 mt-1">
                    <FaMapMarkerAlt className="text-[#FD561E] w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>{hotelAddr}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 mt-1.5">
                  {hotelPhone && <span className="flex items-center gap-1 text-xs text-gray-500"><FaPhone className="w-2.5 h-2.5 text-gray-400" /> {hotelPhone}</span>}
                  {hotelEmail && <span className="flex items-center gap-1 text-xs text-gray-500"><FaEnvelope className="w-2.5 h-2.5 text-gray-400" /> {hotelEmail}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Stay Details</div>
            <div className="grid grid-cols-[1fr_72px_1fr] gap-3 items-center mb-4">
              <div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                  <FaCalendarAlt className="w-2.5 h-2.5" /> Check-in
                </div>
                <div className="text-base font-black text-gray-900">{fmtDateShort(checkinDate)}</div>
                <div className="text-xs text-gray-500">{fmtDate(checkinDate).split(",")[0]}</div>
                <div className="text-xs text-[#FD561E] font-semibold mt-0.5">After {checkInTime}</div>
              </div>
              <div className="text-center border border-gray-200 rounded-xl py-2 px-1 bg-gray-50">
                <FaMoon className="w-3 h-3 text-gray-400 mx-auto mb-1" />
                <div className="text-xl font-black text-gray-900 leading-none">{n}</div>
                <div className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Night{n > 1 ? "s" : ""}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wide mb-1 justify-end">
                  <FaCalendarAlt className="w-2.5 h-2.5" /> Check-out
                </div>
                <div className="text-base font-black text-gray-900">{fmtDateShort(checkoutDate)}</div>
                <div className="text-xs text-gray-500">{fmtDate(checkoutDate).split(",")[0]}</div>
                <div className="text-xs text-[#FD561E] font-semibold mt-0.5">Before {checkOutTime}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                [FaBed, "text-[#FD561E]", `${guests?.rooms || 1} Room${(guests?.rooms||1)>1?"s":""}`],
                [FaUser, "text-[#FD561E]", `${guests?.adults || 1} Adult${(guests?.adults||1)>1?"s":""}`],
                ...(bedConfig.bedType ? [[FaBed, "text-gray-400", `${bedConfig.quantity} × ${bedConfig.bedType}`]] : []),
                ...(wifiIncluded ? [[FaWifi, "text-blue-500", "Free WiFi"]] : []),
              ].map(([Icon, iconCls, text], i) => (
                <span key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-medium">
                  <Icon className={`${iconCls} w-3 h-3`} /> {text}
                </span>
              ))}
            </div>
          </div>

          {/* Guest Details */}
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Primary Guest</div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                <FaUser className="text-[#FD561E] w-4 h-4" />
              </div>
              <div>
                <div className="font-black text-gray-900 text-sm sm:text-base">
                  {traveler?.prefix} {traveler?.given} {traveler?.surname}
                </div>
                <div className="flex flex-wrap gap-3 mt-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500"><FaEnvelope className="w-3 h-3 text-gray-400" /> {traveler?.email}</span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500"><FaPhone className="w-3 h-3 text-gray-400" /> +91 {traveler?.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Price Summary</div>
            <div className="space-y-2">
              {base > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Base Rate ({n} night{n > 1 ? "s" : ""})</span><span>₹{fmt(base)}</span>
                </div>
              )}
              {taxes > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Taxes & Fees</span><span>₹{fmt(taxes)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-100 pt-2.5">
                <span>Total Paid</span>
                <span className="text-[#FD561E]">₹{fmt(total)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
              <FaCreditCard className="w-3 h-3" /> Charged via Travelport GDS
            </div>
          </div>

          {/* Cancellation */}
          {cancelPolicy && (
            <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Cancellation Policy</div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <FaBan className="text-amber-500 w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">{cancelPolicy}</p>
              </div>
            </div>
          )}

          {/* Important Info */}
          <div className="bg-gray-50 px-5 sm:px-6 py-4 border-b border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Important Information</div>
            <ul className="space-y-2">
              {[
                [FaShieldAlt,    "Passport, Aadhaar, Driving License or Govt. ID accepted as ID proof at check-in."],
                [FaBuilding,     "Please carry a printout of this voucher and present at the hotel front desk."],
                [FaCheckCircle,  "Your booking is CONFIRMED. You are not required to reconfirm with the hotel."],
                [FaPhone,        "Contact the hotel directly for early check-in or special requests."],
              ].map(([Icon, text], i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <Icon className="w-3 h-3 text-[#FD561E] flex-shrink-0 mt-0.5" /> {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-[#FD561E] px-5 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-[#FD561E] text-sm">BOBROS Travel</span>
              <span className="text-xs text-gray-400">· bobros.co.in · Powered by Travelport GDS</span>
            </div>
            <span className="text-[10px] text-gray-400">Computer generated voucher · No signature required</span>
          </div>

        </div>

        {/* Bottom action buttons */}
        <div className="grid grid-cols-2 gap-3 pb-8">
          <button onClick={() => navigate("/hotels")}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm">
            <FaHome className="w-3.5 h-3.5 text-[#FD561E]" /> Book Another
          </button>
          <button onClick={handleDownload} disabled={dlLoading}
            className="flex items-center justify-center gap-2 bg-[#FD561E] text-white py-3 rounded-xl font-bold text-sm shadow hover:bg-[#e04419] transition-colors disabled:opacity-60">
            {dlLoading
              ? <><FaSpinner className="w-3.5 h-3.5 animate-spin" /> Generating...</>
              : <><FaDownload className="w-3.5 h-3.5" /> Download PDF</>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default HotelConfirmationPage;