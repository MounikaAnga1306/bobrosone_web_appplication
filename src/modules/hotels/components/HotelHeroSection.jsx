// src/modules/hotels/components/HotelHeroSection.jsx
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaMapMarkerAlt, FaCalendarAlt, FaUser,
  FaChevronDown, FaTimes, FaBuilding, FaBed,
  FaLandmark, FaUtensils, FaMapMarkerAlt as FaPin,
  FaCity, FaHome,
} from "react-icons/fa";
import { Bus, Plane, Building2, Palmtree, Car, IndianRupee } from "lucide-react";

/* ─── Tab config ─────────────────────────────────────────────────────────── */
const tabs = [
  { id: "hotels",       label: "Hotels",       icon: Building2   },
  { id: "bus",          label: "Bus",          icon: Bus         },
  { id: "billpayments", label: "Bill Payments",icon: IndianRupee },
  { id: "flights",      label: "Flights",      icon: Plane       },
  { id: "holidays",     label: "Holidays",     icon: Palmtree    },
  { id: "cabs",         label: "Cabs",         icon: Car         },
];
const tabRoutes = {
  bus: "/", billpayments: "/BillHomePage", flights: "/flights",
  hotels: "/hotels", holidays: "/Holiday", cabs: "/cabs",
};

/* ─── MakeMyTrip-style icon + color per osm type ────────────────────────── */
const getSuggestionMeta = (feature) => {
  const { osm_key: key, osm_value: val, type } = feature.properties || {};
  if (["hotel","hostel","guest_house","motel","apartment"].includes(val))
    return { Icon: FaBed,      bg: "bg-blue-50",   color: "text-blue-500"  };
  if (["city","town","village"].includes(val) || type === "city")
    return { Icon: FaCity,     bg: "bg-violet-50", color: "text-violet-500" };
  if (key === "tourism" && ["attraction","museum","monument","viewpoint","theme_park"].includes(val))
    return { Icon: FaLandmark, bg: "bg-amber-50",  color: "text-amber-500" };
  if (val === "residential" || type === "house")
    return { Icon: FaHome,     bg: "bg-gray-50",   color: "text-gray-400"  };
  if (["restaurant","fast_food","cafe","bar","pub"].includes(val))
    return { Icon: FaUtensils, bg: "bg-green-50",  color: "text-green-500" };
  if (["neighbourhood","quarter","suburb","district"].includes(val) || type === "locality")
    return { Icon: FaBuilding, bg: "bg-orange-50", color: "text-[#FD561E]" };
  return     { Icon: FaPin,     bg: "bg-orange-50", color: "text-[#FD561E]" };
};

/* ─── Format label ───────────────────────────────────────────────────────── */
const formatSuggestionLabel = (feature) => {
  const p = feature.properties;
  const name     = p.name || "";
  const subtitle = [p.city || p.county, p.state, p.country].filter(Boolean).join(", ");
  return { name, subtitle };
};

