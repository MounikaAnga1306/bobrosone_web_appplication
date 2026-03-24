// src/modules/flights/services/flightSearchService.js

const BASE_URL = 'https://api.bobros.org';

const AIRLINE_NAMES = {
  '6E': 'IndiGo', 'AI': 'Air India', 'SG': 'SpiceJet', 'UK': 'Vistara',
  'G8': 'GoAir', 'I5': 'AirAsia India', '9W': 'Jet Airways', 'S2': 'Air India Express',
  'QP': 'Akasa Air', 'KU': 'Kuwait Airways', 'EK': 'Emirates', 'WY': 'Oman Air',
  'SV': 'Saudia', 'FZ': 'Flydubai', 'GF': 'Gulf Air', 'UL': 'SriLankan Airlines',
  'TK': 'Turkish Airlines', 'ET': 'Ethiopian Airlines', 'SQ': 'Singapore Airlines',
  'H1': 'Hahn Air', 'XY': 'Flynas'
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
    if (change['air:Amount']) penalties.change.amount = parsePrice(change['air:Amount']);
    if (change['air:Percentage']) penalties.change.percentage = change['air:Percentage'];
  }
  if (pricingInfo['air:CancelPenalty']) {
    const cancel = pricingInfo['air:CancelPenalty'];
    penalties.cancel.applies = cancel.$?.PenaltyApplies || null;
    penalties.cancel.noShow = cancel.$?.NoShow === 'true';
    if (cancel['air:Amount']) penalties.cancel.amount = parsePrice(cancel['air:Amount']);
    if (cancel['air:Percentage']) penalties.cancel.percentage = cancel['air:Percentage'];
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
        segmentKey: segment.$.Key,
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
        seatsAvailable: parseInt(bi.$?.BookingCount) || 9,
        hostTokenRef: bi.$?.HostTokenRef 
      };
    }).filter(Boolean);
  }).filter(segments => segments.length > 0);
};

