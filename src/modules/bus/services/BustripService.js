const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Format trips safely
export const formatTrips = (data) => {
  if (!data.availableTrips) return [];

  return data.availableTrips.map((trip) => {
    const faresArray = Array.isArray(trip.fares)
      ? trip.fares.map(Number)
      : [Number(trip.fares) || 0];

    return {
      id: trip.id,
      travels: trip.travels,
      busType: trip.busType,
      busNumber: trip.businfo?.busNumber || "N/A",
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      duration: trip.duration,
      availableSeats: trip.availableSeats,
      fare: Math.min(...faresArray),
      boardingPoint: trip.boardingTimes?.location || "",
    };
  });
};

// Search trips from backend
export const searchTrips = async (sourceId, destId, date) => {
  if (!sourceId || !destId || !date) {
    console.error("Missing parameters for searchTrips");
    return [];
  }

  const url = `${API_BASE}/searchTrips?source=${sourceId}&destination=${destId}&doj=${date}`;
  console.log("Calling API:", url);

  try {
    const res = await fetch(url);
    console.log("[searchTrips] Response status:", res.status, res.statusText);
     if (!res.ok) {
      console.error("[searchTrips] API returned an error:", res.status, res.statusText);
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
     console.log("[searchTrips] API returned data:", data);
    //return formatTrips(data);
     const formatted = formatTrips(data);
    console.log("[searchTrips] Formatted trips:", formatted);
    return formatted;
  } catch (err) {
    console.error("Failed to fetch trips:", err);
    return [];
  }
};