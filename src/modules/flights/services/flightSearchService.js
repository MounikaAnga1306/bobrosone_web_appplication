const BASE_URL = 'https://api.bobros.org';
const AIRLINE_NAMES = {
  'AI': 'Air India',
  '6E': 'IndiGo',
  'SG': 'SpiceJet',
  'UK': 'Vistara',
  'I5': 'AirAsia',
  'G8': 'GoAir',
  '9W': 'Jet Airways',
  'H1': 'Hahn Air',
  'AA': 'American Airlines',
  'BA': 'British Airways',
  'LH': 'Lufthansa',
  'EK': 'Emirates',
  'QR': 'Qatar Airways',
  'SQ': 'Singapore Airlines'
};

// ----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Safely convert array-like objects to arrays
 */
const safeArray = (item) => {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
};

/**
 * Parse price string to number (e.g., "INR5270.00" → 5270)
 */
const parsePrice = (priceString) => {
  if (!priceString) return 0;
  if (typeof priceString === 'number') return priceString;
  const match = priceString.toString().match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
};

/**
 * Parse duration string to minutes (e.g., "P0DT2H15M0S" → 135)
 */
const parseDuration = (durationStr) => {
  if (!durationStr) return 0;
  if (/^\d+$/.test(durationStr)) return parseInt(durationStr);
  const hours = parseInt(durationStr.match(/(\d+)H/)?.[1] || '0');
  const minutes = parseInt(durationStr.match(/(\d+)M/)?.[1] || '0');
  return hours * 60 + minutes;
};

/**
 * Extract taxes from pricing info
 */
const extractTaxes = (pricingInfo) => {
  const taxInfo = safeArray(pricingInfo?.['air:TaxInfo']);
  return {
    total: taxInfo.reduce((sum, tax) => sum + parsePrice(tax?.$?.Amount), 0),
    breakdown: taxInfo.map(tax => ({
      category: tax?.$?.Category,
      code: tax?.$?.Category,
      amount: parsePrice(tax?.$?.Amount),
      description: tax?.$?.Category || 'Tax',
      supplierCode: tax?.$?.SupplierCode,
      key: tax?.$?.Key
    }))
  };
};

/**
 * Extract change/cancel penalties from pricing info
 */
const extractPenalties = (pricingInfo) => {
  if (!pricingInfo) {
    return {
      change: { applies: 'Unknown', amount: 0, percentage: '0.00', noShow: false },
      cancel: { applies: 'Unknown', amount: 0, percentage: '0.00', noShow: false }
    };
  }
  
  const changePenalty = pricingInfo['air:ChangePenalty'];
  const cancelPenalty = pricingInfo['air:CancelPenalty'];
  
  return {
    change: {
      applies: changePenalty?.$?.PenaltyApplies || 'Unknown',
      amount: parseFloat(changePenalty?.['air:Amount']?._ || 0),
      percentage: changePenalty?.['air:Percentage']?._ || '0.00',
      noShow: changePenalty?.$?.NoShow === 'true'
    },
    cancel: {
      applies: cancelPenalty?.$?.PenaltyApplies || 'Unknown',
      amount: parseFloat(cancelPenalty?.['air:Amount']?._ || 0),
      percentage: cancelPenalty?.['air:Percentage']?._ || '0.00',
      noShow: cancelPenalty?.$?.NoShow === 'true'
    }
  };
};

/**
 * Extract baggage allowance from fare info
 */
const extractBaggage = (fareInfo) => {
  const allowance = fareInfo?.['air:BaggageAllowance'];
  if (!allowance) return { checked: { weight_kg: 7, pieces: 1 }, carryon: { weight_kg: 7, pieces: 1 } };
  
  return {
    checked: allowance['air:MaxWeight'] ? {
      weight_kg: parseInt(allowance['air:MaxWeight']?.$?.Value || 0),
      unit: allowance['air:MaxWeight']?.$?.Unit || 'Kilograms',
      pieces: null
    } : allowance['air:NumberOfPieces'] ? {
      weight_kg: null,
      unit: null,
      pieces: parseInt(allowance['air:NumberOfPieces'] || 0)
    } : { weight_kg: 7, pieces: 1 },
    carryon: allowance['air:CarryOn'] ? {
      weight_kg: parseInt(allowance['air:CarryOn']?.$?.Value || 7),
      pieces: 1
    } : { weight_kg: 7, pieces: 1 }
  };
};

/**
 * Extract passenger types from pricing info
 */
const extractPassengerTypes = (pricingInfo) => {
  const passengerTypes = safeArray(pricingInfo?.['air:PassengerType']);
  return passengerTypes.map(pt => ({
    code: pt.$?.Code || 'ADT',
    age: pt.$?.Age || null,
    count: 1
  }));
};

/**
 * Extract fees by type (for infant charges)
 */
const extractFeesByType = (pricingInfo) => {
  const fees = safeArray(pricingInfo?.['air:FeeInfo']);
  return fees.map(fee => ({
    code: fee.$?.Code,
    amount: parsePrice(fee.$?.Amount),
    type: fee.$?.Type,
    supplierCode: fee.$?.SupplierCode,
    key: fee.$?.Key
  }));
};

/**
 * Extract amenities from fare info and brand
 */
const extractAmenities = (fareInfo, brand, penalties) => {
  let specificMeal = null;
  
  const optionalServices = fareInfo?.['air:OptionalServices']?.['air:OptionalService'];
  if (optionalServices) {
    const mealService = safeArray(optionalServices).find(s =>
      s.$?.Type === 'MealOrBeverage' && s.$?.Chargeable === 'Included in the brand'
    );
    if (mealService?.['common_v54_0:ServiceInfo']?.['common_v54_0:Description']) {
      specificMeal = mealService['common_v54_0:ServiceInfo']['common_v54_0:Description'];
    }
  }
  
  const brandName = brand?.name?.toLowerCase() || '';
  
  return {
    meals: !!specificMeal,
    mealType: specificMeal,
    seatSelection: brandName.includes('flex') || 
                   brandName.includes('upfront') || 
                   brandName.includes('stretch') || 
                   brandName.includes('xl') || false,
    changes: penalties?.change?.amount === 0 || 
             penalties?.change?.percentage === '0.00' || 
             brandName.includes('flex') || false,
    priority: brandName.includes('priority') || 
              brandName.includes('plus') || 
              brandName.includes('stretch') || false
  };
};

/**
 * Build host token map for quick lookup
 */
const buildHostTokenMap = (hostTokens) => {
  const tokenMap = {};
  safeArray(hostTokens).forEach(token => {
    if (token?.$?.Key) {
      tokenMap[token.$?.Key] = {
        key: token.$?.Key,
        token: token._ || '',
        provider: token.$?.ProviderCode || '1G'
      };
    }
  });
  return tokenMap;
};

/**
 * Build brand map for quick lookup
 */
const buildBrandMap = (brandList) => {
  const brandMap = {};
  const brandByIdMap = {};
  const brandOriginalMap = {};
  
  safeArray(brandList).forEach(brand => {
    if (brand?.$?.Key) {
      const brandId = brand.$?.BrandID;
      const brandKey = brand.$?.Key;
      
      const simplifiedBrand = {
        id: brandId,
        name: brand.$?.Name,
        tier: brand.$?.BrandTier,
        carrier: brand.$?.Carrier,
        details: brand.$?.BrandedDetailsAvailable === 'true'
      };
      
      brandMap[brandKey] = simplifiedBrand;
      if (brandId) brandByIdMap[brandId] = simplifiedBrand;
      brandOriginalMap[brandKey] = brand;
      if (brandId) brandOriginalMap[brandId] = brand;
    }
  });
  
  return { brandMap, brandByIdMap, brandOriginalMap };
};

