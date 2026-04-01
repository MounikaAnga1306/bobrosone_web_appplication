// src/modules/flights/services/paymentGatewayservices.js

import axios from 'axios';

const API_ENDPOINT = 'https://api.bobros.org/bdCreateOrder/createorder-flight-web';

export const createBillDeskOrder = async (bookingConfirmation) => {
  console.log('\n' + '='.repeat(80));
  console.log('✈️ BILLDESK ORDER SERVICE - CREATE ORDER');
  console.log('='.repeat(80));
  console.log('📤 REQUEST ENDPOINT:', API_ENDPOINT);
  console.log('📤 REQUEST METHOD: POST');
  console.log('📦 RECEIVED BOOKING CONFIRMATION DATA:', JSON.stringify(bookingConfirmation, null, 2));
  console.log('='.repeat(80) + '\n');

  try {
    // Calculate amount from passenger pricing
    let calculatedAmount = 0;
    if (bookingConfirmation.pricingInfo && bookingConfirmation.pricingInfo.length > 0) {
      const passengerAmount = bookingConfirmation.pricingInfo[0].basePrice || 
                              bookingConfirmation.pricingInfo[0].totalPrice || '0';
      calculatedAmount = parseFloat(passengerAmount.toString().replace(/[^0-9.-]/g, ''));
      if (isNaN(calculatedAmount)) calculatedAmount = 0;
    } else {
      calculatedAmount = parseFloat(bookingConfirmation.totalPrice?.toString().replace(/[^0-9.-]/g, '')) || 0;
    }

    // Build request body matching API requirements
    const payload = {
      amount: calculatedAmount.toFixed(2), // Format as string with 2 decimal places
      user_id: bookingConfirmation.contactInfo?.phone || "NA",
      paymentfor: "flight",
      universal_locator_code: bookingConfirmation.universalLocator,
      air_locator_code: bookingConfirmation.airLocatorCode,
      provider_locator_code: bookingConfirmation.providerLocatorCode,
      customer: {
        first_name: bookingConfirmation.passengersBooked?.[0]?.name?.first || "Guest",
        last_name: bookingConfirmation.passengersBooked?.[0]?.name?.last || ""
      },
      // Hardcoded values
      ip: "192.168.0.1",
      init_channel: "internet",
      user_agent: "Mozilla/5.0",
      accept_header: "application/json"
    };

    console.log('🏗️ CONSTRUCTED PAYLOAD:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('='.repeat(80) + '\n');

    const response = await axios.post(API_ENDPOINT, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ BILLDESK ORDER SERVICE - SUCCESS');
    console.log('='.repeat(80));
    console.log('📥 RESPONSE STATUS:', response.status);
    console.log('📥 RESPONSE DATA:', JSON.stringify(response.data, null, 2));
    console.log('='.repeat(80) + '\n');

    // Return the full response data to the page
    return response.data;
    
  } catch (error) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ BILLDESK ORDER SERVICE - ERROR');
    console.log('='.repeat(80));

    if (error.response) {
      console.log('📥 RESPONSE STATUS:', error.response.status);
      console.log('📥 RESPONSE DATA:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('⚠️ No response received from server');
      console.log('📥 REQUEST ERROR:', error.message);
    } else {
      console.log('📥 ERROR:', error.message);
    }

    console.log('='.repeat(80) + '\n');
    throw error;
  }
};