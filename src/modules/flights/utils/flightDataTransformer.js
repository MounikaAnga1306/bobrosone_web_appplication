// src/modules/flights/utils/flightDataTransformer.js

/**
 * Parse price helper function
 */
const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const match = price.toString().match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
};

/**
 * Helper function to ensure segments have distance property
 */
const ensureSegmentsWithDistance = (flight) => {
  const segments = flight.segments || [flight];
  return segments.map(seg => ({
    ...seg,
    distance: seg.distance || null
  }));
};

/**
 * Transforms any API response into a consistent format
 */
export const transformFlightData = (data) => {
  console.log('\n' + '='.repeat(80));
  console.log('🔄 [flightDataTransformer] START');
  console.log('='.repeat(80));
  
  // ============ DETAILED DATA STRUCTURE DEBUG ============
  console.log('\n📊 INPUT DATA STRUCTURE:');
  console.log('----------------------------------------');
  console.log('Data type:', typeof data);
  console.log('Data is null?', data === null);
  console.log('Data keys:', data ? Object.keys(data) : 'null');
  console.log('----------------------------------------');
  
  if (data) {
    // Check for roundTrips at top level
    console.log('🔍 Top level checks:');
    console.log('  - data.roundTrips exists:', !!data.roundTrips);
    console.log('  - data.roundTrips type:', typeof data.roundTrips);
    console.log('  - data.roundTrips is array:', Array.isArray(data.roundTrips));
    console.log('  - data.roundTrips length:', data.roundTrips?.length);
    console.log('  - data.roundTripDisplay exists:', !!data.roundTripDisplay);
    console.log('  - data.type:', data.type);
    console.log('  - data.success:', data.success);
    console.log('  - data.count:', data.count);
    
    // Check nested data
    if (data.data) {
      console.log('\n📦 Nested data structure:');
      console.log('  - data.data keys:', Object.keys(data.data));
      console.log('  - data.data.roundTrips exists:', !!data.data.roundTrips);
      console.log('  - data.data.roundTrips length:', data.data.roundTrips?.length);
    }
    
    // Check response wrapper
    if (data.response?.data) {
      console.log('\n📦 Response.data structure:');
      console.log('  - data.response.data.roundTrips exists:', !!data.response.data.roundTrips);
      console.log('  - data.response.data.roundTrips length:', data.response.data.roundTrips?.length);
    }
    
    // Sample first roundTrip if exists
    if (data.roundTrips && data.roundTrips.length > 0) {
      const firstTrip = data.roundTrips[0];
      console.log('\n✈️ SAMPLE ROUND-TRIP (first item):');
      console.log('  - id:', firstTrip.id);
      console.log('  - totalPrice:', firstTrip.totalPrice);
      console.log('  - outbound exists:', !!firstTrip.outbound);
      console.log('  - outbound.brand exists:', !!firstTrip.outbound?.brand);
      console.log('  - outbound.brand.name:', firstTrip.outbound?.brand?.name);
      console.log('  - return exists:', !!firstTrip.return);
      console.log('  - return.brand exists:', !!firstTrip.return?.brand);
      console.log('  - return.brand.name:', firstTrip.return?.brand?.name);
    }
  }
  console.log('='.repeat(80) + '\n');
  
  const result = {
    outboundFlights: [],
    returnFlights: [],
    combinations: [],
    raw: data
  };

  if (!data) {
    console.log('❌ No data provided');
    return result;
  }

  // ============ CASE 1: Direct roundTrips array ============
  if (data.roundTrips && Array.isArray(data.roundTrips) && data.roundTrips.length > 0) {
    console.log('✅ CASE 1: Found direct roundTrips array with', data.roundTrips.length, 'items');
    const extracted = extractFromRoundTrips(data.roundTrips);
    console.log('📊 Extract result:', {
      outboundCount: extracted.outboundFlights.length,
      returnCount: extracted.returnFlights.length,
      totalOutboundFares: extracted.outboundFlights.reduce((s, f) => s + (f.fares?.length || 0), 0),
      totalReturnFares: extracted.returnFlights.reduce((s, f) => s + (f.fares?.length || 0), 0)
    });
    return extracted;
  }

  // ============ CASE 2: Nested under data ============
  if (data.data?.roundTrips && Array.isArray(data.data.roundTrips) && data.data.roundTrips.length > 0) {
    console.log('✅ CASE 2: Found nested roundTrips under data with', data.data.roundTrips.length, 'items');
    const extracted = extractFromRoundTrips(data.data.roundTrips);
    console.log('📊 Extract result:', {
      outboundCount: extracted.outboundFlights.length,
      returnCount: extracted.returnFlights.length,
      totalOutboundFares: extracted.outboundFlights.reduce((s, f) => s + (f.fares?.length || 0), 0),
      totalReturnFares: extracted.returnFlights.reduce((s, f) => s + (f.fares?.length || 0), 0)
    });
    return extracted;
  }
  
  // ============ CASE 2b: Under response.data ============
  if (data.response?.data?.roundTrips && Array.isArray(data.response.data.roundTrips) && data.response.data.roundTrips.length > 0) {
    console.log('✅ CASE 2b: Found roundTrips under response.data with', data.response.data.roundTrips.length, 'items');
    const extracted = extractFromRoundTrips(data.response.data.roundTrips);
    console.log('📊 Extract result:', {
      outboundCount: extracted.outboundFlights.length,
      returnCount: extracted.returnFlights.length,
      totalOutboundFares: extracted.outboundFlights.reduce((s, f) => s + (f.fares?.length || 0), 0),
      totalReturnFares: extracted.returnFlights.reduce((s, f) => s + (f.fares?.length || 0), 0)
    });
    return extracted;
  }

  // ============ CASE 3: roundTripDisplay format (fallback) ============
  if (data.roundTripDisplay) {
    console.log('⚠️ CASE 3: No roundTrips found, using roundTripDisplay as fallback');
    console.log('   This will result in NO fare options!');
    const extracted = extractFromDisplay(data.roundTripDisplay, data.roundTrips);
    console.log('📊 Extract result (fallback):', {
      outboundCount: extracted.outboundFlights.length,
      returnCount: extracted.returnFlights.length,
      totalOutboundFares: extracted.outboundFlights.reduce((s, f) => s + (f.fares?.length || 0), 0),
      totalReturnFares: extracted.returnFlights.reduce((s, f) => s + (f.fares?.length || 0), 0)
    });
    return extracted;
  }

  console.log('❌ No valid data structure found');
  return result;
};

