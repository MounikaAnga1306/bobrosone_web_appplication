// src/modules/flights/utils/multiCityHelpers.js

/**
 * Format time from ISO string to HH:MM format
 */
export const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '--:--';
  }
};

/**
 * Format date for display (DD MMM YYYY)
 */
export const formatDate = (isoString) => {
  if (!isoString) return 'Date not available';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Date not available';
  }
};

/**
 * Format duration in minutes to "Xh Ym"
 */
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '0h 0m';
  const mins = parseInt(minutes);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
};

/**
 * Get stop text (Non-stop, 1 stop, 2+ stops)
 */
export const getStopText = (stops) => {
  if (stops === 0) return 'Non-stop';
  if (stops === 1) return '1 stop';
  return `${stops} stops`;
};

/**
 * Group flights by time of day
 */
export const groupFlightsByTimeOfDay = (flights) => {
  const groups = {
    earlyMorning: [],
    morning: [],
    afternoon: [],
    evening: [],
    night: []
  };
  
  flights.forEach(flight => {
    if (!flight.departureTime) {
      groups.morning.push(flight);
      return;
    }
    
    try {
      const hour = new Date(flight.departureTime).getHours();
      
      if (hour < 6) groups.earlyMorning.push(flight);
      else if (hour < 12) groups.morning.push(flight);
      else if (hour < 17) groups.afternoon.push(flight);
      else if (hour < 21) groups.evening.push(flight);
      else groups.night.push(flight);
    } catch {
      groups.morning.push(flight);
    }
  });
  
  return Object.fromEntries(
    Object.entries(groups).filter(([_, flightList]) => flightList.length > 0)
  );
};

/**
 * Get time band label
 */
export const getTimeBandLabel = (band) => {
  const labels = {
    earlyMorning: 'Early Morning (00:00-06:00)',
    morning: 'Morning (06:00-12:00)',
    afternoon: 'Afternoon (12:00-17:00)',
    evening: 'Evening (17:00-21:00)',
    night: 'Night (21:00-00:00)'
  };
  return labels[band] || band;
};

/**
 * Calculate column width based on leg count
 */
export const getColumnWidth = (legCount) => {
  if (legCount <= 3) {
    return `w-1/${legCount}`;
  }
  if (legCount === 4) {
    return 'w-1/4';
  }
  return 'w-80';
};

/**
 * Sort flights by various criteria
 */
export const sortFlights = (flights, sortBy) => {
  if (!flights || !flights.length) return [];
  
  const sorted = [...flights];
  
  switch (sortBy) {
    case 'price':
      return sorted.sort((a, b) => (a.lowestPrice || a.price || 0) - (b.lowestPrice || b.price || 0));
    case 'departure':
      return sorted.sort((a, b) => new Date(a.departureTime || 0) - new Date(b.departureTime || 0));
    case 'arrival':
      return sorted.sort((a, b) => new Date(a.arrivalTime || 0) - new Date(b.arrivalTime || 0));
    case 'duration':
      return sorted.sort((a, b) => (a.duration || 0) - (b.duration || 0));
    case 'airline':
      return sorted.sort((a, b) => (a.airline || '').localeCompare(b.airline || ''));
    default:
      return sorted;
  }
};

/**
 * Filter flights by various criteria
 */
export const filterFlights = (flights, filters) => {
  if (!flights || !flights.length) return [];
  
  return flights.filter(flight => {
    if (filters.priceRange) {
      const price = flight.lowestPrice || flight.price || 0;
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }
    }
    
    if (filters.airlines?.length > 0) {
      if (!filters.airlines.includes(flight.airlineCode)) {
        return false;
      }
    }
    
    if (filters.stops?.length > 0) {
      const stopCount = flight.stops || 0;
      if (filters.stops.includes('2+') && stopCount >= 2) {
        return true;
      }
      if (!filters.stops.includes(stopCount)) {
        return false;
      }
    }
    
    if (filters.departureBands) {
      const hour = new Date(flight.departureTime || 0).getHours();
      const hasSelectedBand = Object.values(filters.departureBands).some(v => v);
      
      if (hasSelectedBand) {
        const matchesBand = (
          (filters.departureBands.earlyMorning && hour >= 0 && hour < 6) ||
          (filters.departureBands.morning && hour >= 6 && hour < 12) ||
          (filters.departureBands.afternoon && hour >= 12 && hour < 17) ||
          (filters.departureBands.evening && hour >= 17 && hour < 21) ||
          (filters.departureBands.night && hour >= 21 && hour < 24)
        );
        if (!matchesBand) return false;
      }
    }
    
    return true;
  });
};

