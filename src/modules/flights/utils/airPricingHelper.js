// src/modules/flights/utils/airPricingHelper.js

/**
 * ============ SAFE ARRAY HELPER ============
 * Safely converts a value to an array
 * If input is undefined/null, returns empty array
 * If input is already an array, returns it
 * If input is a single object, wraps it in an array
 */
export const safeArray = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

/**
 * ============ PRICE PARSING ============
 * Safely parses a price string to number
 * Handles formats like "INR6899", "₹6,899", etc.
 */
export const parsePrice = (priceString) => {
  if (!priceString) return 0;
  if (typeof priceString === 'number') return priceString;
  
  // Remove all non-numeric characters except decimal point
  const cleaned = priceString.toString().replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * ============ DURATION FORMATTING ============
 * Formats duration in minutes to human readable string
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

/**
 * ============ TIME FORMATTING ============
 * Formats ISO date string to time (HH:MM)
 */
export const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return '--:--';
  }
};

/**
 * ============ DATE FORMATTING ============
 * Formats ISO date string to readable date
 */
export const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

/**
 * ============ FARE BADGE STYLES ============
 * Returns Tailwind classes for fare badges based on fare name
 */
export const getFareBadgeStyle = (fareName) => {
  const name = fareName?.toLowerCase() || '';
  if (name.includes('flex')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (name.includes('super')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (name.includes('plus') || name.includes('stretch')) return 'bg-green-50 text-green-700 border-green-200';
  if (name.includes('business')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (name.includes('first')) return 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border-amber-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

/**
 * ============ FARE ICON COLOR ============
 * Returns the appropriate color class for fare icons
 */
export const getFareIconColor = (fareName) => {
  const name = fareName?.toLowerCase() || '';
  if (name.includes('business')) return 'text-amber-600';
  if (name.includes('first')) return 'text-amber-600';
  if (name.includes('super')) return 'text-purple-600';
  return 'text-[#FD561E]';
};

/**
 * ============ LAYOVER CALCULATION ============
 * Calculates layover details between flight segments
 */
export const calculateLayovers = (segments) => {
  if (!segments || segments.length < 2) return [];
  
  const layovers = [];
  
  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    const next = segments[i + 1];
    
    const arrivalTime = new Date(current.arrivalTime);
    const nextDeparture = new Date(next.departureTime);
    const layoverMinutes = Math.round((nextDeparture - arrivalTime) / (1000 * 60));
    
    layovers.push({
      airport: current.destination,
      duration: layoverMinutes,
      formattedDuration: formatDuration(layoverMinutes)
    });
  }
  
  return layovers;
};

/**
 * ============ AIRLINE LOGO URL ============
 * Generates airline logo URL with fallback
 */
export const getAirlineLogo = (airlineCode) => {
  return `https://logo.clearbit.com/${airlineCode?.toLowerCase()}.com` 
    || `/airlines/${airlineCode}.png`;
};

/**
 * ============ AIRLINE NAME ============
 * Returns full airline name from code
 */
export const getAirlineName = (airlineCode) => {
  const airlines = {
    '6E': 'IndiGo',
    'AI': 'Air India',
    'SG': 'SpiceJet',
    'UK': 'Vistara',
    'G8': 'GoAir',
    'I5': 'AirAsia India',
    '9W': 'Jet Airways',
    'S2': 'Air India Express',
    'QP': 'Akasa Air',
    'KU': 'Kuwait Airways',
    'EK': 'Emirates',
    'WY': 'Oman Air',
    'SV': 'Saudia',
    'FZ': 'Flydubai',
    'GF': 'Gulf Air',
    'UL': 'SriLankan Airlines',
    'TK': 'Turkish Airlines',
    'ET': 'Ethiopian Airlines',
    'SQ': 'Singapore Airlines',
    'H1': 'Hahn Air',
    'XY': 'Flynas'
  };
  
  return airlines[airlineCode] || airlineCode;
};

/**
 * ============ DEDUPLICATE FARES ============
 * Removes duplicate fare options based on key attributes
 */
export const deduplicateFares = (fares) => {
  if (!fares || fares.length === 0) return [];
  
  const fareMap = new Map();
  
  fares.forEach(fare => {
    const key = `${fare.brand?.name}-${fare.totalPrice}-${fare.baggage?.weight}-${fare.cabinClass}-${fare.refundable}`;
    
    if (!fareMap.has(key)) {
      fareMap.set(key, fare);
    }
  });
  
  const uniqueFares = Array.from(fareMap.values());
  uniqueFares.sort((a, b) => a.totalPrice - b.totalPrice);
  
  if (uniqueFares.length > 0) {
    uniqueFares[0].isLowest = true;
  }
  
  return uniqueFares;
};

/**
 * ============ EXTRACT FLIGHT SEGMENTS ============
 * Extracts and normalizes flight segments from various data structures
 */
export const extractFlightSegments = (flight) => {
  if (!flight) return [];
  
  // If flight already has segments array
  if (flight.segments && flight.segments.length > 0) {
    return flight.segments;
  }
  
  // If flight has a single segment
  if (flight.segmentKey) {
    return [flight];
  }
  
  // Default - wrap the flight itself
  return [flight];
};

/**
 * ============ CALCULATE TOTAL DURATION ============
 * Calculates total journey duration from segments
 */
export const calculateTotalDuration = (segments) => {
  if (!segments || segments.length === 0) return 0;
  
  return segments.reduce((total, segment) => {
    return total + (segment.duration || parseInt(segment.flightTime) || 0);
  }, 0);
};

/**
 * ============ GENERATE UNIQUE ID ============
 * Generates a unique ID with optional prefix
 */
export const generateUniqueId = (prefix = '') => {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * ============ DEEP CLONE ============
 * Creates a deep copy of an object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * ============ IS CONNECTING FLIGHT ============
 * Checks if a flight is connecting (has multiple segments)
 */
export const isConnectingFlight = (flight) => {
  return (flight.segments?.length > 1) || (flight.stops > 0);
};

/**
 * ============ GROUP BY ============
 * Groups an array of objects by a key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * ============ DEBOUNCE ============
 * Debounce function for search inputs
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * ============ IS EMPTY OBJECT ============
 * Checks if an object is empty
 */
export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * ============ GET NESTED VALUE ============
 * Safely gets a nested object property using dot notation
 */
export const getNestedValue = (obj, path, defaultValue = null) => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }
  
  return result !== undefined ? result : defaultValue;
};