/**
 * Extract from roundTrips array with proper fare aggregation
 */
const extractFromRoundTrips = (roundTrips) => {
  console.log('\n' + '='.repeat(80));
  console.log('📊 [extractFromRoundTrips] STARTED');
  console.log('='.repeat(80));
  console.log('Input type:', typeof roundTrips);
  console.log('Is array:', Array.isArray(roundTrips));
  console.log('Length:', roundTrips?.length);
  
  if (!roundTrips || !Array.isArray(roundTrips) || roundTrips.length === 0) {
    console.error('❌ Invalid or empty roundTrips array');
    return { outboundFlights: [], returnFlights: [], combinations: [] };
  }
  
  // Log sample of first trip
  const firstTrip = roundTrips[0];
  console.log('\n📋 FIRST ROUND-TRIP SAMPLE:');
  console.log('----------------------------------------');
  console.log('id:', firstTrip.id);
  console.log('totalPrice:', firstTrip.totalPrice);
  console.log('formattedPrice:', firstTrip.formattedPrice);
  console.log('outbound:', {
    airline: firstTrip.outbound?.airline,
    airlineCode: firstTrip.outbound?.airlineCode,
    flightNumber: firstTrip.outbound?.defaultFlight?.flightNumber,
    brand: firstTrip.outbound?.brand?.name,
    brandId: firstTrip.outbound?.brand?.id,
    fareBasis: firstTrip.outbound?.fareBasis,
    hasBaggage: !!firstTrip.outbound?.baggage
  });
  console.log('return:', {
    airline: firstTrip.return?.airline,
    airlineCode: firstTrip.return?.airlineCode,
    flightNumber: firstTrip.return?.defaultFlight?.flightNumber,
    brand: firstTrip.return?.brand?.name,
    brandId: firstTrip.return?.brand?.id,
    fareBasis: firstTrip.return?.fareBasis,
    hasBaggage: !!firstTrip.return?.baggage
  });
  console.log('----------------------------------------\n');
  
  // Maps to store unique flights with all their fare options
  const outboundMap = new Map();
  const returnMap = new Map();
  const combinations = [];
  let processedCount = 0;
  let skippedCount = 0;

  roundTrips.forEach((trip, index) => {
    // Validate trip data
    if (!trip?.outbound?.defaultFlight || !trip?.return?.defaultFlight) {
      console.warn(`⚠️ Trip ${index} missing required data, skipping`);
      skippedCount++;
      return;
    }
    
    processedCount++;

    const outboundFlight = trip.outbound.defaultFlight;
    const returnFlight = trip.return.defaultFlight;
    
    // Create unique keys for flights
    const outboundKey = `${trip.outbound.airlineCode}-${outboundFlight.flightNumber?.split('-')[1] || outboundFlight.flightNumber}-${outboundFlight.departureTime}`;
    const returnKey = `${trip.return.airlineCode}-${returnFlight.flightNumber?.split('-')[1] || returnFlight.flightNumber}-${returnFlight.departureTime}`;
    
    // Calculate prices
    const outboundPrice = parsePrice(trip.legPricing?.outbound?.totalPrice) || parsePrice(trip.totalPrice) / 2;
    const returnPrice = parsePrice(trip.legPricing?.return?.totalPrice) || parsePrice(trip.totalPrice) / 2;
    
    // ============ CREATE OUTBOUND FARE OBJECT WITH DISTANCE ============
    const outboundFare = {
      id: trip.id,
      fareKey: trip.outbound.fareBasis || `fare-${index}`,
      bookingCode: outboundFlight.segments?.[0]?.bookingCode || 'Y',
      price: outboundPrice,
      totalPrice: outboundPrice,
      basePrice: parsePrice(trip.legPricing?.outbound?.basePrice) || 0,
      taxes: parsePrice(trip.taxes) / 2,
      taxBreakdown: trip.taxBreakdown || [],
      penalties: trip.penalties || { change: { amount: 0 }, cancel: { amount: 0 } },
      brand: trip.outbound.brand || { name: 'Economy', id: null, tier: '0001' },
      baggage: trip.outbound.baggage || { checked: { weight_kg: 15 }, carryon: { weight_kg: 7 } },
      fareBasis: trip.outbound.fareBasis,
      passengerType: 'ADT',
      refundable: trip.outbound.refundable || false,
      eticketable: true,
      cabinClass: outboundFlight.cabinClass || 'Economy',
      seatsAvailable: outboundFlight.seatsAvailable || 9,
      amenities: trip.outbound.amenities || { meals: false, mealType: null, seatSelection: false, changes: false, priority: false },
      hostToken: trip.outbound.hostToken,
      segments: ensureSegmentsWithDistance(outboundFlight),
      formattedPrice: `₹${Math.round(outboundPrice).toLocaleString('en-IN')}`
    };
    
    // ============ CREATE RETURN FARE OBJECT WITH DISTANCE ============
    const returnFare = {
      id: trip.id,
      fareKey: trip.return.fareBasis || `fare-${index}`,
      bookingCode: returnFlight.segments?.[0]?.bookingCode || 'Y',
      price: returnPrice,
      totalPrice: returnPrice,
      basePrice: parsePrice(trip.legPricing?.return?.basePrice) || 0,
      taxes: parsePrice(trip.taxes) / 2,
      taxBreakdown: trip.taxBreakdown || [],
      penalties: trip.penalties || { change: { amount: 0 }, cancel: { amount: 0 } },
      brand: trip.return.brand || { name: 'Economy', id: null, tier: '0001' },
      baggage: trip.return.baggage || { checked: { weight_kg: 15 }, carryon: { weight_kg: 7 } },
      fareBasis: trip.return.fareBasis,
      passengerType: 'ADT',
      refundable: trip.return.refundable || false,
      eticketable: true,
      cabinClass: returnFlight.cabinClass || 'Economy',
      seatsAvailable: returnFlight.seatsAvailable || 9,
      amenities: trip.return.amenities || { meals: false, mealType: null, seatSelection: false, changes: false, priority: false },
      hostToken: trip.return.hostToken,
      segments: ensureSegmentsWithDistance(returnFlight),
      formattedPrice: `₹${Math.round(returnPrice).toLocaleString('en-IN')}`
    };
    
    // Debug log for distance on first fare
    if (index === 0) {
      console.log('🔍 First outbound segment distance:', outboundFare.segments[0]?.distance);
      console.log('🔍 First return segment distance:', returnFare.segments[0]?.distance);
    }
    
    // ============ DEBUG: Log fare creation for first few trips ============
    if (index < 5) {
      console.log(`🔍 Trip ${index} - Created fares:`, {
        outboundKey,
        outboundBrand: outboundFare.brand?.name,
        outboundPrice: outboundFare.totalPrice,
        outboundDistance: outboundFare.segments[0]?.distance,
        returnKey,
        returnBrand: returnFare.brand?.name,
        returnPrice: returnFare.totalPrice,
        returnDistance: returnFare.segments[0]?.distance
      });
    }
    
    // ============ STORE OUTBOUND FLIGHT WITH FARE ============
    if (!outboundMap.has(outboundKey)) {
      outboundMap.set(outboundKey, {
        id: outboundKey,
        flightNumber: outboundFlight.flightNumber,
        flightNumbers: outboundFlight.flightNumbers || [outboundFlight.flightNumber],
        departureTime: outboundFlight.departureTime,
        arrivalTime: outboundFlight.arrivalTime,
        origin: outboundFlight.origin,
        destination: outboundFlight.destination,
        duration: outboundFlight.duration,
        stops: outboundFlight.stops || 0,
        segments: ensureSegmentsWithDistance(outboundFlight),
        layovers: outboundFlight.layovers || [],
        seatsAvailable: outboundFlight.seatsAvailable || 9,
        originTerminal: outboundFlight.originTerminal,
        destinationTerminal: outboundFlight.destinationTerminal,
        airline: trip.outbound.airline,
        airlineCode: trip.outbound.airlineCode,
        price: outboundFare.totalPrice,
        lowestPrice: Infinity,
        highestPrice: 0,
        fares: []
      });
    }
    
    const outboundFlightObj = outboundMap.get(outboundKey);
    // Check for duplicate fare (same brand)
    const isDuplicate = outboundFlightObj.fares.some(f => 
      f.brand?.name === outboundFare.brand?.name
    );
    
    if (!isDuplicate) {
      outboundFlightObj.fares.push(outboundFare);
      outboundFlightObj.lowestPrice = Math.min(outboundFlightObj.lowestPrice, outboundFare.totalPrice);
      outboundFlightObj.highestPrice = Math.max(outboundFlightObj.highestPrice, outboundFare.totalPrice);
      if (index < 5) {
        console.log(`   ✅ Added outbound fare to ${outboundKey}, now has ${outboundFlightObj.fares.length} fares`);
      }
    } else {
      if (index < 5) {
        console.log(`   ⚠️ Skipped duplicate outbound fare: ${outboundFare.brand?.name}`);
      }
    }
    
    // ============ STORE RETURN FLIGHT WITH FARE ============
    if (!returnMap.has(returnKey)) {
      returnMap.set(returnKey, {
        id: returnKey,
        flightNumber: returnFlight.flightNumber,
        flightNumbers: returnFlight.flightNumbers || [returnFlight.flightNumber],
        departureTime: returnFlight.departureTime,
        arrivalTime: returnFlight.arrivalTime,
        origin: returnFlight.origin,
        destination: returnFlight.destination,
        duration: returnFlight.duration,
        stops: returnFlight.stops || 0,
        segments: ensureSegmentsWithDistance(returnFlight),
        layovers: returnFlight.layovers || [],
        seatsAvailable: returnFlight.seatsAvailable || 9,
        originTerminal: returnFlight.originTerminal,
        destinationTerminal: returnFlight.destinationTerminal,
        airline: trip.return.airline,
        airlineCode: trip.return.airlineCode,
        price: returnFare.totalPrice,
        lowestPrice: Infinity,
        highestPrice: 0,
        fares: []
      });
    }
    
    const returnFlightObj = returnMap.get(returnKey);
    const isReturnDuplicate = returnFlightObj.fares.some(f => 
      f.brand?.name === returnFare.brand?.name
    );
    
    if (!isReturnDuplicate) {
      returnFlightObj.fares.push(returnFare);
      returnFlightObj.lowestPrice = Math.min(returnFlightObj.lowestPrice, returnFare.totalPrice);
      returnFlightObj.highestPrice = Math.max(returnFlightObj.highestPrice, returnFare.totalPrice);
      if (index < 5) {
        console.log(`   ✅ Added return fare to ${returnKey}, now has ${returnFlightObj.fares.length} fares`);
      }
    } else {
      if (index < 5) {
        console.log(`   ⚠️ Skipped duplicate return fare: ${returnFare.brand?.name}`);
      }
    }
    
    // Store combination
    combinations.push({
      id: trip.id || `combo-${index}`,
      totalPrice: trip.totalPrice || 0,
      outboundId: outboundKey,
      returnId: returnKey,
      outboundFare: outboundFare,
      returnFare: returnFare
    });
  });
  
  console.log(`\n📊 Processing summary: Processed ${processedCount} trips, Skipped ${skippedCount} trips`);
  
  // Convert maps to arrays and sort fares by price
  const outboundFlights = Array.from(outboundMap.values()).map(flight => {
    flight.fares.sort((a, b) => a.totalPrice - b.totalPrice);
    flight.price = flight.lowestPrice;
    if (flight.fares[0]?.brand) {
      flight.brand = flight.fares[0].brand;
      flight.mealType = flight.fares[0].amenities?.mealType || null;
    }
    return flight;
  }).sort((a, b) => a.lowestPrice - b.lowestPrice);
  
  const returnFlights = Array.from(returnMap.values()).map(flight => {
    flight.fares.sort((a, b) => a.totalPrice - b.totalPrice);
    flight.price = flight.lowestPrice;
    if (flight.fares[0]?.brand) {
      flight.brand = flight.fares[0].brand;
      flight.mealType = flight.fares[0].amenities?.mealType || null;
    }
    return flight;
  }).sort((a, b) => a.lowestPrice - b.lowestPrice);
  
  // ============ FINAL DEBUG LOG ============
  const totalOutboundFares = outboundFlights.reduce((sum, f) => sum + f.fares.length, 0);
  const totalReturnFares = returnFlights.reduce((sum, f) => sum + f.fares.length, 0);
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ [extractFromRoundTrips] FINAL RESULTS');
  console.log('='.repeat(80));
  console.log({
    outboundFlightsCount: outboundFlights.length,
    returnFlightsCount: returnFlights.length,
    combinationsCount: combinations.length,
    totalOutboundFares,
    totalReturnFares,
    sampleOutboundFlight: outboundFlights[0] ? {
      flightNumber: outboundFlights[0].flightNumber,
      airline: outboundFlights[0].airline,
      faresCount: outboundFlights[0].fares.length,
      fareNames: outboundFlights[0].fares.map(f => f.brand?.name),
      sampleDistance: outboundFlights[0].segments[0]?.distance
    } : 'No outbound flights',
    sampleReturnFlight: returnFlights[0] ? {
      flightNumber: returnFlights[0].flightNumber,
      airline: returnFlights[0].airline,
      faresCount: returnFlights[0].fares.length,
      fareNames: returnFlights[0].fares.map(f => f.brand?.name),
      sampleDistance: returnFlights[0].segments[0]?.distance
    } : 'No return flights'
  });
  console.log('='.repeat(80) + '\n');
  
  return {
    outboundFlights,
    returnFlights,
    combinations
  };
};

/**
 * Extract from roundTripDisplay format (fallback)
 */
const extractFromDisplay = (display, roundTrips) => {
  console.log('\n⚠️ [extractFromDisplay] Using fallback (no fare options will be available)');
  
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
    segments: ensureSegmentsWithDistance(flight),
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
    segments: ensureSegmentsWithDistance(flight),
    lowestPrice: flight.price || 0,
    price: flight.price || 0,
    fares: flight.fares || []
  }));

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

  console.log('📊 Extracted from display (no fare options):', {
    outbound: outboundFlights.length,
    return: returnFlights.length,
    combinations: combinations.length,
    sampleFaresCount: outboundFlights[0]?.fares?.length || 0
  });

  return {
    outboundFlights,
    returnFlights,
    combinations
  };
};

export default transformFlightData;
