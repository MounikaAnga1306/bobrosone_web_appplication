// src/modules/flights/services/seatMapService.js

import axios from 'axios';

// Constants
const BASE_URL = 'https://api.bobros.org';

class SeatMapService {
  constructor() {
    this.storedHostToken = null;
  }

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  normalizeToArray(data) {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  }

  extractHostTokenFromPricingResponse(pricingResult) {
    console.log('\n🔍 Extracting host token from pricing result');
    
    try {
      let hostToken = null;
      
      // Try different paths to find host token
      if (pricingResult?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']?.['air:AirItinerary']?.['common_v54_0:HostToken']) {
        hostToken = pricingResult.data['SOAP:Envelope']['SOAP:Body']['air:AirPriceRsp']['air:AirItinerary']['common_v54_0:HostToken'];
      }
      else if (pricingResult?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']?.['air:AirItinerary']?.['common_v54_0:HostToken']) {
        hostToken = pricingResult['SOAP:Envelope']['SOAP:Body']['air:AirPriceRsp']['air:AirItinerary']['common_v54_0:HostToken'];
      }
      else if (pricingResult?.data?.['air:AirPriceRsp']?.['air:AirItinerary']?.['common_v54_0:HostToken']) {
        hostToken = pricingResult.data['air:AirPriceRsp']['air:AirItinerary']['common_v54_0:HostToken'];
      }
      else if (pricingResult?.['air:AirPriceRsp']?.['air:AirItinerary']?.['common_v54_0:HostToken']) {
        hostToken = pricingResult['air:AirPriceRsp']['air:AirItinerary']['common_v54_0:HostToken'];
      }
      
      if (hostToken) {
        const hostTokensArray = this.normalizeToArray(hostToken);
        
        this.storedHostToken = {
          key: hostTokensArray[0]?.$?.Key,
          value: hostTokensArray[0]?._,
          allTokens: hostTokensArray.map(t => ({
            key: t.$?.Key,
            value: t._
          }))
        };
        
        console.log('✅ Host token extracted successfully!');
        console.log(`   - Key: ${this.storedHostToken.key}`);
        console.log(`   - Value: ${this.storedHostToken.value?.substring(0, 50)}...`);
        
        return this.storedHostToken;
      }
      
      console.log('⚠️ No host token found in pricing result');
      return null;
    } catch (error) {
      console.error('❌ Error extracting host token:', error.message);
      return null;
    }
  }

  extractTravelerKey(passenger, index) {
    // Generate a traveler key based on passenger data
    // This should match the format expected by the API
    const baseKey = `PAX-${index + 1}`;
    // For demo purposes, generate a base64-like key
    return btoa(`${passenger.firstName}${passenger.lastName}${passenger.code}`).replace(/=/g, '');
  }

  // ============================================================
  // BUILD SEAT MAP REQUEST FROM BOOKING DATA
  // ============================================================

