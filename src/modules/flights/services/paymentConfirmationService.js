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

export default {
  completePaymentConfirmation,
  savePnrToStorage,
  clearPnrFromStorage,
  hasPnrDataInStorage,
  getExtractedDataFromStorage,
  resetPaymentConfirmationState,
  isPaymentConfirmed,
  getCachedPaymentResult,
};