/**
 * Build flight details map for quick lookup
 */
const buildFlightDetailsMap = (flightDetailsList) => {
  const detailsMap = {};
  safeArray(flightDetailsList).forEach(details => {
    if (details?.$?.Key) {
      detailsMap[details.$?.Key] = {
        origin: details.$?.Origin,
        destination: details.$?.Destination,
        departureTime: details.$?.DepartureTime,
        arrivalTime: details.$?.ArrivalTime,
        flightTime: details.$?.FlightTime,
        equipment: details.$?.Equipment,
        originTerminal: details.$?.OriginTerminal || details?.OriginTerminal,
        destinationTerminal: details.$?.DestinationTerminal || details?.DestinationTerminal
      };
    }
  });
  return detailsMap;
};

/**
 * Calculate layovers between segments
 */
const calculateLayovers = (segments) => {
  const layovers = [];
  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    const next = segments[i + 1];
    if (current && next && current.arrivalTime && next.departureTime) {
      const arrival = new Date(current.arrivalTime).getTime();
      const departure = new Date(next.departureTime).getTime();
      const duration = departure - arrival;
      if (duration > 0) {
        layovers.push({
          airport: current.destination,
          duration: Math.floor(duration / 60000),
          durationFormatted: formatDuration(duration)
        });
      }
    }
  }
  return layovers;
};

/**
 * Format duration in hours and minutes
 */
const formatDuration = (ms) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Parse flight segments with terminal fallbacks
 * Structure: FlightOption → air:Option → air:BookingInfo → SegmentRef
 */
const parseFlightSegments = (flightOptions, segmentMap, detailsMap, hostTokenMap = {}) => {
  const optionsList = safeArray(flightOptions);
  const segmentsList = [];
  
  optionsList.forEach(flightOption => {
    const optionItems = flightOption?.['air:Option'];
    if (!optionItems) return;
    
    const optionArray = safeArray(optionItems);
    
    optionArray.forEach(option => {
      const bookingInfos = safeArray(option?.['air:BookingInfo']);
      if (!bookingInfos.length) return;
      
      const segments = bookingInfos.map(bi => {
        const segmentRef = bi.$?.SegmentRef;
        const segment = segmentMap[segmentRef];
        if (!segment || !segment.$) return null;
        
        const flightDetails = detailsMap[segment?.['air:FlightDetailsRef']?.$?.Key];
        const hostTokenRef = bi.$?.HostTokenRef;  // ← CRITICAL: Get the reference key
        
        let operatingCarrier = segment.$?.Carrier;
        let operatingFlightNumber = segment.$?.FlightNumber;
        
        const codeshareInfo = segment['air:CodeshareInfo'];
        if (codeshareInfo && codeshareInfo.$?.OperatingCarrier) {
          operatingCarrier = codeshareInfo.$?.OperatingCarrier;
          operatingFlightNumber = codeshareInfo.$?.OperatingFlightNumber;
        }
        
        return {
          segmentKey: segment.$?.Key,  // ← CRITICAL: Keep the segmentKey
          group: segment.$?.Group,
          carrier: segment.$?.Carrier,
          operatingCarrier: operatingCarrier,
          flightNumber: operatingFlightNumber,
          marketingFlightNumber: segment.$?.FlightNumber,
          origin: segment.$?.Origin,
          destination: segment.$?.Destination,
          departureTime: segment.$?.DepartureTime,
          arrivalTime: segment.$?.ArrivalTime,
          duration: parseDuration(segment.$?.FlightTime),
          equipment: segment.$?.Equipment || flightDetails?.equipment || null,
          bookingCode: bi.$?.BookingCode,
          cabinClass: bi.$?.CabinClass || 'Economy',
          seatsAvailable: parseInt(bi.$?.BookingCount) || 9,
          hostTokenRef: hostTokenRef,  // ← CRITICAL: Store the reference key
          hostToken: hostTokenMap[hostTokenRef] || null,  // ← CRITICAL: Store the actual token
          supplierCode: segment.$?.SupplierCode
        };
      }).filter(Boolean);
      
      if (segments.length > 0) {
        segmentsList.push(segments);
      }
    });
  });
  
  return segmentsList;
};

