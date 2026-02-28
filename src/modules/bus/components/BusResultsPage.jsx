import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchTrips } from "../../bus/services/BustripService";

export default function BusResultsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const from = searchParams.get("source");
  const to = searchParams.get("destination");
  const date = searchParams.get("doj");

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!from || !to || !date) {
      setError("Missing search parameters");
      setLoading(false);
      return;
    }

    const fetchTrips = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await searchTrips(from, to, date);
        if (!data.length) setError("No trips found for this route.");
        setTrips(data || []);
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
  }, [from, to, date]);

  if (loading) return <p className="p-10 text-center">Loading trips...</p>;
  if (error) return <p className="p-10 text-center text-red-600">{error}</p>;
  if (!trips.length) return <p className="p-10 text-center">No trips found</p>;

  return (
    <div className="p-6 space-y-4">
      {trips.map((trip, idx) => (
        <div key={idx} className="border p-4 rounded-lg shadow-sm">
          <h3>{trip.travels}</h3>
          <p>Bus Number: {trip.busNumber}</p>
          <p>Departure: {trip.departureTime}</p>
          <p>Arrival: {trip.arrivalTime}</p>
          <p>Seats Available: {trip.availableSeats}</p>
          <p>Fare: ₹ {trip.fare}</p>
        </div>
      ))}
    </div>
  );
}
