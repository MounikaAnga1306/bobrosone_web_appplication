// src/modules/flights/utils/flightDataTransformer.js

/**
 * Transforms any API response into a consistent format
 * Handles: roundTrips array, roundTripDisplay, or raw API response
 */
export const transformFlightData = (data) => {
  console.log('🔄 Transforming flight data:', data);
  
  // Default structure
  const result = {
    outboundFlights: [],
    returnFlights: [],
    combinations: [],
    raw: data
  };

  if (!data) return result;

  // ============ IMPORTANT: Check for roundTrips FIRST ============
  if (data.roundTrips && Array.isArray(data.roundTrips) && data.roundTrips.length > 0) {
    console.log('📦 Case 1: Found roundTrips array with', data.roundTrips.length, 'items');
    console.log('📦 First roundTrip sample:', {
      totalPrice: data.roundTrips[0].totalPrice,
      outboundFlight: data.roundTrips[0].outbound?.defaultFlight?.flightNumber,
      returnFlight: data.roundTrips[0].return?.defaultFlight?.flightNumber
    });
    return extractFromRoundTrips(data.roundTrips);
  }

  // Case 2: Nested data structure
  if (data.data?.roundTrips && Array.isArray(data.data.roundTrips)) {
    console.log('📦 Case 2: Found nested roundTrips');
    return extractFromRoundTrips(data.data.roundTrips);
  }

  // Case 3: roundTripDisplay format (FALLBACK ONLY)
  if (data.roundTripDisplay) {
    console.log('📦 Case 3: Using roundTripDisplay as fallback');
    return extractFromDisplay(data.roundTripDisplay, data.roundTrips);
  }

  // Case 4: Raw API response (needs transformation)
  if (data['air:LowFareSearchRsp']) {
    console.log('📦 Case 4: Raw API response');
    // You would call your transformRoundTripResponse here
  }

  console.log('❌ No valid data structure found');
  return result;
};

/**
 * Extract from roundTrips array format
 */
const extractFromRoundTrips = (roundTrips) => {
  console.log('📊 Extracting from roundTrips array of length:', roundTrips.length);
  
  const outboundMap = new Map();
  const returnMap = new Map();
  const combinations = [];

  roundTrips.forEach((trip, index) => {
    // Store combination
    combinations.push({
      id: trip.id || `combo-${index}`,
      totalPrice: trip.totalPrice || 0,
      outboundId: trip.outbound?.id,
      returnId: trip.return?.id
    });

    // Extract unique outbound flights
    if (trip.outbound) {
      const outboundFlight = trip.outbound.defaultFlight || trip.outbound;
      const flightNum = outboundFlight.flightNumber?.split('-')[1] || outboundFlight.flightNumber;
      const outboundKey = `${outboundFlight.airlineCode || 'AI'}-${flightNum}-${outboundFlight.departureTime}`;
      
      if (!outboundMap.has(outboundKey)) {
        outboundMap.set(outboundKey, {
          ...trip.outbound,
          id: `out-${outboundKey}`,
          airline: outboundFlight.airline || 'Air India',
          airlineCode: outboundFlight.airlineCode || 'AI',
          flightNumber: outboundFlight.flightNumber || `AI-${flightNum}`,
          departureTime: outboundFlight.departureTime,
          arrivalTime: outboundFlight.arrivalTime,
          origin: outboundFlight.origin,
          destination: outboundFlight.destination,
          duration: outboundFlight.duration,
          stops: outboundFlight.stops || 0,
          lowestPrice: trip.totalPrice,
          price: trip.totalPrice,
          fares: trip.outbound.flightOptions || trip.outbound.fares || [],
          segments: outboundFlight.segments || [outboundFlight],
          layovers: outboundFlight.layovers || []
        });
      }
    }

    // Extract unique return flights
    if (trip.return) {
      const returnFlight = trip.return.defaultFlight || trip.return;
      const flightNum = returnFlight.flightNumber?.split('-')[1] || returnFlight.flightNumber;
      const returnKey = `${returnFlight.airlineCode || 'AI'}-${flightNum}-${returnFlight.departureTime}`;
      
      if (!returnMap.has(returnKey)) {
        returnMap.set(returnKey, {
          ...trip.return,
          id: `ret-${returnKey}`,
          airline: returnFlight.airline || 'Air India',
          airlineCode: returnFlight.airlineCode || 'AI',
          flightNumber: returnFlight.flightNumber || `AI-${flightNum}`,
          departureTime: returnFlight.departureTime,
          arrivalTime: returnFlight.arrivalTime,
          origin: returnFlight.origin,
          destination: returnFlight.destination,
          duration: returnFlight.duration,
          stops: returnFlight.stops || 0,
          lowestPrice: trip.totalPrice,
          price: trip.totalPrice,
          fares: trip.return.flightOptions || trip.return.fares || [],
          segments: returnFlight.segments || [returnFlight],
          layovers: returnFlight.layovers || []
        });
      }
    }
  });

  console.log('✅ Extracted from roundTrips:', {
    outbound: outboundMap.size,
    return: returnMap.size,
    combinations: combinations.length,
    sampleOutbound: Array.from(outboundMap.values())[0]?.flightNumber
  });

  return {
    outboundFlights: Array.from(outboundMap.values()),
    returnFlights: Array.from(returnMap.values()),
    combinations
  };
};

/**
 * Extract from roundTripDisplay format (fallback)
 */
const extractFromDisplay = (display, roundTrips) => {
  console.log('⚠️ Using fallback extractFromDisplay');
  
  // If we have roundTrips, use that instead
  if (roundTrips && Array.isArray(roundTrips) && roundTrips.length > 0) {
    console.log('📦 roundTrips available, using them instead of display');
    return extractFromRoundTrips(roundTrips);
  }

  const outboundFlights = (display.outbound?.flights || []).map((flight, idx) => ({
    ...flight,
    id: `out-display-${idx}`,
    airline: flight.airline || 'Air India',
    airlineCode: flight.airlineCode || 'AI',
    flightNumber: flight.flightNumber,
    departureTime: flight.departureTime || flight.departureISO,
    arrivalTime: flight.arrivalTime || flight.arrivalISO,
    origin: flight.origin,
    destination: flight.destination,
    duration: flight.duration,
    stops: flight.stops || 0,
    lowestPrice: flight.price || 0,
    price: flight.price || 0,
    fares: flight.fares || []
  }));

  const returnFlights = (display.return?.flights || []).map((flight, idx) => ({
    ...flight,
    id: `ret-display-${idx}`,
    airline: flight.airline || 'Air India',
    airlineCode: flight.airlineCode || 'AI',
    flightNumber: flight.flightNumber,
    departureTime: flight.departureTime || flight.departureISO,
    arrivalTime: flight.arrivalTime || flight.arrivalISO,
    origin: flight.origin,
    destination: flight.destination,
    duration: flight.duration,
    stops: flight.stops || 0,
    lowestPrice: flight.price || 0,
    price: flight.price || 0,
    fares: flight.fares || []
  }));

  // Create combinations (all possible pairs)
  const combinations = [];
  outboundFlights.forEach((outbound, i) => {
    returnFlights.forEach((ret, j) => {
      combinations.push({
        id: `combo-${i}-${j}`,
        totalPrice: (outbound.lowestPrice || 0) + (ret.lowestPrice || 0),
        outboundId: outbound.id,
        returnId: ret.id
      });
    });
  });

  console.log('✅ Extracted from display:', {
    outbound: outboundFlights.length,
    return: returnFlights.length,
    combinations: combinations.length
  });

  return {
    outboundFlights,
    returnFlights,
    combinations
  };
};