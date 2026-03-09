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

// Passenger code mapping
const PASSENGER_CODES = {
  adults: 'ADT',
  children: 'CNN',
  infants: 'INF'
};

// Extract airport code from various formats
const extractAirportCode = (input) => {
  if (!input) return '';
  
  // If input is string and already a 3-letter code
  if (typeof input === 'string') {
    if (/^[A-Z]{3}$/.test(input.trim())) {
      return input.trim();
    }
    
    // Try to extract from parentheses
    const match = input.match(/\(([A-Z]{3})\)/);
    if (match) {
      return match[1];
    }
    
    // Extract first 3 letters as code (for "BOM - Mumbai")
    const codeMatch = input.match(/^([A-Z]{3})/);
    if (codeMatch) {
      return codeMatch[1];
    }
    
    return input.substring(0, 3).toUpperCase();
  }
  
  // If input is object with location_code (from airport search)
  if (input && input.location_code) {
    return input.location_code;
  }
  
  return '';
};

// Format date to YYYY-MM-DD
const formatDateForAPI = (date) => {
  if (!date) return null;
  
  // If date is already a string in YYYY-MM-DD format
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // If date is a Date object
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return null;
};

// Convert minutes to "2h 15m"
const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Format time from ISO to "HH:MM"
const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.warn('Error formatting time:', error);
    return '--:--';
  }
};

// Parse price string "INR5927.00" to number
const parsePrice = (priceString) => {
  if (!priceString) return 0;
  
  // If it's already a number
  if (typeof priceString === 'number') return priceString;
  
  // Remove INR, commas, and convert to number
  const numericString = priceString.toString().replace(/[^0-9.-]/g, '');
  return parseFloat(numericString) || 0;
};

// Prepare the request body for flight search
const prepareSearchRequestBody = (searchData) => {
  const { legs, passengers } = searchData;
  
  if (!legs || legs.length === 0) {
    throw new Error('No flight legs provided');
  }
  
  // Format legs with proper airport codes and dates
  const formattedLegs = legs.map(leg => ({
    origin: extractAirportCode(leg.origin),
    destination: extractAirportCode(leg.destination),
    departureDate: formatDateForAPI(leg.departureDate)
  }));
  
  // Format passengers (already in correct format from the component)
  const formattedPassengers = passengers.map(passenger => ({
    code: passenger.code,
    ...(passenger.age && { age: passenger.age })
  }));
  
  return {
    legs: formattedLegs,
    passengers: formattedPassengers,
    searchType: legs.length === 1 ? 'one-way' : legs.length === 2 ? 'round-trip' : 'multi-city',
    cabinClass: searchData.cabinClass || 'Economy',
    preferredAirlines: searchData.preferredAirlines || [],
    maxConnections: searchData.maxConnections || 2,
    currency: 'INR'
  };
};

