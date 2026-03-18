// src/modules/flights/services/flightSearchService.js

const BASE_URL = 'https://api.bobros.org';

const AIRLINE_NAMES = {
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

// ============ SAFE ARRAY HELPER ============
const safeArray = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

// ============ HELPER FUNCTIONS ============

const extractAirportCode = (input) => {
  if (!input) return '';
  if (typeof input === 'string') {
    if (/^[A-Z]{3}$/.test(input.trim())) return input.trim();
    const match = input.match(/\(([A-Z]{3})\)/);
    if (match) return match[1];
    const codeMatch = input.match(/^([A-Z]{3})/);
    if (codeMatch) return codeMatch[1];
    return input.substring(0, 3).toUpperCase();
  }
  if (input?.location_code) return input.location_code;
  return '';
};

const formatDateForAPI = (date) => {
  if (!date) return null;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return null;
};

const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const mins = parseInt(minutes);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
};

const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return '--:--';
  }
};

const parsePrice = (priceString) => {
  if (!priceString) return 0;
  if (typeof priceString === 'number') return priceString;
  const match = priceString.toString().match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

const parseDuration = (durationStr) => {
  if (!durationStr) return 0;
  if (/^\d+$/.test(durationStr)) return parseInt(durationStr);
  
  const hours = parseInt(durationStr.match(/(\d+)H/)?.[1] || '0');
  const minutes = parseInt(durationStr.match(/(\d+)M/)?.[1] || '0');
  return hours * 60 + minutes;
};

const calculateLayovers = (segments) => {
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

const extractPenalties = (pricingInfo) => {
  const penalties = {
    change: { amount: null, percentage: null, applies: null, noShow: false },
    cancel: { amount: null, percentage: null, applies: null, noShow: false }
  };

  if (pricingInfo['air:ChangePenalty']) {
    const change = pricingInfo['air:ChangePenalty'];
    penalties.change.applies = change.$?.PenaltyApplies || null;
    penalties.change.noShow = change.$?.NoShow === 'true';
    
    if (change['air:Amount']) {
      penalties.change.amount = parsePrice(change['air:Amount']);
    }
    if (change['air:Percentage']) {
      penalties.change.percentage = change['air:Percentage'];
    }
  }

  if (pricingInfo['air:CancelPenalty']) {
    const cancel = pricingInfo['air:CancelPenalty'];
    penalties.cancel.applies = cancel.$?.PenaltyApplies || null;
    penalties.cancel.noShow = cancel.$?.NoShow === 'true';
    
    if (cancel['air:Amount']) {
      penalties.cancel.amount = parsePrice(cancel['air:Amount']);
    }
    if (cancel['air:Percentage']) {
      penalties.cancel.percentage = cancel['air:Percentage'];
    }
  }

  return penalties;
};

// ============ SEGMENT PARSING ============

const parseFlightSegments = (flightOption, segmentMap, detailsMap) => {
  if (!flightOption) return [];
  
  const options = flightOption['air:Option'];
  if (!options) return [];
  
  const optionList = safeArray(options);
  
  return optionList.map(opt => {
    const bookingInfo = opt['air:BookingInfo'];
    const bookingInfos = safeArray(bookingInfo);
    
    return bookingInfos.map(bi => {
      const segmentRef = bi.$?.SegmentRef;
      const segment = segmentMap[segmentRef];
      if (!segment || !segment.$) return null;
      
      let terminal = null;
      let originTerminal = null;
      let destinationTerminal = null;
      let equipment = segment.$?.Equipment;
      
      if (segment['air:FlightDetailsRef']?.$?.Key) {
        const detailsRef = segment['air:FlightDetailsRef'].$.Key;
        const details = detailsMap[detailsRef];
        if (details?.$) {
          originTerminal = details.$?.OriginTerminal || null;
          destinationTerminal = details.$?.DestinationTerminal || null;
          terminal = originTerminal || destinationTerminal;
          equipment = details.$?.Equipment || equipment;
        }
      }
      
      return {
        carrier: segment.$.Carrier,
        flightNumber: segment.$.FlightNumber,
        origin: segment.$.Origin,
        destination: segment.$.Destination,
        departureTime: segment.$.DepartureTime,
        arrivalTime: segment.$.ArrivalTime,
        duration: parseDuration(segment.$.FlightTime),
        equipment,
        originTerminal,
        destinationTerminal,
        terminal,
        bookingCode: bi.$?.BookingCode,
        cabinClass: bi.$?.CabinClass || 'Economy',
        seatsAvailable: parseInt(bi.$?.BookingCount) || 9
      };
    }).filter(Boolean);
  }).filter(segments => segments.length > 0);
};

// ============ BRAND EXTRACTION ============

const extractBrandDetails = (brand, fareInfo) => {
  if (!brand) {
    // Try to infer brand from fare basis if no brand found
    const fareBasis = fareInfo?.$?.FareBasis || '';
    return {
      id: null,
      name: inferBrandFromFareBasis(fareBasis),
      description: '',
      upsell: '',
      features: [],
      titles: {},
      images: []
    };
  }
  
  let description = '';
  let upsell = '';
  let features = [];
  const titles = {};
  const images = [];
  
  // Extract titles
  const titleElements = brand['air:Title'];
  if (titleElements) {
    safeArray(titleElements).forEach(title => {
      if (title.$?.Type && title._) {
        titles[title.$.Type.toLowerCase()] = title._;
      }
    });
  }
  
  // Extract texts
  const texts = brand['air:Text'];
  if (texts) {
    safeArray(texts).forEach(text => {
      if (text.$?.Type === 'Upsell') {
        upsell = text._ || '';
      } else if (text.$?.Type === 'MarketingAgent') {
        description = text._ || '';
        
        const lines = text._?.split('\n') || [];
        lines.forEach(line => {
          const cleanLine = line.replace(/[-•✓*]/g, '').trim();
          if (cleanLine && cleanLine.length > 5 && !cleanLine.includes('***') && !cleanLine.includes('Disclaimer')) {
            features.push(cleanLine);
          }
        });
      }
    });
  }
  
  // Extract images
  const images_elements = brand['air:ImageLocation'];
  if (images_elements) {
    safeArray(images_elements).forEach(img => {
      if (img._ && img.$) {
        images.push({
          url: img._,
          type: img.$?.Type || 'unknown',
          width: img.$?.ImageWidth,
          height: img.$?.ImageHeight
        });
      }
    });
  }
  
  return {
    id: brand.$?.BrandID,
    name: titles.external || brand.$?.Name || 'Economy',
    shortName: titles.short || brand.$?.Name || 'Economy',
    description,
    upsell,
    features: features.slice(0, 8), // Limit features
    titles,
    images,
    carrier: brand.$?.Carrier
  };
};

const inferBrandFromFareBasis = (fareBasis) => {
  if (!fareBasis) return 'Economy';
  
  const upper = fareBasis.toUpperCase();
  if (upper.includes('FLEX')) return 'Flexible';
  if (upper.includes('BUS') || upper.includes('C')) return 'Business';
  if (upper.includes('FIRST') || upper.includes('F')) return 'First';
  if (upper.includes('PREMIUM') || upper.includes('W')) return 'Premium Economy';
  if (upper.includes('LIGHT') || upper.includes('L')) return 'Lite';
  if (upper.includes('SAVER') || upper.includes('S')) return 'Saver';
  
  return 'Economy';
};

// ============ BAGGAGE EXTRACTION ============

const extractBaggage = (fareInfo) => {
  const result = {
    weight: '15',
    unit: 'kg',
    pieces: null,
    description: ''
  };
  
  if (!fareInfo?.['air:BaggageAllowance']) return result;
  
  const allowance = fareInfo['air:BaggageAllowance'];
  
  // Check for max weight
  if (allowance['air:MaxWeight']?.$) {
    const maxWeight = allowance['air:MaxWeight'].$;
    result.weight = maxWeight.Value || '15';
    result.unit = maxWeight.Unit === 'Kilograms' ? 'kg' : maxWeight.Unit || 'kg';
  }
  
  // Check for pieces
  if (allowance['air:NumberOfPieces']) {
    result.pieces = allowance['air:NumberOfPieces'];
    result.description = `${result.pieces} piece${result.pieces > 1 ? 's' : ''}`;
  } else {
    result.description = `${result.weight}${result.unit}`;
  }
  
  return result;
};

// ============ TAX EXTRACTION ============

const extractTaxes = (pricingInfo) => {
  const taxes = [];
  const taxInfo = pricingInfo['air:TaxInfo'];
  
  if (!taxInfo) return taxes;
  
  safeArray(taxInfo).forEach(tax => {
    if (tax.$) {
      taxes.push({
        category: tax.$.Category || '',
        code: tax.$.Category || '',
        amount: parsePrice(tax.$.Amount),
        description: tax.$.Category || `Tax`,
        supplierCode: tax.$.SupplierCode
      });
    }
  });
  
  return taxes;
};

// ============ FARE OPTION EXTRACTION ============

const extractFareOptions = (pricePoint, pricingInfo, fareInfoKeys, fareInfoMap, segmentMap, detailsMap, brandMap, brandByIdMap, passengerCount) => {
  const fareOptions = [];
  
  for (const fareKey of fareInfoKeys) {
    const fareInfo = fareInfoMap[fareKey];
    if (!fareInfo) continue;
    
    // Get brand for this fare
    let brandObj = null;
    if (fareInfo['air:Brand']) {
      const brandKey = fareInfo['air:Brand'].$?.Key;
      const brandId = fareInfo['air:Brand'].$?.BrandID;
      brandObj = brandMap[brandKey] || brandByIdMap[brandId];
    }
    
    const brand = extractBrandDetails(brandObj, fareInfo);
    const baggage = extractBaggage(fareInfo);
    
    // Get flight segments for this fare
    const flightOptions = pricingInfo['air:FlightOptionsList']?.['air:FlightOption'];
    if (!flightOptions) continue;
    
    const segmentsList = parseFlightSegments(flightOptions, segmentMap, detailsMap);
    if (!segmentsList.length) continue;
    
    // Create fare option for each segment combination
    segmentsList.forEach((segments, idx) => {
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];
      const taxes = extractTaxes(pricingInfo);
      const penalties = extractPenalties(pricingInfo);
      
      fareOptions.push({
        id: `${fareKey}-${idx}-${Date.now()}`,
        fareKey,
        price: parsePrice(fareInfo.$?.Amount),
        formattedPrice: fareInfo.$?.Amount || `₹0`,
        totalPrice: parsePrice(pricePoint.$?.TotalPrice),
        basePrice: parsePrice(pricePoint.$?.BasePrice),
        taxes,
        penalties,
        brand,
        baggage,
        fareBasis: fareInfo.$?.FareBasis,
        passengerType: fareInfo.$?.PassengerTypeCode || 'ADT',
        refundable: pricingInfo.$?.Refundable === 'true',
        eticketable: pricingInfo.$?.ETicketability === 'Yes',
        pricingMethod: pricingInfo.$?.PricingMethod,
        latestTicketingTime: pricingInfo.$?.LatestTicketingTime,
        segments,
        cabinClass: firstSegment.cabinClass,
        seatsAvailable: Math.min(...segments.map(s => s.seatsAvailable)),
        amenities: {
          meals: brand.name?.toLowerCase().includes('flex') || 
                 brand.name?.toLowerCase().includes('stretch') || 
                 firstSegment.cabinClass === 'Business' || false,
          seatSelection: brand.name?.toLowerCase().includes('flex') || 
                        brand.name?.toLowerCase().includes('upfront') || 
                        brand.name?.toLowerCase().includes('xl') || false,
          changes: penalties.change.amount === 0 || 
                  penalties.change.percentage === '0.00' || 
                  brand.name?.toLowerCase().includes('flex') || false,
          priority: brand.name?.toLowerCase().includes('priority') || 
                   brand.name?.toLowerCase().includes('plus') || 
                   firstSegment.cabinClass === 'Business' || false
        }
      });
    });
  }
  
  return fareOptions;
};

// ============ FLIGHT GROUPING ============

const groupFlightsByKey = (fareOptions) => {
  const flightMap = new Map();
  
  fareOptions.forEach(fare => {
    if (!fare.segments?.length) return;
    
    const firstSegment = fare.segments[0];
    const lastSegment = fare.segments[fare.segments.length - 1];
    
    // Create a unique key for this physical flight (no random string!)
    const flightKey = `${firstSegment.carrier}-${firstSegment.flightNumber}-${firstSegment.departureTime}`;
    
    if (!flightMap.has(flightKey)) {
      flightMap.set(flightKey, {
        id: flightKey,
        flightKey,
        airline: AIRLINE_NAMES[firstSegment.carrier] || firstSegment.carrier,
        airlineCode: firstSegment.carrier,
        flightNumber: `${firstSegment.carrier}-${firstSegment.flightNumber}`,
        flightNum: firstSegment.flightNumber,
        departureTime: firstSegment.departureTime,
        arrivalTime: lastSegment.arrivalTime,
        origin: firstSegment.origin,
        destination: lastSegment.destination,
        duration: lastSegment.duration,
        stops: fare.segments.length - 1,
        segments: fare.segments,
        layovers: calculateLayovers(fare.segments),
        seatsAvailable: fare.seatsAvailable,
        cabinClass: fare.cabinClass,
        originTerminal: firstSegment.originTerminal,
        destinationTerminal: lastSegment.destinationTerminal,
        equipment: firstSegment.equipment,
        fares: [],
        lowestPrice: Infinity,
        highestPrice: 0
      });
    }
    
    const flight = flightMap.get(flightKey);
    
    // Check if this fare is already added (avoid duplicates)
    const exists = flight.fares.some(f => f.fareKey === fare.fareKey);
    if (!exists) {
      flight.fares.push(fare);
      flight.lowestPrice = Math.min(flight.lowestPrice, fare.totalPrice);
      flight.highestPrice = Math.max(flight.highestPrice, fare.totalPrice);
    }
  });
  
  // Sort fares by price and mark lowest
  flightMap.forEach(flight => {
    flight.fares.sort((a, b) => a.totalPrice - b.totalPrice);
    flight.fares = flight.fares.map((fare, index) => ({
      ...fare,
      isLowest: index === 0,
      isHighest: index === flight.fares.length - 1
    }));
  });
  
  return Array.from(flightMap.values());
};

// ============ ONE-WAY TRANSFORMATION ============

const transformOneWayResponse = (data, passengerCount) => {
  // Extract all components
  const segments = safeArray(data['air:AirSegmentList']?.['air:AirSegment']);
  const pricePoints = safeArray(data['air:AirPricePointList']?.['air:AirPricePoint']);
  const fareInfos = safeArray(data['air:FareInfoList']?.['air:FareInfo']);
  const brands = safeArray(data['air:BrandList']?.['air:Brand']);
  const flightDetails = safeArray(data['air:FlightDetailsList']?.['air:FlightDetails']);

  // Build maps
  const segmentMap = {};
  segments.forEach(s => { if (s.$?.Key) segmentMap[s.$.Key] = s; });

  const fareInfoMap = {};
  fareInfos.forEach(f => { if (f.$?.Key) fareInfoMap[f.$.Key] = f; });

  const detailsMap = {};
  flightDetails.forEach(d => { if (d.$?.Key) detailsMap[d.$.Key] = d; });

  const brandMap = {};
  const brandByIdMap = {};
  brands.forEach(b => { 
    if (b.$?.Key) {
      brandMap[b.$.Key] = b;
      if (b.$.BrandID) brandByIdMap[b.$.BrandID] = b;
    }
  });

  // Extract all fare options
  const allFareOptions = [];
  
  pricePoints.forEach(pricePoint => {
    try {
      const pricingInfo = pricePoint['air:AirPricingInfo'];
      if (!pricingInfo) return;
      
      const fareInfoRef = pricingInfo['air:FareInfoRef'];
      const fareInfoKeys = safeArray(fareInfoRef).map(ref => ref.$?.Key).filter(Boolean);
      
      if (!fareInfoKeys.length) return;
      
      const flightOptions = pricingInfo['air:FlightOptionsList']?.['air:FlightOption'];
      const legCount = flightOptions ? (Array.isArray(flightOptions) ? flightOptions.length : 1) : 0;
      
      // Skip round trips (2 legs) for one-way processing
      if (legCount === 2 && fareInfoKeys.length === 2) return;
      
      const fareOptions = extractFareOptions(
        pricePoint, pricingInfo, fareInfoKeys, fareInfoMap, 
        segmentMap, detailsMap, brandMap, brandByIdMap, passengerCount
      );
      
      allFareOptions.push(...fareOptions);
      
    } catch (err) {
      // Silently handle errors
    }
  });

  // Group flights and their fare options
  const flights = groupFlightsByKey(allFareOptions);
  
  // Sort by lowest price
  flights.sort((a, b) => a.lowestPrice - b.lowestPrice);

  return {
    flights,
    brandDetails: brandByIdMap,
    count: flights.length,
    currency: data.$?.CurrencyType || 'INR'
  };
};

// ============ ROUND TRIP TRANSFORMATION ============

const transformRoundTripResponse = (data, passengerCount) => {
  const segments = safeArray(data['air:AirSegmentList']?.['air:AirSegment']);
  const pricePoints = safeArray(data['air:AirPricePointList']?.['air:AirPricePoint']);
  const fareInfos = safeArray(data['air:FareInfoList']?.['air:FareInfo']);
  const brands = safeArray(data['air:BrandList']?.['air:Brand']);
  const flightDetails = safeArray(data['air:FlightDetailsList']?.['air:FlightDetails']);

  // Build maps
  const segmentMap = {};
  segments.forEach(s => { if (s.$?.Key) segmentMap[s.$.Key] = s; });

  const fareInfoMap = {};
  fareInfos.forEach(f => { if (f.$?.Key) fareInfoMap[f.$.Key] = f; });

  const detailsMap = {};
  flightDetails.forEach(d => { if (d.$?.Key) detailsMap[d.$.Key] = d; });

  const brandMap = {};
  const brandByIdMap = {};
  brands.forEach(b => { 
    if (b.$?.Key) {
      brandMap[b.$.Key] = b;
      if (b.$.BrandID) brandByIdMap[b.$.BrandID] = b;
    }
  });

  const roundTrips = [];
  const outboundFlightsMap = new Map();
  const returnFlightsMap = new Map();

  pricePoints.forEach(pricePoint => {
    try {
      const pricingInfo = pricePoint['air:AirPricingInfo'];
      if (!pricingInfo) return;
      
      const fareInfoRef = pricingInfo['air:FareInfoRef'];
      const fareInfoKeys = safeArray(fareInfoRef).map(ref => ref.$?.Key).filter(Boolean);
      
      if (fareInfoKeys.length !== 2) return;
      
      const flightOptions = pricingInfo['air:FlightOptionsList']?.['air:FlightOption'];
      const legCount = flightOptions ? (Array.isArray(flightOptions) ? flightOptions.length : 1) : 0;
      
      if (legCount !== 2) return;
      
      // Extract outbound fare options
      const outboundFareKey = fareInfoKeys[0];
      const outboundFareInfo = fareInfoMap[outboundFareKey];
      
      let outboundBrandObj = null;
      if (outboundFareInfo?.['air:Brand']) {
        const brandKey = outboundFareInfo['air:Brand'].$?.Key;
        const brandId = outboundFareInfo['air:Brand'].$?.BrandID;
        outboundBrandObj = brandMap[brandKey] || brandByIdMap[brandId];
      }
      const outboundBrand = extractBrandDetails(outboundBrandObj, outboundFareInfo);
      const outboundBaggage = extractBaggage(outboundFareInfo);
      
      // Extract return fare options
      const returnFareKey = fareInfoKeys[1];
      const returnFareInfo = fareInfoMap[returnFareKey];
      
      let returnBrandObj = null;
      if (returnFareInfo?.['air:Brand']) {
        const brandKey = returnFareInfo['air:Brand'].$?.Key;
        const brandId = returnFareInfo['air:Brand'].$?.BrandID;
        returnBrandObj = brandMap[brandKey] || brandByIdMap[brandId];
      }
      const returnBrand = extractBrandDetails(returnBrandObj, returnFareInfo);
      const returnBaggage = extractBaggage(returnFareInfo);
      
      // Parse flight options
      const outboundOption = flightOptions && (Array.isArray(flightOptions) ? flightOptions[0] : flightOptions);
      const returnOption = flightOptions && (Array.isArray(flightOptions) ? flightOptions[1] : flightOptions);
      
      if (!outboundOption || !returnOption) return;
      
      const outboundSegmentsList = parseFlightSegments(outboundOption, segmentMap, detailsMap);
      const returnSegmentsList = parseFlightSegments(returnOption, segmentMap, detailsMap);
      
      if (!outboundSegmentsList.length || !returnSegmentsList.length) return;
      
      const outboundSegments = outboundSegmentsList[0];
      const returnSegments = returnSegmentsList[0];
      
      const outboundFirst = outboundSegments[0];
      const outboundLast = outboundSegments[outboundSegments.length - 1];
      const returnFirst = returnSegments[0];
      const returnLast = returnSegments[returnSegments.length - 1];
      
      const taxes = extractTaxes(pricingInfo);
      const penalties = extractPenalties(pricingInfo);
      
      const roundTripId = `rt-${pricePoint.$?.Key}-${Date.now()}`;
      
      const roundTrip = {
        id: roundTripId,
        totalPrice: parsePrice(pricePoint.$?.TotalPrice),
        formattedPrice: pricePoint.$?.TotalPrice || '',
        basePrice: parsePrice(pricePoint.$?.BasePrice),
        taxes,
        penalties,
        
        outbound: {
          id: `out-${roundTripId}`,
          airline: AIRLINE_NAMES[outboundFirst.carrier] || outboundFirst.carrier,
          airlineCode: outboundFirst.carrier,
          flightNumber: `${outboundFirst.carrier}-${outboundFirst.flightNumber}`,
          flightNumbers: outboundSegments.map(s => s.flightNumber),
          departureTime: outboundFirst.departureTime,
          arrivalTime: outboundLast.arrivalTime,
          origin: outboundFirst.origin,
          destination: outboundLast.destination,
          duration: outboundLast.duration,
          stops: outboundSegments.length - 1,
          segments: outboundSegments,
          layovers: calculateLayovers(outboundSegments),
          seatsAvailable: Math.min(...outboundSegments.map(s => s.seatsAvailable)),
          cabinClass: outboundFirst.cabinClass,
          originTerminal: outboundFirst.originTerminal,
          destinationTerminal: outboundLast.destinationTerminal,
          brand: outboundBrand,
          baggage: outboundBaggage,
          fareBasis: outboundFareInfo?.$?.FareBasis,
          refundable: pricingInfo.$?.Refundable === 'true'
        },
        
        return: {
          id: `ret-${roundTripId}`,
          airline: AIRLINE_NAMES[returnFirst.carrier] || returnFirst.carrier,
          airlineCode: returnFirst.carrier,
          flightNumber: `${returnFirst.carrier}-${returnFirst.flightNumber}`,
          flightNumbers: returnSegments.map(s => s.flightNumber),
          departureTime: returnFirst.departureTime,
          arrivalTime: returnLast.arrivalTime,
          origin: returnFirst.origin,
          destination: returnLast.destination,
          duration: returnLast.duration,
          stops: returnSegments.length - 1,
          segments: returnSegments,
          layovers: calculateLayovers(returnSegments),
          seatsAvailable: Math.min(...returnSegments.map(s => s.seatsAvailable)),
          cabinClass: returnFirst.cabinClass,
          originTerminal: returnFirst.originTerminal,
          destinationTerminal: returnLast.destinationTerminal,
          brand: returnBrand,
          baggage: returnBaggage,
          fareBasis: returnFareInfo?.$?.FareBasis,
          refundable: pricingInfo.$?.Refundable === 'true'
        },
        
        amenities: {
          meals: outboundBrand.name?.toLowerCase().includes('flex') || 
                 returnBrand.name?.toLowerCase().includes('flex') || false,
          seatSelection: outboundBrand.name?.toLowerCase().includes('flex') || 
                        returnBrand.name?.toLowerCase().includes('flex') || false,
          changes: penalties.change.amount === 0 || 
                  penalties.change.percentage === '0.00' || false,
          priority: outboundBrand.name?.toLowerCase().includes('priority') || 
                   returnBrand.name?.toLowerCase().includes('priority') || false
        }
      };
      
      roundTrips.push(roundTrip);
      
      // Build outbound flight map for display
      const outboundKey = `${outboundFirst.carrier}-${outboundFirst.flightNumber}-${outboundFirst.departureTime}`;
      if (!outboundFlightsMap.has(outboundKey)) {
        outboundFlightsMap.set(outboundKey, {
          id: `out-display-${outboundKey}`,
          departureTime: formatTime(outboundFirst.departureTime),
          arrivalTime: formatTime(outboundLast.arrivalTime),
          departureISO: outboundFirst.departureTime,
          arrivalISO: outboundLast.arrivalTime,
          airline: outboundRound.airline,
          airlineCode: outboundFirst.carrier,
          flightNumber: outboundFirst.flightNumber,
          flightNumbers: outboundSegments.map(s => s.flightNumber),
          duration: outboundLast.duration,
          formattedDuration: formatDuration(outboundLast.duration),
          stops: outboundSegments.length - 1,
          origin: outboundFirst.origin,
          destination: outboundLast.destination,
          brand: outboundBrand,
          baggage: outboundBaggage,
          seatsAvailable: Math.min(...outboundSegments.map(s => s.seatsAvailable))
        });
      }
      
      // Build return flight map for display
      const returnKey = `${returnFirst.carrier}-${returnFirst.flightNumber}-${returnFirst.departureTime}`;
      if (!returnFlightsMap.has(returnKey)) {
        returnFlightsMap.set(returnKey, {
          id: `ret-display-${returnKey}`,
          departureTime: formatTime(returnFirst.departureTime),
          arrivalTime: formatTime(returnLast.arrivalTime),
          departureISO: returnFirst.departureTime,
          arrivalISO: returnLast.arrivalTime,
          airline: returnRound.airline,
          airlineCode: returnFirst.carrier,
          flightNumber: returnFirst.flightNumber,
          flightNumbers: returnSegments.map(s => s.flightNumber),
          duration: returnLast.duration,
          formattedDuration: formatDuration(returnLast.duration),
          stops: returnSegments.length - 1,
          origin: returnFirst.origin,
          destination: returnLast.destination,
          brand: returnBrand,
          baggage: returnBaggage,
          seatsAvailable: Math.min(...returnSegments.map(s => s.seatsAvailable))
        });
      }
      
    } catch (err) {
      // Silently handle errors
    }
  });

  // Sort round trips by price
  roundTrips.sort((a, b) => a.totalPrice - b.totalPrice);

  // Create display format
  const outboundFlights = Array.from(outboundFlightsMap.values())
    .sort((a, b) => new Date(a.departureISO) - new Date(b.departureISO));
  
  const returnFlights = Array.from(returnFlightsMap.values())
    .sort((a, b) => new Date(a.departureISO) - new Date(b.departureISO));

  const roundTripDisplay = outboundFlights.length && returnFlights.length ? {
    outbound: {
      date: new Date(outboundFlights[0].departureISO).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      }),
      origin: outboundFlights[0].origin,
      destination: outboundFlights[0].destination,
      flights: outboundFlights
    },
    return: {
      date: new Date(returnFlights[0].departureISO).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      }),
      origin: returnFlights[0].origin,
      destination: returnFlights[0].destination,
      flights: returnFlights
    }
  } : null;

  return {
    roundTrips,
    roundTripDisplay,
    brandDetails: brandByIdMap,
    count: roundTrips.length,
    currency: data.$?.CurrencyType || 'INR'
  };
};

