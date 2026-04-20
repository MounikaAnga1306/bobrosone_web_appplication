// src/modules/flights/services/pricingService.js

import { safeArray, parsePrice, generateUniqueId } from '../utils/airPricingHelper';

const BASE_URL = 'https://api.bobros.org';

// Global reference to context setter (will be initialized once)
let globalSetRawPricingResponse = null;

// ============================================================
// FUNCTION TO INITIALIZE CONTEXT SETTER (CALL ONCE FROM APP)
// ============================================================
export const initializePricingContext = (setRawPricingResponseFn) => {
  globalSetRawPricingResponse = setRawPricingResponseFn;
  console.log('✅ Pricing Service: Context setter initialized');
};

// ============================================================
// UTILITY FUNCTIONS (KEPT AS IS - NO CHANGES)
// ============================================================

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

const extractFlightSegments = (data) => {
  const airSegments = data['air:AirItinerary']?.['air:AirSegment'];
  if (!airSegments) return [];
  const segments = safeArray(airSegments);
  return segments.map(segment => ({
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
    status: segment.$?.Status,
    supplierCode: segment.$?.SupplierCode,
    originTerminal: segment.$?.OriginTerminal,
    destinationTerminal: segment.$?.DestinationTerminal,
    codeshareInfo: segment['air:CodeshareInfo'] ? {
      operatingCarrier: segment['air:CodeshareInfo'].$?.OperatingCarrier,
      operatingCarrierName: segment['air:CodeshareInfo']._
    } : null,
    flightDetails: segment['air:FlightDetails'] ? {
      key: segment['air:FlightDetails'].$?.Key,
      origin: segment['air:FlightDetails'].$?.Origin,
      destination: segment['air:FlightDetails'].$?.Destination,
      departureTime: segment['air:FlightDetails'].$?.DepartureTime,
      arrivalTime: segment['air:FlightDetails'].$?.ArrivalTime,
      flightTime: segment['air:FlightDetails'].$?.FlightTime,
      travelTime: segment['air:FlightDetails'].$?.TravelTime,
      distance: segment['air:FlightDetails'].$?.Distance
    } : null
  }));
};

const extractBrandFromFare = (fareInfo) => {
  if (!fareInfo || !fareInfo['air:Brand']) return null;
  const brand = fareInfo['air:Brand'];
  const titles = {};
  const texts = {};
  const allTexts = [];
  
  if (brand['air:Title']) {
    safeArray(brand['air:Title']).forEach(title => {
      const type = title.$?.Type?.toLowerCase();
      if (type) titles[type] = title._;
      else titles.external = title._;
    });
  }
  
  if (brand['air:Text']) {
    safeArray(brand['air:Text']).forEach(text => {
      const type = text.$?.Type?.toLowerCase();
      const content = text._;
      if (type) texts[type] = content;
      allTexts.push({ type, content });
    });
  }
  
  const features = [];
  const upsellText = texts.upsell || texts.marketingconsumer;
  if (upsellText) {
    const lines = upsellText.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        features.push(trimmed.replace(/^-\s*/, ''));
      } else if (trimmed && !trimmed.includes('http') && trimmed.length < 200 && !trimmed.startsWith('*')) {
        if (!features.includes(trimmed) && trimmed.length > 10) {
          features.push(trimmed);
        }
      }
    });
  }
  
  let cancellationPolicy = null;
  let changePolicy = null;
  if (texts.marketingagent || texts.upsell) {
    const agentText = texts.marketingagent || texts.upsell || '';
    if (agentText.toLowerCase().includes('cancel')) cancellationPolicy = agentText;
    if (agentText.toLowerCase().includes('change') || agentText.toLowerCase().includes('reschedule')) changePolicy = agentText;
  }
  
  return {
    id: brand.$?.BrandID,
    name: brand.$?.Name,
    tier: brand.$?.BrandTier,
    carrier: brand.$?.Carrier,
    titles,
    texts,
    allTexts,
    features,
    cancellationPolicy,
    changePolicy,
    description: texts.strapline || texts.external || brand.$?.Name,
    externalName: titles.external || brand.$?.Name,
    shortName: titles.short || brand.$?.Name,
    imageLocations: brand['air:ImageLocation'] ? safeArray(brand['air:ImageLocation']).map(img => ({
      url: img._,
      type: img.$?.Type,
      width: img.$?.ImageWidth,
      height: img.$?.ImageHeight
    })) : [],
    optionalServices: brand['air:OptionalServices'] ? extractOptionalServices(brand['air:OptionalServices']) : null
  };
};

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
    price: parsePrice(service.$?.TotalPrice),
    basePrice: parsePrice(service.$?.BasePrice),
    taxes: parsePrice(service.$?.Taxes),
    quantity: service.$?.Quantity,
    description: service['common_v54_0:ServiceInfo']?.['common_v54_0:Description'],
    text: service['air:Text']?._,
    title: service['air:Title']?._
  }));
};

