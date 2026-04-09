// src/modules/flights/services/pnr_creationService.js

import axios from 'axios';

const BASE_URL = 'https://api.bobros.org';

class PNRCreationService {
  
  navigateFunction = null;
  contextStoreFunction = null;
  pricingBookingContext = null;

  setNavigateAndContext(navigate, storePnrResponse) {
    this.navigateFunction = navigate;
    this.contextStoreFunction = storePnrResponse;
  }

  setPricingBookingContext(context) {
    this.pricingBookingContext = context;
    console.log('✅ PNR Service: PricingBookingContext reference set');
  }

  // Helper to ensure value is always an array
  ensureArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  // Helper to log and make copyable JSON
  logCopyableJSON(label, data) {
    const jsonString = JSON.stringify(data, null, 2);
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 ${label}`);
    console.log(`${'='.repeat(80)}`);
    console.log(jsonString);
    console.log(`${'='.repeat(80)}\n`);
    
    if (typeof window !== 'undefined') {
      window[`__last_${label.replace(/ /g, '_')}`] = data;
      console.log(`💡 Tip: Access via window.__last_${label.replace(/ /g, '_')}`);
    }
    
    return jsonString;
  }

  async createPNR() {
    console.log('\n' + '🎫'.repeat(40));
    console.log('PNR CREATION SERVICE - CREATE PNR');
    console.log('🎫'.repeat(40) + '\n');
    
    try {
      // ============================================================
      // STEP 0: GET DATA DIRECTLY FROM CONTEXT
      // ============================================================
      
      console.log('📦 STEP 0: Fetching data from Context...');
      
      if (!this.pricingBookingContext) {
        throw new Error('PricingBookingContext not set. Call setPricingBookingContext() first.');
      }
      
      const { bookingData } = this.pricingBookingContext;
      const airPriceResponse = bookingData.rawPricingResponse;
      const passengers = bookingData.passengers;
      const contactInfo = bookingData.contactInfo;
      const paymentMethod = bookingData.paymentMethod;
      
      console.log('✅ Context Data Retrieved:');
      console.log(`   - Raw Pricing Response: ${airPriceResponse ? '✅ Present' : '❌ Missing'}`);
      console.log(`   - Passengers: ${passengers?.length || 0}`);
      console.log(`   - Contact Email: ${contactInfo?.email || 'Missing'}`);
      console.log(`   - Payment Method: ${paymentMethod || 'Cash'}`);
      
      if (!airPriceResponse) {
        throw new Error('No pricing response found in context. Please search for flights first.');
      }
      
      if (!passengers || passengers.length === 0) {
        throw new Error('No passengers found in context. Please add passenger details.');
      }
      
      if (!contactInfo || !contactInfo.email) {
        throw new Error('No contact info found in context. Please add contact details.');
      }
      
      // ============================================================
      // STEP 1: EXTRACT DATA FROM PRICING RESPONSE
      // ============================================================
      
      console.log('\n📦 STEP 1: Extracting data from Pricing Response...');
      
      // Handle both possible response structures
      let envelope, body, airPriceRsp, airPriceResult, solution;
      
      // Case 1: Response has data wrapper
      if (airPriceResponse.data && airPriceResponse.data['SOAP:Envelope']) {
        envelope = airPriceResponse.data['SOAP:Envelope'];
        body = envelope['SOAP:Body'];
        airPriceRsp = body['air:AirPriceRsp'];
        airPriceResult = airPriceRsp['air:AirPriceResult'];
        // FIX: AirPricingSolution can be OBJECT or ARRAY
        const pricingSolution = airPriceResult['air:AirPricingSolution'];
        solution = Array.isArray(pricingSolution) ? pricingSolution[0] : pricingSolution;
        console.log('   - Using response structure: data.SOAP:Envelope');
      }
      // Case 2: Response directly has SOAP:Envelope
      else if (airPriceResponse['SOAP:Envelope']) {
        envelope = airPriceResponse['SOAP:Envelope'];
        body = envelope['SOAP:Body'];
        airPriceRsp = body['air:AirPriceRsp'];
        airPriceResult = airPriceRsp['air:AirPriceResult'];
        const pricingSolution = airPriceResult['air:AirPricingSolution'];
        solution = Array.isArray(pricingSolution) ? pricingSolution[0] : pricingSolution;
        console.log('   - Using response structure: SOAP:Envelope');
      }
      else {
        throw new Error('Invalid pricing response structure');
      }
      
      // ============================================================
      // STEP 1a: EXTRACT AIR SEGMENTS (HANDLE MULTIPLE FLIGHTS)
      // ============================================================
      
      const airSegmentsRaw = airPriceRsp['air:AirItinerary']['air:AirSegment'];
      const airSegmentsArray = this.ensureArray(airSegmentsRaw);
      
      console.log(`   - Found ${airSegmentsArray.length} flight segment(s)`);
      
      // Build all segments
      const allSegments = [];
      for (const seg of airSegmentsArray) {
        const segAttrs = seg['$'];
        allSegments.push({
          key: segAttrs.Key,
          group: segAttrs.Group || "0",
          carrier: segAttrs.Carrier,
          flightNumber: segAttrs.FlightNumber,
          origin: segAttrs.Origin,
          destination: segAttrs.Destination,
          departureTime: segAttrs.DepartureTime,
          arrivalTime: segAttrs.ArrivalTime,
          classOfService: segAttrs.ClassOfService,
          flightTime: segAttrs.FlightTime,
          travelTime: segAttrs.TravelTime,
          distance: segAttrs.Distance,
          equipment: segAttrs.Equipment || "32N",
          changeOfPlane: "false",
          optionalServicesIndicator: "false",
          availabilitySource: "S",
          participantLevel: "Secure Sell",
          linkAvailability: "true",
          availabilityDisplayType: "Fare Specific Fare Quote Unbooked",
          providerCode: segAttrs.ProviderCode || "1G"
        });
        console.log(`   - Segment ${allSegments.length}: ${segAttrs.Carrier} ${segAttrs.FlightNumber} (${segAttrs.Origin} → ${segAttrs.Destination})`);
      }
      
      // ============================================================
      // STEP 1b: EXTRACT HOST TOKENS (CAN BE OBJECT OR ARRAY)
      // ============================================================
      
      let hostTokensRaw = solution['common_v54_0:HostToken'];
      let hostTokensArray = this.ensureArray(hostTokensRaw);
      console.log(`   - Host tokens found: ${hostTokensArray.length}`);
      
      // Map host tokens by passenger type
      const hostTokenMap = {};
      hostTokensArray.forEach(token => {
        const tokenValue = token['_'] || token.value;
        const tokenKey = token['$']?.Key || token.key;
        if (tokenValue.includes('ADT')) hostTokenMap.ADT = { key: tokenKey, value: tokenValue };
        else if (tokenValue.includes('CNN')) hostTokenMap.CNN = { key: tokenKey, value: tokenValue };
        else if (tokenValue.includes('INF')) hostTokenMap.INF = { key: tokenKey, value: tokenValue };
      });
      console.log(`   - Host token types: ${Object.keys(hostTokenMap).join(', ') || 'None'}`);
      
      // ============================================================
      // STEP 1c: EXTRACT AIR PRICING INFO (CAN BE OBJECT OR ARRAY)
      // ============================================================
      
      let airPricingInfoRaw = solution['air:AirPricingInfo'];
      let airPricingInfoArray = this.ensureArray(airPricingInfoRaw);
      console.log(`   - AirPricingInfo entries: ${airPricingInfoArray.length}`);
      
      // Map pricing info by passenger type
      const pricingInfoMap = {};
      for (const info of airPricingInfoArray) {
        const passengerType = info['air:PassengerType']?.['$']?.Code;
        if (passengerType) {
          // Handle BookingInfo - can be object (single segment) or array (multiple segments)
          let bookingInfoRaw = info['air:BookingInfo'];
          let bookingInfoArray = this.ensureArray(bookingInfoRaw);
          
          pricingInfoMap[passengerType] = {
            totalPrice: info['$']?.TotalPrice,
            basePrice: info['$']?.BasePrice,
            taxes: info['$']?.Taxes,
            fareBasis: info['air:FareInfo']?.['$']?.FareBasis,
            bookingInfos: bookingInfoArray.map(bi => ({
              bookingCode: bi['$']?.BookingCode,
              cabinClass: bi['$']?.CabinClass,
              segmentRef: bi['$']?.SegmentRef,
              hostTokenRef: bi['$']?.HostTokenRef
            }))
          };
        }
      }
      console.log(`   - Pricing types: ${Object.keys(pricingInfoMap).join(', ') || 'None'}`);
      
      // ============================================================
      // STEP 2: BUILD ALL SEGMENTS FOR REQUEST
      // ============================================================
      
      console.log('\n📦 STEP 2: Building all segments for request...');
      
      // Use the already built allSegments array
      const segmentsForRequest = allSegments;
      console.log(`   ✅ Built ${segmentsForRequest.length} segment(s)`);
      
      // ============================================================
      // STEP 3: BUILD AIR PRICING INFO FOR EACH PASSENGER
      // ============================================================
      
      console.log('\n📦 STEP 3: Building AirPricingInfo for each passenger...');
      
      const airPricingInfoList = [];
      const allHostTokens = [];
      let travelerRef = 1;
      
      // Sort passengers: ADT first, then CNN, then INF
      const sortedPassengers = [...passengers].sort((a, b) => {
        const order = { ADT: 1, CNN: 2, INF: 3 };
        return order[a.code] - order[b.code];
      });
      
      for (const passenger of sortedPassengers) {
        const passengerType = passenger.code;
        const pricing = pricingInfoMap[passengerType];
        const hostToken = hostTokenMap[passengerType];
        
        if (!pricing || !hostToken) {
          console.warn(`⚠️ Missing data for ${passengerType}`);
          console.log('   Available pricing keys:', Object.keys(pricingInfoMap));
          console.log('   Available host token keys:', Object.keys(hostTokenMap));
          continue;
        }
        
        // Add host token (deduplicate)
        if (!allHostTokens.find(t => t.key === hostToken.key)) {
          allHostTokens.push({ key: hostToken.key, value: hostToken.value });
        }
        
        const fareInfoKey = `FI-${passengerType}-${Date.now()}-${travelerRef}`;
        
        // Build fare info (shared across all segments)
        const fareInfo = {
          key: fareInfoKey,
          fareBasis: pricing.fareBasis,
          passengerTypeCode: passengerType,
          origin: segmentsForRequest[0]?.origin || 'HYD',
          destination: segmentsForRequest[segmentsForRequest.length - 1]?.destination || 'DEL',
          effectiveDate: new Date().toISOString().replace('Z', '+05:30'),
          departureDate: segmentsForRequest[0]?.departureTime?.split('T')[0] || new Date().toISOString().split('T')[0],
          amount: pricing.basePrice,
          privateFare: "false",
          negotiatedFare: "false",
          promotionalFare: "false",
          fareRuleKey: ""
        };
        
        // Build booking infos - ONE PER SEGMENT
        const bookingInfos = [];
        for (let i = 0; i < segmentsForRequest.length; i++) {
          const segment = segmentsForRequest[i];
          const bookingInfoData = pricing.bookingInfos?.[i] || pricing.bookingInfos?.[0];
          
          bookingInfos.push({
            bookingCode: bookingInfoData?.bookingCode || pricing.bookingCode || "S",
            cabinClass: bookingInfoData?.cabinClass || "Economy",
            fareInfoRef: fareInfoKey,
            segmentRef: segment.key,
            hostTokenRef: hostToken.key
          });
        }
        
        const airPricingInfo = {
          key: `API-${passengerType}-${Date.now()}-${travelerRef}`,
          totalPrice: pricing.totalPrice,
          basePrice: pricing.basePrice,
          taxes: pricing.taxes || "INR0",
          pricingMethod: "Guaranteed",
          refundable: true,
          eticketability: "Yes",
          platingCarrier: segmentsForRequest[0]?.carrier || "AI",
          fareInfos: [fareInfo],
          bookingInfos: bookingInfos,
          passengerTypes: [{
            code: passengerType,
            bookingTravelerRef: travelerRef.toString(),
            age: passenger.age?.toString() || (passengerType === 'ADT' ? "25" : passengerType === 'CNN' ? "8" : "1"),
            firstName: (passenger.firstName || "").toUpperCase(),
            lastName: (passenger.lastName || "").toUpperCase()
          }]
        };
        
        airPricingInfoList.push(airPricingInfo);
        console.log(`   ✅ ${passengerType}: ${passenger.firstName} ${passenger.lastName} - Price: ${pricing.totalPrice} (${bookingInfos.length} booking info(s))`);
        travelerRef++;
      }
      
      // Calculate totals
      let totalPrice = 0, totalBasePrice = 0, totalTaxes = 0;
      airPricingInfoList.forEach(info => {
        totalPrice += parseInt(info.totalPrice.replace('INR', '')) || 0;
        totalBasePrice += parseInt(info.basePrice.replace('INR', '')) || 0;
        totalTaxes += parseInt(info.taxes.replace('INR', '')) || 0;
      });
      
      const airPricingSolution = {
        key: `SOL-${Date.now()}`,
        totalPrice: `INR${totalPrice}`,
        basePrice: `INR${totalBasePrice}`,
        fees: "INR0",
        taxes: `INR${totalTaxes}`,
        airPricingInfo: airPricingInfoList,
        hostTokens: allHostTokens
      };
      
      console.log(`\n💰 Total Price: ${airPricingSolution.totalPrice}`);
      console.log(`   - Base Price: ${airPricingSolution.basePrice}`);
      console.log(`   - Taxes: ${airPricingSolution.taxes}`);
      console.log(`   - Segments in request: ${segmentsForRequest.length}`);
      console.log(`   - Passenger types: ${airPricingInfoList.map(p => p.passengerTypes[0].code).join(', ')}`);
      
      // ============================================================
      // STEP 4: BUILD PASSENGERS LIST
      // ============================================================
      
      console.log('\n📦 STEP 4: Building Passengers List...');
      
      const passengersList = sortedPassengers.map(p => ({
        code: p.code,
        firstName: (p.firstName || "").toUpperCase(),
        lastName: (p.lastName || "").toUpperCase(),
        dob: p.dob || (p.code === 'ADT' ? "1990-01-01" : p.code === 'CNN' ? "2016-01-01" : "2024-01-01"),
        gender: p.gender || "F",
        nationality: p.nationality || "IN",
        age: p.age || (p.code === 'ADT' ? 25 : p.code === 'CNN' ? 8 : 1)
      }));
      
      passengersList.forEach(p => {
        console.log(`   ✅ ${p.code}: ${p.firstName} ${p.lastName} (Age: ${p.age})`);
      });
      
      // ============================================================
      // STEP 5: BUILD FINAL REQUEST
      // ============================================================
      
      console.log('\n📦 STEP 5: Building Final Request...');
      
      const bookingRequest = {
        traceId: `BOBROS-${Date.now()}`,
        passengers: passengersList,
        segments: segmentsForRequest,  // ← Now sends ALL segments
        airPricingSolution: airPricingSolution,
        contactInfo: {
          email: contactInfo.email,
          phone: {
            countryCode: contactInfo.phone?.countryCode || "91",
            number: contactInfo.phone?.number || "9999999999"
          }
        },
        formOfPayment: {
          type: paymentMethod === 'card' ? 'CreditCard' : 
                 paymentMethod === 'upi' ? 'UPI' : 
                 paymentMethod === 'netbanking' ? 'NetBanking' : 'Cash'
        },
        autoTicket: false
      };
      
      // Log the complete request body for copying
      this.logCopyableJSON('PNR CREATION REQUEST BODY (COPY THIS)', bookingRequest);
      
      // ============================================================
      // STEP 6: SEND REQUEST
      // ============================================================
      
      console.log('\n📤 STEP 6: Sending PNR Creation Request...');
      console.log(`   - URL: ${BASE_URL}/flights/air-create/air-booking`);
      console.log(`   - Method: POST`);
      console.log(`   - Segments: ${segmentsForRequest.length}`);
      console.log(`   - Passengers: ${passengersList.length}`);
      console.log(`   - Request size: ${JSON.stringify(bookingRequest).length} bytes`);
      
      const startTime = Date.now();
      
      const response = await axios.post(`${BASE_URL}/flights/air-create/air-booking`, bookingRequest, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });
      
      const endTime = Date.now();
      console.log(`\n📥 Response received in ${endTime - startTime}ms`);
      console.log(`   - Status: ${response.status} ${response.statusText}`);
      console.log(`   - Response size: ${JSON.stringify(response.data).length} bytes`);
      
      // Log the complete response body for copying
      this.logCopyableJSON('PNR CREATION RESPONSE BODY (COPY THIS)', response.data);
      
      // ============================================================
      // STEP 7: EXTRACT PNR NUMBER
      // ============================================================
      
      console.log('\n📦 STEP 7: Extracting PNR Number...');
      
      let pnrNumber = null;
      let universalLocator = null;
      let airLocatorCode = null;
      
      // Try multiple possible paths to find PNR
      const possiblePaths = [
        () => response.data?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']?.$?.LocatorCode,
        () => response.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']?.$?.LocatorCode,
        () => response.data?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:ProviderReservationInfo']?.$?.LocatorCode,
        () => response.data?.universalRecord?.LocatorCode,
        () => response.data?.pnrNumber || response.data?.bookingReference,
        () => {
          const str = JSON.stringify(response.data);
          const match = str.match(/LocatorCode["']?\s*:\s*["']([A-Z0-9]+)["']/);
          return match ? match[1] : null;
        }
      ];
      
      for (const path of possiblePaths) {
        try {
          const value = path();
          if (value && typeof value === 'string' && value.length >= 5) {
            pnrNumber = value;
            universalLocator = value;
            console.log(`   ✅ Found PNR via path ${possiblePaths.indexOf(path) + 1}: ${pnrNumber}`);
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }
      
      if (!pnrNumber) {
        console.warn('⚠️ Could not extract PNR number from response');
        console.log('   Response structure:', Object.keys(response.data || {}));
        if (response.data?.data) {
          console.log('   Response.data keys:', Object.keys(response.data.data));
        }
      } else {
        console.log(`\n✅ PNR NUMBER EXTRACTED: ${pnrNumber}`);
      }
      
      // ============================================================
      // STEP 8: STORE RESPONSE IN CONTEXT
      // ============================================================
      
      console.log('\n📦 STEP 8: Storing Response in Context...');
      
      if (this.contextStoreFunction && response.data) {
        this.contextStoreFunction(response.data);
        console.log('   ✅ Response stored via contextStoreFunction');
      } else {
        console.log('   ⚠️ No contextStoreFunction provided');
      }
      
      // Update booking status in context if available
      if (this.pricingBookingContext && pnrNumber) {
        this.pricingBookingContext.updateBookingStatus('confirmed', pnrNumber, pnrNumber);
        console.log('   ✅ Booking status updated in context');
      }
      
      // ============================================================
      // STEP 9: NAVIGATE
      // ============================================================
      
      if (this.navigateFunction) {
        console.log('\n🚀 STEP 9: Navigating to passenger review page...');
        this.navigateFunction('/flights/passenger-review');
      }
      
      console.log('\n' + '✅'.repeat(40));
      console.log('PNR CREATION COMPLETED SUCCESSFULLY');
      console.log('✅'.repeat(40) + '\n');
      
      return { 
        success: true, 
        pnrNumber, 
        universalLocator,
        airLocatorCode,
        bookingRequest, 
        rawResponse: response.data 
      };
      
    } catch (error) {
      console.error('\n' + '❌'.repeat(40));
      console.error('PNR CREATION FAILED');
      console.error('❌'.repeat(40));
      console.error(`Error: ${error.message}`);
      if (error.stack) console.error(`Stack: ${error.stack}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
        this.logCopyableJSON('ERROR RESPONSE BODY', error.response.data);
      }
      console.error('❌'.repeat(40) + '\n');
      
      // Update booking status in context if available
      if (this.pricingBookingContext) {
        this.pricingBookingContext.updateBookingStatus('failed');
        if (this.pricingBookingContext.setBookingError) {
          this.pricingBookingContext.setBookingError(error.message);
        }
      }
      
      return { success: false, error: error.message };
    }
  }
}

export default new PNRCreationService();