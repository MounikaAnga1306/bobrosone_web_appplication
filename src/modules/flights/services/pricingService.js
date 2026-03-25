// src/modules/flights/services/pricingService.js

import { safeArray, parsePrice, generateUniqueId } from '../utils/airPricingHelper';

const BASE_URL = 'https://api.bobros.org';

/**
 * Extract brand details from FareInfo
 */
const extractBrandFromFare = (fareInfo) => {
  if (!fareInfo || !fareInfo['air:Brand']) return null;
  
  const brand = fareInfo['air:Brand'];
  const titles = {};
  const texts = {};
  
  // Extract titles
  if (brand['air:Title']) {
    safeArray(brand['air:Title']).forEach(title => {
      if (title.$?.Type) titles[title.$.Type.toLowerCase()] = title._;
    });
  }
  
  // Extract texts
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
    shortName: titles.short || brand.$?.Name
  };
};


const extractBaggage = (pricingInfo) => {
  let baggage = '15kg';
  let cabinBaggage = '7kg';
  
  const baggageAllowance = pricingInfo?.['air:BaggageAllowances']?.['air:BaggageAllowanceInfo'];
  if (baggageAllowance?.['air:TextInfo']?.['air:Text']) {
    const textInfo = baggageAllowance['air:TextInfo']['air:Text'];
    if (Array.isArray(textInfo) && textInfo[0]) {
      baggage = textInfo[0]._;
    } else if (textInfo?._) {
      baggage = textInfo._;
    }
  }
  
  return { checked: baggage, cabin: cabinBaggage };
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
  const penalties = {
    change: null,
    cancel: null
  };

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
 * Transform the pricing API response into a clean format
 */
const transformPricingResponse = (apiResponse) => {
  try {
    const data = apiResponse.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp'];
    if (!data) {
      throw new Error('Invalid pricing response structure');
    }

    // Extract flight segment
    const airSegment = data['air:AirItinerary']?.['air:AirSegment'];
    const flightInfo = airSegment ? {
      segmentKey: airSegment.$?.Key,
      carrier: airSegment.$?.Carrier,
      flightNumber: airSegment.$?.FlightNumber,
      origin: airSegment.$?.Origin,
      destination: airSegment.$?.Destination,
      departureTime: airSegment.$?.DepartureTime,
      arrivalTime: airSegment.$?.ArrivalTime,
      duration: parseInt(airSegment.$?.FlightTime) || 0,
      equipment: airSegment.$?.Equipment,
      cabinClass: airSegment.$?.ClassOfService
    } : null;

    // Extract pricing solutions
    const pricingSolutions = safeArray(data['air:AirPriceResult']?.['air:AirPricingSolution']);
    
    const pricingOptions = pricingSolutions.map(solution => {
      const pricingInfo = solution['air:AirPricingInfo'];
      if (!pricingInfo) return null;
      
      const fareInfo = pricingInfo['air:FareInfo'];
      const bookingInfo = pricingInfo['air:BookingInfo'];
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
        
        fareInfo: {
          key: fareInfo?.$?.Key,
          fareBasis: fareInfo?.$?.FareBasis,
          amount: parsePrice(fareInfo?.$?.Amount),
          passengerType: fareInfo?.$?.PassengerTypeCode,
          notValidBefore: fareInfo?.$?.NotValidBefore,
          notValidAfter: fareInfo?.$?.NotValidAfter
        },
        
        brand,
        
        bookingInfo: {
          bookingCode: bookingInfo?.$?.BookingCode,
          cabinClass: bookingInfo?.$?.CabinClass,
          hostTokenRef: bookingInfo?.$?.HostTokenRef
        },
        
        taxBreakdown: extractTaxes(taxInfo),
        
        baggage: baggageInfo,
        
        penalties,
        
        fareCalc: pricingInfo['air:FareCalc'],
        refundable: pricingInfo.$?.Refundable === 'true',
        eticketable: pricingInfo.$?.ETicketability === 'Yes',
        platingCarrier: pricingInfo.$?.PlatingCarrier,
        providerCode: pricingInfo.$?.ProviderCode,
        
        fareNotes: solution['air:FareNote'] ? safeArray(solution['air:FareNote']).map(note => note._) : [],
        
        feeInfo: solution['air:FeeInfo'] ? {
          amount: parsePrice(solution['air:FeeInfo'].$?.Amount),
          description: solution['air:FeeInfo'].$?.Description,
          code: solution['air:FeeInfo'].$?.Code
        } : null
      };
    }).filter(Boolean);

    // Sort by price (lowest first)
    pricingOptions.sort((a, b) => a.totalPrice - b.totalPrice);

    return {
      success: true,
      traceId: apiResponse.traceId,
      message: apiResponse.message,
      flight: flightInfo,
      pricingOptions,
      selectedOption: pricingOptions[0],
      currency: data.$?.CurrencyType || 'INR',
      count: pricingOptions.length
    };

  } catch (error) {
    console.error('❌ Error transforming pricing response:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Build pricing request for one-way flight
 */
export const buildOneWayPricingRequest = (flight, selectedFare, passengerCounts) => {
  const is6E = flight.airlineCode === '6E';
  
  let segments = [];
  
  if (flight.segments && flight.segments.length > 0) {
    segments = flight.segments;
  } else if (flight.segmentKey) {
    segments = [flight];
  } else {
    console.error('❌ No segments found in flight object:', flight);
    return null;
  }

  // Ensure hostToken is a string
  let hostTokenString = selectedFare.hostToken;
  if (hostTokenString && typeof hostTokenString === 'object') {
    hostTokenString = hostTokenString.token || null;
  }

  const requestBody = {
    currencyCode: "INR",
    traceId: flight.traceId || `BOBROS-${Date.now()}`,
    segments: segments.map((seg) => ({
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
    bookingRequirements: segments.map((seg, idx) => {
      const bookingReq = {
        segmentKey: seg.segmentKey,
        bookingCode: selectedFare.bookingCode,
        fareBasis: selectedFare.fareBasis
      };
      
      if (is6E && hostTokenString) {
        bookingReq.hostToken = hostTokenString;
        bookingReq.hostTokenRef = seg.hostTokenRef || selectedFare.hostTokenRef;
      }
      
      return bookingReq;
    })
  };

  return requestBody;
};

/**
 * Build pricing request for round-trip
 */
export const buildRoundTripPricingRequest = (outboundFlight, outboundFare, returnFlight, returnFare, passengerCounts) => {
  const outboundIs6E = outboundFlight.airlineCode === '6E';
  const returnIs6E = returnFlight.airlineCode === '6E';
  
  const outboundSegments = outboundFlight.segments || [outboundFlight];
  const returnSegments = returnFlight.segments || [returnFlight];
  
  return {
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
        flightTime: seg.duration?.toString() || seg.flightTime,
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
        flightTime: seg.duration?.toString() || seg.flightTime,
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
    bookingRequirements: [
      ...outboundSegments.map(seg => ({
        segmentKey: seg.segmentKey,
        bookingCode: outboundFare.bookingCode,
        fareBasis: outboundFare.fareBasis,
        ...(outboundIs6E && outboundFare.hostToken ? {
          hostToken: outboundFare.hostToken,
          hostTokenRef: outboundFare.hostTokenRef
        } : {})
      })),
      ...returnSegments.map(seg => ({
        segmentKey: seg.segmentKey,
        bookingCode: returnFare.bookingCode,
        fareBasis: returnFare.fareBasis,
        ...(returnIs6E && returnFare.hostToken ? {
          hostToken: returnFare.hostToken,
          hostTokenRef: returnFare.hostTokenRef
        } : {})
      }))
    ]
  };
};

/**
 * Call pricing API
 */
export const getFlightPricing = async (pricingRequest) => {
  try {
    const response = await fetch(`${BASE_URL}/flights/airpricing`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pricingRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Pricing API Error Response:', errorText);
      throw new Error(`Pricing API Error: ${response.status}`);
    }

    const apiResponse = await response.json();
    
    // ============ SIMPLE LOG: Just print the API response ============
    console.log('\n📦 PRICING API RESPONSE:');
    console.log(JSON.stringify(apiResponse, null, 2));
    console.log('');

    const transformed = transformPricingResponse(apiResponse);
    
    if (!transformed.success) {
      throw new Error(transformed.error || 'Failed to transform pricing response');
    }

    return {
      success: true,
      data: transformed
    };

  } catch (error) {
    console.error('❌ Pricing API Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};