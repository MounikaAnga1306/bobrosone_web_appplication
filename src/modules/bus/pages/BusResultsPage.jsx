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

  // ── Reset filters when route changes (Modify Search) ──────────────────────
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

  // ── Fetch trips ────────────────────────────────────────────────────────────
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

  // ── Apply filters + sort ───────────────────────────────────────────────────
  useEffect(() => {
    let result = filterBuses(allTrips, filters);
    result = sortTrips(result, sortType);
    setFilteredTrips(result);
  }, [filters, allTrips, sortType]);

  // ── Re-open seat panel on back navigation ─────────────────────────────────
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

  // ── Filter handlers ────────────────────────────────────────────────────────
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

  // ── Sticky sidebar — measure SearchBar height ──────────────────────────────
  const searchBarRef = useRef(null);
  const [sidebarTop, setSidebarTop] = useState(88);

  useEffect(() => {
    const el = searchBarRef.current;
    if (!el) return;
    const update = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setSidebarTop(h + 16);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f5f9]">

      {/* Orange scrollbar for sidebar — webkit + firefox */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 999px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 999px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>

      <div ref={searchBarRef}>
        <SearchBar
          key={`${fromName}-${toName}-${date}`}
          defaultFrom={fromName}
          defaultTo={toName}
          defaultDate={date}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Mobile: compact filter + sort bar ── */}
        <div className="md:hidden mb-3">
          <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
            <div className="text-center mb-2">
              <h2 className="text-xs font-medium text-gray-700">
                Showing{" "}
                <span className="font-bold text-[#fd561e]">{filteredTrips.length}</span>{" "}
                bus{filteredTrips.length !== 1 ? "es" : ""}
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
                  onClick={() => {
                    document.getElementById("mobile-sort-dropdown")?.classList.toggle("hidden");
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <span>Sort: </span>
                    <span className="font-medium text-[#fd561e]">
                      {sortOptionsList.find((o) => o.value === sortType)?.label}
                    </span>
                  </span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
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

        {/* ── iPad / Desktop: sidebar + results ── */}
        <div className="hidden md:flex gap-6 items-start">

          {/* ── Sticky Sidebar with orange scrollbar ── */}
          <div
            className="w-[280px] shrink-0 sidebar-scroll"
            style={{
              position:      "sticky",
              top:           `${sidebarTop}px`,
              alignSelf:     "flex-start",
              maxHeight:     `calc(100vh - ${sidebarTop}px - 8px)`,
              overflowY:     "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#9ca3af #f1f1f1",
            }}
          >
            <FiltersSidebar
              key={filterSidebarKey}
              onFilterChange={handleFilterChange}
              trips={allTrips}
            />
          </div>

          {/* ── Results ── */}
          <div className="flex-1 min-w-0">
            <SortBar busCount={filteredTrips.length} onSortChange={setSortType} />

            {loading && <BusAnimation />}
            {!loading && error && (
              <p className="text-center py-20 text-red-600">{error}</p>
            )}
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
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile: results only ── */}
        <div className="md:hidden">
          {loading && <BusAnimation />}
          {!loading && error && (
            <p className="text-center py-20 text-red-600">{error}</p>
          )}
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
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Mobile Filter Modal ── */}
      {mobileFiltersOpen && tempFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white rounded-t-xl shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex justify-between items-center">
              <h2 className="text-base font-semibold">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-3">
              <FiltersSidebar
                key={`modal-${filterSidebarKey}`}
                onFilterChange={handleTempFilterChange}
                trips={allTrips}
                externalFilters={tempFilters}
              />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
              <button
                onClick={applyMobileFilters}
                className="w-full py-2.5 bg-[#FD561E] text-white rounded-lg font-medium text-sm hover:bg-[#e04c1a] transition-colors"
              >
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

function BusAnimation() {
  return (
    <div className="relative py-28 overflow-hidden">
      <div className="absolute bottom-10 left-0 w-full h-[4px] bg-gray-400" />
      <motion.div
        initial={{ x: "-120%" }}
        animate={{ x: "110vw" }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute bottom-10"
      >
        <span className="text-6xl leading-none">🚌</span>
      </motion.div>
    </div>
  );
}