// src/modules/hotels/pages/HotelSearchResults.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import {
  FaStar, FaStarHalfAlt, FaRegStar,
  FaMapMarkerAlt, FaWifi, FaUtensils, FaCoffee,
  FaSwimmingPool, FaSpa, FaCar, FaDumbbell,
  FaChevronLeft, FaChevronRight, FaSlidersH, FaTimes,
  FaCheck, FaBan,
} from "react-icons/fa";
import { MdAir, MdFreeBreakfast } from "react-icons/md";
import { Building2, ArrowLeft } from "lucide-react";

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmt = (n) => new Intl.NumberFormat("en-IN").format(Math.round(n));

const nights = (cin, cout) => {
  const d = (new Date(cout) - new Date(cin)) / 86400000;
  return d > 0 ? d : 1;
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

/* ─── star renderer ──────────────────────────────────────────────────────── */
const Stars = ({ value }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(value))
      stars.push(<FaStar key={i} className="text-amber-400 w-3.5 h-3.5" />);
    else if (i === Math.ceil(value) && value % 1 >= 0.5)
      stars.push(<FaStarHalfAlt key={i} className="text-amber-400 w-3.5 h-3.5" />);
    else
      stars.push(<FaRegStar key={i} className="text-amber-200 w-3.5 h-3.5" />);
  }
  return <span className="flex items-center gap-0.5">{stars}</span>;
};

/* ─── amenity icon map ───────────────────────────────────────────────────── */
const AMENITY_ICONS = {
  "Outdoor Pool":       <FaSwimmingPool />,
  "Indoor Pool":        <FaSwimmingPool />,
  "Pool":               <FaSwimmingPool />,
  "WiFI Available":     <FaWifi />,
  "High-Speed Internet":<FaWifi />,
  "Restaurant":         <FaUtensils />,
  "Breakfast":          <MdFreeBreakfast />,
  "Coffee/Tea":         <FaCoffee />,
  "Spa Facilities":     <FaSpa />,
  "Parking":            <FaCar />,
  "Free Parking":       <FaCar />,
  "Air Conditioning":   <MdAir />,
  "Fitness Center / Gym":<FaDumbbell />,
};

const TopAmenities = ({ amenities = [] }) => {
  const seen = new Set();
  const icons = [];
  for (const a of amenities) {
    const icon = AMENITY_ICONS[a.category];
    if (icon && !seen.has(a.category)) {
      seen.add(a.category);
      icons.push({ icon, label: a.category });
    }
    if (icons.length >= 4) break;
  }
  if (!icons.length) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {icons.map(({ icon, label }) => (
        <span key={label} title={label}
          className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
          <span className="text-[#FD561E]">{icon}</span>
          <span className="hidden sm:inline">{label}</span>
        </span>
      ))}
    </div>
  );
};

const getStars = (ratings = []) => {
  const ntm  = ratings.find(r => r.provider === "NTM");
  const giata = ratings.find(r => r.provider === "GIATA");
  return ntm?.value || giata?.value || 0;
};

