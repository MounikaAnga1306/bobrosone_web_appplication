// src/modules/flights/services/paymentConfirmationService.js
//
// Called AFTER BillDesk redirects back to the app.
// Since Zustand store is wiped on redirect, PNR data is read from localStorage.
//
// localStorage key written by PassengerDetailsReviewPage after PNR success:
//   'bobros_pnr_raw'  → full raw PNR API response (rawPnrResponse from usePnrStore)
//
// Flow:
//   BillDesk redirect → TicketConfirmationScreen mounts
//   → completePaymentConfirmation()
//   → reads localStorage('bobros_pnr_raw')
//   → extracts pnr, pricingKeys, traceId
//   → POST /flights/ticketing/issue-ticket
//   → ticket issued ✅

const API_BASE_URL = 'https://api.bobros.org/';

// Guard against duplicate calls (React StrictMode / double-mount)
let isApiCallInProgress = false;
let isApiCallCompleted  = false;
let cachedResult        = null;

// ── localStorage key ─────────────────────────────────────────────
// PassengerDetailsReviewPage writes this after callPnrAPI() succeeds.
// Shape stored: the full raw PNR API response object
//   { success, traceId, pnrLocatorCode, bookingId, rawResponse: { SOAP:Envelope... } }
const PNR_STORAGE_KEY = 'bobros_pnr_raw';

// ── Helpers ──────────────────────────────────────────────────────
const log = (title, char = '=') => {
  console.log('\n' + char.repeat(60));
  console.log(title);
  console.log(char.repeat(60));
};

// ── Data extractors ───────────────────────────────────────────────
// All paths verified against the actual PNR response shape.

/**
 * Extracts the universal record locator (PNR booking ref).
 *
 * Path: rawResponse.rawResponse
 *   .SOAP:Envelope.SOAP:Body
 *   .universal:AirCreateReservationRsp
 *   .universal:UniversalRecord
 *   .LocatorCode
 *
 * Example: "35OV7G"
 */
const extractPNR = (raw) => {
  try {
    const pnr = raw
      ?.rawResponse
      ?.['SOAP:Envelope']
      ?.['SOAP:Body']
      ?.['universal:AirCreateReservationRsp']
      ?.['universal:UniversalRecord']
      ?.LocatorCode;
    console.log('✈️  Extracted PNR:', pnr);
    return pnr ?? null;
  } catch (err) {
    console.error('extractPNR error:', err);
    return null;
  }
};

/**
 * Extracts AirPricingInfo Key(s) as an array.
 *
 * Path: ...universal:UniversalRecord
 *   .air:AirReservation
 *   .air:AirPricingInfo  (can be single object or array)
 *   .$?.Key
 *
 * Example: ["cfnJB5TqWDKAD3RnBAAAAA=="]
 */
const extractPricingKeys = (raw) => {
  try {
    const pricingInfo = raw
      ?.rawResponse
      ?.['SOAP:Envelope']
      ?.['SOAP:Body']
      ?.['universal:AirCreateReservationRsp']
      ?.['universal:UniversalRecord']
      ?.['air:AirReservation']
      ?.['air:AirPricingInfo'];

    let keys = [];
    if (Array.isArray(pricingInfo)) {
      keys = pricingInfo.map(p => p?.$.Key ?? p?.Key).filter(Boolean);
    } else if (pricingInfo) {
      const key = pricingInfo?.$.Key ?? pricingInfo?.Key;
      if (key) keys = [key];
    }
    console.log('🔑 Extracted PricingKeys:', keys);
    return keys;
  } catch (err) {
    console.error('extractPricingKeys error:', err);
    return [];
  }
};

/**
 * Extracts TraceId from the AirCreateReservationRsp attributes.
 *
 * Path: ...universal:AirCreateReservationRsp.TraceId
 *   OR  raw.traceId  (top-level field set by our API wrapper)
 *
 * Example: "BOBROS-1779298183795"
 */