const extractBaggageForPassengerType = (pricingInfo, passengerType) => {
  let checked = { weight: '15', unit: 'kg', pieces: 1 };
  let cabin = { weight: '7', unit: 'kg', pieces: 1 };
  
  const baggageAllowances = pricingInfo?.['air:BaggageAllowances'];
  if (baggageAllowances) {
    const baggageInfo = safeArray(baggageAllowances['air:BaggageAllowanceInfo']);
    baggageInfo.forEach(info => {
      const travelerType = info.$?.TravelerType;
      if (travelerType === passengerType) {
        const weight = info['air:MaxWeight'];
        if (weight) {
          const weightValue = weight.$?.Value;
          const weightUnit = weight.$?.Unit;
          checked = { weight: weightValue || '15', unit: weightUnit || 'kg', pieces: info.$?.NumberOfPieces || 1, description: info['air:TextInfo']?.['air:Text']?._ };
        }
      }
    });
    
    const carryOnInfo = safeArray(baggageAllowances['air:CarryOnAllowanceInfo']);
    carryOnInfo.forEach(info => {
      const travelerType = info.$?.TravelerType;
      if (travelerType === passengerType) {
        const textInfo = info['air:TextInfo']?.['air:Text'];
        const text = Array.isArray(textInfo) ? textInfo[0] : textInfo;
        if (text) {
          const weightMatch = text.match(/(\d+)K/);
          if (weightMatch) {
            cabin = { weight: weightMatch[1], unit: 'kg', pieces: 1, description: text };
          }
        }
      }
    });
  }
  return { checked, cabin };
};

const extractBaggage = (pricingInfo) => {
  return extractBaggageForPassengerType(pricingInfo, 'ADT');
};

const taxCategoryMap = {
  'RCF': 'Reservation & Cancellation Fee',
  'ASF': 'Airport Security Fee',
  'UDF': 'User Development Fee',
  'TTF': 'Transport Tax Fee',
  'YQ': 'Fuel Surcharge',
  'UDFA': 'User Development Fee (Additional)',
  '36GST': 'GST',
  'PHF': 'Passenger Handling Fee'
};

const extractTaxes = (taxInfo) => {
  if (!taxInfo) return [];
  return safeArray(taxInfo).map(tax => ({
    category: tax.$?.Category,
    carrierDefinedCategory: tax.$?.CarrierDefinedCategory,
    name: taxCategoryMap[tax.$?.CarrierDefinedCategory] || taxCategoryMap[tax.$?.Category] || `${tax.$?.CarrierDefinedCategory || tax.$?.Category} Tax`,
    amount: parsePrice(tax.$?.Amount),
    key: tax.$?.Key,
    providerCode: tax.$?.ProviderCode,
    supplierCode: tax.$?.SupplierCode
  }));
};

const extractPenalties = (pricingInfo) => {
  const penalties = { change: null, cancel: null };
  if (pricingInfo['air:ChangePenalty']) {
    const change = pricingInfo['air:ChangePenalty'];
    penalties.change = { amount: parsePrice(change['air:Amount']), percentage: change['air:Percentage'], noShow: change.$?.NoShow === 'true', applies: change.$?.PenaltyApplies };
  }
  if (pricingInfo['air:CancelPenalty']) {
    const cancel = pricingInfo['air:CancelPenalty'];
    penalties.cancel = { amount: parsePrice(cancel['air:Amount']), percentage: cancel['air:Percentage'], noShow: cancel.$?.NoShow === 'true', applies: cancel.$?.PenaltyApplies };
  }
  return penalties;
};

const extractEndorsements = (fareInfo) => {
  if (!fareInfo['common_v54_0:Endorsement']) return [];
  return safeArray(fareInfo['common_v54_0:Endorsement']).map(end => end.$?.Value);
};

const extractBookingInfo = (bookingInfo) => {
  if (!bookingInfo) return [];
  return safeArray(bookingInfo).map(info => ({
    bookingCode: info.$?.BookingCode,
    cabinClass: info.$?.CabinClass,
    fareInfoRef: info.$?.FareInfoRef,
    segmentRef: info.$?.SegmentRef,
    hostTokenRef: info.$?.HostTokenRef,
    bookingCount: info.$?.BookingCount
  }));
};

const extractFareNotes = (fareNotes) => {
  if (!fareNotes) return [];
  return safeArray(fareNotes).map(note => note._);
};

const extractSolutionOptionalServices = (solution) => {
  const optionalServices = solution['air:OptionalServices'];
  if (!optionalServices) return { included: [], available: [] };
  
  const included = [];
  const available = [];
  const services = safeArray(optionalServices['air:OptionalService']);
  
  services.forEach(service => {
    const serviceType = service.$?.Type;
    const chargeable = service.$?.Chargeable;
    const price = parsePrice(service.$?.TotalPrice);
    
    let serviceName = '';
    let serviceDesc = '';
    
    if (service['air:BrandingInfo'] && service['air:BrandingInfo']['air:Title']) {
      serviceName = service['air:BrandingInfo']['air:Title']._ || service['air:BrandingInfo']['air:Title'];
    } else if (service.$?.DisplayText) {
      serviceName = service.$?.DisplayText.split(',')[0];
    }
    
    if (service['common_v54_0:ServiceInfo']) {
      const serviceInfo = service['common_v54_0:ServiceInfo'];
      serviceDesc = serviceInfo['common_v54_0:Description'] || '';
      if (Array.isArray(serviceDesc)) serviceDesc = serviceDesc[0];
    }
    
    const serviceItem = { type: serviceType, name: serviceName || serviceType, description: serviceDesc, price: price, chargeable: chargeable, quantity: service.$?.Quantity || 1, displayText: service.$?.DisplayText, providerDefinedType: service.$?.ProviderDefinedType };
    
    if (chargeable === 'Included in the brand') {
      included.push(serviceItem);
    } else if (price > 0 || chargeable === 'Available for a charge') {
      available.push(serviceItem);
    }
  });
  return { included, available };
};

const extractPassengerTypeFromPricingInfo = (pricingInfo) => {
  const passengerTypeCode = pricingInfo['air:PassengerType']?.$?.Code;
  if (passengerTypeCode) return passengerTypeCode;
  const fareInfo = pricingInfo['air:FareInfo'];
  if (fareInfo?.$?.PassengerTypeCode) return fareInfo.$?.PassengerTypeCode;
  return 'ADT';
};

const extractPassengerPricingData = (pricingInfo) => {
  const passengerType = extractPassengerTypeFromPricingInfo(pricingInfo);
  const fareInfo = pricingInfo['air:FareInfo'];
  const bookingInfo = pricingInfo['air:BookingInfo'];
  const taxInfo = pricingInfo['air:TaxInfo'];
  const attributes = pricingInfo.$ || {};
  
  return {
    passengerType,
    totalPrice: parsePrice(attributes.TotalPrice),
    basePrice: parsePrice(attributes.BasePrice),
    taxes: parsePrice(attributes.Taxes),
    formattedPrice: attributes.TotalPrice,
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
      promotionalFare: fareInfo.$?.PromotionalFare === 'true',
      fareFamily: fareInfo.$?.FareFamily,
      supplierCode: fareInfo.$?.SupplierCode,
      endorsements: extractEndorsements(fareInfo),
      fareRuleKey: fareInfo['air:FareRuleKey']?._
    } : null,
    bookingInfo: extractBookingInfo(bookingInfo),
    taxBreakdown: extractTaxes(taxInfo),
    baggage: extractBaggageForPassengerType(pricingInfo, passengerType),
    penalties: extractPenalties(pricingInfo),
    refundable: attributes.Refundable === 'true',
    eticketable: attributes.ETicketability === 'Yes',
    platingCarrier: attributes.PlatingCarrier,
    providerCode: attributes.ProviderCode,
    latestTicketingTime: attributes.LatestTicketingTime,
    pricingMethod: attributes.PricingMethod,
    fareCalc: pricingInfo['air:FareCalc']
  };
};

