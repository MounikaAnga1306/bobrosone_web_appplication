const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

/* Convert ANY API response into array safely */
const normalizeArray = (value) => {
  if (!value) return [];

  // already array
  if (Array.isArray(value)) return value;

  // if single object like {bpName:"Ameerpet"}
  if (typeof value === "object") {
    // if object has keys like {0:{},1:{}}
   // const values = Object.values(value);

    // if values exist return them
    //if (values.length) return values;

    // otherwise wrap object
    return [value];
  }

  return [];
};

/* Format Trip Details */

export const formatTripDetails = (data) => {
  if (!data) return null;

  return {
    seats: normalizeArray(data?.seats),

    boardingTimes: normalizeArray(data?.boardingTimes),

    droppingTimes: normalizeArray(data?.droppingTimes),

    seatLayout: data?.seatLayout || {},

    availableSeats: Number(data?.availableSeats || 0),

    rows: Number(data?.rows || 0),

    columns: Number(data?.columns || 0),
  };
};

/* Fetch Trip Details */

export const fetchTripDetails = async (tripId) => {
  if (!tripId) {
    console.error("Trip ID missing");
    return null;
  }

  const url = `${API_BASE}/tripdetails?id=${tripId}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    return formatTripDetails(data);
  } catch (err) {
    console.error("Trip details fetch error:", err);
    return null;
  }
};