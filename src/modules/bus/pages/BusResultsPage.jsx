import { useEffect, useState } from "react";
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

export default function BusResultsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [sortType, setSortType] = useState("Low to High");
  const [allTrips, setAllTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Active filters that are applied to results
  const [filters, setFilters] = useState({
    ac: false,
    nonAc: false,
    seater: false,
    sleeper: false,
    primo: false,
    evening: false,
    depTime: new Set(),
    arrTime: new Set(),
    boarding: new Set(),
    dropping: new Set(),
    ops: new Set(),
  });

  // Temporary filters for mobile modal
  const [tempFilters, setTempFilters] = useState(null);

  const fromId = searchParams.get("source");
  const toId = searchParams.get("destination");
  const date = searchParams.get("doj");

  // ✅ FIX: Read city names from multiple sources
  // 1. React Router state (for client‑side navigation)
  // 2. URL query parameters (if passed directly)
  // 3. sessionStorage (for full page reload from PopularBusRoutes)
  const fromName =
    location.state?.sourceName ||
    searchParams.get("fromName") ||
    sessionStorage.getItem("sourceName") ||
    "";
  const toName =
    location.state?.destinationName ||
    searchParams.get("toName") ||
    sessionStorage.getItem("destinationName") ||
    "";

  // Clear sessionStorage after reading to avoid stale data on next navigation
  useEffect(() => {
    if (fromName && toName) {
      sessionStorage.removeItem("sourceName");
      sessionStorage.removeItem("destinationName");
    }
  }, [fromName, toName]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [seatPanelOpen, setSeatPanelOpen] = useState(false);

  const handleSeatOpen = (tripId) => {
    setSelectedTripId(tripId);
    setSeatPanelOpen(true);
  };

  const minutesToTime = (minutes) => {
    const totalMinutes = Number(minutes);
    const hrs24 = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const period = hrs24 >= 12 ? "PM" : "AM";
    const hrs12 = hrs24 % 12 || 12;
    return `${hrs12}:${String(mins).padStart(2, "0")} ${period}`;
  };

  useEffect(() => {
    // We only need the IDs and date to fetch trips – city names are for display only
    if (!fromId || !toId || !date) {
      setError("Missing search parameters (source/destination/date).");
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
        {
          sourceName: location.state.sourceName,
          destinationName: location.state.destinationName,
        },
        document.title
      );
    }
  }, [location.state]);

  // Handle filter change from sidebar (for desktop/iPad - immediate apply)
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle temporary filter change from mobile modal
  const handleTempFilterChange = (newFilters) => {
    setTempFilters(newFilters);
  };

  // Apply filters from mobile modal and close
  const applyMobileFilters = () => {
    if (tempFilters) {
      setFilters(tempFilters);
    }
    setMobileFiltersOpen(false);
  };

  // Open mobile modal and copy current filters to temp
  const openMobileFilters = () => {
    // Deep copy the filters including Sets
    const copiedFilters = {
      ac: filters.ac,
      nonAc: filters.nonAc,
      seater: filters.seater,
      sleeper: filters.sleeper,
      primo: filters.primo,
      evening: filters.evening,
      depTime: new Set(filters.depTime),
      arrTime: new Set(filters.arrTime),
      boarding: new Set(filters.boarding),
      dropping: new Set(filters.dropping),
      ops: new Set(filters.ops),
    };
    setTempFilters(copiedFilters);
    setMobileFiltersOpen(true);
  };

  // Sort options for mobile
  const sortOptionsList = [
    { label: "Early Departure", value: "Early Departure" },
    { label: "Late Departure", value: "Late Departure" },
    { label: "Price: High to Low", value: "High to Low" },
    { label: "Price: Low to High", value: "Low to High" },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] overflow-x-hidden">
      <SearchBar
        key={`${fromName}-${toName}-${date}`}
        defaultFrom={fromName}
        defaultTo={toName}
        defaultDate={date}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* For mobile only - compact filters and sort bar */}
        <div className="md:hidden mb-3">
          <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
            {/* Showing buses text on top - smaller text */}
            <div className="text-center mb-2">
              <h2 className="text-xs font-medium text-gray-700">
                Showing <span className="font-bold text-[#fd561e]">{filteredTrips.length}</span>{" "}
                bus{filteredTrips.length !== 1 ? "es" : ""}
              </h2>
            </div>
            
            {/* Filters and Sort by in same row - compact */}
            <div className="flex gap-2">
              {/* Filters button */}
              <button
                onClick={openMobileFilters}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
              </button>
              
              {/* Sort dropdown */}
              <div className="flex-1 relative">
                <button
                  id="mobile-sort-btn"
                  className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    const dropdown = document.getElementById('mobile-sort-dropdown');
                    if (dropdown) {
                      dropdown.classList.toggle('hidden');
                    }
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <span>Sort by: </span>
                    <span className="font-medium text-[#fd561e]">
                      {sortOptionsList.find(opt => opt.value === sortType)?.label || "Sort by"}
                    </span>
                  </span>
                  <svg className="w-3.5 h-3.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div id="mobile-sort-dropdown" className="hidden absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {sortOptionsList.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortType(option.value);
                        document.getElementById('mobile-sort-dropdown')?.classList.add('hidden');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                        sortType === option.value
                          ? "bg-[#fd561e] text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      } ${option.value === "Early Departure" ? "rounded-t-lg" : ""} ${
                        option.value === "Price: Low to High" ? "rounded-b-lg" : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For iPad and desktop: show sidebar + results in flex row */}
        <div className="hidden md:flex gap-6">
          {/* Sidebar - fixed width on left (visible on iPad and desktop) */}
          <div className="w-[280px] shrink-0">
            <FiltersSidebar onFilterChange={handleFilterChange} trips={allTrips} />
          </div>

          {/* Results - takes remaining space */}
          <div className="flex-1 min-w-0">
            <SortBar busCount={filteredTrips.length} onSortChange={setSortType} />
            
            {loading && (
              <div className="relative py-28 overflow-hidden">
                <div className="absolute bottom-10 left-0 w-full h-[4px] bg-gray-400" />
                <motion.div
                  initial={{ x: "-120%" }}
                  animate={{ x: "110vw" }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "linear",
                  }}
                  className="absolute bottom-10"
                >
                  <span className="text-6xl leading-none">🚌</span>
                </motion.div>
              </div>
            )}

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

        {/* For mobile only: show results without sidebar */}
        <div className="md:hidden">
          {loading && (
            <div className="relative py-28 overflow-hidden">
              <div className="absolute bottom-10 left-0 w-full h-[4px] bg-gray-400" />
              <motion.div
                initial={{ x: "-120%" }}
                animate={{ x: "110vw" }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "linear",
                }}
                className="absolute bottom-10"
              >
                <span className="text-6xl leading-none">🚌</span>
              </motion.div>
            </div>
          )}

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

      {/* Mobile Filter Modal with persistence */}
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
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-3">
              <FiltersSidebar 
                onFilterChange={handleTempFilterChange} 
                trips={allTrips}
                externalFilters={tempFilters}
                key={mobileFiltersOpen ? "modal-open" : "modal-closed"}
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
        operator={allTrips.find(t => t.id === selectedTripId)?.travels} 
      />
    </div>
  );
}