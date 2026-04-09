// src/modules/flights/services/seatMapService.js

import axios from 'axios';

const BASE_URL = 'https://api.bobros.org';

class SeatMapService {
  
  // ============================================================
  // BUILD SEAT MAP REQUEST USING DATA FROM CONTEXT
  // ============================================================
  buildSeatMapRequest(contextData) {
    console.log('\n🔧 Building seat map request from Context data');
    
    // Get pre-extracted data from context
    const hostToken = contextData?.hostToken || contextData?.selectedFare?.hostToken;
    const flightSegments = contextData?.flightSegments;
    const passengers = contextData?.passengers;
    const selectedFare = contextData?.selectedFare;
    
    // Validate required data
    if (!hostToken || !hostToken.key || !hostToken.value) {
      throw new Error('Host token not found in context. Please ensure fare is selected.');
    }
    
    if (!flightSegments || flightSegments.length === 0) {
      throw new Error('Flight segments not found in context.');
    }
    
    if (!passengers || passengers.length === 0) {
      throw new Error('Passengers not found in context. Please add passenger details.');
    }
    
    console.log('✅ Using data from Context:');
    console.log(`   - Host Token Key: ${hostToken.key}`);
    console.log(`   - Flight Segments: ${flightSegments.length}`);
    console.log(`   - Passengers: ${passengers.length}`);
    console.log(`   - Selected Fare: ${selectedFare?.brand?.name || 'N/A'}`);
    
    // Build segments with host token reference
    const segments = flightSegments.map(segment => ({
      key: segment.key,
      group: segment.group || "0",
      carrier: segment.carrier,
      flightNumber: segment.flightNumber,
      origin: segment.origin,
      destination: segment.destination,
      departureTime: segment.departureTime,
      arrivalTime: segment.arrivalTime,
      classOfService: segment.classOfService || selectedFare?.bookingInfo?.bookingCode || 'U',
      hostTokenRef: hostToken.key
    }));
    
    // Build travelers from passenger data
    // Build travelers from passenger data
const travelers = passengers.map((passenger, index) => ({
  key: `null${index + 1}`,
  type: passenger.code || 'ADT',

  firstName: passenger.firstName || '',
  lastName: passenger.lastName || '',
  age: passenger.age || null,
  dateOfBirth: passenger.dob || null
}));
    
    // Build complete request
    const request = {
      type: "preBooking",
      segments: segments,
      hostToken: {
        key: hostToken.key,
        value: hostToken.value
      },
      travelers: travelers,
      // Additional metadata that might be useful for seat map
      metadata: {
        cabinClass: selectedFare?.bookingInfo?.cabinClass || 'Economy',
        fareBrand: selectedFare?.brand?.name || null,
        isRoundTrip: contextData?.isRoundTrip || false,
        tripType: contextData?.tripType || 'one-way'
      }
    };
    
    console.log('📦 Seat map request built successfully');
    console.log('   - Segments count:', segments.length);
    console.log('   - Travelers count:', travelers.length);
    
    return request;
  }
  
  // ============================================================
  // GET SEAT MAP - MAIN API CALL USING CONTEXT DATA
  // ============================================================
  async getSeatMap(contextData) {
    console.log('\n' + '💺'.repeat(40));
    console.log('SEAT MAP SERVICE - GET SEAT MAP');
    console.log('💺'.repeat(40) + '\n');
    
    try {
      if (!contextData) {
        throw new Error('No context data provided. Please ensure PricingBookingProvider is set up.');
      }
      
      // Validate essential data is present
      if (!contextData.hostToken && !contextData.selectedFare?.hostToken) {
        throw new Error('No host token found. Please select a fare first.');
      }
      
      if (!contextData.flightSegments || contextData.flightSegments.length === 0) {
        throw new Error('No flight segments found.');
      }
      
      if (!contextData.passengers || contextData.passengers.length === 0) {
        throw new Error('No passenger details found. Please fill passenger information.');
      }
      
      // Build request using context data
      const requestBody = this.buildSeatMapRequest(contextData);
      
      const apiUrl = `${BASE_URL}/flights/seatmap/seat-map`;
      
      console.log('📤 REQUEST BODY:');
      console.log(JSON.stringify(requestBody, null, 2));
      
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      console.log('\n📄 RESPONSE STATUS:', response.status);
      console.log('📄 RESPONSE DATA:', JSON.stringify(response.data, null, 2));
      
      return {
        success: true,
        data: response.data,
        rawResponse: response.data,
        requestSent: requestBody
      };
      
    } catch (error) {
      console.error('\n❌ SEAT MAP API FAILED:', error.message);
      
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      }
      
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
        rawError: error.response?.data
      };
    }
  }
  
  // ============================================================
  // HELPER: VALIDATE IF SEAT MAP CAN BE FETCHED
  // ============================================================
  canFetchSeatMap(contextData) {
    if (!contextData) return false;
    
    const hasHostToken = !!(contextData.hostToken || contextData.selectedFare?.hostToken);
    const hasSegments = !!(contextData.flightSegments && contextData.flightSegments.length > 0);
    const hasPassengers = !!(contextData.passengers && contextData.passengers.length > 0);
    
    const isValid = hasHostToken && hasSegments && hasPassengers;
    
    if (!isValid) {
      console.warn('Cannot fetch seat map - missing required data:', {
        hasHostToken,
        hasSegments,
        hasPassengers
      });
    }
    
    return isValid;
  }
}

export default new SeatMapService();