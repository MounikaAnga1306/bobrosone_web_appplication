// src/modules/flights/services/paymentConfirmationService.js

const API_BASE_URL = 'https://api.bobros.org';

// Flag to track if API call is in progress or already completed
let isApiCallInProgress = false;
let isApiCallCompleted = false;
let cachedResult = null;

/**
 * Helper function to make console logs more visible
 */
const logSection = (title, char = '=') => {
  console.log('\n' + char.repeat(80));
  console.log(title);
  console.log(char.repeat(80));
};

/**
 * Format JSON for better console display
 */
const formatJSON = (obj) => {
  return JSON.stringify(obj, null, 2);
};

/**
 * Extract PNR from raw response
 * Uses AirReservation LocatorCode as the PNR
 */
const extractPNR = (rawResponse) => {
  try {
    const pnr = rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']?.['air:AirReservation']?.$?.LocatorCode;
    console.log('✈️ Extracted PNR (AirReservation LocatorCode):', pnr);
    return pnr;
  } catch (error) {
    console.error('Error extracting PNR:', error);
    return null;
  }
};

/**
 * Extract Pricing Keys as an array from raw response
 * Uses AirPricingInfo Key(s) - can be single or multiple
 */
const extractPricingKeys = (rawResponse) => {
  try {
    // Get from AirPricingInfo Key
    const pricingInfo = rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']?.['air:AirReservation']?.['air:AirPricingInfo'];
    
    // Handle both single object and array
    let pricingKeys = [];
    
    if (Array.isArray(pricingInfo)) {
      // If it's an array, extract all keys
      pricingKeys = pricingInfo.map(info => info?.$?.Key).filter(key => key);
    } else if (pricingInfo && pricingInfo.$?.Key) {
      // If it's a single object, push as single item array
      pricingKeys = [pricingInfo.$.Key];
    }
    
    console.log('🔑 Extracted Pricing Keys (AirPricingInfo Keys):', pricingKeys);
    return pricingKeys;
  } catch (error) {
    console.error('Error extracting Pricing Keys:', error);
    return [];
  }
};

/**
 * Extract Trace ID from raw response
 */
const extractTraceId = (rawResponse) => {
  try {
    const traceId = rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.$?.TraceId;
    console.log('🔍 Extracted Trace ID:', traceId);
    return traceId;
  } catch (error) {
    console.error('Error extracting Trace ID:', error);
    return null;
  }
};

/**
 * Get PNR response from localStorage
 */
