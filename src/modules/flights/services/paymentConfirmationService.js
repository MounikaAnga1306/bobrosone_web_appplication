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
 * Extract Trace ID from PNR response (SOAP traceId)
 */
const extractTraceIdFromPnrResponse = (rawResponse) => {
  try {
    const traceId = rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.$?.TraceId;
    console.log('🔍 Extracted Trace ID from PNR response:', traceId);
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
 * Get transaction data from localStorage (stored during payment initiation)
 */
const getTransactionDataFromStorage = () => {
  try {
    const transactionData = localStorage.getItem('currentTransaction');
    if (transactionData) {
      const parsed = JSON.parse(transactionData);
      console.log('💰 Retrieved transaction data from localStorage:', parsed);
      return parsed;
    }
    console.log('❌ No transaction data found in localStorage');
    return null;
  } catch (error) {
    console.error('Error reading transaction data from localStorage:', error);
    return null;
  }
};

/**
 * Get traceId from PNR response in localStorage (SOAP traceId)
 */
const getTraceIdFromPnrResponse = () => {
  try {
    const rawResponse = getPnrResponseFromLocalStorage();
    if (rawResponse) {
      const traceId = extractTraceIdFromPnrResponse(rawResponse);
      console.log('🔍 Retrieved traceId from PNR response:', traceId);
      return traceId;
    }
    return null;
  } catch (error) {
    console.error('Error extracting traceId from PNR response:', error);
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
 * Complete payment confirmation using BillDesk transaction data
 * Calls /flights/verify/ endpoint with billdesk_order_id
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
  
  logSection('🔄 COMPLETE PAYMENT CONFIRMATION - BILLDESK FLOW');
  
  // Set flag to indicate API call is in progress
  isApiCallInProgress = true;
  
  try {
    // ==============================================
    // STEP 1: Get transaction data from localStorage
    // ==============================================
    const transactionData = getTransactionDataFromStorage();
    
    if (!transactionData) {
      throw new Error('No transaction data found in localStorage. Please ensure payment was initiated.');
    }
    
    if (!transactionData.transaction_id) {
      throw new Error('No transaction_id found in transaction data. Please ensure payment was initiated correctly.');
    }
    
    const billdeskOrderId = transactionData.transaction_id;
    console.log('✅ Retrieved BillDesk Order ID (transaction_id):', billdeskOrderId);
    
    // ==============================================
    // STEP 2: Get traceId from PNR response (SOAP traceId)
    // ==============================================
    const traceId = getTraceIdFromPnrResponse();
    
    if (!traceId) {
      throw new Error('No traceId found in PNR response. Please ensure booking was created successfully.');
    }
    
    console.log('✅ Retrieved traceId from PNR response:', traceId);
    
    // ==============================================
    // STEP 3: Hardcoded values
    // ==============================================
    const source = "web";        // Hardcoded
    const gateway = "billdesk";  // Hardcoded
    
    logSection('📋 EXTRACTED DATA SUMMARY');
    console.log('✓ Source (hardcoded):', source);
    console.log('✓ Gateway (hardcoded):', gateway);
    console.log('✓ Trace ID (from PNR response):', traceId);
    console.log('✓ BillDesk Order ID (transaction_id):', billdeskOrderId);
    
    // ==============================================
    // STEP 4: Build request body
    // ==============================================
    const requestBody = {
      source: source,
      gateway: gateway,
      traceId: traceId,
      billdesk_order_id: billdeskOrderId
    };
    
    logSection('📤 API REQUEST DETAILS', '-');
    console.log('📍 Endpoint:', `${API_BASE_URL}/flights/verify/`);
    console.log('🔧 Method: POST');
    console.log('📦 Request Body:');
    console.log(formatJSON(requestBody));
    console.log('💡 Tip: To copy request body, run: copy(' + JSON.stringify(requestBody, null, 2) + ')');
    
    // ==============================================
    // STEP 5: Call the payment verification API
    // ==============================================
    const response = await fetch(`${API_BASE_URL}/flights/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    logSection('📥 API RESPONSE DETAILS', '-');
    console.log('📍 Status Code:', response.status);
    console.log('📍 Status Text:', response.statusText);
    
    // Handle error responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: await response.text() };
      }
      
      console.error('❌ Error response:', errorData);
      
      // Check for duplicate request error
      if (response.status === 409 || errorData?.error?.error_code === 'GNDRE0001') {
        throw {
          message: errorData.message || 'Duplicate request detected. Please check your booking status.',
          status: response.status,
          error_type: 'duplicate_request_error',
          error_code: 'GNDRE0001',
          details: errorData
        };
      }
      
      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        error_type: errorData.error?.error_type || 'api_error',
        error_code: errorData.error?.error_code || 'UNKNOWN',
        details: errorData
      };
    }
    
    const data = await response.json();
    
    logSection('✅ PAYMENT VERIFICATION RESPONSE');
    console.log('📦 Response Data:');
    console.log(formatJSON(data));
    console.log('\n💡 To copy response, run: copy(' + JSON.stringify(data, null, 2) + ')');
    
    // ==============================================
    // STEP 6: Store confirmation result
    // ==============================================
    const confirmationResult = {
      success: true,
      data: data,
      requestData: {
        source: source,
        gateway: gateway,
        traceId: traceId,
        billdesk_order_id: billdeskOrderId
      },
      transactionData: {
        transaction_id: transactionData.transaction_id,
        bdorderid: transactionData.bdorderid,
        pnr_number: transactionData.pnr_number,
        amount: transactionData.amount
      },
      timestamp: new Date().toISOString()
    };
    
    // Store in localStorage for backup
    localStorage.setItem('paymentConfirmationResult', JSON.stringify(confirmationResult));
    
    // Cache the result and mark as completed
    cachedResult = confirmationResult;
    isApiCallCompleted = true;
    
    logSection('🎉 PAYMENT VERIFICATION COMPLETED');
    console.log('Status: Success ✅');
    console.log('BillDesk Order ID Used:', billdeskOrderId);
    console.log('Trace ID Used:', traceId);
    console.log('Source:', source);
    console.log('Gateway:', gateway);
    
    return confirmationResult;
    
  } catch (error) {
    logSection('❌ PAYMENT VERIFICATION ERROR');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    // Format error response consistently
    const errorResult = {
      success: false,
      message: error.message || 'Payment verification failed',
      error: {
        status: error.status || 500,
        error_type: error.error_type || 'unknown_error',
        error_code: error.error_code || 'ERR_001',
        message: error.message || 'An unexpected error occurred'
      },
      timestamp: new Date().toISOString()
    };
    
    // If there are additional details, include them
    if (error.details) {
      errorResult.error.details = error.details;
    }
    
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
 * Helper function to check if transaction data exists in localStorage
 */
export const hasTransactionDataInStorage = () => {
  const hasTransaction = !!localStorage.getItem('currentTransaction');
  console.log('Storage check - currentTransaction:', hasTransaction);
  return hasTransaction;
};

/**
 * Helper function to get extracted data from localStorage without calling API
 */
export const getExtractedDataFromStorage = () => {
  const transactionData = getTransactionDataFromStorage();
  const rawResponse = getPnrResponseFromLocalStorage();
  
  if (!transactionData && !rawResponse) {
    return { error: 'No data found in localStorage' };
  }
  
  const traceId = rawResponse ? extractTraceIdFromPnrResponse(rawResponse) : null;
  
  return {
    transaction_id: transactionData?.transaction_id || null,
    bdorderid: transactionData?.bdorderid || null,
    billdesk_order_id: transactionData?.transaction_id || null,
    traceId: traceId,
    pnr_number: transactionData?.pnr_number || null,
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

/**
 * Get transaction data from localStorage
 */
export const getTransactionData = () => {
  return getTransactionDataFromStorage();
};

/**
 * Clear all payment related data from localStorage
 */
export const clearPaymentData = () => {
  try {
    localStorage.removeItem('currentTransaction');
    localStorage.removeItem('paymentConfirmationResult');
    localStorage.removeItem('paymentInitiated');
    localStorage.removeItem('bdorderid');
    localStorage.removeItem('transactionId');
    console.log('🧹 Cleared all payment related data from localStorage');
  } catch (error) {
    console.error('Error clearing payment data:', error);
  }
};

export default {
  completePaymentConfirmation,
  hasPnrDataInStorage,
  hasTransactionDataInStorage,
  getExtractedDataFromStorage,
  resetPaymentConfirmationState,
  isPaymentConfirmed,
  getCachedPaymentResult,
  getTransactionData,
  clearPaymentData
};