// Transform API flight data to component format
const transformFlightData = (apiFlight, legIndex = 0) => {
  try {
    // Handle different API response structures
    let segment, pricing, availability;
    
    if (apiFlight.segment) {
      // Single flight format
      segment = apiFlight.segment;
      pricing = apiFlight.pricing?.airPricePoint;
      availability = apiFlight.availability;
    } else if (apiFlight.flights && Array.isArray(apiFlight.flights)) {
      // Multi-leg format
      segment = apiFlight.flights[legIndex]?.segment;
      pricing = apiFlight.pricing?.airPricePoint;
      availability = apiFlight.flights[legIndex]?.availability;
    } else {
      // Try to find segment in any format
      segment = apiFlight.segment || apiFlight.flight || apiFlight;
      pricing = apiFlight.pricing || apiFlight.price || apiFlight;
      availability = apiFlight.availability || apiFlight.seats;
    }
    
    if (!segment) {
      console.warn('Invalid flight data - no segment:', apiFlight);
      return null;
    }
    
    // Calculate duration
    const durationMinutes = parseInt(segment.FlightTime || segment.duration || segment.flightTime || 0);
    
    // Parse price
    let price = 0;
    if (pricing) {
      if (pricing.total) {
        price = parsePrice(pricing.total);
      } else if (pricing.basePrice) {
        price = parsePrice(pricing.basePrice);
      } else if (pricing.amount) {
        price = parsePrice(pricing.amount);
      } else if (typeof pricing === 'number') {
        price = pricing;
      } else if (typeof pricing === 'string') {
        price = parsePrice(pricing);
      }
    }
    
    // Get airline name
    const carrier = segment.Carrier || segment.airline || segment.carrier || segment.airlineCode;
    const airline = AIRLINE_NAMES[carrier] || carrier || 'Unknown';
    
    // Get flight number
    const flightNumber = segment.FlightNumber || segment.flightNumber || segment.number || '';
    const fullFlightNumber = carrier && flightNumber ? `${carrier}-${flightNumber}` : flightNumber;
    
    // Get times
    const departureTime = formatTime(segment.DepartureTime || segment.departureTime || segment.departure);
    const arrivalTime = formatTime(segment.ArrivalTime || segment.arrivalTime || segment.arrival);
    
    // Get airports
    const origin = segment.Origin || segment.origin || segment.from || segment.originCode;
    const destination = segment.Destination || segment.destination || segment.to || segment.destinationCode;
    
    // Get cabin class
    const cabinClass = availability?.cabinClass || 
                      availability?.cabin || 
                      segment.cabinClass || 
                      segment.class || 
                      'Economy';
    
    // Get seats available
    const seatsAvailable = availability?.bookingCount || 
                          availability?.seats || 
                          availability?.seatsAvailable || 
                          segment.seatsAvailable || 
                          1;
    
    return {
      id: apiFlight.keys?.airSegmentKey || 
           apiFlight.id || 
           apiFlight.flightId || 
           `flight-${Date.now()}-${Math.random()}`,
      airline: airline,
      flightNumber: fullFlightNumber,
      price: price,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      from: origin,
      to: destination,
      duration: formatDuration(durationMinutes),
      stops: 0, // All flights appear non-stop in current API
      features: [
        cabinClass,
        seatsAvailable > 0 ? `${seatsAvailable} seats left` : 'Limited seats'
      ],
      lockPrice: price < 7000 ? Math.round(price * 0.035) : null,
      cabinClass: cabinClass,
      seatsAvailable: seatsAvailable,
      legIndex: legIndex, // Track which leg this belongs to for multi-city
      rawData: apiFlight
    };
  } catch (error) {
    console.error('Error transforming flight:', error, apiFlight);
    return null;
  }
};

// Transform multi-leg response
const transformMultiLegResponse = (apiResponse) => {
  try {
    const transformedFlights = [];
    
    if (apiResponse.itineraries && Array.isArray(apiResponse.itineraries)) {
      // Each itinerary contains multiple legs
      apiResponse.itineraries.forEach((itinerary, itineraryIndex) => {
        if (itinerary.flights && Array.isArray(itinerary.flights)) {
          const legs = [];
          let totalPrice = 0;
          
          // Transform each leg in the itinerary
          itinerary.flights.forEach((flight, legIndex) => {
            const transformed = transformFlightData(flight, legIndex);
            if (transformed) {
              legs.push(transformed);
              totalPrice += transformed.price;
            }
          });
          
          // Create combined itinerary object
          if (legs.length > 0) {
            transformedFlights.push({
              id: itinerary.id || `itinerary-${itineraryIndex}-${Date.now()}`,
              legs: legs,
              totalPrice: totalPrice,
              airline: legs[0]?.airline || 'Multiple Airlines',
              duration: calculateTotalDuration(legs),
              stops: legs.length - 1,
              features: legs.map(leg => leg.cabinClass).filter((v, i, a) => a.indexOf(v) === i), // Unique cabin classes
              rawData: itinerary
            });
          }
        }
      });
    } else if (apiResponse.flights && Array.isArray(apiResponse.flights)) {
      // Single leg response
      apiResponse.flights.forEach(flight => {
        const transformed = transformFlightData(flight);
        if (transformed) {
          transformedFlights.push(transformed);
        }
      });
    }
    
    return transformedFlights;
  } catch (error) {
    console.error('Error transforming multi-leg response:', error);
    return [];
  }
};

// Calculate total duration for multi-leg itinerary
const calculateTotalDuration = (legs) => {
  if (!legs || legs.length === 0) return '0h 0m';
  
  let totalMinutes = 0;
  legs.forEach(leg => {
    const durationMatch = leg.duration.match(/(\d+)h\s*(\d+)m/);
    if (durationMatch) {
      totalMinutes += parseInt(durationMatch[1]) * 60 + parseInt(durationMatch[2]);
    }
  });
  
  return formatDuration(totalMinutes);
};

