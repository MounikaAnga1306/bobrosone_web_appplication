import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { filterBuses } from "../utils/filterBuses";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";

import SearchBar from "../components/SearchBar";
import FiltersSidebar from "../components/FiltersSidebar";
import SortBar from "../components/SortBar";
import BusResultCard from "../components/BusResultCard";
import SeatBookingLayout from "./SeatBookingLayout";

import { searchTrips, sortTrips } from "../services/BustripService";

const EMPTY_FILTERS = () => ({
  ac: false, nonAc: false, seater: false, sleeper: false,
  primo: false, evening: false,
  singleSeater: false, singleSleeper: false,
  depTime: new Set(), arrTime: new Set(), boarding: new Set(),
  dropping: new Set(), ops: new Set(), amens: new Set(),
});

const NAVBAR_OFFSET = 0;

const isPrimoTrip = (trip) => trip?.primo === true || trip?.primo === "true";

export default function BusResultsPage() {
  const location     = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const fromId = searchParams.get("source");
  const toId   = searchParams.get("destination");
  const date   = searchParams.get("doj");

  const fromName =
    location.state?.sourceName      ||
    searchParams.get("fromName")    ||
    sessionStorage.getItem("sourceName") || "";
  const toName =
    location.state?.destinationName ||
    searchParams.get("toName")      ||
    sessionStorage.getItem("destinationName") || "";

  useEffect(() => {
    if (fromName && toName) {
      sessionStorage.removeItem("sourceName");
      sessionStorage.removeItem("destinationName");
    }
  }, [fromName, toName]);

  const [sortType,          setSortType]         = useState("Low to High");
  const [allTrips,          setAllTrips]          = useState([]);
  const [filteredTrips,     setFilteredTrips]     = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters,           setFilters]           = useState(EMPTY_FILTERS);
  const [tempFilters,       setTempFilters]       = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState("");
  const [selectedTripId,    setSelectedTripId]    = useState(null);
  const [seatPanelOpen,     setSeatPanelOpen]     = useState(false);
  const [filterSidebarKey,  setFilterSidebarKey]  = useState(0);

  const prevRouteRef = useRef(`${fromId}|${toId}|${date}`);
  useEffect(() => {
    const current = `${fromId}|${toId}|${date}`;
    if (prevRouteRef.current !== current) {
      prevRouteRef.current = current;
      setFilters(EMPTY_FILTERS());
      setFilterSidebarKey((k) => k + 1);
    }
  }, [fromId, toId, date]);

  const handleSeatOpen = (tripId) => {
    setSelectedTripId(tripId);
    setSeatPanelOpen(true);
  };

  const minutesToTime = (minutes) => {
    const totalMinutes = Number(minutes);
    const hrs24 = Math.floor(totalMinutes / 60) % 24;
    const mins  = totalMinutes % 60;
    const period = hrs24 >= 12 ? "PM" : "AM";
    const hrs12  = hrs24 % 12 || 12;
    return `${hrs12}:${String(mins).padStart(2, "0")} ${period}`;
  };

  useEffect(() => {
    if (!fromId || !toId || !date) {
      setError("Missing search parameters.");
      setLoading(false);
      return;
    }
    const fetchTrips = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await searchTrips(fromId, toId, date);
        if (!data || !data.length) {
          setError("No trips found for this route.");
          setAllTrips([]);
          setFilteredTrips([]);
        } else {
          setAllTrips(data);
          setFilteredTrips(data);
        }
      } catch (err) {
        console.error(err);
        setError(
          err.message === "HTTP 404"
            ? "No trips available for this route."
            : "Failed to fetch trips. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [fromId, toId, date]);

  useEffect(() => {
    let result = filterBuses(allTrips, filters);
    result = sortTrips(result, sortType);
    setFilteredTrips(result);
  }, [filters, allTrips, sortType]);

  useEffect(() => {
    if (location.state?.reopenSeat && location.state?.tripId) {
      setSelectedTripId(location.state.tripId);
      setSeatPanelOpen(true);
      window.history.replaceState(
        { sourceName: location.state.sourceName, destinationName: location.state.destinationName },
        document.title
      );
    }
  }, [location.state]);

  const handleFilterChange = (f) => {
    setFilters(f);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleTempFilterChange = (f) => setTempFilters(f);

  const openMobileFilters = () => {
    setTempFilters({
      ...filters,
      depTime:  new Set(filters.depTime),
      arrTime:  new Set(filters.arrTime),
      boarding: new Set(filters.boarding),
      dropping: new Set(filters.dropping),
      ops:      new Set(filters.ops),
      amens:    new Set(filters.amens),
    });
    setMobileFiltersOpen(true);
  };

  const applyMobileFilters = () => {
    if (tempFilters) setFilters(tempFilters);
    setMobileFiltersOpen(false);
  };

  const sortOptionsList = [
    { label: "Early Departure",    value: "Early Departure" },
    { label: "Late Departure",     value: "Late Departure"  },
    { label: "Price: High to Low", value: "High to Low"     },
    { label: "Price: Low to High", value: "Low to High"     },
  ];

  const searchBarRef = useRef(null);
  const [sidebarTop, setSidebarTop] = useState(96 + NAVBAR_OFFSET);

  useEffect(() => {
    const el = searchBarRef.current;
    if (!el) return;
    const update = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setSidebarTop(Math.round(h + 16 + NAVBAR_OFFSET));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 999px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 999px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>

      <div ref={searchBarRef} className="bg-[#f1f5f9] md:sticky md:z-30" style={{ top: NAVBAR_OFFSET }}>
        <SearchBar
          key={`${fromName}-${toName}-${date}`}
          defaultFrom={fromName}
          defaultTo={toName}
          defaultDate={date}
        />
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Mobile Filter Control Row */}
        <div className="md:hidden mb-3">
          <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
            <div className="text-center mb-2">
              <h2 className="text-xs font-medium text-gray-700">
                Showing <span className="font-bold text-[#fd561e]">{filteredTrips.length}</span> bus{filteredTrips.length !== 1 ? "es" : ""}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openMobileFilters}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
              </button>

              <div className="flex-1 relative">
                <button
                  id="mobile-sort-btn"
                  className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => document.getElementById("mobile-sort-dropdown")?.classList.toggle("hidden")}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="font-medium text-[#fd561e]">
                      {sortOptionsList.find((o) => o.value === sortType)?.label}
                    </span>
                  </span>
                </button>
                <div id="mobile-sort-dropdown" className="hidden absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {sortOptionsList.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortType(opt.value);
                        document.getElementById("mobile-sort-dropdown")?.classList.add("hidden");
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                        sortType === opt.value ? "bg-[#fd561e] text-white" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Workspace Splitter */}
        <div className="hidden md:flex gap-4 lg:gap-6 items-start">
          <div
            className="w-[240px] lg:w-[280px] shrink-0 sidebar-scroll"
            style={{
              position:       "sticky",
              top:            `${sidebarTop}px`,
              alignSelf:      "flex-start",
              maxHeight:      `calc(100vh - ${sidebarTop}px - 16px)`,
              overflowY:      "auto",
            }}
          >
            <FiltersSidebar key={filterSidebarKey} onFilterChange={handleFilterChange} trips={allTrips} />
          </div>

          <div className="flex-1 min-w-0">
            <SortBar busCount={filteredTrips.length} onSortChange={setSortType} />

            {loading && <BusLoadingScreen fromLocation={fromName || "Hyderabad"} toLocation={toName || "Vijayawada"} />}
            
            {!loading && error && <p className="text-center py-20 text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="mt-4 space-y-4">
                {filteredTrips.map((trip, index) => (
                  <BusResultCard
                    key={trip.id || index}
                    id={trip.id}
                    operator={trip.travels}
                    type={trip.busType || "Bus"}
                    departure={minutesToTime(trip.departureTime)}
                    departureCity={fromName}
                    arrival={minutesToTime(trip.arrivalTime)}
                    arrivalCity={toName}
                    duration={trip.duration || ""}
                    price={Number(trip.fare || 0)}
                    seatsLeft={Number(trip.availableSeats || 0)}
                    onSelectSeat={handleSeatOpen}
                    cancellationPolicyParsed={trip.cancellationPolicyParsed}
                    primo={isPrimoTrip(trip)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Screen List Rendering */}
        <div className="md:hidden">
          {loading && <BusLoadingScreen fromLocation={fromName || "Hyderabad"} toLocation={toName || "Vijayawada"} />}
          {!loading && error && <p className="text-center py-20 text-red-600">{error}</p>}
          {!loading && !error && (
            <div className="space-y-3">
              {filteredTrips.map((trip, index) => (
                <BusResultCard
                  key={trip.id || index}
                  id={trip.id}
                  operator={trip.travels}
                  type={trip.busType || "Bus"}
                  departure={minutesToTime(trip.departureTime)}
                  departureCity={fromName}
                  arrival={minutesToTime(trip.arrivalTime)}
                  arrivalCity={toName}
                  duration={trip.duration || ""}
                  price={Number(trip.fare || 0)}
                  seatsLeft={Number(trip.availableSeats || 0)}
                  onSelectSeat={handleSeatOpen}
                  cancellationPolicyParsed={trip.cancellationPolicyParsed}
                  primo={isPrimoTrip(trip)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Modal Filter Drawer Wrapper */}
      {mobileFiltersOpen && tempFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white rounded-t-xl shadow-xl">
            <div className="p-3">
              <FiltersSidebar key={`modal-${filterSidebarKey}`} onFilterChange={handleTempFilterChange} trips={allTrips} externalFilters={tempFilters} />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
              <button onClick={applyMobileFilters} className="w-full py-2.5 bg-[#FD561E] text-white rounded-lg font-medium text-sm">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <SeatBookingLayout
        tripId={selectedTripId}
        open={seatPanelOpen}
        onClose={() => setSeatPanelOpen(false)}
        fromCity={fromName}
        toCity={toName}
        source={fromId}
        destination={toId}
        date={date}
        operator={allTrips.find((t) => t.id === selectedTripId)?.travels}
      />
    </div>
  );
}

// 3/4 angled bus — paired wheels (far wheel tucked behind near wheel), skyline with windows
function BusLoadingScreen({ fromLocation = "Hyderabad", toLocation = "Vijayawada" }) {
  const Skyline = () => (
  <svg width="560" height="170" viewBox="0 0 560 170" fill="none" className="shrink-0">
    {/* Buildings — light brand-orange tint */}
    <g fill="#fde4d6">
      <rect x="0"   y="60"  width="50" height="110" rx="3" />
      <rect x="60"  y="25"  width="70" height="145" rx="3" />
      <rect x="75"  y="12"  width="22" height="14"  rx="2" />
      <rect x="140" y="75"  width="46" height="95"  rx="3" />
      <rect x="196" y="40"  width="80" height="130" rx="3" />
      <rect x="286" y="65"  width="52" height="105" rx="3" />
      <rect x="348" y="20"  width="74" height="150" rx="3" />
      <rect x="360" y="8"   width="24" height="13"  rx="2" />
      <rect x="432" y="55"  width="56" height="115" rx="3" />
      <rect x="498" y="80"  width="48" height="90"  rx="3" />
    </g>
    {/* Windows — lighter cream so they pop softly */}
    <g fill="#fff5ee">
      <rect x="72"  y="40" width="10" height="12" rx="1.5" /><rect x="90"  y="40" width="10" height="12" rx="1.5" /><rect x="108" y="40" width="10" height="12" rx="1.5" />
      <rect x="72"  y="62" width="10" height="12" rx="1.5" /><rect x="90"  y="62" width="10" height="12" rx="1.5" /><rect x="108" y="62" width="10" height="12" rx="1.5" />
      <rect x="72"  y="84" width="10" height="12" rx="1.5" /><rect x="108" y="84" width="10" height="12" rx="1.5" />
      <rect x="208" y="55" width="12" height="13" rx="1.5" /><rect x="230" y="55" width="12" height="13" rx="1.5" /><rect x="252" y="55" width="12" height="13" rx="1.5" />
      <rect x="208" y="80" width="12" height="13" rx="1.5" /><rect x="252" y="80" width="12" height="13" rx="1.5" />
      <rect x="208" y="105" width="12" height="13" rx="1.5" /><rect x="230" y="105" width="12" height="13" rx="1.5" />
      <rect x="362" y="35" width="11" height="12" rx="1.5" /><rect x="382" y="35" width="11" height="12" rx="1.5" /><rect x="402" y="35" width="11" height="12" rx="1.5" />
      <rect x="362" y="58" width="11" height="12" rx="1.5" /><rect x="402" y="58" width="11" height="12" rx="1.5" />
      <rect x="362" y="81" width="11" height="12" rx="1.5" /><rect x="382" y="81" width="11" height="12" rx="1.5" />
      <rect x="444" y="70" width="11" height="12" rx="1.5" /><rect x="464" y="70" width="11" height="12" rx="1.5" />
      <rect x="444" y="93" width="11" height="12" rx="1.5" />
    </g>
    {/* Clouds — soft peach */}
    <g fill="#fcd9c4">
      <ellipse cx="160" cy="18" rx="22" ry="8" />
      <ellipse cx="470" cy="26" rx="26" ry="9" />
    </g>
  </svg>
);

  return (
    <div className="fixed inset-0 w-full h-screen flex flex-col items-center justify-center bg-[#F4F7FA] overflow-hidden z-50 p-6">
      <style>{`
        .wheel-spokes {
          transform-box: fill-box;
          transform-origin: center;
          animation: wheelSpin 0.6s linear infinite;
        }
        @keyframes wheelSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="text-center mb-10 z-10 select-none">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-3 tracking-wide">
          <span>{fromLocation}</span>
          <span className="text-gray-400 font-light text-xl sm:text-2xl">→</span>
          <span>{toLocation}</span>
        </h2>
        <p className="text-gray-500 font-medium text-base mt-2 tracking-widest animate-pulse">
          Loading..
        </p>
      </div>

      <div className="relative w-full max-w-4xl h-56 flex items-end justify-center overflow-hidden">

        {/* Moving skyline with windows */}
        <motion.div
          animate={{ x: [0, -560] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute bottom-4 left-0 flex opacity-80 min-w-[300%]"
        >
          <Skyline /><Skyline /><Skyline /><Skyline />
        </motion.div>

        {/* Base Track */}
        <div className="absolute bottom-4 left-0 w-full h-[3px] bg-slate-200" />

        {/* Moving Bus (bounce) */}
        <motion.div
          
          className="relative z-10 bottom-[2px]"
        >
          <svg width="300" height="132" viewBox="0 0 300 132" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="loaderGlass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5d4842" />
                <stop offset="100%" stopColor="#43332e" />
              </linearGradient>
              <linearGradient id="loaderBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6a35" />
                <stop offset="100%" stopColor="#f24a0e" />
              </linearGradient>
            </defs>

            {/* Ground shadow */}
            <ellipse cx="150" cy="126" rx="120" ry="5" fill="#0F172A" fillOpacity="0.07" />

            {/* ══ FAR-SIDE wheels — tucked BEHIND near wheels, touching (pair look) ══ */}
            <g fill="#334155">
              <circle cx="92"  cy="109" r="12" />
              <circle cx="206" cy="109" r="12" />
            </g>
            <g fill="#64748b">
              <circle cx="92"  cy="109" r="5" />
              <circle cx="206" cy="109" r="5" />
            </g>

            {/* ── Main body — 3/4 view, front angled right ── */}
            <path
              d="M24 36
                 Q24 22 40 22
                 L202 22
                 Q220 22 226 38
                 L240 84
                 L240 98
                 Q240 108 228 108
                 L36 108
                 Q24 108 24 96
                 Z"
              fill="url(#loaderBody)"
            />

            {/* Roof highlight */}
            <path
              d="M40 22 L202 22 Q218 22 224 36 L224 38 Q218 27 202 27 L42 27 Q32 27 30 35 L30 31 Q32 22 40 22 Z"
              fill="#FFFFFF" opacity="0.35"
            />

            {/* Side window band */}
            <path d="M36 34 L192 34 Q204 34 208 46 L216 74 L36 74 Z" fill="url(#loaderGlass)" />
            <g stroke="#fd6c38" strokeWidth="3">
              <line x1="68"  y1="34" x2="68"  y2="74" />
              <line x1="100" y1="34" x2="100" y2="74" />
              <line x1="132" y1="34" x2="132" y2="74" />
              <line x1="164" y1="34" x2="164" y2="74" />
            </g>

            {/* Front windshield (angled face) */}
            <path d="M214 36 Q226 39 230 52 L238 80 L224 82 L210 44 Z" fill="url(#loaderGlass)" />

            {/* Bumper / lower trim */}
            <path
              d="M24 96 Q24 108 36 108 L228 108 Q240 108 240 98 L240 102 Q240 112 228 112 L36 112 Q24 112 24 100 Z"
              fill="#d63e0a"
            />

            {/* Headlight + mirror */}
            <rect x="226" y="88" width="10" height="13" rx="3" fill="#fff6e0" />
            <rect x="218" y="26" width="6"  height="12" rx="3" fill="#e8480f" />

            {/* ══ NEAR-SIDE wheels — dark tires, spinning spokes inside ══ */}
            {/* Wheel 1 */}
            <g>
              <circle cx="78" cy="112" r="16" fill="#1e293b" />
              <circle cx="78" cy="112" r="10" fill="#475569" />
              <g className="wheel-spokes">
                <line x1="78" y1="103" x2="78" y2="121" stroke="#cbd5e1" strokeWidth="2.5" />
                <line x1="69" y1="112" x2="87" y2="112" stroke="#cbd5e1" strokeWidth="2.5" />
              </g>
              <circle cx="78" cy="112" r="3.5" fill="#cbd5e1" />
            </g>
            {/* Wheel 2 */}
            <g>
              <circle cx="192" cy="112" r="16" fill="#1e293b" />
              <circle cx="192" cy="112" r="10" fill="#475569" />
              <g className="wheel-spokes">
                <line x1="192" y1="103" x2="192" y2="121" stroke="#cbd5e1" strokeWidth="2.5" />
                <line x1="183" y1="112" x2="201" y2="112" stroke="#cbd5e1" strokeWidth="2.5" />
              </g>
              <circle cx="192" cy="112" r="3.5" fill="#cbd5e1" />
            </g>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}