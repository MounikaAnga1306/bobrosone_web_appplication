import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import FiltersSidebar from "../components/FiltersSidebar";
import SortBar from "../components/SortBar";
import BusResultCard from "../components/BusResultCard";
import SeatBookingLayout from "./SeatBookingLayout";

import { searchTrips } from "../services/BustripService";

export default function BusResultsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

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

  const handleSeatOpen = (tripId) => {
    setSelectedTripId(tripId);
    setSeatPanelOpen(true);
  };

  // Parse HHMM string to HH:MM 24-hour format, normalize minutes > 59
  const parseTime = (hhmm) => {
    if (!hhmm) return "";
    hhmm = hhmm.toString().padStart(4, "0");
    let hrs = parseInt(hhmm.slice(0, 2), 10);
    let mins = parseInt(hhmm.slice(2), 10);

    if (mins >= 60) {
      hrs += Math.floor(mins / 60);
      mins = mins % 60;
    }
    hrs = hrs % 24; // wrap around 24h
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
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
        //console.log("API response:", data);

        if (!data || !data.length) {
          setError("No trips found for this route.");
          setTrips([]);
        } else {
          setTrips(data);
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

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <SearchBar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-[280px] shrink-0">
            <FiltersSidebar />
          </div>

          {/* Results Section */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <SortBar busCount={trips.length} />

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
                {trips.map((trip, index) => (
                  <BusResultCard
                    key={index}
                    id={trip.id}
                    operator={trip.travels}
                    type={trip.busType || "Bus"}
                    departure={parseTime(trip.departureTime)}
                    departureCity={fromName}
                    arrival={parseTime(trip.arrivalTime)}
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
      />
    </div>
  );
}
