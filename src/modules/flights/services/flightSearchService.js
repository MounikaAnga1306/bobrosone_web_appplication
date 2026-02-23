// src/modules/flights/services/flightSearchService.js

// Base URL - Update this with your actual API URL
const BASE_URL = 'https://api.bobros.org';

// Airline mapping
const AIRLINE_NAMES = {
  '6E': 'IndiGo',
  'AI': 'Air India',
  'SG': 'SpiceJet',
  'UK': 'Vistara',
  'G8': 'GoAir',
  'I5': 'AirAsia India',
  '9W': 'Jet Airways',
  'S2': 'Air India Express',
  'QP': 'Akasa Air'
};

// Extract airport code from input
const extractAirportCode = (inputText) => {
  if (!inputText) return '';
  
  // If input is already a 3-letter code
  if (/^[A-Z]{3}$/.test(inputText.trim())) {
    return inputText.trim();
  }
  
  // Try to extract from parentheses
  const match = inputText.match(/\(([A-Z]{3})\)/);
  if (match) {
    return match[1];
  }
  
  // Extract first 3 letters as code (for "BOM - Mumbai")
  const codeMatch = inputText.match(/^([A-Z]{3})/);
  if (codeMatch) {
    return codeMatch[1];
  }
  
  return inputText.substring(0, 3).toUpperCase();
};

// Format date to YYYY-MM-DD
const formatDateForAPI = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Convert minutes to "2h 15m"
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Format time from ISO to "HH:MM"
const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Parse price string "INR5927.00" to number
const parsePrice = (priceString) => {
  const numericString = priceString.replace('INR', '').replace(',', '');
  return parseFloat(numericString) || 0;
};

// Transform API flight data to component format
const transformFlightData = (apiFlight) => {
  try {
    const segment = apiFlight.segment;
    const pricing = apiFlight.pricing?.airPricePoint;
    const availability = apiFlight.availability;
    
    if (!segment || !pricing) {
      console.warn('Invalid flight data:', apiFlight);
      return null;
    }
    
    // Calculate duration
    const durationMinutes = parseInt(segment.FlightTime) || 0;
    
    // Parse price
    const price = parsePrice(pricing.total);
    
    // Get airline name
    const airline = AIRLINE_NAMES[segment.Carrier] || segment.Carrier;
    
    return {
      id: apiFlight.keys?.airSegmentKey || `flight-${Date.now()}-${Math.random()}`,
      airline: airline,
      flightNumber: `${segment.Carrier}-${segment.FlightNumber}`,
      price: price,
      departureTime: formatTime(segment.DepartureTime),
      arrivalTime: formatTime(segment.ArrivalTime),
      from: segment.Origin,
      to: segment.Destination,
      duration: formatDuration(durationMinutes),
      stops: 0, // All flights appear non-stop
      features: [
        availability?.cabinClass || 'Economy',
        availability?.bookingCount > 0 ? `${availability.bookingCount} seats left` : 'Limited seats'
      ],
      lockPrice: price < 7000 ? Math.round(price * 0.035) : null,
      cabinClass: availability?.cabinClass || 'Economy',
      seatsAvailable: availability?.bookingCount || 1,
      rawData: apiFlight
    };
  } catch (error) {
    console.error('Error transforming flight:', error, apiFlight);
    return null;
  }
};

// Main API function
export const searchFlights = async (searchData) => {
  try {
    console.log('Starting flight search with:', searchData);
    
    // Extract parameters
    const originCode = extractAirportCode(searchData.origin);
    const destinationCode = extractAirportCode(searchData.destination);
    const departureDate = formatDateForAPI(searchData.departureDate);
    const adults = searchData.travellers?.adults || 1;
    
    // Validate
    if (!originCode || !destinationCode) {
      throw new Error('Please enter valid origin and destination');
    }
    
    // Build API URL
    const apiUrl = `${BASE_URL}/flights/low-fare?origin=${originCode}&destination=${destinationCode}&departureDate=${departureDate}&adults=${adults}`;
    
    console.log('Calling API:', apiUrl);
    
    // Make API call
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Flight search failed');
    }
    
    console.log(`API returned ${apiResponse.flights?.length || 0} flights`);
    
    // Transform flights
    const transformedFlights = [];
    const invalidFlights = [];
    
    if (apiResponse.flights && Array.isArray(apiResponse.flights)) {
      apiResponse.flights.forEach(flight => {
        const transformed = transformFlightData(flight);
        if (transformed) {
          transformedFlights.push(transformed);
        } else {
          invalidFlights.push(flight);
        }
      });
    }
    
    if (invalidFlights.length > 0) {
      console.warn(`Could not transform ${invalidFlights.length} flights`);
    }
    
    // Sort by price
    transformedFlights.sort((a, b) => a.price - b.price);
    
    return {
      success: true,
      flights: transformedFlights,
      rawFlights: apiResponse.flights,
      count: apiResponse.count || transformedFlights.length,
      message: `Found ${transformedFlights.length} flights`
    };
    
  } catch (error) {
    console.error('Flight search error:', error);
    return {
      success: false,
      error: error.message || 'Failed to search flights',
      flights: [],
      rawFlights: [],
      count: 0
    };
  }
};