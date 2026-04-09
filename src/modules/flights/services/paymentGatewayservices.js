// src/modules/flights/services/paymentGatewayservices.js

import axios from 'axios';

const API_ENDPOINT = 'https://api.bobros.org/bdCreateOrder/createorder-flight-web';

export const createBillDeskOrder = async (bookingData, pnrData) => {
  console.log('\n' + '='.repeat(80));
  console.log('✈️ BILLDESK ORDER SERVICE - CREATE ORDER');
  console.log('='.repeat(80));
  console.log('📤 REQUEST ENDPOINT:', API_ENDPOINT);
  console.log('📤 REQUEST METHOD: POST');
  
  // ============================================================
  // DYNAMICALLY FETCH DATA FROM CONTEXT (passed as parameters)
  // ============================================================
  
  // Get data from PricingBookingContext
  const passengers = bookingData?.passengers || [];
  const contactInfo = bookingData?.contactInfo;
  const selectedFare = bookingData?.selectedFare;
  
  // Get data from PnrResponseContext
  const pnrNumber = pnrData?.pnrNumber || pnrData?.universalLocator;
  const airLocatorCode = pnrData?.airLocatorCode;
  const providerLocatorCode = pnrData?.providerLocatorCode || "1G";
  
  // Calculate amount from selected fare
  let calculatedAmount = 0;
  if (selectedFare?.totalPrice) {
    calculatedAmount = parseFloat(selectedFare.totalPrice.toString().replace(/[^0-9.-]/g, ''));
  } else if (bookingData?.totalPrice) {
    calculatedAmount = parseFloat(bookingData.totalPrice.toString().replace(/[^0-9.-]/g, ''));
  }
  
  // Get passenger name (first passenger)
  const firstPassenger = passengers[0] || {};
  const firstName = firstPassenger.firstName || firstPassenger.first_name || "Guest";
  const lastName = firstPassenger.lastName || firstPassenger.last_name || "";
  
  // Get phone number
  const phoneNumber = contactInfo?.phone?.number || contactInfo?.phone || "NA";
  
  // ============================================================
  // BUILD REQUEST BODY
  // ============================================================
  const payload = {
    //amount: calculatedAmount.toFixed(2),  // Dynamic from selected fare
    amount:"1.00",
    user_id: phoneNumber,                 // Dynamic from contact info
    paymentfor: "flight",                 // Hardcoded (always flight)
    universal_locator_code: pnrNumber,    // Dynamic from PNR response
    air_locator_code: airLocatorCode,     // Dynamic from PNR response
    provider_locator_code: providerLocatorCode, // Dynamic from PNR response
    customer: {
      first_name: firstName,              // Dynamic from passenger data
      last_name: lastName                 // Dynamic from passenger data
    },
    // Hardcoded values (as you specified)
    ip: "192.168.0.1",
    init_channel: "internet",
    user_agent: "Mozilla/5.0",
    accept_header: "application/json"
  };

  console.log('🏗️ CONSTRUCTED PAYLOAD:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('='.repeat(80) + '\n');

  try {
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