/* ─── image carousel ─────────────────────────────────────────────────────── */
const ImageCarousel = ({ images }) => {
  const [idx, setIdx] = useState(0);
  if (!images?.length)
    return (
      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-300">
        <Building2 className="w-10 h-10" />
        <span className="text-xs">No image</span>
      </div>
    );
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); };
  return (
    <div className="relative w-full h-full group">
      <img
        src={images[idx].url}
        alt={images[idx].caption || "Hotel"}
        className="w-full h-full object-cover"
        onError={e => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x250?text=No+Image"; }}
      />
      {images.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FaChevronLeft className="w-2.5 h-2.5" />
          </button>
          <button onClick={next}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FaChevronRight className="w-2.5 h-2.5" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div key={i} className={`w-1 h-1 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Hotel Card ─────────────────────────────────────────────────────────── */
const HotelCard = ({ hotel, nightsCount }) => {
  const p         = hotel.propertyInfo;
  const stars     = getStars(p?.ratings || []);
  const rate      = hotel.lowestPublicAvailableRate;
  const hasPrice  = hotel.availability && rate;
  const perNight  = rate?.averageNightlyTotalPrice?.amount;
  const total     = rate?.totalPrice?.amount;
  const dist      = p?.distanceFromSearchPoint;
  const images    = p?.imageURLs || [];
  const refundable = rate?.terms?.refundable;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-shadow hover:shadow-md ${
      hotel.availability ? "border-gray-100" : "border-gray-100 opacity-80"
    }`}>
      <div className="relative h-44 sm:h-48 overflow-hidden bg-gray-100">
        <ImageCarousel images={images} />
        <div className={`absolute top-2.5 left-2.5 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shadow ${
          hotel.availability ? "bg-green-500 text-white" : "bg-gray-700 text-white"
        }`}>
          {hotel.availability ? <FaCheck className="w-2.5 h-2.5" /> : <FaBan className="w-2.5 h-2.5" />}
          {hotel.availability ? "Available" : "Unavailable"}
        </div>
        {stars > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <Stars value={stars} />
          </div>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
          {hotel.name}
        </h3>
        {p?.address && (
          <div className="flex items-start gap-1 text-xs text-gray-500 mb-1.5">
            <FaMapMarkerAlt className="w-3 h-3 text-[#FD561E] flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              {[p.address.street, p.address.city].filter(Boolean).join(", ")}
              {dist && ` · ${dist.value.toFixed(1)} km`}
            </span>
          </div>
        )}
        <div className="mb-2.5">
          <TopAmenities amenities={p?.amenities} />
        </div>
        {hasPrice && (
          <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
            {rate.wifiIncluded && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                <FaWifi className="w-2.5 h-2.5" /> WiFi
              </span>
            )}
            {rate.breakfastIncluded && (
              <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                <MdFreeBreakfast className="w-2.5 h-2.5" /> Breakfast
              </span>
            )}
            {refundable && (
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-medium">
                Free cancellation
              </span>
            )}
          </div>
        )}
        <div className="flex items-end justify-between gap-2 mt-auto">
          {hasPrice ? (
            <div>
              <div className="text-[10px] text-gray-400">per night</div>
              <div className="text-lg font-black text-gray-900">₹{fmt(perNight)}</div>
              <div className="text-[10px] text-gray-400">
                ₹{fmt(total)} total · {nightsCount} night{nightsCount > 1 ? "s" : ""}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">Price unavailable</div>
          )}
          <button
            disabled={!hotel.availability}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              hotel.availability
                ? "bg-[#FD561E] text-white hover:bg-[#e54d1a] hover:shadow-lg"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {hotel.availability ? "Book Now" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Filters sidebar ────────────────────────────────────────────────────── */
const STAR_OPTIONS = [5, 4, 3, 2, 1];

const FiltersSidebar = ({ filters, onChange, onReset, onClose, totalVisible, totalServer }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-bold text-gray-800 text-sm">Filters</h2>
      <div className="flex items-center gap-2">
        <button onClick={onReset} className="text-xs text-[#FD561E] font-medium hover:underline">Reset</button>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>

    <div className="mb-5">
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Availability</h3>
      {[
        { label: "All Hotels",       value: "all" },
        { label: "Available Only",   value: "available" },
        { label: "Unavailable Only", value: "unavailable" },
      ].map(opt => (
        <label key={opt.value} className="flex items-center gap-2 mb-1.5 cursor-pointer group">
          <input type="radio" name="avail" value={opt.value}
            checked={filters.availability === opt.value}
            onChange={() => onChange({ ...filters, availability: opt.value })}
            className="accent-[#FD561E]" />
          <span className="text-sm text-gray-700 group-hover:text-[#FD561E] transition-colors">{opt.label}</span>
        </label>
      ))}
    </div>

    <div className="mb-5">
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Star Rating</h3>
      {STAR_OPTIONS.map(s => (
        <label key={s} className="flex items-center gap-2 mb-1.5 cursor-pointer group">
          <input type="checkbox"
            checked={filters.stars.includes(s)}
            onChange={() => {
              const next = filters.stars.includes(s)
                ? filters.stars.filter(x => x !== s)
                : [...filters.stars, s];
              onChange({ ...filters, stars: next });
            }}
            className="accent-[#FD561E]" />
          <Stars value={s} />
          <span className="text-xs text-gray-500">& above</span>
        </label>
      ))}
    </div>

    <div className="mb-4">
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
        Max Distance: <span className="text-[#FD561E]">{filters.maxDist} km</span>
      </h3>
      <input type="range" min={1} max={20} step={1}
        value={filters.maxDist}
        onChange={e => onChange({ ...filters, maxDist: Number(e.target.value) })}
        className="w-full accent-[#FD561E]" />
      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
        <span>1 km</span><span>20 km</span>
      </div>
    </div>

    {/* ── totals footer ── */}
    <div className="text-xs text-center pt-2 border-t border-gray-50 space-y-0.5">
      <div className="text-gray-700 font-semibold">{totalVisible} hotels shown</div>
      {totalServer > 0 && totalServer !== totalVisible && (
        <div className="text-gray-400">{totalServer} total available</div>
      )}
    </div>
  </div>
);

/* ─── Sort bar ───────────────────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low",   label: "Price: Low to High" },
  { value: "price-high",  label: "Price: High to Low" },
  { value: "rating",      label: "Star Rating" },
  { value: "distance",    label: "Distance" },
];

const SortBar = ({ sort, onChange, totalLoaded, totalServer }) => (
  <div className="flex items-center justify-between gap-3 bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-2.5 mb-4">
    <span className="text-sm text-gray-500 font-medium">
      <span className="text-gray-900 font-bold">{totalLoaded}</span>
      {totalServer > totalLoaded && (
        <span className="text-gray-400"> of {totalServer}</span>
      )}{" "}
      hotels
    </span>
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 hidden sm:inline">Sort:</span>
      <select value={sort} onChange={e => onChange(e.target.value)}
        className="text-xs font-semibold text-gray-700 bg-transparent border-none outline-none cursor-pointer">
        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  </div>
);

/* ─── Search header ──────────────────────────────────────────────────────── */
const SearchHeader = ({ location, checkinDate, checkoutDate, guests, onBack }) => {
  const n = nights(checkinDate, checkoutDate);
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 flex-wrap">
        <button onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#FD561E] transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Modify</span>
        </button>
        <div className="h-5 w-px bg-gray-200 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
          <FaMapMarkerAlt className="text-[#FD561E] w-3.5 h-3.5" />
          {location}
        </div>
        <div className="h-5 w-px bg-gray-200" />
        <span className="text-sm text-gray-600">
          {fmtDate(checkinDate)} → {fmtDate(checkoutDate)}
          <span className="text-gray-400 ml-1">({n} night{n > 1 ? "s" : ""})</span>
        </span>
        <div className="h-5 w-px bg-gray-200" />
        <span className="text-sm text-gray-600">
          {guests.rooms} Room{guests.rooms > 1 ? "s" : ""} · {guests.adults} Adult{guests.adults > 1 ? "s" : ""}
          {guests.children > 0 && `, ${guests.children} Child${guests.children > 1 ? "ren" : ""}`}
        </span>
      </div>
    </div>
  );
};

/* ─── Pagination ─────────────────────────────────────────────────────────── */
const Pagination = ({ page, total, onChange, loadingPage }) => {
  if (total <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(total, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
      <button onClick={() => onChange(page - 1)} disabled={page === 1 || loadingPage}
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <FaChevronLeft className="w-3 h-3" />
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onChange(1)}
            className="w-8 h-8 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">1</button>
          {start > 2 && <span className="text-gray-400 text-sm">…</span>}
        </>
      )}

      {pages.map(p => (
        <button key={p} onClick={() => onChange(p)} disabled={loadingPage}
          className={`w-8 h-8 rounded-full text-sm font-bold transition-all relative ${
            p === page ? "bg-[#FD561E] text-white shadow" : "text-gray-600 hover:bg-gray-100"
          }`}>
          {loadingPage && p === page
            ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white absolute inset-0 m-auto" />
            : p}
        </button>
      ))}

      {end < total && (
        <>
          {end < total - 1 && <span className="text-gray-400 text-sm">…</span>}
          <button onClick={() => onChange(total)}
            className="w-8 h-8 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">{total}</button>
        </>
      )}

      <button onClick={() => onChange(page + 1)} disabled={page === total || loadingPage}
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <FaChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════ */
const ITEMS_PER_PAGE = 12;
const DEFAULT_FILTERS = { availability: "all", stars: [], maxDist: 20 };

const HotelSearchResults = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const [sort,          setSort]          = useState("recommended");
  const [filters,       setFilters]       = useState(DEFAULT_FILTERS);
  const [page,          setPage]          = useState(1);
  const [showMobFilter, setShowMobFilter] = useState(false);

  /* ── server-side data store ─────────────────────────────────────────────
     pageCache: { [serverPageNo]: propertyItems[] }
     Keeps each fetched server page so we never re-fetch it.
     allProperties: flat array of everything cached so far.
  ─────────────────────────────────────────────────────────────────────── */
  const initialItems = state?.results?.hotelsResponse?.propertyItems || [];
  const initialPag   = state?.results?.pagination || {};

  const [pageCache, setPageCache] = useState({ 1: initialItems });
  const [serverMeta, setServerMeta] = useState({
    currentPage:     initialPag.page         || 1,
    totalPages:      initialPag.totalPages   || 1,
    totalItems:      initialPag.totalItems   || initialItems.length,
    paginationToken: initialPag.paginationToken || null,
  });
  const [loadingPage,   setLoadingPage]   = useState(false);
  const [loadPageError, setLoadPageError] = useState(null);

  // flat array of all cached properties
  const allProperties = useMemo(() => {
    return Object.keys(pageCache)
      .sort((a, b) => Number(a) - Number(b))
      .flatMap(k => pageCache[k]);
  }, [pageCache]);

  /* ── guard ── */
  if (!state?.results) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Building2 className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 font-medium">No search results found.</p>
        <button onClick={() => navigate("/hotels")}
          className="px-5 py-2 bg-[#FD561E] text-white rounded-xl font-bold text-sm hover:bg-[#e54d1a] transition-colors">
          Back to Search
        </button>
      </div>
    );
  }

  const { location: loc, checkinDate, checkoutDate, guests } = state;
  const nightsCount = nights(checkinDate, checkoutDate);

  /* ── fetch a specific server page ───────────────────────────────────────
     Called when user navigates to a client page that needs data from a
     server page we haven't fetched yet.
  ─────────────────────────────────────────────────────────────────────── */
  const fetchServerPage = useCallback(async (serverPageNo) => {
    if (pageCache[serverPageNo]) return; // already cached
    if (!serverMeta.paginationToken)    return;
    if (loadingPage)                    return;

    setLoadingPage(true);
    setLoadPageError(null);
    try {
      const response = await fetch("https://api.bobros.org/hotel/newPage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageNo:         String(serverPageNo),
          paginationCode: serverMeta.paginationToken,
        }),
      });
      if (!response.ok) {
        const t = await response.text().catch(() => "");
        let msg = `Server error (${response.status})`;
        try { const b = JSON.parse(t); msg = b?.message || b?.error || msg; } catch {}
        throw new Error(msg);
      }
      const data = await response.json();
      console.log(`✅ Hotel newPage ${serverPageNo}:`, data);

      const newItems = data?.hotelsResponse?.propertyItems || [];
      setPageCache(prev => ({ ...prev, [serverPageNo]: newItems }));
      setServerMeta({
        currentPage:     data?.pagination?.page         || serverPageNo,
        totalPages:      data?.pagination?.totalPages   || serverMeta.totalPages,
        totalItems:      data?.pagination?.totalItems   || serverMeta.totalItems,
        paginationToken: data?.pagination?.paginationToken || serverMeta.paginationToken,
      });
    } catch (err) {
      console.error("❌ Hotel newPage error:", err);
      setLoadPageError(err.message || "Failed to load hotels. Please try again.");
    } finally {
      setLoadingPage(false);
    }
  }, [pageCache, serverMeta, loadingPage]);

  /* ── filter ── */
  const filtered = useMemo(() => allProperties.filter(h => {
    if (filters.availability === "available"   && !h.availability) return false;
    if (filters.availability === "unavailable" &&  h.availability) return false;
    const dist = h.propertyInfo?.distanceFromSearchPoint?.value ?? 0;
    if (dist > filters.maxDist) return false;
    if (filters.stars.length > 0) {
      const s = getStars(h.propertyInfo?.ratings || []);
      if (!filters.stars.includes(s)) return false;
    }
    return true;
  }), [allProperties, filters]);

  /* ── sort ── */
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "price-low":
        return arr.sort((a, b) =>
          (a.lowestPublicAvailableRate?.averageNightlyTotalPrice?.amount ?? Infinity) -
          (b.lowestPublicAvailableRate?.averageNightlyTotalPrice?.amount ?? Infinity));
      case "price-high":
        return arr.sort((a, b) =>
          (b.lowestPublicAvailableRate?.averageNightlyTotalPrice?.amount ?? -1) -
          (a.lowestPublicAvailableRate?.averageNightlyTotalPrice?.amount ?? -1));
      case "rating":
        return arr.sort((a, b) =>
          getStars(b.propertyInfo?.ratings || []) - getStars(a.propertyInfo?.ratings || []));
      case "distance":
        return arr.sort((a, b) =>
          (a.propertyInfo?.distanceFromSearchPoint?.value ?? 999) -
          (b.propertyInfo?.distanceFromSearchPoint?.value ?? 999));
      default:
        return arr.sort((a, b) => {
          if (a.availability !== b.availability) return a.availability ? -1 : 1;
          return (a.propertyInfo?.distanceFromSearchPoint?.value ?? 999) -
                 (b.propertyInfo?.distanceFromSearchPoint?.value ?? 999);
        });
    }
  }, [filtered, sort]);

  /* ── client pagination math ─────────────────────────────────────────────
     Total client pages = ceil(totalServer / ITEMS_PER_PAGE)
     so pagination always shows full extent even before all server pages load.
  ─────────────────────────────────────────────────────────────────────── */
  const totalClientPages = Math.ceil(serverMeta.totalItems / ITEMS_PER_PAGE);
  const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  /* ── when user picks a client page, figure out which server page is needed ── */
  const handlePageChange = useCallback((clientPage) => {
    setPage(clientPage);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // which server page does this client page fall on?
    // server page 1 = items 0-99, server page 2 = items 100-199, etc.
    // client page N needs items [(N-1)*12 .. N*12-1]
    // server page = floor((clientPage-1)*ITEMS_PER_PAGE / serverPageSize) + 1
    // We don't know serverPageSize exactly, but initialItems.length = 100 is the hint.
    const serverPageSize = initialItems.length || 100;
    const neededServerPage = Math.floor(((clientPage - 1) * ITEMS_PER_PAGE) / serverPageSize) + 1;

    if (!pageCache[neededServerPage] && neededServerPage <= serverMeta.totalPages) {
      fetchServerPage(neededServerPage);
    }
  }, [pageCache, serverMeta.totalPages, fetchServerPage, initialItems.length]);

  const handleFilterChange = useCallback((f) => { setFilters(f); setPage(1); }, []);
  const handleSortChange   = useCallback((s) => { setSort(s);    setPage(1); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40">
        <SearchHeader
          location={loc}
          checkinDate={checkinDate}
          checkoutDate={checkoutDate}
          guests={guests}
          onBack={() => navigate("/hotels")}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile filter button */}
        <div className="lg:hidden mb-4">
          <button onClick={() => setShowMobFilter(true)}
            className="w-full flex items-center justify-center gap-2 bg-white py-3 rounded-xl shadow-sm text-gray-700 font-semibold border border-gray-100 hover:bg-gray-50 transition-colors text-sm">
            <FaSlidersH className="text-[#FD561E]" />
            Filters & Sort
          </button>
        </div>

        <div className="flex gap-5">
          {/* desktop sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0 self-start sticky top-24">
            <FiltersSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
              totalVisible={sorted.length}
              totalServer={serverMeta.totalItems}
            />
          </div>

          {/* mobile sidebar portal */}
          {showMobFilter && ReactDOM.createPortal(
            <div className="fixed inset-0 z-50 flex">
              <div className="flex-1 bg-black/40" onClick={() => setShowMobFilter(false)} />
              <div className="w-72 bg-gray-50 overflow-y-auto p-4">
                <FiltersSidebar
                  filters={filters}
                  onChange={handleFilterChange}
                  onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
                  onClose={() => setShowMobFilter(false)}
                  totalVisible={sorted.length}
                  totalServer={serverMeta.totalItems}
                />
              </div>
            </div>,
            document.body
          )}

          {/* results */}
          <div className="flex-1 min-w-0">
            <SortBar
              sort={sort}
              onChange={handleSortChange}
              totalLoaded={allProperties.length}
              totalServer={serverMeta.totalItems}
            />

            {loadPageError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium text-center">
                {loadPageError} —{" "}
                <button onClick={() => fetchServerPage(serverMeta.currentPage + 1)}
                  className="underline hover:text-red-700">Retry</button>
              </div>
            )}

            {paged.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paged.map((hotel, i) => (
                    <HotelCard
                      key={hotel.propertyCode || `hotel-${i}`}
                      hotel={hotel}
                      nightsCount={nightsCount}
                    />
                  ))}
                </div>

                <Pagination
                  page={page}
                  total={totalClientPages}
                  onChange={handlePageChange}
                  loadingPage={loadingPage}
                />
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                <Building2 className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">No Hotels Match</h3>
                <p className="text-sm text-gray-400 mb-5">Try adjusting the filters.</p>
                <button onClick={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
                  className="px-5 py-2 bg-[#FD561E] text-white rounded-xl font-bold text-sm hover:bg-[#e54d1a] transition-colors">
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSearchResults;