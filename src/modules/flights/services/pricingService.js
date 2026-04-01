// src/modules/flights/services/pricingService.js

import { safeArray, parsePrice, generateUniqueId } from '../utils/airPricingHelper';

const BASE_URL = 'https://api.bobros.org';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Extract warnings from ResponseMessage array
 */
const extractWarnings = (data) => {
  const responseMessages = data['common_v54_0:ResponseMessage'];
  if (!responseMessages) return [];
  
  return safeArray(responseMessages).map(msg => ({
    message: msg._,
    code: msg.$?.Code,
    type: msg.$?.Type,
    providerCode: msg.$?.ProviderCode
  }));
};

/**
 * Extract flight segments (handles both single and array)
 */
const extractFlightSegments = (data) => {
  const airSegments = data['air:AirItinerary']?.['air:AirSegment'];
  if (!airSegments) return [];
  
  const segments = safeArray(airSegments);
  
  return segments.map(segment => {
    const flightDetails = segment['air:FlightDetails'];
    const codeshareInfo = segment['air:CodeshareInfo'];
    
    return {
      segmentKey: segment.$?.Key,
      group: segment.$?.Group,
      carrier: segment.$?.Carrier,
      flightNumber: segment.$?.FlightNumber,
      providerCode: segment.$?.ProviderCode,
      origin: segment.$?.Origin,
      destination: segment.$?.Destination,
      departureTime: segment.$?.DepartureTime,
      arrivalTime: segment.$?.ArrivalTime,
      flightTime: segment.$?.FlightTime,
      travelTime: segment.$?.TravelTime,
      duration: parseInt(segment.$?.FlightTime) || 0,
      distance: segment.$?.Distance,
      classOfService: segment.$?.ClassOfService,
      equipment: segment.$?.Equipment,
      changeOfPlane: segment.$?.ChangeOfPlane === 'true',
      optionalServicesIndicator: segment.$?.OptionalServicesIndicator === 'true',
      availabilitySource: segment.$?.AvailabilitySource,
      participantLevel: segment.$?.ParticipantLevel,
      linkAvailability: segment.$?.LinkAvailability === 'true',
      availabilityDisplayType: segment.$?.AvailabilityDisplayType,
      codeshareInfo: codeshareInfo ? {
        operatingCarrier: codeshareInfo.$?.OperatingCarrier,
        operatingCarrierName: codeshareInfo._
      } : null,
      flightDetails: flightDetails ? {
        key: flightDetails.$?.Key,
        origin: flightDetails.$?.Origin,
        destination: flightDetails.$?.Destination,
        departureTime: flightDetails.$?.DepartureTime,
        arrivalTime: flightDetails.$?.ArrivalTime,
        flightTime: flightDetails.$?.FlightTime,
        travelTime: flightDetails.$?.TravelTime,
        distance: flightDetails.$?.Distance
      } : null
    };
  });
};

/**
 * Extract brand from FareInfo
 */
const extractBrandFromFare = (fareInfo) => {
  if (!fareInfo || !fareInfo['air:Brand']) return null;
  
  const brand = fareInfo['air:Brand'];
  const titles = {};
  const texts = {};
  
  if (brand['air:Title']) {
    safeArray(brand['air:Title']).forEach(title => {
      if (title.$?.Type) titles[title.$.Type.toLowerCase()] = title._;
    });
  }
  
  if (brand['air:Text']) {
    safeArray(brand['air:Text']).forEach(text => {
      if (text.$?.Type) texts[text.$.Type.toLowerCase()] = text._;
    });
  }
  
  return {
    id: brand.$?.BrandID,
    name: brand.$?.Name,
    tier: brand.$?.BrandTier,
    carrier: brand.$?.Carrier,
    titles,
    texts,
    description: texts.strapline || brand.$?.Name,
    externalName: titles.external || brand.$?.Name,
    shortName: titles.short || brand.$?.Name,
    optionalServices: brand['air:OptionalServices'] ? extractOptionalServices(brand['air:OptionalServices']) : null
  };
};

/**
 * Extract optional services from brand
 */
const extractOptionalServices = (optionalServices) => {
  if (!optionalServices['air:OptionalService']) return [];
  
  return safeArray(optionalServices['air:OptionalService']).map(service => ({
    type: service.$?.Type,
    secondaryType: service.$?.SecondaryType,
    serviceSubCode: service.$?.ServiceSubCode,
    key: service.$?.Key,
    chargeable: service.$?.Chargeable,
    tag: service.$?.Tag,
    displayOrder: service.$?.DisplayOrder,
    description: service['common_v54_0:ServiceInfo']?.['common_v54_0:Description'],
    text: service['air:Text']?._,
    title: service['air:Title']?._
  }));
};