  buildSeatMapRequest(bookingData) {
    console.log('\n🔧 BUILDING SEAT MAP REQUEST');
    console.log('📋 Booking Data Received:', {
      isRoundTrip: bookingData?.isRoundTrip,
      hasSelectedOption: !!bookingData?.selectedPricingOption,
      passengersCount: bookingData?.passengers?.length,
      hasFlight: !!bookingData?.flight,
      hasOutboundFlight: !!bookingData?.outboundFlight,
      hasReturnFlight: !!bookingData?.returnFlight
    });
    
    const {
      selectedPricingOption,
      flight,
      outboundFlight,
      returnFlight,
      isRoundTrip,
      passengers,
      rawPricingResponse,
      pricingResult
    } = bookingData;

    // Step 1: Extract host token from pricing response
    const hostTokenData = this.extractHostTokenFromPricingResponse(rawPricingResponse || pricingResult);
    
    // Step 2: Get segments
    let segments = [];
    if (isRoundTrip) {
      const outboundSegments = this.normalizeToArray(outboundFlight?.segments || outboundFlight);
      const returnSegments = this.normalizeToArray(returnFlight?.segments || returnFlight);
      segments = [...outboundSegments, ...returnSegments];
    } else {
      segments = this.normalizeToArray(flight?.segments || flight);
    }
    
    console.log(`📋 Segments found: ${segments.length}`);
    
    // Step 3: Get booking code from selected option
    let bookingCode = 'U';
    if (selectedPricingOption?.bookingInfo) {
      const bookingInfos = this.normalizeToArray(selectedPricingOption.bookingInfo);
      if (bookingInfos[0]?.bookingCode) bookingCode = bookingInfos[0].bookingCode;
    } else if (selectedPricingOption?.fareInfo) {
      const fareInfos = this.normalizeToArray(selectedPricingOption.fareInfo);
      if (fareInfos[0]?.fareBasis) bookingCode = fareInfos[0].fareBasis.charAt(0);
    }
    
    // Step 4: Build segments for request
    const requestSegments = segments.map((segment, idx) => {
      const seg = segment.$ || segment;
      
      // Get host token ref from segment or use stored host token key
      let hostTokenRef = seg.HostTokenRef || segment.hostTokenRef;
      
      // If no host token ref in segment, use stored host token key
      if (!hostTokenRef && hostTokenData) {
        hostTokenRef = hostTokenData.key;
      }
      
      return {
        key: seg.Key || segment.key,
        group: seg.Group || segment.group || (isRoundTrip && idx >= (outboundFlight?.segments?.length || 0) ? '1' : '0'),
        carrier: seg.Carrier || segment.carrier,
        flightNumber: seg.FlightNumber || segment.flightNumber,
        origin: seg.Origin || segment.origin,
        destination: seg.Destination || segment.destination,
        departureTime: seg.DepartureTime || segment.departureTime,
        arrivalTime: seg.ArrivalTime || segment.arrivalTime,
        classOfService: bookingCode,
        hostTokenRef: hostTokenRef
      };
    });
    
    // Step 5: Build host token object
    const hostToken = hostTokenData ? {
      key: hostTokenData.key,
      value: hostTokenData.value
    } : {
      key: null,
      value: null
    };
    
    // Step 6: Build travelers for request (for now, use first passenger)
    // Note: The seat map API currently expects one traveler per request
    // For multiple passengers, you may need to make multiple calls or handle differently
    const firstPassenger = passengers && passengers.length > 0 ? passengers[0] : null;
    
    const travelers = firstPassenger ? [{
      key: "null",
      type: firstPassenger.code,
      firstName: firstPassenger.firstName,
      lastName: firstPassenger.lastName
    }] : [];
    
    // Step 7: Build complete seat map request
    const seatMapRequest = {
      type: "preBooking",
      segments: requestSegments,
      hostToken: hostToken,
      travelers: travelers
    };
    
    console.log('\n✅ Seat map request built successfully!');
    console.log(`   - Segments: ${requestSegments.length}`);
    console.log(`   - Travelers: ${travelers.length}`);
    console.log(`   - Host Token Key: ${hostToken.key}`);
    console.log(`   - Host Token Value: ${hostToken.value?.substring(0, 50)}...`);
    
    return seatMapRequest;
  }

  // ============================================================
  // GET SEAT MAP - CALL SEAT MAP API
  // ============================================================

