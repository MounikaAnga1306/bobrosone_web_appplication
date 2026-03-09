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
export const sortTrips = (trips, type) => {
  const sorted = [...trips];

  switch (type) {
    case "Low to High":
      return sorted.sort((a, b) => a.fare - b.fare);

    case "High to Low":
      return sorted.sort((a, b) => b.fare - a.fare);

    case "Early Departure":
      return sorted.sort((a, b) =>
        a.departureTime.localeCompare(b.departureTime)
      );

    case "Late Departure":
      return sorted.sort((a, b) =>
        b.departureTime.localeCompare(a.departureTime)
      );

    default:
      return trips;
  }
};

// Search trips from backend
export const searchTrips = async (sourceId, destId, date) => {
  if (!sourceId || !destId || !date) {
    console.error("Missing parameters for searchTrips");
    return [];
  }

  const url = `${API_BASE}/searchTrips?source=${sourceId}&destination=${destId}&doj=${date}`;
  //console.log("Calling API:", url);

  try {
    const res = await fetch(url);
   
     if (!res.ok) {
    
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
     
     const formatted = formatTrips(data);
    
    return formatted;
  } catch (err) {
   
    return [];
  }
};