// ============ BRAND EXTRACTION ============
const extractBrandDetails = (brand, fareInfo) => {
  if (!brand) {
    const fareBasis = fareInfo?.$?.FareBasis || '';
    return {
      id: null,
      name: inferBrandFromFareBasis(fareBasis),
      description: '',
      upsell: '',
      marketingText: '',
      features: [],
      titles: {},
      images: []
    };
  }

  let description = '';
  let upsell = '';
  let marketingText = '';
  let features = [];
  const titles = {};
  const images = [];

  const titleElements = brand['air:Title'];
  if (titleElements) {
    safeArray(titleElements).forEach(title => {
      if (title.$?.Type && title._) {
        titles[title.$.Type.toLowerCase()] = title._;
      }
    });
  }

  const texts = brand['air:Text'];
  if (texts) {
    safeArray(texts).forEach(text => {
      if (text.$?.Type === 'Upsell') {
        upsell = text._ || '';
      } else if (text.$?.Type === 'MarketingAgent') {
        marketingText = text._ || ''; 
        const lines = text._?.split('\n') || [];
        lines.forEach(line => {
          const cleanLine = line.replace(/[-•✓*]/g, '').trim();
          if (cleanLine && cleanLine.length > 5 && !cleanLine.includes('***') && !cleanLine.includes('Disclaimer')) {
            features.push(cleanLine);
          }
        });
      } else if (text.$?.Type === 'Strapline') {
        description = text._ || '';
      }
    });
  }

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
    marketingText,
    features: features.slice(0, 8),
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

  if (allowance['air:MaxWeight']?.$) {
    const maxWeight = allowance['air:MaxWeight'].$;
    result.weight = maxWeight.Value || '15';
    result.unit = maxWeight.Unit === 'Kilograms' ? 'kg' : maxWeight.Unit || 'kg';
  }

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

// ============ FARE OPTION EXTRACTION WITH TRACKING ============
let fareTrackingCounter = 0;

const extractFareOptions = (pricePoint, pricingInfo, fareInfoKeys, fareInfoMap, segmentMap, detailsMap, brandMap, brandByIdMap, hostTokenMap) => {
  const fareOptions = [];

  for (const fareKey of fareInfoKeys) {
    const fareInfo = fareInfoMap[fareKey];
    if (!fareInfo) continue;

    let brandObj = null;
    if (fareInfo['air:Brand']) {
      const brandKey = fareInfo['air:Brand'].$?.Key;
      const brandId = fareInfo['air:Brand'].$?.BrandID;
      brandObj = brandMap[brandKey] || brandByIdMap[brandId];
    }

    const brand = extractBrandDetails(brandObj, fareInfo);
    const baggage = extractBaggage(fareInfo);
    const fareRuleKey = fareInfo['air:FareRuleKey']?._ || null;

    const flightOptions = pricingInfo['air:FlightOptionsList']?.['air:FlightOption'];
    if (!flightOptions) continue;

    const segmentsList = parseFlightSegments(flightOptions, segmentMap, detailsMap);
    if (!segmentsList.length) continue;

    segmentsList.forEach((segments, idx) => {
      const firstSegment = segments[0];
      const trackingId = ++fareTrackingCounter;
      
      // Get hostToken info
      const hostTokenInfo = firstSegment.hostTokenRef ? hostTokenMap[firstSegment.hostTokenRef] : null;
      let hostTokenString = null;
      if (hostTokenInfo) {
        if (typeof hostTokenInfo === 'string') {
          hostTokenString = hostTokenInfo;
        } else if (typeof hostTokenInfo === 'object') {
          hostTokenString = hostTokenInfo.token || hostTokenInfo;
        }
      }

      // ============ ONLY LOG 6E FARE OPTIONS ============
      if (firstSegment.carrier === '6E') {
        console.log(`\n🔍 [FARE-${trackingId}] SEARCH RESPONSE - 6E Fare Option:`);
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log(`│ TRACKING ID:        ${trackingId}`);
        console.log(`│ SEGMENT KEY:        ${firstSegment.segmentKey}`);
        console.log(`│ BOOKING CODE:       ${firstSegment.bookingCode}`);
        console.log(`│ FARE BASIS:         ${fareInfo.$?.FareBasis}`);
        console.log(`│ HOST TOKEN REF:     ${firstSegment.hostTokenRef || 'N/A'}`);
        if (hostTokenString) {
          console.log(`│ HOST TOKEN:         ${hostTokenString}`);
        } else {
          console.log(`│ HOST TOKEN:         NOT FOUND`);
        }
        console.log('└─────────────────────────────────────────────────────────────┘');
      }

      // Extract specific meal if available
      let specificMeal = null;
      const optionalServices = fareInfo['air:OptionalServices']?.['air:OptionalService'];
      if (optionalServices) {
        const mealService = safeArray(optionalServices).find(s => 
          s.$?.Type === 'MealOrBeverage' && s.$?.Chargeable === 'Included in the brand'
        );
        if (mealService?.['common_v54_0:ServiceInfo']?.['common_v54_0:Description']) {
          specificMeal = mealService['common_v54_0:ServiceInfo']['common_v54_0:Description'];
        }
      }

      const taxes = extractTaxes(pricingInfo);
      const penalties = extractPenalties(pricingInfo);

      fareOptions.push({
        trackingId: trackingId,
        id: `${fareKey}-${idx}-${Date.now()}`,
        fareKey,
        bookingCode: firstSegment.bookingCode,
        price: parsePrice(fareInfo.$?.Amount),
        formattedPrice: fareInfo.$?.Amount || `₹0`,
        totalPrice: parsePrice(pricePoint.$?.TotalPrice),
        basePrice: parsePrice(pricePoint.$?.BasePrice),
        taxes,
        penalties,
        brand,
        baggage,
        fareBasis: fareInfo.$?.FareBasis,
        fareRuleKey,
        passengerType: fareInfo.$?.PassengerTypeCode || 'ADT',
        refundable: pricingInfo.$?.Refundable === 'true',
        eticketable: pricingInfo.$?.ETicketability === 'Yes',
        pricingMethod: pricingInfo.$?.PricingMethod,
        latestTicketingTime: pricingInfo.$?.LatestTicketingTime,
        segments,
        cabinClass: firstSegment.cabinClass,
        seatsAvailable: Math.min(...segments.map(s => s.seatsAvailable)),
        hostToken: hostTokenString,
        hostTokenRef: firstSegment.hostTokenRef,
        amenities: {
          meals: !!specificMeal,
          mealType: specificMeal,
          seatSelection: brand.name?.toLowerCase().includes('flex') ||
                         brand.name?.toLowerCase().includes('upfront') ||
                         brand.name?.toLowerCase().includes('xl') || false,
          changes: penalties.change.amount === 0 ||
                   penalties.change.percentage === '0.00' ||
                   brand.name?.toLowerCase().includes('flex') || false,
          priority: brand.name?.toLowerCase().includes('priority') ||
                    brand.name?.toLowerCase().includes('plus') ||
                    firstSegment.cabinClass === 'Business' || false
        },
        traceId: null
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
    const exists = flight.fares.some(f => f.fareKey === fare.fareKey);
    
    if (!exists) {
      flight.fares.push(fare);
      flight.lowestPrice = Math.min(flight.lowestPrice, fare.totalPrice);
      flight.highestPrice = Math.max(flight.highestPrice, fare.totalPrice);
    }
  });

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
const transformOneWayResponse = (data, passengerCount, traceId) => {
  const segments = safeArray(data['air:AirSegmentList']?.['air:AirSegment']);
  const pricePoints = safeArray(data['air:AirPricePointList']?.['air:AirPricePoint']);
  const fareInfos = safeArray(data['air:FareInfoList']?.['air:FareInfo']);
  const brands = safeArray(data['air:BrandList']?.['air:Brand']);
  const flightDetails = safeArray(data['air:FlightDetailsList']?.['air:FlightDetails']);
  const hostTokens = safeArray(data['air:HostTokenList']?.['common_v54_0:HostToken']);

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

  // Build hostToken map
  const hostTokenMap = {};
  hostTokens.forEach(ht => {
    if (ht.$?.Key && ht._) {
      hostTokenMap[ht.$.Key] = {
        token: ht._,
        ref: ht.$.Key
      };
    }
  });

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
      if (legCount === 2 && fareInfoKeys.length === 2) return;

      const fareOptions = extractFareOptions(
        pricePoint, pricingInfo, fareInfoKeys, fareInfoMap,
        segmentMap, detailsMap, brandMap, brandByIdMap, hostTokenMap
      );
      
      fareOptions.forEach(fare => {
        fare.traceId = traceId;
      });
      
      allFareOptions.push(...fareOptions);
    } catch (err) {
      console.error('Error processing one-way fare:', err);
    }
  });

  const flights = groupFlightsByKey(allFareOptions);
  
  flights.forEach(flight => {
    flight.traceId = traceId;
    flight.fares.forEach(fare => {
      fare.traceId = traceId;
    });
  });
  
  flights.sort((a, b) => a.lowestPrice - b.lowestPrice);

  return {
    flights,
    brandDetails: brandByIdMap,
    count: flights.length,
    currency: data.$?.CurrencyType || 'INR',
    traceId
  };
};

// ============ ROUND TRIP TRANSFORMATION ============
const transformRoundTripResponse = (data, passengerCount, traceId) => {
  const segments = safeArray(data['air:AirSegmentList']?.['air:AirSegment']);
  const pricePoints = safeArray(data['air:AirPricePointList']?.['air:AirPricePoint']);
  const fareInfos = safeArray(data['air:FareInfoList']?.['air:FareInfo']);
  const brands = safeArray(data['air:BrandList']?.['air:Brand']);
  const flightDetails = safeArray(data['air:FlightDetailsList']?.['air:FlightDetails']);
  const hostTokens = safeArray(data['air:HostTokenList']?.['common_v54_0:HostToken']);

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

  const hostTokenMap = {};
  hostTokens.forEach(ht => {
    if (ht.$?.Key && ht._) {
      hostTokenMap[ht.$.Key] = ht._;
    }
  });

  const roundTrips = [];
  const processedCombinations = new Set();

  pricePoints.forEach(pricePoint => {
    try {
      const pricingInfo = pricePoint['air:AirPricingInfo'];
      if (!pricingInfo) return;
      
      const fareInfoRef = pricingInfo['air:FareInfoRef'];
      const fareInfoKeys = safeArray(fareInfoRef).map(ref => ref.$?.Key).filter(Boolean);
      if (fareInfoKeys.length !== 2) return;

      const flightOptions = pricingInfo['air:FlightOptionsList']?.['air:FlightOption'];
      if (!flightOptions || !Array.isArray(flightOptions) || flightOptions.length !== 2) return;

      const combinationKey = `${fareInfoKeys[0]}-${fareInfoKeys[1]}`;
      if (processedCombinations.has(combinationKey)) return;
      processedCombinations.add(combinationKey);

      const outboundFareInfo = fareInfoMap[fareInfoKeys[0]];
      let outboundBrandObj = null;
      if (outboundFareInfo?.['air:Brand']) {
        const brandKey = outboundFareInfo['air:Brand'].$?.Key;
        const brandId = outboundFareInfo['air:Brand'].$?.BrandID;
        outboundBrandObj = brandMap[brandKey] || brandByIdMap[brandId];
      }
      const outboundBrand = extractBrandDetails(outboundBrandObj, outboundFareInfo);
      const outboundBaggage = extractBaggage(outboundFareInfo);
      const outboundFareRuleKey = outboundFareInfo['air:FareRuleKey']?._ || null;

      const returnFareInfo = fareInfoMap[fareInfoKeys[1]];
      let returnBrandObj = null;
      if (returnFareInfo?.['air:Brand']) {
        const brandKey = returnFareInfo['air:Brand'].$?.Key;
        const brandId = returnFareInfo['air:Brand'].$?.BrandID;
        returnBrandObj = brandMap[brandKey] || brandByIdMap[brandId];
      }
      const returnBrand = extractBrandDetails(returnBrandObj, returnFareInfo);
      const returnBaggage = extractBaggage(returnFareInfo);
      const returnFareRuleKey = returnFareInfo['air:FareRuleKey']?._ || null;

      const outboundOption = flightOptions[0];
      const returnOption = flightOptions[1];
      
      const outboundSegmentsList = parseFlightSegments(outboundOption, segmentMap, detailsMap);
      const returnSegmentsList = parseFlightSegments(returnOption, segmentMap, detailsMap);

      if (!outboundSegmentsList.length || !returnSegmentsList.length) return;

      const outboundDefault = outboundSegmentsList[0];
      const returnDefault = returnSegmentsList[0];
      
      const outboundFirst = outboundDefault[0];
      const returnFirst = returnDefault[0];

      const outboundHostToken = outboundFirst.hostTokenRef ? hostTokenMap[outboundFirst.hostTokenRef] : null;
      const returnHostToken = returnFirst.hostTokenRef ? hostTokenMap[returnFirst.hostTokenRef] : null;

      let outboundMeal = null;
      let returnMeal = null;
      
      if (outboundFareInfo['air:OptionalServices']?.['air:OptionalService']) {
        const svc = safeArray(outboundFareInfo['air:OptionalServices']['air:OptionalService']).find(s => 
          s.$?.Type === 'MealOrBeverage' && s.$?.Chargeable === 'Included in the brand'
        );
        if (svc?.['common_v54_0:ServiceInfo']?.['common_v54_0:Description']) {
          outboundMeal = svc['common_v54_0:ServiceInfo']['common_v54_0:Description'];
        }
      }

      if (returnFareInfo['air:OptionalServices']?.['air:OptionalService']) {
        const svc = safeArray(returnFareInfo['air:OptionalServices']['air:OptionalService']).find(s => 
          s.$?.Type === 'MealOrBeverage' && s.$?.Chargeable === 'Included in the brand'
        );
        if (svc?.['common_v54_0:ServiceInfo']?.['common_v54_0:Description']) {
          returnMeal = svc['common_v54_0:ServiceInfo']['common_v54_0:Description'];
        }
      }

      const taxes = extractTaxes(pricingInfo);
      const penalties = extractPenalties(pricingInfo);
      const roundTripId = `rt-${pricePoint.$?.Key}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      const outboundAmenities = {
        meals: !!outboundMeal,
        mealType: outboundMeal,
        seatSelection: outboundBrand.name?.toLowerCase().includes('flex') ||
                       outboundBrand.name?.toLowerCase().includes('upfront') ||
                       outboundBrand.name?.toLowerCase().includes('xl') || false,
        changes: penalties.change.amount === 0 ||
                 penalties.change.percentage === '0.00' ||
                 outboundBrand.name?.toLowerCase().includes('flex') || false,
        priority: outboundBrand.name?.toLowerCase().includes('priority') ||
                  outboundBrand.name?.toLowerCase().includes('plus') ||
                  outboundFirst.cabinClass === 'Business' || false
      };

      const returnAmenities = {
        meals: !!returnMeal,
        mealType: returnMeal,
        seatSelection: returnBrand.name?.toLowerCase().includes('flex') ||
                       returnBrand.name?.toLowerCase().includes('upfront') ||
                       returnBrand.name?.toLowerCase().includes('xl') || false,
        changes: penalties.change.amount === 0 ||
                 penalties.change.percentage === '0.00' ||
                 returnBrand.name?.toLowerCase().includes('flex') || false,
        priority: returnBrand.name?.toLowerCase().includes('priority') ||
                  returnBrand.name?.toLowerCase().includes('plus') ||
                  returnFirst.cabinClass === 'Business' || false
      };

      const roundTrip = {
        id: roundTripId,
        traceId,
        totalPrice: parsePrice(pricePoint.$?.TotalPrice),
        formattedPrice: pricePoint.$?.TotalPrice || '',
        basePrice: parsePrice(pricePoint.$?.BasePrice),
        taxes,
        penalties,
        outbound: {
          id: `out-${roundTripId}`,
          airline: AIRLINE_NAMES[outboundFirst.carrier] || outboundFirst.carrier,
          airlineCode: outboundFirst.carrier,
          flightOptions: outboundSegmentsList.map(segments => {
            const first = segments[0];
            const last = segments[segments.length - 1];
            return {
              id: `out-opt-${first.carrier}-${first.flightNumber}-${first.departureTime}`,
              flightNumber: `${first.carrier}-${first.flightNumber}`,
              flightNumbers: segments.map(s => s.flightNumber),
              departureTime: first.departureTime,
              arrivalTime: last.arrivalTime,
              origin: first.origin,
              destination: last.destination,
              duration: last.duration,
              stops: segments.length - 1,
              segments: segments,
              layovers: calculateLayovers(segments),
              seatsAvailable: Math.min(...segments.map(s => s.seatsAvailable)),
              originTerminal: first.originTerminal,
              destinationTerminal: last.destinationTerminal
            };
          }),
          defaultFlight: {
            flightNumber: `${outboundFirst.carrier}-${outboundFirst.flightNumber}`,
            flightNumbers: outboundDefault.map(s => s.flightNumber),
            departureTime: outboundFirst.departureTime,
            arrivalTime: outboundDefault[outboundDefault.length - 1].arrivalTime,
            origin: outboundFirst.origin,
            destination: outboundDefault[outboundDefault.length - 1].destination,
            duration: outboundDefault[outboundDefault.length - 1].duration,
            stops: outboundDefault.length - 1,
            segments: outboundDefault,
            layovers: calculateLayovers(outboundDefault),
            seatsAvailable: Math.min(...outboundDefault.map(s => s.seatsAvailable)),
            originTerminal: outboundFirst.originTerminal,
            destinationTerminal: outboundDefault[outboundDefault.length - 1].destinationTerminal
          },
          cabinClass: outboundFirst.cabinClass,
          brand: outboundBrand,
          baggage: outboundBaggage,
          fareBasis: outboundFareInfo?.$?.FareBasis,
          fareRuleKey: outboundFareRuleKey,
          refundable: pricingInfo.$?.Refundable === 'true',
          hostToken: outboundHostToken,
          amenities: outboundAmenities
        },
        return: {
          id: `ret-${roundTripId}`,
          airline: AIRLINE_NAMES[returnFirst.carrier] || returnFirst.carrier,
          airlineCode: returnFirst.carrier,
          flightOptions: returnSegmentsList.map(segments => {
            const first = segments[0];
            const last = segments[segments.length - 1];
            return {
              id: `ret-opt-${first.carrier}-${first.flightNumber}-${first.departureTime}`,
              flightNumber: `${first.carrier}-${first.flightNumber}`,
              flightNumbers: segments.map(s => s.flightNumber),
              departureTime: first.departureTime,
              arrivalTime: last.arrivalTime,
              origin: first.origin,
              destination: last.destination,
              duration: last.duration,
              stops: segments.length - 1,
              segments: segments,
              layovers: calculateLayovers(segments),
              seatsAvailable: Math.min(...segments.map(s => s.seatsAvailable)),
              originTerminal: first.originTerminal,
              destinationTerminal: last.destinationTerminal
            };
          }),
          defaultFlight: {
            flightNumber: `${returnFirst.carrier}-${returnFirst.flightNumber}`,
            flightNumbers: returnDefault.map(s => s.flightNumber),
            departureTime: returnFirst.departureTime,
            arrivalTime: returnDefault[returnDefault.length - 1].arrivalTime,
            origin: returnFirst.origin,
            destination: returnDefault[returnDefault.length - 1].destination,
            duration: returnDefault[returnDefault.length - 1].duration,
            stops: returnDefault.length - 1,
            segments: returnDefault,
            layovers: calculateLayovers(returnDefault),
            seatsAvailable: Math.min(...returnDefault.map(s => s.seatsAvailable)),
            originTerminal: returnFirst.originTerminal,
            destinationTerminal: returnDefault[returnDefault.length - 1].destinationTerminal
          },
          cabinClass: returnFirst.cabinClass,
          brand: returnBrand,
          baggage: returnBaggage,
          fareBasis: returnFareInfo?.$?.FareBasis,
          fareRuleKey: returnFareRuleKey,
          refundable: pricingInfo.$?.Refundable === 'true',
          hostToken: returnHostToken,
          amenities: returnAmenities
        },
        amenities: {
          meals: !!(outboundMeal || returnMeal),
          outboundMealType: outboundMeal || null,
          returnMealType: returnMeal || null,
          seatSelection: outboundAmenities.seatSelection || returnAmenities.seatSelection,
          changes: outboundAmenities.changes || returnAmenities.changes,
          priority: outboundAmenities.priority || returnAmenities.priority
        }
      };
      roundTrips.push(roundTrip);
    } catch (err) {
      console.error('Error processing round trip:', err);
    }
  });

  roundTrips.sort((a, b) => a.totalPrice - b.totalPrice);

  return {
    roundTrips: roundTrips,
    roundTripDisplay: roundTrips.length > 0 ? {
      outbound: {
        date: new Date(roundTrips[0].outbound.defaultFlight.departureTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        origin: roundTrips[0].outbound.defaultFlight.origin,
        destination: roundTrips[0].outbound.defaultFlight.destination,
        flights: roundTrips.map(rt => ({
          ...rt.outbound.defaultFlight,
          price: rt.totalPrice,
          brand: rt.outbound.brand,
          mealType: rt.outbound.amenities?.mealType || null 
        }))
      },
      return: {
        date: new Date(roundTrips[0].return.defaultFlight.departureTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        origin: roundTrips[0].return.defaultFlight.origin,
        destination: roundTrips[0].return.defaultFlight.destination,
        flights: roundTrips.map(rt => ({
          ...rt.return.defaultFlight,
          price: rt.totalPrice,
          brand: rt.return.brand,
          mealType: rt.return.amenities?.mealType || null
        }))
      }
    } : null,
    brandDetails: brandByIdMap,
    count: roundTrips.length,
    currency: data.$?.CurrencyType || 'INR',
    traceId
  };
};

// ============ MULTI-CITY TRANSFORMATION ============
const transformMultiCityResponse = (data, passengerCount, expectedLegCount, traceId) => {
  const segments = safeArray(data['air:AirSegmentList']?.['air:AirSegment']);
  const pricePoints = safeArray(data['air:AirPricePointList']?.['air:AirPricePoint']);
  const fareInfos = safeArray(data['air:FareInfoList']?.['air:FareInfo']);
  const brands = safeArray(data['air:BrandList']?.['air:Brand']);
  const flightDetails = safeArray(data['air:FlightDetailsList']?.['air:FlightDetails']);
  const hostTokens = safeArray(data['air:HostTokenList']?.['common_v54_0:HostToken']);

  const segmentMap = {};
  segments.forEach(s => { if (s.$?.Key) segmentMap[s.$.Key] = s; });
  const fareInfoMap = {};
  fareInfos.forEach(f => { if (f.$?.Key) fareInfoMap[f.$.Key] = f; });
  const detailsMap = {};
  flightDetails.forEach(d => { if (d.$?.Key) detailsMap[d.$.Key] = d; });
  const brandMap = {};
  const brandByIdMap = {};
  brands.forEach(b => {
    if (b.$?.Key) { brandMap[b.$.Key] = b; if (b.$.BrandID) brandByIdMap[b.$.BrandID] = b; }
  });
  const hostTokenMap = {};
  hostTokens.forEach(ht => { if (ht.$?.Key && ht._) hostTokenMap[ht.$.Key] = ht._; });

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
        const fareRuleKey = fareInfo['air:FareRuleKey']?._ || null;

        const flightOption = Array.isArray(flightOptions) ? flightOptions[legIndex] : flightOptions;
        if (!flightOption) continue;
        const segmentsList = parseFlightSegments(flightOption, segmentMap, detailsMap);
        if (!segmentsList.length) continue;

        const legSegments = segmentsList[0];
        const firstSegment = legSegments[0];
        const hostToken = firstSegment.hostTokenRef ? hostTokenMap[firstSegment.hostTokenRef] : null;

        const legFlight = {
          id: `leg-${legIndex}-${firstSegment.carrier}-${firstSegment.flightNumber}-${firstSegment.departureTime}`,
          traceId,
          legIndex,
          airline: AIRLINE_NAMES[firstSegment.carrier] || firstSegment.carrier,
          airlineCode: firstSegment.carrier,
          flightNumber: `${firstSegment.carrier}-${firstSegment.flightNumber}`,
          flightNum: firstSegment.flightNumber,
          departureTime: firstSegment.departureTime,
          arrivalTime: legSegments[legSegments.length - 1].arrivalTime,
          origin: firstSegment.origin,
          destination: legSegments[legSegments.length - 1].destination,
          duration: legSegments[legSegments.length - 1].duration,
          stops: legSegments.length - 1,
          segments: legSegments,
          layovers: calculateLayovers(legSegments),
          seatsAvailable: Math.min(...legSegments.map(s => s.seatsAvailable)),
          cabinClass: firstSegment.cabinClass,
          originTerminal: firstSegment.originTerminal,
          destinationTerminal: legSegments[legSegments.length - 1].destinationTerminal,
          brand,
          baggage,
          fareBasis: fareInfo.$?.FareBasis,
          fareRuleKey,
          price: parsePrice(fareInfo.$?.Amount),
          formattedPrice: fareInfo.$?.Amount || '',
          taxes: extractTaxes(pricingInfo),
          hostToken
        };
        combinationLegs.push(legFlight);

        if (!legsData[legIndex]) legsData[legIndex] = new Map();
        const legKey = `${firstSegment.carrier}-${firstSegment.flightNumber}-${firstSegment.departureTime}`;
        if (!legsData[legIndex].has(legKey)) {
          legsData[legIndex].set(legKey, legFlight);
        }
      }
      if (combinationLegs.length === legCount) {
        combinations.push({
          id: pricePoint.$?.Key || `mc-${combinations.length}-${Date.now()}`,
          traceId,
          totalPrice: parsePrice(pricePoint.$?.TotalPrice),
          formattedPrice: pricePoint.$?.TotalPrice || '',
          basePrice: parsePrice(pricePoint.$?.BasePrice),
          taxes: extractTaxes(pricingInfo),
          legs: combinationLegs,
          legCount
        });
      }
    } catch (err) { /* Silent fail */ }
  });

  const legs = [];
  for (let i = 0; i < expectedLegCount; i++) {
    if (legsData[i]) {
      legs.push({ legIndex: i, flights: Array.from(legsData[i].values()).sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime)) });
    } else {
      legs.push({ legIndex: i, flights: [] });
    }
  }
  combinations.sort((a, b) => a.totalPrice - b.totalPrice);

  return { 
    legs, 
    combinations, 
    brandDetails: brandByIdMap, 
    count: combinations.length, 
    currency: data.$?.CurrencyType || 'INR',
    traceId
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

  return { legs: formattedLegs, passengers: formattedPassengers };
};

// ============ MAIN TRANSFORMATION FUNCTION ============
const transformTravelportResponse = (apiResponse, passengerCount, expectedLegCount = 1) => {
  try {
    const data = apiResponse.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:LowFareSearchRsp'];
    if (!data) throw new Error('Invalid response structure');

    const traceId = data.$?.TraceId || apiResponse.traceId || `GEN-${Date.now()}`;

    if (expectedLegCount >= 3) {
      const result = transformMultiCityResponse(data, passengerCount, expectedLegCount, traceId);
      return { success: true, type: 'multi-city', multiCity: result, brandDetails: result.brandDetails, count: result.count, currency: result.currency, passengerCount, traceId };
    } else if (expectedLegCount === 2) {
      const result = transformRoundTripResponse(data, passengerCount, traceId);
      return { success: true, type: 'round-trip', roundTrips: result.roundTrips, roundTripDisplay: result.roundTripDisplay, brandDetails: result.brandDetails, count: result.count, currency: result.currency, passengerCount, traceId };
    } else {
      const result = transformOneWayResponse(data, passengerCount, traceId);
      return { success: true, type: 'one-way', flights: result.flights, brandDetails: result.brandDetails, count: result.count, currency: result.currency, passengerCount, traceId };
    }
  } catch (error) {
    console.error('❌ Transform error:', error);
    return { success: false, error: 'Failed to process flight data', type: 'unknown', flights: [], roundTrips: [], multiCity: { legs: [], combinations: [] }, traceId: null };
  }
};

// ============ MAIN SEARCH FUNCTION ============
export const searchFlights = async (searchData) => {
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

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status}`);
    }

    const apiResponse = await response.json();
    const transformed = transformTravelportResponse(apiResponse, passengerCount, searchData.legs.length);
    if (!transformed.success) throw new Error(transformed.error || 'Failed to process response');

    return { success: true, ...transformed, searchId: `search-${Date.now()}`, traceId: transformed.traceId };
  } catch (error) {
    return { success: false, error: error.message, type: 'unknown', flights: [], roundTrips: [], multiCity: { legs: [], combinations: [] }, count: 0, traceId: null };
  }
};

// ============ UTILITY FUNCTIONS ============
export const getFlightById = (flights, flightId) => flights.find(f => f.id === flightId) || null;
export const getRoundTripById = (roundTrips, roundTripId) => roundTrips.find(rt => rt.id === roundTripId) || null;
export const getMultiCityCombinationById = (combinations, combinationId) => combinations.find(c => c.id === combinationId) || null;
export const getFareById = (flight, fareId) => flight?.fares?.find(f => f.id === fareId) || null;

export default {
  searchFlights,
  getFlightById,
  getRoundTripById,
  getMultiCityCombinationById,
  getFareById
};