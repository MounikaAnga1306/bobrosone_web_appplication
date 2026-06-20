// src/modules/hotels/pages/HotelDetailPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt, FaStar, FaStarHalfAlt, FaRegStar,
  FaWifi, FaUtensils, FaSwimmingPool, FaSpa, FaCar,
  FaDumbbell, FaCheck, FaBan, FaPhone, FaEnvelope,
  FaBed, FaUser, FaChevronLeft, FaChevronRight,
  FaClock, FaCreditCard, FaTimesCircle,
  FaConciergeBell, FaSnowflake, FaCoffee, FaShieldAlt,
  FaChevronDown, FaChevronUp,
} from "react-icons/fa";
import { MdFreeBreakfast, MdRestaurant } from "react-icons/md";
import { Building2, ArrowLeft, X } from "lucide-react";

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmt = (n) => new Intl.NumberFormat("en-IN").format(Math.round(n ?? 0));

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

const nights = (cin, cout) => {
  const d = (new Date(cout) - new Date(cin)) / 86400000;
  return d > 0 ? d : 1;
};

const getStars = (ratings = []) => {
  const ntm   = ratings.find(r => r.provider === "NTM");
  const giata = ratings.find(r => r.provider === "GIATA");
  return ntm?.value || giata?.value || 0;
};

/* ─── amenity icon map ───────────────────────────────────────────────────── */
const AMENITY_MAP = {
  "Outdoor Pool":         { icon: <FaSwimmingPool />, color: "text-blue-500",   bg: "bg-blue-50" },
  "Indoor Pool":          { icon: <FaSwimmingPool />, color: "text-blue-500",   bg: "bg-blue-50" },
  "Pool":                 { icon: <FaSwimmingPool />, color: "text-blue-500",   bg: "bg-blue-50" },
  "High-Speed Internet":  { icon: <FaWifi />,         color: "text-indigo-500", bg: "bg-indigo-50" },
  "WiFI Available":       { icon: <FaWifi />,         color: "text-indigo-500", bg: "bg-indigo-50" },
  "Restaurant":           { icon: <FaUtensils />,     color: "text-orange-500", bg: "bg-orange-50" },
  "Breakfast":            { icon: <MdFreeBreakfast />,color: "text-green-500",  bg: "bg-green-50" },
  "Coffee/Tea":           { icon: <FaCoffee />,       color: "text-amber-600",  bg: "bg-amber-50" },
  "Spa Facilities":       { icon: <FaSpa />,          color: "text-purple-500", bg: "bg-purple-50" },
  "Parking":              { icon: <FaCar />,          color: "text-gray-600",   bg: "bg-gray-50" },
  "Free Parking":         { icon: <FaCar />,          color: "text-green-600",  bg: "bg-green-50" },
  "Air Conditioning":     { icon: <FaSnowflake />,    color: "text-sky-500",    bg: "bg-sky-50" },
  "Fitness Center / Gym": { icon: <FaDumbbell />,     color: "text-red-500",    bg: "bg-red-50" },
  "Concierge Service":    { icon: <FaConciergeBell />,color: "text-yellow-600", bg: "bg-yellow-50" },
  "Room Service":         { icon: <MdRestaurant />,   color: "text-orange-500", bg: "bg-orange-50" },
};
const getAmenityMeta = (cat) =>
  AMENITY_MAP[cat] || { icon: <FaCheck />, color: "text-gray-500", bg: "bg-gray-50" };

/* ─── Stars ──────────────────────────────────────────────────────────────── */
const Stars = ({ value }) => {
  if (!value) return null;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < Math.floor(value))
          return <FaStar key={i} className="text-amber-400 w-3.5 h-3.5" />;
        if (i === Math.floor(value) && value % 1 >= 0.5)
          return <FaStarHalfAlt key={i} className="text-amber-400 w-3.5 h-3.5" />;
        return <FaRegStar key={i} className="text-amber-200 w-3.5 h-3.5" />;
      })}
    </span>
  );
};