// ============ MULTI-CITY TRANSFORMATION ============

const transformMultiCityResponse = (data, passengerCount, expectedLegCount) => {
  const segments = safeArray(data['air:AirSegmentList']?.['air:AirSegment']);
  const pricePoints = safeArray(data['air:AirPricePointList']?.['air:AirPricePoint']);
  const fareInfos = safeArray(data['air:FareInfoList']?.['air:FareInfo']);
  const brands = safeArray(data['air:BrandList']?.['air:Brand']);
  const flightDetails = safeArray(data['air:FlightDetailsList']?.['air:FlightDetails']);

  // Build maps
  const segmentMap = {};
  segments.forEach(s => { if (s.$?.Key) segmentMap[s.$.Key] = s; });

  const fareInfoMap = {};
  fareInfos.forEach(f => { if (f.$?.Key) fareInfoMap[f.$.Key] = f; });

  const detailsMap = {};
  flightDetails.forEach(d => { if (d.$?.Key) detailsMap[d.$.Key] = d; });

  const brandMap = {};
  const brandByIdMap = {};
  brands.forEach(b => { 
    if (b.$?.Key) {
      brandMap[b.$.Key] = b;
      if (b.$.BrandID) brandByIdMap[b.$.BrandID] = b;
    }
  });

  const legsData = {};
  const combinations = [];

  pricePoints.forEach(pricePoint => {
    try {
      const pricingInfo = pricePoint['air:AirPricingInfo'];
      if (!pricingInfo) return;
      
      const fareInfoRef = pricingInfo['air:FareInfoRef'];
      const fareInfoKeys = safeArray(fareInfoRef).map(ref => ref.$?.Key).filter(Boolean);
      
      const flightOptions = pricingInfo['air:FlightOptionsList']?.['air:FlightOption'];
      const legCount = flightOptions ? (Array.isArray(flightOptions) ? flightOptions.length : 1) : 0;
      
      // Only process multi-city (3+ legs)
      if (legCount < 3) return;
      
      const combinationLegs = [];
      
      for (let legIndex = 0; legIndex < legCount; legIndex++) {
        const fareInfo = fareInfoMap[fareInfoKeys[legIndex]];
        if (!fareInfo) continue;
        
        let brandObj = null;
        if (fareInfo['air:Brand']) {
          const brandKey = fareInfo['air:Brand'].$?.Key;
          const brandId = fareInfo['air:Brand'].$?.BrandID;
          brandObj = brandMap[brandKey] || brandByIdMap[brandId];
        }
        
        const brand = extractBrandDetails(brandObj, fareInfo);
        const baggage = extractBaggage(fareInfo);
        
        const flightOption = Array.isArray(flightOptions) ? flightOptions[legIndex] : flightOptions;
        if (!flightOption) continue;
        
        const segmentsList = parseFlightSegments(flightOption, segmentMap, detailsMap);
        if (!segmentsList.length) continue;
        
        const legSegments = segmentsList[0];
        const firstSegment = legSegments[0];
        const lastSegment = legSegments[legSegments.length - 1];
        
        const legFlight = {
          id: `leg-${legIndex}-${firstSegment.carrier}-${firstSegment.flightNumber}-${firstSegment.departureTime}`,
          legIndex,
          airline: AIRLINE_NAMES[firstSegment.carrier] || firstSegment.carrier,
          airlineCode: firstSegment.carrier,
          flightNumber: `${firstSegment.carrier}-${firstSegment.flightNumber}`,
          flightNum: firstSegment.flightNumber,
          departureTime: firstSegment.departureTime,
          arrivalTime: lastSegment.arrivalTime,
          origin: firstSegment.origin,
          destination: lastSegment.destination,
          duration: lastSegment.duration,
          stops: legSegments.length - 1,
          segments: legSegments,
          layovers: calculateLayovers(legSegments),
          seatsAvailable: Math.min(...legSegments.map(s => s.seatsAvailable)),
          cabinClass: firstSegment.cabinClass,
          originTerminal: firstSegment.originTerminal,
          destinationTerminal: lastSegment.destinationTerminal,
          brand,
          baggage,
          fareBasis: fareInfo.$?.FareBasis,
          price: parsePrice(fareInfo.$?.Amount),
          formattedPrice: fareInfo.$?.Amount || '',
          taxes: extractTaxes(pricingInfo)
        };
        
        combinationLegs.push(legFlight);
        
        // Add to legs data for grouping
        if (!legsData[legIndex]) legsData[legIndex] = new Map();
        const legKey = `${firstSegment.carrier}-${firstSegment.flightNumber}-${firstSegment.departureTime}`;
        if (!legsData[legIndex].has(legKey)) {
          legsData[legIndex].set(legKey, legFlight);
        }
      }
      
      if (combinationLegs.length === legCount) {
        combinations.push({
          id: pricePoint.$?.Key || `mc-${combinations.length}-${Date.now()}`,
          totalPrice: parsePrice(pricePoint.$?.TotalPrice),
          formattedPrice: pricePoint.$?.TotalPrice || '',
          basePrice: parsePrice(pricePoint.$?.BasePrice),
          taxes: extractTaxes(pricingInfo),
          legs: combinationLegs,
          legCount
        });
      }
      
    } catch (err) {
      // Silently handle errors
    }
  });

  // Build legs array
  const legs = [];
  for (let i = 0; i < expectedLegCount; i++) {
    if (legsData[i]) {
      legs.push({
        legIndex: i,
        flights: Array.from(legsData[i].values()).sort((a, b) => 
          new Date(a.departureTime) - new Date(b.departureTime)
        )
      });
    } else {
      legs.push({ legIndex: i, flights: [] });
    }
  }

  // Sort combinations by price
  combinations.sort((a, b) => a.totalPrice - b.totalPrice);

  return {
    legs,
    combinations,
    brandDetails: brandByIdMap,
    count: combinations.length,
    currency: data.$?.CurrencyType || 'INR'
  };
};

