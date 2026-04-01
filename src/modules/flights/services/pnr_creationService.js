// src/services/pnr_creationService.js

import axios from 'axios';

// Constants
const BASE_URL = 'https://api.bobros.org';

class PNRCreationService {
  constructor() {
    // Store hostToken from pricing response for later use
    this.storedHostToken = null;
    this.lastRawResponse = null; // Store last raw response for debugging
  }

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  calculateAge(dob) {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  formatPrice(value) {
    if (!value && value !== 0) return 'INR0';
    if (typeof value === 'string' && value.startsWith('INR')) return value;
    return `INR${Math.round(parseFloat(value))}`;
  }

  getNumericPrice(value) {
    if (!value) return 0;
    const str = String(value);
    const match = str.match(/INR(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : parseFloat(str) || 0;
  }

  normalizeToArray(data) {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  }

  // ============================================================
  // EXTRACT HOST TOKEN FROM PRICING RESPONSE
  // ============================================================

  extractAndStoreHostToken(pricingResponse) {
    console.log('\n🔍 EXTRACTING HOST TOKEN FROM PRICING RESPONSE');
    
    try {
      let hostToken = null;
      
      // Try different paths to find host token
      if (pricingResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']?.['air:AirItinerary']?.['common_v54_0:HostToken']) {
        hostToken = pricingResponse.data['SOAP:Envelope']['SOAP:Body']['air:AirPriceRsp']['air:AirItinerary']['common_v54_0:HostToken'];
      }
      else if (pricingResponse?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']?.['air:AirItinerary']?.['common_v54_0:HostToken']) {
        hostToken = pricingResponse['SOAP:Envelope']['SOAP:Body']['air:AirPriceRsp']['air:AirItinerary']['common_v54_0:HostToken'];
      }
      else if (pricingResponse?.data?.['air:AirPriceRsp']?.['air:AirItinerary']?.['common_v54_0:HostToken']) {
        hostToken = pricingResponse.data['air:AirPriceRsp']['air:AirItinerary']['common_v54_0:HostToken'];
      }
      else if (pricingResponse?.['air:AirPriceRsp']?.['air:AirItinerary']?.['common_v54_0:HostToken']) {
        hostToken = pricingResponse['air:AirPriceRsp']['air:AirItinerary']['common_v54_0:HostToken'];
      }
      // Also check in selectedOption for hostTokens
      else if (pricingResponse?.hostTokens) {
        hostToken = pricingResponse.hostTokens;
      }
      
      if (hostToken) {
        const hostTokensArray = this.normalizeToArray(hostToken);
        
        this.storedHostToken = {
          key: hostTokensArray[0]?.$?.Key || hostTokensArray[0]?.key,
          value: hostTokensArray[0]?._ || hostTokensArray[0]?.value,
          allTokens: hostTokensArray.map(t => ({
            key: t.$?.Key || t.key,
            value: t._ || t.value
          }))
        };
        
        console.log('✅ Host token stored successfully!');
        console.log(`   - Key: ${this.storedHostToken.key}`);
        console.log(`   - Value: ${this.storedHostToken.value?.substring(0, 50)}...`);
        console.log(`   - Total Tokens: ${this.storedHostToken.allTokens.length}`);
        
        return this.storedHostToken;
      } else {
        console.log('⚠️ No host token found in pricing response');
        return null;
      }
    } catch (error) {
      console.error('❌ Error extracting host token:', error.message);
      return null;
    }
  }

  getStoredHostToken() {
    return this.storedHostToken;
  }

  getLastRawResponse() {
    return this.lastRawResponse;
  }

  // ============================================================
  // EXTRACT DATA FROM SELECTED OPTION
  // ============================================================

  extractBookingCode(selectedOption, segments) {
    if (selectedOption?.bookingInfo) {
      const bookingInfos = this.normalizeToArray(selectedOption.bookingInfo);
      if (bookingInfos[0]?.bookingCode) return bookingInfos[0].bookingCode;
      if (bookingInfos[0]?.$?.BookingCode) return bookingInfos[0].$.BookingCode;
    }
    if (selectedOption?.fareInfo) {
      const fareInfos = this.normalizeToArray(selectedOption.fareInfo);
      if (fareInfos[0]?.fareBasis) return fareInfos[0].fareBasis.charAt(0);
      if (fareInfos[0]?.$?.FareBasis) return fareInfos[0].$.FareBasis.charAt(0);
    }
    if (segments[0]?.classOfService) return segments[0].classOfService;
    return 'U';
  }

  extractLatestTicketingTime(selectedOption) {
    if (selectedOption?.latestTicketingTime) return selectedOption.latestTicketingTime;
    if (selectedOption?.airPricingInfo) {
      const pricingInfos = this.normalizeToArray(selectedOption.airPricingInfo);
      if (pricingInfos[0]?.latestTicketingTime) return pricingInfos[0].latestTicketingTime;
    }
    const today = new Date();
    return `${today.toISOString().split('T')[0]}T23:59:00.000+05:30`;
  }

  extractPlatingCarrier(selectedOption, segments) {
    if (selectedOption?.platingCarrier) return selectedOption.platingCarrier;
    if (selectedOption?.airPricingInfo) {
      const pricingInfos = this.normalizeToArray(selectedOption.airPricingInfo);
      if (pricingInfos[0]?.platingCarrier) return pricingInfos[0].platingCarrier;
    }
    if (segments[0]?.carrier) return segments[0].carrier;
    return 'AI';
  }

  extractProviderCode(selectedOption, segments) {
    if (selectedOption?.providerCode) return selectedOption.providerCode;
    if (selectedOption?.airPricingInfo) {
      const pricingInfos = this.normalizeToArray(selectedOption.airPricingInfo);
      if (pricingInfos[0]?.providerCode) return pricingInfos[0].providerCode;
    }
    if (segments[0]?.carrier === 'AI') return '1G';
    return 'ACH';
  }

  // ============================================================
  // BUILD SEGMENTS
  // ============================================================

  buildSegment(segmentData, groupNumber, bookingCode) {
    const seg = segmentData.$ || segmentData;
    
    const segment = {
      key: seg.Key || segmentData.key || segmentData.segmentKey,
      group: groupNumber.toString(),
      carrier: seg.Carrier || segmentData.carrier,
      flightNumber: seg.FlightNumber || segmentData.flightNumber,
      origin: seg.Origin || segmentData.origin,
      destination: seg.Destination || segmentData.destination,
      departureTime: seg.DepartureTime || segmentData.departureTime,
      arrivalTime: seg.ArrivalTime || segmentData.arrivalTime,
      classOfService: bookingCode,
      flightTime: seg.FlightTime || segmentData.flightTime || segmentData.duration?.toString() || '0',
      travelTime: seg.TravelTime || segmentData.travelTime || seg.FlightTime || '0',
      distance: seg.Distance || segmentData.distance,
      equipment: seg.Equipment || segmentData.equipment || '32N',
      changeOfPlane: 'false',
      optionalServicesIndicator: 'false',
      availabilitySource: 'S',
      participantLevel: 'Secure Sell',
      linkAvailability: 'true',
      availabilityDisplayType: 'Fare Specific Fare Quote Unbooked'
    };

    if (seg.ProviderCode) segment.providerCode = seg.ProviderCode;
    if (seg.SupplierCode) segment.supplierCode = seg.SupplierCode;
    if (seg.Status) segment.status = seg.Status;
    if (seg.HostTokenRef) segment.hostTokenRef = seg.HostTokenRef;

    return segment;
  }

  // ============================================================
  // BUILD ALL SEGMENTS
  // ============================================================

  buildAllSegments(flight, isRoundTrip, outboundFlight, returnFlight, bookingCode) {
    const allSegments = [];

    if (isRoundTrip) {
      const outboundSegments = this.normalizeToArray(outboundFlight?.segments || outboundFlight);
      outboundSegments.forEach((segment) => {
        if (segment) allSegments.push(this.buildSegment(segment, 0, bookingCode));
      });

      const returnSegments = this.normalizeToArray(returnFlight?.segments || returnFlight);
      returnSegments.forEach((segment) => {
        if (segment) allSegments.push(this.buildSegment(segment, 1, bookingCode));
      });
    } else {
      const flightSegments = this.normalizeToArray(flight?.segments || flight);
      flightSegments.forEach((segment) => {
        if (segment) allSegments.push(this.buildSegment(segment, 0, bookingCode));
      });
    }

    return allSegments;
  }

  // ============================================================
  // BUILD HOST TOKENS - USE STORED HOST TOKEN
  // ============================================================

  buildHostTokens(selectedOption, segments) {
    const hostTokens = [];

    // PRIORITY 1: Use stored host token from pricing response
    if (this.storedHostToken && this.storedHostToken.value) {
      console.log('✅ Using stored host token from pricing response');
      console.log(`   - Key: ${this.storedHostToken.key}`);
      console.log(`   - Value: ${this.storedHostToken.value.substring(0, 50)}...`);
      
      // For each segment, create a host token entry
      for (let i = 0; i < segments.length; i++) {
        hostTokens.push({
          key: this.storedHostToken.key,
          value: this.storedHostToken.value
        });
      }
      return hostTokens;
    }

    // PRIORITY 2: Try to get host tokens from selected option
    if (selectedOption?.hostTokens) {
      const tokens = this.normalizeToArray(selectedOption.hostTokens);
      tokens.forEach(token => {
        if (token.value) {
          hostTokens.push({
            key: token.key || token.$?.Key,
            value: token.token || token.value || token._
          });
        }
      });
    }

    // PRIORITY 3: Try from bookingInfo
    if (hostTokens.length === 0 && selectedOption?.bookingInfo) {
      const bookingInfos = this.normalizeToArray(selectedOption.bookingInfo);
      bookingInfos.forEach((bi, idx) => {
        if (bi.hostTokenRef || bi.$?.HostTokenRef) {
          hostTokens.push({
            key: bi.hostTokenRef || bi.$?.HostTokenRef,
            value: bi.hostToken || bi.$?._ || ''
          });
        }
      });
    }

    // Log warning if no host tokens found
    if (hostTokens.length === 0) {
      console.warn('⚠️ No host tokens found in any source! Booking may fail.');
    }

    return hostTokens;
  }

  // ============================================================
  // BUILD AIR PRICING INFO FOR ALL PASSENGERS
  // ============================================================

  buildAirPricingInfos(passengers, selectedOption, segments, hostTokens, bookingCode, isRoundTrip) {
    const airPricingInfos = [];

    for (let pIdx = 0; pIdx < passengers.length; pIdx++) {
      const passenger = passengers[pIdx];
      const passengerCode = passenger.code;
      const passengerAge = passenger.age || this.calculateAge(passenger.dob);
      const passengerRef = (pIdx + 1).toString();

      // Get existing pricing info for this passenger type from selectedOption
      let existingPricingInfo = null;
      let existingFareInfos = [];
      
      if (selectedOption?.fareInfo) {
        existingFareInfos = this.normalizeToArray(selectedOption.fareInfo);
      }
      
      if (!existingFareInfos.length && selectedOption?.airPricingInfo) {
        const pricingInfos = this.normalizeToArray(selectedOption.airPricingInfo);
        existingPricingInfo = pricingInfos.find(p => {
          const pTypes = this.normalizeToArray(p.passengerTypes);
          return pTypes[0]?.code === passengerCode;
        });
        if (existingPricingInfo?.fareInfos) {
          existingFareInfos = this.normalizeToArray(existingPricingInfo.fareInfos);
        }
      }

      // Build fare infos for each segment
      const fareInfos = [];
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const existingFare = existingFareInfos[i] || existingFareInfos[0];
        
        // Calculate fare amount - use actual fare amount from selectedOption
        let fareAmount = 0;
        if (existingFare?.amount) {
          fareAmount = this.getNumericPrice(existingFare.amount);
        } else if (selectedOption?.basePrice) {
          fareAmount = this.getNumericPrice(selectedOption.basePrice) / segments.length;
        }

        fareInfos.push({
          key: existingFare?.key || `FI-${passengerCode}-${i}-${Date.now()}`,
          fareBasis: existingFare?.fareBasis || 
                     (existingFare?.$?.FareBasis) || 
                     (selectedOption?.fareInfo?.[0]?.fareBasis) || 'U1YXSII',
          passengerTypeCode: passengerCode,
          origin: segment.origin,
          destination: segment.destination,
          effectiveDate: existingFare?.effectiveDate || 
                         existingFare?.$?.EffectiveDate || 
                         new Date().toISOString().split('T')[0] + 'T00:00:00.000+05:30',
          departureDate: segment.departureTime?.split('T')[0] || 
                         existingFare?.departureDate,
          amount: this.formatPrice(fareAmount),
          privateFare: existingFare?.privateFare || 'false',
          negotiatedFare: existingFare?.negotiatedFare || 'false',
          promotionalFare: existingFare?.promotionalFare || 'false',
          fareRuleKey: existingFare?.fareRuleKey || existingFare?.$?.FareRuleKey
        });
      }

      // Calculate total fare amount
      let totalFareAmount = 0;
      fareInfos.forEach(fi => {
        totalFareAmount += this.getNumericPrice(fi.amount);
      });

      // Calculate taxes from selectedOption
      let taxes = 0;
      if (selectedOption?.taxes) {
        taxes = this.getNumericPrice(selectedOption.taxes) / passengers.length;
      }

      const totalPrice = totalFareAmount + taxes;

      // Build booking infos
      const bookingInfos = [];
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const fareInfo = fareInfos[i];
        const hostToken = hostTokens[i] || hostTokens[0];
        
        bookingInfos.push({
          bookingCode: bookingCode,
          fareInfoRef: fareInfo.key,
          segmentRef: segment.key,
          cabinClass: 'Economy',
          hostTokenRef: hostToken?.key
        });
      }

      airPricingInfos.push({
        key: existingPricingInfo?.key || `API-${passengerCode}-${Date.now()}`,
        totalPrice: this.formatPrice(totalPrice),
        basePrice: this.formatPrice(totalFareAmount),
        fareType: existingPricingInfo?.fareType || 'Public',
        fareIndicator: existingPricingInfo?.fareIndicator || 'PublicFaresOnly',
        latestTicketingTime: this.extractLatestTicketingTime(selectedOption),
        pricingMethod: existingPricingInfo?.pricingMethod || 'Guaranteed',
        refundable: existingPricingInfo?.refundable !== undefined ? existingPricingInfo.refundable : true,
        eticketability: existingPricingInfo?.eticketability || 'Yes',
        platingCarrier: this.extractPlatingCarrier(selectedOption, segments),
        providerCode: this.extractProviderCode(selectedOption, segments),
        fareInfos: fareInfos,
        bookingInfos: bookingInfos,
        passengerTypes: [{
          code: passengerCode,
          bookingTravelerRef: passengerRef,
          age: passengerAge.toString()
        }]
      });
    }

    return airPricingInfos;
  }

  // ============================================================
  // BUILD AIR PRICING SOLUTION
  // ============================================================

  buildAirPricingSolution(selectedOption, segments, passengers, hostTokens, bookingCode, isRoundTrip) {
    let totalPrice = 0;
    let totalBasePrice = 0;
    let totalTaxes = 0;

    const airPricingInfos = this.buildAirPricingInfos(
      passengers, selectedOption, segments, hostTokens, bookingCode, isRoundTrip
    );

    airPricingInfos.forEach(api => {
      totalPrice += this.getNumericPrice(api.totalPrice);
      totalBasePrice += this.getNumericPrice(api.basePrice);
      totalTaxes += this.getNumericPrice(api.totalPrice) - this.getNumericPrice(api.basePrice);
    });

    return {
      key: selectedOption?.key || `SOL-${Date.now()}`,
      totalPrice: this.formatPrice(totalPrice),
      basePrice: this.formatPrice(totalBasePrice),
      fees: 'INR0',
      taxes: this.formatPrice(totalTaxes),
      airPricingInfo: airPricingInfos,
      hostTokens: hostTokens
    };
  }

  // ============================================================
  // BUILD COMPLETE BOOKING REQUEST
  // ============================================================

  buildBookingRequest(params) {
    console.log('\n' + '='.repeat(80));
    console.log('🏗️ BUILDING BOOKING REQUEST');
    console.log('='.repeat(80));

    const {
      pricingResult,
      selectedOption,
      flight,
      outboundFlight,
      returnFlight,
      isRoundTrip,
      passengers,
      contactInfo,
      paymentMethod,
      traceId
    } = params;

    // Extract and store host token from pricing result
    this.extractAndStoreHostToken(pricingResult);

    const bookingCode = this.extractBookingCode(selectedOption, 
      isRoundTrip ? (outboundFlight?.segments || [outboundFlight]) : (flight?.segments || [flight]));
    
    const segments = this.buildAllSegments(flight, isRoundTrip, outboundFlight, returnFlight, bookingCode);

    const passengersWithAge = passengers.map(p => ({
      ...p,
      age: p.age || this.calculateAge(p.dob)
    }));

    // Build host tokens using the stored token
    const hostTokens = this.buildHostTokens(selectedOption, segments);

    const airPricingSolution = this.buildAirPricingSolution(
      selectedOption, segments, passengersWithAge, hostTokens, bookingCode, isRoundTrip
    );

    const bookingRequest = {
      traceId: traceId || `BOBROS-${Date.now()}`,
      passengers: passengersWithAge.map(p => ({
        code: p.code,
        firstName: p.firstName.toUpperCase(),
        lastName: p.lastName.toUpperCase(),
        dob: p.dob,
        gender: p.gender,
        nationality: p.nationality || 'IN',
        age: p.age
      })),
      segments: segments,
      airPricingSolution: airPricingSolution,
      contactInfo: {
        email: contactInfo.email,
        phone: {
          countryCode: contactInfo.phone.countryCode,
          number: contactInfo.phone.number
        }
      },
      formOfPayment: {
        type: paymentMethod
      },
      autoTicket: false
    };

    console.log('\n✅ Booking request built successfully!');
    console.log(`   - Trace ID: ${bookingRequest.traceId}`);
    console.log(`   - Segments: ${segments.length}`);
    console.log(`   - Passengers: ${passengersWithAge.length}`);
    console.log(`   - Total Price: ${airPricingSolution.totalPrice}`);
    console.log(`   - Host Tokens: ${hostTokens.length}`);
    console.log(`   - Host Token Keys: ${hostTokens.map(t => t.key).join(', ')}`);
    console.log('='.repeat(80) + '\n');

    return bookingRequest;
  }

  // ============================================================
  // CREATE PNR - MAIN ENTRY POINT
  // ============================================================

  async createPNR(bookingData) {
    console.log('\n' + '🎫'.repeat(40));
    console.log('PNR CREATION SERVICE - CREATE PNR');
    console.log('🎫'.repeat(40) + '\n');

    // ============================================================
    // LOG 1: INPUT BOOKING DATA
    // ============================================================
    console.log('\n' + '='.repeat(80));
    console.log('📥 STEP 1: INPUT BOOKING DATA RECEIVED');
    console.log('='.repeat(80));
    console.log('📦 Booking Data Structure:');
    console.log(JSON.stringify(bookingData, null, 2));
    console.log('\n📊 Booking Data Summary:');
    console.log(`   - isRoundTrip: ${bookingData?.isRoundTrip}`);
    console.log(`   - Passengers Count: ${bookingData?.passengers?.length}`);
    console.log(`   - Flight exists: ${!!bookingData?.flight}`);
    console.log(`   - Outbound Flight exists: ${!!bookingData?.outboundFlight}`);
    console.log(`   - Return Flight exists: ${!!bookingData?.returnFlight}`);
    console.log(`   - Selected Seat: ${bookingData?.selectedSeat?.seatCode || 'None'}`);
    console.log('='.repeat(80) + '\n');

    const startTime = Date.now();

    try {
      // ============================================================
      // LOG 2: BUILDING BOOKING REQUEST
      // ============================================================
      console.log('\n' + '='.repeat(80));
      console.log('🔨 STEP 2: BUILDING BOOKING REQUEST');
      console.log('='.repeat(80));
      
      const bookingRequest = this.buildBookingRequest(bookingData);

      if (!bookingRequest) {
        throw new Error('Failed to build booking request');
      }

      // ============================================================
      // LOG 3: FINAL BOOKING REQUEST BEING SENT TO API
      // ============================================================
      console.log('\n' + '='.repeat(80));
      console.log('📤 STEP 3: FINAL BOOKING REQUEST TO API');
      console.log('='.repeat(80));
      console.log('📍 API Endpoint:', `${BASE_URL}/flights/air-create/air-booking`);
      console.log('📋 HTTP Method: POST');
      console.log('\n📦 REQUEST BODY (RAW):');
      console.log(JSON.stringify(bookingRequest, null, 2));
      console.log('\n📊 REQUEST SUMMARY:');
      console.log(`   - Trace ID: ${bookingRequest.traceId}`);
      console.log(`   - Segments Count: ${bookingRequest.segments.length}`);
      console.log(`   - Passengers Count: ${bookingRequest.passengers.length}`);
      console.log(`   - Total Price: ${bookingRequest.airPricingSolution.totalPrice}`);
      console.log(`   - Payment Method: ${bookingRequest.formOfPayment.type}`);
      console.log(`   - Auto Ticket: ${bookingRequest.autoTicket}`);
      console.log('='.repeat(80) + '\n');

      const apiUrl = `${BASE_URL}/flights/air-create/air-booking`;
      
      const response = await axios.post(apiUrl, bookingRequest, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const responseTime = Date.now() - startTime;

      // ============================================================
      // LOG 4: RAW API RESPONSE RECEIVED
      // ============================================================
      console.log('\n' + '='.repeat(80));
      console.log('🟢 STEP 4: RAW API RESPONSE RECEIVED');
      console.log('='.repeat(80));
      console.log(`⏱️ Response Time: ${responseTime}ms`);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      console.log('\n📄 FULL RAW RESPONSE BODY:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('\n📊 RESPONSE SUMMARY:');
      console.log(`   - Success: ${response.data?.success || false}`);
      console.log(`   - Trace ID: ${response.data?.traceId || 'N/A'}`);
      console.log(`   - Data exists: ${!!response.data?.data}`);
      console.log('='.repeat(80) + '\n');
      
      // Store raw response for debugging
      this.lastRawResponse = response.data;

      // Parse the response structure
      const responseData = response.data;
      
      // Check if the response has the expected structure
      if (!responseData || !responseData.data) {
        console.error('❌ Invalid response structure:', responseData);
        throw new Error('Invalid response structure from API');
      }

      // Navigate to SOAP body
      const soapBody = responseData.data?.['SOAP:Envelope']?.['SOAP:Body'];
      
      if (!soapBody) {
        console.error('❌ SOAP body not found in response');
        throw new Error('SOAP body missing in response');
      }

      // Check for SOAP fault
      if (soapBody['SOAP:Fault']) {
        const fault = soapBody['SOAP:Fault'];
        const faultCode = fault.faultcode;
        const faultString = fault.faultstring;
        console.error(`❌ SOAP Fault detected:`);
        console.error(`   - Code: ${faultCode}`);
        console.error(`   - Message: ${faultString}`);
        
        if (fault.detail) {
          console.error(`   - Details:`, JSON.stringify(fault.detail, null, 2));
        }
        
        throw new Error(faultString || 'SOAP fault occurred during booking');
      }

      // Get the AirCreateReservationRsp
      const airCreateReservationRsp = soapBody['universal:AirCreateReservationRsp'];
      
      if (!airCreateReservationRsp) {
        console.error('❌ AirCreateReservationRsp not found in response');
        throw new Error('AirCreateReservationRsp missing in response');
      }

      // Check for warnings/errors in response messages
      const responseMessages = this.normalizeToArray(airCreateReservationRsp['common_v54_0:ResponseMessage']);
      const warnings = [];
      const errors = [];
      
      responseMessages.forEach(msg => {
        const messageText = msg._ || msg;
        const messageCode = msg.$?.Code;
        const messageType = msg.$?.Type;
        
        if (messageType === 'Warning') {
          warnings.push({ code: messageCode, message: messageText });
          console.log(`⚠️ Warning: ${messageText}`);
        } else if (messageType === 'Error') {
          errors.push({ code: messageCode, message: messageText });
          console.error(`❌ Error: ${messageText}`);
        }
      });
      
      // If there are errors, throw them
      if (errors.length > 0) {
        throw new Error(`Booking failed: ${errors.map(e => e.message).join(', ')}`);
      }

      // Extract UniversalRecord
      const universalRecord = airCreateReservationRsp['universal:UniversalRecord'];
      
      if (!universalRecord) {
        console.error('❌ UniversalRecord not found in response');
        throw new Error('UniversalRecord missing in response');
      }

      // Extract locator codes
      const universalLocator = universalRecord.$?.LocatorCode;
      const universalVersion = universalRecord.$?.Version;
      const universalStatus = universalRecord.$?.Status;
      
      // Extract provider reservation info
      const providerReservationInfo = universalRecord['universal:ProviderReservationInfo'];
      const providerLocatorCode = providerReservationInfo?.$?.LocatorCode;
      const providerCode = providerReservationInfo?.$?.ProviderCode;
      const owningPCC = providerReservationInfo?.$?.OwningPCC;
      
      // Extract air reservation
      const airReservation = universalRecord['air:AirReservation'];
      const airLocatorCode = airReservation?.$?.LocatorCode;
      
      // Extract passenger information
      const bookingTraveler = universalRecord['common_v54_0:BookingTraveler'];
      const passengersBooked = [];
      
      if (bookingTraveler) {
        const travelers = this.normalizeToArray(bookingTraveler);
        travelers.forEach(traveler => {
          const travelerName = traveler['common_v54_0:BookingTravelerName'];
          passengersBooked.push({
            key: traveler.$?.Key,
            type: traveler.$?.TravelerType,
            age: traveler.$?.Age,
            dob: traveler.$?.DOB,
            gender: traveler.$?.Gender,
            name: {
              prefix: travelerName?.$?.Prefix,
              first: travelerName?.$?.First,
              last: travelerName?.$?.Last
            }
          });
        });
      }
      
      // Extract flight segments
      const airSegments = [];
      if (airReservation) {
        const segments = this.normalizeToArray(airReservation['air:AirSegment']);
        segments.forEach(segment => {
          airSegments.push({
            key: segment.$?.Key,
            group: segment.$?.Group,
            carrier: segment.$?.Carrier,
            flightNumber: segment.$?.FlightNumber,
            origin: segment.$?.Origin,
            destination: segment.$?.Destination,
            departureTime: segment.$?.DepartureTime,
            arrivalTime: segment.$?.ArrivalTime,
            classOfService: segment.$?.ClassOfService,
            status: segment.$?.Status,
            equipment: segment.$?.Equipment,
            providerCode: segment.$?.ProviderCode,
            travelTime: segment.$?.TravelTime,
            distance: segment.$?.Distance
          });
        });
      }
      
      // Extract pricing info
      const airPricingInfo = [];
      if (airReservation) {
        const pricingInfos = this.normalizeToArray(airReservation['air:AirPricingInfo']);
        pricingInfos.forEach(pricing => {
          const fareInfo = pricing['air:FareInfo'];
          const bookingInfo = pricing['air:BookingInfo'];
          
          airPricingInfo.push({
            key: pricing.$?.Key,
            totalPrice: pricing.$?.TotalPrice,
            basePrice: pricing.$?.BasePrice,
            taxes: pricing.$?.Taxes,
            platingCarrier: pricing.$?.PlatingCarrier,
            providerCode: pricing.$?.ProviderCode,
            latestTicketingTime: pricing.$?.LatestTicketingTime,
            refundable: pricing.$?.Refundable === 'true',
            eticketability: pricing.$?.ETicketability,
            fareInfo: fareInfo ? {
              fareBasis: fareInfo.$?.FareBasis,
              amount: fareInfo.$?.Amount,
              origin: fareInfo.$?.Origin,
              destination: fareInfo.$?.Destination,
              effectiveDate: fareInfo.$?.EffectiveDate,
              passengerTypeCode: fareInfo.$?.PassengerTypeCode
            } : null,
            bookingInfo: bookingInfo ? {
              bookingCode: bookingInfo.$?.BookingCode,
              cabinClass: bookingInfo.$?.CabinClass,
              segmentRef: bookingInfo.$?.SegmentRef,
              fareInfoRef: bookingInfo.$?.FareInfoRef
            } : null
          });
        });
      }
      
      // Extract contact info from SSR
      const ssrList = this.normalizeToArray(universalRecord['common_v54_0:SSR']);
      let contactPhone = null;
      let contactEmail = null;
      
      ssrList.forEach(ssr => {
        if (ssr.$?.Type === 'CTCM') {
          contactPhone = ssr.$?.FreeText;
        } else if (ssr.$?.Type === 'CTCE') {
          contactEmail = ssr.$?.FreeText;
        }
      });
      
      // Extract form of payment
      const formOfPayment = universalRecord['common_v54_0:FormOfPayment'];
      const paymentType = formOfPayment?.$?.Type;
      
      // Extract agency info
      const agencyInfo = universalRecord['common_v54_0:AgencyInfo'];
      const agentAction = agencyInfo?.['common_v54_0:AgentAction'];
      
      // Extract trace and transaction IDs
      const traceId = airCreateReservationRsp.$?.TraceId;
      const transactionId = airCreateReservationRsp.$?.TransactionId;
      const apiResponseTime = airCreateReservationRsp.$?.ResponseTime;
      
      // Extract warnings if any were found
      const warningMessages = warnings.map(w => w.message);
      if (warningMessages.length > 0) {
        console.log(`⚠️ Warnings were returned: ${warningMessages.join(', ')}`);
      }

      const bookingConfirmation = {
        success: true,
        hasWarnings: warnings.length > 0,
        warnings: warningMessages,
        universalLocator: universalLocator,
        universalVersion: universalVersion,
        universalStatus: universalStatus,
        airLocatorCode: airLocatorCode,
        providerLocatorCode: providerLocatorCode,
        providerCode: providerCode,
        owningPCC: owningPCC,
        totalPrice: bookingRequest.airPricingSolution.totalPrice,
        passengersBooked: passengersBooked,
        flightSegments: airSegments,
        pricingInfo: airPricingInfo,
        contactInfo: {
          phone: contactPhone,
          email: contactEmail
        },
        paymentType: paymentType,
        agencyInfo: {
          agentCode: agentAction?.$?.AgentCode,
          branchCode: agentAction?.$?.BranchCode,
          agencyCode: agentAction?.$?.AgencyCode,
          actionType: agentAction?.$?.ActionType,
          eventTime: agentAction?.$?.EventTime
        },
        bookingRequest: bookingRequest,
        traceId: traceId,
        transactionId: transactionId,
        responseTime: apiResponseTime,
        rawResponse: response.data // Include full raw response
      };

      // ============================================================
      // LOG 5: TRANSFORMED BOOKING CONFIRMATION
      // ============================================================
      console.log('\n' + '='.repeat(80));
      console.log('🔄 STEP 5: TRANSFORMED BOOKING CONFIRMATION');
      console.log('='.repeat(80));
      console.log('📦 TRANSFORMED DATA STRUCTURE:');
      console.log(JSON.stringify(bookingConfirmation, null, 2));
      console.log('\n📊 TRANSFORMED DATA SUMMARY:');
      console.log(`   - Universal Locator: ${universalLocator}`);
      console.log(`   - Air Locator: ${airLocatorCode}`);
      console.log(`   - Provider Locator: ${providerLocatorCode}`);
      console.log(`   - Provider Code: ${providerCode}`);
      console.log(`   - Owning PCC: ${owningPCC}`);
      console.log(`   - Total Price: ${bookingConfirmation.totalPrice}`);
      console.log(`   - Passengers Count: ${passengersBooked.length}`);
      console.log(`   - Flight Segments Count: ${airSegments.length}`);
      console.log(`   - Pricing Info Count: ${airPricingInfo.length}`);
      console.log(`   - Warnings Count: ${warnings.length}`);
      console.log(`   - Payment Type: ${paymentType}`);
      console.log(`   - Trace ID: ${traceId}`);
      console.log(`   - Transaction ID: ${transactionId}`);
      console.log(`   - Response Time: ${apiResponseTime}ms`);
      console.log('='.repeat(80) + '\n');

      console.log('\n✨ BOOKING SUCCESSFUL!');
      console.log('='.repeat(80));
      console.log('📋 BOOKING CONFIRMATION SUMMARY:');
      console.log('='.repeat(80));
      console.log(`   Universal Locator: ${universalLocator}`);
      console.log(`   Air Locator: ${airLocatorCode}`);
      console.log(`   Provider Locator: ${providerLocatorCode}`);
      console.log(`   Provider: ${providerCode}`);
      console.log(`   Owning PCC: ${owningPCC}`);
      console.log(`   Passengers: ${passengersBooked.length}`);
      console.log(`   Segments: ${airSegments.length}`);
      console.log(`   Total Price: ${bookingConfirmation.totalPrice}`);
      console.log(`   Trace ID: ${traceId}`);
      console.log(`   Transaction ID: ${transactionId}`);
      console.log(`   API Response Time: ${apiResponseTime}ms`);
      console.log(`   Total Time: ${Date.now() - startTime}ms`);
      
      if (warningMessages.length > 0) {
        console.log(`\n⚠️ Warnings (${warningMessages.length}):`);
        warningMessages.forEach(warning => console.log(`      - ${warning}`));
      }
      console.log('='.repeat(80) + '\n');

      // Return complete response with raw data for copying
      const result = {
        success: true,
        bookingConfirmation,
        bookingRequest,
        rawResponse: response.data
      };

      // ============================================================
      // LOG 6: FINAL RETURN RESULT
      // ============================================================
      console.log('\n' + '='.repeat(80));
      console.log('📤 STEP 6: FINAL RETURN RESULT');
      console.log('='.repeat(80));
      console.log(`   - success: ${result.success}`);
      console.log(`   - bookingConfirmation exists: ${!!result.bookingConfirmation}`);
      console.log(`   - bookingRequest exists: ${!!result.bookingRequest}`);
      console.log(`   - rawResponse exists: ${!!result.rawResponse}`);
      console.log(`   - Raw response size: ${JSON.stringify(result.rawResponse).length} bytes`);
      console.log('='.repeat(80) + '\n');

      return result;

    } catch (error) {
      console.error('\n' + '='.repeat(80));
      console.error('🔴 PNR CREATION FAILED');
      console.error('='.repeat(80));
      console.error(`❌ Error: ${error.message}`);
      console.error(`📍 Endpoint: ${BASE_URL}/flights/air-create/air-booking`);

      if (error.response) {
        console.error(`📊 Response Status: ${error.response.status}`);
        console.error(`📦 Response Data:`);
        console.error(JSON.stringify(error.response.data, null, 2));
        this.lastRawResponse = error.response.data;
      } else if (error.request) {
        console.error('📡 No response received from server');
        console.error(`Request details:`, error.request);
      }
      
      console.error('='.repeat(80) + '\n');

      throw error;
    }
  }
}

// Export singleton instance
const pnrCreationService = new PNRCreationService();

export default pnrCreationService;