const extractTraceId = (raw) => {
  try {
    // Primary: from SOAP response attributes
    const fromSoap = raw
      ?.rawResponse
      ?.['SOAP:Envelope']
      ?.['SOAP:Body']
      ?.['universal:AirCreateReservationRsp']
      ?.TraceId;

    // Fallback: top-level traceId our API wrapper returns
    const traceId = fromSoap ?? raw?.traceId ?? null;
    console.log('🔍 Extracted TraceId:', traceId);
 * Extract Trace ID from PNR response (SOAP traceId)
 */
const extractTraceIdFromPnrResponse = (rawResponse) => {
  try {
    const traceId = rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.$?.TraceId;
    console.log('🔍 Extracted Trace ID from PNR response:', traceId);
    return traceId;
  } catch (err) {
    console.error('extractTraceId error:', err);
    return null;
  }
};

// ── localStorage read/write ───────────────────────────────────────

/**
 * Reads the raw PNR response from localStorage.
 * Written by PassengerDetailsReviewPage after PNR API succeeds.
 */
const readPnrFromStorage = () => {
  try {
    const stored = localStorage.getItem(PNR_STORAGE_KEY);
    if (!stored) {
      console.log('❌ No PNR data in localStorage (key: bobros_pnr_raw)');
      return null;
    }
    const parsed = JSON.parse(stored);
    console.log('📦 PNR data read from localStorage');
    return parsed;
  } catch (err) {
    console.error('readPnrFromStorage error:', err);
    return null;
  }
};

/**
 * Writes the raw PNR API response to localStorage.
 * Called by PassengerDetailsReviewPage immediately after callPnrAPI() succeeds.
 *
 * @param {object} rawPnrResponse — the full response from callPnrAPI()
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
export const savePnrToStorage = (rawPnrResponse) => {
  try {
    localStorage.setItem(PNR_STORAGE_KEY, JSON.stringify(rawPnrResponse));
    console.log('💾 PNR response saved to localStorage (key: bobros_pnr_raw)');
  } catch (err) {
    console.error('savePnrToStorage error:', err);
  }
};

/**
 * Clears PNR data from localStorage.
 * Call after ticket issuance completes.
 */
export const clearPnrFromStorage = () => {
  localStorage.removeItem(PNR_STORAGE_KEY);
  localStorage.removeItem('paymentConfirmationResult');
  console.log('🗑️  PNR data cleared from localStorage');
};

// ── Main export ───────────────────────────────────────────────────

/**
 * Issues the airline ticket after BillDesk payment completes.
 *
 * Called by TicketConfirmationScreen on mount.
 * Reads PNR data from localStorage (written before BillDesk redirect).
 *
 * @returns {{ success, data, extractedData, timestamp } | { success: false, error }}
 * Complete payment confirmation using BillDesk transaction data
 * Calls /flights/verify/ endpoint with billdesk_order_id
 * @returns {Promise<Object>} Confirmation result
 */
export const completePaymentConfirmation = async () => {
  // Return cached result if already done
  if (isApiCallCompleted && cachedResult) {
    console.log('✅ Already confirmed — returning cached result');
    return cachedResult;
  }

  // Wait if another call is in progress (StrictMode double-invoke)
  if (isApiCallInProgress) {
    console.log('⏳ Confirmation already in progress, waiting...');
    let retries = 0;
    while (isApiCallInProgress && retries < 30) {
      await new Promise(r => setTimeout(r, 100));
      retries++;
    }
    if (cachedResult) return cachedResult;
  }

  
  logSection('🔄 COMPLETE PAYMENT CONFIRMATION - BILLDESK FLOW');
  
  // Set flag to indicate API call is in progress
  isApiCallInProgress = true;
  log('🔄 COMPLETE PAYMENT CONFIRMATION');

  try {
    // ── Step 1: Read PNR data from localStorage ─────────────────
    const raw = readPnrFromStorage();
    if (!raw) {
      throw new Error('PNR data not found in localStorage. Was savePnrToStorage() called before BillDesk redirect?');
    }

    // ── Step 2: Extract required fields ─────────────────────────
    const pnr         = extractPNR(raw);
    const pricingKeys = extractPricingKeys(raw);
    const traceId     = extractTraceId(raw);

    log('📋 EXTRACTED DATA', '-');
    console.log('PNR:          ', pnr);
    console.log('PricingKeys:  ', pricingKeys);
    console.log('TraceId:      ', traceId);

    // ── Step 3: Validate ─────────────────────────────────────────
    const missing = [];
    if (!pnr)                          missing.push('PNR');
    if (!pricingKeys?.length)          missing.push('PricingKeys');
    if (!traceId)                      missing.push('TraceId');
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    // ── Step 4: Build request ────────────────────────────────────
    const requestBody = {
      pnr,
      pricingKeys,   // array: ["cfnJB5TqWDKAD3RnBAAAAA=="]
      traceId,
      fop: { type: 'Cash' },  // hardcoded
    };

    log('📤 TICKETING REQUEST', '-');
    console.log(JSON.stringify(requestBody, null, 2));

    // ── Step 5: Call ticketing API ───────────────────────────────
    const response = await fetch(`${API_BASE_URL}/flights/ticketing/issue-ticket`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(requestBody),
    });

    const text = await response.text();
    log('📥 TICKETING RESPONSE', '-');
    console.log('Status:', response.status);
    console.log(text);

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`);

    const data = JSON.parse(text);

    // ── Step 6: Cache + return ───────────────────────────────────
    cachedResult = {
      success:       true,
      data,
      extractedData: { pnr, pricingKeys, traceId, fopType: 'Cash' },
      timestamp:     new Date().toISOString(),
    
    const transactionData = getTransactionDataFromStorage();
    
    if (!transactionData) {
      throw new Error('No transaction data found in localStorage. Please ensure payment was initiated.');
    }
    
    if (!transactionData.transaction_id) {
      throw new Error('No transaction_id found in transaction data. Please ensure payment was initiated correctly.');
    }
    
    const billdeskOrderId = transactionData.transaction_id;
    console.log('✅ Retrieved BillDesk Order ID (transaction_id):', billdeskOrderId);
    
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

    localStorage.setItem('paymentConfirmationResult', JSON.stringify(cachedResult));
    isApiCallCompleted = true;

    log('🎉 TICKET ISSUED SUCCESSFULLY');
    console.log('PNR:', pnr);
    console.log('PricingKeys:', pricingKeys);

    return cachedResult;

  } catch (err) {
    log('❌ TICKET ISSUANCE ERROR');
    console.error(err.message);
    return { success: false, error: err.message, timestamp: new Date().toISOString() };
    
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
    isApiCallInProgress = false;
  }
};

// ── Utility exports ───────────────────────────────────────────────

export const resetPaymentConfirmationState = () => {
  isApiCallInProgress = false;
  isApiCallCompleted  = false;
  cachedResult        = null;
  console.log('🔄 Payment confirmation state reset');
};

export const isPaymentConfirmed  = () => isApiCallCompleted;
export const getCachedPaymentResult = () => cachedResult;

/**
 * Check if PNR data exists in localStorage (for debugging).
 */
export const hasPnrDataInStorage = () => !!localStorage.getItem(PNR_STORAGE_KEY);

/**
 * Preview extracted data without calling the API (for debugging).
 */
export const getExtractedDataFromStorage = () => {
  const raw = readPnrFromStorage();
  if (!raw) return { error: 'No data in localStorage' };
  return {
    pnr:         extractPNR(raw),
    pricingKeys: extractPricingKeys(raw),
    traceId:     extractTraceId(raw),
    hasData:     true,
  };
};

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
  savePnrToStorage,
  clearPnrFromStorage,
  hasPnrDataInStorage,
  hasTransactionDataInStorage,
  getExtractedDataFromStorage,
  resetPaymentConfirmationState,
  isPaymentConfirmed,
  getCachedPaymentResult,
  getTransactionData,
  clearPaymentData
};