// ============ REQUEST PREPARATION ============

const prepareSearchRequestBody = (searchData) => {
  const { legs, passengers } = searchData;
  
  if (!legs?.length) throw new Error('No flight legs provided');
  if (!passengers?.length) throw new Error('No passengers provided');
  
  const formattedPassengers = passengers.map(p => ({
    code: p.code,
    ...(p.age && { age: p.age })
  }));
  
  const formattedLegs = legs.map(leg => ({
    origin: extractAirportCode(leg.origin),
    destination: extractAirportCode(leg.destination),
    departureDate: formatDateForAPI(leg.departureDate)
  }));
  
  return {
    legs: formattedLegs,
    passengers: formattedPassengers
  };
};

// ============ LOGGING FUNCTION ============

const logResults = (tripType, data) => {
  console.log('\n==========================================');
  console.log(`📊 ${tripType.toUpperCase()} RESULTS`);
  console.log('==========================================');
  
  if (tripType === 'one-way') {
    data.flights.forEach((flight, idx) => {
      console.log(`\n🎫 FLIGHT ${idx + 1}: ${flight.airline} ${flight.flightNum}`);
      console.log(`   Route: ${flight.origin} → ${flight.destination}`);
      console.log(`   Departure: ${new Date(flight.departureTime).toLocaleString()}`);
      console.log(`   Fare Options: ${flight.fares.length}`);
      flight.fares.slice(0, 3).forEach((fare, fIdx) => {
        console.log(`     ${fIdx + 1}. ${fare.brand.name}: ₹${fare.totalPrice}`);
      });
      console.log(`   Lowest: ₹${flight.lowestPrice} | Highest: ₹${flight.highestPrice}`);
    });
    console.log(`\n📈 Total Flights: ${data.flights.length}`);
  } else if (tripType === 'round-trip') {
    data.roundTrips.forEach((rt, idx) => {
      console.log(`\n🎫 ROUND TRIP ${idx + 1}: ₹${rt.totalPrice}`);
      console.log(`   Outbound: ${rt.outbound.airline} ${rt.outbound.flightNumber}`);
      console.log(`   Return: ${rt.return.airline} ${rt.return.flightNumber}`);
    });
    console.log(`\n📈 Total Round Trips: ${data.roundTrips.length}`);
  }
  
  console.log('==========================================\n');
};