/**
 * Extract baggage from AirPricingInfo
 */
const extractBaggage = (pricingInfo) => {
  let checked = 'Not specified';
  let cabin = 'Not specified';
  
  const baggageAllowances = pricingInfo?.['air:BaggageAllowances'];
  if (baggageAllowances) {
    const baggageInfo = safeArray(baggageAllowances['air:BaggageAllowanceInfo']);
    if (baggageInfo.length > 0) {
      const textInfo = baggageInfo[0]['air:TextInfo']?.['air:Text'];
      if (textInfo) {
        const textArray = safeArray(textInfo);
        if (textArray[0]?._) {
          checked = textArray[0]._;
        } else if (textArray[0] && typeof textArray[0] === 'string') {
          checked = textArray[0];
        }
      }
    }
  }
  
  return { checked, cabin };
};

/**
 * Extract taxes from TaxInfo
 */
const extractTaxes = (taxInfo) => {
  if (!taxInfo) return [];
  
  return safeArray(taxInfo).map(tax => ({
    category: tax.$?.Category,
    amount: parsePrice(tax.$?.Amount),
    key: tax.$?.Key
  }));
};

/**
 * Extract penalties from ChangePenalty and CancelPenalty
 */
const extractPenalties = (pricingInfo) => {
  const penalties = { change: null, cancel: null };

  if (pricingInfo['air:ChangePenalty']) {
    const change = pricingInfo['air:ChangePenalty'];
    penalties.change = {
      amount: parsePrice(change['air:Amount']),
      percentage: change['air:Percentage'],
      noShow: change.$?.NoShow === 'true',
      applies: change.$?.PenaltyApplies
    };
  }

  if (pricingInfo['air:CancelPenalty']) {
    const cancel = pricingInfo['air:CancelPenalty'];
    penalties.cancel = {
      amount: parsePrice(cancel['air:Amount']),
      percentage: cancel['air:Percentage'],
      noShow: cancel.$?.NoShow === 'true',
      applies: cancel.$?.PenaltyApplies
    };
  }

  return penalties;
};

/**
 * Extract endorsements from FareInfo
 */
const extractEndorsements = (fareInfo) => {
  if (!fareInfo['common_v54_0:Endorsement']) return [];
  return safeArray(fareInfo['common_v54_0:Endorsement']).map(end => end.$?.Value);
};

/**
 * Extract booking info
 */
const extractBookingInfo = (bookingInfo) => {
  if (!bookingInfo) return [];
  
  return safeArray(bookingInfo).map(info => ({
    bookingCode: info.$?.BookingCode,
    cabinClass: info.$?.CabinClass,
    fareInfoRef: info.$?.FareInfoRef,
    segmentRef: info.$?.SegmentRef,
    hostTokenRef: info.$?.HostTokenRef
  }));
};

/**
 * Extract fare notes
 */
const extractFareNotes = (fareNotes) => {
  if (!fareNotes) return [];
  return safeArray(fareNotes).map(note => note._);
};

// ============================================================
// ONE-WAY TRANSFORMATION
// ============================================================