/* ─── Collapsible section wrapper ────────────────────────────────────────── */
const Section = ({ title, defaultOpen = false, badge, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 text-left hover:bg-gray-50 transition-colors">
        <span className="flex items-center gap-2 font-bold text-gray-800 text-sm">
          {title}
          {badge != null && (
            <span className="text-[10px] font-semibold bg-[#FD561E]/10 text-[#FD561E] px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </span>
        {open
          ? <FaChevronUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          : <FaChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
      </button>
      {open && <div className="px-4 sm:px-5 pb-4 sm:pb-5">{children}</div>}
    </div>
  );
};

/* ─── Mini image carousel for room types ─────────────────────────────────── */
const RoomPhotoStrip = ({ images }) => {
  const [idx, setIdx] = useState(0);
  if (!images?.length) return null;
  return (
    <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
      <img
        src={images[idx]?.url}
        alt="room"
        className="w-full h-full object-cover"
        onError={e => { e.target.src = "https://via.placeholder.com/300x200?text=Room"; }}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-6 h-6 flex items-center justify-center">
            <FaChevronLeft className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-6 h-6 flex items-center justify-center">
            <FaChevronRight className="w-2.5 h-2.5" />
          </button>
          <div className="absolute bottom-1.5 right-2 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-full">
            {idx + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Image gallery (hero) ───────────────────────────────────────────────── */
const ImageGallery = ({ images, hotelName }) => {
  const [idx, setIdx]   = useState(0);
  const [lb, setLb]     = useState(false);
  if (!images?.length) return (
    <div className="w-full h-48 sm:h-64 bg-gray-100 flex flex-col items-center justify-center text-gray-300">
      <Building2 className="w-12 h-12 mb-2" /><span className="text-sm">No images</span>
    </div>
  );
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);
  return (
    <>
      <div className="relative h-48 sm:h-72 lg:h-96 overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setLb(true)}>
        <img src={images[idx].url} alt={hotelName} className="w-full h-full object-cover"
          onError={e => { e.target.src = "https://via.placeholder.com/800x400?text=No+Image"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {idx + 1} / {images.length}
        </div>
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center">
              <FaChevronLeft className="w-3 h-3" />
            </button>
            <button onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center">
              <FaChevronRight className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-1 sm:gap-1.5 p-1.5 bg-gray-900 overflow-x-auto">
          {images.map((img, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`flex-shrink-0 w-12 h-8 sm:w-14 sm:h-10 rounded overflow-hidden border-2 transition-all ${
                i === idx ? "border-[#FD561E]" : "border-transparent opacity-60 hover:opacity-100"
              }`}>
              <img src={img.url} alt="" className="w-full h-full object-cover"
                onError={e => { e.target.src = "https://via.placeholder.com/56x40?text=X"; }} />
            </button>
          ))}
        </div>
      )}
      {lb && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4" onClick={() => setLb(false)}>
          <button onClick={() => setLb(false)} className="absolute top-4 right-4 text-white">
            <X className="w-7 h-7" />
          </button>
          <img src={images[idx].url} alt={hotelName}
            className="max-h-[80vh] max-w-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
            onError={e => { e.target.src = "https://via.placeholder.com/800x600?text=No+Image"; }} />
          {images.length > 1 && (
            <div className="flex gap-3 mt-4" onClick={e => e.stopPropagation()}>
              <button onClick={prev} className="bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center"><FaChevronLeft /></button>
              <span className="text-white text-sm self-center">{idx + 1} / {images.length}</span>
              <button onClick={next} className="bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center"><FaChevronRight /></button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="animate-pulse space-y-3 py-3">
    {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-200 rounded-2xl" />)}
  </div>
);

/* ─── parse rules ────────────────────────────────────────────────────────── */
const parseRules = (rulesData) => {
  if (!rulesData) return null;
  const offer   = rulesData?.OfferHospitalityResponse?.Offer || {};
  const product = offer?.Product?.[0] || {};
  const price   = offer?.Price || {};
  const terms   = offer?.TermsAndConditionsFull?.[0] || {};
  const txtBlks = terms?.TextBlock || [];
  const getBlock = (title) =>
    txtBlks.find(b => b.title?.toLowerCase() === title.toLowerCase())
           ?.TextFormatted?.[0]?.value || "";
  const nightlyBreakdown = price?.PriceBreakdown?.find(pb => pb.roomPricingType === "Per night");
  const nightlyRates     = nightlyBreakdown?.NightlyRate || [];
  const cancelPenalty    = terms?.CancelPenalty?.[0] || null;
  const cancelDesc       = cancelPenalty?.Description || getBlock("Cancellation") || "";
  const checkPolicy      = terms?.CheckInOutPolicy || {};
  let checkIn  = checkPolicy.checkInTime  || "";
  let checkOut = checkPolicy.checkOutTime || "";
  if (!checkIn && !checkOut) {
    const misc = getBlock("Miscellaneous");
    const inM  = misc.match(/Check In[:\s]+(\d{4})/i);
    const outM = misc.match(/Check Out[:\s]+(\d{4})/i);
    if (inM)  checkIn  = `${inM[1].slice(0,2)}:${inM[1].slice(2)}`;
    if (outM) checkOut = `${outM[1].slice(0,2)}:${outM[1].slice(2)}`;
  }
  return {
    bookingCode:    product.bookingCode || "",
    roomType:       product.RoomType || null,
    price: {
      base:   price.Base || 0,
      taxes:  price.TotalTaxes || 0,
      total:  price.TotalPrice || 0,
    },
    nightlyRates,
    cancelDesc,
    cancelPenalty,
    checkIn,
    checkOut,
    mealsIncluded:  terms?.MealsIncluded || {},
    acceptedCards:  (terms?.AcceptedCreditCard || []).map(c => c.value),
    guarantee:      terms?.Guarantee?.[0]?.guaranteeType || "",
    ratePayment:    terms?.RatePaymentInfo || "",
    extraCharges:   getBlock("Extra charges"),
    rateDesc:       getBlock("Rate description"),
    other_text:     getBlock("Other"),
    phone:          product.Telephone?.phoneNumber || "",
  };
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════ */
const HotelDetailPage = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const [rulesData, setRulesData] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  /* expanded rooms: all open by default */
  const [expandedRooms, setExpandedRooms] = useState({});

  /* ── guard ── */
  if (!state?.hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <Building2 className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500">No hotel data found.</p>
        <button onClick={() => navigate("/hotels/results")}
          className="px-5 py-2.5 bg-[#FD561E] text-white rounded-xl font-bold text-sm">
          Back to Results
        </button>
      </div>
    );
  }

  const { hotel, rate: passedRate, checkinDate, checkoutDate, guests, location: loc, lat, lng } = state;
  const p      = hotel.propertyInfo;
  const stars  = getStars(p?.ratings || []);
  const images = [...(p?.imageURLs || [])];
  const n      = nights(checkinDate, checkoutDate);

  const rateForRules = passedRate || hotel.lowestPublicAvailableRate;
  const rateKey      = rateForRules?.rateKey?.value || "";

  /* ── fetch rules ── */
  useEffect(() => {
    if (!rateKey) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    fetch("https://api.bobros.org/hotel/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rateKey }),
    })
      .then(r => { if (!r.ok) throw new Error(`Rules API error (${r.status})`); return r.json(); })
      .then(data => { setRulesData(data); })
      .catch(err => { setError(err.message); })
      .finally(() => setLoading(false));
  }, [rateKey]);

  /* ── all rooms default expanded ── */
  const roomTypes = hotel.roomTypes || [];
  useEffect(() => {
    if (roomTypes.length > 0) {
      const all = {};
      roomTypes.forEach((_, i) => { all[i] = true; });
      setExpandedRooms(all);
    }
  }, [roomTypes.length]);

  const parsed = parseRules(rulesData);

  /* ── amenities deduped ── */
  const amenities = (() => {
    const seen = new Set(); const result = [];
    for (const a of (p?.amenities || [])) {
      if (!seen.has(a.category)) { seen.add(a.category); result.push(a); }
    }
    return result;
  })();

  /* ── Book Now — direct navigate with that specific rate ── */
  const handleBookNow = (rate) => {
    navigate("/hotels/booking", {
      state: { hotel, rate, rulesData, checkinDate, checkoutDate, guests, location: loc, lat, lng },
    });
  };

  /* ── price from rate object (handles both field shapes) ── */
  const getRatePrice = (r) => ({
    perNight: r.price?.averageNightlyTotalPrice?.amount
      || r.averageNightlyTotalPrice?.amount || 0,
    perNightTax: r.price?.averageNightlyTaxesPrice?.amount
      || r.averageNightlyTaxesPrice?.amount || 0,
    total: r.price?.totalPrice?.amount
      || r.totalPrice?.amount || 0,
  });

  const toggleRoom = (i) =>
    setExpandedRooms(prev => ({ ...prev, [i]: !prev[i] }));

  /* ── sidebar stay info (from rules if available) ── */
  const checkInTime  = parsed?.checkIn  || "14:00";
  const checkOutTime = parsed?.checkOut || "12:00";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky back bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FD561E] transition-colors font-medium flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Results</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          <h1 className="text-sm font-bold text-gray-800 line-clamp-1 flex-1 hidden sm:block">{hotel.name}</h1>
        </div>
      </div>

      {/* ── Gallery ── */}
      <ImageGallery images={images} hotelName={hotel.name} />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* ════ LEFT: main content ════ */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">

            {/* Hotel name / stars / address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">{hotel.name}</h2>
                <Stars value={stars} />
              </div>
              {p?.address && (
                <div className="flex items-start gap-1.5 text-xs sm:text-sm text-gray-600 mb-3">
                  <FaMapMarkerAlt className="text-[#FD561E] w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{[p.address.street, p.address.city, p.address.stateProvince, p.address.postalCode].filter(Boolean).join(", ")}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {(p?.phone?.phoneNumber || parsed?.phone) && (
                  <span className="flex items-center gap-1.5">
                    <FaPhone className="text-[#FD561E] w-3 h-3" />
                    {p?.phone?.phoneNumber || parsed?.phone}
                  </span>
                )}
                {p?.email && (
                  <span className="flex items-center gap-1.5">
                    <FaEnvelope className="text-gray-400 w-3 h-3" />{p.email}
                  </span>
                )}
              </div>
              {p?.distanceFromSearchPoint && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                  📍 {p.distanceFromSearchPoint.value.toFixed(1)} km from search point
                </div>
              )}
              {error && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  ⚠ Could not load rate details: {error}
                </div>
              )}
            </div>

            {/* ── ROOM TYPES — MakeMyTrip style ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-sm">
                  🛏 Select a Room
                </h3>
                {roomTypes.length > 0 && (
                  <span className="text-[10px] font-semibold bg-[#FD561E]/10 text-[#FD561E] px-2 py-0.5 rounded-full">
                    {roomTypes.length} type{roomTypes.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="px-4 py-4"><Skeleton /></div>
              ) : roomTypes.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  No room types available
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {roomTypes.map((rt, ridx) => {
                    const isOpen    = expandedRooms[ridx] !== false; // default true
                    const lowestRate = rt.rates?.[0];
                    const lowestPrice = lowestRate ? getRatePrice(lowestRate) : null;

                    return (
                      <div key={ridx}>
                        {/* ── Room type header ── */}
                        <button
                          onClick={() => toggleRoom(ridx)}
                          className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-800 text-sm truncate">
                              {rt.shortRoomDescription}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-gray-500">
                              {rt.bedTypes?.map((b, i) => (
                                <span key={i} className="flex items-center gap-1">
                                  <FaBed className="text-[#FD561E] w-2.5 h-2.5" />
                                  {b.quantity} × {b.bedType}{b.size && b.size !== "Varies" ? ` (${b.size})` : ""}
                                </span>
                              ))}
                              {rt.view?.description && <span>👁 {rt.view.description}</span>}
                              {rt.maxOccupancy && (
                                <span className="flex items-center gap-1">
                                  <FaUser className="text-gray-400 w-2.5 h-2.5" /> Max {rt.maxOccupancy}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 ml-2 flex-shrink-0">
                            {lowestPrice && lowestPrice.perNight > 0 && (
                              <div className="text-right hidden sm:block">
                                <div className="text-[10px] text-gray-400">from</div>
                                <div className="text-sm font-black text-gray-900">
                                  ₹{fmt(lowestPrice.perNight)}
                                  <span className="text-[10px] font-normal text-gray-400">/night</span>
                                </div>
                              </div>
                            )}
                            {isOpen
                              ? <FaChevronUp className="w-3.5 h-3.5 text-gray-400" />
                              : <FaChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                          </div>
                        </button>

                        {/* ── Rate cards (expanded) ── */}
                        {isOpen && (
                          <div className="divide-y divide-gray-50">
                            {rt.rates?.map((r, ri) => {
                              const rp = getRatePrice(r);
                              const hasBreakfast = r.breakfastIncluded
                                || r.rateDescription?.toLowerCase().includes("breakfast");
                              const isRefundable = r.terms?.refundable;

                              return (
                                <div key={ri} className="px-4 sm:px-5 py-4">
                                  {/* Rate card: two-column layout */}
                                  <div className="flex flex-col sm:flex-row gap-4">

                                    {/* LEFT: room photos (only first rate of each room shows photos) */}
                                    {ri === 0 && rt.roomImageURLs?.length > 0 && (
                                      <div className="sm:w-40 lg:w-44 flex-shrink-0">
                                        <RoomPhotoStrip images={rt.roomImageURLs} />
                                      </div>
                                    )}
                                    {/* Spacer if no photos on subsequent rates */}
                                    {ri > 0 && rt.roomImageURLs?.length > 0 && (
                                      <div className="sm:w-40 lg:w-44 flex-shrink-0 hidden sm:block" />
                                    )}

                                    {/* MIDDLE: rate info */}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-gray-800 text-sm mb-2">
                                        {r.rateDescription || r.roomDescription?.split(",")[0] || "Standard Rate"}
                                      </p>

                                      {/* Inclusions pills */}
                                      <div className="flex flex-wrap gap-1.5 mb-3">
                                        {r.wifiIncluded && (
                                          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                                            <FaWifi className="w-2.5 h-2.5" /> WiFi
                                          </span>
                                        )}
                                        {hasBreakfast && (
                                          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                                            <MdFreeBreakfast className="w-3 h-3" /> Breakfast
                                          </span>
                                        )}
                                        {r.nonSmoking && (
                                          <span className="text-[10px] sm:text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                                            🚭 Non-smoking
                                          </span>
                                        )}
                                        {isRefundable && (
                                          <span className="text-[10px] sm:text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                                            ✓ Refundable
                                          </span>
                                        )}
                                        {r.terms?.refundable === false && (
                                          <span className="text-[10px] sm:text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                                            ✕ Non-refundable
                                          </span>
                                        )}
                                      </div>

                                      {/* Bed info line (for non-first rates) */}
                                      {ri > 0 && rt.bedTypes?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-2">
                                          {rt.bedTypes.map((b, bi) => (
                                            <span key={bi} className="flex items-center gap-1">
                                              <FaBed className="text-gray-300 w-3 h-3" />
                                              {b.quantity} × {b.bedType}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* RIGHT: price + book button */}
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:min-w-[130px] flex-shrink-0 gap-2 sm:gap-1.5">
                                      <div className="text-right">
                                        <div className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                                          ₹{fmt(rp.perNight)}
                                        </div>
                                        {rp.perNightTax > 0 && (
                                          <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                            +₹{fmt(rp.perNightTax)} taxes/night
                                          </div>
                                        )}
                                        {rp.total > 0 && (
                                          <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                                            ₹{fmt(rp.total)} total
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => handleBookNow(r)}
                                        className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow hover:shadow-lg transition-all whitespace-nowrap">
                                        Book Now
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Rate Details (from rules) ── */}
            {!loading && parsed && parsed.price.total > 0 && (
              <Section title="💰 Rate Details" defaultOpen={false}
                badge={`₹${fmt(parsed.price.total)}`}>
                {parsed.nightlyRates?.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nightly Rates</div>
                    {parsed.nightlyRates.map((nr, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {fmtDate(nr.startDate)}{nr.nights > 1 && ` (${nr.nights} nights)`}
                        </span>
                        <div className="text-right">
                          <span className="font-semibold text-gray-800">₹{fmt(nr.Amount?.Base)}</span>
                          {nr.Amount?.Taxes?.TotalTaxes > 0 && (
                            <span className="text-xs text-gray-400 ml-1">
                              +₹{fmt(nr.Amount.Taxes.TotalTaxes)} tax
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                  {parsed.price.base > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Base ({n} night{n > 1 ? "s" : ""})</span>
                      <span>₹{fmt(parsed.price.base)}</span>
                    </div>
                  )}
                  {parsed.price.taxes > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Taxes & Fees</span><span>₹{fmt(parsed.price.taxes)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-[#FD561E]">₹{fmt(parsed.price.total)}</span>
                  </div>
                </div>
                {parsed.extraCharges && (
                  <p className="text-xs text-gray-400 mt-2">ℹ {parsed.extraCharges}</p>
                )}
                {parsed.other_text && (
                  <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-1.5">{parsed.other_text}</p>
                )}
              </Section>
            )}

            {/* ── Policies ── */}
            {!loading && parsed && (
              <Section title="📋 Policies" defaultOpen={false}>
                {(parsed.checkIn || parsed.checkOut) && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {parsed.checkIn && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                          <FaClock className="text-[#FD561E]" /> Check-in
                        </div>
                        <div className="text-sm font-bold text-gray-800">{parsed.checkIn}</div>
                      </div>
                    )}
                    {parsed.checkOut && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                          <FaClock className="text-gray-400" /> Check-out
                        </div>
                        <div className="text-sm font-bold text-gray-800">{parsed.checkOut}</div>
                      </div>
                    )}
                  </div>
                )}
                {parsed.cancelDesc && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">
                      <FaTimesCircle className="w-3.5 h-3.5" /> Cancellation Policy
                    </div>
                    <p className="text-sm text-amber-800">{parsed.cancelDesc}</p>
                    {parsed.cancelPenalty?.Refundable === "No" && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        <FaBan className="w-2.5 h-2.5" /> Non-refundable
                      </span>
                    )}
                  </div>
                )}
                {parsed.guarantee && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                    <FaShieldAlt className="text-blue-500 w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{parsed.guarantee === "GuaranteeRequired"
                      ? "Credit card guarantee required at booking"
                      : parsed.guarantee}</span>
                  </div>
                )}
                {parsed.ratePayment && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <FaCreditCard className="text-[#FD561E] w-4 h-4" />
                    <span>Payment: {parsed.ratePayment}</span>
                  </div>
                )}
                {parsed.acceptedCards?.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 font-semibold mb-2">Accepted Cards</div>
                    <div className="flex flex-wrap gap-1.5">
                      {parsed.acceptedCards.map(c => (
                        <span key={c} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-semibold">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* ── Amenities ── */}
            {amenities.length > 0 && (
              <Section title="✨ Hotel Amenities" defaultOpen={false} badge={`${amenities.length}`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {amenities.map(a => {
                    const { icon, color, bg } = getAmenityMeta(a.category);
                    return (
                      <div key={a.code} className={`flex items-center gap-2 ${bg} rounded-xl px-2.5 py-2`}>
                        <span className={`${color} text-sm flex-shrink-0`}>{icon}</span>
                        <span className="text-xs text-gray-700 font-medium leading-tight">{a.description}</span>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* ── About ── */}
            {hotel.longDescription && (
              <Section title="ℹ About this Hotel" defaultOpen={false}>
                <p className="text-sm text-gray-600 leading-relaxed">{hotel.longDescription}</p>
              </Section>
            )}
          </div>

          {/* ════ RIGHT: stay info sidebar (no price, no Book button) ════ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:sticky lg:top-[60px]">

              {/* Hotel thumb */}
              {images[0]?.url && (
                <div className="h-28 rounded-xl overflow-hidden mb-3">
                  <img src={images[0].url} alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = "none"; }} />
                </div>
              )}

              <h3 className="font-black text-gray-900 text-sm mb-0.5 line-clamp-2">{hotel.name}</h3>
              {stars > 0 && <Stars value={stars} />}

              <div className="mt-3 mb-3 border-t border-gray-100 pt-3">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Your Stay</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-[10px] text-gray-400 font-semibold uppercase mb-0.5">Check-in</div>
                    <div className="text-xs font-bold text-gray-800">{fmtDate(checkinDate)}</div>
                    <div className="text-[10px] text-gray-400">From {checkInTime}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-[10px] text-gray-400 font-semibold uppercase mb-0.5">Check-out</div>
                    <div className="text-xs font-bold text-gray-800">{fmtDate(checkoutDate)}</div>
                    <div className="text-[10px] text-gray-400">By {checkOutTime}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2.5">
                  <span><FaBed className="inline text-[#FD561E] mr-1" />{guests?.rooms || 1} Room</span>
                  <span><FaUser className="inline text-[#FD561E] mr-1" />{guests?.adults || 1} Adult{guests?.adults > 1 ? "s" : ""}</span>
                  <span className="font-semibold text-gray-600">{n} Night{n > 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Cancellation pill */}
              {parsed?.cancelDesc && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3 text-xs text-amber-700">
                  <p className="font-semibold mb-0.5">⚠ Cancellation</p>
                  <p className="line-clamp-2 leading-relaxed">{parsed.cancelDesc}</p>
                </div>
              )}

              {/* Address */}
              {p?.address && (
                <div className="flex items-start gap-1.5 text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <FaMapMarkerAlt className="text-[#FD561E] w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                  <span>{[p.address.street, p.address.city].filter(Boolean).join(", ")}</span>
                </div>
              )}

              <p className="text-center text-[10px] text-gray-400 mt-3">
                Select a room above to book
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;