// ============ MAIN TRANSFORMATION FUNCTION ============

const transformTravelportResponse = (apiResponse, passengerCount, expectedLegCount = 1) => {
  try {
    const data = apiResponse.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:LowFareSearchRsp'];
    if (!data) {
      throw new Error('Invalid response structure');
    }

    // Determine trip type and transform accordingly
    if (expectedLegCount >= 3) {
      const result = transformMultiCityResponse(data, passengerCount, expectedLegCount);
      logResults('multi-city', result);
      return {
        success: true,
        type: 'multi-city',
        multiCity: result,
        brandDetails: result.brandDetails,
        count: result.count,
        currency: result.currency,
        passengerCount
      };
    } 
    else if (expectedLegCount === 2) {
      const result = transformRoundTripResponse(data, passengerCount);
      logResults('round-trip', result);
      return {
        success: true,
        type: 'round-trip',
        roundTrips: result.roundTrips,
        roundTripDisplay: result.roundTripDisplay,
        brandDetails: result.brandDetails,
        count: result.count,
        currency: result.currency,
        passengerCount
      };
    } 
    else {
      const result = transformOneWayResponse(data, passengerCount);
      logResults('one-way', result);
      return {
        success: true,
        type: 'one-way',
        flights: result.flights,
        brandDetails: result.brandDetails,
        count: result.count,
        currency: result.currency,
        passengerCount
      };
    }

  } catch (error) {
    console.error('❌ Transform error:', error);
    return {
      success: false,
      error: 'Failed to process flight data',
      type: 'unknown',
      flights: [],
      roundTrips: [],
      multiCity: { legs: [], combinations: [] }
    };
  }
};

