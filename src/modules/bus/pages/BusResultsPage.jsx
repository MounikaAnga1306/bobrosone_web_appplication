import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import FiltersSidebar from "../components/FiltersSidebar";
import SortBar from "../components/SortBar";
import BusResultCard from "../components/BusResultCard";
import SeatBookingLayout from "./SeatBookingLayout";

import { searchTrips,sortTrips } from "../services/BustripService";

export default function BusResultsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [sortType, setSortType] = useState("Low to Hight");
  const [allTrips, setAllTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);

const [filters, setFilters] = useState({
  ac: false,
  nonAc: false,
  seater: false,
  sleeper: false
});

  // IDs for API
  const fromId = searchParams.get("source");
  const toId = searchParams.get("destination");
  const date = searchParams.get("doj");

  // Names for display
  const fromName = location.state?.sourceName || "";
  const toName = location.state?.destinationName || "";

  const [trips, setTrips] = useState([]);
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
        setAllTrips(data);
        setFilteredTrips(data);
        //console.log("API response:", data);

        if (!data || !data.length) {
          setError("No trips found for this route.");
          setTrips([]);
        } else {
         setAllTrips(data);
         setTrips(sortTrips(data, "Low to High"));
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

    if (filters.ac && !trip.AC) return false;

    if (filters.nonAc && !trip.nonAC) return false;

    if (filters.seater && !trip.seater) return false;

    if (filters.sleeper && !trip.sleeper) return false;

    return true;

  });
};
useEffect(() => {

  const result = applyFilters(allTrips, filters);

  setFilteredTrips(result);

}, [filters, allTrips]);

 useEffect(() => {
  setTrips((prevTrips) => sortTrips(prevTrips, sortType));
}, [sortType]);

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
           <SortBar
            busCount={trips.length}
            onSortChange={setSortType}
          />

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