const extractPassengerHostTokens = (solution) => {
  const hostTokens = safeArray(solution['common_v54_0:HostToken']);
  const passengerHostTokens = {
    ADT: null,
    CNN: null,
    INF: null
  };
  
  hostTokens.forEach(token => {
    const tokenValue = token._ || '';
    const tokenKey = token.$?.Key;
    
    if (tokenValue.includes('ADT')) {
      passengerHostTokens.ADT = { token: tokenValue, key: tokenKey };
    } else if (tokenValue.includes('CNN')) {
      passengerHostTokens.CNN = { token: tokenValue, key: tokenKey };
    } else if (tokenValue.includes('INF')) {
      passengerHostTokens.INF = { token: tokenValue, key: tokenKey };
    }
  });
  
  const existingTokens = {};
  Object.keys(passengerHostTokens).forEach(key => {
    if (passengerHostTokens[key] !== null) {
      existingTokens[key] = passengerHostTokens[key];
    }
  });
  
  return existingTokens;
};

// ============================================================
// ONE-WAY TRANSFORMATION (MODIFIED TO ACCEPT RAW RESPONSE)
// ============================================================

const transformPricingResponse = (apiResponse, rawResponse) => {
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
      const pricingInfoArray = safeArray(solution['air:AirPricingInfo']);
      if (!pricingInfoArray || pricingInfoArray.length === 0) return null;
      
      const passengerPricingMap = {};
      let primaryPricingInfo = null;
      
      pricingInfoArray.forEach(pricingInfo => {
        const passengerData = extractPassengerPricingData(pricingInfo);
        const passengerType = passengerData.passengerType;
        passengerPricingMap[passengerType] = passengerData;
        
        if (passengerType === 'ADT' || (!primaryPricingInfo && passengerType !== 'CNN' && passengerType !== 'INF')) {
          primaryPricingInfo = passengerData;
        }
      });
      
      const passengerHostTokens = extractPassengerHostTokens(solution);
      const primaryFareInfo = primaryPricingInfo?.fareInfo;
      const primaryBookingInfo = primaryPricingInfo?.bookingInfo;
      const primaryTaxInfo = primaryPricingInfo?.taxBreakdown;
      const primaryBaggage = primaryPricingInfo?.baggage;
      const primaryPenalties = primaryPricingInfo?.penalties;
      const primaryBrand = primaryFareInfo ? extractBrandFromFare(primaryFareInfo) : null;
      
      const optionalServices = extractSolutionOptionalServices(solution);
      const segmentRefs = safeArray(solution['air:AirSegmentRef']).map(ref => ref.$?.Key);
      
      return {
        key: solution.$?.Key,
        totalPrice: parsePrice(solution.$?.TotalPrice),
        basePrice: parsePrice(solution.$?.BasePrice),
        taxes: parsePrice(solution.$?.Taxes),
        formattedPrice: solution.$?.TotalPrice,
        segmentRefs,
        passengerPricing: passengerPricingMap,
        passengerHostTokens: passengerHostTokens,
        passengerTypes: Object.keys(passengerPricingMap),
        fareInfo: primaryFareInfo,
        brand: primaryBrand,
        bookingInfo: primaryBookingInfo,
        taxBreakdown: primaryTaxInfo,
        baggage: primaryBaggage,
        penalties: primaryPenalties,
        optionalServices,
        fareCalc: primaryPricingInfo?.fareCalc,
        refundable: primaryPricingInfo?.refundable || false,
        eticketable: primaryPricingInfo?.eticketable || false,
        platingCarrier: primaryPricingInfo?.platingCarrier,
        providerCode: primaryPricingInfo?.providerCode,
        latestTicketingTime: primaryPricingInfo?.latestTicketingTime,
        pricingMethod: primaryPricingInfo?.pricingMethod,
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
        hostTokens: safeArray(solution['common_v54_0:HostToken']).map(token => ({ token: token._, key: token.$?.Key }))
      };
    }).filter(Boolean);

    pricingOptions.sort((a, b) => a.totalPrice - b.totalPrice);

    if (pricingOptions.length > 0 && pricingOptions[0].passengerTypes) {
      console.log(`   Passenger types found: ${pricingOptions[0].passengerTypes.join(', ')}`);
      Object.keys(pricingOptions[0].passengerPricing).forEach(type => {
        const p = pricingOptions[0].passengerPricing[type];
        console.log(`   - ${type}: ₹${p.totalPrice}, Fare Basis: ${p.fareInfo?.fareBasis || 'N/A'}, Baggage: ${p.baggage?.checked?.weight}kg`);
      });
    }

    return {
      success: true,
      traceId: apiResponse.traceId,
      message: apiResponse.message,
      flight: flightInfo,
      flightSegments: segments,
      pricingOptions,
      selectedOption: pricingOptions[0],
      currency: data.$?.CurrencyType || 'INR',
      count: pricingOptions.length,
      warnings,
      rawResponse: rawResponse // Include raw response in transformed data
    };

  } catch (error) {
    console.error('❌ Error transforming pricing response:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// ROUND TRIP TRANSFORMATION (MODIFIED TO ACCEPT RAW RESPONSE)
// ============================================================

const transformRoundTripPricingResponse = (apiResponse, rawResponse) => {
  try {
    console.log('\n🔍 transformRoundTripPricingResponse (ROUND TRIP) - START');
    const data = apiResponse.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp'];
    if (!data) throw new Error('Invalid pricing response structure');
    
    const warnings = extractWarnings(data);
    const flightSegments = extractFlightSegments(data);
    const pricingSolutions = safeArray(data['air:AirPriceResult']?.['air:AirPricingSolution']);
    
    const pricingOptions = pricingSolutions.map(solution => {
      const pricingInfoArray = safeArray(solution['air:AirPricingInfo']);
      if (!pricingInfoArray || pricingInfoArray.length === 0) return null;
      
      const passengerPricingMap = {};
      let primaryPricingInfo = null;
      
      pricingInfoArray.forEach(pricingInfo => {
        const passengerData = extractPassengerPricingData(pricingInfo);
        const passengerType = passengerData.passengerType;
        passengerPricingMap[passengerType] = passengerData;
        
        if (passengerType === 'ADT' || (!primaryPricingInfo && passengerType !== 'CNN' && passengerType !== 'INF')) {
          primaryPricingInfo = passengerData;
        }
      });
      
      const passengerHostTokens = extractPassengerHostTokens(solution);
      const segmentRefs = safeArray(solution['air:AirSegmentRef']).map(ref => ref.$?.Key);
      const optionalServices = extractSolutionOptionalServices(solution);
      const primaryFareInfo = primaryPricingInfo?.fareInfo;
      const primaryBrand = primaryFareInfo ? extractBrandFromFare(primaryFareInfo) : null;
      
      const fareInfoArray = pricingInfoArray.map(p => p.fareInfo).filter(Boolean);
      const brands = fareInfoArray.map(f => f?.brand ? extractBrandFromFare(f) : null).filter(Boolean);
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
        passengerPricing: passengerPricingMap,
        passengerHostTokens: passengerHostTokens,
        passengerTypes: Object.keys(passengerPricingMap),
        fareInfo: fareInfoArray,
        brand: allBrandsSame ? brands[0] : brands,
        bookingInfo: primaryPricingInfo?.bookingInfo,
        taxBreakdown: primaryPricingInfo?.taxBreakdown,
        baggage: primaryPricingInfo?.baggage,
        penalties: primaryPricingInfo?.penalties,
        optionalServices,
        fareCalc: primaryPricingInfo?.fareCalc,
        refundable: primaryPricingInfo?.refundable || false,
        eticketable: primaryPricingInfo?.eticketable || false,
        platingCarrier: primaryPricingInfo?.platingCarrier,
        providerCode: primaryPricingInfo?.providerCode,
        latestTicketingTime: primaryPricingInfo?.latestTicketingTime,
        pricingMethod: primaryPricingInfo?.pricingMethod,
        includesVAT: primaryPricingInfo?.includesVAT || false,
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
        hostTokens: safeArray(solution['common_v54_0:HostToken']).map(token => ({ token: token._, key: token.$?.Key })),
        passengerType: primaryPricingInfo?.passengerType
      };
    }).filter(Boolean);

    pricingOptions.sort((a, b) => a.totalPrice - b.totalPrice);

    if (pricingOptions.length > 0 && pricingOptions[0].passengerTypes) {
      console.log(`   Passenger types found: ${pricingOptions[0].passengerTypes.join(', ')}`);
    }

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
      isRoundTrip: true,
      rawResponse: rawResponse // Include raw response in transformed data
    };

  } catch (error) {
    console.error('❌ Error transforming round-trip pricing response:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// MAIN TRANSFORM FUNCTION (MODIFIED)
// ============================================================

const transformPricingResponseAuto = (apiResponse, rawResponse) => {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 TRANSFORM PRICING RESPONSE AUTO');
  console.log('='.repeat(80));
  
  let data = null;
  let foundPath = '';
  
  if (apiResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']) {
    data = apiResponse.data['SOAP:Envelope']['SOAP:Body']['air:AirPriceRsp'];
    foundPath = 'apiResponse.data.SOAP:Envelope.SOAP:Body.air:AirPriceRsp';
  } else if (apiResponse?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']) {
    data = apiResponse['SOAP:Envelope']['SOAP:Body']['air:AirPriceRsp'];
    foundPath = 'apiResponse.SOAP:Envelope.SOAP:Body.air:AirPriceRsp';
  } else if (apiResponse?.data?.['air:AirPriceRsp']) {
    data = apiResponse.data['air:AirPriceRsp'];
    foundPath = 'apiResponse.data.air:AirPriceRsp';
  } else if (apiResponse?.['air:AirPriceRsp']) {
    data = apiResponse['air:AirPriceRsp'];
    foundPath = 'apiResponse.air:AirPriceRsp';
  }
  
  console.log(`   Found data at: ${foundPath || 'NOT FOUND'}`);
  
  if (!data) {
    console.error('❌ Could not find air:AirPriceRsp in response');
    return { success: false, error: 'Invalid pricing response structure' };
  }
  
  const airSegments = data['air:AirItinerary']?.['air:AirSegment'];
  const segmentCount = airSegments ? (Array.isArray(airSegments) ? airSegments.length : 1) : 0;
  
  const wrappedResponse = {
    data: { 'SOAP:Envelope': { 'SOAP:Body': { 'air:AirPriceRsp': data } } }
  };
  if (apiResponse.traceId) wrappedResponse.traceId = apiResponse.traceId;
  if (apiResponse.message) wrappedResponse.message = apiResponse.message;
  
  console.log(`   Processing as: ${segmentCount > 1 ? 'ROUND TRIP' : 'ONE WAY'}`);
  console.log('='.repeat(80) + '\n');
  
  if (segmentCount > 1) return transformRoundTripPricingResponse(wrappedResponse, rawResponse);
  else return transformPricingResponse(wrappedResponse, rawResponse);
};

// ============================================================
// BUILD REQUEST FUNCTIONS (KEPT AS IS)
// ============================================================

export const buildOneWayPricingRequest = (flight, selectedFare, passengerCounts) => {
  const is6E = flight.airlineCode === '6E';
  let segments = [];
  
  if (flight.segments && flight.segments.length > 0) segments = flight.segments;
  else if (flight.segmentKey) segments = [flight];
  else if (flight.key) segments = [{ ...flight, segmentKey: flight.key }];
  else {
    console.error('❌ No segments found in flight object:', flight);
    return null;
  }

  const normalizedSegments = segments.map(seg => ({ ...seg, segmentKey: seg.segmentKey || seg.key }));
  let hostTokenString = selectedFare.hostToken;
  let hostTokenRefString = selectedFare.hostTokenRef;
  if (hostTokenString && typeof hostTokenString === 'object') hostTokenString = hostTokenString.token || null;

  return {
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
      distance: seg.distance, // ✅ ADD THIS LINE - Include distance
      equipment: seg.equipment,
      changeOfPlane: "false",
      optionalServicesIndicator: "false",
      ...(is6E ? { status: seg.status || "KK", supplierCode: seg.supplierCode || "6E" } : {
        ETicketability: "Yes", LinkAvailability: "true", PolledAvailabilityOption: "Polled avail used",
        AvailabilitySource: "S", ParticipantLevel: "Secure Sell", AvailabilityDisplayType: "Fare Shop/Optimal Shop"
      }),
      group: 0
    })),
    passengers: [
      { code: 'ADT', count: passengerCounts.ADT || 1 },
      ...(passengerCounts.CNN ? [{ code: 'CNN', count: passengerCounts.CNN }] : []),
      ...(passengerCounts.INF ? [{ code: 'INF', count: passengerCounts.INF }] : [])
    ],
    bookingRequirements: normalizedSegments.map((seg) => {
      const bookingReq = { segmentKey: seg.segmentKey, bookingCode: selectedFare.bookingCode, fareBasis: selectedFare.fareBasis };
      if (is6E && hostTokenString) {
        bookingReq.hostToken = hostTokenString;
        if (hostTokenRefString) bookingReq.hostTokenRef = hostTokenRefString;
      }
      return bookingReq;
    })
  };
};

