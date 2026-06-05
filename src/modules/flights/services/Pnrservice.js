// src/modules/flights/services/pnrService.js

const PNR_API_URL = 'https://api.bobros.org/flights/create-reservation/air-booking-updated';

// ─── localStorage key ────────────────────────────────────────────────────────
const PNR_TRACE_KEY = 'flight_pnr_traceId';

export const savePnrTraceId = (traceId) => {
  if (!traceId) return;
  localStorage.setItem(PNR_TRACE_KEY, traceId);
  console.log('💾 [pnrService] traceId saved to localStorage:', traceId);
};

export const getSavedPnrTraceId = () => {
  const traceId = localStorage.getItem(PNR_TRACE_KEY);
  console.log('📖 [pnrService] traceId read from localStorage:', traceId);
  return traceId;
};

export const clearPnrTraceId = () => {
  localStorage.removeItem(PNR_TRACE_KEY);
  console.log('🗑️ [pnrService] traceId cleared from localStorage');
};

// ── 1. API Call ───────────────────────────────────────────────────────────────

export const callPnrAPI = async (requestBody) => {
  try {
    console.log('🚀 [pnrService] callPnrAPI — URL:', PNR_API_URL);
    console.log('🚀 [pnrService] Request Body:\n', JSON.stringify(requestBody, null, 2));

    const response = await fetch(PNR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    console.log('🚀 [pnrService] Response Status:', response.status, response.statusText);

    const responseClone = response.clone();
    const responseBody  = await responseClone.text();
    console.log('🚀 [pnrService] Raw Response Body:\n', responseBody);

    if (!response.ok) {
      throw new Error(`PNR API error ${response.status}: ${responseBody}`);
    }

    const data = JSON.parse(responseBody);

    // ✅ Save traceId to localStorage after successful PNR
    if (data?.traceId) {
      savePnrTraceId(data.traceId);
    } else {
      console.warn('⚠️ [pnrService] No traceId found in PNR response');
    }

    return data;
  } catch (err) {
    console.error('❌ [pnrService] callPnrAPI failed:', err);
    return { success: false, error: err.message };
  }
};

// ── 2. Request Body Builder ───────────────────────────────────────────────────

export const buildPnrRequestBody = ({
  traceId,
  selectedFareIndex,
  passengers,
  passengerKeys,
  rawPricingData,
  contactInfo,
  gstData,
  uid = 'user_123',
}) => {

  // CHD is used instead of CNN for child passengers throughout
  const PAX_ORDER = { ADT: 0, CHD: 1, INF: 2 };
  const sortedPassengers = [...passengers].sort((a, b) => {
    const typeA = (a.type ?? a.code ?? '').toUpperCase();
    const typeB = (b.type ?? b.code ?? '').toUpperCase();
    return (PAX_ORDER[typeA] ?? 99) - (PAX_ORDER[typeB] ?? 99);
  });

  const paxList = sortedPassengers.map((pax) => {
    const rawType = (pax.type ?? pax.code ?? '').toUpperCase();
    // Normalise: treat CNN as CHD so any legacy values are sent correctly
    const type = rawType === 'CNN' ? 'CHD' : rawType;

    const entry = {
      type,
      firstName: pax.firstName,
      lastName:  pax.lastName,
      dob:       pax.dob,
      gender:    pax.gender,
    };

    if (type === 'ADT') {
      entry.nationality = pax.nationality ?? 'IN';
    } else {
      // CHD and INF both get age
      entry.age = pax.age ?? _calculateAge(pax.dob);
    }

    return entry;
  });

  const body = {
    traceId,
    uid,
    selectedFareIndex,
    passengers:      paxList,
    passengerKeys:   passengerKeys ?? [],
    pricingResponse: rawPricingData,
    contactInfo: {
      email: contactInfo.email,
      phone: {
        countryCode: contactInfo.phone?.countryCode ?? '91',
        number:      contactInfo.phone?.number      ?? '',
      },
      address: contactInfo.address ?? {
        street: '', city: '', state: '', postalCode: '', countryCode: 'IN',
      },
    },
  };

  if (gstData?.gstn) {
    body.gstData = {
      gstn: gstData.gstn,
      gsta: gstData.gsta ?? '',
      gstp: gstData.gstp ?? '',
      gste: gstData.gste ?? '',
    };
  }

  return body;
};

// ── 3. Response Transformer ───────────────────────────────────────────────────

export function transformPnrResponse(raw) {
  if (!raw?.success) return null;

  try {
    const envelope   = raw.rawResponse?.['SOAP:Envelope'];
    const body       = envelope?.['SOAP:Body'];
    const rsp        = body?.['universal:AirCreateReservationRsp'];
    const ur         = rsp?.['universal:UniversalRecord'];
    const airRes     = ur?.['air:AirReservation'];
    const provInfo   = ur?.['universal:ProviderReservationInfo'];

    if (!ur || !airRes) return null;

    // ── Locators ──────────────────────────────────────────────────
    const universalLocatorCode = ur?.$?.LocatorCode       ?? null;
    const providerLocatorCode  = provInfo?.$?.LocatorCode ?? null;
    const airlineLocatorCode   = airRes?.$?.LocatorCode   ?? null;

    // ── Booking ID & Status ───────────────────────────────────────
    const bookingId = raw.bookingId ?? null;
    const status    = ur?.$?.Status ?? 'Unknown';

    // ── Travelers ─────────────────────────────────────────────────
    const travelerRaw = ur?.['common_v54_0:BookingTraveler'];
    const travelerArr = Array.isArray(travelerRaw) ? travelerRaw : (travelerRaw ? [travelerRaw] : []);

    const travelers = travelerArr.map((t) => {
      const nameNode  = t?.['common_v54_0:BookingTravelerName'];
      const rawType   = t?.$?.TravelerType ?? 'ADT';
      // Normalise CNN → CHD in the response as well for consistency
      const travType  = rawType === 'CNN' ? 'CHD' : rawType;
      return {
        key:       t?.$?.Key ?? '',
        type:      travType,
        dob:       t?.$?.DOB ?? null,
        gender:    t?.$?.Gender ?? null,
        firstName: nameNode?.$?.First  ?? '',
        lastName:  nameNode?.$?.Last   ?? '',
        prefix:    nameNode?.$?.Prefix ?? '',
      };
    });

    // ── Segments ──────────────────────────────────────────────────
    const segRaw = airRes?.['air:AirSegment'];
    const segArr = Array.isArray(segRaw) ? segRaw : (segRaw ? [segRaw] : []);

    const segments = segArr.map((s) => ({
      key:            s?.$?.Key           ?? '',
      carrier:        s?.$?.Carrier       ?? '',
      flightNumber:   s?.$?.FlightNumber  ?? '',
      origin:         s?.$?.Origin        ?? '',
      destination:    s?.$?.Destination   ?? '',
      departureTime:  s?.$?.DepartureTime ?? null,
      arrivalTime:    s?.$?.ArrivalTime   ?? null,
      flightTime:     s?.$?.TravelTime    ? parseInt(s.$.TravelTime) : null,
      cabinClass:     s?.$?.CabinClass    ?? '',
      classOfService: s?.$?.ClassOfService ?? '',
      equipment:      s?.$?.Equipment     ?? '',
      status:         s?.$?.Status        ?? '',
      distance:       s?.$?.Distance      ? parseInt(s.$.Distance) : null,
    }));

    // ── Warnings ──────────────────────────────────────────────────
    const warnRaw = rsp?.['common_v54_0:ResponseMessage'];
    const warnArr = Array.isArray(warnRaw) ? warnRaw : (warnRaw ? [warnRaw] : []);
    const warnings = warnArr
      .filter((w) => w?.$?.Type === 'Warning')
      .map((w) => ({ code: w?.$?.Code, message: w?._ ?? '' }));

    return {
      universalLocatorCode,
      providerLocatorCode,
      airlineLocatorCode,
      bookingId,
      status,
      travelers,
      segments,
      warnings,
    };

  } catch (err) {
    console.error('transformPnrResponse failed:', err);
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const _dig = (obj, keys) => keys.reduce((o, k) => o?.[k], obj);

const _arr = (val) => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

const _calculateAge = (dob) => {
  if (!dob) return 0;
  const today     = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};