const getPnrResponseFromLocalStorage = () => {
  try {
    // Try to get from pnrContextData first (full extracted data)
    const contextData = localStorage.getItem('pnrContextData');
    if (contextData) {
      const parsed = JSON.parse(contextData);
      if (parsed.rawResponse) {
        console.log('📦 Found PNR response in pnrContextData from localStorage');
        return parsed.rawResponse;
      }
    }
    
    // Fallback to raw response only
    const rawResponse = localStorage.getItem('pnrRawResponse');
    if (rawResponse) {
      console.log('📦 Found PNR response in pnrRawResponse from localStorage');
      return JSON.parse(rawResponse);
    }
    
    console.log('❌ No PNR response found in localStorage');
    return null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

/**
 * Reset the API call state (useful for testing or retry scenarios)
 */
export const resetPaymentConfirmationState = () => {
  isApiCallInProgress = false;
  isApiCallCompleted = false;
  cachedResult = null;
  console.log('🔄 Payment confirmation state reset');
};

/**
 * Complete payment confirmation using localStorage data
 * FOP Type is hardcoded to 'Cash'
 * @returns {Promise<Object>} Confirmation result
 */
export const completePaymentConfirmation = async () => {
  // ==============================================
  // CHECK IF API CALL WAS ALREADY COMPLETED
  // ==============================================
  if (isApiCallCompleted && cachedResult) {
    console.log('✅ Payment confirmation already completed, returning cached result');
    return cachedResult;
  }
  
  // ==============================================
  // CHECK IF API CALL IS ALREADY IN PROGRESS
  // ==============================================
  if (isApiCallInProgress) {
    console.log('⏳ Payment confirmation already in progress, waiting...');
    
    // Wait for the in-progress call to complete
    let retries = 0;
    while (isApiCallInProgress && retries < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (cachedResult) {
      console.log('✅ Returning result from in-progress call');
      return cachedResult;
    }
  }
  
  const fopType = 'Cash'; // Hardcoded to Cash
  
  logSection('🔄 COMPLETE PAYMENT CONFIRMATION FROM LOCALSTORAGE');
  
  // Set flag to indicate API call is in progress
  isApiCallInProgress = true;
  
  try {
    // ==============================================
    // STEP 1: Get data from localStorage
    // ==============================================
    console.log('📦 Reading PNR response from localStorage...');
    const rawResponse = getPnrResponseFromLocalStorage();
    
    if (!rawResponse) {
      throw new Error('No PNR response found in localStorage. Please ensure booking was created successfully.');
    }
    
    console.log('✅ Retrieved rawResponse from localStorage');
    
    // ==============================================
    // STEP 2: Extract data from raw response
    // ==============================================
    const pnr = extractPNR(rawResponse);
    const pricingKeys = extractPricingKeys(rawResponse); // Now returns array
    const traceId = extractTraceId(rawResponse);
    
    logSection('📋 EXTRACTED DATA SUMMARY');
    console.log('✓ PNR:', pnr);
    console.log('✓ Pricing Keys (array):', pricingKeys);
    console.log('✓ Trace ID:', traceId);
    console.log('✓ FOP Type (hardcoded):', fopType);
    
    // ==============================================
    // STEP 3: Validate all required fields
    // ==============================================
    const missingFields = [];
    if (!pnr) missingFields.push('PNR');
    if (!pricingKeys || pricingKeys.length === 0) missingFields.push('Pricing Keys');
    if (!traceId) missingFields.push('Trace ID');
    
    if (missingFields.length > 0) {
      const errorMessage = `Missing required data: ${missingFields.join(', ')}`;
      console.error('❌ Validation failed:', errorMessage);
      throw new Error(errorMessage);
    }
    
    console.log('\n✅ All required data extracted successfully');
    
    // ==============================================
    // STEP 4: Build request body with pricingKeys as array
    // ==============================================
    const requestBody = {
      pnr: pnr,
      pricingKeys: pricingKeys,  // Now sending as array
      traceId: traceId,
      fop: {
        type: fopType  // Hardcoded to 'Cash'
      }
    };
    
    logSection('📤 API REQUEST DETAILS', '-');
    console.log('📍 Endpoint:', `${API_BASE_URL}/flights/ticketing/issue-ticket`);
    console.log('🔧 Method: POST');
    console.log('📦 Request Body:');
    console.log(formatJSON(requestBody));
    console.log('💡 Tip: To copy request body, run: copy(' + JSON.stringify(requestBody, null, 2) + ')');
    
    // ==============================================
    // STEP 5: Call the payment confirmation API
    // ==============================================
    const response = await fetch(`${API_BASE_URL}/flights/ticketing/issue-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    logSection('📥 API RESPONSE DETAILS', '-');
    console.log('📍 Status Code:', response.status);
    console.log('📍 Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response body:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    
    logSection('✅ PAYMENT CONFIRMATION RESPONSE');
    console.log('📦 Response Data:');
    console.log(formatJSON(data));
    console.log('\n💡 To copy response, run: copy(' + JSON.stringify(data, null, 2) + ')');
    
    // ==============================================
    // STEP 6: Store confirmation result
    // ==============================================
    const confirmationResult = {
      success: true,
      data: data,
      extractedData: { pnr, pricingKeys, traceId, fopType },
      timestamp: new Date().toISOString()
    };
    
    // Store in localStorage for backup
    localStorage.setItem('paymentConfirmationResult', JSON.stringify(confirmationResult));
    
    // Cache the result and mark as completed
    cachedResult = confirmationResult;
    isApiCallCompleted = true;
    
    logSection('🎉 PAYMENT CONFIRMATION COMPLETED');
    console.log('Status: Success ✅');
    console.log('PNR Used:', pnr);
    console.log('Pricing Keys Used (array):', pricingKeys);
    console.log('Trace ID Used:', traceId);
    console.log('FOP Type Used (hardcoded):', fopType);
    
    return confirmationResult;
    
  } catch (error) {
    logSection('❌ PAYMENT CONFIRMATION ERROR');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    const errorResult = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    return errorResult;
    
  } finally {
    // Reset the in-progress flag
    isApiCallInProgress = false;
  }
};

/**
 * Helper function to check if PNR data exists in localStorage
 */
export const hasPnrDataInStorage = () => {
  const hasContextData = !!localStorage.getItem('pnrContextData');
  const hasRawResponse = !!localStorage.getItem('pnrRawResponse');
  console.log('Storage check - pnrContextData:', hasContextData, 'pnrRawResponse:', hasRawResponse);
  return hasContextData || hasRawResponse;
};

/**
 * Helper function to get extracted data from localStorage without calling API
 */
export const getExtractedDataFromStorage = () => {
  const rawResponse = getPnrResponseFromLocalStorage();
  if (!rawResponse) {
    return { error: 'No data found in localStorage' };
  }
  
  return {
    pnr: extractPNR(rawResponse),
    pricingKeys: extractPricingKeys(rawResponse), // Now returns array
    traceId: extractTraceId(rawResponse),
    hasData: true
  };
};

/**
 * Check if payment confirmation has already been completed
 */
export const isPaymentConfirmed = () => {
  return isApiCallCompleted;
};

/**
 * Get cached payment confirmation result
 */
export const getCachedPaymentResult = () => {
  return cachedResult;
};

export default {
  completePaymentConfirmation,
  hasPnrDataInStorage,
  getExtractedDataFromStorage,
  resetPaymentConfirmationState,
  isPaymentConfirmed,
  getCachedPaymentResult
};