// ============ MAIN SEARCH FUNCTION ============

export const searchFlights = async (searchData) => {
  console.log('=================================');
  console.log('🔍 FLIGHT SEARCH REQUEST');
  console.log('=================================');
  console.log('Search Data:', JSON.stringify(searchData, null, 2));

  try {
    if (!searchData.legs?.length) throw new Error('No flight legs provided');
    if (!searchData.passengers?.length) throw new Error('No passengers provided');

    const passengerCount = {
      ADT: searchData.passengers.filter(p => p.code === 'ADT').length,
      CNN: searchData.passengers.filter(p => p.code === 'CNN').length,
      INF: searchData.passengers.filter(p => p.code === 'INF').length
    };

    const requestBody = prepareSearchRequestBody(searchData);
    const apiUrl = `${BASE_URL}/flights/lowfare`;

    console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('📍 API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📨 Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const apiResponse = await response.json();
    console.log('✅ API Response received');

    const transformed = transformTravelportResponse(apiResponse, passengerCount, searchData.legs.length);

    if (!transformed.success) {
      throw new Error(transformed.error || 'Failed to process response');
    }

    console.log(`✅ Found ${transformed.count} total options`);
    console.log('=================================');

    return {
      success: true,
      ...transformed,
      searchId: `search-${Date.now()}`
    };

  } catch (error) {
    console.error('❌ Flight search error:', error);
    console.log('=================================');
    
    return {
      success: false,
      error: error.message,
      type: 'unknown',
      flights: [],
      roundTrips: [],
      multiCity: { legs: [], combinations: [] },
      count: 0
    };
  }
};

// ============ UTILITY FUNCTIONS ============

export const getFlightById = (flights, flightId) => {
  return flights.find(f => f.id === flightId) || null;
};

export const getRoundTripById = (roundTrips, roundTripId) => {
  return roundTrips.find(rt => rt.id === roundTripId) || null;
};

export const getMultiCityCombinationById = (combinations, combinationId) => {
  return combinations.find(c => c.id === combinationId) || null;
};

export const getFareById = (flight, fareId) => {
  return flight?.fares?.find(f => f.id === fareId) || null;
};

export default {
  searchFlights,
  getFlightById,
  getRoundTripById,
  getMultiCityCombinationById,
  getFareById
};