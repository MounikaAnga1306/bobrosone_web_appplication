// src/modules/flights/contexts/PnrResponseContext.jsx

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Create Context
const PnrResponseContext = createContext(null);

// Hook to use PNR response context
export const usePnrResponse = () => {
  const context = useContext(PnrResponseContext);
  if (!context) {
    throw new Error('usePnrResponse must be used within PnrResponseProvider');
  }
  return context;
};

// Provider Component
export const PnrResponseProvider = ({ children }) => {
  // Try to load initial state from localStorage
  const getInitialState = () => {
    try {
      const savedData = localStorage.getItem('pnrContextData');
      if (savedData) {
        console.log('📦 Loaded initial PNR data from localStorage');
        return JSON.parse(savedData);
      }
    } catch (err) {
      console.warn('Could not load from localStorage:', err);
    }
    
    return {
      rawResponse: null,
      pnrNumber: null,
      universalLocator: null,
      airLocatorCode: null,
      providerLocatorCode: null,
      providerCode: null,
      bookingStatus: null,
      version: null,
      warnings: [],
      flightSegments: [],
      passengers: [],
      totalPrice: null,
      basePrice: null,
      taxes: null,
      taxBreakdown: [],
      penalties: {
        change: null,
        cancel: null
      },
      baggageAllowance: null,
      ticketingDeadline: null,
      isRefundable: null,
      isExchangeable: null,
      fareBasis: null,
      cabinClass: null,
      ssrDetails: [],
      createdAt: null,
      isBookingComplete: false
    };
  };

  const [pnrData, setPnrData] = useState(getInitialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to safely get nested properties
  const safeGet = (obj, path, defaultValue = null) => {
    try {
      return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Extract warning messages
  const extractWarnings = (airCreateRsp) => {
    const warnings = [];
    const responseMessages = airCreateRsp?.['common_v54_0:ResponseMessage'];
    
    if (responseMessages) {
      const messages = Array.isArray(responseMessages) ? responseMessages : [responseMessages];
      messages.forEach(msg => {
        if (msg?._ || msg?.$?.Code === '1') {
          warnings.push({
            message: msg?._ || 'Unknown warning',
            code: msg?.$?.Code,
            type: msg?.$?.Type,
            provider: msg?.$?.ProviderCode
          });
        }
      });
    }
    return warnings;
  };

  // Extract flight segments (handles both single and multiple)
  const extractFlightSegments = (airReservation) => {
    const segments = [];
    const airSegment = airReservation?.['air:AirSegment'];
    
    if (airSegment) {
      const segmentsArray = Array.isArray(airSegment) ? airSegment : [airSegment];
      
      segmentsArray.forEach(segment => {
        const flightDetails = segment?.['air:FlightDetails'];
        
        segments.push({
          key: segment?.$?.Key,
          carrier: segment?.$?.Carrier,
          flightNumber: segment?.$?.FlightNumber,
          origin: segment?.$?.Origin,
          destination: segment?.$?.Destination,
          departureTime: segment?.$?.DepartureTime,
          arrivalTime: segment?.$?.ArrivalTime,
          duration: segment?.$?.TravelTime,
          classOfService: segment?.$?.ClassOfService,
          cabinClass: segment?.$?.CabinClass,
          equipment: segment?.$?.Equipment,
          status: segment?.$?.Status,
          originTerminal: flightDetails?.$?.OriginTerminal,
          destinationTerminal: flightDetails?.$?.DestinationTerminal,
          isEticketable: segment?.$?.ETicketability === 'Yes'
        });
      });
    }
    
    return segments;
  };

  // Extract passengers
  const extractPassengers = (universalRecord) => {
    const passengers = [];
    const bookingTraveler = universalRecord?.['common_v54_0:BookingTraveler'];
    
    if (bookingTraveler) {
      const travelers = Array.isArray(bookingTraveler) ? bookingTraveler : [bookingTraveler];
      
      travelers.forEach(traveler => {
        const name = traveler?.['common_v54_0:BookingTravelerName']?.$;
        passengers.push({
          key: traveler?.$?.Key,
          firstName: name?.First,
          lastName: name?.Last,
          prefix: name?.Prefix,
          type: traveler?.$?.TravelerType,
          age: traveler?.$?.Age,
          dob: traveler?.$?.DOB,
          gender: traveler?.$?.Gender
        });
      });
    }
    
    return passengers;
  };

  // Extract pricing details
  const extractPricing = (airPricingInfo) => {
    if (!airPricingInfo) return {};
    
    const fareInfo = airPricingInfo?.['air:FareInfo'];
    const taxInfos = airPricingInfo?.['air:TaxInfo'];
    
    // Extract tax breakdown
    const taxBreakdown = [];
    if (taxInfos) {
      const taxesArray = Array.isArray(taxInfos) ? taxInfos : [taxInfos];
      taxesArray.forEach(tax => {
        taxBreakdown.push({
          category: tax?.$?.Category,
          amount: tax?.$?.Amount,
          key: tax?.$?.Key
        });
      });
    }
    
    // Extract penalties
    let changePenalty = null;
    let cancelPenalty = null;
    
    const changePenaltyNode = airPricingInfo?.['air:ChangePenalty'];
    const cancelPenaltyNode = airPricingInfo?.['air:CancelPenalty'];
    
    if (changePenaltyNode) {
      changePenalty = {
        amount: changePenaltyNode?.['air:Amount']?.$?.Value || changePenaltyNode?.['air:Amount'],
        applies: changePenaltyNode?.$?.PenaltyApplies
      };
    }
    
    if (cancelPenaltyNode) {
      cancelPenalty = {
        amount: cancelPenaltyNode?.['air:Amount']?.$?.Value || cancelPenaltyNode?.['air:Amount'],
        applies: cancelPenaltyNode?.$?.PenaltyApplies
      };
    }
    
    // Extract baggage allowance
    let baggageAllowance = null;
    const baggageInfo = fareInfo?.['air:BaggageAllowance'];
    if (baggageInfo) {
      const maxWeight = baggageInfo?.['air:MaxWeight']?.$;
      baggageAllowance = {
        weight: maxWeight?.Value,
        unit: maxWeight?.Unit
      };
    }
    
    return {
      totalPrice: airPricingInfo?.$?.TotalPrice,
      basePrice: airPricingInfo?.$?.BasePrice,
      taxes: airPricingInfo?.$?.Taxes,
      taxBreakdown,
      fareBasis: fareInfo?.$?.FareBasis,
      isRefundable: airPricingInfo?.$?.Refundable === 'true',
      isExchangeable: airPricingInfo?.$?.Exchangeable === 'true',
      ticketingDeadline: airPricingInfo?.$?.LatestTicketingTime,
      platingCarrier: airPricingInfo?.$?.PlatingCarrier,
      penalties: {
        change: changePenalty,
        cancel: cancelPenalty
      },
      baggageAllowance
    };
  };

  // Extract SSR details
  const extractSSRs = (universalRecord) => {
    const ssrs = [];
    const ssrNodes = universalRecord?.['common_v54_0:SSR'];
    
    if (ssrNodes) {
      const ssrArray = Array.isArray(ssrNodes) ? ssrNodes : [ssrNodes];
      ssrArray.forEach(ssr => {
        ssrs.push({
          type: ssr?.$?.Type,
          status: ssr?.$?.Status,
          freeText: ssr?.$?.FreeText,
          carrier: ssr?.$?.Carrier,
          key: ssr?.$?.Key
        });
      });
    }
    
    return ssrs;
  };

  // ============ MAIN STORE FUNCTION ============
  const storePnrResponse = useCallback((rawResponse) => {
    console.log('\n💾 Storing PNR response in context');
    console.log('   - Raw response received:', !!rawResponse);
    
    setLoading(true);
    setError(null);
    
    try {
      // CORRECT PATH NAVIGATION
      const soapBody = rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body'];
      const airCreateRsp = soapBody?.['universal:AirCreateReservationRsp'];
      const universalRecord = airCreateRsp?.['universal:UniversalRecord'];
      
      // Extract warnings FIRST (important)
      const warnings = extractWarnings(airCreateRsp);
      
      // Extract PNR numbers
      const universalLocator = universalRecord?.$?.LocatorCode;
      const bookingStatus = universalRecord?.$?.Status;
      const version = universalRecord?.$?.Version;
      
      // Provider info
      const providerReservationInfo = universalRecord?.['universal:ProviderReservationInfo'];
      const providerLocatorCode = providerReservationInfo?.$?.LocatorCode;
      const providerCode = providerReservationInfo?.$?.ProviderCode;
      
      // Air reservation
      const airReservation = universalRecord?.['air:AirReservation'];
      const airLocatorCode = airReservation?.$?.LocatorCode;
      
      // Extract all components
      const flightSegments = extractFlightSegments(airReservation);
      const passengers = extractPassengers(universalRecord);
      const airPricingInfo = airReservation?.['air:AirPricingInfo'];
      const pricing = extractPricing(airPricingInfo);
      const ssrDetails = extractSSRs(universalRecord);
      
      // Get cabin class from first flight segment
      const cabinClass = flightSegments[0]?.cabinClass || null;
      
      // Extract pricing key and trace ID
      let pricingKey = null;
      const airSolutionChangedInfo = airCreateRsp?.['air:AirSolutionChangedInfo'];
      if (airSolutionChangedInfo) {
        const airPricingSolution = airSolutionChangedInfo?.['air:AirPricingSolution'];
        pricingKey = airPricingSolution?.$?.Key;
      }
      if (!pricingKey && airPricingInfo) {
        pricingKey = airPricingInfo?.$?.Key;
      }
      
      const traceId = airCreateRsp?.$?.TraceId;
      
      const extractedData = {
        rawResponse: rawResponse,
        pnrNumber: universalLocator,
        universalLocator: universalLocator,
        airLocatorCode: airLocatorCode,
        providerLocatorCode: providerLocatorCode,
        providerCode: providerCode,
        bookingStatus: bookingStatus,
        version: version,
        warnings: warnings,
        flightSegments: flightSegments,
        passengers: passengers,
        totalPrice: pricing.totalPrice,
        basePrice: pricing.basePrice,
        taxes: pricing.taxes,
        taxBreakdown: pricing.taxBreakdown,
        penalties: pricing.penalties,
        baggageAllowance: pricing.baggageAllowance,
        ticketingDeadline: pricing.ticketingDeadline,
        isRefundable: pricing.isRefundable,
        isExchangeable: pricing.isExchangeable,
        fareBasis: pricing.fareBasis,
        cabinClass: cabinClass,
        ssrDetails: ssrDetails,
        createdAt: new Date().toISOString(),
        isBookingComplete: bookingStatus === 'Active',
        pricingKey: pricingKey,
        traceId: traceId
      };
      
      console.log('✅ PNR data extracted successfully:');
      console.log(`   - PNR Number: ${universalLocator}`);
      console.log(`   - Pricing Key: ${pricingKey}`);
      console.log(`   - Trace ID: ${traceId}`);
      console.log(`   - GDS Locator: ${providerLocatorCode}`);
      console.log(`   - Booking Status: ${bookingStatus}`);
      console.log(`   - Total Price: ${pricing.totalPrice}`);
      console.log(`   - Warnings: ${warnings.length > 0 ? warnings.length : 'None'}`);
      console.log(`   - Flight Segments: ${flightSegments.length}`);
      console.log(`   - Passengers: ${passengers.length}`);
      
      if (warnings.length > 0) {
        console.warn('⚠️ Warnings present:', warnings);
      }
      
      // ==============================================
      // STORE IN CONTEXT STATE
      // ==============================================
      setPnrData(extractedData);
      
      // ==============================================
      // ALSO STORE IN LOCALSTORAGE FOR PERSISTENCE
      // ==============================================
      try {
        localStorage.setItem('pnrContextData', JSON.stringify(extractedData));
        localStorage.setItem('pnrRawResponse', JSON.stringify(rawResponse));
        console.log('💾 Also backed up to localStorage');
      } catch (err) {
        console.warn('Could not save to localStorage:', err);
      }
      
      setLoading(false);
      
      return extractedData;
      
    } catch (err) {
      console.error('❌ Error storing PNR response:', err);
      console.error('Error details:', err.stack);
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, []);

  // ============================================================
  // EXPOSE STORE FUNCTION GLOBALLY SO SERVICE CAN ACCESS IT
  // ============================================================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__pnrContextStore = storePnrResponse;
      console.log('✅ PNR Context store function exposed globally');
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__pnrContextStore;
        console.log('🗑️ PNR Context store function removed from global');
      }
    };
  }, [storePnrResponse]);

  // Clear PNR data
  const clearPnrData = useCallback(() => {
    console.log('🗑️ Clearing PNR data');
    const emptyData = {
      rawResponse: null,
      pnrNumber: null,
      universalLocator: null,
      airLocatorCode: null,
      providerLocatorCode: null,
      providerCode: null,
      bookingStatus: null,
      version: null,
      warnings: [],
      flightSegments: [],
      passengers: [],
      totalPrice: null,
      basePrice: null,
      taxes: null,
      taxBreakdown: [],
      penalties: { change: null, cancel: null },
      baggageAllowance: null,
      ticketingDeadline: null,
      isRefundable: null,
      isExchangeable: null,
      fareBasis: null,
      cabinClass: null,
      ssrDetails: [],
      createdAt: null,
      isBookingComplete: false,
      pricingKey: null,
      traceId: null
    };
    setPnrData(emptyData);
    setError(null);
    
    // Clear from localStorage as well
    try {
      localStorage.removeItem('pnrContextData');
      localStorage.removeItem('pnrRawResponse');
      console.log('🗑️ Also cleared from localStorage');
    } catch (err) {
      console.warn('Could not clear localStorage:', err);
    }
  }, []);

  // Getters
  const getCompletePnrData = useCallback(() => pnrData, [pnrData]);
  const getPnrNumber = useCallback(() => pnrData.pnrNumber, [pnrData]);
  const getUniversalLocator = useCallback(() => pnrData.universalLocator, [pnrData]);
  const getAirLocatorCode = useCallback(() => pnrData.airLocatorCode, [pnrData]);
  const getBookingStatus = useCallback(() => pnrData.bookingStatus, [pnrData]);
  const getFlightSegments = useCallback(() => pnrData.flightSegments, [pnrData]);
  const getPassengers = useCallback(() => pnrData.passengers, [pnrData]);
  const getTotalPrice = useCallback(() => pnrData.totalPrice, [pnrData]);
  const getWarnings = useCallback(() => pnrData.warnings, [pnrData]);
  const getPenalties = useCallback(() => pnrData.penalties, [pnrData]);
  const getPricingKey = useCallback(() => pnrData.pricingKey, [pnrData]);
  const getTraceId = useCallback(() => pnrData.traceId, [pnrData]);
  
  const isBookingConfirmed = useCallback(() => {
    return !!(pnrData.pnrNumber && pnrData.bookingStatus === 'Active');
  }, [pnrData]);

  const hasWarnings = useCallback(() => {
    return pnrData.warnings && pnrData.warnings.length > 0;
  }, [pnrData]);

  const value = {
    // State
    pnrData,
    loading,
    error,
    
    // Core functions
    storePnrResponse,
    clearPnrData,
    
    // Getters
    getCompletePnrData,
    getPnrNumber,
    getUniversalLocator,
    getAirLocatorCode,
    getBookingStatus,
    getFlightSegments,
    getPassengers,
    getTotalPrice,
    getWarnings,
    getPenalties,
    getPricingKey,
    getTraceId,
    
    // Helpers
    isBookingConfirmed,
    hasWarnings
  };

  return (
    <PnrResponseContext.Provider value={value}>
      {children}
    </PnrResponseContext.Provider>
  );
};

export default PnrResponseContext;