export const buildRoundTripPricingRequest = (outboundFlight, outboundFare, returnFlight, returnFare, passengerCounts, traceId = null) => {
  let outboundSegments = outboundFlight?.segments || [outboundFlight];
  outboundSegments = outboundSegments.map((seg) => ({
    ...seg, 
    segmentKey: seg.segmentKey || seg.key, 
    flightTime: seg.duration?.toString() || seg.flightTime,
    distance: seg.distance, // ✅ ADD DISTANCE HERE
    status: seg.status || "KK", 
    supplierCode: seg.supplierCode || "6E"
  }));
  
  let returnSegments = returnFlight?.segments || [returnFlight];
  returnSegments = returnSegments.map(seg => ({
    ...seg, 
    segmentKey: seg.segmentKey || seg.key, 
    flightTime: seg.duration?.toString() || seg.flightTime,
    distance: seg.distance, // ✅ ADD DISTANCE HERE
    status: seg.status || "KK", 
    supplierCode: seg.supplierCode || "6E"
  }));
  
  const outboundIs6E = outboundSegments[0]?.carrier === '6E';
  const returnIs6E = returnSegments[0]?.carrier === '6E';
  const bookingRequirements = [];
  
  outboundSegments.forEach((seg) => {
    const segmentKey = seg.segmentKey;
    let hostTokenString = null, hostTokenRefString = null;
    if (outboundFare.segments && outboundFare.segments.length > 0) {
      const segmentData = outboundFare.segments.find(s => s.segmentKey === segmentKey);
      if (segmentData) { hostTokenString = segmentData.hostToken; hostTokenRefString = segmentData.hostTokenRef; }
    }
    if (!hostTokenString && outboundFare.hostTokenMap) {
      hostTokenString = outboundFare.hostTokenMap[segmentKey];
      hostTokenRefString = outboundFare.hostTokenRefMap?.[segmentKey];
    }
    const bookingReq = { 
      segmentKey: segmentKey, 
      bookingCode: outboundFare.bookingCode || seg.bookingCode, 
      fareBasis: outboundFare.fareBasis 
    };
    if (outboundIs6E && hostTokenString) {
      bookingReq.hostToken = hostTokenString;
      if (hostTokenRefString) bookingReq.hostTokenRef = hostTokenRefString;
    }
    bookingRequirements.push(bookingReq);
  });
  
  returnSegments.forEach((seg) => {
    const segmentKey = seg.segmentKey;
    let hostTokenString = null, hostTokenRefString = null;
    if (returnFare.segments && returnFare.segments.length > 0) {
      const segmentData = returnFare.segments.find(s => s.segmentKey === segmentKey);
      if (segmentData) { hostTokenString = segmentData.hostToken; hostTokenRefString = segmentData.hostTokenRef; }
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
      if (hostTokenRefString) bookingReq.hostTokenRef = hostTokenRefString;
    }
    bookingRequirements.push(bookingReq);
  });
  
  return {
    currencyCode: "INR",
    traceId: traceId || `PRC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // ✅ USE PROVIDED TRACE ID
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
        distance: seg.distance, // ✅ ADD DISTANCE HERE
        equipment: seg.equipment, 
        changeOfPlane: "false", 
        optionalServicesIndicator: "false",
        ...(outboundIs6E ? { status: seg.status || "KK", supplierCode: seg.supplierCode || "6E" } : {
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
        distance: seg.distance, // ✅ ADD DISTANCE HERE
        equipment: seg.equipment, 
        changeOfPlane: "false", 
        optionalServicesIndicator: "false",
        ...(returnIs6E ? { status: seg.status || "KK", supplierCode: seg.supplierCode || "6E" } : {
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
};

// ============================================================
// MAIN API FUNCTION - WITH CONTEXT STORAGE
// ============================================================

export const getFlightPricing = async (pricingRequest) => {
  try {
    const apiUrl = `${BASE_URL}/flights/airpricing`;
    
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

    console.log('\n' + '='.repeat(80));
    console.log('📥 PRICING API RESPONSE');
    console.log('='.repeat(80));
    console.log('📊 Status:', response.status, response.statusText);
    console.log('='.repeat(80));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error Response Body:', errorText);
      throw new Error(`Pricing API Error: ${response.status} - ${errorText}`);
    }

    const rawResponse = await response.json();
    
    // ============ STORE RAW RESPONSE IN CONTEXT ============
    if (globalSetRawPricingResponse) {
      console.log('\n💾 Storing raw pricing response in context...');
      globalSetRawPricingResponse(rawResponse);
    } else {
      console.warn('\n⚠️ Context setter not initialized. Raw response not stored.');
      console.warn('   Call initializePricingContext() from your main App component');
    }
    
    // ============ LOGGING FOR RAW RESPONSE ============
    console.log('\n' + '='.repeat(80));
    console.log('📦 COMPLETE RAW API RESPONSE');
    console.log('='.repeat(80));
    console.log('🔍 Response Type:', typeof rawResponse);
    console.log('🔍 Response Keys:', rawResponse ? Object.keys(rawResponse) : 'null');
    console.log('🔍 Has success:', !!rawResponse.success);
    console.log('🔍 Has data:', !!rawResponse.data);
    console.log('🔍 Has traceId:', !!rawResponse.traceId);
    console.log('🔍 Has message:', !!rawResponse.message);
    
    // Log the complete response as formatted JSON for easy copying
    console.log('\n📄 COMPLETE RESPONSE BODY (COPY THIS ENTIRE BLOCK):');
    console.log('```json');
    console.log(JSON.stringify(rawResponse, null, 2));
    console.log('```');
    
    // Also log the structure summary
    if (rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']) {
      const airPriceRsp = rawResponse.data['SOAP:Envelope']['SOAP:Body']['air:AirPriceRsp'];
      console.log('\n📊 RESPONSE STRUCTURE SUMMARY:');
      console.log('   - AirItinerary:', !!airPriceRsp['air:AirItinerary']);
      console.log('   - AirPriceResult:', !!airPriceRsp['air:AirPriceResult']);
      
      const pricingSolutions = airPriceRsp['air:AirPriceResult']?.['air:AirPricingSolution'];
      if (pricingSolutions) {
        const solutionsArray = Array.isArray(pricingSolutions) ? pricingSolutions : [pricingSolutions];
        console.log(`   - Number of Pricing Solutions: ${solutionsArray.length}`);
        if (solutionsArray.length > 0 && solutionsArray[0]?.$?.TotalPrice) {
          console.log(`   - First Solution Price: ${solutionsArray[0].$.TotalPrice}`);
        }
      }
      
      const airSegments = airPriceRsp['air:AirItinerary']?.['air:AirSegment'];
      if (airSegments) {
        const segmentsArray = Array.isArray(airSegments) ? airSegments : [airSegments];
        console.log(`   - Number of Flight Segments: ${segmentsArray.length}`);
        if (segmentsArray.length > 0) {
          console.log(`   - Flight: ${segmentsArray[0].$?.Carrier} ${segmentsArray[0].$?.FlightNumber}`);
          console.log(`   - Route: ${segmentsArray[0].$?.Origin} → ${segmentsArray[0].$?.Destination}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🔄 Transforming response...');
    console.log('='.repeat(80) + '\n');

    // Pass rawResponse to transform function
    const transformed = transformPricingResponseAuto(rawResponse, rawResponse);
    
    if (!transformed.success) {
      console.log('❌ Transformation failed:', transformed.error);
      throw new Error(transformed.error || 'Failed to transform pricing response');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TRANSFORMATION SUCCESSFUL');
    console.log('='.repeat(80));
    
    if (transformed.pricingOptions.length > 0) {
      const firstOption = transformed.pricingOptions[0];
      console.log('   - Pricing Options:', transformed.count);
      console.log('   - Passenger Types:', firstOption.passengerTypes?.join(', ') || 'N/A');
      if (firstOption.passengerPricing) {
        Object.keys(firstOption.passengerPricing).forEach(type => {
          const p = firstOption.passengerPricing[type];
          console.log(`   - ${type}: ₹${p.totalPrice}, Baggage: ${p.baggage?.checked?.weight}kg, Fare Basis: ${p.fareInfo?.fareBasis || 'N/A'}`);
        });
      }
      console.log('   - Host Tokens:', Object.keys(firstOption.passengerHostTokens || {}));
    }
    
    console.log('   - Tax Breakdown:', transformed.pricingOptions[0]?.taxBreakdown?.length || 0, 'taxes');
    console.log('   - Brand Features:', transformed.pricingOptions[0]?.brand?.features?.length || 0, 'features');
    console.log('   - Optional Services (Included):', transformed.pricingOptions[0]?.optionalServices?.included?.length || 0);
    console.log('   - Optional Services (Available):', transformed.pricingOptions[0]?.optionalServices?.available?.length || 0);
    console.log('   - Currency:', transformed.currency);
    console.log('='.repeat(80) + '\n');

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
    if (error.stack) console.error('   Error Stack:', error.stack);
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