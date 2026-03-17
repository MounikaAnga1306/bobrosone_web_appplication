import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { filterBuses } from "../utils/filterBuses";

import SearchBar from "../components/SearchBar";
import FiltersSidebar from "../components/FiltersSidebar";
import SortBar from "../components/SortBar";
import BusResultCard from "../components/BusResultCard";
import SeatBookingLayout from "./SeatBookingLayout";

import { searchTrips,sortTrips } from "../services/BustripService";

export default function BusResultsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [sortType, setSortType] = useState("Low to High");
  const [allTrips, setAllTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);

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

  // IDs for API
  const fromId = searchParams.get("source");
  const toId = searchParams.get("destination");
  const date = searchParams.get("doj");

  // Names for display
  const fromName = location.state?.sourceName || "";
  const toName = location.state?.destinationName || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [seatPanelOpen, setSeatPanelOpen] = useState(false);



//   const [busName, setBusName] = useState("");
// const [departureTime, setDepartureTime] = useState("");
// const [arrivalTime, setArrivalTime] = useState("");
// const [duration, setDuration] = useState("");
// const [busType, setBusType] = useState("");

  const handleSeatOpen = (tripId) => {
    setSelectedTripId(tripId);
    setSeatPanelOpen(true);
  };

  // Parse HHMM string to HH:MM 24-hour format, normalize minutes > 59
  const minutesToTime = (minutes) => {
  const totalMinutes = Number(minutes);

  const hrs24 = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;

  const period = hrs24 >= 12 ? "PM" : "AM";

  const hrs12 = hrs24 % 12 || 12;

  return `${hrs12}:${String(mins).padStart(2, "0")} ${period}`;
};

  useEffect(() => {
    if (!fromName || !toName || !date) {
      setError("Missing search parameters");
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
            : "Failed to fetch trips. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [fromId, toId, date, fromName, toName]);

  const applyFilters = (trips, filters) => {
  return trips.filter((trip) => {

    // Normalize text
    const busType = (trip.busType || "")
      .toLowerCase()
      .replaceAll("/", "")
      .replaceAll("-", "")
      .trim();

    // Detect types
    const isNonAC = busType.includes("non ac");
    const isAC = busType.includes("ac") && !isNonAC;

    const isSeater = busType.includes("seater");
    const isSleeper = busType.includes("sleeper");

    // AC filter
    if (filters.ac && !filters.nonAc && !isAC) return false;

    // Non AC filter
    if (filters.nonAc && !filters.ac && !isNonAC) return false;

    // Seater filter
    if (filters.seater && !filters.sleeper && !isSeater) return false;

    // Sleeper filter
    if (filters.sleeper && !filters.seater && !isSleeper) return false;

    return true;
  });
};
useEffect(() => {

  // 1. Apply filters
  let result = filterBuses(allTrips, filters);

  // 2. Apply sorting
  result = sortTrips(result, sortType);

  // 3. Update trips
  setFilteredTrips(result);

}, [filters, allTrips, sortType]);


  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <SearchBar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-[280px] shrink-0">
          <FiltersSidebar onFilterChange={setFilters} />
          </div>

          {/* Results Section */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
           <SortBar busCount={filteredTrips.length} onSortChange={setSortType} />

            {/* Loading */}
            {loading && (
              <p className="text-center py-20 text-gray-500">
                Loading trips...
              </p>
            )}

            {/* Error */}
            {!loading && error && (
              <p className="text-center py-20 text-red-600">{error}</p>
            )}

            {/* Results */}
            {!loading && !error && (
              <div className="mt-4 space-y-4">
                {filteredTrips.map((trip,index) => (
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
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <SeatBookingLayout
        tripId={selectedTripId}
        open={seatPanelOpen}
        onClose={() => setSeatPanelOpen(false)}
        fromCity={fromName}
        toCity={toName}
        source={fromId}
        destination={toId}
        date={date}
      />
    </div>
  );
}