const transformPricingResponse = (apiResponse) => {
  try {
    console.log('\n🔍 transformPricingResponse (ONE WAY) - START');
    
    const data = apiResponse.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp'];
    if (!data) {
      console.error('❌ Could not find air:AirPriceRsp in response');
      throw new Error('Invalid pricing response structure');
    }
    
    console.log('✅ Found air:AirPriceRsp');
    console.log('   Data keys:', Object.keys(data));

    const warnings = extractWarnings(data);
    const segments = extractFlightSegments(data);
    const flightInfo = segments.length > 0 ? segments[0] : null;

    const pricingSolutions = safeArray(data['air:AirPriceResult']?.['air:AirPricingSolution']);
    console.log(`   Pricing Solutions found: ${pricingSolutions.length}`);
    
    const pricingOptions = pricingSolutions.map(solution => {
      const pricingInfo = solution['air:AirPricingInfo'];
      if (!pricingInfo) return null;
      
      const fareInfo = pricingInfo['air:FareInfo'];
      const bookingInfo = extractBookingInfo(pricingInfo['air:BookingInfo']);
      const taxInfo = pricingInfo['air:TaxInfo'];
      const baggageInfo = extractBaggage(pricingInfo);
      const penalties = extractPenalties(pricingInfo);
      const brand = fareInfo ? extractBrandFromFare(fareInfo) : null;
      
      return {
        key: solution.$?.Key,
        totalPrice: parsePrice(solution.$?.TotalPrice),
        basePrice: parsePrice(solution.$?.BasePrice),
        taxes: parsePrice(solution.$?.Taxes),
        formattedPrice: solution.$?.TotalPrice,
        segmentRefs: safeArray(solution['air:AirSegmentRef']).map(ref => ref.$?.Key),
        fareInfo: fareInfo ? {
          key: fareInfo.$?.Key,
          fareBasis: fareInfo.$?.FareBasis,
          amount: parsePrice(fareInfo.$?.Amount),
          taxAmount: parsePrice(fareInfo.$?.TaxAmount),
          passengerType: fareInfo.$?.PassengerTypeCode,
          origin: fareInfo.$?.Origin,
          destination: fareInfo.$?.Destination,
          effectiveDate: fareInfo.$?.EffectiveDate,
          departureDate: fareInfo.$?.DepartureDate,
          notValidBefore: fareInfo.$?.NotValidBefore,
          notValidAfter: fareInfo.$?.NotValidAfter,
          negotiatedFare: fareInfo.$?.NegotiatedFare === 'true',
          endorsements: extractEndorsements(fareInfo),
          fareRuleKey: fareInfo['air:FareRuleKey']?._
        } : null,
        brand,
        bookingInfo,
        taxBreakdown: extractTaxes(taxInfo),
        baggage: baggageInfo,
        penalties,
        fareCalc: pricingInfo['air:FareCalc'],
        refundable: pricingInfo.$?.Refundable === 'true',
        eticketable: pricingInfo.$?.ETicketability === 'Yes',
        platingCarrier: pricingInfo.$?.PlatingCarrier,
        providerCode: pricingInfo.$?.ProviderCode,
        latestTicketingTime: pricingInfo.$?.LatestTicketingTime,
        pricingMethod: pricingInfo.$?.PricingMethod,
        fareNotes: extractFareNotes(solution['air:FareNote']),
        feeInfo: solution['air:FeeInfo'] ? {
          amount: parsePrice(solution['air:FeeInfo'].$?.Amount),
          baseAmount: parsePrice(solution['air:FeeInfo'].$?.BaseAmount),
          description: solution['air:FeeInfo'].$?.Description,
          code: solution['air:FeeInfo'].$?.Code,
          subCode: solution['air:FeeInfo'].$?.SubCode,
          providerCode: solution['air:FeeInfo'].$?.ProviderCode,
          supplierCode: solution['air:FeeInfo'].$?.SupplierCode,
          passengerTypeCode: solution['air:FeeInfo'].$?.PassengerTypeCode
        } : null,
        hostTokens: safeArray(solution['common_v54_0:HostToken']).map(token => ({
          token: token._,
          key: token.$?.Key
        }))
      };
    }).filter(Boolean);

    console.log(`   Pricing Options after filtering: ${pricingOptions.length}`);
    
    pricingOptions.sort((a, b) => a.totalPrice - b.totalPrice);

    const result = {
      success: true,
      traceId: apiResponse.traceId,
      message: apiResponse.message,
      flight: flightInfo,
      pricingOptions,
      selectedOption: pricingOptions[0],
      currency: data.$?.CurrencyType || 'INR',
      count: pricingOptions.length,
      warnings
    };
    
    console.log('✅ transformPricingResponse completed successfully');
    return result;

  } catch (error) {
    console.error('❌ Error transforming pricing response:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// ROUND-TRIP TRANSFORMATION
// ============================================================

const transformRoundTripPricingResponse = (apiResponse) => {
  try {
    console.log('\n🔍 transformRoundTripPricingResponse (ROUND TRIP) - START');
    
    const data = apiResponse.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp'];
    if (!data) throw new Error('Invalid pricing response structure');

    const warnings = extractWarnings(data);
    const flightSegments = extractFlightSegments(data);
    const pricingSolutions = safeArray(data['air:AirPriceResult']?.['air:AirPricingSolution']);
    
    const pricingOptions = pricingSolutions.map(solution => {
      const pricingInfo = solution['air:AirPricingInfo'];
      if (!pricingInfo) return null;
      
      const fareInfoArray = safeArray(pricingInfo['air:FareInfo']);
      const bookingInfo = extractBookingInfo(pricingInfo['air:BookingInfo']);
      const taxInfo = pricingInfo['air:TaxInfo'];
      const baggageInfo = extractBaggage(pricingInfo);
      const penalties = extractPenalties(pricingInfo);
      const segmentRefs = safeArray(solution['air:AirSegmentRef']).map(ref => ref.$?.Key);
      
      const fareInfoProcessed = fareInfoArray.map(fareInfo => ({
        key: fareInfo.$?.Key,
        fareBasis: fareInfo.$?.FareBasis,
        amount: parsePrice(fareInfo.$?.Amount),
        taxAmount: parsePrice(fareInfo.$?.TaxAmount),
        passengerType: fareInfo.$?.PassengerTypeCode,
        origin: fareInfo.$?.Origin,
        destination: fareInfo.$?.Destination,
        effectiveDate: fareInfo.$?.EffectiveDate,
        departureDate: fareInfo.$?.DepartureDate,
        notValidBefore: fareInfo.$?.NotValidBefore,
        notValidAfter: fareInfo.$?.NotValidAfter,
        negotiatedFare: fareInfo.$?.NegotiatedFare === 'true',
        endorsements: extractEndorsements(fareInfo),
        fareRuleKey: fareInfo['air:FareRuleKey']?._,
        brand: extractBrandFromFare(fareInfo)
      }));
      
      const brands = fareInfoProcessed.map(f => f.brand).filter(b => b !== null);
      const allBrandsSame = brands.length > 0 && brands.every(b => b?.id === brands[0]?.id);
      
      return {
        key: solution.$?.Key,
        totalPrice: parsePrice(solution.$?.TotalPrice),
        basePrice: parsePrice(solution.$?.BasePrice),
        taxes: parsePrice(solution.$?.Taxes),
        fees: parsePrice(solution.$?.Fees),
        approximateTotalPrice: parsePrice(solution.$?.ApproximateTotalPrice),
        approximateBasePrice: parsePrice(solution.$?.ApproximateBasePrice),
        approximateTaxes: parsePrice(solution.$?.ApproximateTaxes),
        formattedPrice: solution.$?.TotalPrice,
        quoteDate: solution.$?.QuoteDate,
        segmentRefs,
        fareInfo: fareInfoProcessed,
        brand: allBrandsSame ? brands[0] : brands,
        bookingInfo,
        taxBreakdown: extractTaxes(taxInfo),
        baggage: baggageInfo,
        penalties,
        fareCalc: pricingInfo['air:FareCalc'],
        refundable: pricingInfo.$?.Refundable === 'true',
        eticketable: pricingInfo.$?.ETicketability === 'Yes',
        platingCarrier: pricingInfo.$?.PlatingCarrier,
        providerCode: pricingInfo.$?.ProviderCode,
        latestTicketingTime: pricingInfo.$?.LatestTicketingTime,
        pricingMethod: pricingInfo.$?.PricingMethod,
        includesVAT: pricingInfo.$?.IncludesVAT === 'true',
        fareNotes: extractFareNotes(solution['air:FareNote']),
        feeInfo: solution['air:FeeInfo'] ? {
          amount: parsePrice(solution['air:FeeInfo'].$?.Amount),
          baseAmount: parsePrice(solution['air:FeeInfo'].$?.BaseAmount),
          description: solution['air:FeeInfo'].$?.Description,
          code: solution['air:FeeInfo'].$?.Code,
          subCode: solution['air:FeeInfo'].$?.SubCode,
          providerCode: solution['air:FeeInfo'].$?.ProviderCode,
          supplierCode: solution['air:FeeInfo'].$?.SupplierCode,
          passengerTypeCode: solution['air:FeeInfo'].$?.PassengerTypeCode
        } : null,
        hostTokens: safeArray(solution['common_v54_0:HostToken']).map(token => ({
          token: token._,
          key: token.$?.Key
        })),
        passengerType: pricingInfo['air:PassengerType']?.$?.Code
      };
    }).filter(Boolean);

    pricingOptions.sort((a, b) => a.totalPrice - b.totalPrice);

    return {
      success: true,
      traceId: apiResponse.traceId,
      message: apiResponse.message,
      flight: flightSegments,
      pricingOptions,
      selectedOption: pricingOptions[0],
      currency: data.$?.CurrencyType || 'INR',
      count: pricingOptions.length,
      warnings,
      isRoundTrip: true
    };

  } catch (error) {
    console.error('❌ Error transforming round-trip pricing response:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// MAIN TRANSFORM FUNCTION
// ============================================================

const transformPricingResponseAuto = (apiResponse) => {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 TRANSFORM PRICING RESPONSE AUTO');
  console.log('='.repeat(80));
  console.log('   Input type:', typeof apiResponse);
  console.log('   Input keys:', apiResponse ? Object.keys(apiResponse) : 'null');
  
  // Try multiple paths to find the data
  let data = null;
  let foundPath = '';
  
  // Path 1: apiResponse.data.SOAP:Envelope.SOAP:Body.air:AirPriceRsp
  if (apiResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']) {
    data = apiResponse.data['SOAP:Envelope']['SOAP:Body']['air:AirPriceRsp'];
    foundPath = 'apiResponse.data.SOAP:Envelope.SOAP:Body.air:AirPriceRsp';
  }
  // Path 2: apiResponse.SOAP:Envelope.SOAP:Body.air:AirPriceRsp
  else if (apiResponse?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']) {
    data = apiResponse['SOAP:Envelope']['SOAP:Body']['air:AirPriceRsp'];
    foundPath = 'apiResponse.SOAP:Envelope.SOAP:Body.air:AirPriceRsp';
  }
  // Path 3: apiResponse.data.air:AirPriceRsp
  else if (apiResponse?.data?.['air:AirPriceRsp']) {
    data = apiResponse.data['air:AirPriceRsp'];
    foundPath = 'apiResponse.data.air:AirPriceRsp';
  }
  // Path 4: apiResponse.air:AirPriceRsp
  else if (apiResponse?.['air:AirPriceRsp']) {
    data = apiResponse['air:AirPriceRsp'];
    foundPath = 'apiResponse.air:AirPriceRsp';
  }
  
  console.log(`   Found data at: ${foundPath || 'NOT FOUND'}`);
  
  if (!data) {
    console.error('❌ Could not find air:AirPriceRsp in response');
    console.log('   Full response preview:', JSON.stringify(apiResponse, null, 2).substring(0, 1000));
    return { success: false, error: 'Invalid pricing response structure' };
  }
  
  console.log('✅ Data found successfully');
  console.log('   Data keys:', Object.keys(data));
  console.log('   Has AirItinerary:', !!data['air:AirItinerary']);
  console.log('   Has AirPriceResult:', !!data['air:AirPriceResult']);
  
  // Get segments to determine if round trip or one way
  const airSegments = data['air:AirItinerary']?.['air:AirSegment'];
  const segmentCount = airSegments ? (Array.isArray(airSegments) ? airSegments.length : 1) : 0;
  console.log(`   Segment count: ${segmentCount}`);
  
  // Create the wrapped response that the specific transformers expect
  const wrappedResponse = {
    data: {
      'SOAP:Envelope': {
        'SOAP:Body': {
          'air:AirPriceRsp': data
        }
      }
    }
  };
  
  // Add traceId and message to the wrapped response
  if (apiResponse.traceId) wrappedResponse.traceId = apiResponse.traceId;
  if (apiResponse.message) wrappedResponse.message = apiResponse.message;
  
  console.log(`   Processing as: ${segmentCount > 1 ? 'ROUND TRIP' : 'ONE WAY'}`);
  console.log('='.repeat(80) + '\n');
  
  if (segmentCount > 1) {
    return transformRoundTripPricingResponse(wrappedResponse);
  } else {
    return transformPricingResponse(wrappedResponse);
  }
};

// ============================================================
// BUILD REQUEST FUNCTIONS
// ============================================================

export const buildOneWayPricingRequest = (flight, selectedFare, passengerCounts) => {
  const is6E = flight.airlineCode === '6E';
  
  let segments = [];
  
  if (flight.segments && flight.segments.length > 0) {
    segments = flight.segments;
  } else if (flight.segmentKey) {
    segments = [flight];
  } else if (flight.key) {
    segments = [{ ...flight, segmentKey: flight.key }];
  } else {
    console.error('❌ No segments found in flight object:', flight);
    return null;
  }

  const normalizedSegments = segments.map(seg => ({
    ...seg,
    segmentKey: seg.segmentKey || seg.key
  }));

  let hostTokenString = selectedFare.hostToken;
  let hostTokenRefString = selectedFare.hostTokenRef;
  
  if (hostTokenString && typeof hostTokenString === 'object') {
    hostTokenString = hostTokenString.token || null;
  }

  const requestBody = {
    currencyCode: "INR",
    traceId: flight.traceId || `BOBROS-${Date.now()}`,
    segments: normalizedSegments.map((seg) => ({
      segmentKey: seg.segmentKey,
      carrier: seg.carrier,
      flightNumber: seg.flightNumber,
      origin: seg.origin,
      destination: seg.destination,
      departureTime: seg.departureTime,
      arrivalTime: seg.arrivalTime,
      flightTime: seg.duration?.toString() || seg.flightTime,
      equipment: seg.equipment,
      changeOfPlane: "false",
      optionalServicesIndicator: "false",
      ...(is6E ? {
        status: seg.status || "KK",
        supplierCode: seg.supplierCode || "6E"
      } : {
        ETicketability: "Yes",
        LinkAvailability: "true",
        PolledAvailabilityOption: "Polled avail used",
        AvailabilitySource: "S",
        ParticipantLevel: "Secure Sell",
        AvailabilityDisplayType: "Fare Shop/Optimal Shop"
      }),
      group: 0
    })),
    passengers: [
      { code: 'ADT', count: passengerCounts.ADT || 1 },
      ...(passengerCounts.CNN ? [{ code: 'CNN', count: passengerCounts.CNN }] : []),
      ...(passengerCounts.INF ? [{ code: 'INF', count: passengerCounts.INF }] : [])
    ],
    bookingRequirements: normalizedSegments.map((seg) => {
      const bookingReq = {
        segmentKey: seg.segmentKey,
        bookingCode: selectedFare.bookingCode,
        fareBasis: selectedFare.fareBasis
      };
      
      if (is6E && hostTokenString) {
        bookingReq.hostToken = hostTokenString;
        if (hostTokenRefString) {
          bookingReq.hostTokenRef = hostTokenRefString;
        }
      }
      
      return bookingReq;
    })
  };

  return requestBody;
};

export const buildRoundTripPricingRequest = (outboundFlight, outboundFare, returnFlight, returnFare, passengerCounts) => {
  // Normalize outbound segments
  let outboundSegments = outboundFlight?.segments || [outboundFlight];
  outboundSegments = outboundSegments.map((seg) => ({
    ...seg,
    segmentKey: seg.segmentKey || seg.key,
    flightTime: seg.duration?.toString() || seg.flightTime,
    status: seg.status || "KK",
    supplierCode: seg.supplierCode || "6E"
  }));
  
  // Normalize return segments
  let returnSegments = returnFlight?.segments || [returnFlight];
  returnSegments = returnSegments.map(seg => ({
    ...seg,
    segmentKey: seg.segmentKey || seg.key,
    flightTime: seg.duration?.toString() || seg.flightTime,
    status: seg.status || "KK",
    supplierCode: seg.supplierCode || "6E"
  }));
  
  const outboundIs6E = outboundSegments[0]?.carrier === '6E';
  const returnIs6E = returnSegments[0]?.carrier === '6E';
  
  const bookingRequirements = [];
  
  // ============ OUTBOUND BOOKING REQUIREMENTS ============
  outboundSegments.forEach((seg) => {
    const segmentKey = seg.segmentKey;
    
    let hostTokenString = null;
    let hostTokenRefString = null;
    
    // Get from fare's segments array (most reliable)
    if (outboundFare.segments && outboundFare.segments.length > 0) {
      const segmentData = outboundFare.segments.find(s => s.segmentKey === segmentKey);
      if (segmentData) {
        hostTokenString = segmentData.hostToken;
        hostTokenRefString = segmentData.hostTokenRef;
      }
    }
    
    // Fallback to maps if segment not found
    if (!hostTokenString && outboundFare.hostTokenMap) {
      hostTokenString = outboundFare.hostTokenMap[segmentKey];
      hostTokenRefString = outboundFare.hostTokenRefMap?.[segmentKey];
    }
    
    const bookingReq = {
      segmentKey: segmentKey,
      bookingCode: outboundFare.bookingCode || seg.bookingCode,
      fareBasis: outboundFare.fareBasis
    };
    
    // For 6E flights, add both hostToken and hostTokenRef
    if (outboundIs6E && hostTokenString) {
      bookingReq.hostToken = hostTokenString;
      if (hostTokenRefString) {
        bookingReq.hostTokenRef = hostTokenRefString;
      }
    }
    
    bookingRequirements.push(bookingReq);
  });
  
  // ============ RETURN BOOKING REQUIREMENTS ============
  returnSegments.forEach((seg) => {
    const segmentKey = seg.segmentKey;
    
    let hostTokenString = null;
    let hostTokenRefString = null;
    
    if (returnFare.segments && returnFare.segments.length > 0) {
      const segmentData = returnFare.segments.find(s => s.segmentKey === segmentKey);
      if (segmentData) {
        hostTokenString = segmentData.hostToken;
        hostTokenRefString = segmentData.hostTokenRef;
      }
    }
    
    if (!hostTokenString && returnFare.hostTokenMap) {
      hostTokenString = returnFare.hostTokenMap[segmentKey];
      hostTokenRefString = returnFare.hostTokenRefMap?.[segmentKey];
    }
    
    const bookingReq = {
      segmentKey: segmentKey,
      bookingCode: returnFare.bookingCode || seg.bookingCode,
      fareBasis: returnFare.fareBasis
    };
    
    if (returnIs6E && hostTokenString) {
      bookingReq.hostToken = hostTokenString;
      if (hostTokenRefString) {
        bookingReq.hostTokenRef = hostTokenRefString;
      }
    }
    
    bookingRequirements.push(bookingReq);
  });
  
  // ============ BUILD FINAL REQUEST ============
  const requestBody = {
    currencyCode: "INR",
    traceId: `PRC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    segments: [
      ...outboundSegments.map(seg => ({
        segmentKey: seg.segmentKey,
        carrier: seg.carrier,
        flightNumber: seg.flightNumber,
        origin: seg.origin,
        destination: seg.destination,
        departureTime: seg.departureTime,
        arrivalTime: seg.arrivalTime,
        flightTime: seg.flightTime,
        equipment: seg.equipment,
        changeOfPlane: "false",
        optionalServicesIndicator: "false",
        ...(outboundIs6E ? {
          status: seg.status || "KK",
          supplierCode: seg.supplierCode || "6E"
        } : {
          ETicketability: "Yes",
          LinkAvailability: "true",
          PolledAvailabilityOption: "Polled avail used",
          AvailabilitySource: "S",
          ParticipantLevel: "Secure Sell",
          AvailabilityDisplayType: "Fare Shop/Optimal Shop"
        }),
        group: 0
      })),
      ...returnSegments.map(seg => ({
        segmentKey: seg.segmentKey,
        carrier: seg.carrier,
        flightNumber: seg.flightNumber,
        origin: seg.origin,
        destination: seg.destination,
        departureTime: seg.departureTime,
        arrivalTime: seg.arrivalTime,
        flightTime: seg.flightTime,
        equipment: seg.equipment,
        changeOfPlane: "false",
        optionalServicesIndicator: "false",
        ...(returnIs6E ? {
          status: seg.status || "KK",
          supplierCode: seg.supplierCode || "6E"
        } : {
          ETicketability: "Yes",
          LinkAvailability: "true",
          PolledAvailabilityOption: "Polled avail used",
          AvailabilitySource: "S",
          ParticipantLevel: "Secure Sell",
          AvailabilityDisplayType: "Fare Shop/Optimal Shop"
        }),
        group: 1
      }))
    ],
    passengers: [
      { code: 'ADT', count: passengerCounts.ADT || 1 },
      ...(passengerCounts.CNN ? [{ code: 'CNN', count: passengerCounts.CNN }] : []),
      ...(passengerCounts.INF ? [{ code: 'INF', count: passengerCounts.INF }] : [])
    ],
    bookingRequirements
  };
  
  return requestBody;
};

// ============================================================
// MAIN API FUNCTION
// ============================================================

export const getFlightPricing = async (pricingRequest) => {
  try {
    const apiUrl = `${BASE_URL}/flights/airpricing`;
    
    // ============ CLEAR REQUEST LOG ============
    console.log('\n' + '='.repeat(80));
    console.log('📤 PRICING API REQUEST');
    console.log('='.repeat(80));
    console.log('📍 URL:', apiUrl);
    console.log('📋 Request Body:');
    console.log(JSON.stringify(pricingRequest, null, 2));
    console.log('='.repeat(80) + '\n');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(pricingRequest)
    });

    // ============ CLEAR RESPONSE METADATA LOG ============
    console.log('\n' + '='.repeat(80));
    console.log('📥 PRICING API RESPONSE');
    console.log('='.repeat(80));
    console.log('📊 Status:', response.status, response.statusText);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    console.log('='.repeat(80));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error Response Body:');
      console.log('```json');
      console.log(errorText);
      console.log('```');
      console.log('='.repeat(80) + '\n');
      throw new Error(`Pricing API Error: ${response.status} - ${errorText}`);
    }

    // Get the raw response
    const rawResponse = await response.json();
    
    // ============ LOG THE COMPLETE RAW RESPONSE ============
    console.log('\n' + '='.repeat(80));
    console.log('📦 COMPLETE RAW API RESPONSE');
    console.log('='.repeat(80));
    console.log('🔍 Response Type:', typeof rawResponse);
    console.log('🔍 Response Keys:', rawResponse ? Object.keys(rawResponse) : 'null');
    console.log('🔍 Has data property:', !!rawResponse.data);
    console.log('🔍 Has success property:', !!rawResponse.success);
    console.log('🔍 Has traceId property:', !!rawResponse.traceId);
    console.log('🔍 Has message property:', !!rawResponse.message);
    
    // Log the complete response with full depth - FOR COPYING
    console.log('\n📄 COMPLETE RESPONSE BODY (COPY THIS):');
    console.log('```json');
    console.log(JSON.stringify(rawResponse, null, 2));
    console.log('```');
    console.log('='.repeat(80) + '\n');
    
    // Log the structure for debugging
    if (rawResponse?.data?.['SOAP:Envelope']) {
      console.log('✅ Found SOAP:Envelope structure');
      console.log('   - SOAP:Envelope keys:', Object.keys(rawResponse.data['SOAP:Envelope']));
      
      const soapBody = rawResponse.data['SOAP:Envelope']['SOAP:Body'];
      if (soapBody) {
        console.log('   - SOAP:Body keys:', Object.keys(soapBody));
        
        const airPriceRsp = soapBody['air:AirPriceRsp'];
        if (airPriceRsp) {
          console.log('   - air:AirPriceRsp keys:', Object.keys(airPriceRsp));
          console.log('   - Has AirItinerary:', !!airPriceRsp['air:AirItinerary']);
          console.log('   - Has AirPriceResult:', !!airPriceRsp['air:AirPriceResult']);
          
          const pricingSolutions = airPriceRsp['air:AirPriceResult']?.['air:AirPricingSolution'];
          if (pricingSolutions) {
            const solutionsArray = Array.isArray(pricingSolutions) ? pricingSolutions : [pricingSolutions];
            console.log(`   - Number of pricing solutions: ${solutionsArray.length}`);
            
            // Log first solution price for quick reference
            if (solutionsArray.length > 0 && solutionsArray[0]?.$?.TotalPrice) {
              console.log(`   - First solution price: ${solutionsArray[0].$.TotalPrice}`);
            }
          }
        }
      }
    } else if (rawResponse?.error) {
      console.log('❌ Server returned error response');
      console.log('   - Error:', rawResponse.error);
      console.log('   - Message:', rawResponse.message);
    } else {
      console.log('⚠️ Unknown response structure');
    }
    
    console.log('='.repeat(80) + '\n');

    // ============ TRANSFORMATION ============
    console.log('🔄 Transforming response...');
    const transformed = transformPricingResponseAuto(rawResponse);
    
    if (!transformed.success) {
      console.log('❌ Transformation failed:', transformed.error);
      console.log('='.repeat(80) + '\n');
      throw new Error(transformed.error || 'Failed to transform pricing response');
    }
    
    // ============ TRANSFORMATION RESULT LOG ============
    console.log('✅ Transformation successful!');
    console.log('   - Trip Type:', transformed.isRoundTrip ? 'Round Trip' : 'One Way');
    console.log('   - Pricing Options:', transformed.count);
    console.log('   - Currency:', transformed.currency);
    if (transformed.pricingOptions && transformed.pricingOptions.length > 0) {
      const firstOption = transformed.pricingOptions[0];
      console.log('   - First Option Price:', firstOption.formattedPrice);
      console.log('   - First Option Key:', firstOption.key);
      if (firstOption.brand) {
        console.log('   - First Option Brand:', firstOption.brand.name);
      }
    }
    if (transformed.warnings && transformed.warnings.length > 0) {
      console.log(`   - Warnings: ${transformed.warnings.length}`);
      transformed.warnings.slice(0, 3).forEach((w, i) => {
        console.log(`     ${i+1}. ${w.message}`);
      });
    }
    console.log('='.repeat(80) + '\n');

    // ✅ Return BOTH transformed data AND raw response
    return { 
      success: true, 
      data: transformed,
      rawResponse: rawResponse
    };

  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ PRICING API ERROR');
    console.error('='.repeat(80));
    console.error('   Error Name:', error.name);
    console.error('   Error Message:', error.message);
    if (error.stack) {
      console.error('   Error Stack:', error.stack);
    }
    console.error('='.repeat(80) + '\n');
    
    return { 
      success: false, 
      error: error.message,
      userMessage: 'Unable to get flight prices. Please check your connection and try again.'
    };
  }
};

// ============================================================
// EXPORTS
// ============================================================

export {
  transformPricingResponse,
  transformRoundTripPricingResponse,
  transformPricingResponseAuto
};