/**
 * Get unique airlines from flights
 */
export const getUniqueAirlines = (flights) => {
  if (!flights || !flights.length) return [];
  
  const airlineMap = new Map();
  
  flights.forEach(flight => {
    const code = flight.airlineCode;
    if (!code) return;
    
    if (!airlineMap.has(code)) {
      airlineMap.set(code, {
        code,
        name: flight.airline || code,
        count: 0
      });
    }
    airlineMap.get(code).count++;
  });
  
  return Array.from(airlineMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get price range from flights
 */
export const getPriceRange = (flights) => {
  if (!flights || !flights.length) {
    return { min: 0, max: 100000 };
  }
  
  const prices = flights
    .map(f => f.lowestPrice || f.price || 0)
    .filter(p => p > 0);
  
  if (prices.length === 0) {
    return { min: 0, max: 100000 };
  }
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};

/**
 * Get stop options with counts
 */
export const getStopOptions = (flights) => {
  if (!flights || !flights.length) return [];
  
  const stopCounts = { 0: 0, 1: 0, '2+': 0 };
  
  flights.forEach(flight => {
    const stops = flight.stops || 0;
    if (stops === 0) stopCounts[0]++;
    else if (stops === 1) stopCounts[1]++;
    else stopCounts['2+']++;
  });
  
  return [
    { value: 0, label: 'Non-stop', count: stopCounts[0] },
    { value: 1, label: '1 Stop', count: stopCounts[1] },
    { value: '2+', label: '2+ Stops', count: stopCounts['2+'] }
  ].filter(option => option.count > 0);
};

/**
 * Check if a combination is valid
 */
export const isValidCombination = (selectedFlights, combinations) => {
  if (!selectedFlights || !combinations) return false;
  if (!selectedFlights.every(f => f !== null)) return false;
  
  return combinations.some(combo => {
    return combo.legs.every((leg, index) => {
      const selected = selectedFlights[index];
      return selected && leg.flights.some(f => f.id === selected.id);
    });
  });
};

/**
 * Find matching combination
 */
export const findMatchingCombination = (selectedFlights, combinations) => {
  if (!selectedFlights || !combinations) return null;
  if (!selectedFlights.every(f => f !== null)) return null;
  
  return combinations.find(combo => {
    return combo.legs.every((leg, index) => {
      const selected = selectedFlights[index];
      return selected && leg.flights.some(f => f.id === selected.id);
    });
  });
};

/**
 * Calculate total price
 */
export const calculateTotalPrice = (selectedFlights, matchingCombination) => {
  if (matchingCombination) {
    return matchingCombination.totalPrice || 0;
  }
  return (selectedFlights || []).reduce((sum, flight) => sum + (flight?.price || 0), 0);
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (price, currency = 'INR') => {
  if (!price && price !== 0) return '';
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${price.toLocaleString()}`;
};

/**
 * Extract flight number
 */
export const extractFlightNumber = (flightNumber) => {
  if (!flightNumber) return '';
  const match = flightNumber.match(/[A-Z0-9]+-?(\d+)/);
  return match ? match[1] : flightNumber;
};

/**
 * Get brand color class
 */
export const getBrandColorClass = (brandName) => {
  const name = (brandName || '').toLowerCase();
  
  if (name.includes('sale')) return 'bg-green-100 text-green-800';
  if (name.includes('flexi')) return 'bg-purple-100 text-purple-800';
  if (name.includes('regular')) return 'bg-blue-100 text-blue-800';
  if (name.includes('stretch')) return 'bg-orange-100 text-orange-800';
  if (name.includes('upfront')) return 'bg-yellow-100 text-yellow-800';
  if (name.includes('eco')) return 'bg-gray-100 text-gray-800';
  
  return 'bg-gray-100 text-gray-800';
};

/**
 * Create initial filters
 */
export const createInitialFilters = (flights) => {
  const priceRange = getPriceRange(flights);
  
  return {
    priceRange: {
      min: priceRange.min,
      max: priceRange.max,
      selected: [priceRange.min, priceRange.max]
    },
    airlines: [],
    stops: [],
    departureBands: {
      earlyMorning: false,
      morning: false,
      afternoon: false,
      evening: false,
      night: false
    },
    targetLeg: null
  };
};