/* ─── Photon fetch ───────────────────────────────────────────────────────── */
const fetchPhotonSuggestions = async (query, signal) => {
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=en`,
    { signal }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.features || [];
};

/* ─── Children ages ──────────────────────────────────────────────────────── */
const buildChildrenAges = (count) => Array.from({ length: count }, () => 5);

/* ─── Calendar CSS ───────────────────────────────────────────────────────── */
const CALENDAR_CSS = `
  .react-datepicker-popper { z-index: 99999 !important; margin-top: 4px !important; }
  .react-datepicker-popper[data-placement^="top"] { margin-top: 0 !important; margin-bottom: 4px !important; }
  .react-datepicker {
    font-family: inherit !important; border: none !important;
    border-radius: 16px !important;
    box-shadow: 0 20px 60px -10px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08) !important;
    overflow: hidden !important;
  }
  .react-datepicker__header {
    background: #fff !important; border-bottom: 1px solid #f3f4f6 !important;
    border-radius: 16px 16px 0 0 !important; padding-top: 14px !important;
  }
  .react-datepicker__current-month {
    font-size: 15px !important; font-weight: 700 !important;
    color: #111827 !important; margin-bottom: 8px !important;
  }
  .react-datepicker__navigation { top: 14px !important; }
  .react-datepicker__navigation-icon::before {
    border-color: #6b7280 !important; border-width: 2px 2px 0 0 !important;
    width: 7px !important; height: 7px !important;
  }
  .react-datepicker__day-names { padding: 0 8px !important; }
  .react-datepicker__day-name {
    color: #9ca3af !important; font-size: 11px !important; font-weight: 600 !important;
    text-transform: uppercase !important; letter-spacing: 0.05em !important;
    width: 36px !important; line-height: 28px !important;
  }
  .react-datepicker__month { margin: 4px 8px 10px !important; }
  .react-datepicker__day {
    width: 36px !important; line-height: 36px !important; border-radius: 50% !important;
    font-size: 13px !important; font-weight: 500 !important; color: #374151 !important;
    margin: 2px !important; transition: background .15s, color .15s !important;
  }
  .react-datepicker__day:hover { background: #fff3ef !important; color: #FD561E !important; }
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background: #FD561E !important; color: #fff !important; font-weight: 700 !important;
  }
  .react-datepicker__day--today { font-weight: 700 !important; color: #FD561E !important; }
  .react-datepicker__day--today.react-datepicker__day--selected { color: #fff !important; }
  .react-datepicker__day--disabled { color: #d1d5db !important; pointer-events: none !important; }
  .react-datepicker__triangle { display: none !important; }
`;

/* ════════════════════════════════════════════════════════════════════════════
   STABLE SUB-COMPONENTS
════════════════════════════════════════════════════════════════════════════ */
const SuggestionsDropdown = React.memo(({
  anchorRef, show, isLoading, suggestions, activeIndex,
  onSelect, onHover,
}) => {
  if (!show && !isLoading) return null;
  if (!anchorRef?.current)  return null;
  const rect = anchorRef.current.getBoundingClientRect();

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top:   rect.bottom + 4,
        left:  rect.left,
        width: rect.width,
        zIndex: 999998,
      }}
      className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
    >
      {isLoading ? (
        <div className="flex items-center gap-2 px-4 py-3 text-gray-400 text-sm">
          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#FD561E]" />
          <span>Searching locations…</span>
        </div>
      ) : (
        <ul className="max-h-72 overflow-y-auto py-1">
          {suggestions.map((feature, idx) => {
            const { name, subtitle } = formatSuggestionLabel(feature);
            const { Icon, bg, color } = getSuggestionMeta(feature);
            const isActive = idx === activeIndex;
            return (
              <li
                key={`${feature.properties?.osm_id}-${idx}`}
                onMouseDown={() => onSelect(feature)}
                onMouseEnter={() => onHover(idx)}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-100 ${
                  isActive ? "bg-orange-50" : "hover:bg-gray-50"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-800 truncate">{name}</div>
                  {subtitle && (
                    <div className="text-xs text-gray-400 truncate mt-0.5">{subtitle}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>,
    document.body
  );
});

const LocationInputRow = React.memo(({
  inputRef, value, onChange, onFocus, onKeyDown,
  onClear, isLoading, disabled, inputClassName,
}) => (
  <div className="flex items-center gap-2">
    {isLoading
      ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#FD561E] flex-shrink-0" />
      : <FaMapMarkerAlt className="text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 transition-colors duration-300 group-hover:text-[#FD561E]" />
    }
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      placeholder="Enter city or hotel name"
      className={`w-full outline-none bg-transparent ${inputClassName}`}
      disabled={disabled}
      autoComplete="off"
      spellCheck={false}
    />
    {value && (
      <button
        onMouseDown={onClear}
        className="text-gray-300 hover:text-gray-500 flex-shrink-0 transition-colors"
      >
        <FaTimes className="w-3 h-3" />
      </button>
    )}
  </div>
));

const GuestsModal = React.memo(({
  modalRef, pos, show, guests,
  maxRooms, maxAdultsPerRoom, maxChildrenPerRoom,
  onUpdate, onClose,
}) => {
  if (!show) return null;
  const rows = [
    { key: "rooms",    label: "Rooms",    sub: `Max ${maxRooms} rooms`, min: 1, max: maxRooms },
    { key: "adults",   label: "Adults",   sub: "Age 13+",               min: 1, max: maxAdultsPerRoom * guests.rooms },
    { key: "children", label: "Children", sub: "Age 0–12",              min: 0, max: maxChildrenPerRoom * guests.rooms },
  ];
  return ReactDOM.createPortal(
    <div
      ref={modalRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: 300, zIndex: 999999 }}
      className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 text-sm">Select Rooms & Guests</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <FaTimes className="w-3.5 h-3.5" />
        </button>
      </div>
      {rows.map(({ key, label, sub, min, max }, i, arr) => (
        <div key={key} className={i < arr.length - 1 ? "mb-4 pb-4 border-b border-gray-50" : "mb-5"}>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-gray-800 text-sm">{label}</div>
              <div className="text-xs text-gray-400">{sub}</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpdate(key, "decrement")}
                disabled={guests[key] <= min}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-base font-medium transition-all ${
                  guests[key] <= min
                    ? "border-gray-100 text-gray-200 cursor-not-allowed"
                    : "border-gray-200 text-gray-600 hover:border-[#FD561E] hover:text-[#FD561E]"
                }`}
              >−</button>
              <span className="font-bold text-gray-800 w-5 text-center text-sm">{guests[key]}</span>
              <button
                onClick={() => onUpdate(key, "increment")}
                disabled={guests[key] >= max}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-base font-medium transition-all ${
                  guests[key] >= max
                    ? "border-gray-100 text-gray-200 cursor-not-allowed"
                    : "border-gray-200 text-gray-600 hover:border-[#FD561E] hover:text-[#FD561E]"
                }`}
              >+</button>
            </div>
          </div>
        </div>
      ))}
      <button
        className="w-full bg-[#FD561E] text-white py-2.5 rounded-xl font-bold hover:bg-[#e54d1a] transition-all duration-200 text-sm"
        onClick={onClose}
      >Apply</button>
    </div>,
    document.body
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
const HotelHeroSection = () => {
  const navigate = useNavigate();

  /* ── state ── */
  const [location,        setLocation]        = useState("");
  const [selectedCoords,  setSelectedCoords]  = useState(null);
  const [checkinDate,     setCheckinDate]     = useState(new Date());
  const [checkoutDate,    setCheckoutDate]    = useState(new Date(Date.now() + 3 * 86400000));
  const [activeTab,       setActiveTab]       = useState("hotels");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const [guests,          setGuests]          = useState({ rooms: 1, adults: 2, children: 0 });

  const [suggestions,        setSuggestions]        = useState([]);
  const [showSuggestions,    setShowSuggestions]    = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [activeIndex,        setActiveIndex]        = useState(-1);

  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [modalPos,        setModalPos]        = useState({ top: 0, left: 0 });

  /* ── refs ── */
  const desktopLocColRef        = useRef(null);
  const mobileLocBoxRef         = useRef(null);
  const inputRef                = useRef(null);
  const desktopGuestsTriggerRef = useRef(null);
  const mobileGuestsTriggerRef  = useRef(null);
  const guestsModalRef          = useRef(null);
  const abortRef                = useRef(null);
  const checkinFieldRef         = useRef(null);
  const checkoutFieldRef        = useRef(null);
  const calendarOpen            = useRef(null);

  // 🟢 NEW: when a suggestion is selected, we programmatically set `location`.
  // That state change used to re-trigger the autocomplete effect below and
  // re-open the dropdown ~300ms later. This flag tells the effect to skip
  // exactly one run right after a selection.
  const skipNextSearchRef = useRef(false);

  const maxRooms           = 5;
  const maxAdultsPerRoom   = 4;
  const maxChildrenPerRoom = 3;

  useEffect(() => {
    if (!document.getElementById("hotel-dp-style")) {
      const s = document.createElement("style");
      s.id = "hotel-dp-style";
      s.textContent = CALENDAR_CSS;
      document.head.appendChild(s);
    }
  }, []);

  const [calPos, setCalPos] = useState({ top: 0, left: 0 });
  const [openCal, setOpenCal] = useState(null);

  const updateCalPos = useCallback(() => {
    const ref = openCal === "checkin" ? checkinFieldRef : checkoutFieldRef;
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setCalPos({ top: r.bottom + 4, left: r.left });
  }, [openCal]);

  useEffect(() => {
    if (!openCal) return;
    updateCalPos();
    const handler = () => updateCalPos();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [openCal, updateCalPos]);

  const CalendarPortal = useCallback(({ children }) => {
    return ReactDOM.createPortal(
      <div style={{ position: "fixed", top: calPos.top, left: calPos.left, zIndex: 99999 }}>
        {children}
      </div>,
      document.body
    );
  }, [calPos]);

  /* ── autocomplete (FIXED: skips the refetch caused by selecting a suggestion) ── */
  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const q = location.trim();
    if (q.length < 2) {
      setSuggestions([]); setShowSuggestions(false); return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const timer = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const features = await fetchPhotonSuggestions(q, ctrl.signal);
        setSuggestions(features);
        setShowSuggestions(features.length > 0);
        setActiveIndex(-1);
      } catch (e) {
        if (e.name !== "AbortError") setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300);

    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (
        !desktopLocColRef.current?.contains(e.target) &&
        !mobileLocBoxRef.current?.contains(e.target)
      ) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const calcGuestsPos = useCallback(() => {
    const dtRect = desktopGuestsTriggerRef.current?.getBoundingClientRect();
    const mbRect = mobileGuestsTriggerRef.current?.getBoundingClientRect();
    const rect = (dtRect && dtRect.width > 0) ? dtRect : mbRect;
    if (!rect || rect.width === 0) return;
    let left = rect.left;
    if (left + 300 > window.innerWidth - 8) left = window.innerWidth - 308;
    if (left < 8) left = 8;
    setModalPos({ top: rect.bottom + 6, left });
  }, []);

  useLayoutEffect(() => {
    if (showGuestsModal) calcGuestsPos();
  }, [showGuestsModal, calcGuestsPos]);

  useEffect(() => {
    const handler = (e) => {
      const inModal   = guestsModalRef.current?.contains(e.target);
      const inTrigger = desktopGuestsTriggerRef.current?.contains(e.target) ||
                        mobileGuestsTriggerRef.current?.contains(e.target);
      if (!inModal && !inTrigger) setShowGuestsModal(false);
    };
    const onMove = () => { if (showGuestsModal) calcGuestsPos(); };
    document.addEventListener("mousedown", handler);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, { capture: true, passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [showGuestsModal, calcGuestsPos]);

  const handleSelectSuggestion = useCallback((feature) => {
    const { name, subtitle } = formatSuggestionLabel(feature);
    skipNextSearchRef.current = true; // 🟢 prevents the dropdown from reopening
    setLocation(subtitle ? `${name}, ${subtitle}` : name);
    const [lng, lat] = feature.geometry.coordinates;
    setSelectedCoords({ lat, lng });
    setSuggestions([]); setShowSuggestions(false); setActiveIndex(-1); setError(null);
  }, []);

  const handleHover = useCallback((idx) => setActiveIndex(idx), []);

  const handleLocationChange = useCallback((e) => {
    setLocation(e.target.value);
    setSelectedCoords(null);
  }, []);

  const handleLocationFocus = useCallback(() => {
    if (suggestions.length > 0) setShowSuggestions(true);
  }, [suggestions.length]);

  const handleLocationKeyDown = useCallback((e) => {
    if (!showSuggestions || !suggestions.length) return;
    if (e.key === "ArrowDown")  { e.preventDefault(); setActiveIndex((p) => Math.min(p + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((p) => Math.max(p - 1, -1)); }
    else if (e.key === "Enter" && activeIndex >= 0) { e.preventDefault(); handleSelectSuggestion(suggestions[activeIndex]); }
    else if (e.key === "Escape") setShowSuggestions(false);
  }, [showSuggestions, suggestions, activeIndex, handleSelectSuggestion]);

  const handleClearLocation = useCallback((e) => {
    e.preventDefault();
    setLocation(""); setSelectedCoords(null);
    setSuggestions([]); setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  const handleToggleGuests = useCallback(() => {
    setShowGuestsModal((p) => !p);
  }, []);

  const updateGuests = useCallback((type, action) => {
    setGuests((prev) => {
      const newVal = action === "increment" ? prev[type] + 1 : prev[type] - 1;
      if (type === "rooms"    && (newVal < 1 || newVal > maxRooms)) return prev;
      if (type === "adults"   && (newVal < 1 || newVal > maxAdultsPerRoom * prev.rooms)) return prev;
      if (type === "children" && (newVal < 0 || newVal > maxChildrenPerRoom * prev.rooms)) return prev;
      return { ...prev, [type]: newVal };
    });
  }, [maxRooms, maxAdultsPerRoom, maxChildrenPerRoom]);

  const closeGuests = useCallback(() => setShowGuestsModal(false), []);

  const formatGuestsText = useMemo(() =>
    `${guests.rooms} Room${guests.rooms > 1 ? "s" : ""}, ${guests.adults} Adult${guests.adults > 1 ? "s" : ""}${
      guests.children > 0 ? `, ${guests.children} Child${guests.children > 1 ? "ren" : ""}` : ""
    }`,
    [guests]
  );

  /* ── search ── */
  const handleSearch = async () => {
    if (!location.trim())              { setError("Please enter a city or hotel name"); return; }
    if (!checkinDate || !checkoutDate) { setError("Please select check-in and check-out dates"); return; }
    if (checkoutDate <= checkinDate)   { setError("Check-out date must be after check-in date"); return; }
    setLoading(true); setError(null);
    try {
      let lat, lng;
      if (selectedCoords) {
        lat = selectedCoords.lat; lng = selectedCoords.lng;
      } else {
        const features = await fetchPhotonSuggestions(location.trim());
        if (!features?.length) throw new Error(`Location "${location.trim()}" not found. Please select from suggestions.`);
        [lng, lat] = features[0].geometry.coordinates;
      }
      const payload = {
        lat, lng,
        checkIn:  checkinDate.toISOString().split("T")[0],
        checkOut: checkoutDate.toISOString().split("T")[0],
        rooms:    guests.rooms,
        adults:   guests.adults,
        children: guests.children > 0 ? buildChildrenAges(guests.children) : [],
        radius:   20,
      };
      const response = await fetch("https://api.bobros.org/hotel/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        let errMsg = `Server error (${response.status})`;
        try { const b = JSON.parse(errText); errMsg = b?.message || b?.error || errMsg; } catch {}
        throw new Error(errMsg);
      }
      const data = await response.json();

      navigate("/hotels/results", {
        state: {
          location: location.trim(),
          checkinDate: checkinDate.toISOString().split("T")[0],
          checkoutDate: checkoutDate.toISOString().split("T")[0],
          guests, lat, lng,
          results: data,
        },
      });
    } catch (err) {
      console.error("❌ Hotel search error:", err);
      setError(err.message || "Failed to search hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dpBase = {
    disabled: loading,
    popperPlacement: "bottom-start",
    popperContainer: CalendarPortal,
    popperModifiers: [
      { name: "offset",          options: { offset: [0, 0] } },
      { name: "preventOverflow", options: { enabled: false } },
      { name: "flip",            options: { enabled: false } },
    ],
  };

  return (
    <>
      <GuestsModal
        modalRef={guestsModalRef}
        pos={modalPos}
        show={showGuestsModal}
        guests={guests}
        maxRooms={maxRooms}
        maxAdultsPerRoom={maxAdultsPerRoom}
        maxChildrenPerRoom={maxChildrenPerRoom}
        onUpdate={updateGuests}
        onClose={closeGuests}
      />

      <section className="relative min-h-[540px] md:min-h-[500px] lg:min-h-[460px] flex items-center justify-center py-4 md:py-0 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')` }}
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-2 sm:mb-6 text-white">
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mt-2 md:mt-12 lg:-mt-6">
              Stay Comfortably, Travel Happily
            </h1>
            <p className="text-xs sm:text-sm md:text-lg opacity-90 mt-1 sm:mt-2">
              Find the perfect hotels with BOBROS
            </p>
          </div>

          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 pb-8 border border-white/20">

            <div className="flex flex-nowrap md:flex-wrap items-center justify-between md:justify-start gap-1.5 sm:gap-2 md:gap-3 mb-6 md:mb-8">
              {tabs.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => { setActiveTab(id); navigate(tabRoutes[id]); }}
                    title={label} aria-label={label}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-0 md:gap-1.5 lg:gap-2
                      py-2 px-2.5 md:px-2.5 lg:px-4 xl:px-5 md:py-1.5 lg:py-2 xl:py-2.5
                      cursor-pointer rounded-xl md:rounded-full text-[11px] md:text-xs lg:text-sm font-semibold
                      transition-all duration-300 border ${
                        active
                          ? "bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white border-transparent shadow-lg lg:scale-105"
                          : "border-gray-200 text-gray-600 hover:border-[#FD561E] hover:text-[#FD561E] bg-white/80"
                      }`}
                  >
                    <Icon className="w-6 h-6 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
                    <span className="hidden md:inline">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden md:block">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">

                <div ref={desktopLocColRef} className="col-span-1 md:col-span-1 lg:col-span-4 group relative">
                  <label className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E] block">
                    City / Hotel Name
                  </label>
                  <div className="pb-1.5 border-b transition-colors duration-300 border-gray-200 group-hover:border-[#FD561E]">
                    <LocationInputRow
                      inputRef={inputRef}
                      value={location}
                      onChange={handleLocationChange}
                      onFocus={handleLocationFocus}
                      onKeyDown={handleLocationKeyDown}
                      onClear={handleClearLocation}
                      isLoading={suggestionsLoading}
                      disabled={loading}
                      inputClassName="text-sm sm:text-base font-semibold py-1"
                    />
                  </div>
                  <div className="h-4 mt-0.5" />
                  <SuggestionsDropdown
                    anchorRef={desktopLocColRef}
                    show={showSuggestions}
                    isLoading={suggestionsLoading}
                    suggestions={suggestions}
                    activeIndex={activeIndex}
                    onSelect={handleSelectSuggestion}
                    onHover={handleHover}
                  />
                </div>

                <div ref={checkinFieldRef} className="col-span-1 md:col-span-1 lg:col-span-3 group relative">
                  <label className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E] block">
                    Check-in Date
                  </label>
                  <div className="flex items-center gap-2 pb-1.5 border-b transition-colors duration-300 border-gray-200 group-hover:border-[#FD561E]">
                    <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 group-hover:text-[#FD561E] flex-shrink-0" />
                    <DatePicker
                      {...dpBase}
                      selected={checkinDate}
                      onChange={setCheckinDate}
                      className="w-full text-sm sm:text-base font-semibold outline-none bg-transparent py-1 cursor-pointer"
                      dateFormat="EEE, dd MMM yyyy"
                      minDate={new Date()}
                      placeholderText="Select date"
                      onCalendarOpen={() => setOpenCal("checkin")}
                      onCalendarClose={() => setOpenCal(null)}
                    />
                  </div>
                  <div className="h-4 mt-0.5" />
                </div>

                <div ref={checkoutFieldRef} className="col-span-1 md:col-span-1 lg:col-span-3 group relative">
                  <label className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E] block">
                    Check-out Date
                  </label>
                  <div className="flex items-center gap-2 pb-1.5 border-b transition-colors duration-300 border-gray-200 group-hover:border-[#FD561E]">
                    <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 group-hover:text-[#FD561E] flex-shrink-0" />
                    <DatePicker
                      {...dpBase}
                      selected={checkoutDate}
                      onChange={setCheckoutDate}
                      className="w-full text-sm sm:text-base font-semibold outline-none bg-transparent py-1 cursor-pointer"
                      dateFormat="EEE, dd MMM yyyy"
                      minDate={checkinDate}
                      placeholderText="Select date"
                      onCalendarOpen={() => setOpenCal("checkout")}
                      onCalendarClose={() => setOpenCal(null)}
                    />
                  </div>
                  <div className="h-4 mt-0.5" />
                </div>

                <div className="col-span-1 md:col-span-1 lg:col-span-2 group relative">
                  <label className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E] block">
                    Guests & Rooms
                  </label>
                  <div
                    ref={desktopGuestsTriggerRef}
                    onClick={handleToggleGuests}
                    className="flex items-center justify-between gap-2 pb-1.5 border-b transition-colors duration-300 border-gray-200 group-hover:border-[#FD561E] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 group-hover:text-[#FD561E] flex-shrink-0" />
                      <span className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                        {formatGuestsText}
                      </span>
                    </div>
                    <FaChevronDown className={`text-gray-400 w-3 h-3 transition-all duration-200 ${showGuestsModal ? "rotate-180" : ""}`} />
                  </div>
                  <div className="h-4 mt-0.5" />
                </div>
              </div>

              {error && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium text-xs">{error}</p>
                </div>
              )}
            </div>

            <div className="md:hidden space-y-3">
              <div ref={mobileLocBoxRef} className="border border-gray-300 rounded-xl bg-white px-3 py-2">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest block">
                  City / Hotel Name
                </label>
                <div className="mt-0.5">
                  <LocationInputRow
                    inputRef={inputRef}
                    value={location}
                    onChange={handleLocationChange}
                    onFocus={handleLocationFocus}
                    onKeyDown={handleLocationKeyDown}
                    onClear={handleClearLocation}
                    isLoading={suggestionsLoading}
                    disabled={loading}
                    inputClassName="text-sm font-semibold py-1"
                  />
                </div>
                <SuggestionsDropdown
                  anchorRef={mobileLocBoxRef}
                  show={showSuggestions}
                  isLoading={suggestionsLoading}
                  suggestions={suggestions}
                  activeIndex={activeIndex}
                  onSelect={handleSelectSuggestion}
                  onHover={handleHover}
                />
              </div>

              <div className="border border-gray-300 rounded-xl bg-white px-3 py-2">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest block">Check-in Date</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0" />
                  <DatePicker
                    {...dpBase}
                    selected={checkinDate}
                    onChange={setCheckinDate}
                    className="w-full text-sm font-semibold outline-none bg-transparent py-1 cursor-pointer"
                    dateFormat="dd MMM yyyy"
                    minDate={new Date()}
                    placeholderText="Select date"
                    onCalendarOpen={() => setOpenCal("checkin")}
                    onCalendarClose={() => setOpenCal(null)}
                  />
                </div>
              </div>

              <div className="border border-gray-300 rounded-xl bg-white px-3 py-2">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest block">Check-out Date</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0" />
                  <DatePicker
                    {...dpBase}
                    selected={checkoutDate}
                    onChange={setCheckoutDate}
                    className="w-full text-sm font-semibold outline-none bg-transparent py-1 cursor-pointer"
                    dateFormat="dd MMM yyyy"
                    minDate={checkinDate}
                    placeholderText="Select date"
                    onCalendarOpen={() => setOpenCal("checkout")}
                    onCalendarClose={() => setOpenCal(null)}
                  />
                </div>
              </div>

              <div className="border border-gray-300 rounded-xl bg-white px-3 py-2">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest block">Guests & Rooms</label>
                <div
                  ref={mobileGuestsTriggerRef}
                  onClick={handleToggleGuests}
                  className="flex items-center justify-between mt-0.5 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400 w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-800">{formatGuestsText}</span>
                  </div>
                  <FaChevronDown className={`text-gray-400 w-3 h-3 transition-all duration-200 ${showGuestsModal ? "rotate-180" : ""}`} />
                </div>
              </div>

              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium text-xs">{error}</p>
                </div>
              )}
            </div>

            <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-gradient-to-r  cursor-pointer from-[#FD561E] to-[#ff7b4a] text-white px-6 sm:px-8 md:px-10 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
              >
                {loading ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /><span>SEARCHING…</span></>
                ) : (
                  <span>SEARCH</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HotelHeroSection;