/**
 * Extract brand details with full information
 */
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
  
  const textElements = brand['air:Text'];
  if (textElements) {
    safeArray(textElements).forEach(text => {
      if (text._ && text.$) {
        const cleanLine = text._.replace(/\s+/g, ' ').trim();
        if (text.$?.Type === 'Upsell' && cleanLine.length > 5 && 
            !cleanLine.includes('***') && !cleanLine.includes('Disclaimer')) {
          features.push(cleanLine);
        } else if (text.$?.Type === 'MarketingAgent') {
          marketingText = cleanLine;
        }
      }
      if (text.$?.Type === 'Strapline') {
        description = text._ || '';
      }
    });
  }
  
  const titleElements = brand['air:Title'];
  if (titleElements) {
    safeArray(titleElements).forEach(title => {
      if (title._ && title.$) {
        titles[title.$?.Type?.toLowerCase() || 'unknown'] = title._;
      }
    });
  }
  
  const imageElements = brand['air:ImageLocation'];
  if (imageElements) {
    safeArray(imageElements).forEach(img => {
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
    tier: brand.$?.BrandTier,
    carrier: brand.$?.Carrier,
    description,
    upsell,
    marketingText,
    features,
    titles,
    images,
    brandedDetailsAvailable: brand.$?.BrandedDetailsAvailable === 'true'
  };
};

/**
 * Infer brand name from fare basis code
 */
const inferBrandFromFareBasis = (fareBasis) => {
  if (!fareBasis) return 'Economy';
  const basis = fareBasis.toUpperCase();
  if (basis.includes('FLEX') || basis.includes('FLX')) return 'Flexi';
  if (basis.includes('BUS') || basis.includes('C')) return 'Business';
  if (basis.includes('PREM') || basis.includes('W')) return 'Premium Economy';
  if (basis.includes('ECO') || basis.includes('Y')) return 'Economy';
  if (basis.includes('SAVER') || basis.includes('L') || basis.includes('T')) return 'Saver';
  return 'Economy';
};

// ----------------------------------------------------------------------------
// FARE OPTION EXTRACTION
// ----------------------------------------------------------------------------

const extractFareOptions = (pricePoint, pricingInfo, fareInfoKeys, fareInfoMap, 
                            segmentMap, detailsMap, brandMap, brandByIdMap, brandOriginalMap,
                            hostTokenMap, passengerTypes = []) => {
  const fareOptions = [];
  
  for (const fareKey of fareInfoKeys) {
    const fareInfo = fareInfoMap[fareKey];
    if (!fareInfo) continue;
    
    let brandObj = null;
    let originalBrand = null;
    
    if (fareInfo['air:Brand']) {
      const brandKey = fareInfo['air:Brand'].$?.Key;
      const brandId = fareInfo['air:Brand'].$?.BrandID;
      
      brandObj = brandMap[brandKey] || brandByIdMap[brandId];
      originalBrand = brandOriginalMap[brandKey] || brandOriginalMap[brandId];
    }
    
    const brand = extractBrandDetails(originalBrand || brandObj, fareInfo);
    const baggage = extractBaggage(fareInfo);
    const fareRuleKey = fareInfo['air:FareRuleKey']?._ || null;
    
    const flightOptions = pricingInfo['air:FlightOptionsList']?.['air:FlightOption'];
    if (!flightOptions) continue;
    
    const segmentsList = parseFlightSegments(flightOptions, segmentMap, detailsMap, hostTokenMap);
    if (!segmentsList.length) continue;
    
    const penalties = extractPenalties(pricingInfo);
    const taxes = extractTaxes(pricingInfo);
    const amenities = extractAmenities(fareInfo, brand, penalties);
    
    segmentsList.forEach((segments, idx) => {
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];
      
      const hostTokenInfo = firstSegment.hostTokenRef ? 
        hostTokenMap[firstSegment.hostTokenRef] : null;
      
      let hostTokenString = null;
      if (hostTokenInfo) {
        if (typeof hostTokenInfo === 'string') {
          hostTokenString = hostTokenInfo;
        } else if (typeof hostTokenInfo === 'object') {
          hostTokenString = hostTokenInfo.token || hostTokenInfo;
        }
      }
      
      fareOptions.push({
        trackingId: `fare-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        id: `${fareKey}-${idx}-${Date.now()}`,
        fareKey,
        bookingCode: firstSegment.bookingCode,
        price: parsePrice(fareInfo.$?.Amount),
        formattedPrice: fareInfo.$?.Amount || '₹0',
        totalPrice: parsePrice(pricePoint.$?.TotalPrice),
        basePrice: parsePrice(pricePoint.$?.BasePrice),
        taxes: taxes.total,
        taxBreakdown: taxes.breakdown,
        penalties: {
          change: {
            applies: penalties.change.applies,
            amount: penalties.change.amount,
            percentage: penalties.change.percentage,
            noShow: penalties.change.noShow
          },
          cancel: {
            applies: penalties.cancel.applies,
            amount: penalties.cancel.amount,
            percentage: penalties.cancel.percentage,
            noShow: penalties.cancel.noShow
          }
        },
        brand: {
          id: brand.id,
          name: brand.name,
          tier: brand.tier,
          carrier: brand.carrier
        },
        baggage: {
          checked: baggage.checked,
          carryon: baggage.carryon
        },
        fareBasis: fareInfo.$?.FareBasis,
        fareRuleKey,
        passengerType: fareInfo.$?.PassengerTypeCode || 'ADT',
        passengerTypes: passengerTypes,
        refundable: pricingInfo.$?.Refundable === 'true',
        eticketable: pricingInfo.$?.ETicketability === 'Yes',
        pricingMethod: pricingInfo.$?.PricingMethod,
        latestTicketingTime: pricingInfo.$?.LatestTicketingTime,
        segments: segments,
        cabinClass: firstSegment.cabinClass,
        seatsAvailable: firstSegment.seatsAvailable,
        amenities: amenities,
        hostToken: hostTokenString,
        hostTokenRef: firstSegment.hostTokenRef
      });
    });
  }
  
  return fareOptions;
};

// ----------------------------------------------------------------------------
// ONE-WAY TRANSFORMATION
// ----------------------------------------------------------------------------

const transformOneWayResponse = (data, passengerCount, traceId) => {
  try {
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
    
    const { brandMap, brandByIdMap, brandOriginalMap } = buildBrandMap(brands);
    
    const hostTokenMap = {};
    hostTokens.forEach(ht => {
      if (ht.$?.Key && ht._) {
        hostTokenMap[ht.$.Key] = ht._;
      }
    });
    
    const flights = [];
    const flightMap = new Map();
    
    const uniqueGroups = [...new Set(segments.map(s => s.$?.Group).filter(Boolean))];
    const isRoundTrip = uniqueGroups.includes('0') && uniqueGroups.includes('1');
    if (isRoundTrip) {
      return { 
        flights: [], 
        brandDetails: brandByIdMap, 
        count: 0, 
        currency: data.$?.CurrencyType || 'INR', 
        traceId 
      };
    }
    
    pricePoints.forEach(pricePoint => {
      try {
        const pricingInfo = pricePoint['air:AirPricingInfo'];
        if (!pricingInfo) return;
        
        const pricingInfoArray = safeArray(pricingInfo);
        
        const allFareInfoKeys = [];
        pricingInfoArray.forEach(pInfo => {
          const fareInfoRef = pInfo['air:FareInfoRef'];
          const keys = safeArray(fareInfoRef).map(ref => ref.$?.Key).filter(Boolean);
          allFareInfoKeys.push(...keys);
        });
        
        const fareInfoKeys = [...new Set(allFareInfoKeys)];
        if (!fareInfoKeys.length) return;
        
        const passengerTypes = [];
        const fees = [];
        pricingInfoArray.forEach(pInfo => {
          passengerTypes.push(...extractPassengerTypes(pInfo));
          fees.push(...extractFeesByType(pInfo));
        });
        
        const faresByPassengerType = { ADT: [], INF: [], CHD: [], CNN: [] };
        fareInfoKeys.forEach(key => {
          const fare = fareInfoMap[key];
          if (fare) {
            const ptc = fare.$?.PassengerTypeCode || 'ADT';
            if (faresByPassengerType[ptc]) {
              faresByPassengerType[ptc].push(fare);
            }
          }
        });
        
        const flightOptions = pricingInfoArray[0]?.['air:FlightOptionsList']?.['air:FlightOption'];
        if (!flightOptions) return;
        
        const fareOptions = extractFareOptions(
          pricePoint, 
          pricingInfoArray[0],
          fareInfoKeys,
          fareInfoMap, 
          segmentMap, 
          detailsMap, 
          brandMap, 
          brandByIdMap,
          brandOriginalMap,
          hostTokenMap,
          passengerTypes
        );
        
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
            const adultFare = faresByPassengerType.ADT[0];
            const infantFare = faresByPassengerType.INF[0];
            const infantFees = fees.filter(f => f.code === 'INF');
            
            flight.fares.push({
              ...fare,
              passengerTypes: passengerTypes,
              pricingBreakdown: {
                adult: {
                  base: parsePrice(adultFare?.$?.Amount) || 0,
                  count: passengerTypes.filter(p => p.code === 'ADT').length
                },
                infant: {
                  base: parsePrice(infantFare?.$?.Amount) || 0,
                  fees: infantFees.reduce((sum, f) => sum + f.amount, 0),
                  count: passengerTypes.filter(p => p.code === 'INF').length
                }
              },
              baggageByPassengerType: {
                ADT: extractBaggage(adultFare),
                INF: extractBaggage(infantFare)
              }
            });
            
            flight.lowestPrice = Math.min(flight.lowestPrice, fare.totalPrice);
            flight.highestPrice = Math.max(flight.highestPrice, fare.totalPrice);
          }
        });
      } catch (err) {
        console.error('Error processing one-way price point:', err);
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
    
    return {
      flights: Array.from(flightMap.values()),
      brandDetails: brandByIdMap,
      count: flightMap.size,
      currency: data.$?.CurrencyType || 'INR',
      traceId,
      passengerCount
    };
  } catch (error) {
    console.error('Error transforming one-way response:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------------
// ROUND-TRIP TRANSFORMATION
// ----------------------------------------------------------------------------

const transformRoundTripResponse = (data, passengerCount, traceId) => {
  try {
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
    
    const { brandMap, brandByIdMap, brandOriginalMap } = buildBrandMap(brands);
    
    // Build hostTokenMap for quick lookup by reference key
    const hostTokenMap = {};
    hostTokens.forEach(ht => {
      if (ht.$?.Key && ht._) {
        hostTokenMap[ht.$.Key] = ht._;
      }
    });
    
    const roundTrips = [];
    const processedCombinations = new Set();
    
    pricePoints.forEach((pricePoint, priceIdx) => {
      try {
        const pricingInfo = pricePoint['air:AirPricingInfo'];
        if (!pricingInfo) return;
        
        const pricingInfoArray = safeArray(pricingInfo);
        
        const allFareInfoKeys = [];
        pricingInfoArray.forEach(pInfo => {
          const fareInfoRef = pInfo['air:FareInfoRef'];
          const keys = safeArray(fareInfoRef).map(ref => ref.$?.Key).filter(Boolean);
          allFareInfoKeys.push(...keys);
        });
        
        const fareInfoKeys = [...new Set(allFareInfoKeys)];
        if (!fareInfoKeys.length) return;
        
        const adultFareKeys = fareInfoKeys.filter(key => {
          const fare = fareInfoMap[key];
          return fare?.$?.PassengerTypeCode === 'ADT';
        });
        
        if (adultFareKeys.length < 2) return;
        
        let flightOptions = pricingInfoArray[0]?.['air:FlightOptionsList']?.['air:FlightOption'];
        if (!flightOptions) return;
        
        const flightOptionsArray = safeArray(flightOptions);
        if (flightOptionsArray.length < 2) return;
        
        const combinationKey = `${adultFareKeys[0]}-${adultFareKeys[1]}`;
        if (processedCombinations.has(combinationKey)) return;
        processedCombinations.add(combinationKey);
        
        const passengerTypes = [];
        const fees = [];
        pricingInfoArray.forEach(pInfo => {
          passengerTypes.push(...extractPassengerTypes(pInfo));
          fees.push(...extractFeesByType(pInfo));
        });
        
        // ============ PROCESS OUTBOUND LEG ============
        const outboundOption = flightOptionsArray.find(opt => {
          const group = opt.$?.Group;
          return group === '0' || (flightOptionsArray.indexOf(opt) === 0);
        }) || flightOptionsArray[0];
        
        const outboundFareInfo = fareInfoMap[adultFareKeys[0]];
        
        // Extract brand
        let outboundBrandObj = null;
        let outboundOriginalBrand = null;
        
        if (outboundFareInfo?.['air:Brand']) {
          const brandKey = outboundFareInfo['air:Brand'].$?.Key;
          const brandId = outboundFareInfo['air:Brand'].$?.BrandID;
          outboundBrandObj = brandMap[brandKey] || brandByIdMap[brandId];
          outboundOriginalBrand = brandOriginalMap[brandKey] || brandOriginalMap[brandId];
        }
        
        const outboundBrand = extractBrandDetails(outboundOriginalBrand || outboundBrandObj, outboundFareInfo);
        const outboundBaggage = extractBaggage(outboundFareInfo);
        const outboundFareRuleKey = outboundFareInfo['air:FareRuleKey']?._ || null;
        
        // Parse outbound segments with FULL hostToken data
        const outboundSegmentsList = parseFlightSegments([outboundOption], segmentMap, detailsMap, hostTokenMap);
        if (!outboundSegmentsList.length) return;
        
        const outboundDefault = outboundSegmentsList[0];
        const outboundFirst = outboundDefault[0];
        
        // ============ BUILD HOSTTOKEN MAPS FROM ALL SEGMENTS ============
        const outboundHostTokenMap = {};
        const outboundHostTokenRefMap = {};
        
        outboundDefault.forEach(segment => {
          if (segment.segmentKey) {
            outboundHostTokenMap[segment.segmentKey] = segment.hostToken;
            outboundHostTokenRefMap[segment.segmentKey] = segment.hostTokenRef;
          }
        });
        
        const outboundHostToken = outboundFirst?.hostToken || null;
        const outboundHostTokenRef = outboundFirst?.hostTokenRef || null;
        
        // ============ PROCESS RETURN LEG ============
        const returnOption = flightOptionsArray.find(opt => {
          const group = opt.$?.Group;
          return group === '1' || (flightOptionsArray.indexOf(opt) === 1);
        }) || flightOptionsArray[1];
        
        const returnFareInfo = fareInfoMap[adultFareKeys[1]];
        
        let returnBrandObj = null;
        let returnOriginalBrand = null;
        
        if (returnFareInfo?.['air:Brand']) {
          const brandKey = returnFareInfo['air:Brand'].$?.Key;
          const brandId = returnFareInfo['air:Brand'].$?.BrandID;
          returnBrandObj = brandMap[brandKey] || brandByIdMap[brandId];
          returnOriginalBrand = brandOriginalMap[brandKey] || brandOriginalMap[brandId];
        }
        
        const returnBrand = extractBrandDetails(returnOriginalBrand || returnBrandObj, returnFareInfo);
        const returnBaggage = extractBaggage(returnFareInfo);
        const returnFareRuleKey = returnFareInfo['air:FareRuleKey']?._ || null;
        
        // Parse return segments with FULL hostToken data
        const returnSegmentsList = parseFlightSegments([returnOption], segmentMap, detailsMap, hostTokenMap);
        if (!returnSegmentsList.length) return;
        
        const returnDefault = returnSegmentsList[0];
        const returnFirst = returnDefault[0];
        
        // ============ BUILD HOSTTOKEN MAPS FROM ALL SEGMENTS ============
        const returnHostTokenMap = {};
        const returnHostTokenRefMap = {};
        
        returnDefault.forEach(segment => {
          if (segment.segmentKey) {
            returnHostTokenMap[segment.segmentKey] = segment.hostToken;
            returnHostTokenRefMap[segment.segmentKey] = segment.hostTokenRef;
          }
        });
        
        const returnHostToken = returnFirst?.hostToken || null;
        const returnHostTokenRef = returnFirst?.hostTokenRef || null;
        
        if (!outboundFirst || !returnFirst) return;
        
        // Extract meals
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
        
        const taxes = extractTaxes(pricingInfoArray[0]);
        const penalties = extractPenalties(pricingInfoArray[0]);
        const roundTripId = `rt-${pricePoint.$?.Key}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        const outboundBasePrice = parsePrice(outboundFareInfo?.$?.Amount) || 
                                  parsePrice(pricePoint.$?.BasePrice) / 2;
        const returnBasePrice = parsePrice(returnFareInfo?.$?.Amount) || 
                                parsePrice(pricePoint.$?.BasePrice) / 2;
        
        // Get operating carrier info
        const outboundOperatingCarrier = outboundFirst.operatingCarrier || outboundFirst.carrier;
        const returnOperatingCarrier = returnFirst.operatingCarrier || returnFirst.carrier;
        const outboundOperatingFlightNumber = outboundFirst.flightNumber;
        const returnOperatingFlightNumber = returnFirst.flightNumber;
        
        const outboundAmenities = {
          meals: !!outboundMeal,
          mealType: outboundMeal,
          seatSelection: outboundBrand.name?.toLowerCase().includes('flex') ||
                         outboundBrand.name?.toLowerCase().includes('upfront') ||
                         outboundBrand.name?.toLowerCase().includes('stretch') ||
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
                         returnBrand.name?.toLowerCase().includes('stretch') ||
                         returnBrand.name?.toLowerCase().includes('xl') || false,
          changes: penalties.change.amount === 0 ||
                   penalties.change.percentage === '0.00' ||
                   returnBrand.name?.toLowerCase().includes('flex') || false,
          priority: returnBrand.name?.toLowerCase().includes('priority') ||
                    returnBrand.name?.toLowerCase().includes('plus') ||
                    returnFirst.cabinClass === 'Business' || false
        };
        
        // ============ BUILD COMPLETE ROUND TRIP OBJECT ============
        const roundTrip = {
          id: roundTripId,
          traceId,
          totalPrice: parsePrice(pricePoint.$?.TotalPrice),
          formattedPrice: pricePoint.$?.TotalPrice || '',
          basePrice: parsePrice(pricePoint.$?.BasePrice),
          taxes: taxes.total,
          taxBreakdown: taxes.breakdown,
          penalties: {
            change: {
              applies: penalties.change.applies,
              amount: penalties.change.amount,
              percentage: penalties.change.percentage,
              noShow: penalties.change.noShow
            },
            cancel: {
              applies: penalties.cancel.applies,
              amount: penalties.cancel.amount,
              percentage: penalties.cancel.percentage,
              noShow: penalties.cancel.noShow
            }
          },
          legPricing: {
            outbound: {
              basePrice: outboundBasePrice,
              taxes: taxes.total / 2,
              totalPrice: outboundBasePrice + (taxes.total / 2)
            },
            return: {
              basePrice: returnBasePrice,
              taxes: taxes.total / 2,
              totalPrice: returnBasePrice + (taxes.total / 2)
            }
          },
          passengerTypes: passengerTypes,
          fees: fees,
          
          outbound: {
            id: `out-${roundTripId}`,
            airline: AIRLINE_NAMES[outboundOperatingCarrier] || outboundOperatingCarrier,
            airlineCode: outboundOperatingCarrier,
            flightNumber: `${outboundOperatingCarrier}-${outboundOperatingFlightNumber}`,
            
            // Store segments with ALL data including hostToken and hostTokenRef
            segments: outboundDefault.map(segment => ({
              segmentKey: segment.segmentKey,
              carrier: segment.carrier,
              flightNumber: segment.flightNumber,
              origin: segment.origin,
              destination: segment.destination,
              departureTime: segment.departureTime,
              arrivalTime: segment.arrivalTime,
              duration: segment.duration,
              bookingCode: segment.bookingCode,
              cabinClass: segment.cabinClass,
              hostToken: segment.hostToken,
              hostTokenRef: segment.hostTokenRef,
              seatsAvailable: segment.seatsAvailable
            })),
            
            hostToken: outboundHostToken,
            hostTokenRef: outboundHostTokenRef,
            hostTokenMap: outboundHostTokenMap,
            hostTokenRefMap: outboundHostTokenRefMap,
            
            defaultFlight: {
              flightNumber: `${outboundOperatingCarrier}-${outboundOperatingFlightNumber}`,
              flightNumbers: outboundDefault.map(s => s.flightNumber),
              departureTime: outboundFirst.departureTime,
              arrivalTime: outboundDefault[outboundDefault.length - 1].arrivalTime,
              origin: outboundFirst.origin,
              destination: outboundDefault[outboundDefault.length - 1].destination,
              duration: outboundDefault.reduce((sum, seg) => sum + (seg.duration || 0), 0),
              stops: outboundDefault.length - 1,
              segments: outboundDefault,
              layovers: calculateLayovers(outboundDefault),
              seatsAvailable: Math.min(...outboundDefault.map(s => s.seatsAvailable || 9)),
              originTerminal: outboundFirst.originTerminal,
              destinationTerminal: outboundDefault[outboundDefault.length - 1].destinationTerminal
            },
            flightOptions: outboundSegmentsList.map(segments => {
              const first = segments[0];
              const last = segments[segments.length - 1];
              const displayCarrier = first.operatingCarrier || first.carrier;
              return {
                id: `out-opt-${displayCarrier}-${first.flightNumber}-${first.departureTime}`,
                flightNumber: `${displayCarrier}-${first.flightNumber}`,
                flightNumbers: segments.map(s => s.flightNumber),
                departureTime: first.departureTime,
                arrivalTime: last.arrivalTime,
                origin: first.origin,
                destination: last.destination,
                duration: last.duration,
                stops: segments.length - 1,
                segments: segments,
                layovers: calculateLayovers(segments),
                seatsAvailable: Math.min(...segments.map(s => s.seatsAvailable || 9)),
                originTerminal: first.originTerminal,
                destinationTerminal: last.destinationTerminal
              };
            }),
            cabinClass: outboundFirst.cabinClass,
            brand: {
              id: outboundBrand.id,
              name: outboundBrand.name,
              tier: outboundBrand.tier,
              carrier: outboundBrand.carrier
            },
            baggage: {
              checked: outboundBaggage.checked,
              carryon: outboundBaggage.carryon
            },
            fareBasis: outboundFareInfo?.$?.FareBasis,
            fareRuleKey: outboundFareRuleKey,
            refundable: pricingInfoArray[0]?.$?.Refundable === 'true',
            amenities: outboundAmenities,
            bookingCode: outboundFirst.bookingCode,
            cabinClassDisplay: outboundFirst.cabinClass
          },
          
          return: {
            id: `ret-${roundTripId}`,
            airline: AIRLINE_NAMES[returnOperatingCarrier] || returnOperatingCarrier,
            airlineCode: returnOperatingCarrier,
            flightNumber: `${returnOperatingCarrier}-${returnOperatingFlightNumber}`,
            
            // Store segments with ALL data including hostToken and hostTokenRef
            segments: returnDefault.map(segment => ({
              segmentKey: segment.segmentKey,
              carrier: segment.carrier,
              flightNumber: segment.flightNumber,
              origin: segment.origin,
              destination: segment.destination,
              departureTime: segment.departureTime,
              arrivalTime: segment.arrivalTime,
              duration: segment.duration,
              bookingCode: segment.bookingCode,
              cabinClass: segment.cabinClass,
              hostToken: segment.hostToken,
              hostTokenRef: segment.hostTokenRef,
              seatsAvailable: segment.seatsAvailable
            })),
            
            hostToken: returnHostToken,
            hostTokenRef: returnHostTokenRef,
            hostTokenMap: returnHostTokenMap,
            hostTokenRefMap: returnHostTokenRefMap,
            
            defaultFlight: {
              flightNumber: `${returnOperatingCarrier}-${returnOperatingFlightNumber}`,
              flightNumbers: returnDefault.map(s => s.flightNumber),
              departureTime: returnFirst.departureTime,
              arrivalTime: returnDefault[returnDefault.length - 1].arrivalTime,
              origin: returnFirst.origin,
              destination: returnDefault[returnDefault.length - 1].destination,
              duration: returnDefault.reduce((sum, seg) => sum + (seg.duration || 0), 0),
              stops: returnDefault.length - 1,
              segments: returnDefault,
              layovers: calculateLayovers(returnDefault),
              seatsAvailable: Math.min(...returnDefault.map(s => s.seatsAvailable || 9)),
              originTerminal: returnFirst.originTerminal,
              destinationTerminal: returnDefault[returnDefault.length - 1].destinationTerminal
            },
            flightOptions: returnSegmentsList.map(segments => {
              const first = segments[0];
              const last = segments[segments.length - 1];
              const displayCarrier = first.operatingCarrier || first.carrier;
              return {
                id: `ret-opt-${displayCarrier}-${first.flightNumber}-${first.departureTime}`,
                flightNumber: `${displayCarrier}-${first.flightNumber}`,
                flightNumbers: segments.map(s => s.flightNumber),
                departureTime: first.departureTime,
                arrivalTime: last.arrivalTime,
                origin: first.origin,
                destination: last.destination,
                duration: last.duration,
                stops: segments.length - 1,
                segments: segments,
                layovers: calculateLayovers(segments),
                seatsAvailable: Math.min(...segments.map(s => s.seatsAvailable || 9)),
                originTerminal: first.originTerminal,
                destinationTerminal: last.destinationTerminal
              };
            }),
            cabinClass: returnFirst.cabinClass,
            brand: {
              id: returnBrand.id,
              name: returnBrand.name,
              tier: returnBrand.tier,
              carrier: returnBrand.carrier
            },
            baggage: {
              checked: returnBaggage.checked,
              carryon: returnBaggage.carryon
            },
            fareBasis: returnFareInfo?.$?.FareBasis,
            fareRuleKey: returnFareRuleKey,
            refundable: pricingInfoArray[0]?.$?.Refundable === 'true',
            amenities: returnAmenities,
            bookingCode: returnFirst.bookingCode,
            cabinClassDisplay: returnFirst.cabinClass
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
    
    // ============ BUILD ROUND TRIP DISPLAY WITH COMPLETE DATA ============
    return {
      roundTrips: roundTrips,
      roundTripDisplay: roundTrips.length > 0 ? {
        outbound: {
          date: new Date(roundTrips[0].outbound.defaultFlight.departureTime).toLocaleDateString('en-IN', { 
            day: 'numeric', month: 'short', year: 'numeric' 
          }),
          origin: roundTrips[0].outbound.defaultFlight.origin,
          destination: roundTrips[0].outbound.defaultFlight.destination,
          flights: roundTrips.map(rt => ({
            ...rt.outbound.defaultFlight,
            airline: rt.outbound.airline,
            airlineCode: rt.outbound.airlineCode,
            price: rt.totalPrice,
            brand: rt.outbound.brand,
            mealType: rt.outbound.amenities?.mealType || null,
            
            // Fare-level data
            fareBasis: rt.outbound.fareBasis,
            bookingCode: rt.outbound.bookingCode,
            
            // HostToken data
            hostToken: rt.outbound.hostToken,
            hostTokenRef: rt.outbound.hostTokenRef,
            hostTokenMap: rt.outbound.hostTokenMap,
            hostTokenRefMap: rt.outbound.hostTokenRefMap,
            
            // Segments with full data
            segments: rt.outbound.segments
          }))
        },
        return: {
          date: new Date(roundTrips[0].return.defaultFlight.departureTime).toLocaleDateString('en-IN', { 
            day: 'numeric', month: 'short', year: 'numeric' 
          }),
          origin: roundTrips[0].return.defaultFlight.origin,
          destination: roundTrips[0].return.defaultFlight.destination,
          flights: roundTrips.map(rt => ({
            ...rt.return.defaultFlight,
            airline: rt.return.airline,
            airlineCode: rt.return.airlineCode,
            price: rt.totalPrice,
            brand: rt.return.brand,
            mealType: rt.return.amenities?.mealType || null,
            
            // Fare-level data
            fareBasis: rt.return.fareBasis,
            bookingCode: rt.return.bookingCode,
            
            // HostToken data
            hostToken: rt.return.hostToken,
            hostTokenRef: rt.return.hostTokenRef,
            hostTokenMap: rt.return.hostTokenMap,
            hostTokenRefMap: rt.return.hostTokenRefMap,
            
            // Segments with full data
            segments: rt.return.segments
          }))
        }
      } : null,
      brandDetails: brandByIdMap,
      count: roundTrips.length,
      currency: data.$?.CurrencyType || 'INR',
      traceId,
      passengerCount
    };
  } catch (error) {
    console.error('Error transforming round-trip response:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------------
// MULTI-CITY TRANSFORMATION
// ----------------------------------------------------------------------------

const transformMultiCityResponse = (data, passengerCount, traceId) => {
  try {
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
    
    const { brandMap, brandByIdMap, brandOriginalMap } = buildBrandMap(brands);
    
    const hostTokenMap = {};
    hostTokens.forEach(ht => {
      if (ht.$?.Key && ht._) {
        hostTokenMap[ht.$.Key] = ht._;
      }
    });
    
    const legs = [];
    const combinations = [];
    
    const segmentsByGroup = {};
    segments.forEach(segment => {
      const group = segment.$?.Group || '0';
      if (!segmentsByGroup[group]) {
        segmentsByGroup[group] = [];
      }
      segmentsByGroup[group].push(segment);
    });
    
    Object.keys(segmentsByGroup).forEach(group => {
      const groupSegments = segmentsByGroup[group];
      if (groupSegments.length === 0) return;
      
      const firstSegment = groupSegments[0];
      const lastSegment = groupSegments[groupSegments.length - 1];
      
      const flightSegments = parseFlightSegments(
        [{ 'air:BookingInfo': groupSegments.map(s => ({ 
          $: { SegmentRef: s.$?.Key, HostTokenRef: s.$?.Key } 
        })) }], 
        segmentMap, 
        detailsMap, 
        hostTokenMap
      );
      
      legs.push({
        legIndex: parseInt(group),
        origin: firstSegment.$?.Origin,
        destination: lastSegment.$?.Destination,
        departureDate: firstSegment.$?.DepartureTime?.split('T')[0],
        flights: flightSegments.flat().map(seg => ({
          id: `leg${group}-flight-${seg?.key}`,
          flightKey: seg?.key,
          airline: seg?.carrier,
          flightNumber: seg?.flightNumber,
          departureTime: seg?.departureTime,
          arrivalTime: seg?.arrivalTime,
          origin: seg?.origin,
          destination: seg?.destination,
          duration: seg?.duration,
          stops: 0,
          segments: [seg],
          layovers: [],
          seatsAvailable: 9,
          cabinClass: 'Economy',
          brand: null,
          baggage: null,
          fareBasis: null,
          fareRuleKey: null,
          refundable: false,
          hostToken: seg?.hostToken,
          amenities: null
        }))
      });
    });
    
    pricePoints.forEach(pricePoint => {
      try {
        const pricingInfo = pricePoint['air:AirPricingInfo'];
        if (!pricingInfo) return;
        
        const fareInfoRef = pricingInfo['air:FareInfoRef'];
        const fareInfoKeys = safeArray(fareInfoRef).map(ref => ref.$?.Key).filter(Boolean);
        if (!fareInfoKeys.length) return;
        
        const flightOptions = pricingInfo['air:FlightOptionsList']?.['air:FlightOption'];
        if (!flightOptions) return;
        
        const combinationLegs = [];
        
        const passengerTypes = extractPassengerTypes(pricingInfo);
        const fees = extractFeesByType(pricingInfo);
        
        safeArray(flightOptions).forEach((option, index) => {
          const fareInfo = fareInfoMap[fareInfoKeys[index]];
          if (!fareInfo) return;
          
          const bookingInfos = safeArray(option?.['air:BookingInfo']);
          
          const flightSegments = parseFlightSegments(
            [option], 
            segmentMap, 
            detailsMap, 
            hostTokenMap
          );
          
          if (!flightSegments.length || !flightSegments[0].length) return;
          
          const legSegments = flightSegments[0];
          const firstSegment = legSegments[0];
          const lastSegment = legSegments[legSegments.length - 1];
          
          let brandObj = null;
          let originalBrand = null;
          
          if (fareInfo['air:Brand']) {
            const brandKey = fareInfo['air:Brand'].$?.Key;
            const brandId = fareInfo['air:Brand'].$?.BrandID;
            brandObj = brandMap[brandKey] || brandByIdMap[brandId];
            originalBrand = brandOriginalMap[brandKey] || brandOriginalMap[brandId];
          }
          
          const brand = extractBrandDetails(originalBrand || brandObj, fareInfo);
          const baggage = extractBaggage(fareInfo);
          const penalties = extractPenalties(pricingInfo);
          const amenities = extractAmenities(fareInfo, brand, penalties);
          
          combinationLegs.push({
            legIndex: index,
            origin: firstSegment?.origin,
            destination: lastSegment?.destination,
            departureDate: firstSegment?.departureTime?.split('T')[0],
            carrier: firstSegment?.carrier,
            defaultFlight: {
              id: `combo-leg${index}-${Date.now()}`,
              flightKey: firstSegment?.key,
              airline: firstSegment?.carrier,
              flightNumber: firstSegment?.flightNumber,
              departureTime: firstSegment?.departureTime,
              arrivalTime: lastSegment?.arrivalTime,
              origin: firstSegment?.origin,
              destination: lastSegment?.destination,
              duration: legSegments.reduce((sum, seg) => sum + seg?.duration, 0),
              stops: legSegments.length - 1,
              segments: legSegments,
              layovers: calculateLayovers(legSegments),
              seatsAvailable: parseInt(bookingInfos[0]?.$?.BookingCount || 9),
              cabinClass: bookingInfos[0]?.$?.CabinClass || 'Economy',
              brand: brand ? {
                id: brand.id,
                name: brand.name,
                tier: brand.tier,
                carrier: brand.carrier
              } : null,
              baggage: {
                checked: baggage.checked,
                carryon: baggage.carryon
              },
              fareBasis: fareInfo?.$?.FareBasis,
              fareRuleKey: fareInfo?.['air:FareRuleKey']?._,
              refundable: penalties.cancel.amount < parsePrice(fareInfo?.$?.Amount),
              hostToken: bookingInfos[0]?.$?.HostTokenRef ? 
                hostTokenMap[bookingInfos[0].$?.HostTokenRef] : null,
              amenities: amenities
            },
            flightOptions: [{
              id: `combo-leg${index}-opt-${Date.now()}`,
              flightKey: firstSegment?.key,
              airline: firstSegment?.carrier,
              flightNumber: firstSegment?.flightNumber,
              departureTime: firstSegment?.departureTime,
              arrivalTime: lastSegment?.arrivalTime,
              origin: firstSegment?.origin,
              destination: lastSegment?.destination,
              duration: legSegments.reduce((sum, seg) => sum + seg?.duration, 0),
              stops: legSegments.length - 1,
              segments: legSegments,
              layovers: [],
              seatsAvailable: parseInt(bookingInfos[0]?.$?.BookingCount || 9),
              cabinClass: bookingInfos[0]?.$?.CabinClass || 'Economy',
              brand: brand ? {
                id: brand.id,
                name: brand.name,
                tier: brand.tier,
                carrier: brand.carrier
              } : null,
              baggage: {
                checked: baggage.checked,
                carryon: baggage.carryon
              },
              fareBasis: fareInfo?.$?.FareBasis,
              fareRuleKey: fareInfo?.['air:FareRuleKey']?._,
              refundable: penalties.cancel.amount < parsePrice(fareInfo?.$?.Amount),
              hostToken: bookingInfos[0]?.$?.HostTokenRef ? 
                hostTokenMap[bookingInfos[0].$?.HostTokenRef] : null,
              amenities: amenities
            }],
            fareInfo: fareInfo,
            pricingInfo: pricingInfo,
            penalties: penalties
          });
        });
        
        if (combinationLegs.length === 0) return;
        
        const taxes = extractTaxes(pricingInfo);
        const penalties = extractPenalties(pricingInfo);
        
        combinations.push({
          id: pricePoint?.$?.Key || `mc-${Date.now()}-${Math.random()}`,
          traceId: traceId,
          totalPrice: parsePrice(pricePoint?.$?.TotalPrice),
          formattedPrice: pricePoint?.$?.TotalPrice || '',
          basePrice: parsePrice(pricePoint?.$?.BasePrice),
          taxes: taxes.total,
          taxBreakdown: taxes.breakdown,
          penalties: {
            change: {
              applies: penalties.change.applies,
              amount: penalties.change.amount,
              percentage: penalties.change.percentage,
              noShow: penalties.change.noShow
            },
            cancel: {
              applies: penalties.cancel.applies,
              amount: penalties.cancel.amount,
              percentage: penalties.cancel.percentage,
              noShow: penalties.cancel.noShow
            }
          },
          passengerTypes: passengerTypes,
          fees: fees,
          legPricing: combinationLegs.map(leg => ({
            legIndex: leg?.legIndex,
            origin: leg?.origin,
            destination: leg?.destination,
            basePrice: parsePrice(leg?.fareInfo?.$?.Amount),
            taxes: taxes.total / combinationLegs.length,
            totalPrice: parsePrice(leg?.fareInfo?.$?.Amount) + (taxes.total / combinationLegs.length)
          })),
          legs: combinationLegs.map(leg => ({
            legIndex: leg?.legIndex,
            origin: leg?.origin,
            destination: leg?.destination,
            departureDate: leg?.departureDate,
            defaultFlight: leg?.defaultFlight,
            flightOptions: leg?.flightOptions,
            penalties: leg?.penalties,
            amenities: leg?.defaultFlight?.amenities
          })),
          legCount: combinationLegs.length
        });
      } catch (err) {
        console.error('Error processing multi-city combination:', err);
      }
    });
    
    return {
      legs: legs,
      combinations: combinations,
      brandDetails: brandByIdMap,
      count: combinations.length,
      currency: data.$?.CurrencyType || 'INR',
      traceId,
      passengerCount
    };
  } catch (error) {
    console.error('Error transforming multi-city response:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------------
// VALIDATION FUNCTIONS
// ----------------------------------------------------------------------------

const validateOneWayData = (data) => {
  const missing = [];
  const requiredFlightFields = ['id', 'flightKey', 'airline', 'flightNumber', 
    'departureTime', 'arrivalTime', 'origin', 'destination', 'duration', 
    'segments', 'equipment'];
  const requiredFareFields = ['id', 'fareKey', 'bookingCode', 'fareBasis', 
    'price', 'basePrice', 'taxes', 'penalties', 'brand', 'baggage', 
    'amenities', 'eticketable', 'hostToken'];
  const requiredMetaFields = ['traceId', 'currency', 'count'];
  
  data?.flights?.forEach((flight, i) => {
    requiredFlightFields.forEach(field => {
      if (flight?.[field] === undefined) {
        missing.push(`Flight ${i}: ${field}`);
      }
    });
    flight?.fares?.forEach((fare, j) => {
      requiredFareFields.forEach(field => {
        if (fare?.[field] === undefined) {
          missing.push(`Flight ${i} Fare ${j}: ${field}`);
        }
      });
    });
  });
  
  requiredMetaFields.forEach(field => {
    if (data?.[field] === undefined) {
      missing.push(`Meta: ${field}`);
    }
  });
  
  return { valid: missing.length === 0, missing };
};

const validateRoundTripData = (data) => {
  const missing = [];
  const requiredRTFields = ['id', 'totalPrice', 'basePrice', 'taxes', 
    'penalties', 'legPricing'];
  const requiredLegFields = ['id', 'airline', 'flightNumber', 
    'departureTime', 'arrivalTime', 'origin', 'destination', 'duration'];
  
  data?.roundTrips?.forEach((rt, i) => {
    requiredRTFields.forEach(field => {
      if (rt?.[field] === undefined) {
        missing.push(`RoundTrip ${i}: ${field}`);
      }
    });
    
    ['outbound', 'return'].forEach(legType => {
      requiredLegFields.forEach(field => {
        if (rt?.[legType]?.defaultFlight?.[field] === undefined) {
          missing.push(`RoundTrip ${i} ${legType}: ${field}`);
        }
      });
    });
  });
  
  return { valid: missing.length === 0, missing };
};

const validateMultiCityData = (data) => {
  const missing = [];
  const requiredComboFields = ['id', 'totalPrice', 'basePrice', 'taxes', 
    'penalties', 'legPricing'];
  const requiredLegFields = ['legIndex', 'origin', 'destination', 
    'departureDate', 'defaultFlight', 'flightOptions'];
  
  data?.combinations?.forEach((combo, i) => {
    requiredComboFields.forEach(field => {
      if (combo?.[field] === undefined) {
        missing.push(`Combination ${i}: ${field}`);
      }
    });
    
    combo?.legs?.forEach((leg, j) => {
      requiredLegFields.forEach(field => {
        if (leg?.[field] === undefined) {
          missing.push(`Combination ${i} Leg ${j}: ${field}`);
        }
      });
    });
  });
  
  return { valid: missing.length === 0, missing };
};

// ----------------------------------------------------------------------------
// LOG RESULTS FUNCTION
// ----------------------------------------------------------------------------

const logResults = (data) => {
  console.log('==========================================');
  console.log('📊 TRANSFORMATION RESULTS');
  console.log('==========================================');
  
  try {
    if (data?.type === 'one_way') {
      console.log(`✈️ One-Way Flights: ${data?.flights?.length || 0}`);
      data?.flights?.slice(0, 3).forEach(flight => {
        const lowestFare = flight?.fares?.reduce((min, fare) => 
          fare?.totalPrice < min?.totalPrice ? fare : min, flight?.fares?.[0]);
        console.log(` ${flight?.airline || 'N/A'} ${flight?.flightNumber || 'N/A'} - ${lowestFare?.formattedPrice || 'N/A'}`);
      });
    }
    
    if (data?.type === 'round_trip') {
      console.log(`🔄 Round Trips: ${data?.roundTrips?.length || 0}`);
      data?.roundTrips?.slice(0, 3).forEach(rt => {
        const outboundMeal = rt?.amenities?.outboundMealType || 
                            rt?.outbound?.amenities?.mealType || 'None';
        const returnMeal = rt?.amenities?.returnMealType || 
                          rt?.return?.amenities?.mealType || 'None';
        
        console.log(` Outbound: ${rt?.outbound?.airline || 'N/A'} ${rt?.outbound?.defaultFlight?.flightNumber || 'N/A'} (Meal: ${outboundMeal})`);
        console.log(` Return: ${rt?.return?.airline || 'N/A'} ${rt?.return?.defaultFlight?.flightNumber || 'N/A'} (Meal: ${returnMeal})`);
      });
    }
    
    if (data?.type === 'multi_city') {
      console.log(`🗺️ Multi-City Combinations: ${data?.combinations?.length || 0}`);
    }
    
    console.log(`💰 Currency: ${data?.currency || 'INR'}`);
    console.log(`🔑 TraceId: ${data?.traceId || 'N/A'}`);
  } catch (error) {
    console.error('❌ Error logging results:', error.message);
  }
  
  console.log('==========================================');
};

// ----------------------------------------------------------------------------
// MAIN TRANSFORMER FUNCTION
// ----------------------------------------------------------------------------

const transformTravelportResponse = (apiResponse, passengerCount, expectedLegCount = 1) => {
  try {
    const data = apiResponse.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:LowFareSearchRsp'];
    if (!data) throw new Error('Invalid response structure');
    
    const traceId = data.$?.TraceId || `trace-${Date.now()}`;
    
    const segments = safeArray(data['air:AirSegmentList']?.['air:AirSegment']);
    const uniqueGroups = [...new Set(segments.map(s => s.$?.Group).filter(Boolean))];
    
    let transformed;
    let type;
    
    if (uniqueGroups.includes('0') && uniqueGroups.includes('1') && uniqueGroups.length === 2) {
      transformed = transformRoundTripResponse(data, passengerCount, traceId);
      type = 'round_trip';
    } else if (uniqueGroups.length > 2) {
      transformed = transformMultiCityResponse(data, passengerCount, traceId);
      type = 'multi_city';
    } else {
      transformed = transformOneWayResponse(data, passengerCount, traceId);
      type = 'one_way';
    }
    
    logResults({ ...transformed, type });
    
    let validationResult;
    switch (type) {
      case 'one_way':
        validationResult = validateOneWayData(transformed);
        break;
      case 'round_trip':
        validationResult = validateRoundTripData(transformed);
        break;
      case 'multi_city':
        validationResult = validateMultiCityData(transformed);
        break;
    }
    
    if (!validationResult?.valid) {
      console.warn('⚠️ Data validation warnings:', validationResult?.missing);
    }
    
    console.log('✅ Transformation complete:', {
      type: type,
      count: transformed?.count,
      traceId: transformed?.traceId,
      validationPassed: validationResult?.valid,
      missingFields: validationResult?.missing?.length
    });
    
    return {
      success: true,
      type: type,
      ...transformed,
      validation: validationResult,
      passengerCount
    };
  } catch (error) {
    console.error('❌ Transform error:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------------
// SEARCH FUNCTION
// ----------------------------------------------------------------------------

export const searchFlights = async (searchData) => {
  try {
    if (!searchData.legs?.length) throw new Error('No flight legs provided');
    if (!searchData.passengers?.length) throw new Error('No passengers provided');
    
    const passengerCount = {
      ADT: searchData.passengers.filter(p => p.code === 'ADT').length,
      CNN: searchData.passengers.filter(p => p.code === 'CNN').length,
      CHD: searchData.passengers.filter(p => p.code === 'CHD').length,
      INF: searchData.passengers.filter(p => p.code === 'INF').length
    };
    
    const requestBody = {
      legs: searchData.legs.map(leg => ({
        origin: leg.origin,
        destination: leg.destination,
        departureDate: leg.departureDate
      })),
      passengers: searchData.passengers.map(p => ({
        code: p.code,
        ...(p.age && { age: p.age })
      }))
    };
    
    console.log('📤 [API REQUEST] Body:', JSON.stringify(requestBody, null, 2));
    
    const apiUrl = `${BASE_URL}/flights/lowfare`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Accept': 'application/json', 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const apiResponse = await response.json();
    console.log('📥 [API RESPONSE] Body:', JSON.stringify(apiResponse, null, 2));
    
    const transformed = transformTravelportResponse(apiResponse, passengerCount, searchData.legs.length);
    
    if (!transformed.success) {
      throw new Error(transformed.error || 'Failed to process response');
    }
    
    return { 
      success: true, 
      ...transformed, 
      searchId: `search-${Date.now()}`, 
      traceId: transformed.traceId 
    };
  } catch (error) {
    console.error('❌ Flight search error:', error);
    return { 
      success: false, 
      error: error.message, 
      type: 'unknown', 
      flights: [], 
      roundTrips: [], 
      multiCity: { legs: [], combinations: [] }, 
      count: 0, 
      traceId: null 
    };
  }
};

// ----------------------------------------------------------------------------
// EXPORTS
// ----------------------------------------------------------------------------

export {
  transformTravelportResponse,
  transformOneWayResponse,
  transformRoundTripResponse,
  transformMultiCityResponse,
  validateOneWayData,
  validateRoundTripData,
  validateMultiCityData,
  safeArray,
  parsePrice,
  parseDuration,
  extractTaxes,
  extractPenalties,
  extractBaggage,
  extractPassengerTypes,
  extractFeesByType,
  extractAmenities,
  buildHostTokenMap,
  buildBrandMap,
  buildFlightDetailsMap,
  calculateLayovers,
  formatDuration,
  parseFlightSegments,
  extractBrandDetails,
  logResults
};