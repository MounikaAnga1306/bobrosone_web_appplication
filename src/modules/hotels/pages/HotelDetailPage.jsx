// src/modules/hotels/pages/HotelDetailPage.jsx
import React, { useEffect, useState } from "react";
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
const getRatePrice = (r) => ({
  perNight: r.price?.averageNightlyTotalPrice?.amount
    || r.averageNightlyTotalPrice?.amount || 0,
  perNightTax: r.price?.averageNightlyTaxesPrice?.amount
    || r.averageNightlyTaxesPrice?.amount || 0,
  total: r.price?.totalPrice?.amount
    || r.totalPrice?.amount || 0,
});

/* ─── amenity map ────────────────────────────────────────────────────────── */
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

/* ─── Collapsible section ────────────────────────────────────────────────── */
const Section = ({ title, defaultOpen = false, badge, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-gray-50 transition-colors">
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
      {open && <div className="px-4 sm:px-6 pb-5">{children}</div>}
    </div>
  );
};

/* ─── Room image with single carousel ───────────────────────────────────── */
const RoomImage = ({ images }) => {
  const [idx, setIdx] = useState(0);
  if (!images?.length) return (
    <div className="w-full h-full min-h-[180px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
      <Building2 className="w-10 h-10" />
    </div>
  );
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); };
  return (
    <div className="relative w-full h-full min-h-[220px] rounded-xl overflow-hidden bg-gray-100">
      <img
        src={images[idx]?.url}
        alt="room"
        className="w-full h-full object-cover"
        onError={e => { e.target.src = "https://via.placeholder.com/400x300?text=Room"; }}
      />
      {images.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors">
            <FaChevronLeft className="w-3 h-3" />
          </button>
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors">
            <FaChevronRight className="w-3 h-3" />
          </button>
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {idx + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Hero gallery ───────────────────────────────────────────────────────── */
const HeroGallery = ({ images, hotelName }) => {
  const [idx, setIdx] = useState(0);
  const [lb, setLb]   = useState(false);
  if (!images?.length) return (
    <div className="w-full h-52 sm:h-72 bg-gray-100 flex flex-col items-center justify-center text-gray-300">
      <Building2 className="w-12 h-12 mb-2" /><span className="text-sm">No images</span>
    </div>
  );
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);
  return (
    <>
      <div className="relative h-52 sm:h-72 lg:h-[420px] overflow-hidden bg-gray-900 cursor-zoom-in" onClick={() => setLb(true)}>
        <img src={images[idx].url} alt={hotelName}
          className="w-full h-full object-cover opacity-90"
          onError={e => { e.target.src = "https://via.placeholder.com/1200x500?text=No+Image"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {idx + 1} / {images.length}
        </div>
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors">
              <FaChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors">
              <FaChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-1 sm:gap-1.5 p-2 bg-gray-900 overflow-x-auto">
          {images.map((img, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`flex-shrink-0 w-12 h-8 sm:w-16 sm:h-10 rounded overflow-hidden border-2 transition-all ${
                i === idx ? "border-[#FD561E]" : "border-transparent opacity-50 hover:opacity-100"
              }`}>
              <img src={img.url} alt="" className="w-full h-full object-cover"
                onError={e => { e.target.src = "https://via.placeholder.com/64x40?text=X"; }} />
            </button>
          ))}
        </div>
      )}
      {lb && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setLb(false)}>
          <button onClick={() => setLb(false)} className="absolute top-4 right-4 text-white hover:text-gray-300">
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
    price:         { base: price.Base || 0, taxes: price.TotalTaxes || 0, total: price.TotalPrice || 0 },
    nightlyRates:  nightlyBreakdown?.NightlyRate || [],
    cancelDesc,
    cancelPenalty,
    checkIn,
    checkOut,
    mealsIncluded: terms?.MealsIncluded || {},
    acceptedCards: (terms?.AcceptedCreditCard || []).map(c => c.value),
    guarantee:     terms?.Guarantee?.[0]?.guaranteeType || "",
    ratePayment:   terms?.RatePaymentInfo || "",
    extraCharges:  getBlock("Extra charges"),
    other_text:    getBlock("Other"),
    phone:         product.Telephone?.phoneNumber || "",
    roomType:      product.RoomType || null,
  };
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════ */
const HotelDetailPage = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const [rulesData, setRulesData] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [expandedRooms, setExpandedRooms] = useState({});

  if (!state?.hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <Building2 className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500">No hotel data found.</p>
        <button onClick={() => navigate("/hotels/results")}
          className="px-5 py-2.5 bg-[#FD561E] text-white rounded-xl font-bold text-sm">Back to Results</button>
      </div>
    );
  }

  const { hotel, rate: passedRate, checkinDate, checkoutDate, guests, location: loc, lat, lng, traceId } = state;
  const p      = hotel.propertyInfo;
  const stars  = getStars(p?.ratings || []);
  const images = [...(p?.imageURLs || [])];
  const n      = nights(checkinDate, checkoutDate);
  const rateForRules = passedRate || hotel.lowestPublicAvailableRate;
  const rateKey      = rateForRules?.rateKey?.value || "";
  const roomTypes    = hotel.roomTypes || [];

  

  /* ── fetch rules ── */
  useEffect(() => {
    if (!rateKey) { setLoading(false); return; }
    setLoading(true);
    fetch("https://api.bobros.org/hotel/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rateKey, traceId }),
    })
      .then(r => { if (!r.ok) throw new Error(""); return r.json(); })
      .then(data => setRulesData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rateKey]);

  /* ── default all rooms expanded ── */
  useEffect(() => {
    if (roomTypes.length) {
      const all = {};
      roomTypes.forEach((_, i) => { all[i] = true; });
      setExpandedRooms(all);
    }
  }, [roomTypes.length]);

  const parsed = parseRules(rulesData);
  const checkInTime  = parsed?.checkIn  || "14:00";
  const checkOutTime = parsed?.checkOut || "12:00";

  const amenities = (() => {
    const seen = new Set(); const result = [];
    for (const a of (p?.amenities || [])) {
      if (!seen.has(a.category)) { seen.add(a.category); result.push(a); }
    }
    return result;
  })();

 

  const handleBookNow = (rate) => {
    navigate("/hotels/booking", {
      state: { hotel, rate, rulesData, checkinDate, checkoutDate, guests, location: loc, lat, lng, traceId },
    });
  };

  const toggleRoom = (i) =>
    setExpandedRooms(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky back bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FD561E] transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Results</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          <h1 className="text-sm font-bold text-gray-800 line-clamp-1 flex-1 hidden sm:block">{hotel.name}</h1>
        </div>
      </div>

      {/* ── Hero gallery ── */}
      <HeroGallery images={images} hotelName={hotel.name} />

      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-4 sm:py-6 space-y-4">

        {/* ── Hotel info card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 leading-tight">{hotel.name}</h2>
            <Stars value={stars} />
          </div>
          {p?.address && (
            <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-2">
              <FaMapMarkerAlt className="text-[#FD561E] w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{[p.address.street, p.address.city, p.address.stateProvince, p.address.postalCode].filter(Boolean).join(", ")}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-500">
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

          {/* Stay summary strip */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-gray-600">
            <div>
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Check-in</div>
              <div className="font-bold text-gray-800">{fmtDate(checkinDate)}</div>
              <div className="text-xs text-gray-400">From {checkInTime}</div>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden sm:block" />
            <div>
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Check-out</div>
              <div className="font-bold text-gray-800">{fmtDate(checkoutDate)}</div>
              <div className="text-xs text-gray-400">By {checkOutTime}</div>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FaBed className="text-[#FD561E] w-4 h-4" />
                {guests?.rooms || 1} Room
              </span>
              <span className="flex items-center gap-1">
                <FaUser className="text-[#FD561E] w-3.5 h-3.5" />
                {guests?.adults || 1} Adult{guests?.adults > 1 ? "s" : ""}
              </span>
              <span className="font-semibold text-gray-700">{n} Night{n > 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SELECT A ROOM — full width, Yatra/MMT style
        ══════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-8 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-black text-gray-900 text-base sm:text-lg">Select a Room</h3>
            {roomTypes.length > 0 && (
              <span className="text-xs font-semibold bg-[#FD561E]/10 text-[#FD561E] px-2.5 py-1 rounded-full">
                {roomTypes.length} type{roomTypes.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
            </div>
          ) : roomTypes.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No room types available</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {roomTypes.map((rt, ridx) => {
                const isOpen     = expandedRooms[ridx] !== false;
                const lowestRate = rt.rates?.[0];
                const lowestP    = lowestRate ? getRatePrice(lowestRate) : null;
                // one image set shared for all rates in this room type
                const roomImgs   = rt.roomImageURLs || [];

                return (
                  <div key={ridx} className="overflow-hidden">

                    {/* ── Room type header — collapsible ── */}
                    <button
                      onClick={() => toggleRoom(ridx)}
                      className="w-full flex items-center justify-between px-4 sm:px-8 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 text-sm sm:text-base">
                          {rt.shortRoomDescription}
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3 mt-0.5 text-xs text-gray-500">
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
                      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        {lowestP && lowestP.perNight > 0 && (
                          <div className="text-right hidden sm:block">
                            <div className="text-[10px] text-gray-400 uppercase">from</div>
                            <div className="text-base font-black text-gray-900">
                              ₹{fmt(lowestP.perNight)}
                              <span className="text-xs font-normal text-gray-400">/night</span>
                            </div>
                          </div>
                        )}
                        {isOpen
                          ? <FaChevronUp className="w-4 h-4 text-gray-400" />
                          : <FaChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {/* ── Expanded: image LEFT + rates RIGHT ── */}
                    {isOpen && (
                      <div className="px-4 sm:px-8 py-5">
                        {/* Two-column: image | rates */}
                        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">

                          {/* LEFT: single shared image with carousel */}
                          <div className="sm:w-72 lg:w-80 flex-shrink-0">
                            <div className="sm:sticky sm:top-[68px]">
                              <RoomImage images={roomImgs} />
                              {/* Room feature chips below image */}
                              {(rt.bedTypes?.length > 0 || rt.view || rt.maxOccupancy) && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {rt.bedTypes?.map((b, i) => (
                                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                                      <FaBed className="text-[#FD561E] w-3 h-3" />
                                      {b.bedType}
                                    </span>
                                  ))}
                                  {rt.view?.description && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                      👁 {rt.view.description}
                                    </span>
                                  )}
                                  {rt.maxOccupancy && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                      👤 Max {rt.maxOccupancy}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* RIGHT: rate cards stacked */}
                          <div className="flex-1 min-w-0 space-y-4">
                            {rt.rates?.map((r, ri) => {
                              const rp = getRatePrice(r);
                              const hasBreakfast = r.breakfastIncluded
                                || r.rateDescription?.toLowerCase().includes("breakfast");
                              const isNonRefund  = r.terms?.refundable === false
                                || r.rateDescription?.toLowerCase().includes("non-refundable")
                                || r.rateDescription?.toLowerCase().includes("non refundable");
                              const isRefundable = r.terms?.refundable === true
                                || r.rateDescription?.toLowerCase().includes("flexible");

                              return (
                                <div key={ri}
                                  className="border border-gray-200 rounded-2xl overflow-hidden hover:border-[#FD561E]/30 hover:shadow-md transition-all">
                                  <div className="flex flex-col sm:flex-row">

                                    {/* Rate info */}
                                    <div className="flex-1 p-4 sm:p-5">
                                      <p className="font-bold text-gray-800 text-sm sm:text-base mb-3 leading-snug">
                                        {r.rateDescription || r.roomDescription?.split(",")[0] || "Standard Rate"}
                                      </p>

                                      {/* Inclusion + highlight pills */}
                                      <div className="flex flex-wrap gap-2">
                                        {r.wifiIncluded && (
                                          <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                                            <FaWifi className="w-3 h-3" /> WiFi
                                          </span>
                                        )}
                                        {hasBreakfast && (
                                          <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full font-medium">
                                            <MdFreeBreakfast className="w-3.5 h-3.5" /> Breakfast
                                          </span>
                                        )}
                                        {r.nonSmoking && (
                                          <span className="text-xs text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full font-medium">
                                            🚭 Non-smoking
                                          </span>
                                        )}
                                        {isRefundable && (
                                          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-medium">
                                            ✓ Refundable
                                          </span>
                                        )}
                                        {isNonRefund && (
                                          <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full font-medium">
                                            <FaBan className="w-2.5 h-2.5" /> Non-refundable
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Price + Book Now */}
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-3 px-4 sm:px-6 pb-4 sm:py-5 sm:min-w-[200px] sm:border-l border-t sm:border-t-0 border-gray-100 bg-gray-50/60">
                                      <div className="text-right">
                                        <div className="text-2xl sm:text-3xl font-black text-gray-900 leading-none">
                                          ₹{fmt(rp.perNight)}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">per night</div>
                                        {rp.perNightTax > 0 && (
                                          <div className="text-xs text-gray-400 mt-0.5">
                                            +₹{fmt(rp.perNightTax)} taxes/night
                                          </div>
                                        )}
                                        {rp.total > 0 && (
                                          <div className="text-xs text-gray-400 mt-0.5">
                                            ₹{fmt(rp.total)} total
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => handleBookNow(r)}
                                        className="cursor-pointer bg-[#FD561E] hover:bg-[#e04419] active:scale-95 text-white px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-sm shadow hover:shadow-lg transition-all whitespace-nowrap">
                                        Book Now
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Policies ── */}
        {!loading && parsed && (parsed.cancelDesc || parsed.checkIn || parsed.checkOut) && (
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
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">
                  <FaTimesCircle className="w-3.5 h-3.5" /> Cancellation Policy
                </div>
                <p className="text-sm text-amber-800 leading-relaxed">{parsed.cancelDesc}</p>
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
                <span>{parsed.guarantee === "GuaranteeRequired" ? "Credit card guarantee required" : parsed.guarantee}</span>
              </div>
            )}
            {parsed.ratePayment && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <FaCreditCard className="text-[#FD561E] w-4 h-4" />
                <span>Payment: {parsed.ratePayment}</span>
              </div>
            )}
            {parsed.acceptedCards?.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 font-semibold mb-2">Accepted Cards</div>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.acceptedCards.map(c => (
                    <span key={c} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-semibold">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {parsed.extraCharges && (
              <p className="text-xs text-gray-400 mt-3">ℹ {parsed.extraCharges}</p>
            )}
            {parsed.other_text && (
              <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-1.5">{parsed.other_text}</p>
            )}
          </Section>
        )}

        {/* ── Amenities ── */}
        {amenities.length > 0 && (
          <Section title="✨ Hotel Amenities" defaultOpen={false} badge={`${amenities.length}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {amenities.map(a => {
                const { icon, color, bg } = getAmenityMeta(a.category);
                return (
                  <div key={a.code} className={`flex items-center gap-2 ${bg} rounded-xl px-3 py-2.5`}>
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
    </div>
  );
};

export default HotelDetailPage;