// Main search function - Now using POST
export const searchFlights = async (searchData) => {
  try {
    console.log('Starting flight search with:', searchData);
    
    // Validate search data
    if (!searchData.legs || searchData.legs.length === 0) {
      throw new Error('No flight legs provided');
    }
    
    if (!searchData.passengers || searchData.passengers.length === 0) {
      throw new Error('No passengers provided');
    }
    
    // Prepare request body
    const requestBody = prepareSearchRequestBody(searchData);
    
    console.log('Request Body:', requestBody);
    
    // Make POST API call
    const response = await fetch(`${BASE_URL}/flights/search`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Add any authentication headers here
        // 'Authorization': `Bearer ${API_KEY}`,
        'X-Request-ID': `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      // If API is not available, use mock data for development
      console.warn(`API Error: ${response.status}. Using mock data.`);
      return getMockFlightData(searchData);
    }
    
    const apiResponse = await response.json();
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Flight search failed');
    }
    
    console.log('API Response:', apiResponse);
    
    // Transform flights based on response type
    const transformedFlights = transformMultiLegResponse(apiResponse);
    
    // Sort by price
    transformedFlights.sort((a, b) => {
      const priceA = a.totalPrice || a.price || 0;
      const priceB = b.totalPrice || b.price || 0;
      return priceA - priceB;
    });
    
    return {
      success: true,
      flights: transformedFlights,
      rawFlights: apiResponse,
      count: transformedFlights.length,
      message: `Found ${transformedFlights.length} flights`,
      searchParams: searchData,
      searchId: apiResponse.searchId || `search-${Date.now()}`
    };
    
  } catch (error) {
    console.error('Flight search error:', error);
    
    // Return mock data for development when API fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock data for development');
      return getMockFlightData(searchData);
    }
    
    return {
      success: false,
      error: error.message || 'Failed to search flights',
      flights: [],
      rawFlights: [],
      count: 0,
      searchParams: searchData
    };
  }
};

// Get mock flight data for development
const getMockFlightData = (searchData) => {
  const { legs, passengers } = searchData;
  const adults = passengers.filter(p => p.code === 'ADT').length;
  const children = passengers.filter(p => p.code === 'CNN').length;
  const infants = passengers.filter(p => p.code === 'INF').length;
  
  const mockFlights = [];
  
  if (legs.length === 1) {
    // One-way mock data
    const airlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'Akasa Air'];
    const times = ['06:00', '08:30', '10:15', '12:45', '15:30', '18:20', '20:45'];
    
    for (let i = 0; i < 15; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const departureIndex = Math.floor(Math.random() * times.length);
      const departure = times[departureIndex];
      const duration = 120 + Math.floor(Math.random() * 180);
      const arrival = addMinutesToTime(departure, duration);
      const basePrice = 2500 + Math.floor(Math.random() * 4000);
      const price = basePrice + (adults - 1) * basePrice * 0.9 + children * basePrice * 0.7 + infants * basePrice * 0.1;
      
      mockFlights.push({
        id: `flight-${i}-${Date.now()}`,
        airline: airline,
        flightNumber: `${airline.substring(0, 2).toUpperCase()}-${100 + i}`,
        price: Math.round(price),
        departureTime: departure,
        arrivalTime: arrival,
        from: legs[0].origin,
        to: legs[0].destination,
        duration: formatDuration(duration),
        stops: Math.floor(Math.random() * 2),
        features: ['Economy', `${Math.floor(Math.random() * 9) + 1} seats left`],
        lockPrice: price < 7000 ? Math.round(price * 0.035) : null,
        cabinClass: 'Economy',
        seatsAvailable: Math.floor(Math.random() * 9) + 1,
        legIndex: 0,
        baggage: {
          cabin: '7 kg',
          checkIn: '15 kg'
        },
        refundable: Math.random() > 0.3
      });
    }
  } else {
    // Multi-leg (round-trip or multi-city) mock data
    for (let itineraryIndex = 0; itineraryIndex < 10; itineraryIndex++) {
      const basePrice = 5000 + Math.floor(Math.random() * 8000);
      const totalPrice = basePrice + (adults - 1) * basePrice * 0.9 + children * basePrice * 0.7 + infants * basePrice * 0.1;
      
      const legsData = legs.map((leg, index) => {
        const airlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara'];
        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        const departure = index === 0 ? '08:00' : index === 1 ? '18:00' : '09:30';
        const duration = 120 + Math.floor(Math.random() * 180);
        const arrival = addMinutesToTime(departure, duration);
        
        return {
          id: `leg-${itineraryIndex}-${index}-${Date.now()}`,
          airline: airline,
          flightNumber: `${airline.substring(0, 2).toUpperCase()}-${200 + itineraryIndex}${index}`,
          price: Math.round(basePrice / legs.length),
          departureTime: departure,
          arrivalTime: arrival,
          from: leg.origin,
          to: leg.destination,
          duration: formatDuration(duration),
          stops: 0,
          features: ['Economy', `${Math.floor(Math.random() * 9) + 1} seats left`],
          lockPrice: null,
          cabinClass: 'Economy',
          seatsAvailable: Math.floor(Math.random() * 9) + 1,
          legIndex: index,
          baggage: {
            cabin: '7 kg',
            checkIn: '15 kg'
          },
          refundable: Math.random() > 0.3
        };
      });
      
      mockFlights.push({
        id: `itinerary-${itineraryIndex}-${Date.now()}`,
        legs: legsData,
        totalPrice: Math.round(totalPrice),
        airline: legsData[0]?.airline || 'Multiple Airlines',
        duration: calculateTotalDuration(legsData),
        stops: legsData.length - 1,
        features: ['Economy'],
        rawData: { legs: legsData },
        baggage: legsData[0]?.baggage,
        refundable: legsData.every(leg => leg.refundable)
      });
    }
  }
  
  // Sort by price
  mockFlights.sort((a, b) => {
    const priceA = a.totalPrice || a.price || 0;
    const priceB = b.totalPrice || b.price || 0;
    return priceA - priceB;
  });
  
  return {
    success: true,
    flights: mockFlights,
    rawFlights: mockFlights,
    count: mockFlights.length,
    message: `Found ${mockFlights.length} flights (MOCK DATA)`,
    searchParams: searchData,
    searchId: `mock-search-${Date.now()}`
  };
};

// Helper function to add minutes to a time string
const addMinutesToTime = (timeStr, minutes) => {
  const [hours, mins] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Get flight details by ID
export const getFlightDetails = async (flightId) => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        flight: {
          id: flightId,
          airline: 'IndiGo',
          flightNumber: '6E-123',
          price: 4500,
          departureTime: '08:00',
          arrivalTime: '10:30',
          from: 'DEL',
          to: 'BOM',
          duration: '2h 30m',
          stops: 0,
          features: ['Economy', '8 seats left'],
          cabinClass: 'Economy',
          seatsAvailable: 8,
          baggage: {
            cabin: '7 kg',
            checkIn: '15 kg'
          },
          cancellation: {
            refundable: true,
            fee: 500
          }
        }
      };
    }
    
    const response = await fetch(`${BASE_URL}/flights/${flightId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      flight: transformFlightData(data.flight)
    };
  } catch (error) {
    console.error('Get flight details error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get flight details'
    };
  }
};

// Book a flight
export const bookFlight = async (bookingData) => {
  try {
    console.log('Booking flight:', bookingData);
    
    // Prepare booking request body
    const requestBody = {
      flightId: bookingData.flightId,
      passengers: bookingData.passengers.map(p => ({
        title: p.title,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth,
        passportNumber: p.passportNumber,
        passportExpiry: p.passportExpiry,
        nationality: p.nationality,
        type: p.type // ADT, CNN, INF
      })),
      contactDetails: {
        email: bookingData.email,
        phone: bookingData.phone,
        countryCode: bookingData.countryCode
      },
      paymentInfo: bookingData.paymentInfo,
      totalAmount: bookingData.totalAmount,
      currency: 'INR'
    };
    
    // For development, return mock success
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        booking: {
          id: `BOOK-${Date.now()}`,
          pnr: `PNR${Math.floor(Math.random() * 1000000)}`,
          status: 'confirmed',
          ...requestBody
        },
        pnr: `PNR${Math.floor(Math.random() * 1000000)}`
      };
    }
    
    const response = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      booking: data.booking,
      pnr: data.pnr
    };
  } catch (error) {
    console.error('Book flight error:', error);
    return {
      success: false,
      error: error.message || 'Failed to book flight'
    };
  }
};

// Search for flight status
export const getFlightStatus = async (flightNumber, date) => {
  try {
    const response = await fetch(`${BASE_URL}/flights/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        flightNumber,
        date: formatDateForAPI(date)
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      status: data.status
    };
  } catch (error) {
    console.error('Get flight status error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get flight status'
    };
  }
};

export default {
  searchFlights,
  getFlightDetails,
  bookFlight,
  getFlightStatus
};