  async getSeatMap(seatMapRequest) {
    console.log('\n' + '💺'.repeat(40));
    console.log('SEAT MAP SERVICE - GET SEAT MAP');
    console.log('💺'.repeat(40) + '\n');

    const startTime = Date.now();

    try {
      if (!seatMapRequest) {
        throw new Error('No seat map request provided');
      }

      console.log('\n📦 SEAT MAP REQUEST BODY:');
      console.log(JSON.stringify(seatMapRequest, null, 2));
      console.log('');

      const apiUrl = `${BASE_URL}/flights/seatmap/seat-map`;
      console.log(`📍 ENDPOINT: ${apiUrl}`);
      console.log(`📋 METHOD: POST`);
      console.log(`📊 REQUEST SIZE: ${JSON.stringify(seatMapRequest).length} characters`);

      const response = await axios.post(apiUrl, seatMapRequest, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const responseTime = Date.now() - startTime;

      console.log('\n' + '='.repeat(80));
      console.log('🟢 SEAT MAP API RESPONSE');
      console.log('='.repeat(80));
      console.log(`⏱️ Response Time: ${responseTime}ms`);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      console.log(`📊 Headers:`, JSON.stringify(response.headers, null, 2));
      console.log(`📊 Response Data Type: ${typeof response.data}`);
      console.log(`📊 Response Data Keys: ${response.data ? Object.keys(response.data).join(', ') : 'null'}`);
      
      // Log the complete raw response
      console.log('\n📄 COMPLETE RAW SEAT MAP RESPONSE BODY:');
      console.log('```json');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('```');
      console.log('='.repeat(80));

      // Check for SOAP Fault
      const soapBody = response.data?.data?.['SOAP:Envelope']?.['SOAP:Body'] ||
                       response.data?.['SOAP:Envelope']?.['SOAP:Body'];

      if (soapBody?.['SOAP:Fault']) {
        const fault = soapBody['SOAP:Fault'];
        const errorMessage = fault.faultstring;
        const errorCode = fault.detail?.['common_v54_0:ErrorInfo']?.['common_v54_0:Code'];
        const errorService = fault.detail?.['common_v54_0:ErrorInfo']?.['common_v54_0:Service'];
        
        console.error('\n❌ SOAP FAULT DETECTED:');
        console.error(`   Code: ${errorCode || 'N/A'}`);
        console.error(`   Service: ${errorService || 'N/A'}`);
        console.error(`   Message: ${errorMessage}`);
        
        throw new Error(errorMessage || 'Seat map API error');
      }

      // Extract warnings if any
      let warnings = [];
      const responseMsg = response.data?.data?.ResponseMessage || response.data?.ResponseMessage;
      if (responseMsg) {
        warnings = this.normalizeToArray(responseMsg).map(msg => ({
          message: msg._,
          code: msg.$?.Code,
          type: msg.$?.Type
        }));
      }

      console.log('\n✨ SEAT MAP RETRIEVED SUCCESSFULLY!');
      if (warnings.length > 0) {
        console.log(`   Warnings: ${warnings.length}`);
        warnings.forEach((w, i) => console.log(`     ${i+1}. ${w.message}`));
      }
      console.log(`   Total Time: ${responseTime}ms`);
      console.log('='.repeat(80) + '\n');

      return {
        success: true,
        seatMapData: response.data,
        rawResponse: response.data,
        warnings: warnings
      };

    } catch (error) {
      console.error('\n' + '='.repeat(80));
      console.error('🔴 SEAT MAP API FAILED');
      console.error('='.repeat(80));
      console.error(`❌ Error: ${error.message}`);
      console.error(`📍 Endpoint: ${BASE_URL}/flights/seatmap/seat-map`);

      if (error.response) {
        console.error(`📊 Response Status: ${error.response.status}`);
        console.error(`📊 Response Headers:`, JSON.stringify(error.response.headers, null, 2));
        console.error(`📦 Error Response Data:`);
        console.error(JSON.stringify(error.response.data, null, 2));
        
        // Try to extract SOAP Fault from error response
        const errorData = error.response.data;
        const soapBody = errorData?.data?.['SOAP:Envelope']?.['SOAP:Body'] ||
                         errorData?.['SOAP:Envelope']?.['SOAP:Body'];
        
        if (soapBody?.['SOAP:Fault']) {
          const fault = soapBody['SOAP:Fault'];
          console.error(`\n📋 SOAP Fault Details:`);
          console.error(`   Code: ${fault.faultcode || 'N/A'}`);
          console.error(`   Message: ${fault.faultstring || 'N/A'}`);
          if (fault.detail?.['common_v54_0:ErrorInfo']) {
            const errorInfo = fault.detail['common_v54_0:ErrorInfo'];
            console.error(`   Error Code: ${errorInfo['common_v54_0:Code'] || 'N/A'}`);
            console.error(`   Service: ${errorInfo['common_v54_0:Service'] || 'N/A'}`);
            console.error(`   Type: ${errorInfo['common_v54_0:Type'] || 'N/A'}`);
            console.error(`   Description: ${errorInfo['common_v54_0:Description'] || 'N/A'}`);
          }
        }
      } else if (error.request) {
        console.error(`⚠️ No response received from server`);
      }
      
      console.error('='.repeat(80) + '\n');
      
      return {
        success: false,
        error: error.message,
        rawError: error.response?.data
      };
    }
  }

  // ============================================================
  // GET STORED HOST TOKEN
  // ============================================================

  getStoredHostToken() {
    return this.storedHostToken;
  }
}

// Export singleton instance
const seatMapService = new SeatMapService();

export default seatMapService;